import fs from "node:fs";

function findObjectById(value, id) {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value) && value.id === id) return value;
  for (const child of Object.values(value)) {
    const found = findObjectById(child, id);
    if (found) return found;
  }
  return null;
}

try {
  const pack = JSON.parse(fs.readFileSync("data/adventures/the-lantern-below.oneshot.json", "utf8"));
  const routeSpec = JSON.parse(fs.readFileSync("data/adventures/the-lantern-below.routes.json", "utf8"));
  const scenes = new Map((pack.scenes || []).map(scene => [scene.id, scene]));
  const clues = new Map((pack.clues || []).map(clue => [clue.id, clue]));
  const errors = [];

  for (const clueId of routeSpec.requiredClueIds || []) {
    const clue = clues.get(clueId);
    if (!clue) errors.push(`Required clue ${clueId} is missing from the Adventure Package.`);
    else if (!clue.required) errors.push(`Route spec marks ${clueId} required but the Adventure Package does not.`);
  }

  for (const route of routeSpec.routes || []) {
    const routeScenes = (route.sceneIds || []).map(id => scenes.get(id)).filter(Boolean);
    if (routeScenes.length !== (route.sceneIds || []).length) {
      errors.push(`${route.id}: references a missing scene.`);
      continue;
    }
    if (!routeScenes.some(scene => /final/i.test(scene.id))) errors.push(`${route.id}: never reaches a finale scene.`);
    if (!routeScenes.some(scene => /resolution/i.test(scene.id))) errors.push(`${route.id}: never reaches resolution.`);

    const recoveryObjects = (route.recoveryRouteIds || []).map(id => {
      const recovery = findObjectById(pack, id);
      if (!recovery) errors.push(`${route.id}: recovery route ${id} is missing from the Adventure Package.`);
      return recovery;
    }).filter(Boolean);

    const routeText = JSON.stringify({ scenes: routeScenes, recovery: recoveryObjects }).toLowerCase();
    for (const clueId of routeSpec.requiredClueIds || []) {
      if (!clues.has(clueId)) continue;
      if (!routeText.includes(clueId.toLowerCase())) {
        errors.push(`${route.id}: required clue ${clueId} is neither delivered on-route nor named by an authored recovery route.`);
      }
    }
  }

  if (errors.length) {
    console.error("Lantern route simulation failed:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  console.log(`Lantern route simulation passed: ${(routeSpec.routes || []).length} authored routes reach finale/resolution with explicit required-clue delivery or recovery.`);
} catch (error) {
  console.error("Lantern route simulation crashed.", error);
  process.exit(1);
}
