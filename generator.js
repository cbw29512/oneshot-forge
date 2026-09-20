(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function hashSeed(value) {
    const text = String(value || "FORGE");
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFromSeed(seed) {
    let a = hashSeed(seed);
    return function rng() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomToken() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      return (values[0].toString(36) + values[1].toString(36)).toUpperCase().slice(0, 10);
    }
    return (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).toUpperCase();
  }

  function newSeed() {
    return "FORGE-" + randomToken();
  }

  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];

  function shuffle(rng, source) {
    const list = [...source];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function damageDice(average) {
    const avg = Math.max(2, Math.round(average));
    const dice = Math.max(1, Math.floor(avg / 4.5));
    const base = dice * 3.5;
    const mod = Math.max(0, Math.round(avg - base));
    return {
      average: avg,
      dice: dice + "d6" + (mod ? "+" + mod : "")
    };
  }

  function combatProfile(level, partySize, difficulty, role) {
    const boss = role === "boss";
    const elite = role === "elite";
    const difficultyBump = difficulty === "hard" ? 1 : difficulty === "low" ? -1 : 0;
    const proficiency = 2 + Math.floor((level - 1) / 4);
    const count = boss ? 1 : clamp(Math.round(partySize * (difficulty === "hard" ? 1 : difficulty === "low" ? 0.5 : 0.75)), 1, 8);
    const ac = clamp(12 + Math.floor((level - 1) / 4) + difficultyBump + (boss ? 1 : 0), 11, 21);
    const hpEach = boss
      ? Math.round((36 + level * 12) * clamp(partySize / 4, 0.65, 1.75))
      : Math.round((8 + level * 4.2) * (elite ? 1.45 : 1) * (difficulty === "hard" ? 1.15 : 1));
    const attackBonus = clamp(3 + Math.floor((level + 1) / 3) + (boss ? 1 : 0), 3, 12);
    const saveDC = clamp(11 + Math.floor((level + 2) / 3) + (boss ? 1 : 0), 11, 20);
    const attackDamage = damageDice((boss ? 6 : 3) + level * (boss ? 2.35 : 1.15));
    const signatureDamage = damageDice((boss ? 10 : 5) + level * (boss ? 3 : 1.55));
    const attacksPerTurn = boss
      ? (level >= 11 ? 3 : level >= 5 ? 2 : 1)
      : (elite && level >= 9 ? 2 : 1);

    return {
      count,
      ac,
      hpEach,
      attackBonus,
      saveDC,
      attacksPerTurn,
      attackDamage,
      signatureDamage,
      proficiency,
      speed: "30 ft.",
      balanceNote: "Fast-play 5E-compatible target generated for this party; tune at the table if the group is unusually optimized.",
      basicAttack: "+" + attackBonus + " to hit; " + attackDamage.dice + " (" + attackDamage.average + ") damage.",
      signature: "Recharge 5–6: DC " + saveDC + " save; " + signatureDamage.dice + " (" + signatureDamage.average + ") damage on a failure, half on a success."
    };
  }

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
      key:"sunken-temple", place:"the drowned temple of Saint Vey",
      approach:"a flooded causeway between leaning stone saints",
      entrance:"Collapsed Portico", middle:"Flooded Reliquary", inner:"Drowned Nave", final:"Tidal Sanctum",
      atmosphere:"salt water drips upward from the ceiling and old prayers echo below the surface",
      hazard:"rising black water", mapLabel:"Sunken Temple"
    },
    {
      key:"ruined-watchtower", place:"Blackthorn Watch",
      approach:"a lightning-split road climbing a barren ridge",
      entrance:"Broken Gate", middle:"Signal Hall", inner:"Raven Stair", final:"Beacon Chamber",
      atmosphere:"every gust makes the cracked signal bells answer one another",
      hazard:"unstable masonry", mapLabel:"Blackthorn Watch"
    },
    {
      key:"haunted-mine", place:"the sealed Gloamvein Mine",
      approach:"an abandoned ore road beneath dead pines",
      entrance:"Foreman's Yard", middle:"Collapsed Gallery", inner:"Old Lift", final:"Deep Vein",
      atmosphere:"pick strikes sound from tunnels no living miner occupies",
      hazard:"cave-ins and bad air", mapLabel:"Gloamvein Mine"
    },
    {
      key:"moon-marsh", place:"the drowned ruins of Fenmere",
      approach:"a lantern path across silver reeds and black water",
      entrance:"Reed Gate", middle:"Sunk Chapel", inner:"Whispering Causeway", final:"Moon Pool",
      atmosphere:"reflections move a heartbeat before the things casting them",
      hazard:"sucking mud and false paths", mapLabel:"Fenmere"
    },
    {
      key:"abandoned-observatory", place:"Starfall Observatory",
      approach:"a spiral road around a glassy crater",
      entrance:"Shattered Courtyard", middle:"Orrery Hall", inner:"Lens Vault", final:"Star Chamber",
      atmosphere:"the broken lenses show constellations that are not in the sky",
      hazard:"arcing star-light", mapLabel:"Starfall Observatory"
    },
    {
      key:"ash-monastery", place:"the burned monastery of Cinderwake",
      approach:"a pilgrim stair buried in gray ash",
      entrance:"Charred Cloister", middle:"Ash Library", inner:"Bell Crypt", final:"Ember Chapel",
      atmosphere:"warm ash falls even though the fires died decades ago",
      hazard:"embers that flare around spoken lies", mapLabel:"Cinderwake"
    }
  ];

  const questTypes = [
    {
      key:"retrieve", label:"Retrieve",
      objective: ctx => "Recover the " + ctx.object + " from " + ctx.location.place + " before " + ctx.deadline + ".",
      opening: ctx => ctx.giver.name + " asks the party to recover the stolen " + ctx.object + ". The last reliable trail leads toward " + ctx.location.place + ".",
      truth: ctx => "The " + ctx.object + " is not merely valuable; it is tied to the danger inside " + ctx.location.place + "."
    },
    {
      key:"rescue", label:"Rescue",
      objective: ctx => "Find and rescue " + ctx.missingName + " from " + ctx.location.place + " before " + ctx.deadline + ".",
      opening: ctx => ctx.giver.name + " says " + ctx.missingName + " vanished while investigating " + ctx.location.place + ".",
      truth: ctx => ctx.missingName + " entered willingly after learning that the threat at " + ctx.location.place + " was about to worsen."
    },
    {
      key:"break-curse", label:"Break Curse",
      objective: ctx => "Break the curse centered on " + ctx.location.place + " before " + ctx.deadline + ".",
      opening: ctx => "People near " + ctx.giver.name + "'s home have begun suffering the same impossible symptom: " + ctx.symptom + ". The source points to " + ctx.location.place + ".",
      truth: ctx => "The curse is a containment mechanism that is failing, not a simple hostile spell."
    },
    {
      key:"hunt", label:"Hunt",
      objective: ctx => "Track the creature called the " + ctx.monsterTitle + " to " + ctx.location.place + " and stop its attacks before " + ctx.deadline + ".",
      opening: ctx => ctx.giver.name + " offers a reward for the " + ctx.monsterTitle + ", blamed for three recent attacks.",
      truth: ctx => "The " + ctx.monsterTitle + " is reacting to a deeper threat inside " + ctx.location.place + "; killing it alone will not solve the crisis."
    },
    {
      key:"investigate", label:"Investigate",
      objective: ctx => "Discover what happened at " + ctx.location.place + " and prevent a second disaster before " + ctx.deadline + ".",
      opening: ctx => ctx.giver.name + " has received contradictory reports from " + ctx.location.place + ": lights, missing scouts, and messages in familiar handwriting from people who are already dead.",
      truth: ctx => "Someone inside " + ctx.location.place + " is deliberately feeding outsiders a false explanation."
    },
    {
      key:"defend", label:"Defend",
      objective: ctx => "Stop the threat emerging from " + ctx.location.place + " before it reaches the settlement at " + ctx.deadline + ".",
      opening: ctx => ctx.giver.name + " has proof that something is moving from " + ctx.location.place + " toward inhabited land.",
      truth: ctx => "The coming attack is a symptom of a failing ward inside " + ctx.location.place + "."
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
  const bossNames = ["The Hollow Regent","The Pale Engine","The Nameless Choir","The Ash Warden","The Drowned Saint","The Starved Echo"];

  const pacingProfiles = {
    2:[10,10,20,10,20,35,10],
    3:[15,15,30,20,30,50,15],
    4:[20,25,40,30,40,65,15],
    6:[25,35,50,40,55,90,25]
  };

  function makeNpc(rng, name, role, knows, secrets, wants, extra={}) {
    return {
      id:"npc-" + slug(name) + "-" + Math.floor(rng() * 46656).toString(36).padStart(3, "0"),
      identityKey:slug(name),
      name,
      role,
      personality: extra.personality || [pick(rng,["measured","blunt","warm","nervous","dry","formal"]), pick(rng,["protective","ambitious","curious","guilt-ridden","stubborn"])],
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

  function buildEncounter(id, seedData, level, partySize, role, overrideDifficulty) {
    const difficulty = overrideDifficulty || seedData[2] || "medium";
    const mechanics = /combat|guardian|beast|sentinel|seekers/i.test(seedData[1] + " " + seedData[0])
      ? combatProfile(level, partySize, difficulty, role)
      : null;
    return {
      id,
      name:seedData[0],
      type:seedData[1],
      difficulty,
      summary:seedData[3],
      resolution:"Multiple approaches should work if consistent with the fiction.",
      mechanics
    };
  }

  function generate(options={}) {
    const level = clamp(Number(options.level) || 4, 1, 20);
    const partySize = clamp(Number(options.partySize) || 4, 2, 8);
    const durationHours = [2,3,4,6].includes(Number(options.durationHours)) ? Number(options.durationHours) : 4;
    const durationMinutes = durationHours * 60;
    const seed = String(options.seed || newSeed()).trim().toUpperCase();
    const rng = rngFromSeed(seed + "|" + level + "|" + partySize + "|" + durationHours + "|" + (options.tone || "random"));
    const toneKey = options.tone && tones[options.tone] !== undefined ? options.tone : "random";
    const tone = toneKey === "random" ? pick(rng,Object.entries(tones).filter(([key])=>key!=="random"))[1] : tones[toneKey];
    const pacing = pacingProfiles[durationHours];

    const location = pick(rng, locations);
    const quest = pick(rng, questTypes);
    const object = pick(rng, objects);
    const deadline = pick(rng, deadlines);
    const symptom = pick(rng, symptoms);
    const monsterTitle = pick(rng, monsterTitles);
    const twist = pick(rng, twists);
    const complication = pick(rng, complications);
    const puzzle = pick(rng, puzzles);
    const antagonistKind = pick(rng, factions);
    const antagonistMotive = pick(rng, motives);
    const roster = shuffle(rng, names);
    const giverName = roster[0], witnessName = roster[1], antagonistName = roster[2], missingName = roster[3];

    const ctx = {
      location, quest, object, deadline, symptom, monsterTitle, twist, complication,
      antagonistKind, antagonistMotive, missingName, giver:{name:giverName}
    };

    const giver = makeNpc(
      rng, giverName, "quest giver",
      ["The immediate problem is connected to " + location.place + ".", "The deadline is " + deadline + ".", "There is at least one route to the site."],
      ["The quest giver knows one uncomfortable fact about the site's original purpose."],
      ["Get the party moving quickly", "Keep innocent people safe"],
      {
        lies:["Initially presents the crisis in the simplest possible terms."],
        questFunction:"Starts the quest and supplies the primary location clue."
      }
    );

    const witness = makeNpc(
      rng, witnessName, "witness and alternate clue source",
      ["A secondary route reaches " + location.place + ".", "They saw physical evidence tied to the crisis."],
      ["They followed the danger farther than they first admit."],
      ["Be taken seriously", "Learn what is actually happening"],
      {questFunction:"Backup delivery source when the party distrusts or loses the quest giver."}
    );

    const antagonist = makeNpc(
      rng, antagonistName, antagonistKind + "; apparent antagonist",
      [quest.truth(ctx), "Their plan is to " + antagonistMotive + ".", "The final chamber is the " + location.final + "."],
      [twist],
      ["Complete the plan before the deadline", "Prevent the worst possible outcome"],
      {
        personality:["exhausted","intense","certain they are the only person acting fast enough"],
        cannotKnow:["what the party did before arriving unless told", "the party's private intentions"],
        questFunction:"Carries the central twist and can become ally, enemy, or bargaining partner."
      }
    );

    const clues = [
      {
        id:"clue-location",
        revelation:"The crisis leads to " + location.place + ".",
        required:true,
        sources:[giver.name + " gives the destination", witness.name + " confirms the route", "physical tracks or magical residue point the same direction"],
        canMove:true, allowEarlyDiscovery:true
      },
      {
        id:"clue-real-problem",
        revelation:quest.truth(ctx),
        required:true,
        sources:[antagonist.name + " explains it", "records in the inner site reveal it", "the final ward visibly demonstrates it"],
        canMove:true, allowEarlyDiscovery:true
      },
      {
        id:"clue-antagonist-motive",
        revelation:antagonist.name + " is trying to " + antagonistMotive + ".",
        required:true,
        sources:[antagonist.name + " explains the plan", "their notes show the plan", "the partially completed ritual or mechanism shows the intent"],
        canMove:true, allowEarlyDiscovery:true
      },
      {
        id:"clue-twist",
        revelation:twist,
        required:false,
        sources:["contradictory evidence in the middle location", witness.name + "'s account", antagonist.name + "'s explanation"],
        canMove:true, allowEarlyDiscovery:true
      }
    ];

    const encounterOne = pick(rng, encounterSeeds);
    let encounterTwo = pick(rng, encounterSeeds);
    if (encounterTwo[0] === encounterOne[0]) {
      encounterTwo = encounterSeeds[(encounterSeeds.indexOf(encounterOne) + 1) % encounterSeeds.length];
    }
    const bossName = pick(rng, bossNames);

    const locationsOut = [
      {id:"loc-settlement",name:"Starting Settlement",description:"The community threatened by the adventure's central problem.",connections:["loc-approach"]},
      {id:"loc-approach",name:"Approach",description:location.approach,connections:["loc-settlement","loc-entrance"]},
      {id:"loc-entrance",name:location.entrance,description:"The outer edge of " + location.place + "; " + location.atmosphere + ".",connections:["loc-approach","loc-middle"]},
      {id:"loc-middle",name:location.middle,description:"A dangerous middle zone shaped by " + location.hazard + ".",connections:["loc-entrance","loc-inner"]},
      {id:"loc-inner",name:location.inner,description:"Evidence here makes the simple version of the quest impossible to believe.",connections:["loc-middle","loc-final"]},
      {id:"loc-final",name:location.final,description:"The crisis reaches its irreversible point here.",connections:["loc-inner"]}
    ];

    const scenes = [
      {
        id:"scene-hook", title:"The Offer", purpose:"Establish the quest, stakes, and deadline.", pacingClass:"core",
        estimatedMinutes:pacing[0], locationId:"loc-settlement",
        readAloud:quest.opening(ctx) + " Around you, people are already reacting to the first signs that time is running out.",
        gmNotes:["Objective: " + quest.objective(ctx), "Deadline: " + deadline + ".", giver.name + " does not volunteer every uncomfortable detail."],
        npcIds:[giver.id,witness.id], encounterIds:[], clueIds:["clue-location"], entryConditions:[], exits:["scene-journey","scene-entrance"]
      },
      {
        id:"scene-journey", title:"The Road Bites Back", purpose:"Show the threat outside the main location and provide a cuttable complication.", pacingClass:"cut-first",
        estimatedMinutes:pacing[1], locationId:"loc-approach",
        readAloud:"The route to " + location.place + " follows " + location.approach + ". Before you reach the site, " + complication + ".",
        gmNotes:["This scene can be cut if time is short.","Its purpose is pressure and foreshadowing, not mandatory information."],
        npcIds:[], encounterIds:["enc-travel"], clueIds:[], entryConditions:[], exits:["scene-entrance"]
      },
      {
        id:"scene-entrance", title:location.entrance, purpose:"Present the first substantial obstacle with more than one solution.", pacingClass:"core",
        estimatedMinutes:pacing[2], locationId:"loc-entrance",
        readAloud:"At " + location.entrance + ", " + location.atmosphere + ". Something here was built to keep intruders out — or something else in.",
        gmNotes:[encounterOne[3],"Allow bypass, negotiation, or clever use of the environment when plausible."],
        npcIds:[], encounterIds:["enc-entry"], clueIds:["clue-twist"], entryConditions:[], exits:["scene-puzzle","scene-inner"]
      },
      {
        id:"scene-puzzle", title:puzzle.name, purpose:"Break up combat and make failure advance rather than stall the adventure.", pacingClass:durationHours===2?"cut-first":"core",
        estimatedMinutes:pacing[3], locationId:"loc-middle",
        readAloud:puzzle.prompt + " The mechanism is old, but recent marks show someone used it successfully.",
        gmNotes:["Solution: " + puzzle.solution,"Fail forward: " + puzzle.fail],
        npcIds:[], encounterIds:[], clueIds:[], entryConditions:[], exits:["scene-inner"]
      },
      {
        id:"scene-inner", title:"The Story Changes", purpose:"Reveal the real problem and antagonist motive before the climax.", pacingClass:"core",
        estimatedMinutes:pacing[4], locationId:"loc-inner",
        readAloud:"The evidence in " + location.inner + " does not match the story that sent you here. Ahead, " + antagonist.name + " is still working, and whatever they are doing is nearly finished.",
        gmNotes:[antagonist.name + " does not attack automatically.","Core truth: " + quest.truth(ctx),"Motive: " + antagonistMotive + "."],
        npcIds:[antagonist.id], encounterIds:["enc-inner"], clueIds:["clue-real-problem","clue-antagonist-motive"], entryConditions:[], exits:["scene-final"]
      },
      {
        id:"scene-final", title:"Finale: " + bossName, purpose:"Force a consequential final choice under pressure.", pacingClass:"core",
        estimatedMinutes:pacing[5], locationId:"loc-final",
        readAloud:"The " + location.final + " shudders as the last protection gives way. " + bossName + " emerges into the chamber, and every incomplete choice in the adventure suddenly matters.",
        gmNotes:["Final threat: " + bossName + ".","The party can fight, complete or disrupt the antagonist's plan, bargain, or combine approaches.","Do not invalidate an early correct deduction or a clever bypass."],
        npcIds:[antagonist.id], encounterIds:["enc-boss"], clueIds:[], entryConditions:[], exits:["scene-resolution"]
      },
      {
        id:"scene-resolution", title:"Aftermath", purpose:"Resolve the original quest and show the consequence of the party's choice.", pacingClass:"core",
        estimatedMinutes:pacing[6], locationId:"loc-settlement",
        readAloud:"By the time the danger passes, the original job sounds almost too simple compared with what actually happened. People wait to hear what you decided — and what it cost.",
        gmNotes:["Choose the ending matching the final state.","Return explicitly to the original objective, reward, and consequences."],
        npcIds:[giver.id,witness.id], encounterIds:[], clueIds:[], entryConditions:[], exits:[]
      }
    ];

    const bossMechanics = combatProfile(level, partySize, "hard", "boss");
    const encounters = [
      {id:"enc-travel",name:"Journey Complication",type:"social / hazard",difficulty:"low",summary:complication + ".",resolution:"Resolve quickly; this scene is safe to cut.",mechanics:null},
      buildEncounter("enc-entry", encounterOne, level, partySize, encounterOne[2] === "hard" ? "elite" : "standard"),
      buildEncounter("enc-inner", encounterTwo, level, partySize, encounterTwo[2] === "hard" ? "elite" : "standard"),
      {
        id:"enc-boss",name:bossName,type:"boss / objective encounter",difficulty:"hard",
        summary:bossName + " is the immediate physical threat while the larger objective remains active.",
        resolution:"Victory can come from defeating the threat, completing a binding, destroying the source, bargaining, or a valid combination.",
        mechanics:bossMechanics
      }
    ];

    const mapRegions = [
      {id:"r-entry",label:location.entrance,sceneId:"scene-entrance",x:4,y:40,w:22,h:20},
      {id:"r-middle",label:location.middle,sceneId:"scene-puzzle",x:31,y:18,w:25,h:22},
      {id:"r-inner",label:location.inner,sceneId:"scene-inner",x:38,y:57,w:24,h:21},
      {id:"r-final",label:location.final,sceneId:"scene-final",x:70,y:37,w:26,h:27}
    ];

    const initialLocationState = {};
    for (const loc of locationsOut) initialLocationState[loc.id] = {revealed:loc.id==="loc-settlement"};

    const seedKey = hashSeed(seed + "|" + level + "|" + partySize + "|" + durationHours + "|" + tone.join("|")).toString(36);
    const packageId = "forge-" + quest.key + "-" + location.key + "-" + seedKey;
    const titlePrefixes = ["The","Beneath the","Curse of the","Last Light of","Echoes of","Secrets of"];
    const titleNouns = [object,monsterTitle,location.final,bossName.replace(/^The /,""),"Broken Oath","Silent Bell"];
    const title = (pick(rng,titlePrefixes) + " " + pick(rng,titleNouns)).replace(/^The The /,"The ");

    function creatureFromMechanics(name, mechanics) {
      if (!mechanics) return null;
      return {
        name,
        count: mechanics.count,
        ac: mechanics.ac,
        hp: mechanics.hpEach,
        speed: mechanics.speed,
        attack: mechanics.basicAttack,
        action: mechanics.signature,
        tactics: "Press the nearest threat unless the listed bypass or bargain is used."
      };
    }

    const quickrun = {
      adventureId: packageId,
      version: "0.1.0",
      target: {level, partySize},
      requiredCheckIds: ["check-final-plan"],
      checks: [
        {id:"check-giver",sceneId:"scene-hook",label:"Press the quest giver",dc:clamp(11 + Math.floor(level/5),11,16),ability:"Wisdom (Insight) or Charisma (Persuasion)",success:"They admit the uncomfortable fact about the site.",failure:"They still name the location; the witness remains the backup source."},
        {id:"check-final-plan",sceneId:"scene-final",label:"Advance the closing plan",dc:clamp(12 + Math.floor(level/4),12,18),ability:"Intelligence (Arcana or Investigation) or Charisma (Persuasion)",success:"Gain 1 plan success. Three successes before three failures ends the threat without requiring a total wipe.",failure:"No progress; the acting character takes light damage equal to the threat's signature pressure."}
      ],
      encounters: encounters.map(enc => {
        const creature = creatureFromMechanics(enc.name, enc.mechanics);
        return {
          id: enc.id,
          objective: enc.summary,
          start: enc.summary,
          creatures: creature ? [creature] : [],
          bypass: enc.mechanics ? "A valid stealth, social, or authored backup route can skip a fight without losing required clues." : "No combat is required.",
          end: enc.resolution
        };
      }),
      hazards: [],
      rewards: [
        {id:"reward-job",when:"The original objective is resolved.",reward:"The promised payment is made unless the party openly betrayed the community."},
        {id:"reward-site",when:"The party searches the inner site after the finale.",reward:"A modest cache of coin and one story-significant token."}
      ],
      mapNotes: [
        {sceneId:"scene-entrance",dimensions:"50 x 40 ft.",features:["one obvious approach","one quieter side route","difficult terrain along the edges"]},
        {sceneId:"scene-final",dimensions:"40-ft. chamber",features:["threat starts at the far side","cover along the walls","no exit except the way the party entered until the objective is resolved"]}
      ]
    };

    return {
      schemaVersion:"0.1.0",
      metadata:{
        id:packageId,title,systemCompatibility:"5E-compatible fantasy RPG",
        partyLevel:level,partySize,durationMinutes,tone,seed
      },
      setup:{
        pitch:quest.opening(ctx),
        openingLocation:"Starting Settlement",
        gmSummary:quest.objective(ctx) + " The apparent antagonist is " + antagonist.name + ", " + antagonistKind + ". " + twist + " Their motive is to " + antagonistMotive + ".",
        generated:true
      },
      quest:{
        type:quest.label,
        objective:quest.objective(ctx),
        stakes:"If the party fails, the danger at " + location.place + " spreads beyond the site.",
        deadline,
        successConditions:["The immediate threat is stopped or contained.","The original objective is resolved in a way consistent with the final choice."],
        failureConditions:["The main threat escapes or completes its worst outcome.","The deadline passes with the crisis unresolved."]
      },
      truth:{
        facts:[
          {id:"fact-location",text:"The crisis is centered on " + location.place + "."},
          {id:"fact-real-problem",text:quest.truth(ctx)},
          {id:"fact-antagonist-plan",text:antagonist.name + " intends to " + antagonistMotive + "."}
        ],
        secrets:[{id:"secret-twist",text:twist,revealCondition:"Discover contradictory evidence, question the apparent antagonist, or inspect the inner site."}]
      },
      npcs:[giver,witness,antagonist],
      locations:locationsOut,
      scenes,
      clues,
      encounters,
      puzzles:[{id:"puzzle-main",name:puzzle.name,locationId:"loc-middle",prompt:puzzle.prompt,solution:puzzle.solution,failForward:puzzle.fail}],
      traps:[],
      items:[{
        id:"item-object",name:object,type:"quest object",
        description:"A central object tied to the adventure's apparent objective and deeper truth.",
        stateOptions:["unknown","with-party","with-antagonist","destroyed","resolved"]
      }],
      maps:[{id:"map-main",name:location.mapLabel,asset:null,regions:mapRegions}],
      events:[{id:"event-deadline",name:"Deadline",effect:"At " + deadline + ", the unresolved threat escalates."}],
      pathPressure:{
        principle:"The ending is never locked. A table that investigates and talks gets extra treasure and a weaker finale. A table that murders, skips every clue, or smashes the quest object early still finishes — they spend more hit points and leave gold on the table.",
        notDeviation:[
          "Authored bypasses (side doors, stealth, bargains) are not a rush.",
          "Any authored ending is a valid ending."
        ],
        prepared:[
          {when:"They found at least two required clues before the finale.", payoff:"The final threat starts at two-thirds hit points."},
          {when:"The antagonist is alive and not hostile.", payoff:"They can help end the crisis without a full fight."},
          {when:"The quest giver is alive and not publicly ruined.", payoff:"Full promised pay, plus a small extra purse."}
        ],
        rushed:[
          {when:"They killed the quest giver.", cost:"Half pay from a village chest. The witness still points the way."},
          {when:"They attacked the antagonist before hearing them.", cost:"No help in the finale. Full hit points on the last threat."},
          {when:"They reach the finale with zero required clues.", cost:"The last threat acts once against the whole party before initiative."}
        ]
      },
      recovery:{
        policies:["Preserve established facts, not a predetermined route.","Never erase a successful player deduction.","Move required information only to a plausible backup source.","Record recovery state changes."],
        routes:[
          {
            id:"recover-refuse",trigger:"The party refuses or distrusts the quest giver.",
            response:witness.name + " provides independent evidence pointing to " + location.place + "; an immediate sign of the threat confirms there is a real crisis.",
            stateChanges:["Discover the location clue."],patch:{discoverClueIds:["clue-location"]}
          },
          {
            id:"recover-giver-gone",trigger:"The quest giver is killed, missing, or unavailable.",
            response:witness.name + " becomes the primary clue source. Physical evidence independently confirms the route.",
            stateChanges:["Discover the location clue."],patch:{discoverClueIds:["clue-location"]}
          },
          {
            id:"recover-skip-middle",trigger:"The party bypasses the puzzle or middle location.",
            response:"Do not force them back. Place the essential records in " + location.inner + ", where they can reveal the real problem and antagonist motive.",
            stateChanges:["Keep both required revelations available."],patch:{discoverClueIds:["clue-real-problem","clue-antagonist-motive"]}
          },
          {
            id:"recover-attack-antagonist",trigger:"The party attacks " + antagonist.name + " before hearing the explanation.",
            response:"Let the conflict happen. Shouted warnings, dropped notes, and visible machinery or ritual evidence preserve access to the essential truths.",
            stateChanges:["Discover the core problem and motive if needed."],patch:{discoverClueIds:["clue-real-problem","clue-antagonist-motive"]}
          },
          {
            id:"recover-leave",trigger:"The party leaves the main location after learning the danger.",
            response:"Advance the world toward " + deadline + ". The threat becomes visible at the settlement, but all discovered information remains true.",
            stateChanges:["Return to the opening settlement without clearing discoveries."],patch:{setCurrentSceneId:"scene-hook"}
          }
        ]
      },
      pacing:{
        targetMinutes:durationMinutes,
        plannedMinutes:scenes.reduce((sum,scene)=>sum + scene.estimatedMinutes,0),
        cutOrder:["scene-journey"].concat(durationHours===2?["scene-puzzle"]:[]),
        optionalOrder:[],
        bossReserveMinutes:pacing[5],
        resolutionReserveMinutes:pacing[6]
      },
      endings:[
        {id:"ending-repair",name:"Repair What Was Breaking",condition:"The party preserves or replaces the old protection.",result:"The immediate crisis ends, but the truth of the old system is now known."},
        {id:"ending-break",name:"Break the Old Bargain",condition:"The party destroys the source and survives the released danger.",result:"The old protection ends permanently and the community must adapt."},
        {id:"ending-bargain",name:"Make a New Deal",condition:"The party reaches a new agreement with the threat or its keeper.",result:"The danger recedes, but the bargain creates a future consequence."}
      ],
      initialState:{
        questStage:"offered",currentSceneId:"scene-hook",discoveredClueIds:[],revealedSecretIds:[],sceneHistory:[],
        npcState:{
          [giver.id]:{status:"alive",attitude:"guarded"},
          [witness.id]:{status:"alive",attitude:"curious"},
          [antagonist.id]:{status:"alive",attitude:"wary"}
        },
        locationState:initialLocationState,
        itemState:{"item-object":"unknown"},
        eventState:{"event-deadline":"pending"}
      },
      quickrun
    };
  }

  const api = { generate, newSeed, combatProfile };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof globalThis !== "undefined") globalThis.OneShotGenerator = api;
})();