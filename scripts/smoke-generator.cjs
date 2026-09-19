const { generate } = require("../generator.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function plannedMinutes(adventure) {
  return adventure.scenes.reduce((sum, scene) => sum + (scene.estimatedMinutes || 0), 0);
}

for (let i = 0; i < 100; i++) {
  const hours = [2,3,4,6][i % 4];
  const seed = "SMOKE-" + i;
  const options = {
    level: (i % 20) + 1,
    partySize: 2 + (i % 7),
    durationHours: hours,
    tone: ["random","heroic","mystery","horror","weird"][i % 5],
    seed
  };

  const adventure = generate(options);
  const repeat = generate(options);

  assert(JSON.stringify(adventure) === JSON.stringify(repeat), "same seed/settings must reproduce the same package");
  assert(adventure.metadata?.id, "generated metadata.id missing");
  assert(adventure.metadata?.seed === seed, "seed not preserved");
  assert(adventure.scenes?.length >= 6, "generated scenes missing");
  assert(adventure.npcs?.length >= 3, "generated NPCs missing");
  assert(adventure.maps?.[0]?.regions?.length >= 3, "generated map regions missing");
  assert(adventure.initialState?.currentSceneId === "scene-hook", "bad initial scene");
  assert(Array.isArray(adventure.initialState?.sceneHistory), "scene history missing");

  const total = plannedMinutes(adventure);
  assert(total <= hours * 60, "planned scenes exceed selected runtime");
  assert(total >= hours * 60 * 0.82, "planned scenes underfill selected runtime");

  const sceneIds = new Set(adventure.scenes.map(scene => scene.id));
  for (const scene of adventure.scenes) {
    for (const exit of scene.exits || []) assert(sceneIds.has(exit), "scene exit references missing scene");
  }

  for (const clue of adventure.clues.filter(clue => clue.required)) {
    assert(clue.sources.length >= 2, "required generated clue lacks redundancy");
  }

  const boss = adventure.encounters.find(encounter => encounter.id === "enc-boss");
  assert(boss?.mechanics?.hpEach > 0, "boss mechanics missing");
  assert(boss?.mechanics?.saveDC > 0, "boss save DC missing");
}

const low = generate({level:1, partySize:2, durationHours:4, tone:"heroic", seed:"SCALE"});
const high = generate({level:15, partySize:6, durationHours:4, tone:"heroic", seed:"SCALE"});
const lowBoss = low.encounters.find(encounter => encounter.id === "enc-boss").mechanics;
const highBoss = high.encounters.find(encounter => encounter.id === "enc-boss").mechanics;
assert(highBoss.hpEach > lowBoss.hpEach, "boss HP should scale with level/party");
assert(highBoss.attackBonus > lowBoss.attackBonus, "boss attack should scale with level");
assert(highBoss.saveDC > lowBoss.saveDC, "boss save DC should scale with level");

console.log("Generated and validated 100 deterministic random adventures successfully.");