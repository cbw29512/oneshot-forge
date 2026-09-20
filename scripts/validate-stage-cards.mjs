#!/usr/bin/env node
import fs from 'node:fs';

function fail(message) {
  console.error(`STAGE CARD FAIL: ${message}`);
  process.exitCode = 1;
}

try {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node scripts/validate-stage-cards.mjs <adventure.json>');

  const adventure = JSON.parse(fs.readFileSync(file, 'utf8'));
  const scenes = adventure.scenes ?? [];
  const clueIds = new Set((adventure.clues ?? []).map((item) => item.id));
  const encounterIds = new Set((adventure.encounters ?? []).map((item) => item.id));
  const npcIds = new Set((adventure.npcs ?? []).map((item) => item.id));
  const locationIds = new Set((adventure.locations ?? []).map((item) => item.id));
  const sceneIds = new Set(scenes.map((item) => item.id));

  if (!scenes.length) fail('adventure has no scenes');

  for (const scene of scenes) {
    const label = `${scene.id ?? '(missing id)'}`;
    if (!scene.id) fail('scene missing id');
    if (!scene.title?.trim()) fail(`${label}: missing title`);
    if (!scene.purpose?.trim()) fail(`${label}: missing objective/purpose`);
    if (!scene.readAloud?.trim()) fail(`${label}: missing read-aloud`);
    if (!Array.isArray(scene.gmNotes) || scene.gmNotes.length === 0) {
      fail(`${label}: missing immediately usable GM notes`);
    }
    if (!Number.isFinite(scene.estimatedMinutes) || scene.estimatedMinutes <= 0) {
      fail(`${label}: missing pacing estimate`);
    }
    if (!locationIds.has(scene.locationId)) fail(`${label}: unknown location ${scene.locationId}`);

    for (const id of scene.npcIds ?? []) {
      if (!npcIds.has(id)) fail(`${label}: unknown NPC ${id}`);
    }
    for (const id of scene.clueIds ?? []) {
      if (!clueIds.has(id)) fail(`${label}: unknown clue ${id}`);
    }
    for (const id of scene.encounterIds ?? []) {
      if (!encounterIds.has(id)) fail(`${label}: unknown encounter ${id}`);
    }
    for (const id of scene.exits ?? []) {
      if (!sceneIds.has(id)) fail(`${label}: exit points to unknown scene ${id}`);
    }

    if (scene.pacingClass === 'core' && scene.id !== 'scene-resolution' && !(scene.exits ?? []).length) {
      fail(`${label}: core stage has no next choice/transition`);
    }
  }

  if (!process.exitCode) {
    console.log(`Stage-card zero-prep gate OK: ${scenes.length} scenes certified in ${file}`);
  }
} catch (error) {
  console.error(`STAGE CARD ERROR: ${error.message}`);
  process.exit(1);
}
