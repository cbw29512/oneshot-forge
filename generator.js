(() => {
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const uid = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

  const names = [
    "Mara Venn","Brother Caldus","Tamsin Reed","Orin Vale","Sable Marr","Elian Thorn",
    "Nessa Crow","Darric Holt","Ilya Fen","Corvin Ash","Petra Moss","Rowan Pike",
    "Vela Hart","Toren Glass","Maeve Rook","Jonan Bell","Seren Kest","Bram Alder"
  ];

  const tones = {
    heroic: ["heroic", "classic fantasy"],
    mystery: ["mystery", "intrigue"],
    horror: ["dark fantasy", "horror"],
    weird: ["strange fantasy", "mystery"],
    random: null
  };

  const locations = [
    {
      key:"sunken-temple", name:"Sunken Temple", place:"the drowned temple of Saint Vey",
      approach:"a flooded causeway between leaning stone saints",
      entrance:"Collapsed Portico", middle:"Flooded Reliquary", inner:"Drowned Nave", final:"Tidal Sanctum",
      atmosphere:"salt water drips upward from the ceiling and old prayers echo below the surface",
      hazard:"rising black water", mapLabel:"Sunken Temple"
    },
    {
      key:"ruined-watchtower", name:"Ruined Watchtower", place:"Blackthorn Watch",
      approach:"a lightning-split road climbing a barren ridge",
      entrance:"Broken Gate", middle:"Signal Hall", inner:"Raven Stair", final:"Beacon Chamber",
      atmosphere:"every gust makes the cracked signal bells answer one another",
      hazard:"unstable masonry", mapLabel:"Blackthorn Watch"
    },
    {
      key:"haunted-mine", name:"Haunted Mine", place:"the sealed Gloamvein Mine",
      approach:"an abandoned ore road beneath dead pines",
      entrance:"Foreman's Yard", middle:"Collapsed Gallery", inner:"Old Lift", final:"Deep Vein",
      atmosphere:"pick strikes sound from tunnels no living miner occupies",
      hazard:"cave-ins and bad air", mapLabel:"Gloamvein Mine"
    },
    {
      key:"moon-marsh", name:"Moonlit Marsh", place:"the drowned ruins of Fenmere",
      approach:"a lantern path across silver reeds and black water",
      entrance:"Reed Gate", middle:"Sunk Chapel", inner:"Whispering Causeway", final:"Moon Pool",
      atmosphere:"reflections move a heartbeat before the things casting them",
      hazard:"sucking mud and false paths", mapLabel:"Fenmere"
    },
    {
      key:"abandoned-observatory", name:"Abandoned Observatory", place:"Starfall Observatory",
      approach:"a spiral road around a glassy crater",
      entrance:"Shattered Courtyard", middle:"Orrery Hall", inner:"Lens Vault", final:"Star Chamber",
      atmosphere:"the broken lenses show constellations that are not in the sky",
      hazard:"arcing star-light", mapLabel:"Starfall Observatory"
    },
    {
      key:"ash-monastery", name:"Ash Monastery", place:"the burned monastery of Cinderwake",
      approach:"a pilgrim stair buried in gray ash",
      entrance:"Charred Cloister", middle:"Ash Library", inner:"Bell Crypt", final:"Ember Chapel",
      atmosphere:"warm ash falls even though the fires died decades ago",
      hazard:"embers that flare around spoken lies", mapLabel:"Cinderwake"
    }
  ];

  const questTypes = [
    {
      key:"retrieve", label:"Retrieve",
      objective: ctx => `Recover the ${ctx.object} from ${ctx.location.place} before ${ctx.deadline}.`,
      opening: ctx => `${ctx.giver.name} asks the party to recover the stolen ${ctx.object}. The last reliable trail leads toward ${ctx.location.place}.`,
      truth: ctx => `The ${ctx.object} is not merely valuable; it is tied to the danger inside ${ctx.location.place}.`
    },
    {
      key:"rescue", label:"Rescue",
      objective: ctx => `Find and rescue ${ctx.missingName} from ${ctx.location.place} before ${ctx.deadline}.`,
      opening: ctx => `${ctx.giver.name} says ${ctx.missingName} vanished while investigating ${ctx.location.place}.`,
      truth: ctx => `${ctx.missingName} entered willingly after learning that the threat at ${ctx.location.place} was about to worsen.`
    },
    {
      key:"break-curse", label:"Break Curse",
      objective: ctx => `Break the curse centered on ${ctx.location.place} before ${ctx.deadline}.`,
      opening: ctx => `People near ${ctx.giver.name}'s home have begun suffering the same impossible symptom: ${ctx.symptom}. The source points to ${ctx.location.place}.`,
      truth: ctx => `The curse is a containment mechanism that is failing, not a simple hostile spell.`
    },
    {
      key:"hunt", label:"Hunt",
      objective: ctx => `Track the creature called the ${ctx.monsterTitle} to ${ctx.location.place} and stop its attacks before ${ctx.deadline}.`,
      opening: ctx => `${ctx.giver.name} offers a reward for the ${ctx.monsterTitle}, blamed for three recent attacks.`,
      truth: ctx => `The ${ctx.monsterTitle} is reacting to a deeper threat inside ${ctx.location.place}; killing it alone will not solve the crisis.`
    },
    {
      key:"investigate", label:"Investigate",
      objective: ctx => `Discover what happened at ${ctx.location.place} and prevent a second disaster before ${ctx.deadline}.`,
      opening: ctx => `${ctx.giver.name} has received contradictory reports from ${ctx.location.place}: lights, missing scouts, and messages in familiar handwriting from people who are already dead.`,
      truth: ctx => `Someone inside ${ctx.location.place} is deliberately feeding outsiders a false explanation.`
    },
    {
      key:"defend", label:"Defend",
      objective: ctx => `Stop the threat emerging from ${ctx.location.place} before it reaches the settlement at ${ctx.deadline}.`,
      opening: ctx => `${ctx.giver.name} has proof that something is moving from ${ctx.location.place} toward inhabited land.`,
      truth: ctx => `The coming attack is a symptom of a failing ward inside ${ctx.location.place}.`
    }
  ];

  const objects = ["Ashen Crown","Glass Key","Saint's Lantern","Moon-Silver Bell","Ivory Compass","Ember Seal","Mirror of Names","Stormglass Idol"];
  const symptoms = ["people forgetting the last hour", "shadows speaking before their owners", "sleepers waking with river mud on their feet", "names vanishing from written records", "bells ringing where no bells remain"];
  const monsterTitles = ["Hollow Stag","White Maw","Bell-Witch","Ash Hound","Glass Serpent","Mire Walker"];
  const deadlines = ["moonrise","the third bell after sunset","midnight","the coming storm reaches the valley","the old ward burns out"];
  const factions = ["a desperate scholar","a disgraced knight","a hedge-priest","a smuggler captain","a village healer","a former cultist"];
  const motives = [
    "replace a failing ward before anyone realizes how weak it has become",
    "free someone trapped by the old bargain",
    "destroy the source of a curse even if doing so releases what it contains",
    "hide proof of an old crime while genuinely trying to save innocent people",
    "seize control of the threat so it can never be used against them again"
  ];
  const twists = [
    "The apparent villain is trying to prevent the larger disaster.",
    "The quest giver concealed the true purpose of the objective.",
    "The monster the party was sent to kill is actually guarding the safest route.",
    "The missing victim entered the site voluntarily and refuses a simple rescue.",
    "Destroying the cursed object solves one problem but releases the thing it was containing.",
    "A rival group has the same goal but believes the party is working for the enemy."
  ];
  const complications = [
    "a rival adventuring party arrives with incomplete information",
    "a frightened survivor mistakes the party for the enemy",
    "the route closes behind the party",
    "the threat begins affecting recent memories",
    "an ally is exposed as having lied about one crucial detail",
    "the site itself changes when someone tells a deliberate lie"
  ];
  const puzzles = [
    {name:"Four Signs Lock", prompt:"Four symbols show dawn, noon, dusk, and midnight.", solution:"Activate them in chronological order.", fail:"A wrong attempt triggers a harmless warning and reveals one correct position."},
    {name:"Weight of Names", prompt:"Three stone figures hold empty nameplates and a fourth is faceless.", solution:"Match the names found in nearby epitaphs; the faceless figure receives the missing name.", fail:"A wrong name awakens one guardian, but the door remains solvable."},
    {name:"Echo Bell", prompt:"Three bells answer with high, middle, and low tones. An inscription says: 'Begin where endings kneel.'", solution:"Ring low, middle, high.", fail:"Wrong sequences produce a supernatural pulse but also reveal the next correct tone."},
    {name:"Broken Constellation", prompt:"Rotating brass stars can recreate one of three constellations.", solution:"Build the constellation shown repeatedly in the approach clues.", fail:"The mechanism resets and briefly projects the correct first two stars."}
  ];

  const encounterSeeds = [
    ["Gravebound Sentinels","combat or bypass","medium","Old guardians attack anyone crossing the marked boundary, but can be bypassed by respecting the original ward."],
    ["Panicked Survivors","social / hazard","low","Confused survivors carry one useful clue but may flee if threatened."],
    ["Rival Seekers","social or combat","medium","A rival group has the same broad goal and can become enemies, allies, or a source of misinformation."],
    ["Warped Beasts","combat","medium","Local creatures have been altered by the site's failing magic and retreat if the magical pressure is relieved."],
    ["Living Ward","hazard / puzzle","medium","A protective ward treats the party as intruders until they identify its original purpose."],
    ["Bound Guardian","combat or negotiation","hard","A powerful guardian can be fought, tricked, or convinced the party intends to repair what is failing."]
  ];

  function makeNpc(name, role, knows, secrets, wants, extra={}) {
    return {
      id:"npc-"+slug(name)+"-"+Math.random().toString(36).slice(2,5),
      identityKey:slug(name),
      name, role,
      personality: extra.personality || [pick(["measured","blunt","warm","nervous","dry","formal"]), pick(["protective","ambitious","curious","guilt-ridden","stubborn"])],
      voiceCues: extra.voiceCues || ["answers direct questions directly unless a listed secret is involved"],
      wants: Array.isArray(wants) ? wants : [wants],
      fears: extra.fears || ["the crisis becoming public before it is contained"],
      knows,
      believes: extra.believes || [],
      secrets,
      lies: extra.lies || [],
      cannotKnow: extra.cannotKnow || ["events the NPC did not witness", "facts explicitly reserved for another character"],
      revealRules: extra.revealRules || [],
      questFunction: extra.questFunction || role
    };
  }

  function generate(options={}) {
    const level = Math.max(1, Math.min(20, Number(options.level) || 4));
    const partySize = Math.max(2, Math.min(8, Number(options.partySize) || 4));
    const durationHours = [2,3,4,6].includes(Number(options.durationHours)) ? Number(options.durationHours) : 4;
    const durationMinutes = durationHours * 60;
    const toneKey = options.tone && tones[options.tone] !== undefined ? options.tone : "random";
    const tone = toneKey === "random" ? pick(Object.entries(tones).filter(([k])=>k!=="random"))[1] : tones[toneKey];

    const location = pick(locations);
    const quest = pick(questTypes);
    const object = pick(objects);
    const deadline = pick(deadlines);
    const symptom = pick(symptoms);
    const monsterTitle = pick(monsterTitles);
    const twist = pick(twists);
    const complication = pick(complications);
    const puzzle = pick(puzzles);
    const antagonistKind = pick(factions);
    const antagonistMotive = pick(motives);
    const roster = [...names].sort(() => Math.random() - .5);
    const giverName = roster[0], witnessName = roster[1], antagonistName = roster[2], missingName = roster[3];

    const ctx = {
      location, quest, object, deadline, symptom, monsterTitle, twist, complication,
      antagonistKind, antagonistMotive, missingName,
      giver:{name:giverName}
    };

    const giver = makeNpc(
      giverName,
      "quest giver",
      [
        `The immediate problem is connected to ${location.place}.`,
        `The deadline is ${deadline}.`,
        "There is at least one route to the site."
      ],
      ["The quest giver knows one uncomfortable fact about the site's original purpose."],
      ["Get the party moving quickly", "Keep innocent people safe"],
      {
        lies:["Initially presents the crisis in the simplest possible terms."],
        questFunction:"Starts the quest and supplies the primary location clue."
      }
    );

    const witness = makeNpc(
      witnessName,
      "witness and alternate clue source",
      [
        `A secondary route reaches ${location.place}.`,
        `They saw evidence connected to the ${object}.`
      ],
      ["They followed the danger farther than they first admit."],
      ["Be taken seriously", "Learn what is actually happening"],
      {questFunction:"Backup delivery source when the party distrusts or loses the quest giver."}
    );

    const antagonist = makeNpc(
      antagonistName,
      `${antagonistKind}; apparent antagonist`,
      [
        quest.truth(ctx),
        `Their plan is to ${antagonistMotive}.`,
        `The final chamber is the ${location.final}.`
      ],
      [twist],
      ["Complete the plan before the deadline", "Prevent the worst possible outcome"],
      {
        personality:["exhausted","intense","certain they are the only person acting fast enough"],
        cannotKnow:["what the party did before arriving unless told", "the party's private intentions"],
        questFunction:"Carries the central twist and can become ally, enemy, or bargaining partner."
      }
    );

    const clueLocation = {
      id:"clue-location",
      revelation:`The crisis leads to ${location.place}.`,
      required:true,
      sources:[`${giver.name} gives the destination`, `${witness.name} confirms the route`, "physical tracks or magical residue point the same direction"],
      canMove:true, allowEarlyDiscovery:true
    };
    const clueTruth = {
      id:"clue-real-problem",
      revelation:quest.truth(ctx),
      required:true,
      sources:[`${antagonist.name} explains it`, "records in the inner site reveal it", "the final ward visibly demonstrates it"],
      canMove:true, allowEarlyDiscovery:true
    };
    const clueMotive = {
      id:"clue-antagonist-motive",
      revelation:`${antagonist.name} is trying to ${antagonistMotive}.`,
      required:true,
      sources:[`${antagonist.name} explains the plan`, "their notes show the plan", "the partially completed ritual or mechanism shows the intent"],
      canMove:true, allowEarlyDiscovery:true
    };
    const clueTwist = {
      id:"clue-twist",
      revelation:twist,
      required:false,
      sources:["contradictory evidence in the middle location", `${witness.name}'s account`, `${antagonist.name}'s explanation`],
      canMove:true, allowEarlyDiscovery:true
    };

    const e1 = pick(encounterSeeds);
    let e2 = pick(encounterSeeds);
    if (e2[0] === e1[0]) e2 = encounterSeeds[(encounterSeeds.indexOf(e1)+1)%encounterSeeds.length];
    const bossName = pick(["The Hollow Regent","The Pale Engine","The Nameless Choir","The Ash Warden","The Drowned Saint","The Starved Echo"]);

    const sceneIds = ["scene-hook","scene-journey","scene-entrance","scene-puzzle","scene-inner","scene-final","scene-resolution"];
    const locationsOut = [
      {id:"loc-settlement",name:"Starting Settlement",description:"The community threatened by the adventure's central problem.",connections:["loc-approach"]},
      {id:"loc-approach",name:"Approach",description:location.approach,connections:["loc-settlement","loc-entrance"]},
      {id:"loc-entrance",name:location.entrance,description:`The outer edge of ${location.place}; ${location.atmosphere}.`,connections:["loc-approach","loc-middle"]},
      {id:"loc-middle",name:location.middle,description:`A dangerous middle zone shaped by ${location.hazard}.`,connections:["loc-entrance","loc-inner"]},
      {id:"loc-inner",name:location.inner,description:"Evidence here makes the simple version of the quest impossible to believe.",connections:["loc-middle","loc-final"]},
      {id:"loc-final",name:location.final,description:"The crisis reaches its irreversible point here.",connections:["loc-inner"]}
    ];

    const scenes = [
      {
        id:sceneIds[0], title:"The Offer", purpose:"Establish the quest, stakes, and deadline.", pacingClass:"core",
        estimatedMinutes:durationHours===2?10:20, locationId:"loc-settlement",
        readAloud:`${quest.opening(ctx)} Around you, people are already reacting to the first signs that time is running out.`,
        gmNotes:[
          `Objective: ${quest.objective(ctx)}`,
          `Deadline: ${deadline}.`,
          `${giver.name} does not volunteer every uncomfortable detail.`
        ],
        npcIds:[giver.id,witness.id], encounterIds:[], clueIds:["clue-location"], entryConditions:[], exits:["scene-journey","scene-entrance"]
      },
      {
        id:sceneIds[1], title:"The Road Bites Back", purpose:"Show the threat outside the main location and provide a cuttable complication.", pacingClass:"cut-first",
        estimatedMinutes:durationHours===2?10:20, locationId:"loc-approach",
        readAloud:`The route to ${location.place} follows ${location.approach}. Before you reach the site, ${complication}.`,
        gmNotes:["This scene can be cut if time is short.","Its purpose is pressure and foreshadowing, not mandatory information."],
        npcIds:[], encounterIds:["enc-travel"], clueIds:[], entryConditions:[], exits:["scene-entrance"]
      },
      {
        id:sceneIds[2], title:location.entrance, purpose:"Present the first substantial obstacle with more than one solution.", pacingClass:"core",
        estimatedMinutes:durationHours===2?20:35, locationId:"loc-entrance",
        readAloud:`At ${location.entrance}, ${location.atmosphere}. Something here was built to keep intruders out — or something else in.`,
        gmNotes:[e1[3],"Allow bypass, negotiation, or clever use of the environment when plausible."],
        npcIds:[], encounterIds:["enc-entry"], clueIds:["clue-twist"], entryConditions:[], exits:["scene-puzzle"]
      },
      {
        id:sceneIds[3], title:puzzle.name, purpose:"Break up combat and make failure advance rather than stall the adventure.", pacingClass:durationHours===2?"cut-first":"core",
        estimatedMinutes:durationHours===2?10:25, locationId:"loc-middle",
        readAloud:`${puzzle.prompt} The mechanism is old, but recent marks show someone used it successfully.`,
        gmNotes:[`Solution: ${puzzle.solution}`,`Fail forward: ${puzzle.fail}`],
        npcIds:[], encounterIds:[], clueIds:[], entryConditions:[], exits:["scene-inner"]
      },
      {
        id:sceneIds[4], title:"The Story Changes", purpose:"Reveal the real problem and antagonist motive before the climax.", pacingClass:"core",
        estimatedMinutes:durationHours===2?20:35, locationId:"loc-inner",
        readAloud:`The evidence in ${location.inner} does not match the story that sent you here. Ahead, ${antagonist.name} is still working, and whatever they are doing is nearly finished.`,
        gmNotes:[
          `${antagonist.name} does not attack automatically.`,
          `Core truth: ${quest.truth(ctx)}`,
          `Motive: ${antagonistMotive}.`
        ],
        npcIds:[antagonist.id], encounterIds:["enc-inner"], clueIds:["clue-real-problem","clue-antagonist-motive"], entryConditions:[], exits:["scene-final"]
      },
      {
        id:sceneIds[5], title:`Finale: ${bossName}`, purpose:"Force a consequential final choice under pressure.", pacingClass:"core",
        estimatedMinutes:durationHours===2?35:55, locationId:"loc-final",
        readAloud:`The ${location.final} shudders as the last protection gives way. ${bossName} emerges into the chamber, and every incomplete choice in the adventure suddenly matters.`,
        gmNotes:[
          `Final threat: ${bossName}.`,
          "The party can fight, complete or disrupt the antagonist's plan, bargain, or combine approaches.",
          "Do not invalidate an early correct deduction or a clever bypass."
        ],
        npcIds:[antagonist.id], encounterIds:["enc-boss"], clueIds:[], entryConditions:[], exits:["scene-resolution"]
      },
      {
        id:sceneIds[6], title:"Aftermath", purpose:"Resolve the original quest and show the consequence of the party's choice.", pacingClass:"core",
        estimatedMinutes:10, locationId:"loc-settlement",
        readAloud:"By the time the danger passes, the original job sounds almost too simple compared with what actually happened. People wait to hear what you decided — and what it cost.",
        gmNotes:["Choose the ending matching the final state.","Return explicitly to the original objective, reward, and consequences."],
        npcIds:[giver.id,witness.id], encounterIds:[], clueIds:[], entryConditions:[], exits:[]
      }
    ];

    const encounters = [
      {id:"enc-travel",name:"Journey Complication",type:"social / hazard",difficulty:"low",summary:complication+".",resolution:"Resolve quickly; this scene is safe to cut."},
      {id:"enc-entry",name:e1[0],type:e1[1],difficulty:e1[2],summary:e1[3],resolution:"Multiple approaches should work if consistent with the fiction."},
      {id:"enc-inner",name:e2[0],type:e2[1],difficulty:e2[2],summary:e2[3],resolution:"Success should expose evidence about the real problem."},
      {id:"enc-boss",name:bossName,type:"boss / objective encounter",difficulty:"hard",summary:`${bossName} is the immediate physical threat while the larger objective remains active.`,resolution:"Victory can come from defeating the threat, completing a binding, destroying the source, bargaining, or a valid combination."}
    ];

    const mapRegions = [
      {id:"r-entry",label:location.entrance,sceneId:"scene-entrance",x:4,y:40,w:22,h:20},
      {id:"r-middle",label:location.middle,sceneId:"scene-puzzle",x:31,y:18,w:25,h:22},
      {id:"r-inner",label:location.inner,sceneId:"scene-inner",x:38,y:57,w:24,h:21},
      {id:"r-final",label:location.final,sceneId:"scene-final",x:70,y:37,w:26,h:27}
    ];

    const initialLocationState = {};
    for (const loc of locationsOut) initialLocationState[loc.id] = {revealed:loc.id==="loc-settlement"};

    const packageId = `forge-${quest.key}-${location.key}-${uid()}`;
    const titlePrefixes = ["The","Beneath the","Curse of the","Last Light of","Echoes of","Secrets of"];
    const titleNouns = [object, monsterTitle, location.final, bossName.replace(/^The /,""), "Broken Oath", "Silent Bell"];
    const title = `${pick(titlePrefixes)} ${pick(titleNouns)}`.replace(/^The The /,"The ");

    return {
      schemaVersion:"0.1.0",
      metadata:{id:packageId,title,systemCompatibility:"5E-compatible fantasy RPG",partyLevel:level,partySize,durationMinutes,tone},
      setup:{
        pitch:quest.opening(ctx),
        openingLocation:"Starting Settlement",
        gmSummary:`${quest.objective(ctx)} The apparent antagonist is ${antagonist.name}, ${antagonistKind}. ${twist} Their motive is to ${antagonistMotive}.`,
        generated:true
      },
      quest:{
        type:quest.label,
        objective:quest.objective(ctx),
        stakes:`If the party fails, the danger at ${location.place} spreads beyond the site.`,
        deadline,
        successConditions:["The immediate threat is stopped or contained.","The original objective is resolved in a way consistent with the final choice."],
        failureConditions:["The main threat escapes or completes its worst outcome.","The deadline passes with the crisis unresolved."]
      },
      truth:{
        facts:[
          {id:"fact-location",text:`The crisis is centered on ${location.place}.`},
          {id:"fact-real-problem",text:quest.truth(ctx)},
          {id:"fact-antagonist-plan",text:`${antagonist.name} intends to ${antagonistMotive}.`}
        ],
        secrets:[
          {id:"secret-twist",text:twist,revealCondition:"Discover contradictory evidence, question the apparent antagonist, or inspect the inner site."}
        ]
      },
      npcs:[giver,witness,antagonist],
      locations:locationsOut,
      scenes,
      clues:[clueLocation,clueTruth,clueMotive,clueTwist],
      encounters,
      puzzles:[{id:"puzzle-main",name:puzzle.name,locationId:"loc-middle",prompt:puzzle.prompt,solution:puzzle.solution,failForward:puzzle.fail}],
      traps:[],
      items:[{id:"item-object",name:object,type:"quest object",description:`A central object tied to the adventure's apparent objective and deeper truth.`,stateOptions:["unknown","with-party","with-antagonist","destroyed","resolved"]}],
      maps:[{id:"map-main",name:location.mapLabel,asset:null,regions:mapRegions}],
      events:[{id:"event-deadline",name:"Deadline",effect:`At ${deadline}, the unresolved threat escalates.`}],
      recovery:{
        policies:[
          "Preserve established facts, not a predetermined route.",
          "Never erase a successful player deduction.",
          "Move required information only to a plausible backup source.",
          "Record recovery state changes."
        ],
        routes:[
          {
            id:"recover-refuse",trigger:"The party refuses or distrusts the quest giver.",
            response:`${witness.name} provides independent evidence pointing to ${location.place}; an immediate sign of the threat confirms there is a real crisis.`,
            stateChanges:["Discover the location clue."],patch:{discoverClueIds:["clue-location"]}
          },
          {
            id:"recover-giver-gone",trigger:"The quest giver is killed, missing, or unavailable.",
            response:`${witness.name} becomes the primary clue source. Physical evidence independently confirms the route.`,
            stateChanges:["Discover the location clue."],patch:{discoverClueIds:["clue-location"]}
          },
          {
            id:"recover-skip-middle",trigger:"The party bypasses the puzzle or middle location.",
            response:`Do not force them back. Place the essential records in ${location.inner}, where they can reveal the real problem and antagonist motive.`,
            stateChanges:["Keep both required revelations available."],patch:{discoverClueIds:["clue-real-problem","clue-antagonist-motive"]}
          },
          {
            id:"recover-attack-antagonist",trigger:`The party attacks ${antagonist.name} before hearing the explanation.`,
            response:"Let the conflict happen. Shouted warnings, dropped notes, and visible machinery/ritual evidence preserve access to the essential truths.",
            stateChanges:["Discover the core problem and motive if needed."],patch:{discoverClueIds:["clue-real-problem","clue-antagonist-motive"]}
          },
          {
            id:"recover-leave",trigger:"The party leaves the main location after learning the danger.",
            response:`Advance the world toward ${deadline}. The threat becomes visible at the settlement, but all discovered information remains true.`,
            stateChanges:["Return to the opening settlement without clearing discoveries."],patch:{setCurrentSceneId:"scene-hook"}
          }
        ]
      },
      pacing:{
        targetMinutes:durationMinutes,
        cutOrder:["scene-journey"].concat(durationHours===2?["scene-puzzle"]:[]),
        optionalOrder:[],
        bossReserveMinutes:durationHours===2?35:55,
        resolutionReserveMinutes:10
      },
      endings:[
        {id:"ending-repair",name:"Repair What Was Breaking",condition:"The party preserves or replaces the old protection.",result:"The immediate crisis ends, but the truth of the old system is now known."},
        {id:"ending-break",name:"Break the Old Bargain",condition:"The party destroys the source and survives the released danger.",result:"The old protection ends permanently and the community must adapt."},
        {id:"ending-bargain",name:"Make a New Deal",condition:"The party reaches a new agreement with the threat or its keeper.",result:"The danger recedes, but the bargain creates a future consequence."}
      ],
      initialState:{
        questStage:"offered",currentSceneId:"scene-hook",discoveredClueIds:[],revealedSecretIds:[],
        npcState:{
          [giver.id]:{status:"alive",attitude:"guarded"},
          [witness.id]:{status:"alive",attitude:"curious"},
          [antagonist.id]:{status:"alive",attitude:"wary"}
        },
        locationState:initialLocationState,
        itemState:{"item-object":"unknown"},
        eventState:{"event-deadline":"pending"}
      }
    };
  }

  const api = { generate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof globalThis !== "undefined") globalThis.OneShotGenerator = api;
})();