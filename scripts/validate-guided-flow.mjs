import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate-guided-flow.mjs <adventure.json>");
  process.exit(1);
}
const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const scenes = adventure.scenes || [];
const sceneIds = new Set(scenes.map(scene => scene.id));
const contract = adventure.flowContract || {};
const branchAllowed = new Set(contract.allowedBranchScenes || []);
const terminals = new Set(contract.terminalScenes || []);

for (const scene of scenes) {
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

  if (legacy.length > 1 && !branchAllowed.has(scene.id)) {
    errors.push(scene.id + " branches even though the flow contract does not allow it");
  }
  if (terminals.has(scene.id) && legacy.length) {
    errors.push(scene.id + " is terminal but still has exits");
  }
}

if (!Array.isArray(contract.mainSpine) || !contract.mainSpine.length) {
  errors.push("flowContract.mainSpine is required");
} else {
  for (const id of contract.mainSpine) if (!sceneIds.has(id)) errors.push("main spine references missing scene " + id);
  for (let i = 0; i < contract.mainSpine.length - 1; i++) {
    const current = scenes.find(scene => scene.id === contract.mainSpine[i]);
    const next = contract.mainSpine[i + 1];
    if (!(current?.exits || []).includes(next)) {
      errors.push("main spine breaks between " + contract.mainSpine[i] + " and " + next);
    }
  }
}

for (const id of terminals) {
  if (!sceneIds.has(id)) errors.push("terminal scene missing: " + id);
}
const maxStage = Math.max(...scenes.map(scene => Number(scene.flowStage || 0)));
if (Number(contract.stageCount) !== maxStage) errors.push("flowContract.stageCount does not match logical stage count");

if (errors.length) {
  console.error("GUIDED FLOW VALIDATION FAILED");
  errors.forEach(error => console.error(" - " + error));
  process.exit(1);
}
console.log(
  "Guided flow OK: " + scenes.length + " scenes across " + maxStage +
  " logical stages; branches restricted to " + [...branchAllowed].join(", ") + "."
);
