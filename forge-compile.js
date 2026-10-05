(() => {
  "use strict";

  function slug(value) {
    return String(value || "forge").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "forge";
  }

  function titleCase(value) {
    return String(value || "").replace(/\b\w/g, ch => ch.toUpperCase());
  }

  function compileBones(bones, options = {}) {
    if (!bones || bones.version !== "0.1.0") throw new Error("Unsupported or missing ForgeBones.");
    if (!Array.isArray(bones.randomEncounters) || bones.randomEncounters.length !== 2) {
      throw new Error("ForgeBones must carry exactly two random encounters.");
    }

    const level = Number(options.level || 4);
    const partySize = Number(options.partySize || 4);
    const durationMinutes = Number(options.durationHours || 3) * 60;
    const tone = options.tone && options.tone !== "random" ? [options.tone] : ["mystery"];
    const id = "forge-" + slug(bones.seed);
    const origin = bones.preview.origin;
    const destination = bones.preview.destination;
    const giverRole = bones.questGiver.role;
    const giverName = titleCase(giverRole);
    const dc = Number.isInteger(bones.obstacle.dc) ? bones.obstacle.dc : 13;
    if (!bones.theme?.spine) throw new Error("ForgeBones must carry an authoritative theme spine.");
    const title = titleCase(bones.hook.type) + " at the " + titleCase(destination);

    const scenes = [
      { id: "scene-hook", title: "The ask at the " + origin, purpose: "Hook and quest source", pacingClass: "core", estimatedMinutes: 20, locationId: "loc-origin", exits: ["scene-travel"] },
      { id: "scene-travel", title: "Road through " + bones.travel.environment, purpose: "Travel pressure", pacingClass: "core", estimatedMinutes: 25, locationId: "loc-road", exits: ["scene-encounter-1", "scene-obstacle"] },
      { id: "scene-encounter-1", title: "First roadside encounter", purpose: "Optional unrelated encounter", pacingClass: "optional", estimatedMinutes: 20, locationId: "loc-road", exits: ["scene-obstacle"] },
      { id: "scene-obstacle", title: "The " + bones.obstacle.kind, purpose: "Fail-forward obstacle", pacingClass: "core", estimatedMinutes: 25, locationId: "loc-entrance", exits: ["scene-middle"] },
      { id: "scene-middle", title: "Evidence in the " + destination, purpose: "Doubt the simple story", pacingClass: "core", estimatedMinutes: 25, locationId: "loc-middle", exits: ["scene-encounter-2", "scene-inner"] },
      { id: "scene-encounter-2", title: "Second side encounter", purpose: "Optional unrelated encounter", pacingClass: "optional", estimatedMinutes: 20, locationId: "loc-middle", exits: ["scene-inner"] },
      { id: "scene-inner", title: "The actual truth", purpose: "Deliver the twist and prepare the finale", pacingClass: "core", estimatedMinutes: 25, locationId: "loc-inner", exits: ["scene-finale"] },
      { id: "scene-finale", title: "Finale: " + bones.finale.kind, purpose: "Resolve the quest problem", pacingClass: "core", estimatedMinutes: 30, locationId: "loc-finale", exits: ["scene-end-return", "scene-end-other"] },
      { id: "scene-end-return", title: "Return and confront the story", purpose: "Aftermath if the party goes back", pacingClass: "core", estimatedMinutes: 15, locationId: "loc-origin", exits: [] },
      { id: "scene-end-other", title: "Leave with the consequence", purpose: "Aftermath if the party does not return", pacingClass: "core", estimatedMinutes: 15, locationId: "loc-finale", exits: [] }
    ];

    const read = {
      "scene-hook": `The party is at the ${origin}. ${giverName} wants them to act before the problem at the ${destination} spreads. The ask is public enough that refusing it still leaves a record.`,
      "scene-travel": `The way runs through ${bones.travel.environment}. ${titleCase(bones.travel.pressure)} slows anyone who treats the road as empty.`,
      "scene-encounter-1": bones.randomEncounters[0].prompt + " Skipping it costs nothing required.",
      "scene-obstacle": bones.obstacle.mechanic + " The check is DC " + dc + ".",
      "scene-middle": `Marks, a pinned note, and a damaged mechanism disagree with the story told at the start. Keep the evidence tied to ${bones.theme.motifs.join(", ")}.`,
      "scene-encounter-2": bones.randomEncounters[1].prompt + " It is not the only copy of any required fact.",
      "scene-inner": bones.twist.actualTruth + " This changes what the original job means without replacing it with a new story. The party can still finish either way.",
      "scene-finale": `The problem is ${bones.finale.subject}. Objective: ${bones.finale.objective}. Noncombat path: ${bones.finale.noncombatResolution}.`,
      "scene-end-return": bones.aftermath.consequence,
      "scene-end-other": "The party keeps the consequence and does not report back. The original hook is still settled."
    };

    for (const scene of scenes) {
      scene.readAloud = read[scene.id];
      scene.gmNotes = [
        "Bones are authoritative. Do not invent a new required fact.",
        scene.id === "scene-obstacle" ? bones.obstacle.failForward : "Failure costs time, position, or a resource and play continues.",
        scene.id === "scene-finale" ? "If they do nothing: " + bones.finale.failure : "Exits are the only legal next scenes."
      ];
      scene.npcIds = scene.id === "scene-hook" || scene.id === "scene-end-return" ? ["npc-giver"] : scene.id === "scene-finale" ? ["npc-subject"] : [];
      scene.encounterIds = scene.id === "scene-encounter-1" ? ["enc-1"] : scene.id === "scene-encounter-2" ? ["enc-2"] : scene.id === "scene-finale" ? ["enc-finale"] : [];
      scene.clueIds = scene.id === "scene-hook" ? ["clue-truth"] : scene.id === "scene-middle" || scene.id === "scene-inner" ? ["clue-truth"] : [];
      scene.entryConditions = [];
    }

    const clueSources = [
      giverName + " testimony at the " + origin,
      "pinned note and record at the " + destination,
      "tracks and damaged mechanism on the inner approach"
    ];

    const pkg = {
      schemaVersion: "0.1.0",
      metadata: {
        id, title, systemCompatibility: "5e-compatible original", partyLevel: level, partySize,
        durationMinutes, tone, seed: bones.seed, origin: "forge-bones", status: "bones-valid",
        themeId: bones.theme.id, themeSpine: bones.theme.spine
      },
      setup: {
        pitch: `From the ${origin}, ${giverName} asks the party to ${bones.hook.objective} The destination is the ${destination}. Theme: ${bones.theme.spine}`,
        gmSummary: `Theme: ${bones.theme.spine} Apparent: ${bones.twist.apparentTruth} Actual: ${bones.twist.actualTruth} Motive: ${bones.questGiver.motive}.`
      },
      quest: {
        type: bones.hook.type,
        objective: bones.hook.objective,
        stakes: bones.finale.failure,
        deadline: null,
        successConditions: [bones.finale.objective, "Acknowledge the original hook in the aftermath"],
        failureConditions: [bones.finale.failure]
      },
      truth: {
        facts: [
          { id: "fact-origin", text: "The party starts at the " + origin + "." },
          { id: "fact-destination", text: "The quest target is the " + destination + "." },
          { id: "fact-apparent", text: bones.twist.apparentTruth }
        ],
        secrets: [{ id: "secret-truth", text: bones.twist.actualTruth, revealCondition: "Reach the inner location or read the physical record." }]
      },
      npcs: [
        {
          id: "npc-giver", name: giverName, role: giverRole, personality: ["urgent"], voiceCues: ["Short sentences. Repeats the public story."],
          wants: [bones.questGiver.motive], fears: ["the public story collapsing"],
          knows: [bones.twist.apparentTruth], believes: [bones.twist.apparentTruth],
          secrets: [bones.questGiver.motive], cannotKnow: ["later table choices"],
          questFunction: "Quest source. Not required to finish."
        },
        {
          id: "npc-subject", name: titleCase(bones.finale.kind + " subject"), role: bones.finale.kind,
          personality: ["cornered"], voiceCues: ["States the noncombat terms once, plainly."],
          wants: [bones.finale.objective], fears: [bones.finale.failure],
          knows: [bones.twist.actualTruth], believes: [bones.twist.apparentTruth],
          secrets: [bones.finale.noncombatResolution], cannotKnow: ["the party's private plans"],
          questFunction: "Finale subject. Combat is not mandatory."
        }
      ],
      locations: [
        { id: "loc-origin", name: titleCase(origin), description: "Starting situation.", connections: ["loc-road"] },
        { id: "loc-road", name: titleCase(bones.travel.environment), description: bones.travel.pressure, connections: ["loc-entrance"] },
        { id: "loc-entrance", name: "Entrance", description: bones.locationProgression[0].job, connections: ["loc-middle"] },
        { id: "loc-middle", name: "Middle", description: bones.locationProgression[1].job, connections: ["loc-inner"] },
        { id: "loc-inner", name: "Inner", description: bones.locationProgression[2]?.job || "Deliver the truth.", connections: ["loc-finale"] },
        { id: "loc-finale", name: "Finale", description: bones.finale.subject, connections: [] }
      ],
      scenes,
      clues: [{ id: "clue-truth", revelation: bones.twist.actualTruth, required: true, sources: clueSources, canMove: true, allowEarlyDiscovery: true }],
      encounters: [
        { id: "enc-1", type: bones.randomEncounters[0].kind, name: "Encounter 1", prompt: bones.randomEncounters[0].prompt, questRelated: false, talkOut: "They can be left, paid, or talked past. Retreat is valid." },
        { id: "enc-2", type: bones.randomEncounters[1].kind, name: "Encounter 2", prompt: bones.randomEncounters[1].prompt, questRelated: false, talkOut: "Skipping this encounter does not remove a required clue." },
        { id: "enc-finale", type: bones.finale.kind, name: "Finale", prompt: bones.finale.subject, talkOut: bones.finale.noncombatResolution }
      ],
      puzzles: bones.obstacle.kind.includes("puzzle") ? [{ id: "puzzle-main", prompt: bones.obstacle.mechanic, solution: "Use the three environmental clues in the order the record shows.", failForward: bones.obstacle.failForward, dc }] : [],
      traps: bones.obstacle.kind.includes("trap") ? [{ id: "trap-main", trigger: bones.obstacle.mechanic, effect: "DC " + dc + " or lose time and a resource. " + bones.obstacle.failForward }] : [],
      items: [],
      maps: [{
        id: "map-main", name: titleCase(destination), asset: null,
        regions: [
          { id: "reg-entrance", name: "Entrance", sceneId: "scene-obstacle" },
          { id: "reg-middle", name: "Middle", sceneId: "scene-middle" },
          { id: "reg-inner", name: "Inner", sceneId: "scene-inner" },
          { id: "reg-finale", name: "Finale", sceneId: "scene-finale" }
        ]
      }],
      events: [],
      recovery: {
        policies: ["Failure moves play forward.", "No single NPC is required.", "Ending is never locked."],
        routes: [
          { id: "rec-giver", trigger: "Quest giver is dead, missing, or refuses", response: "The pinned note and record at the destination still state the objective.", stateChanges: ["giver-unavailable"] },
          { id: "rec-attack", trigger: "The finale subject is attacked before explaining", response: "Tracks and the damaged mechanism still show the truth. Noncombat terms remain available if anyone survives.", stateChanges: ["subject-hostile"] },
          { id: "rec-skip", trigger: "The party skips or bypasses the obstacle scene", response: "A slower route opens. DC pressure and a resource cost apply. They still finish.", stateChanges: ["obstacle-bypassed"] }
        ]
      },
      pacing: {
        targetMinutes: durationMinutes,
        cutOrder: ["scene-encounter-1", "scene-encounter-2"],
        optionalOrder: ["scene-encounter-1", "scene-encounter-2"]
      },
      endings: [
        { id: "end-return", title: "Return", text: bones.aftermath.consequence },
        { id: "end-other", title: "Do not return", text: "The hook is resolved without reporting back. Consequence stays with the party." }
      ],
      initialState: {
        questStage: "hook", currentSceneId: "scene-hook", discoveredClueIds: [], revealedSecretIds: [],
        npcState: {}, locationState: {}, itemState: {}, eventState: {}, sceneHistory: ["scene-hook"]
      },
      themeContract: {
        id: bones.theme.id,
        spine: bones.theme.spine,
        motifs: [...bones.theme.motifs],
        rule: "Required scenes must reinforce or reframe this theme; do not introduce an unrelated second adventure."
      },
      pathPressure: {
        principle: "Pay the prepared table, tax the rush, never lock the ending. They still finish.",
        prepared: ["The note gives the obstacle order.", "The inner record names the noncombat terms."],
        rushed: ["Bypass costs a resource.", "Attacking early makes the subject hostile."]
      },
      flowContract: {
        allowedBranchScenes: ["scene-finale"],
        terminalScenes: ["scene-end-return", "scene-end-other"]
      },
      quickrun: {
        adventureId: id,
        target: { level, partySize },
        encounters: [
          { id: "enc-1", objective: "Get past the roadside encounter", start: bones.randomEncounters[0].prompt, end: "Leave, bargain, or drive it off.", creatures: bones.randomEncounters[0].kind === "combat" ? [{ name: "Road predator", ac: 12 + Math.floor(level / 4), hp: 8 + level * 3, tactics: "Tests once, then retreats." }] : [] },
          { id: "enc-2", objective: "Get past the second encounter", start: bones.randomEncounters[1].prompt, end: "Leave it behind.", creatures: bones.randomEncounters[1].kind === "combat" ? [{ name: "Second predator", ac: 12 + Math.floor(level / 4), hp: 8 + level * 3, tactics: "Breaks off if hurt." }] : [] },
          { id: "enc-finale", objective: bones.finale.objective, start: bones.finale.subject, end: bones.finale.noncombatResolution, creatures: bones.finale.kind === "monster" ? [{ name: "Finale creature", ac: 13 + Math.floor(level / 3), hp: 16 + level * 6, tactics: "Guards the objective. Flees if its need is met." }] : [] }
        ],
        checks: [{ id: "check-obstacle", sceneId: "scene-obstacle", label: bones.obstacle.kind + " check", dc }],
        hazards: [],
        mapNotes: [{ sceneId: "scene-finale", text: "Finale space is one open area with a slower side route." }],
        requiredCheckIds: ["check-obstacle"],
        rewards: [{ id: "reward-pay", name: "Local pay", text: "Coin or a favor from the starting place if they return." }]
      },
      forgeBones: JSON.parse(JSON.stringify(bones))
    };

    return pkg;
  }

  const api = { compileBones };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof globalThis !== "undefined") globalThis.ForgeCompile = api;
})();
