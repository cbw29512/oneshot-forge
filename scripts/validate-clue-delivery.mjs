#!/usr/bin/env node
import fs from "node:fs";

function fail(message) {
  console.error(`CLUE-DELIVERY: ${message}`);
  process.exitCode = 1;
}

try {
  const file = process.argv[2];
  if (!file) throw new Error("usage: node scripts/validate-clue-delivery.mjs <adventure.json>");

  const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
  const scenes = adventure.scenes || [];
  const sceneClues = new Map();

  for (const scene of scenes) {
    for (const clueId of scene.clueIds || []) {
      if (!sceneClues.has(clueId)) sceneClues.set(clueId, []);
      sceneClues.get(clueId).push(scene.id);
    }
  }

  for (const clue of adventure.clues || []) {
    const label = `${clue.id} (${clue.revelation || "no revelation"})`;
    const sources = clue.sources || [];

    if (!clue.revelation?.trim()) fail(`${clue.id} has no explicit revelation.`);
    if (!sources.length) fail(`${label} has no authored delivery source.`);
    if (clue.required && sources.length < 2) fail(`${label} is required but has fewer than two delivery sources.`);
    if (!sceneClues.has(clue.id)) fail(`${label} is never surfaced by a stage card.`);

    const normalized = sources.map(source => String(source).trim().toLowerCase());
    if (normalized.some(source => source.length < 8)) fail(`${label} has a delivery source too vague for zero-prep use.`);
    if (new Set(normalized).size !== normalized.length) fail(`${label} repeats the same delivery source.`);
  }

  const required = (adventure.clues || []).filter(clue => clue.required);
  if (!required.length) fail("adventure has no required revelations to certify.");

  if (!process.exitCode) {
    console.log(`Clue delivery OK: ${adventure.metadata?.title || file} — ${required.length} required revelations have redundant authored sources and stage-card delivery.`);
  }
} catch (error) {
  console.error(`CLUE-DELIVERY ERROR: ${error.message}`);
  process.exit(1);
}
