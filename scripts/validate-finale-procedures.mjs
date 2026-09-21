import fs from "node:fs";

function fail(message) {
  console.error(`Finale procedure certification failed: ${message}`);
  process.exitCode = 1;
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path}: ${error.message}`);
    return null;
  }
}

function sceneText(scene) {
  return JSON.stringify(scene || {}).toLowerCase();
}

const packagePath = process.argv[2];
const procedurePath = process.argv[3];
if (!packagePath || !procedurePath) {
  fail("usage: node scripts/validate-finale-procedures.mjs <package.json> <procedure.json>");
  process.exit();
}

const adventure = readJson(packagePath);
const procedure = readJson(procedurePath);
if (!adventure || !procedure) process.exit();

const scene = (adventure.scenes || []).find(item => item.id === procedure.sceneId);
if (!scene) fail(`${procedure.procedureId}: scene ${procedure.sceneId} does not exist`);

const text = sceneText(scene);
const markers = [
  procedure.label,
  "three-success",
  "two failures",
  "dc 13",
  "action",
  "1d6 psychic",
  "advantage",
  "one season"
];

for (const marker of markers) {
  const normalized = String(marker).toLowerCase().replace("three-success", "three success");
  if (scene && !text.includes(normalized)) {
    fail(`${procedure.procedureId}: authoritative ${procedure.sceneId} is missing table-critical marker: ${marker}`);
  }
}

if (procedure.integrationStatus && /not yet authoritative/i.test(procedure.integrationStatus)) {
  fail(`${procedure.procedureId}: sidecar still declares itself non-authoritative`);
}

if (!process.exitCode) {
  console.log(`Finale procedure certification passed: ${procedure.procedureId} is runnable in ${procedure.sceneId}.`);
}
