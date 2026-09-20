import fs from "node:fs";

const path = process.argv[2] || "data/adventures/the-lantern-below.oneshot.json";
const quickrunPath = process.argv[3] || path.replace(/\.oneshot\.json$/, ".quickrun.json");
const errors = [];
const ids = values => new Set((values || []).map(value => value.id));
const hasText = value => typeof value === "string" && value.trim().length > 0;

function loadJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`[validator] Could not load ${label} ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function requireText(value, label) {
  if (!hasText(value)) errors.push(`${label} is required for zero-prep play`);
}

const adventure = loadJson(path, "adventure");
const quickrun = loadJson(quickrunPath, "quick-run reference");
const sceneIds = ids(adventure.scenes);
const npcIds = ids(adventure.npcs);
const clueIds = ids(adventure.clues);
const encounterIds = ids(adventure.encounters);
const locationIds = ids(adventure.locations);
const quickEncounterIds = ids(quickrun.encounters);
const quickCheckIds = ids(quickrun.checks);

requireText(adventure.metadata?.id, "metadata.id");
requireText(adventure.metadata?.title, "metadata.title");
requireText(adventure.setup?.pitch, "setup.pitch");
requireText(adventure.setup?.gmSummary, "setup.gmSummary");
requireText(adventure.quest?.objective, "quest.objective");
requireText(adventure.quest?.stakes, "quest.stakes");

if (!adventure.initialState?.currentSceneId || !sceneIds.has(adventure.initialState.currentSceneId)) {
  errors.push("initialState.currentSceneId must reference a scene");
}
for (const clue of adventure.clues || []) {
  if (clue.required && (!Array.isArray(clue.sources) || clue.sources.length < 2)) errors.push(`required clue ${clue.id} must have at least two independent sources`);
}
for (const scene of adventure.scenes || []) {
  if (scene.locationId && !locationIds.has(scene.locationId)) errors.push(`scene ${scene.id} references missing location ${scene.locationId}`);
  for (const id of scene.npcIds || []) if (!npcIds.has(id)) errors.push(`scene ${scene.id} references missing NPC ${id}`);
  for (const id of scene.clueIds || []) if (!clueIds.has(id)) errors.push(`scene ${scene.id} references missing clue ${id}`);
  for (const id of scene.encounterIds || []) if (!encounterIds.has(id)) errors.push(`scene ${scene.id} references missing encounter ${id}`);
  for (const id of scene.exits || []) if (!sceneIds.has(id)) errors.push(`scene ${scene.id} exits to missing scene ${id}`);
  if (scene.pacingClass === "core") {
    requireText(scene.readAloud, `core scene ${scene.id}.readAloud`);
    if (!Array.isArray(scene.gmNotes) || scene.gmNotes.length === 0) errors.push(`core scene ${scene.id} requires gmNotes[]`);
    if (!Number.isInteger(scene.estimatedMinutes) || scene.estimatedMinutes < 1) errors.push(`core scene ${scene.id} requires estimatedMinutes`);
  }
}
for (const map of adventure.maps || []) {
  if (!Array.isArray(map.regions) || map.regions.length === 0) errors.push(`map ${map.id} requires at least one runnable region`);
  for (const region of map.regions || []) if (region.sceneId && !sceneIds.has(region.sceneId)) errors.push(`map region ${region.id} references missing scene ${region.sceneId}`);
}
for (const npc of adventure.npcs || []) {
  for (const field of ["knows", "believes", "secrets", "cannotKnow"]) if (!Array.isArray(npc[field])) errors.push(`NPC ${npc.id} requires ${field}[]`);
  if (!Array.isArray(npc.voiceCues) || npc.voiceCues.length === 0) errors.push(`NPC ${npc.id} requires voiceCues[] for zero-prep roleplay`);
  requireText(npc.questFunction, `NPC ${npc.id}.questFunction`);
}

if (quickrun.adventureId !== adventure.metadata?.id) errors.push("quick-run adventureId must match metadata.id");
if (quickrun.target?.level !== adventure.metadata?.partyLevel) errors.push("quick-run target.level must match metadata.partyLevel");
if (quickrun.target?.partySize !== adventure.metadata?.partySize) errors.push("quick-run target.partySize must match metadata.partySize");
for (const check of quickrun.checks || []) if (!sceneIds.has(check.sceneId)) errors.push(`quick-run check ${check.id} references missing scene ${check.sceneId}`);
for (const hazard of quickrun.hazards || []) if (!sceneIds.has(hazard.sceneId)) errors.push(`quick-run hazard ${hazard.id} references missing scene ${hazard.sceneId}`);
for (const note of quickrun.mapNotes || []) if (!sceneIds.has(note.sceneId)) errors.push(`quick-run map note references missing scene ${note.sceneId}`);
for (const encounter of adventure.encounters || []) {
  if (!quickEncounterIds.has(encounter.id)) errors.push(`encounter ${encounter.id} lacks a zero-prep quick-run entry`);
}
for (const encounter of quickrun.encounters || []) {
  requireText(encounter.objective, `quick-run encounter ${encounter.id}.objective`);
  requireText(encounter.start, `quick-run encounter ${encounter.id}.start`);
  requireText(encounter.end, `quick-run encounter ${encounter.id}.end`);
  if (!Array.isArray(encounter.creatures) || encounter.creatures.length === 0) errors.push(`quick-run encounter ${encounter.id} requires creatures[]`);
  for (const creature of encounter.creatures || []) {
    if (!Number.isInteger(creature.ac) || !Number.isInteger(creature.hp)) errors.push(`${creature.name || encounter.id} requires numeric AC and HP`);
    requireText(creature.tactics, `${creature.name || encounter.id}.tactics`);
  }
}
for (const id of ["check-ritual", "check-bargain"]) if (!quickCheckIds.has(id)) errors.push(`finale requires ${id}`);
if (!Array.isArray(quickrun.rewards) || quickrun.rewards.length === 0) errors.push("quick-run requires at least one reward");

const totalMinutes = (adventure.scenes || []).reduce((sum, scene) => sum + (scene.estimatedMinutes || 0), 0);
if (adventure.metadata?.durationMinutes && totalMinutes < adventure.metadata.durationMinutes * 0.6) errors.push(`scene pacing covers only ${totalMinutes} of ${adventure.metadata.durationMinutes} target minutes`);

if (errors.length) {
  console.error(`Adventure validation failed for ${path}:`);
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}
console.log(`[validator] ${adventure.metadata.title} passes structural + zero-prep checks.`);
console.log(`[validator] ${adventure.scenes.length} scenes, ${adventure.npcs.length} NPCs, ${adventure.clues.length} clues, ${totalMinutes} planned minutes.`);
console.log(`[validator] ${quickrun.encounters.length} runnable encounters, ${quickrun.checks.length} checks, ${quickrun.rewards.length} rewards.`);
