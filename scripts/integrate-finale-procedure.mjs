import fs from "node:fs";
import process from "node:process";

const log = (level, message) => console[level](`[finale-integrator] ${message}`);

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    log("error", `Cannot read ${path}: ${error.message}`);
    throw error;
  }
}

function buildState(adventure, procedure) {
  const scene = adventure.scenes?.find((item) => item.id === procedure.sceneId);
  if (!scene) throw new Error(`Missing target scene ${procedure.sceneId}`);
  if (!Array.isArray(procedure.stageCardGmNotes) || procedure.stageCardGmNotes.length === 0) {
    throw new Error("Procedure has no stageCardGmNotes");
  }
  if (!Array.isArray(scene.gmNotes)) throw new Error(`${scene.id} has no gmNotes array`);
  return { adventure, procedure, scene };
}

function integrate(state) {
  const { scene, procedure } = state;
  const marker = procedure.label;
  const existingIndex = scene.gmNotes.findIndex((note) => note.includes(marker));
  if (existingIndex >= 0) {
    scene.gmNotes.splice(existingIndex, procedure.stageCardGmNotes.length, ...procedure.stageCardGmNotes);
  } else {
    scene.gmNotes.push(...procedure.stageCardGmNotes);
  }
  procedure.integrationStatus = "Authoritative: stageCardGmNotes are embedded in the target Stage Card.";
  return state;
}

function main() {
  try {
    const args = process.argv.slice(2);
    const write = args.includes("--write");
    const adventurePath = args.find((arg) => arg.endsWith(".oneshot.json"));
    const procedurePath = args.find((arg) => arg.endsWith(".old-flame.json"));
    if (!adventurePath || !procedurePath) {
      throw new Error("Usage: node scripts/integrate-finale-procedure.mjs <adventure.oneshot.json> <procedure.old-flame.json> [--write]");
    }

    const state = integrate(buildState(readJson(adventurePath), readJson(procedurePath)));
    const adventureText = `${JSON.stringify(state.adventure, null, 2)}\n`;
    const procedureText = `${JSON.stringify(state.procedure, null, 2)}\n`;

    if (!write) {
      log("log", `Validated integration plan for ${state.procedure.label} -> ${state.scene.id}; rerun with --write to persist.`);
      return;
    }

    fs.writeFileSync(adventurePath, adventureText);
    fs.writeFileSync(procedurePath, procedureText);
    log("log", `Integrated ${state.procedure.label} into ${state.scene.id}.`);
  } catch (error) {
    log("error", error.stack || error.message);
    process.exitCode = 1;
  }
}

main();
