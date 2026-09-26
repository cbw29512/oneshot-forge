export function validateAdventureFlow(scenes, initialSceneId, flowContract = null) {
  const errors = [];
  const scenesById = new Map((scenes || []).map(scene => [scene.id, scene]));

  function reachableTerminals(startId) {
    const terminals = new Set();
    const visited = new Set();
    const pending = [startId];
    while (pending.length) {
      const id = pending.pop();
      if (visited.has(id)) continue;
      visited.add(id);
      const scene = scenesById.get(id);
      if (!scene) continue;
      const exits = scene.exits || [];
      if (!exits.length) terminals.add(id);
      else exits.forEach(exitId => pending.push(exitId));
    }
    return terminals;
  }

  const terminalIds = new Set((scenes || []).filter(scene => !(scene.exits || []).length).map(scene => scene.id));
  if (!terminalIds.size) errors.push("adventure requires at least one terminal ending scene");

  const reachableFromStart = new Set();
  const pending = initialSceneId ? [initialSceneId] : [];
  while (pending.length) {
    const id = pending.pop();
    if (reachableFromStart.has(id)) continue;
    reachableFromStart.add(id);
    (scenesById.get(id)?.exits || []).forEach(exitId => pending.push(exitId));
  }

  for (const scene of scenes || []) {
    if (!reachableFromStart.has(scene.id)) errors.push(`scene ${scene.id} is unreachable from the opening scene`);
    if (!reachableTerminals(scene.id).size) errors.push(`scene ${scene.id} cannot reach an ending`);
  }

  const branchScenes = (scenes || []).filter(scene => (scene.exits || []).length > 1);
  if (!branchScenes.length) errors.push("adventure requires at least one meaningful branch with multiple paths");

  const allowedTerminalBranches = new Set(flowContract?.allowedBranchScenes || []);
  const declaredTerminals = new Set(flowContract?.terminalScenes || []);

  for (const scene of branchScenes) {
    const terminalSets = scene.exits.map(reachableTerminals);
    const shared = terminalSets.length
      ? [...terminalSets[0]].filter(id => terminalSets.every(set => set.has(id)))
      : [];
    if (shared.length) continue;

    const allTerminateInDeclaredEndings =
      allowedTerminalBranches.has(scene.id) &&
      terminalSets.every(set => set.size > 0 && [...set].every(id => declaredTerminals.has(id)));

    if (!allTerminateInDeclaredEndings) {
      errors.push(`branching scene ${scene.id} has paths that never reconverge on a shared ending`);
    }
  }

  return errors;
}
