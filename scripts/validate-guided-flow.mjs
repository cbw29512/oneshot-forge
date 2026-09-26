import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate-guided-flow.mjs <adventure.json>");
  process.exit(1);
}
const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const sceneIds = new Set((adventure.scenes || []).map(scene => scene.id));
for (const scene of adventure.scenes || []) {
  if (!Number.isInteger(scene.flowStage) || !Number.isInteger(scene.flowTotal)) errors.push(scene.id + " missing logical flow stage");
  if (!scene.flowLabel) errors.push(scene.id + " missing flow label");
  if (!Array.isArray(scene.runSteps) || scene.runSteps.length < 2) errors.push(scene.id + " needs at least two guided run steps");
  for (const step of scene.runSteps || []) {
    if (!step.title || !step.text) errors.push(scene.id + " has incomplete run step");
  }
  if (!scene.advanceWhen) errors.push(scene.id + " missing advanceWhen");
  const exits = scene.exitChoices || [];
  for (const choice of exits) {
    if (!choice.target || !sceneIds.has(choice.target)) errors.push(scene.id + " has invalid guided exit");
    if (!choice.label || !choice.description) errors.push(scene.id + " guided exit needs label and description");
  }
  const legacy = scene.exits || [];
  const guidedTargets = exits.map(choice => choice.target);
  if (JSON.stringify(legacy) !== JSON.stringify(guidedTargets)) errors.push(scene.id + " guided exits drift from scene.exits");
}
const resolution = (adventure.scenes || []).find(scene => scene.id === "scene-resolution");
if (!resolution?.endingIds?.length) errors.push("resolution stage must surface endingIds");
if (errors.length) {
  console.error("GUIDED FLOW VALIDATION FAILED");
  errors.forEach(error => console.error(" - " + error));
  process.exit(1);
}
console.log("Guided flow OK: " + adventure.scenes.length + " scenes across " + Math.max(...adventure.scenes.map(s => s.flowStage)) + " logical stages.");
