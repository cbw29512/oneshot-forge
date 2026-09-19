const { generate } = require("../generator.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (let i = 0; i < 100; i++) {
  const adventure = generate({
    level: (i % 20) + 1,
    partySize: 3 + (i % 4),
    durationHours: [2,3,4,6][i % 4],
    tone: ["random","heroic","mystery","horror","weird"][i % 5]
  });

  assert(adventure.metadata?.id, "generated metadata.id missing");
  assert(adventure.scenes?.length >= 6, "generated scenes missing");
  assert(adventure.npcs?.length >= 3, "generated NPCs missing");
  assert(adventure.maps?.[0]?.regions?.length >= 3, "generated map regions missing");
  assert(adventure.initialState?.currentSceneId === "scene-hook", "bad initial scene");
  for (const clue of adventure.clues.filter(c => c.required)) {
    assert(clue.sources.length >= 2, "required generated clue lacks redundancy");
  }
}

console.log("Generated 100 random adventures successfully.");