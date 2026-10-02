(() => {
  "use strict";

  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function compileBones(bones, options={}) {
    try {
      if (!bones || bones.version !== "0.1.0") throw new Error("ForgeBones 0.1.0 required.");
      if (!Array.isArray(bones.randomEncounters) || bones.randomEncounters.length !== 2) throw new Error("Exactly two random encounters required.");
      const level = Math.max(1, Number(options.level) || 4);
      const partySize = Math.max(1, Number(options.partySize) || 4);
      const durationMinutes = Math.max(60, (Number(options.durationHours) || 4) * 60);
      const id = "forge-bones-" + slug(bones.seed);
      const locationIds = bones.locationProgression.map((_, i) => "loc-" + (i + 1));
      const locations = bones.locationProgression.map((step, i) => ({
        id:locationIds[i], name:step.role, description:step.job,
        connections:[locationIds[i - 1], locationIds[i + 1]].filter(Boolean)
      }));
      const requiredFacts = [
        {id:"fact-destination",text:"The objective leads from " + bones.preview.origin + " to " + bones.preview.destination + "."},
        {id:"fact-truth",text:bones.twist.actualTruth},
        {id:"fact-finale",text:"The finale requires the party to " + bones.finale.objective + "."}
      ];
      const clues = requiredFacts.map((fact, i) => ({
        id:"clue-" + (i + 1), revelation:fact.text, required:true,
        sources:["quest-source testimony","physical evidence at " + bones.preview.destination,"independent evidence in the main location"],
        canMove:true, allowEarlyDiscovery:true
      }));
      const scenes = [
        {id:"scene-hook",title:"Starting Situation",purpose:"Establish origin, destination, quest, and apparent truth.",pacingClass:"core",estimatedMinutes:15,locationId:null,readAloud:"From " + bones.preview.origin + ", the road points toward " + bones.preview.destination + ". " + bones.hook.objective,gmNotes:["Quest source: " + bones.questGiver.role + ".","Apparent truth: " + bones.twist.apparentTruth],npcIds:["npc-giver"],encounterIds:[],clueIds:["clue-1"],entryConditions:[],exits:["scene-random-1","scene-obstacle"]},
        {id:"scene-random-1",title:"Road Encounter",purpose:"Add optional travel pressure without carrying required information.",pacingClass:"cut-first",estimatedMinutes:15,locationId:null,readAloud:bones.randomEncounters[0].prompt,gmNotes:["Type: " + bones.randomEncounters[0].kind + "."],npcIds:[],encounterIds:["enc-random-1"],clueIds:[],entryConditions:[],exits:["scene-obstacle"]},
        {id:"scene-obstacle",title:"Structured Obstacle",purpose:"Gate progress with failure that still moves play forward.",pacingClass:"core",estimatedMinutes:20,locationId:locationIds[0],readAloud:bones.obstacle.mechanic,gmNotes:["DC: " + (bones.obstacle.dc ?? "none") + ".","Fail forward: " + bones.obstacle.failForward],npcIds:[],encounterIds:[],clueIds:[],entryConditions:[],exits:["scene-progress-1"]},
        ...bones.locationProgression.map((step, i) => ({id:"scene-progress-" + (i + 1),title:step.role,purpose:step.job,pacingClass:"core",estimatedMinutes:20,locationId:locationIds[i],readAloud:"The " + step.role + " changes what the party understands about the site.",gmNotes:[step.job,i===1?"Reveal: " + bones.twist.actualTruth:"Preserve the established ForgeBones truth."],npcIds:[],encounterIds:[],clueIds:i===1?["clue-2"]:[],entryConditions:[],exits:[i < bones.locationProgression.length - 1 ? "scene-progress-" + (i + 2) : "scene-finale"]})),
        {id:"scene-finale",title:"Finale",purpose:"Resolve the authoritative finale without requiring combat.",pacingClass:"core",estimatedMinutes:40,locationId:locationIds.at(-1),readAloud:"The final problem is " + bones.finale.subject + ". The party must " + bones.finale.objective + ".",gmNotes:["Noncombat resolution: " + bones.finale.noncombatResolution,"Failure: " + bones.finale.failure],npcIds:[],encounterIds:[],clueIds:["clue-3"],entryConditions:[],exits:["scene-random-2","scene-aftermath"]},
        {id:"scene-random-2",title:"Aftershock Encounter",purpose:"Optional encounter at a legal late insertion point.",pacingClass:"cut-first",estimatedMinutes:15,locationId:null,readAloud:bones.randomEncounters[1].prompt,gmNotes:["Type: " + bones.randomEncounters[1].kind + "."],npcIds:[],encounterIds:["enc-random-2"],clueIds:[],entryConditions:[],exits:["scene-aftermath"]},
        {id:"scene-aftermath",title:"Aftermath",purpose:"Acknowledge the original hook and persistent consequence.",pacingClass:"core",estimatedMinutes:15,locationId:null,readAloud:bones.aftermath.consequence,gmNotes:["Original objective: " + bones.hook.objective],npcIds:["npc-giver"],encounterIds:[],clueIds:[],entryConditions:[],exits:[]}
      ];
      return {
        schemaVersion:"0.1.0",
        metadata:{id,title:"Forge: " + bones.preview.destination,systemCompatibility:"5E-compatible fantasy RPG",partyLevel:level,partySize,durationMinutes,tone:["generated fantasy"],seed:bones.seed,source:"ForgeBones"},
        setup:{pitch:bones.hook.objective,openingLocation:bones.preview.origin,gmSummary:bones.twist.apparentTruth + " Truth: " + bones.twist.actualTruth,generated:true},
        quest:{type:bones.hook.type,objective:bones.hook.objective,stakes:bones.finale.failure,deadline:null,successConditions:[bones.finale.objective],failureConditions:[bones.finale.failure]},
        truth:{facts:requiredFacts,secrets:[{id:"secret-twist",text:bones.twist.actualTruth,revealCondition:"Discover any valid truth clue source."}]},
        npcs:[{id:"npc-giver",name:bones.questGiver.role,role:"quest source",wants:[bones.questGiver.motive],knows:[bones.twist.apparentTruth],believes:[bones.twist.apparentTruth],secrets:[],cannotKnow:[bones.twist.actualTruth],questFunction:"Provides the objective without being a single point of failure."}],
        locations,scenes,clues,
        encounters:bones.randomEncounters.map((enc,i)=>({id:"enc-random-" + (i + 1),name:"Random Encounter " + (i + 1),type:enc.kind,summary:enc.prompt,questRelated:enc.questRelated,resolution:"Resolve without changing authoritative ForgeBones facts."})),
        puzzles:bones.obstacle.kind.includes("puzzle")?[{id:"puzzle-main",name:"Forge obstacle",prompt:bones.obstacle.mechanic,solution:"Use the established environmental logic.",failForward:bones.obstacle.failForward,dc:bones.obstacle.dc}]:[],
        traps:bones.obstacle.kind.includes("trap")?[{id:"trap-main",name:"Forge obstacle",trigger:bones.obstacle.mechanic,dc:bones.obstacle.dc,failForward:bones.obstacle.failForward}]:[],
        items:[],maps:[],events:[],
        recovery:{policies:["Required facts remain available through three independent sources.","Failure changes cost or position, never access to the ending."],routes:[
          {id:"recover-giver",trigger:"Quest source is unavailable or distrusted.",response:"Physical evidence and an independent site source still establish the destination.",stateChanges:["Discover clue-1."],patch:{discoverClueIds:["clue-1"]}},
          {id:"recover-obstacle",trigger:"Obstacle is failed or bypassed.",response:bones.obstacle.failForward,stateChanges:["Continue to the first progression scene."]},
          {id:"recover-finale",trigger:"The party refuses combat or attacks the apparent threat immediately.",response:"Keep the noncombat route visible: " + bones.finale.noncombatResolution,stateChanges:["Preserve access to the finale objective."]}
        ]},
        pacing:{targetMinutes:durationMinutes,cutOrder:["scene-random-2","scene-random-1"],optionalOrder:["scene-random-1","scene-random-2"]},
        endings:[{id:"ending-success",name:"Objective Resolved",condition:bones.finale.objective,result:bones.aftermath.consequence},{id:"ending-costly",name:"Costly Failure",condition:bones.finale.failure,result:"The hook remains acknowledged, but the failure consequence becomes persistent."}],
        initialState:{questStage:"offered",currentSceneId:"scene-hook",discoveredClueIds:[],revealedSecretIds:[],npcState:{"npc-giver":{status:"available"}},locationState:Object.fromEntries(locationIds.map(id=>[id,{revealed:false}])),itemState:{},eventState:{}}
      };
    } catch (error) {
      console.error("ForgeBones package compilation failed.", error);
      throw error;
    }
  }

  const api={compileBones};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (typeof globalThis!=="undefined") globalThis.ForgeCompiler=api;
})();