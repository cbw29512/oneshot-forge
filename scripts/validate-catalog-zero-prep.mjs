#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    errors.push("missing " + rel);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

const sandbox = { window: {} };
vm.runInNewContext(read("adventure-registry.js"), sandbox, { filename: "adventure-registry.js" });
const registry = sandbox.window.ONE_SHOT_ADVENTURES || {};
const products = JSON.parse(read("data/products.json"));

for (const product of products.products || []) {
  const rel = registry[product.id];
  if (!rel) continue;
  let adventure;
  try {
    adventure = JSON.parse(read(rel));
  } catch (error) {
    errors.push(`${product.id}: package JSON unreadable: ${error.message}`);
    continue;
  }

  for (const scene of adventure.scenes || []) {
    if (!Array.isArray(scene.runSteps) || scene.runSteps.length < 3) {
      errors.push(`${product.id}/${scene.id}: needs at least 3 ordered runSteps`);
    }
    if (!String(scene.advanceWhen || "").trim()) {
      errors.push(`${product.id}/${scene.id}: missing advanceWhen`);
    }
    if (String(scene.readAloud || "").trim().length < 180) {
      errors.push(`${product.id}/${scene.id}: readAloud is too thin for table use`);
    }
  }

  for (const npc of adventure.npcs || []) {
    if (String(npc.description || "").trim().length < 80) {
      errors.push(`${product.id}/${npc.id}: NPC description is too thin`);
    }
    if (!Array.isArray(npc.tableDialogue) || npc.tableDialogue.length < 3) {
      errors.push(`${product.id}/${npc.id}: needs 3 tableDialogue lines`);
    }
    for (const reaction of ["agreement", "refusal", "accusation", "danger"]) {
      if (!String(npc.reactions?.[reaction] || "").trim()) {
        errors.push(`${product.id}/${npc.id}: missing ${reaction} reaction`);
      }
    }
  }

  for (const encounter of adventure.encounters || []) {
    if (!String(encounter.objective || "").trim()) {
      errors.push(`${product.id}/${encounter.id}: missing encounter objective`);
    }
    if (!String(encounter.resolution || "").trim()) {
      errors.push(`${product.id}/${encounter.id}: missing encounter resolution`);
    }
  }

  if (!Array.isArray(adventure.pacing?.cutOrder) || adventure.pacing.cutOrder.length < 2) {
    errors.push(`${product.id}: needs at least 2 actionable pacing cuts`);
  }
}

if (errors.length) {
  console.error("Catalog zero-prep baseline failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log("Catalog zero-prep baseline OK: every live adventure has runnable scenes, NPC voice, encounter jobs, and pacing cuts.");

// Production pass 1: the SRD content gate runs as part of this CI step until it gets its own
// workflow line (pushing workflow edits needs a token with `workflow` scope).
await import("./validate-srd-content.mjs");
