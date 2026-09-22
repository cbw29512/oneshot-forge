import fs from "node:fs";

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

    for (const clueId of routeSpec.requiredClueIds || []) {
      const clue = clues.get(clueId);
      if (!clue) continue;
      const sourceText = (clue.sources || []).join(" ").toLowerCase();
      const sceneText = routeScenes.map(scene => JSON.stringify(scene).toLowerCase()).join(" ");
      const deliveredOnRoute = sceneText.includes(clueId.toLowerCase()) ||
        (clue.sources || []).some(source => sceneText.includes(String(source).toLowerCase()));
      if (!deliveredOnRoute && !sourceText) errors.push(`${route.id}: ${clueId} has no authored recovery source.`);
    }
  }

  if (errors.length) {
    console.error("Lantern route simulation failed:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  console.log(`Lantern route simulation passed: ${(routeSpec.routes || []).length} authored routes reach finale/resolution with required clue recovery metadata.`);
} catch (error) {
  console.error("Lantern route simulation crashed.", error);
  process.exit(1);
}
