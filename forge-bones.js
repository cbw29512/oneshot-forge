(() => {
  "use strict";

  function hashSeed(value) {
    let h = 2166136261 >>> 0;
    for (const ch of String(value || "FORGE")) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFromSeed(seed) {
    let a = hashSeed(seed);
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const choose = (rng, locks, key, list) => locks?.[key] || pick(rng, list);

  const POOLS = {
    origins:["roadside inn","river market","border village","forest shrine","caravan camp","small port","mountain hamlet","city gate"],
    destinations:["ruined watchtower","abandoned mine","marsh temple","forgotten manor","sea cave","old monastery","buried vault","isolated mill"],
    quests:[
      ["find","Find a missing person or creature."],["retrieve","Recover a lost, stolen, or dangerous object."],
      ["stop","Stop a threat before it reaches someone else."],["investigate","Discover what actually happened."],
      ["protect","Protect a person, place, object, or event."],["escort","Get someone or something safely to a destination."],
      ["break","Break a curse, pact, seal, or harmful process."],["deliver","Deliver something whose importance is not initially clear."]
    ],
    givers:["mayor","farmer","merchant","priest","criminal","child","soldier","scholar","ghost","monster","anonymous letter","talking artifact"],
    motives:["protect the community","recover someone they love","hide their own mistake","prevent a scandal","make money","repair an old wrong","stop a larger disaster"],
    twists:[
      ["The obvious suspect caused the problem.","The obvious suspect is protecting people from the real threat."],
      ["The quest giver gave an incomplete story.","The quest giver caused the crisis accidentally and is hiding it."],
      ["The target was taken against their will.","The target left willingly and does not want to return."],
      ["The object must be destroyed.","The object is containing something worse."],
      ["The monster is hunting locals.","The monster is starving, injured, or defending its young."],
      ["A rival faction wants the opposite outcome.","Both factions have legitimate reasons and incompatible goals."]
    ],
    obstacles:[
      ["trap","Pressure plates seal the exit and release a physical hazard.",13,"Failure costs resources but opens a slower route."],
      ["puzzle","Three environmental clues determine the correct sequence.",12,"A failed attempt reveals one correct step and adds pressure."],
      ["trap+puzzle","A trapped mechanism must be understood before it can be safely disabled.",14,"Failure triggers the trap once, then exposes enough of the mechanism to proceed."]
    ],
    travels:[
      ["dense forest","poor visibility and wrong turns"],["flooded road","rising water and unstable footing"],
      ["rocky ridge","exposure and falling stone"],["city backstreets","crowds, witnesses, and pursuit"],
      ["open marsh","deep mud and misleading lights"],["coastal path","tide and narrow footing"]
    ],
    finales:[
      ["monster","a dangerous creature","end the immediate threat","satisfy its need, drive it away, or change the environment","the threat reaches innocent people"],
      ["npc","an intelligent antagonist","force a final decision","persuade, expose, bargain with, or outmaneuver them","their plan succeeds"],
      ["artifact","a dangerous artifact","decide what happens to it","disable, relocate, seal, surrender, or destroy it","its effect becomes permanent"],
      ["ritual","an unstable ritual","finish, redirect, or stop the ritual","solve its procedure or negotiate with its operator","the ritual completes uncontrolled"],
      ["environment","a collapsing or transforming location","escape while resolving the quest","stabilize a route, sacrifice resources, or abandon the objective","the site claims the objective or traps survivors"],
      ["mixed","a creature or NPC tied to an active mechanism","solve both the immediate threat and the larger problem","separate the parties, disable the mechanism, bargain, or fight","one problem survives even if the other is beaten"]
    ],
    aftermaths:[
      ["return","Return to the quest giver and confront the difference between the original story and the truth."],
      ["continue","The party continues its journey carrying the consequence with them."],
      ["choice","The party chooses whether to return, disappear, deliver the result elsewhere, or keep what they found."]
    ],
    encounters:[
      ["social","A lost traveler insists the road ahead does not exist.",false],
      ["merchant","A peddler offers one useful item and one obviously suspicious bargain.",false],
      ["wildlife","A territorial animal blocks the easiest route but is not hunting the party.",false],
      ["hazard","A sudden storm or terrain failure forces a resource choice.",false],
      ["discovery","The party finds an abandoned camp with evidence of an unrelated story.",false],
      ["weird","A harmless supernatural event follows the party for ten minutes.",false],
      ["comic","A stubborn farm animal has stolen something inconvenient.",false],
      ["moral","Two strangers both claim ownership of the same valuable object.",false],
      ["treasure","A risky detour offers modest treasure with a visible complication.",false],
      ["combat","Bandits or predators test the party, but retreat is a valid outcome.",false]
    ]
  };

  function generateBones(options={}) {
    try {
      const seed = String(options.seed || "FORGE").trim().toUpperCase();
      const locks = options.locks || {};
      const rng = rngFromSeed(seed + "|" + JSON.stringify(locks));
      const quest = choose(rng, locks, "quest", POOLS.quests);
      const twist = choose(rng, locks, "twist", POOLS.twists);
      const obstacle = choose(rng, locks, "obstacle", POOLS.obstacles);
      const travel = choose(rng, locks, "travel", POOLS.travels);
      const finale = choose(rng, locks, "finale", POOLS.finales);
      const aftermath = choose(rng, locks, "aftermath", POOLS.aftermaths);
      let encounter1 = choose(rng, locks, "randomEncounter1", POOLS.encounters);
      let encounter2 = choose(rng, locks, "randomEncounter2", POOLS.encounters);
      if (!locks.randomEncounter2 && encounter2 === encounter1) {
        encounter2 = POOLS.encounters[(POOLS.encounters.indexOf(encounter1) + 1) % POOLS.encounters.length];
      }
      const origin = choose(rng, locks, "origin", POOLS.origins);
      const destination = choose(rng, locks, "destination", POOLS.destinations);
      const giverRole = choose(rng, locks, "giver", POOLS.givers);
      const giverMotive = pick(rng, POOLS.motives);

      return {
        version:"0.1.0", seed,
        preview:{origin,destination},
        hook:{type:quest[0],objective:quest[1],target:destination},
        questGiver:{role:giverRole,motive:giverMotive},
        twist:{apparentTruth:twist[0],actualTruth:twist[1]},
        obstacle:{kind:obstacle[0],mechanic:obstacle[1],dc:obstacle[2],failForward:obstacle[3]},
        travel:{environment:travel[0],pressure:travel[1]},
        locationProgression:[
          {role:"entrance",job:"Establish the location and a bypassable first obstacle."},
          {role:"middle",job:"Reveal evidence that makes the simple quest story doubtful."},
          {role:"inner",job:"Deliver the truth and force preparation for the finale."}
        ],
        finale:{kind:finale[0],subject:finale[1],objective:finale[2],noncombatResolution:finale[3],failure:finale[4]},
        aftermath:{mode:aftermath[0],consequence:aftermath[1]},
        randomEncounters:[
          {kind:encounter1[0],prompt:encounter1[1],questRelated:encounter1[2]},
          {kind:encounter2[0],prompt:encounter2[1],questRelated:encounter2[2]}
        ]
      };
    } catch (error) {
      console.error("Forge bones generation failed.", error);
      throw error;
    }
  }

  const api={generateBones,pools:POOLS};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (typeof globalThis!=="undefined") globalThis.ForgeBones=api;
})();
