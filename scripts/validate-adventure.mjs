import fs from "node:fs";

const path = process.argv[2] || "data/adventures/the-lantern-below.oneshot.json";
const adventure = JSON.parse(fs.readFileSync(path, "utf8"));
const errors = [];
const ids = values => new Set(values.map(value => value.id));

const sceneIds = ids(adventure.scenes || []);
const npcIds = ids(adventure.npcs || []);
const clueIds = ids(adventure.clues || []);
const encounterIds = ids(adventure.encounters || []);
const locationIds = ids(adventure.locations || []);

if (!adventure.metadata?.id) errors.push("metadata.id is required");
if (!adventure.initialState?.currentSceneId || !sceneIds.has(adventure.initialState.currentSceneId)) {
  errors.push("initialState.currentSceneId must reference a scene");
}

for (const clue of adventure.clues || []) {
  if (clue.required && (!Array.isArray(clue.sources) || clue.sources.length < 2)) {
    errors.push(`required clue ${clue.id} must have at least two independent sources`);
  }
}

for (const scene of adventure.scenes || []) {
  if (scene.locationId && !locationIds.has(scene.locationId)) {
    errors.push(`scene ${scene.id} references missing location ${scene.locationId}`);
  }
  for (const id of scene.npcIds || []) if (!npcIds.has(id)) errors.push(`scene ${scene.id} references missing NPC ${id}`);
  for (const id of scene.clueIds || []) if (!clueIds.has(id)) errors.push(`scene ${scene.id} references missing clue ${id}`);
  for (const id of scene.encounterIds || []) if (!encounterIds.has(id)) errors.push(`scene ${scene.id} references missing encounter ${id}`);
  for (const id of scene.exits || []) if (!sceneIds.has(id)) errors.push(`scene ${scene.id} exits to missing scene ${id}`);
}

for (const map of adventure.maps || []) {
  for (const region of map.regions || []) {
    if (region.sceneId && !sceneIds.has(region.sceneId)) errors.push(`map region ${region.id} references missing scene ${region.sceneId}`);
  }
}

for (const npc of adventure.npcs || []) {
  for (const field of ["knows", "believes", "secrets", "cannotKnow"]) {
    if (!Array.isArray(npc[field])) errors.push(`NPC ${npc.id} requires ${field}[]`);
  }
}

if (errors.length) {
  console.error("Adventure validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log(`Validated ${adventure.metadata.title}: ${adventure.scenes.length} scenes, ${adventure.npcs.length} NPCs, ${adventure.clues.length} clues.`);
