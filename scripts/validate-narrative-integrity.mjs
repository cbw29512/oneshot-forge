#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
const errors = [];

function fail(message) {
  errors.push(message);
}

function textBlob(value) {
  return JSON.stringify(value ?? "").toLowerCase();
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

try {
  if (!file) throw new Error("usage: node scripts/validate-narrative-integrity.mjs <adventure.json>");
  const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
  const scenes = adventure.scenes || [];
  const npcs = adventure.npcs || [];
  const clues = adventure.clues || [];

  for (const scene of scenes) {
    const label = scene.id || "scene";
    const blob = textBlob([scene.purpose, scene.gmNotes, scene.runSteps, scene.advanceWhen]);

    if (!scene.purpose?.trim()) fail(`${label} missing narrative purpose`);
    if (!scene.advanceWhen?.trim()) fail(`${label} missing explicit move-on condition`);
    if (!Array.isArray(scene.runSteps) || scene.runSteps.length < 2) {
      fail(`${label} needs ordered runSteps`);
    }

    const containsCheck = /\bdc\s*\d+\b/i.test(JSON.stringify(scene));
    if (containsCheck) {
      const outcomeWords = [
        "success", "failure", "fail", "cost", "damage", "condition", "reveal",
        "learn", "advantage", "disadvantage", "move", "reduce", "increase",
        "open", "close", "escape", "trust", "hostile", "reward", "penalty"
      ];
      if (!hasAny(blob, outcomeWords)) {
        fail(`${label} calls for a check but does not describe a meaningful outcome`);
      }
    }

    if (/nothing happens|no effect/i.test(JSON.stringify(scene))) {
      fail(`${label} contains a dead-end failure outcome`);
    }
  }

  for (const npc of npcs) {
    const label = npc.id || npc.name || "npc";
    if (!npc.questFunction?.trim()) fail(`${label} missing questFunction`);
    if (!Array.isArray(npc.knows)) fail(`${label} missing knows[]`);
    if (!Array.isArray(npc.cannotKnow)) fail(`${label} missing cannotKnow[]`);
    if (!Array.isArray(npc.tableDialogue) || npc.tableDialogue.length < 2) {
      fail(`${label} needs table-usable dialogue`);
    }
    for (const reaction of ["agreement", "refusal", "accusation", "danger"]) {
      if (!npc.reactions?.[reaction]?.trim()) fail(`${label} missing ${reaction} reaction`);
    }
  }

  for (const clue of clues) {
    if (!clue.required) continue;
    if (!Array.isArray(clue.sources) || clue.sources.length < 3) {
      fail(`${clue.id} required clue needs three independent delivery routes`);
    }
  }

  if (!Array.isArray(adventure.endings) || adventure.endings.length < 2) {
    fail("adventure needs at least two legal endings");
  }

  if (errors.length) {
    console.error(`Narrative integrity failed: ${adventure.metadata?.title || file}`);
    errors.forEach(error => console.error(" -", error));
    process.exit(1);
  }

  console.log(`Narrative integrity OK: ${adventure.metadata?.title || file} — ${scenes.length} scenes, ${npcs.length} NPCs.`);
} catch (error) {
  console.error(`NARRATIVE-INTEGRITY ERROR: ${error.message}`);
  process.exit(1);
}
