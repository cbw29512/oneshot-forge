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
  const npcs = adventure.npcs || [];
  const sceneClues = new Map();

  const npcNames = npcs
    .flatMap(npc => [npc.name, npc.id])
    .filter(Boolean)
    .map(value => String(value).toLowerCase());

  function isNpcDependent(source) {
    const sourceText = String(source || "").trim().toLowerCase();
    if (npcNames.some(name => name && sourceText.includes(name))) return true;
    return /\b(?:asks?|tells?|says?|admits?|confesses?|explains?|warns?|speaks?|questions?|interview|persuad|npc)\b/.test(sourceText);
  }

  function isWorldEvidence(source) {
    const sourceText = String(source || "").trim().toLowerCase();
    return /\b(?:notes?|journals?|letters?|ledgers?|maps?|tracks?|footprints?|inscriptions?|records?|receipts?|contracts?|tools?|objects?|possessions?|rooms?|walls?|doors?|mechanisms?|rituals?|residue|ash|mud|trails?|crates?|wagons?|symbols?|marks?|carvings?|runes?|books?|scrolls?|signs?|evidence|chambers?|crypts?|chapels?|bells?|water|debris|tokens?|seals?)\b/.test(sourceText);
  }

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
    if (clue.required && sources.length < 3) fail(`${label} is required but has fewer than three independent delivery sources.`);
    if (!sceneClues.has(clue.id)) fail(`${label} is never surfaced by a stage card.`);

    const normalized = sources.map(source => String(source).trim().toLowerCase());
    if (normalized.some(source => source.length < 8)) fail(`${label} has a delivery source too vague for zero-prep use.`);
    if (new Set(normalized).size !== normalized.length) fail(`${label} repeats the same delivery source.`);

    if (clue.required) {
      const nonNpcSources = sources.filter(source => !isNpcDependent(source));
      const worldSources = sources.filter(isWorldEvidence);
      if (!nonNpcSources.length) {
        fail(`${label} depends entirely on NPC availability.`);
      }
      if (!worldSources.length) {
        fail(`${label} needs at least one physical or environmental backup source.`);
      }
    }
  }

  const required = (adventure.clues || []).filter(clue => clue.required);
  if (!required.length) fail("adventure has no required revelations to certify.");

  if (!process.exitCode) {
    console.log(`Clue delivery OK: ${adventure.metadata?.title || file} — ${required.length} required revelations have 3+ routes including world evidence.`);
  }
} catch (error) {
  console.error(`CLUE-DELIVERY ERROR: ${error.message}`);
  process.exit(1);
}
