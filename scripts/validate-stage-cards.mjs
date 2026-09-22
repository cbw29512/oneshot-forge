#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const fail = (message) => failures.push(message);
const ids = (items) => new Set((items ?? []).map((item) => item.id));

function readJson(path, label) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function requireText(value, label) {
  if (!hasText(value)) fail(`${label}: missing usable text`);
}

try {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node scripts/validate-stage-cards.mjs <adventure.json> [quickrun.json]');

  const adventure = readJson(file, 'adventure package could not be read');
  const quickrunPath = process.argv[3] || file.replace(/\.oneshot\.json$/, '.quickrun.json');
  const quickrun = adventure.quickrun ?? (fs.existsSync(quickrunPath) ? readJson(quickrunPath, 'quick-run data could not be read') : null);
  const scenes = adventure.scenes ?? [];
  const clueIds = ids(adventure.clues);
  const encounterIds = ids(adventure.encounters);
  const npcIds = ids(adventure.npcs);
  const locationIds = ids(adventure.locations);
  const sceneIds = ids(scenes);

  if (!scenes.length) fail('adventure has no scenes');
  if (!quickrun) fail('adventure has no quick-run data; stage-critical checks, combat, hazards, rewards, and maps cannot be certified');

  const checksByScene = new Map();
  const hazardsByScene = new Map();
  for (const check of quickrun?.checks ?? []) {
    if (!checksByScene.has(check.sceneId)) checksByScene.set(check.sceneId, []);
    checksByScene.get(check.sceneId).push(check);
    requireText(check.label, `check ${check.id}.label`);
    requireText(check.ability, `check ${check.id}.ability`);
    requireText(check.success, `check ${check.id}.success`);
    requireText(check.failure, `check ${check.id}.failure`);
    if (!Number.isInteger(check.dc)) fail(`check ${check.id}: missing numeric DC`);
  }
  for (const hazard of quickrun?.hazards ?? []) {
    if (!hazardsByScene.has(hazard.sceneId)) hazardsByScene.set(hazard.sceneId, []);
    hazardsByScene.get(hazard.sceneId).push(hazard);
  }
  for (const map of quickrun?.mapNotes ?? []) {
    requireText(map.dimensions, `map callout for ${map.sceneId}.dimensions`);
    if (!Array.isArray(map.features) || !map.features.length) fail(`map callout for ${map.sceneId}: missing tactical features`);
  }

  const quickEncounters = new Map((quickrun?.encounters ?? []).map((item) => [item.id, item]));
  for (const encounter of quickrun?.encounters ?? []) {
    requireText(encounter.objective, `encounter ${encounter.id}.objective`);
    requireText(encounter.start, `encounter ${encounter.id}.start`);
    requireText(encounter.end, `encounter ${encounter.id}.end`);
    for (const creature of encounter.creatures ?? []) {
      requireText(creature.name, `encounter ${encounter.id} creature.name`);
      requireText(creature.tactics, `${creature.name || encounter.id}.tactics`);
      if (!Number.isInteger(creature.ac) || !Number.isInteger(creature.hp)) fail(`${creature.name || encounter.id}: missing numeric AC/HP`);
    }
  }

  for (const scene of scenes) {
    const label = scene.id ?? '(missing id)';
    if (!scene.id) fail('scene missing id');
    requireText(scene.title, `${label}.title`);
    requireText(scene.purpose, `${label}.objective/purpose`);
    requireText(scene.readAloud, `${label}.readAloud`);
    if (!Array.isArray(scene.gmNotes) || !scene.gmNotes.length) fail(`${label}: missing immediately usable GM notes`);
    if (!Number.isFinite(scene.estimatedMinutes) || scene.estimatedMinutes <= 0) fail(`${label}: missing pacing estimate`);
    if (!locationIds.has(scene.locationId)) fail(`${label}: unknown location ${scene.locationId}`);

    for (const id of scene.npcIds ?? []) if (!npcIds.has(id)) fail(`${label}: unknown NPC ${id}`);
    for (const id of scene.clueIds ?? []) if (!clueIds.has(id)) fail(`${label}: unknown clue ${id}`);
    for (const id of scene.encounterIds ?? []) {
      if (!encounterIds.has(id)) fail(`${label}: unknown encounter ${id}`);
      if (!quickEncounters.has(id)) fail(`${label}: encounter ${id} lacks same-screen quick-run combat/reference data`);
    }
    for (const id of scene.exits ?? []) if (!sceneIds.has(id)) fail(`${label}: exit points to unknown scene ${id}`);

    if (scene.pacingClass === 'core' && scene.id !== 'scene-resolution' && !(scene.exits ?? []).length) {
      fail(`${label}: core stage has no next choice/transition`);
    }

    for (const check of checksByScene.get(scene.id) ?? []) {
      if (!hasText(check.success) || !hasText(check.failure)) fail(`${label}: check ${check.id} must show both success and failure consequences on the stage`);
    }
    for (const hazard of hazardsByScene.get(scene.id) ?? []) {
      requireText(hazard.trigger, `${label} hazard ${hazard.id}.trigger`);
      requireText(hazard.save, `${label} hazard ${hazard.id}.save`);
      requireText(hazard.failure, `${label} hazard ${hazard.id}.failure`);
      requireText(hazard.success, `${label} hazard ${hazard.id}.success`);
      requireText(hazard.failForward, `${label} hazard ${hazard.id}.failForward`);
    }
  }

  for (const requiredId of quickrun?.requiredCheckIds ?? []) {
    const check = (quickrun?.checks ?? []).find((item) => item.id === requiredId);
    if (!check) fail(`required check ${requiredId}: missing from quick-run data`);
    else if (!sceneIds.has(check.sceneId)) fail(`required check ${requiredId}: points to missing stage ${check.sceneId}`);
  }

  if (!Array.isArray(quickrun?.rewards) || !quickrun.rewards.length) fail('quick-run data has no immediately usable reward reference');
  for (const reward of quickrun?.rewards ?? []) {
    requireText(reward.when, `reward ${reward.id ?? '(unnamed)'}.when`);
    requireText(reward.reward, `reward ${reward.id ?? '(unnamed)'}.reward`);
  }

  const tacticalScenes = scenes.filter((scene) => (scene.encounterIds ?? []).length > 0);
  if (tacticalScenes.length && !(quickrun?.mapNotes ?? []).length) fail('encounter stages exist but quick-run data has no tactical map callouts');

  if (failures.length) {
    console.error(`Stage-card sale gate failed for ${file}:`);
    failures.forEach((message) => console.error(` - ${message}`));
    process.exit(1);
  }

  console.log(`Stage-card sale gate OK: ${scenes.length} stages certified in ${file}`);
  console.log(`Zero-prep refs: ${quickrun.checks?.length ?? 0} checks, ${quickrun.encounters?.length ?? 0} encounters, ${quickrun.hazards?.length ?? 0} hazards, ${quickrun.mapNotes?.length ?? 0} tactical maps, ${quickrun.rewards?.length ?? 0} rewards.`);
} catch (error) {
  console.error(`STAGE CARD ERROR: ${error.message}`);
  process.exit(1);
}
