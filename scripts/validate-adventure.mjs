import fs from "node:fs";

const path = process.argv[2] || "data/adventures/the-lantern-below.oneshot.json";
const errors = [];
const ids = values => new Set((values || []).map(value => value.id));
const hasText = value => typeof value === "string" && value.trim().length > 0;

function loadAdventure(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`[validator] Could not load ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function requireText(value, label) {
  if (!hasText(value)) errors.push(`${label} is required for zero-prep play`);
}

const adventure = loadAdventure(path);
const sidecarPath = process.argv[3] || path.replace(/\.oneshot\.json$/, ".quickrun.json");
const sceneIds = ids(adventure.scenes);
const npcIds = ids(adventure.npcs);
const clueIds = ids(adventure.clues);
const encounterIds = ids(adventure.encounters);
const locationIds = ids(adventure.locations);

let quickrun = adventure.quickrun || null;
if (!quickrun && fs.existsSync(sidecarPath)) {
  try { quickrun = JSON.parse(fs.readFileSync(sidecarPath, "utf8")); }
  catch (error) { errors.push("quick-run sidecar is not valid JSON: " + error.message); }
}

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
  if (clue.required && (!Array.isArray(clue.sources) || clue.sources.length < 3)) {
    errors.push(`required clue ${clue.id} must have at least three independent sources`);
  }
  if (clue.required) {
    const blob = (clue.sources || []).join(" ").toLowerCase();
    const physical = /note|journal|track|inscription|record|ward|mist|evidence|chamber|crypt|chapel|mechanism|ritual|residue|object|bell/.test(blob);
    if (!physical) errors.push(`required clue ${clue.id} needs at least one physical backup (notes, tracks, inscriptions) so it does not hinge on one NPC`);
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

  if (scene.pacingClass === "core") {
    requireText(scene.readAloud, `core scene ${scene.id}.readAloud`);
    if (!Array.isArray(scene.gmNotes) || scene.gmNotes.length === 0) {
      errors.push(`core scene ${scene.id} requires gmNotes[]`);
    }
    if (!Number.isInteger(scene.estimatedMinutes) || scene.estimatedMinutes < 1) {
      errors.push(`core scene ${scene.id} requires estimatedMinutes`);
    }
  }
}

for (const map of adventure.maps || []) {
  if (!Array.isArray(map.regions) || map.regions.length === 0) {
    errors.push(`map ${map.id} requires at least one runnable region`);
  }
  for (const region of map.regions || []) {
    if (region.sceneId && !sceneIds.has(region.sceneId)) errors.push(`map region ${region.id} references missing scene ${region.sceneId}`);
  }
}

for (const npc of adventure.npcs || []) {
  for (const field of ["knows", "believes", "secrets", "cannotKnow"]) {
    if (!Array.isArray(npc[field])) errors.push(`NPC ${npc.id} requires ${field}[]`);
  }
  if (!Array.isArray(npc.voiceCues) || npc.voiceCues.length === 0) {
    errors.push(`NPC ${npc.id} requires voiceCues[] for zero-prep roleplay`);
  }
  requireText(npc.questFunction, `NPC ${npc.id}.questFunction`);
}

if (!Array.isArray(adventure.endings) || adventure.endings.length < 2) {
  errors.push("adventure needs at least two authored endings so the conclusion is not a single script");
}

const routes = adventure.recovery?.routes || [];
if (routes.length < 3) {
  errors.push("recovery.routes needs at least three backups (giver gone, antagonist attacked, scene skipped)");
}
const routeText = routes.map(route => String(route.trigger || "") + " " + String(route.response || "")).join(" ").toLowerCase();
if (!/killed|unavailable|dead|missing|refuses|refuse/.test(routeText)) {
  errors.push("recovery must cover the quest giver being refused, missing, or dead");
}
if (!/attack|hostile|killed/.test(routeText)) {
  errors.push("recovery must cover the apparent antagonist being attacked before they explain");
}
if (!/bypass|skip|culvert|leaves|leave/.test(routeText)) {
  errors.push("recovery must cover skipping a core scene");
}

const totalMinutes = (adventure.scenes || []).reduce((sum, scene) => sum + (scene.estimatedMinutes || 0), 0);
if (adventure.metadata?.durationMinutes && totalMinutes < adventure.metadata.durationMinutes * 0.6) {
  errors.push(`scene pacing covers only ${totalMinutes} of ${adventure.metadata.durationMinutes} target minutes`);
}

if (quickrun) {
  if (quickrun.adventureId && quickrun.adventureId !== adventure.metadata?.id) {
    errors.push("quickrun.adventureId must match metadata.id");
  }
  if (quickrun.target?.level != null && quickrun.target.level !== adventure.metadata?.partyLevel) {
    errors.push("quickrun.target.level must match metadata.partyLevel");
  }
  if (quickrun.target?.partySize != null && quickrun.target.partySize !== adventure.metadata?.partySize) {
    errors.push("quickrun.target.partySize must match metadata.partySize");
  }
  const quickEncounterIds = ids(quickrun.encounters);
  for (const encounter of adventure.encounters || []) {
    if (!quickEncounterIds.has(encounter.id)) errors.push(`encounter ${encounter.id} needs a quickrun table entry`);
  }
  for (const check of quickrun.checks || []) {
    if (!sceneIds.has(check.sceneId)) errors.push(`quickrun check ${check.id} references missing scene ${check.sceneId}`);
    requireText(check.label, `quickrun check ${check.id}.label`);
    if (!Number.isInteger(check.dc)) errors.push(`quickrun check ${check.id} needs a numeric DC`);
  }
  for (const hazard of quickrun.hazards || []) {
    if (hazard.sceneId && !sceneIds.has(hazard.sceneId)) errors.push(`quickrun hazard ${hazard.id} references missing scene`);
  }
  for (const note of quickrun.mapNotes || []) {
    if (note.sceneId && !sceneIds.has(note.sceneId)) errors.push(`quickrun map note references missing scene ${note.sceneId}`);
  }
  const authoredById = new Map((adventure.encounters || []).map(item => [item.id, item]));
  for (const encounter of quickrun.encounters || []) {
    requireText(encounter.objective, `quickrun encounter ${encounter.id}.objective`);
    requireText(encounter.start, `quickrun encounter ${encounter.id}.start`);
    requireText(encounter.end, `quickrun encounter ${encounter.id}.end`);
    const authored = authoredById.get(encounter.id);
    const combat = /combat|boss/i.test(authored?.type || "");
    if (combat && (!Array.isArray(encounter.creatures) || !encounter.creatures.length)) {
      errors.push(`combat quickrun encounter ${encounter.id} requires creatures[]`);
    }
    for (const creature of encounter.creatures || []) {
      if (!Number.isInteger(creature.ac) || !Number.isInteger(creature.hp)) {
        errors.push(`${creature.name || encounter.id} requires numeric AC and HP`);
      }
      requireText(creature.tactics, `${creature.name || encounter.id}.tactics`);
    }
  }
  const requiredCheckIds = Array.isArray(quickrun.requiredCheckIds) ? quickrun.requiredCheckIds : [];
  const checkIds = ids(quickrun.checks);
  for (const id of requiredCheckIds) {
    if (!checkIds.has(id)) errors.push(`quickrun.requiredCheckIds lists missing check ${id}`);
  }
  if (!Array.isArray(quickrun.rewards) || !quickrun.rewards.length) {
    errors.push("quickrun requires at least one reward");
  }
}

if (errors.length) {
  console.error(`Adventure validation failed for ${path}:`);
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log(`[validator] ${adventure.metadata.title} passes structural + zero-prep checks.`);
console.log(`[validator] ${adventure.scenes.length} scenes, ${adventure.npcs.length} NPCs, ${adventure.clues.length} clues, ${totalMinutes} planned minutes.`);
if (quickrun) {
  console.log(`[validator] table ref: ${quickrun.encounters?.length || 0} encounters, ${quickrun.checks?.length || 0} checks, ${quickrun.rewards?.length || 0} rewards.`);
}
