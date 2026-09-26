(() => {
  "use strict";

  const IMMUTABLE = [
    "preview","hook","questGiver.role","questGiver.motive","twist","obstacle",
    "travel","locationProgression","finale","aftermath","randomEncounters"
  ];

  function createFleshRequest(bones) {
    try {
      if (!bones || bones.version !== "0.1.0") throw new Error("Unsupported or missing ForgeBones.");
      return {
        contractVersion:"0.1.0",
        task:"Expand presentation only. Preserve every bone fact and mechanic exactly.",
        immutablePaths:[...IMMUTABLE],
        allowedOutput:{
          npcNames:"May invent names that do not change roles, motives, knowledge, or allegiance.",
          npcDialogue:"Write concise table-ready lines consistent with the supplied motive and truth.",
          locationDescriptions:"Add sensory description without adding secret doors, hazards, clues, or mechanics.",
          readAloud:"Write 2–4 sentence boxed text for each structural scene.",
          transitions:"Add short connective prose without changing scene order or outcomes."
        },
        forbidden:[
          "Do not change DCs, damage, conditions, rewards, timers, scene order, exits, or state transitions.",
          "Do not add required clues, secrets, factions, villains, objectives, or encounters.",
          "Do not change apparentTruth or actualTruth.",
          "Do not change finale kind or make combat mandatory when a noncombat resolution exists.",
          "Do not resolve moral choices for the players."
        ],
        bones:JSON.parse(JSON.stringify(bones))
      };
    } catch (error) {
      console.error("AI flesh request creation failed.", error);
      throw error;
    }
  }

  function immutableSnapshot(bones) {
    return JSON.stringify({
      preview:bones.preview,hook:bones.hook,questGiver:bones.questGiver,twist:bones.twist,
      obstacle:bones.obstacle,travel:bones.travel,locationProgression:bones.locationProgression,
      finale:bones.finale,aftermath:bones.aftermath,randomEncounters:bones.randomEncounters
    });
  }

  function assertBonesUnchanged(originalBones, candidateBones) {
    try {
      if (immutableSnapshot(originalBones) !== immutableSnapshot(candidateBones)) {
        throw new Error("AI flesh attempted to mutate authoritative Forge bones.");
      }
      return true;
    } catch (error) {
      console.error("AI flesh validation failed.", error);
      throw error;
    }
  }

  const api={createFleshRequest,assertBonesUnchanged,immutablePaths:IMMUTABLE};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (typeof globalThis!=="undefined") globalThis.ForgeFlesh=api;
})();
