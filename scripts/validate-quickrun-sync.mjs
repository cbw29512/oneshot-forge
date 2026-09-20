import fs from "node:fs";

const packagePath = process.argv[2] || "data/adventures/the-lantern-below.oneshot.json";
const sidecarPath = process.argv[3] || packagePath.replace(/\.oneshot\.json$/, ".quickrun.json");

function fail(message) {
  console.error(`Quick-run sync failed: ${message}`);
  process.exitCode = 1;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function sameData(left, right) {
  return JSON.stringify(canonicalize(left ?? null)) === JSON.stringify(canonicalize(right ?? null));
}

try {
  const adventure = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
  const embedded = adventure.quickrun;

  if (!embedded) {
    fail(`${packagePath} has no embedded quickrun block`);
  } else if (embedded.adventureId !== sidecar.adventureId) {
    fail(`adventureId differs: embedded=${embedded.adventureId} sidecar=${sidecar.adventureId}`);
  } else {
    const fields = ["target", "checks", "encounters", "hazards", "rewards", "mapNotes", "requiredCheckIds"];
    for (const field of fields) {
      if (!sameData(embedded[field], sidecar[field])) {
        fail(`${field} differs between embedded quickrun and sidecar`);
      }
    }
  }

  if (!process.exitCode) console.log(`Quick-run sync OK: ${sidecar.adventureId}`);
} catch (error) {
  console.error(`Quick-run sync validation crashed: ${error.message}`);
  process.exitCode = 1;
}
