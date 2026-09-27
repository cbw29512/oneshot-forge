(() => {
  "use strict";

  const REQUIRED_PACKAGE_KEYS = [
    "schemaVersion","metadata","setup","quest","truth","npcs","locations",
    "scenes","clues","encounters","maps","recovery","pacing","endings","initialState"
  ];

  function assertBonesCompatible(bones) {
    if (!bones || bones.version !== "0.1.0") throw new Error("candidate requires ForgeBones 0.1.0");
    if (!Array.isArray(bones.randomEncounters) || bones.randomEncounters.length !== 2) throw new Error("candidate requires exactly two random encounters");
    for (const bundle of bones.requiredClues || []) {
      if (!Array.isArray(bundle.sources) || bundle.sources.length < 3) throw new Error("required clue needs three sources");
      if (!bundle.sources.some((source) => ["physical","environmental","injury","architecture"].includes(source.kind))) {
        throw new Error("required clue needs physical/environmental evidence");
      }
    }
  }

  function assertCompiledCompatible(pkg) {
    for (const key of REQUIRED_PACKAGE_KEYS) if (pkg?.[key] == null) throw new Error(`compiled package missing ${key}`);
    if (pkg.encounters.length !== 2) throw new Error("compiled package lost the two-encounter contract");
    if (!pkg.scenes.every((scene) => scene.readAloud === "")) throw new Error("pre-flesh package contains presentation prose");
    const ids = (items) => new Set(items.map((item) => item.id));
    const sceneIds=ids(pkg.scenes), locationIds=ids(pkg.locations), npcIds=ids(pkg.npcs), clueIds=ids(pkg.clues), encounterIds=ids(pkg.encounters);
    for (const scene of pkg.scenes) {
      if (!locationIds.has(scene.locationId)) throw new Error(`unknown scene location ${scene.locationId}`);
      for (const id of scene.exits || []) if (!sceneIds.has(id)) throw new Error(`unknown scene exit ${id}`);
      for (const id of scene.npcIds || []) if (!npcIds.has(id)) throw new Error(`unknown scene NPC ${id}`);
      for (const id of scene.clueIds || []) if (!clueIds.has(id)) throw new Error(`unknown scene clue ${id}`);
      for (const id of scene.encounterIds || []) if (!encounterIds.has(id)) throw new Error(`unknown scene encounter ${id}`);
    }
  }

  function diversitySignature(bones) {
    return [
      bones.hook.type,bones.twist.actualTruth,bones.obstacle.kind,bones.finale.kind,
      ...bones.randomEncounters.map((encounter) => encounter.kind).sort()
    ].join("|");
  }

  function buildCandidate({bones, pkg, seenSignatures=new Set()}) {
    try {
      const history=[{state:"generated",reason:"deterministic seed generated"}];
      assertBonesCompatible(bones);
      assertCompiledCompatible(pkg);
      const signature=diversitySignature(bones);
      if (seenSignatures.has(signature)) {
        return {seed:bones.seed,state:"rejected",history:[...history,{state:"rejected",reason:"duplicate structural signature"}],signature};
      }
      seenSignatures.add(signature);
      return {
        seed:bones.seed,state:"bones-valid",
        history:[...history,{state:"bones-valid",reason:"bones and compiled-package compatibility passed"}],
        signature,bones,pkg
      };
    } catch (error) {
      console.error(`Forge candidate ${bones?.seed || "UNKNOWN"} rejected:`,error.message);
      return {seed:bones?.seed || null,state:"rejected",history:[{state:"rejected",reason:error.message}]};
    }
  }

  const api={buildCandidate,assertBonesCompatible,assertCompiledCompatible,diversitySignature};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (typeof globalThis!=="undefined") globalThis.ForgeCandidate=api;
})();