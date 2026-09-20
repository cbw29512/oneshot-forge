import fs from 'node:fs';

function fail(message) {
  console.error(`Route certification failed: ${message}`);
  process.exitCode = 1;
}

try {
  const [adventurePath, routesPath] = process.argv.slice(2);
  if (!adventurePath || !routesPath) throw new Error('usage: validate-routes.mjs <adventure.json> <routes.json>');

  const adventure = JSON.parse(fs.readFileSync(adventurePath, 'utf8'));
  const certification = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  const scenes = new Map((adventure.scenes ?? []).map(scene => [scene.id, scene]));
  const recoveries = new Map((adventure.recovery?.routes ?? []).map(route => [route.id, route]));
  const required = new Set(certification.requiredClueIds ?? []);

  if (certification.adventureId !== adventure.metadata?.id) {
    fail(`adventure id mismatch: ${certification.adventureId} vs ${adventure.metadata?.id}`);
  }

  for (const route of certification.routes ?? []) {
    const ids = route.sceneIds ?? [];
    if (ids.length < 2) {
      fail(`${route.id} must contain at least two scenes`);
      continue;
    }

    const availableClues = new Set();
    for (let index = 0; index < ids.length; index += 1) {
      const scene = scenes.get(ids[index]);
      if (!scene) {
        fail(`${route.id} references missing scene ${ids[index]}`);
        continue;
      }
      for (const clueId of scene.clueIds ?? []) availableClues.add(clueId);

      const nextId = ids[index + 1];
      if (nextId && !(scene.exits ?? []).includes(nextId)) {
        fail(`${route.id} has impossible transition ${scene.id} -> ${nextId}`);
      }
    }

    for (const recoveryId of route.recoveryRouteIds ?? []) {
      const recovery = recoveries.get(recoveryId);
      if (!recovery) {
        fail(`${route.id} references missing recovery ${recoveryId}`);
        continue;
      }
      for (const clueId of recovery.patch?.discoverClueIds ?? []) availableClues.add(clueId);
    }

    const missing = [...required].filter(clueId => !availableClues.has(clueId));
    if (missing.length) fail(`${route.id} misses required clues: ${missing.join(', ')}`);

    const lastScene = scenes.get(ids.at(-1));
    if ((lastScene?.exits ?? []).length !== 0) fail(`${route.id} does not end at a terminal scene`);
  }

  if (!process.exitCode) {
    console.log(`Route certification OK: ${certification.routes.length} routes preserve transitions, required clues, and terminal resolution.`);
  }
} catch (error) {
  console.error(`Route certification error: ${error.message}`);
  process.exit(1);
}
