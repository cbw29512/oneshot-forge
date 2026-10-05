#!/usr/bin/env node
import fs from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/validate-structural-integrity.mjs <adventure.json>");
  process.exit(2);
}

const fail = [];
const add = msg => fail.push(msg);

try {
  const a = JSON.parse(fs.readFileSync(path, "utf8"));
  const scenes = a.scenes || [];
  const locations = new Set((a.locations || []).map(x => x.id));
  const npcs = new Set((a.npcs || []).map(x => x.id));
  const clues = new Set((a.clues || []).map(x => x.id));
  const encounters = new Set((a.encounters || []).map(x => x.id));
  const quickEncounters = new Set((a.quickrun?.encounters || []).map(x => x.id));
  const sceneIds = new Set(scenes.map(x => x.id));

  for (const s of scenes) {
    if (!locations.has(s.locationId)) add(`${s.id}: missing location ${s.locationId}`);
    for (const id of s.npcIds || []) if (!npcs.has(id)) add(`${s.id}: missing npc ${id}`);
    for (const id of s.clueIds || []) if (!clues.has(id)) add(`${s.id}: missing clue ${id}`);
    for (const id of s.encounterIds || []) {
      if (!encounters.has(id)) add(`${s.id}: missing encounter ${id}`);
      if (!quickEncounters.has(id)) add(`${s.id}: encounter ${id} missing quickrun entry`);
    }
    for (const id of s.exits || []) if (!sceneIds.has(id)) add(`${s.id}: missing exit scene ${id}`);
  }

  const clueScenes = new Map();
  for (const s of scenes) {
    for (const id of s.clueIds || []) {
      if (!clueScenes.has(id)) clueScenes.set(id, new Set());
      clueScenes.get(id).add(s.id);
    }
  }

  for (const c of (a.clues || []).filter(x => x.required)) {
    if ((c.sources || []).length < 3) add(`${c.id}: required clue has fewer than 3 sources`);
    if ((clueScenes.get(c.id)?.size || 0) < 2) add(`${c.id}: required clue appears in fewer than 2 scenes`);
  }

  const quickChecks = new Set((a.quickrun?.checks || []).map(x => x.id));
  for (const id of a.quickrun?.requiredCheckIds || []) {
    if (!quickChecks.has(id)) add(`missing required quickrun check ${id}`);
  }

  if (fail.length) {
    console.error(`Structural integrity failed: ${path}`);
    for (const msg of fail) console.error(" -", msg);
    process.exit(1);
  }

  console.log(`Structural integrity OK: ${path}`);
} catch (error) {
  console.error("STRUCTURAL-INTEGRITY ERROR:", error.message);
  process.exit(1);
}
