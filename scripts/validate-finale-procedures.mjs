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

function includesAll(haystack, needles) {
  const text = JSON.stringify(haystack || {}).toLowerCase();
  return needles.every(needle => text.includes(String(needle).toLowerCase()));
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

const required = [
  procedure.procedureId,
  procedure.name,
  procedure.dc,
  procedure.successTarget,
  procedure.failureLimit,
  "action"
].filter(value => value !== undefined && value !== null && value !== "");

if (scene && !includesAll(scene, required)) {
  fail(`${procedure.procedureId}: authoritative ${procedure.sceneId} does not contain the complete runnable procedure (${required.join(", ")})`);
}

if (procedure.integrationStatus && /not yet authoritative/i.test(procedure.integrationStatus)) {
  fail(`${procedure.procedureId}: sidecar still declares itself non-authoritative`);
}

if (!process.exitCode) {
  console.log(`Finale procedure certification passed: ${procedure.procedureId} is runnable in ${procedure.sceneId}.`);
}
