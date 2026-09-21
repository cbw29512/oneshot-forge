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

if (procedure.adventureId !== adventure?.metadata?.id) {
  fail(`${procedure.procedureId || "procedure"}: adventureId does not match package metadata.id`);
}

const scene = (adventure.scenes || []).find(item => item.id === procedure.sceneId);
if (!scene) {
  fail(`${procedure.procedureId || "procedure"}: scene ${procedure.sceneId} does not exist`);
}

const markers = procedure.certificationMarkers;
if (!Array.isArray(markers) || markers.length < 4) {
  fail(`${procedure.procedureId || "procedure"}: certificationMarkers must contain at least four table-critical strings`);
}

const text = sceneText(scene);
for (const marker of markers || []) {
  const normalized = String(marker).trim().toLowerCase();
  if (!normalized) {
    fail(`${procedure.procedureId || "procedure"}: certificationMarkers cannot contain blank values`);
    continue;
  }
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
