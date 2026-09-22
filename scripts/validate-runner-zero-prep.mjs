import fs from "node:fs";

const source = fs.readFileSync("app.js", "utf8");
const failures = [];

const requireSource = (label, patterns) => {
  const missing = patterns.filter(pattern => !source.includes(pattern));
  if (missing.length) failures.push(`${label}: missing ${missing.join(", ")}`);
};

// This is intentionally a browser-contract test: package certification is separate.
// A field does not satisfy ZERO PREP merely by existing in JSON; the active stage
// renderer must surface it where the GM is currently running the adventure.
requireSource("stage identity and pacing", [
  'el("stage-progress")',
  'el("stage-clock")',
  'el("scene-purpose")',
  'el("scene-pacing")'
]);
requireSource("read-aloud and immediate GM notes", [
  'el("read-aloud")',
  'dmBoxHtml(scene',
  'scene.gmNotes'
]);
requireSource("NPC cues", [
  'bits.npcs.length',
  'npc.role',
  'npc.voiceCues',
  'npc.questFunction'
]);
requireSource("checks and consequences", [
  'tableChecksFor(scene.id)',
  'check.success',
  'check.failure'
]);
requireSource("hazards, traps, and puzzles", [
  'tableHazardsFor(scene.id)',
  'bits.traps.length',
  'bits.puzzles.length',
  'h.failure',
  'h.success'
]);
requireSource("encounter quick reference", [
  'encounters.map(encounterCardHtml)',
  'tableEncounter(encounter.id)',
  'table.creatures',
  'creature.ac',
  'creature.hp',
  'creature.tactics',
  'table.end'
]);
requireSource("clues and redundant delivery", [
  'scene.clueIds',
  'clue.sources',
  'Required revelation'
]);
requireSource("tactical callouts and maps", [
  'tableMapNote(scene.id)',
  'note.dimensions',
  'note.features',
  'renderPlayMaps(scene)'
]);
requireSource("ordered branching transitions", [
  'renderSceneExits(scene)',
  'scene.exits',
  'Choose a path',
  'goToScene(exitScene.id)'
]);

if (failures.length) {
  console.error("ZERO-PREP RUNNER CONTRACT FAILED");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("ZERO-PREP RUNNER CONTRACT OK: active stage cards surface the certified table-critical categories.");
