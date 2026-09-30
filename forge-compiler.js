(() => {
  "use strict";

  const text = (value) => String(value ?? "").trim();
  const slug = (value) => text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function requireBones(bones) {
    if (!bones || bones.version !== "0.1.0") throw new Error("ForgeBones 0.1.0 is required");
    for (const key of ["preview","hook","questGiver","twist","requiredFacts","requiredClues","obstacle","travel","locationProgression","finale","aftermath","randomEncounters"]) {
      if (bones[key] == null) throw new Error(`ForgeBones missing ${key}`);
    }
    if (bones.randomEncounters.length !== 2) throw new Error("ForgeBones must contain exactly two random encounters");
  }

  function makeScene(id, title, purpose, locationId, minutes, exits, extras={}) {
    return {
      id, title, purpose, pacingClass: extras.pacingClass || "core",
      estimatedMinutes: minutes, locationId, readAloud: "",
      gmNotes: extras.gmNotes || ["Presentation pending; preserve Forge-owned purpose, mechanics, and consequences."],
      npcIds: extras.npcIds || [], encounterIds: extras.encounterIds || [],
      clueIds: extras.clueIds || [], entryConditions: [], exits
    };
  }

  function compileBones(bones, options={}) {
    try {
      requireBones(bones);
      const id = options.id || `forged-${slug(bones.seed)}`;
      const title = options.title || `Forge ${bones.seed}: ${bones.hook.type} at the ${bones.preview.destination}`;
      const clueIds = bones.requiredClues.map((bundle, index) => `clue-${index + 1}`);
      const encounters = bones.randomEncounters.map((encounter, index) => ({
        id:`enc-random-${index + 1}`, type:encounter.kind, prompt:encounter.prompt,
        questRelated:encounter.questRelated,
        talkOut:"Avoid, bargain, retreat, or resolve without lethal combat when fiction permits."
      }));
      const locations = [
        {id:"loc-origin",name:bones.preview.origin,description:"Presentation pending.",connections:["loc-travel"]},
        {id:"loc-travel",name:bones.travel.environment,description:"Presentation pending.",connections:["loc-main"]},
        {id:"loc-main",name:bones.preview.destination,description:"Presentation pending.",connections:[]}
      ];
      const clues = bones.requiredClues.map((bundle, index) => ({
        id:clueIds[index],
        revelation:bones.requiredFacts.find((fact) => fact.id === bundle.factId)?.text || bundle.factId,
        required:true,
        sources:bundle.sources.map((source) => `${source.kind}: ${source.delivery}`),
        canMove:true, allowEarlyDiscovery:true
      }));
      const scenes = [
        makeScene("scene-preview","Starting Situation",`Travel from ${bones.preview.origin} toward ${bones.preview.destination}.`,"loc-origin",10,["scene-hook"]),
        makeScene("scene-hook","Hook",bones.hook.objective,"loc-origin",15,["scene-travel"],{npcIds:["npc-giver"]}),
        makeScene("scene-travel","Travel",`${bones.travel.environment}: ${bones.travel.pressure}`,"loc-travel",20,["scene-random-1"]),
        makeScene("scene-random-1","Random Encounter 1",bones.randomEncounters[0].prompt,"loc-travel",10,["scene-obstacle"],{pacingClass:"optional",encounterIds:["enc-random-1"]}),
        makeScene("scene-obstacle","Obstacle",bones.obstacle.mechanic,"loc-main",20,["scene-location-1"],{gmNotes:[`DC ${bones.obstacle.dc ?? "—"}: ${bones.obstacle.mechanic}`,`Fail forward: ${bones.obstacle.failForward}`]}),
        makeScene("scene-location-1","Main Location: Entrance",bones.locationProgression[0]?.job || "Establish the location.","loc-main",20,["scene-random-2"]),
        makeScene("scene-random-2","Random Encounter 2",bones.randomEncounters[1].prompt,"loc-main",10,["scene-location-2"],{pacingClass:"optional",encounterIds:["enc-random-2"]}),
        makeScene("scene-location-2","Main Location: Revelation",bones.locationProgression[1]?.job || "Reveal required evidence.","loc-main",25,["scene-location-3"],{clueIds}),
        makeScene("scene-location-3","Main Location: Preparation",bones.locationProgression[2]?.job || "Prepare for the finale.","loc-main",25,["scene-finale"],{clueIds}),
        makeScene("scene-finale","Finale",bones.finale.objective,"loc-main",55,["scene-aftermath"],{gmNotes:[`Finale type: ${bones.finale.kind} / ${bones.finale.subject}`,`Legal noncombat resolution: ${bones.finale.noncombatResolution}`,`Failure: ${bones.finale.failure}`]}),
        makeScene("scene-aftermath","Aftermath",bones.aftermath.consequence,"loc-origin",15,[])
      ];
      const obstacleBase = {id:"obstacle-1",sceneId:"scene-obstacle",failForward:bones.obstacle.failForward};
      return {
        schemaVersion:"0.1.0",
        metadata:{id,title,systemCompatibility:"5E-compatible fantasy RPG",partyLevel:options.partyLevel || 4,partySize:options.partySize || 4,durationMinutes:225,tone:["generated","zero-prep"]},
        setup:{pitch:`${bones.hook.objective} Destination: ${bones.preview.destination}.`,gmSummary:"ForgeBones compiled. Presentation/read-aloud is intentionally pending AI flesh.",background:`Apparent truth: ${bones.twist.apparentTruth} Actual truth: ${bones.twist.actualTruth}`,fleshStatus:"pending"},
        quest:{type:bones.hook.type,objective:bones.hook.objective,stakes:bones.finale.failure,deadline:null,successConditions:[bones.finale.objective],failureConditions:[bones.finale.failure]},
        truth:{facts:bones.requiredFacts.map((fact) => ({...fact})),secrets:[]},
        npcs:[{id:"npc-giver",name:`Unnamed ${bones.questGiver.role}`,role:bones.questGiver.role,personality:[],voiceCues:["AI flesh may add a voice cue without changing motive."],wants:[bones.questGiver.motive],fears:[],knows:[],believes:[bones.twist.apparentTruth],secrets:[],lies:[],cannotKnow:[],questFunction:"Delivers the Forge-owned hook and motive."}],
        locations, scenes, clues, encounters,
        puzzles:bones.obstacle.kind.includes("puzzle") ? [{...obstacleBase,prompt:bones.obstacle.mechanic,solution:"Resolve using the Forge-owned mechanic.",failForward:bones.obstacle.failForward}] : [],
        traps:bones.obstacle.kind.includes("trap") ? [{...obstacleBase,trigger:bones.obstacle.mechanic,effect:`DC ${bones.obstacle.dc ?? "—"}; consequence applies once.`,failForward:bones.obstacle.failForward}] : [],
        items:[],
        maps:[{id:"map-main",name:`${bones.preview.destination} flow map`,asset:null,regions:scenes.map((scene) => ({id:`region-${scene.id}`,sceneId:scene.id,label:scene.title}))}],
        events:[],
        recovery:{policies:["Required progression always fails forward."],routes:[
          {id:"recover-giver",trigger:"Quest giver is unavailable, missing, dead, or refuses.",response:"Deliver the same Forge-owned hook through circumstance or record.",stateChanges:[]},
          {id:"recover-hostile",trigger:"The apparent antagonist is attacked or becomes hostile early.",response:"Move required evidence to independent physical/record sources.",stateChanges:[]},
          {id:"recover-skip",trigger:"Players skip or bypass a core scene.",response:"Move required clues forward and apply time/resource/position cost instead of blocking progress.",stateChanges:[]}
        ]},
        pacing:{targetMinutes:225,cutOrder:["scene-random-2","scene-random-1"],optionalOrder:["scene-random-1","scene-random-2"]},
        pathPressure:{principle:"Prepared play earns advantages; rushed play pays costs, but the ending is never locked.",prepared:["Gain cleaner clue context.","Enter the finale with better position."],rushed:["Lose time or resources.","Enter the finale with worse position."]},
        endings:[
          {id:"ending-noncombat",label:"Noncombat resolution",condition:bones.finale.noncombatResolution,consequence:bones.aftermath.consequence},
          {id:"ending-failure",label:"Failure consequence",condition:bones.finale.failure,consequence:bones.finale.failure}
        ],
        initialState:{questStage:"preview",currentSceneId:"scene-preview",discoveredClueIds:[],revealedSecretIds:[],npcState:{},locationState:{},itemState:{},eventState:{}}
      };
    } catch (error) {
      console.error("Forge compilation failed.", error);
      throw error;
    }
  }

  const api={compileBones};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (typeof globalThis!=="undefined") globalThis.ForgeCompiler=api;
})();
