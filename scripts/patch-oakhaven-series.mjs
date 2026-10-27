#!/usr/bin/env node
// Idempotent structure pass: Oakhaven levels 2–6 and the eight-beat pace.
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;

function assertRead(id, text) {
  const count = words(text);
  if (count < 25 || count > 180) throw new Error(`${id} read-aloud has ${count} words`);
  if (text.trim().length < 180) throw new Error(`${id} read-aloud is short on characters`);
}

function loc(id, name, description) {
  if (words(description) < 18) throw new Error(id + " location thin");
  return {id, name, description, tags: ["oakhaven", "travel"]};
}

function beatScene(spec) {
  assertRead(spec.id, spec.readAloud);
  if ((spec.runSteps || []).length < 3) throw new Error(spec.id + " steps");
  return {
    id: spec.id,
    title: spec.title,
    purpose: spec.purpose,
    paceBeat: spec.paceBeat,
    locationId: spec.locationId,
    readAloud: spec.readAloud,
    gmNotes: spec.gmNotes,
    pacingClass: "core",
    estimatedMinutes: spec.minutes,
    npcIds: spec.npcIds || [],
    clueIds: spec.clueIds || [],
    encounterIds: [],
    exits: spec.exits,
    exitChoices: spec.exitChoices,
    runSteps: spec.runSteps,
    advanceWhen: spec.advanceWhen
  };
}

function rollScene({id, title, purpose, locationId, readAloud, rows, next, nextLabel, minutes = 10}) {
  return beatScene({
    id, title, purpose, paceBeat: purpose.includes("traveling") ? 4 : 2,
    locationId, readAloud, minutes,
    gmNotes: [
      "Roll 1d6 in the open. Use that row only. This is not a fixed fight.",
      "The row never carries the only copy of a required clue. Skipping it does not stop the night.",
      ...rows.map((row, i) => `${i + 1}. ${row}`)
    ],
    exits: [next],
    exitChoices: [{target: next, label: nextLabel, description: "The rolled row is done and the road continues."}],
    runSteps: [
      {title: "Roll in the open", text: "Tell the table this beat is a roll, not a scripted monster. Roll 1d6 where everyone can see it."},
      {title: "Run only that row", text: "Read the matching row. If it is the combat row, offer the listed way out before initiative."},
      {title: "Move on either way", text: "Success and failure both leave the party able to continue. Do not gate the next scene on this roll."}
    ],
    advanceWhen: "One rolled row has been resolved and the party is moving again."
  });
}

const BUDGET = {
  2: [100, 150, 200],
  3: [150, 225, 400],
  4: [250, 375, 500],
  5: [500, 750, 1100],
  6: [600, 1000, 1400]
};

function balanceLine(level, xp, why) {
  const [low, mod, high] = BUDGET[level].map(n => n * 4);
  let band = "below the Low budget";
  if (xp > high) band = "above the High budget";
  else if (xp === high) band = "on the High budget";
  else if (xp > mod) band = "between Moderate and High";
  else if (xp === mod) band = "on the Moderate budget";
  else if (xp > low) band = "between Low and Moderate";
  else if (xp === low) band = "on the Low budget";
  return `SRD 5.2.1 for 4 level-${level} characters: Low ${low}, Moderate ${mod}, High ${high}. Creature XP spent: ${xp}, ${band}. ${why} SRD 5.1 prints monster XP and does not include an encounter-budget table, so this module does not invent a 2014 Easy/Medium/Hard/Deadly label.`;
}

function xpOf(enc) {
  return (enc.creatures || []).filter(c => !c.object).reduce((sum, c) => sum + (Number(c.xp) || 0) * (c.count || 1), 0);
}

function findEnc(adv, id) {
  return adv.quickrun.encounters.find(enc => enc.id === id);
}

function retarget(scene, from, to, label, description) {
  scene.exits = (scene.exits || []).map(id => id === from ? to : id);
  for (const choice of scene.exitChoices || []) {
    if (choice.target === from) {
      choice.target = to;
      if (label) choice.label = label;
      if (description) choice.description = description;
    }
  }
}

function chainSpine(adv, hookId, inserted, oldNext) {
  const spine = adv.flowContract.mainSpine;
  if (spine.includes(inserted[0])) return;
  const at = spine.indexOf(hookId);
  if (at < 0) throw new Error("missing hook " + hookId);
  spine.splice(at + 1, 0, ...inserted);
  const hook = adv.scenes.find(s => s.id === hookId);
  retarget(hook, oldNext, inserted[0], "First roll", "Leave the hook and roll the roadside table.");
}

function appendScenes(adv, scenes, locations) {
  for (const scene of scenes) {
    if (!adv.scenes.some(s => s.id === scene.id)) adv.scenes.push(scene);
  }
  for (const location of locations) {
    if (!adv.locations.some(l => l.id === location.id)) adv.locations.push(location);
  }
}

function pointResolutions(adv, settleId, label) {
  for (const scene of adv.scenes) {
    if (!scene.id.startsWith("scene-resolution")) continue;
    if ((scene.exits || []).includes(settleId)) continue;
    scene.exits = [settleId];
    scene.exitChoices = [{target: settleId, label, description: "Go back to Oakhaven and settle the job."}];
  }
}

function retitleItem(adv, id, fields) {
  const item = (adv.items || []).find(entry => entry.id === id);
  if (item) Object.assign(item, fields);
}

function investigate(adv, id, readAloud, notes) {
  const scene = adv.scenes.find(entry => entry.id === id);
  if (!scene) throw new Error("missing investigation scene " + id);
  assertRead(id, readAloud);
  scene.readAloud = readAloud;
  scene.gmNotes = notes;
  scene.runSteps = [
    {title: "Put the leads on the table", text: "Name the people and the physical claims. Let the players choose the order. Do not announce which one is true."},
    {title: "Play the motive", text: "Each person wants something. A false lead has a reason. Answer questions in that person's voice."},
    {title: "Wrong turns fail forward", text: "Checking the red herring costs about ten minutes. The true route is still in their hands afterward, on paper or on the ground."}
  ];
}

function finish(adv, level, packNote, giver) {
  adv.metadata.partyLevel = level;
  adv.metadata.durationMinutes = 210;
  adv.series.level = level;
  adv.series.worth = "exactly one level";
  adv.series.questGiver = giver;
  adv.series.mayorFrame = "Only level 1 and level 10 are the mayor's quests. This module's giver is the NPC in questGiver. Do not move this job onto the mayor's desk.";
  adv.series.pace = [
    "1 hook",
    "2 rolled encounter",
    "3 clearer direction",
    "4 rolled encounter while traveling",
    "5 arrival, trap, and puzzle",
    "6 the holder of the goal",
    "7 return to Oakhaven and settle",
    "8 lead to the next module"
  ];
  adv.pregenPack = `data/pregens/oakhaven-level-${level}-2014-srd.json`;
  adv.pregenPack2024 = `data/pregens/oakhaven-level-${level}-2024-srd.json`;
  adv.rulesEditions = {
    supported: ["2014 SRD 5.1", "2024 SRD 5.2.1"],
    carryForward: packNote,
    unsettled: "Settled against SRD 5.1 and SRD 5.2.1. No 2014 Easy/Medium/Hard/Deadly labels, because SRD 5.1 has no encounter-budget table. Boots of Elvenkind need no attunement in either edition; 2014 advantage is only on Stealth checks that rely on moving silently. Wand of Secrets: 2014 an action within 30 feet; 2024 a Magic action within 60 feet. 2014 Life always prepares Spiritual Weapon from level 3 and Beacon of Hope from level 5. 2024 Life does not. Hunter Shark and Giant Constrictor Snake are printed in both edition blocks."
  };
  if (adv.pacing) {
    adv.pacing.targetMinutes = 210;
    adv.pacing.plannedMinutes = adv.scenes.reduce((sum, scene) => sum + (scene.estimatedMinutes || 0), 0);
    const cut = "If the table is behind, resolve each rolled row in one sentence. Do not skip the return to Oakhaven or the lead into the next module.";
    if (!adv.pacing.cutOrder.includes(cut)) adv.pacing.cutOrder.unshift(cut);
  }
  if (adv.quickrun?.target) adv.quickrun.target.level = level;
  for (const enc of adv.quickrun?.encounters || []) {
    if (!(enc.creatures || []).some(c => !c.object && c.xp)) continue;
    const xp = xpOf(enc);
    if (!String(enc.balance || "").includes("SRD 5.2.1 for 4 level-" + level)) {
      enc.balance = balanceLine(level, xp, enc.balanceWhy || "Non-creature pressure is noted in the scene.");
    }
  }
}

function replaceStrings(value, pairs) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of pairs) next = next.split(from).join(to);
    return next;
  }
  if (Array.isArray(value)) return value.map(item => replaceStrings(item, pairs));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = replaceStrings(value[key], pairs);
  }
  return value;
}

const bearRow = "Hungry SRD Black Bear, not a required fight. AC 11, HP 19. 2014: Bite +3 (1d6+2) and Claws +3 (2d4+2). 2024: two Rend attacks +4, 1d6+2 slashing each. Offer food or a DC 15 Wisdom (Animal Handling) check. Success: it leaves. Failure: it snaps once, then the party can still go around. Do not spend the night here.";
const shrubRow = "Two SRD Awakened Shrubs in the ditch. AC 9, HP 10, vulnerable to fire, resistant to piercing. Rake +1, 1 slashing. They do not chase. A DC 10 Dexterity (Acrobatics) check walks past; on a failure the passer takes 1 slashing and still passes.";

function load(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
const DIFFICULTY = {
  "enc-bramble-guard": "below Low (230 XP; Low 400 for four level-2 characters)",
  "enc-malakor": "between Low and Moderate (500 XP; Low 400, Moderate 600 for four level-2 characters)",
  "enc-sump-crawlers": "below Low (400 XP; Low 600 for four level-3 characters)",
  "enc-rag-wardens": "below Low (800 XP; Low 1000 for four level-4 characters)",
  "enc-blackwater-lampreys": "below Low (1350 XP; Low 2000 for four level-5 characters)",
  "enc-mere-skimmers": "below Low (1800 XP; Low 2400 for four level-6 characters)"
};

function applySettled(adv) {
  for (const enc of adv.encounters || []) {
    if (DIFFICULTY[enc.id]) enc.difficulty = DIFFICULTY[enc.id];
  }
  for (const enc of adv.quickrun?.encounters || []) {
    for (const creature of enc.creatures || []) {
      if (String(creature.statBlock || "").includes("Animated Armor")) {
        creature.edition2024 = "Same AC, HP, and Slam. 2024 drops the Blinded immunity. SRD 5.1 lists both Blinded and Petrified. The 2024 block has no Antimagic Susceptibility or False Appearance.";
      }
    }
  }
  const wand = (adv.items || []).find(item => item.id === "item-wand-secrets");
  if (wand) wand.effect = "No attunement. 3 charges, regains 1d3 at dawn, expend 1 charge. 2014: an action, secret door or trap within 30 feet. 2024: a Magic action, within 60 feet.";
  replaceStrings(adv, [
    ["Permanent item, both editions: Wand of Secrets, uncommon, 3 charges, regains 1d3 at dawn. SRD 5.2 uses a Magic action. 2014 uses an action; that action name was not re-copied from a 5.1 PDF here. If the shrine wand was missed, Kaelen had this second wand in the shop and gives it now. The party does not get two.",
      "Permanent item, both editions: Wand of Secrets, uncommon, no attunement, 3 charges, regains 1d3 at dawn, expend 1 charge. 2014: an action, secret door or trap within 30 feet. 2024: a Magic action, within 60 feet. If the shrine wand was missed, Kaelen had this second wand in the shop and gives it now. The party does not get two."],
    ["Release ending: the boots are Boots of Elvenkind. SRD 5.2, uncommon, no attunement line printed: silent steps and Advantage on Dexterity (Stealth). SRD 5.1 attunement was not re-read from a 5.1 PDF. If that printing requires attunement, use it at a 2014 table.",
      "Release ending: the boots are Boots of Elvenkind. No attunement in either edition. 2014: steps make no sound, and advantage only on Dexterity (Stealth) checks that rely on moving silently. 2024: steps make no sound regardless of the surface, and Advantage on Dexterity (Stealth) checks."],
    ["One SRD Hunter Shark fin in the stair's shadow. It leaves if they do not enter the water. Confirmed 2024: AC 12, HP 45, Bite +6, 14 (3d6+4), Advantage if the target is missing any HP, Water Breathing only. If they fight it here, remove one skimmer from the channel later.",
      "One SRD Hunter Shark fin in the stair's shadow. It leaves if they do not enter the water. 2014: Bite +6, reach 5 ft., 13 (2d8+4) piercing; Blood Frenzy; blindsight 30 ft.; speed 0 ft., swim 40 ft. 2024: 14 (3d6+4), blindsight 60 ft., speed 5 ft. AC 12, HP 45, Water Breathing only. If they fight it here, remove one skimmer from the channel later."],
    ["One SRD Giant Constrictor Snake in the ditch, if they attack the water. Otherwise it stays down. See the lamprey block for the 2024 bite and constrict. Do not add it to the span count.",
      "One SRD Giant Constrictor Snake in the ditch, if they attack the water. Otherwise it stays down. 2014 (no Multiattack): Bite +6, reach 10 ft., 11 (2d6+4) piercing, or Constrict +6, reach 5 ft., 13 (2d8+4) bludgeoning, grappled (escape DC 16). 2024: Multiattack Bite + Constrict, DC 14 Str save, escape DC 14. Do not add it to the span count."]
  ]);
}

function save(file, adv) {
  applySettled(adv);
  fs.writeFileSync(file, JSON.stringify(adv, null, 2) + "\n");
}

function hollow() {
  const file = root + "data/adventures/whispers-of-the-oakhaven-hollow.oneshot.json";
  const adv = load(file);
  if (!adv.scenes.some(s => s.id === "scene-lane-roll")) {
    const locations = [
      loc("loc-east-lane", "Oakhaven's eastern lane", "The eastern lane is a rutted dirt road between mint hedges and a drainage ditch. It smells of wet ash, horse sweat, and crushed leaves. A lichen-green milestone stands at the fork, papered with overlapping notices."),
      loc("loc-ridge-road", "Ridge road to the Hollow", "The ridge road climbs through oak shade toward the Whispering Hollow. Ferns slap at the knees, bird calls stop in patches, and old charcoal blazes mark the trees Kaelen uses when the path is vague.")
    ];
    const roll1 = rollScene({
      id: "scene-lane-roll",
      title: "Roll on the Eastern Lane",
      purpose: "A truly random encounter on the way out of Oakhaven, rolled at the table, before the Hollow's direction is clear.",
      locationId: "loc-east-lane",
      next: "scene-ridge-mark",
      nextLabel: "Read the milestone",
      readAloud: "The eastern lane smells of wet ash and crushed mint. Kaelen's marks stop at a milestone where three tracks argue: the ridge road, a goat path, and the ditch people call the Short Cut. A handcart sits with one wheel off. Somebody has nailed a fresh notice over a faded one. The Hollow is not in sight yet. Roll before anyone picks a road.",
      rows: [
        "A carter named Poul asks help with the wheel. DC 10 Strength (Athletics) sets it. Success: he gives a true rumor that birds will not cross the ridge. Failure: the wheel still goes on crooked and he warns you the Short Cut is a lie.",
        "The fresh notice says Malakor is selling nectar in the north wood. It is a week old and wrong. Treat it as the red herring, then keep going. The notice is not a required clue.",
        bearRow,
        "A child has lost a goat bell, not a goat. Returning it earns no gold and a warning that the ridge has gone quiet. DC 10 Wisdom (Perception) finds the bell in the ditch either way.",
        "Slick boards over the ditch. DC 10 Dexterity (Acrobatics) or fall Prone and lose a minute. The road continues.",
        shrubRow
      ]
    });
    const direction = beatScene({
      id: "scene-ridge-mark",
      title: "The Blaze and the False Notice",
      purpose: "Give a clearer direction to the Heart Tree, and show that the north-wood sale is a red herring.",
      paceBeat: 3,
      locationId: "loc-east-lane",
      minutes: 12,
      readAloud: "Under the fresh notice, Kaelen's charcoal arrow is still on the milestone, pointing up the ridge and not toward the north wood. Three new blazes on the oaks match the arrow. A torn scrap in the ditch repeats the tending words Decay, Balance, Growth in Malakor's tight hand, then stops. The north-wood story and the marks do not agree.",
      gmNotes: [
        "Red herring: the notice claims Malakor is selling Gloom-Lily in the north wood. The charcoal arrow, the three blazes, and the torn scrap all point up the ridge instead.",
        "This beat restates the route. It is not the only way to learn Malakor can be saved, or that the watchtower map exists. Those facts still have their later sources.",
        "If they follow the north wood anyway, they lose ten minutes, find an empty stall, and the blazes are still visible behind them. Do not start a second adventure."
      ],
      exits: ["scene-ridge-roll"],
      exitChoices: [{target: "scene-ridge-roll", label: "Take the ridge", description: "Follow the blazes. Roll again on the road."}],
      runSteps: [
        {title: "Show both stories", text: "Read the false notice and then uncover the charcoal arrow, the blazes, and the scrap."},
        {title: "Let them test the lie", text: "If they check the north wood, it is empty. The ridge marks remain. Mark no Shroud box for a short look."},
        {title: "Point at the Heart Tree", text: "The scrap's tending words are the same cycle the shrine will use. They do not need to solve that puzzle yet."}
      ],
      advanceWhen: "The party knows the ridge road is the real route and has left the milestone."
    });
    const roll2 = rollScene({
      id: "scene-ridge-roll",
      title: "Roll on the Ridge Road",
      purpose: "A second rolled encounter while traveling to the Hollow, before arrival at the brambles.",
      locationId: "loc-ridge-road",
      next: "scene-bramble",
      nextLabel: "Reach the brambles",
      readAloud: "The ridge road climbs under oaks that should be noisy and are not. Ferns soak your boots. Charcoal blazes keep the path honest, then stop where the light turns the color of old iron. Something moves once, off the trail, and does not call. Roll before the party steps into the brambles.",
      rows: [
        "A silent deer crosses and will not be hunted. DC 10 Wisdom (Animal Handling) or it bolts. Either way the party sees it refuse to enter the iron-colored light.",
        "Old camp ash and a cold kettle. DC 15 Intelligence (Investigation) finds Malakor's herb twist, proof he came this way alive. Failure still leaves the twist in plain sight if they search the kettle.",
        "A fallen limb blocks the trail. DC 10 Strength (Athletics) moves it. Failure: go around, lose five minutes, and do not mark a Shroud box unless they camp.",
        bearRow,
        "Wind through the canopy sounds like whispering. It is branches. Say so if they ask. No roll required to disbelieve it.",
        shrubRow
      ]
    });
    roll2.paceBeat = 4;
    appendScenes(adv, [roll1, direction, roll2], locations);
    chainSpine(adv, "scene-kaelen", ["scene-lane-roll", "scene-ridge-mark", "scene-ridge-roll"], "scene-bramble");
  }
  if (!adv.scenes.some(s => s.id === "scene-return-kaelen")) {
    const settle = beatScene({
      id: "scene-return-kaelen",
      title: "Back to Kaelen's Counter",
      purpose: "Travel back to Oakhaven and settle the nectar job with Kaelen, including the permanent magic item.",
      paceBeat: 7,
      locationId: "loc-kaelen-shop",
      minutes: 12,
      npcIds: ["npc-kaelen"],
      readAloud: "Oakhaven's eastern lane is louder on the way home. Mint and hot copper meet you at Kaelen's door before he does. He counts the vials with a stained finger, then looks past you, once, as if the grove might have followed. The counter is clear except for a cloth-wrapped wand he did not have out this morning. He waits to hear whether Malakor is still a man.",
      gmNotes: [
        "Pay the bounty that matches the ending already chosen: 150 gp if the corruption broke before Shroud 3, otherwise the partial pay already written on that ending.",
        "Permanent item, both editions: Wand of Secrets, uncommon, no attunement, 3 charges, regains 1d3 at dawn, expend 1 charge. 2014: an action, secret door or trap within 30 feet. 2024: a Magic action, within 60 feet. If the shrine wand was missed, Kaelen had this second wand in the shop and gives it now. The party does not get two.",
        "If the grove was restored, he also gives one Potion of Greater Healing (SRD, uncommon, 4d4+4 HP). It is consumable and is not assumed to remain on later sheets. The custom Ring of Plant Protection is not real and is not awarded."
      ],
      exits: ["scene-lead-watchtower"],
      exitChoices: [{target: "scene-lead-watchtower", label: "Ask what the map means", description: "Settle the coin, then take the next lead."}],
      runSteps: [
        {title: "Count the vials", text: "Kaelen pays what the ending already earned. Say the number out loud."},
        {title: "Hand over the wand", text: "Give one Wand of Secrets and read the charge rule for the table's edition. Do not also give a ring."},
        {title: "Record Malakor", text: "Write whether he lived. Oakhaven remembers that answer in the next module."}
      ],
      advanceWhen: "Coin and the Wand of Secrets are recorded, and Kaelen has heard Malakor's fate."
    });
    const lead = beatScene({
      id: "scene-lead-watchtower",
      title: "Resolution: The Map under the Tower",
      purpose: "Close this ending and hand the party the lead into Beneath the Eastern Watchtower.",
      paceBeat: 8,
      locationId: "loc-kaelen-shop",
      minutes: 8,
      npcIds: ["npc-kaelen"],
      readAloud: "Kaelen spreads the stained map on the counter and weights the corner with a vial. The charcoal circle is not the Hollow. It sits under Oakhaven's eastern watchtower, with a line drawn down into the earth. He taps it once. “I sell leaves. I do not keep a cellar that draws pictures of itself. Captain Marr will pretend she is not worried. She is.”",
      gmNotes: [
        "This is the series lead, not a new fight. Module 03 is level 3.",
        "If they already have Malakor's map from the Heart Tree, this scene confirms it. If that copy was lost, Kaelen traced a second from the scrap in the ditch and the fissure they described.",
        "The mayor of Oakhaven is the level 1 and level 10 frame of the series and is not in this module. Do not invent a mayor scene tonight."
      ],
      exits: [],
      exitChoices: [],
      runSteps: [
        {title: "Show the circle", text: "Put the watchtower map in their hands. Name Captain Marr as the next person."},
        {title: "Say what leveled", text: "Tell the players this module is worth one level, from 2 to 3, if they are playing the series."},
        {title: "Stop", text: "End. Do not start the tower tonight unless the table demands a cliffhanger sentence."}
      ],
      advanceWhen: "The watchtower map is in the party's hands and the session is closing."
    });
    appendScenes(adv, [settle, lead], []);
    pointResolutions(adv, "scene-return-kaelen", "Return to Kaelen");
    adv.flowContract.terminalScenes = ["scene-lead-watchtower"];
  }
  const bramble = findEnc(adv, "enc-bramble-guard");
  bramble.balanceWhy = "Razor-vines add damage outside the creature XP. Introductory by design.";
  bramble.scaling = "3 PCs: drop one Rot-Bloom (XP 180). 5 PCs: add one Rot-Bloom (XP 280). 6 PCs: add one Rot-Bloom and one Thorn-Shrub (XP 290). Low budget at level 2 is 100 XP per character. Stay under it.";
  const mal = findEnc(adv, "enc-malakor");
  mal.balanceWhy = "The Core's ward and the cleanse option make this harder in play than the creature XP alone.";
  mal.scaling = "3 PCs: remove the Rot-Bloom (XP 450, on the Moderate budget for three level-2 characters). 5 PCs: two Rot-Blooms (XP 550) against Low 500. 6 PCs: two Rot-Blooms and Core 30 HP (XP 550) against Low 600.";
  replaceStrings(adv, [
    ["Ring of Plant Protection (+1 AC against Beast and Plant attacks).", "Potion of Greater Healing (SRD, 4d4+4 HP, consumed) if the grove is restored. The permanent item is the Wand of Secrets."],
    ["Ring of Plant Protection", "Potion of Greater Healing"]
  ]);
  retitleItem(adv, "item-ring-plant-protection", {
    name: "Potion of Greater Healing",
    kind: "consumable",
    description: "Kaelen's extra payment when the grove is restored. It does not carry onto later sheets.",
    effect: "SRD Potion of Greater Healing: regain 4d4+4 HP when drunk. Consumed. The custom Ring of Plant Protection is not awarded."
  });
  investigate(adv, "scene-ridge-mark",
    "The milestone at the fork is arguing with itself. A fresh notice, still smelling of paste, says Malakor is selling nectar in the north wood and names a price. A chalk arrow points down the goat path. Charcoal the color of Kaelen's stained fingers marks the ridge, then smears, as if the hand got embarrassed and stopped. In the ditch, a torn scrap shows one word in a tight hand: Decay. The birds will not cross any of the three tracks.",
    [
      "Quest giver is Old Man Kaelen, the apothecary who sells the nectar. The mayor does not give this job. Level 1 and level 10 are the mayor's modules, and they are not written.",
      "Lead A, red herring: the north-wood notice. Motive: a rival stall wants Kaelen's buyers walking the wrong way so the grove trade dies. The paste is old. The stall is empty. Checking it costs about ten minutes.",
      "Lead B: Kaelen himself, if they go back or already pressed him. Motive: shame. He sent Malakor in. He shows how he makes a charcoal blaze only if someone asks how he marks a path. He is not lying about the missing nectar. He is leaving the ridge out.",
      "Lead C, physical: the scrap in the ditch. Dry it or make a DC 10 Intelligence (Investigation) check and the rest reads Decay, Balance, Growth in Malakor's hand. On a failure the word Decay is still there, and the shrine repeats the cycle later. This scrap is not the only copy of that cycle.",
      "Any order works. Do not announce the ridge as the answer in the first sentence. After they test one false road, the charcoal and the scrap are still on the stone."
    ]);
  const kaelenScene = adv.scenes.find(scene => scene.id === "scene-kaelen");
  if (kaelenScene && !kaelenScene.gmNotes.some(note => note.includes("Quest giver:"))) {
    kaelenScene.gmNotes.push("Quest giver: Old Man Kaelen. If someone says Malakor's name over an empty vial, the glass fogs and the word Balance shows in the condensation, then fades. That is a strange hook, not the shrine's solution.");
  }
  finish(adv, 2, "Level 2 sheets carry the Wand of Secrets on Ness Quinn.", {
    name: "Old Man Kaelen",
    npcId: "npc-kaelen",
    why: "He sells the nectar and he sent Malakor into the grove. The job starts at his counter."
  });
  adv.setup.gmSummary += " Pace: hook at the shop, a rolled lane encounter, a clearer ridge direction with a false north-wood sale, a second roll on the ridge, arrival at the bramble trap and the moonstone puzzle, Malakor holding the nectar, the walk back to Kaelen, and the watchtower lead.";
  save(file, adv);
}

function watchtower() {
  const file = root + "data/adventures/beneath-the-eastern-watchtower.oneshot.json";
  const adv = load(file);
  if (!adv.scenes.some(s => s.id === "scene-street-roll")) {
    const locations = [
      loc("loc-tower-street", "Street under the eastern watchtower", "The street under the eastern watchtower is packed stone, spear racks, and lamp oil. Black threads show in the mortar between the oldest blocks. It smells of wet stone and burned leaves, and the tower's shadow covers the lane even at noon.")
    ];
    const roll1 = rollScene({
      id: "scene-street-roll",
      title: "Roll under the Tower",
      purpose: "A rolled encounter in Oakhaven before the party understands the hatch.",
      locationId: "loc-tower-street",
      next: "scene-mortar-read",
      nextLabel: "Read the mortar",
      readAloud: "Captain Marr has you on the street while her guards clear the cellar. The tower should smell of oil and wet stone. It smells of burned leaves. Black threads crawl through the mortar and stop at a spear rack. A guard swears it is a roof leak. Another swears it is sabotage. Neither has opened the hatch. Roll before Marr calls you back inside.",
      rows: [
        "Guard Lenn says a saboteur poured pitch down the wall last night. He believes it. The pitch, if any, is dry and years old. DC 10 Intelligence (Investigation) shows the stain is coming up, not down. Failure: Marr says the same thing when you go back in.",
        "A spice cart blocks the lane. DC 10 Strength (Athletics) shifts it. The carter saw black glass in the gutter at dawn and will say so either way.",
        "Two crows will not land on the tower. No fight. If attacked they flee. Their refusal is color, not a clue you cannot get inside.",
        bearRow,
        "A loose shutter bangs in a rhythm like a bell. It is a shutter. DC 10 Dexterity (Sleight of Hand) ties it. On a failure it keeps banging and nothing else happens.",
        shrubRow
      ]
    });
    const direction = beatScene({
      id: "scene-mortar-read",
      title: "The Stain Comes Up",
      purpose: "Make the route under the tower clear, and retire the roof-leak and saboteur red herrings.",
      paceBeat: 3,
      locationId: "loc-watchtower",
      minutes: 12,
      npcIds: ["npc-edda-marr"],
      readAloud: "Marr kneels at the hatch and scrapes one black thread with a knife. The powder smells of salt and burned sugar, and the scratch shows the stain rising out of the mortar instead of dripping from the roof. She lays your Hollow map beside a builder's sketch. The charcoal line and the old sally tunnel are the same line. “Down,” she says. “Not a leak. Not a man with a bucket. Down.”",
      gmNotes: [
        "Red herrings: roof leak and a saboteur. The upward scrape, the map, and the builder's sketch agree on the sally tunnel.",
        "Marr still does not know the Gloam Sluice is a ward. She knows the tower is sick and the hatch is the way in.",
        "Killing or refusing Marr does not stop the night. The hatch is already unbarred, and the sketch is nailed inside the cellar."
      ],
      exits: ["scene-sally-roll"],
      exitChoices: [{target: "scene-sally-roll", label: "Enter the sally tunnel", description: "Roll once more on the way down."}],
      runSteps: [
        {title: "Kill the easy answers", text: "Show the stain rising. Say the leak and the saboteur do not fit."},
        {title: "Match the map", text: "Put the Hollow map on the builder's sketch until the party sees one line."},
        {title: "Name the clock", text: "Restate Tower Strain 0–3 before they descend."}
      ],
      advanceWhen: "The party knows to take the sally tunnel and has started down."
    });
    const roll2 = rollScene({
      id: "scene-sally-roll",
      title: "Roll in the Sally Mouth",
      purpose: "A rolled encounter while traveling down the sally tunnel, before the flooded arrival.",
      locationId: "loc-flooded-tunnel",
      next: "scene-tunnel",
      nextLabel: "Reach the black water",
      readAloud: "The sally stair is narrow enough that shields knock sparks off the wall. Lamp oil and cold mud trade places in the air. Somewhere below, water moves without a current you can see. A dropped spear rings once and the sound comes back wrong, as if the tunnel were longer than the hill. Roll before the water is in sight.",
      rows: [
        "A guard's lost helm. DC 10 Wisdom (Perception) finds a chalk arrow on the inside, pointing down. Failure: the arrow is still there if anyone picks the helm up.",
        "Loose step. DC 10 Dexterity (Acrobatics) or the first person drops Prone and takes 1 bludgeoning. The stair holds.",
        "Whisper of running feet ahead. It is water in a side pipe. No enemy. Say so after one check or one minute of caution.",
        "One SRD Crocodile in a side sump, AC 12, HP 19 (2014) or HP 13 (2024, see the crawler block). It wants the sump, not the party. DC 15 Wisdom (Animal Handling) or a thrown ration sends it deeper. If they fight, use the Stone-Sump Crawler block and do not also run the full crawler count later.",
        "Salt crust on the rail tastes like the sea and should not. Color only. The vault explains it.",
        "A belt of old coins worth 5 gp in a crack. No trap. Greed does not advance Tower Strain."
      ]
    });
    roll2.paceBeat = 4;
    appendScenes(adv, [roll1, direction, roll2], locations);
    chainSpine(adv, "scene-watchtower", ["scene-street-roll", "scene-mortar-read", "scene-sally-roll"], "scene-tunnel");
  }
  if (!adv.scenes.some(s => s.id === "scene-return-marr")) {
    const settle = beatScene({
      id: "scene-return-marr",
      title: "Marr Counts the Tower",
      purpose: "Return to the street and settle with Captain Marr, including the Cloak of Protection.",
      paceBeat: 7,
      locationId: "loc-watchtower",
      minutes: 12,
      npcIds: ["npc-edda-marr"],
      readAloud: "Daylight hits harder than the cellar lamps. Captain Marr is on the street with soot on one cheek and the duty slate under her arm. She looks at the tower, then at you, and does not ask a clever question. She asks whether the black threads have stopped, and whether the tower is still a tower. The cloth in her off hand is a grey cloak with a salt-glass clasp.",
      gmNotes: [
        "Pay the gp already written on the ending they earned.",
        "If the tower still stands or they repaired the sluice before it fell, award one Cloak of Protection. SRD, uncommon, attunement. +1 AC and +1 to saving throws while worn, in both SRD 5.1 and SRD 5.2. Oakhaven calls it the Saltglass Cloak. The old custom brooch that reduced necrotic damage by 1d6 is not awarded.",
        "If they smashed the core, the cloak is in the rubble and shattered. Do not award it. Later pregens assume the best path, and a drop-in table can still give the cloak."
      ],
      exits: ["scene-lead-orchard"],
      exitChoices: [{target: "scene-lead-orchard", label: "Open the ledger", description: "Take the next lead."}],
      runSteps: [
        {title: "Answer her two questions", text: "Did the splinters stop, and does the tower still stand? Use the ending already chosen."},
        {title: "Pay and cloak", text: "Coin first. Cloak only if the ending says the brooch was earned. Read the SRD cloak, not a custom effect."},
        {title: "Attune", text: "One person attunes on a Short Rest. It does not have to happen on screen."}
      ],
      advanceWhen: "Marr has paid, the cloak question is settled, and the ledger is still in hand."
    });
    const lead = beatScene({
      id: "scene-lead-orchard",
      title: "Resolution: The Orchard Line",
      purpose: "End the watchtower job and lead the party to The Black Orchard.",
      paceBeat: 8,
      locationId: "loc-watchtower",
      minutes: 8,
      npcIds: ["npc-edda-marr"],
      readAloud: "The maintenance ledger falls open where the clasp was strained. One line is darker than the others, pressed in by a careful hand: wardstone, Black Orchard, north of Oakhaven. Marr reads it twice. “I can hold a wall,” she says. “I cannot grow a stone. If the orchard still has the heart of this machine, that is the next door. Not tonight, unless you are fools for doors.”",
      gmNotes: [
        "Module 04 is level 4. This module was worth one level, from 3 to 4, on the series track.",
        "The ledger, the vault inscription, and Marr's copy are three ways to know the orchard lead. Losing Marr does not remove the book.",
        "Do not start the orchard in the same session unless the table asks for the first sentence only."
      ],
      exits: [],
      runSteps: [
        {title: "Read the line", text: "Black Orchard, north. Wardstone. Say it plainly."},
        {title: "Name the level", text: "Series tables advance from level 3 to level 4."},
        {title: "Close", text: "Stop on the road north, not inside the trees."}
      ],
      advanceWhen: "The Black Orchard is named and the session is over."
    });
    appendScenes(adv, [settle, lead], []);
    pointResolutions(adv, "scene-return-marr", "Return to Marr");
    adv.flowContract.terminalScenes = ["scene-lead-orchard"];
  }
  const crawlers = findEnc(adv, "enc-sump-crawlers").creatures[0];
  crawlers.count = 4;
  crawlers.trait = "Drawn to vibration: a thrown ration or loud splash in the southeast runoff pulls the crawlers there for 3 rounds.";
  const enc = findEnc(adv, "enc-sump-crawlers");
  enc.balanceWhy = "Falling masonry after round 3 is the extra pressure. Four crocodiles are still under the Low budget.";
  enc.scaling = "3 PCs: 3 crawlers (300 XP) against Low 450. 5 PCs: 5 crawlers (500 XP) against Low 750. 6 PCs: 6 crawlers (600 XP) against Low 900. The vibration bait still works.";
  enc.balance = "";
  replaceStrings(adv, [
    ["The party receives the Saltglass Brooch from the old maintenance cabinet: once per long rest when the wearer takes necrotic damage, reduce that damage by 1d6.", "The party receives a Cloak of Protection (SRD, uncommon, attunement): +1 AC and +1 to saving throws while worn. Oakhaven calls it the Saltglass Cloak. Same bonus in SRD 5.1 and SRD 5.2. Do not use the retired 1d6 necrotic reduction."],
    ["Saltglass Brooch", "Cloak of Protection"],
    ["reduce the Stone-Sump Crawlers from two to one", "reduce the Stone-Sump Crawlers from four to two"]
  ]);
  retitleItem(adv, "item-saltglass-brooch", {
    name: "Cloak of Protection",
    kind: "magic item",
    description: "A grey cloak with a salt-glass clasp. Oakhaven calls it the Saltglass Cloak.",
    effect: "SRD Cloak of Protection, uncommon, requires attunement. +1 bonus to AC and saving throws while worn. Same bonus in SRD 5.1 and SRD 5.2. The old 1d6 necrotic reduction is not used."
  });
  replaceStrings(adv, [
    ["Two territorial mineral-crusted crawlers", "Four territorial mineral-crusted crawlers"],
    ["two crawlers emerge", "four crawlers emerge"],
    ["both crawlers", "the crawlers"]
  ]);
  investigate(adv, "scene-mortar-read",
    "Three answers are already waiting in the tower cellar, and they do not agree. Guard Lenn has a bucket of old pitch and a story about a saboteur. The day book says the black threads are a roof leak and tells Marr to stop opening hatches. The mortar itself is wet from below, and a builder's sketch is nailed beside the Hollow map, both of them drawing a line down. Marr folds her arms. “I hold the wall,” she says. “You tell me which of these is a lie.”",
    [
      "Quest giver is Captain Edda Marr. She wants the tower standing and the town safe. She does not know the Gloam Sluice is a ward yet. The mayor does not give this job.",
      "Lead A, red herring: Guard Lenn's saboteur. Motive: he was on the night watch and wants the blame off his slate. The pitch is dry and years old. A DC 10 Intelligence (Investigation) check shows the stain rising. On a failure, scraping it still shows the same direction.",
      "Lead B, red herring: the day book's roof leak. Motive: the quartermaster does not want the cellar unbarred. The book never mentions salt, and the stain is on the inner mortar, not the ceiling.",
      "Lead C, physical: the builder's sketch and the Hollow map are the same line, down the sally tunnel. The sketch is nailed up. It works if Marr is refused, dead, or simply wrong.",
      "Let them test Lenn and the day book before you confirm the tunnel. A wrong theory costs talk, not the adventure."
    ]);
  finish(adv, 3, "Level 3 sheets add the Cloak of Protection on Halden Moss and still carry the Wand of Secrets.", {
    name: "Captain Edda Marr",
    npcId: "npc-edda-marr",
    why: "The eastern watchtower is her post. The black threads are coming up through her wall."
  });
  adv.setup.gmSummary += " Pace: Marr's hook, a rolled encounter on the tower street, a clearer reading of the rising stain, a second roll in the sally mouth, arrival in the flood with the pressure puzzle, the sluice as the thing holding the town's safety, the return to Marr, and the orchard lead.";
  save(file, adv);
}

function orchard() {
  const file = root + "data/adventures/the-black-orchard.oneshot.json";
  const adv = load(file);
  if (!adv.scenes.some(s => s.id === "scene-survey-hook")) {
    const locations = [
      loc("loc-survey-office", "Oakhaven survey office", "The survey office is a narrow room of pine shelves, dried ink, and a north window. Rolled maps tick in the draft. It smells of graphite and apple wood someone was not supposed to burn. A slate by the door still has Lio Derran's name on today's work.")
    ];
    const hook = beatScene({
      id: "scene-survey-hook",
      title: "Lio Did Not Come Back",
      purpose: "Hook the party in Oakhaven: the surveyor is missing and two communities want the same stone.",
      paceBeat: 1,
      locationId: "loc-survey-office",
      minutes: 12,
      readAloud: "The survey office has left the door unlatched and the kettle cold. Lio Derran's slate is still marked for the Black Orchard, and the line through his name is tomorrow's, not today's. A clerk's note on the desk is only one sentence: he went north to log a wardstone, and the orchard people say the stone is not the town's to log. Nobody in the office will walk past the first row of trees.",
      gmNotes: [
        "Standalone start: the party is hired here even if the watchtower ledger was never found. If they have the ledger, it is the same job.",
        "The clerk is offstage and not a required voice. The slate, the note, and later Vessa are enough.",
        "Do not explain the Living Graft yet. They know a man is missing and a stone is claimed twice."
      ],
      exits: ["scene-north-roll"],
      exitChoices: [{target: "scene-north-roll", label: "Take the north road", description: "Roll before the orchard is in sight."}],
      runSteps: [
        {title: "Give the job", text: "Find Lio. Learn what the wardstone is. The office pays either way."},
        {title: "State the dilemma in one line", text: "Two communities want one living stone. Do not reveal the third way."},
        {title: "Clock", text: "Lio is alive at the start. Say he will not survive a night in the root cage if they camp."}
      ],
      advanceWhen: "The party has accepted or stolen the job and is on the north road."
    });
    const roll1 = rollScene({
      id: "scene-north-roll",
      title: "Roll on the North Road",
      purpose: "A rolled encounter after the hook, before the orchard gate is understood.",
      locationId: "loc-survey-office",
      next: "scene-orchard-sign",
      nextLabel: "Read the boundary sign",
      readAloud: "The north road leaves the last fence and runs between apple scrub and a ditch full of last year's leaves. Crows work a fallen fruit and will not touch the black ones. A mile-post has two arrows nailed to it, pointing at each other. Roll before you tell them which arrow is newer.",
      rows: [
        "A shepherd insists the wardens are bandits in stolen armor. He is wrong, and he is frightened. DC 10 Wisdom (Insight) sees the fear. He still shares a true detail: the armor does not breathe.",
        "Black apples in the ditch, bitter and cold. Eating one does nothing but taste of iron. Not a trap yet. The real thorn-lash is at the gate.",
        "A broken survey chain, silver, three links. It is Lio's. DC 10 Intelligence (Investigation) matches the office punch. Failure: the punch is still readable if they carry it to Vessa.",
        "One SRD Animated Armor, inert in a ditch, AC 18, HP 33, two Slam attacks +4 for 5 (1d6+2). It is a shed frame, not a warden, unless they wear it or attack it. If it wakes, it walks back toward the orchard and stops at the sign.",
        "Rain starts and stops in one minute. The black fruit does not get wet. Color. The offering puzzle uses rain later.",
        "DC 10 Dexterity (Acrobatics) across a slick log. Failure: Prone in the ditch, no damage, the chain is easier to see."
      ]
    });
    const direction = beatScene({
      id: "scene-orchard-sign",
      title: "Do Not Pick, Do Not Cut",
      purpose: "Give a clear direction to the gate and retire the bandit red herring.",
      paceBeat: 3,
      locationId: "loc-orchard-gate",
      minutes: 12,
      readAloud: "The newer arrow is carved, not nailed, and it points at a gate of living wood. A board hangs from it by root-cord: DO NOT PICK THE FRUIT. DO NOT CUT THE TREES. BRING ASH, RAIN, AND A BLACK APPLE IF YOU WANT THE HEART. The bandit story dies here. The rags on the nearest frame are stitched to iron, and the iron is not hiding a person. Past the gate, rows of black fruit tick in the wind like slow clocks.",
      gmNotes: [
        "Red herring retired: the wardens are not bandits. The sign, the empty armor, and the stitched rags agree.",
        "The sign also previews the three offerings without solving which offering matches which vein.",
        "Vessa is at the gate in the next scene. This sign works if she is hostile, absent, or dead."
      ],
      exits: ["scene-row-roll"],
      exitChoices: [{target: "scene-row-roll", label: "Approach the rows", description: "Roll once more before the gate conversation."}],
      runSteps: [
        {title: "Read the board aloud", text: "The job is now the heart of the orchard, not a bandit camp."},
        {title: "Show the armor is empty", text: "If they search the ditch frame, there is no corpse and no wearer."},
        {title: "Name the offerings", text: "Ash, rain, black apple. Do not say which vein takes which."}
      ],
      advanceWhen: "The party is committed to the gate and knows the bandit story is false."
    });
    const roll2 = rollScene({
      id: "scene-row-roll",
      title: "Roll between the Rows",
      purpose: "A rolled encounter while traveling the last stretch to the gate.",
      locationId: "loc-orchard-gate",
      next: "scene-gate",
      nextLabel: "Meet the gate",
      readAloud: "The last hundred yards are apple rows planted too close for a cart. Black fruit brushes shoulders. The soil is warm, which it should not be, and somewhere a cord ticks against iron. You can see the gate. You are not at it yet. Roll.",
      rows: [
        "A rag flutters with nobody in it. DC 10 Wisdom (Perception) sees the cord, not a person. Failure: they flinch, and the rag is still empty.",
        "Warm soil. DC 15 Intelligence (Nature) says the warmth is the wardstone, not a fire. Failure: they still feel it, and Vessa can name it.",
        "A black apple falls and does not bruise. Pocketing it helps the puzzle later. It is not the only black apple.",
        "One waking warden frame takes a single step and stops. Use the Rag-Stitched Warden block if they attack. If they stand still or show the sign's words, it lets them pass. Do not add it to the later count.",
        "Bee-loud ordinary tree in a row of quiet ones. The living tree is a hint that not everything here is sick. No roll.",
        "DC 10 Dexterity (Acrobatics) through a whip of cords. Failure: 1 slashing and they are through."
      ]
    });
    roll2.paceBeat = 4;
    adv.scenes.unshift(hook);
    appendScenes(adv, [roll1, direction, roll2], locations);
    adv.initialState.currentSceneId = "scene-survey-hook";
    adv.flowContract.mainSpine.unshift("scene-survey-hook");
    chainSpine(adv, "scene-survey-hook", ["scene-north-roll", "scene-orchard-sign", "scene-row-roll"], "scene-gate");
  }
  if (!adv.scenes.some(s => s.id === "scene-return-office")) {
    const settle = beatScene({
      id: "scene-return-office",
      title: "The Office Pays Either Way",
      purpose: "Return to Oakhaven and settle with the survey office, including the Pearl of Power.",
      paceBeat: 7,
      locationId: "loc-survey-office",
      minutes: 12,
      readAloud: "The survey office kettle is hot this time, as if someone hoped you would make it. Lio's slate is wiped clean or it is not, depending on whether he walked in with you. A grey pearl sits on a square of graftwood, the only pretty thing in a room of pine and ink. The clerk's chair is empty. The pay chest is not. The town wants to know what you did with the stone before it wants to know your names.",
      gmNotes: [
        "Pay the gp from the ending they chose.",
        "On the Living Graft ending, the pearl is a Pearl of Power. SRD, uncommon, attunement by a spellcaster. SRD 5.2: Magic action, regain one expended slot of level 3 or lower, once until the next dawn. SRD 5.1: an action regains one slot, and a 4th-level or higher slot comes back as 3rd level. No one here has a 4th-level slot.",
        "Return and Take endings do not include the pearl. The custom Graftwood Charm that rerolled poison saves is retired. Series pregens assume the graft ending; say so if this table chose otherwise."
      ],
      exits: ["scene-lead-bridge"],
      exitChoices: [{target: "scene-lead-bridge", label: "Follow the water", description: "Take the Night Spring lead."}],
      runSteps: [
        {title: "Report the stone", text: "Say which ending is now true: orchard keeps it, town takes it, or the graft serves both."},
        {title: "Pay", text: "Count the gold. Award the Pearl of Power only on the graft."},
        {title: "Lio", text: "If he lived, he signs the slate. If he died, the office writes his name off and the road east still exists."}
      ],
      advanceWhen: "The office has the outcome and any pearl has been awarded or refused."
    });
    const lead = beatScene({
      id: "scene-lead-bridge",
      title: "Resolution: Water under the Bridge",
      purpose: "End the orchard and lead the party to The Ashen Bridge.",
      paceBeat: 8,
      locationId: "loc-survey-office",
      minutes: 8,
      readAloud: "Under the last map weight is a strip of damp paper that should be dry. Lio's final sounding, or the office copy of it, draws the Night Spring east instead of down. The line crosses the Merecut gorge at a span labeled ASHEN BRIDGE. Someone has added, in a hurried hand, six people and two wagons, and the ink is not old enough to be history.",
      gmNotes: [
        "Module 05 is level 5. This module was worth the step from 4 to 5.",
        "The sounding, the rootheart channels, and Vessa's memory are three paths to the bridge. The office paper is the physical copy in the room.",
        "Stop here. The bridge is the next session."
      ],
      exits: [],
      runSteps: [
        {title: "Show the line", text: "Night Spring to the Ashen Bridge. Six people. Two wagons."},
        {title: "Name the level", text: "Series characters become level 5 after this module."},
        {title: "Close", text: "Do not put them on the span tonight."}
      ],
      advanceWhen: "The Ashen Bridge lead is in their hands and play stops."
    });
    appendScenes(adv, [settle, lead], []);
    pointResolutions(adv, "scene-return-office", "Return to Oakhaven");
    adv.flowContract.terminalScenes = ["scene-lead-bridge"];
  }
  const warden = findEnc(adv, "enc-rag-wardens");
  warden.creatures[0].count = 4;
  warden.end = "The wardens are disabled or defeated, or the party reaches the quarry path.";
  warden.balanceWhy = "AC 18 is the pressure. The red cords disable a warden without a damage race. Four suits are still under Low.";
  warden.scaling = "3 PCs: 3 wardens (600 XP) against Low 750. 5 PCs: 5 wardens (1000 XP) against Low 1250. 6 PCs: 5 wardens (1000 XP) against Low 1500. Each cord check still drops one warden.";
  warden.balance = "";
  replaceStrings(adv, [
    ["Vessa gives the party a Graftwood Charm: once per long rest, after failing a saving throw against poison or necrotic damage, reroll the save and use the new result.", "On the Living Graft, the office gives a Pearl of Power (SRD, uncommon, attunement by a spellcaster). SRD 5.2: Magic action, regain one spell slot of level 3 or lower, once until the next dawn. SRD 5.1: an action regains a slot, and a slot of 4th level or higher returns as 3rd level. The custom reroll charm is not awarded."],
    ["Graftwood Charm", "Pearl of Power"]
  ]);
  retitleItem(adv, "item-graftwood-charm", {
    name: "Pearl of Power",
    kind: "magic item",
    description: "A grey pearl left on the survey desk when the living graft holds.",
    effect: "SRD Pearl of Power, uncommon, attunement by a spellcaster. SRD 5.2: Magic action, regain one expended slot of level 3 or lower, once until the next dawn. SRD 5.1: an action regains a slot, and a 4th-level or higher slot returns as 3rd level. The custom poison-save charm is not awarded."
  });
  replaceStrings(adv, [
    ["Two Rag-Stitched Wardens", "Four Rag-Stitched Wardens"],
    ["Both wardens", "The wardens"],
    ["two warden posts", "four warden posts"]
  ]);
  investigate(adv, "scene-orchard-sign",
    "The north road ends in an argument you can walk around. A shepherd at the last fence says the things in the rows are bandits wearing stolen armor, and he will not come closer. A carved board on the living gate says not to pick the fruit and not to cut the trees, and it asks for ash, rain, and a black apple if you want the heart. In the ditch, an iron frame lies on its back with rags stitched to it and nobody inside. The office slate in your pocket still has Lio Derran's name on today's work.",
    [
      "The hiring party is the Oakhaven survey office: Lio did not come back, and the office wants the wardstone logged. Vessa Thorn is the orchard's voice, not the person who posted the job. The mayor does not give this job.",
      "Lead A, red herring: the shepherd's bandits. Motive: fear. He saw iron move and invented a person to put inside it. DC 10 Wisdom (Insight) shows he believes it. Searching the ditch frame finds stitches and no corpse.",
      "Lead B: Vessa, at the gate in the next scene. Motive: keep the stone in the orchard because the trees die without it. She will accuse the town of theft. She is not the bandit, and she is not lying about the trees.",
      "Lead C, physical: the gate board names ash, rain, and a black apple. It does not say which offering matches which vein. Lio's broken chain, if they already have it, is his, and Vessa can name the punch if they cannot.",
      "Question the shepherd, search the empty armor, and read the board in any order. Following the bandit story into the rows still reaches the gate."
    ]);
  finish(adv, 4, "Level 4 sheets add the Pearl of Power on Mira Quill and still carry the wand and the cloak.", {
    name: "Oakhaven survey office",
    npcId: "npc-lio-derran",
    why: "Lio Derran did not come back from logging the wardstone. The office hired the party. Vessa Thorn speaks for the orchard once they arrive. She is a claimant, not the poster."
  });
  adv.setup.gmSummary += " Pace: the survey office hook, a rolled north-road encounter, a boundary sign that kills the bandit story, a second roll in the rows, arrival at the gate with the thorn trap and offering puzzle, the wardstone choice, the walk back to the office, and the bridge lead.";
  save(file, adv);
}

function bridge() {
  const file = root + "data/adventures/the-ashen-bridge.oneshot.json";
  const adv = load(file);
  if (!adv.scenes.some(s => s.id === "scene-gate-hook")) {
    const locations = [
      loc("loc-east-gate", "Oakhaven east gate", "The east gate is oak, iron strap, and a bench that always holds one wet cloak. Beyond it the Merecut road runs straight until the gorge. Tonight the bench holds a runner's satchel and the cloak is Soren Vale's spare, still dripping black water.")
    ];
    const hook = beatScene({
      id: "scene-gate-hook",
      title: "Six People, Two Wagons",
      purpose: "Hook the party at Oakhaven's gate: the Ashen Bridge is failing with people on it.",
      paceBeat: 1,
      locationId: "loc-east-gate",
      minutes: 12,
      readAloud: "The east gate is open and the bench is wet. A runner's satchel holds Bridgewarden Soren Vale's spare cloak and a slate that has been written fast: six people, two wagons, center span, black water in the pier. The runner is gone back to the gorge. The gate sergeant will not leave the gate. She pushes the slate into your hands and says the bridge has four good breaths left, which is Soren's count, not hers.",
      gmNotes: [
        "Soren is on the bridge, not here. The slate is the hook if he is later dead or unreachable.",
        "Saving the people is success even if the bridge is lost. Say that before they leave.",
        "Red herring waiting on the road: a rumor that the west ford is the safer crossing. It is not. The people are already on the span."
      ],
      exits: ["scene-gate-roll"],
      exitChoices: [{target: "scene-gate-roll", label: "Take the east road", description: "Roll before the gorge."}],
      runSteps: [
        {title: "Read the slate", text: "Six people. Two wagons. Four breaths in Soren's count. Integrity clock starts at 4 when they can see the bridge, not now."},
        {title: "Say the value", text: "People count as the victory. The bridge is the second prize."},
        {title: "Do not wait for the sergeant", text: "She stays. The adventure does not need her to live or to like them."}
      ],
      advanceWhen: "The party is on the east road with the slate."
    });
    const roll1 = rollScene({
      id: "scene-gate-roll",
      title: "Roll outside the Gate",
      purpose: "A rolled encounter just outside Oakhaven, before the bridge's real direction is tested.",
      locationId: "loc-east-gate",
      next: "scene-ford-lie",
      nextLabel: "Hear the ford rumor",
      readAloud: "Outside the gate the east road is a pale track under a dark sky. Rain has started in the gorge and not here, which makes the dust look like a lie. A mile-post offers the bridge and, in newer chalk, a west ford. Somebody wants the traffic to turn around. Roll before you let them choose.",
      rows: [
        "A merchant turning back says the ford is safe and the bridge is already gone. He has not seen either. DC 10 Wisdom (Insight): he is repeating a shout. The slate in their hands is newer than his story.",
        "A loose dog with a bridgewarden's whistle on its collar. It will lead toward the gorge, not the ford, if anyone DC 10 Wisdom (Animal Handling) or simply follows. Failure: it goes anyway.",
        "Wind knocks a sign down. DC 10 Strength (Athletics) resets it. The sign's carved face still says ASHEN BRIDGE. The chalk ford arrow is on a separate board.",
        bearRow,
        "A child selling bad luck charms for 1 cp. No magic. If they buy one, it does nothing. Say so.",
        "DC 10 Dexterity (Acrobatics) around a mud slick. Failure: Prone, clothes wet, no damage, and they are still on the east road."
      ]
    });
    const direction = beatScene({
      id: "scene-ford-lie",
      title: "The Ford Is the Lie",
      purpose: "Make the gorge the clear destination and kill the west-ford red herring.",
      paceBeat: 3,
      locationId: "loc-east-gate",
      minutes: 12,
      readAloud: "The chalk arrow to the west ford smears under a thumb. Under it, the mile-post's carved lettering is older and cut deep: ASHEN BRIDGE, ONE MILE, NO FORD IN FLOOD. A wet bootprint over the chalk points east, toward the gorge, and the print is still filling with rain. From that direction comes one wooden crack, large enough to be a pier and too large to be a branch.",
      gmNotes: [
        "Red herring: the west ford. The carving, the bootprint, and the crack all point at the bridge. If they go west, they find a flooded ditch in ten minutes and can still reach the span.",
        "Do not start the Integrity clock until they can see the bridge.",
        "Soren's slate remains a source if they distrust the mile-post."
      ],
      exits: ["scene-gorge-roll"],
      exitChoices: [{target: "scene-gorge-roll", label: "Run for the gorge", description: "Roll once on the last mile."}],
      runSteps: [
        {title: "Smear the chalk", text: "Show the ford arrow as new and false."},
        {title: "Read the carving", text: "Ashen Bridge, one mile, no ford in flood."},
        {title: "Let a wrong turn fail forward", text: "The ditch costs ten minutes. The crack is still audible. They are not lost."}
      ],
      advanceWhen: "The party is committed to the gorge road."
    });
    const roll2 = rollScene({
      id: "scene-gorge-roll",
      title: "Roll on the Last Mile",
      purpose: "A rolled encounter while traveling to the Ashen Bridge.",
      locationId: "loc-west-approach",
      next: "scene-arrival",
      nextLabel: "See the span",
      readAloud: "The last mile smells of wet ash and cold iron. The gorge opens as a darker cut in the rain. You can hear people and you cannot see them yet. The road underfoot shifts once, not enough to be the bridge and enough to be a warning. Roll before the span comes into view.",
      rows: [
        "A dropped medicine crate, two Potion of Healing doses (SRD, 2d4+2). Taking them is allowed. They are consumable. The wagon on the bridge may still hold more.",
        "DC 10 Strength (Athletics) to drag a fallen limb out of the lane. Failure: climb over, arrive muddy, no damage.",
        "A shout from the gorge: “Six!” It is Mera Holt counting heads. They do not need to answer for her to still be there.",
        "One SRD Giant Constrictor Snake in the ditch, if they attack the water. Otherwise it stays down. 2014 (no Multiattack): Bite +6, reach 10 ft., 11 (2d6+4) piercing, or Constrict +6, reach 5 ft., 13 (2d8+4) bludgeoning, grappled (escape DC 16). 2024: Multiattack Bite + Constrict, DC 14 Str save, escape DC 14. Do not add it to the span count.",
        "Ash on the wind. DC 15 Intelligence (Nature): this is the bridge's own ashwood, already failing. Failure: Soren can say it on the span.",
        "DC 10 Dexterity (Acrobatics) on the wet camber. Failure: Prone. The bridge is still ahead."
      ]
    });
    roll2.paceBeat = 4;
    adv.scenes.unshift(hook);
    appendScenes(adv, [roll1, direction, roll2], locations);
    adv.initialState.currentSceneId = "scene-gate-hook";
    adv.flowContract.mainSpine.unshift("scene-gate-hook");
    chainSpine(adv, "scene-gate-hook", ["scene-gate-roll", "scene-ford-lie", "scene-gorge-roll"], "scene-arrival");
  }
  if (!adv.scenes.some(s => s.id === "scene-return-gate")) {
    const settle = beatScene({
      id: "scene-return-gate",
      title: "The Gate Hears the Count",
      purpose: "Return to Oakhaven and settle the rescue, including the +1 weapon if the people and the span were both saved.",
      paceBeat: 7,
      locationId: "loc-east-gate",
      minutes: 12,
      readAloud: "The east gate bench is drier than you left it, which feels like an insult if the gorge is still in your clothes. The sergeant counts people, not planks. She makes a mark for each civilian who walks through, and she does not mark the wagons until the people are done. On the table behind her is a longsword in a plain sheath, city-issue, with a thin line of light along the fuller that ordinary steel does not keep.",
      gmNotes: [
        "People saved are the success, even if the bridge is gone. Say the count out loud.",
        "Best ending (people and bridge): the sword is a +1 longsword. SRD, uncommon, no attunement in SRD 5.2 or SRD 5.1. +1 to attack and damage rolls. Any simple or martial weapon can replace the longsword if the fighter does not want a sword; the bonus stays +1.",
        "If the bridge was lost or the rescue was costly, pay the gold already written and do not give the sword. Series pregens assume the best ending. Tell a drop-in table they may still grant the sword."
      ],
      exits: ["scene-lead-mere"],
      exitChoices: [{target: "scene-lead-mere", label: "Read the soundings", description: "Take the Mere lead."}],
      runSteps: [
        {title: "Count the living", text: "Mark each saved civilian. Do not let the bridge outrank them."},
        {title: "Pay", text: "Use the ending's gold. Award the +1 weapon only on the full save."},
        {title: "Soren", text: "If he lived, he sleeps on the bench. If he died, the sergeant writes his name and still pays."}
      ],
      advanceWhen: "The survivor count and the payment are written down."
    });
    const lead = beatScene({
      id: "scene-lead-mere",
      title: "Resolution: The Bell in the Water",
      purpose: "End the bridge and lead the party to The Bell Beneath the Mere.",
      paceBeat: 8,
      locationId: "loc-east-gate",
      minutes: 8,
      readAloud: "Under the pay slate is a ferryman's sounding, still damp. The Night Spring does not stop at the gorge. The line continues into the Mere, and beside it someone has written that a bell is ringing under still water where bells should not ring. The sergeant taps the note. “Noll Vey is hiring. His apprentice went to answer it. That is the next wet job, and it can wait until you are dry.”",
      gmNotes: [
        "Module 06 is level 6. This module was the step from 5 to 6.",
        "The sounding, the pier ash, and Soren's report are three ways to know the Mere is next.",
        "Stop. Do not row onto the Mere tonight."
      ],
      exits: [],
      runSteps: [
        {title: "Show the line", text: "Night Spring into the Mere. A bell. A missing apprentice."},
        {title: "Name the level", text: "Series characters become level 6."},
        {title: "Close", text: "End at the gate."}
      ],
      advanceWhen: "The Mere lead is clear and the session ends."
    });
    appendScenes(adv, [settle, lead], []);
    pointResolutions(adv, "scene-return-gate", "Return to the gate");
    adv.flowContract.terminalScenes = ["scene-lead-mere"];
  }
  const lamprey = findEnc(adv, "enc-blackwater-lampreys").creatures[0];
  Object.assign(lamprey, {
    count: 3,
    ac: 12,
    hp: 60,
    speed: "30 ft., swim 30 ft.",
    cr: "2",
    xp: 450,
    statBlock: "SRD Giant Constrictor Snake, reskinned as a blackwater lamprey surging onto the span. Huge. Blindsight 10 ft.",
    attack: "2014 (no Multiattack): Bite +6, reach 10 ft., 11 (2d6+4) piercing, or Constrict +6, reach 5 ft., 13 (2d8+4) bludgeoning, grappled (escape DC 16), restrained while grappled, can't constrict another target. 2024: Multiattack Bite + Constrict, DC 14 Str save, escape DC 14. Bite +6, reach 10 ft., 11 (2d6+4) piercing. Constrict 13 (2d8+4) bludgeoning.",
    trait: "Bypass: an adjacent creature can use an action and a DC 15 Strength (Athletics) check to shove one lamprey back into the gorge, removing it. This DC 15 is the scene's bypass, not the grapple escape.",
    edition2024: "2024: Multiattack Bite + Constrict, DC 14 Str save, escape DC 14. AC 12, HP 60, speed 30 ft., swim 30 ft. Bite +6, reach 10 ft., 11 (2d6+4) piercing. Constrict 13 (2d8+4) bludgeoning.",
    tactics: "Surge onto the east rail, grapple one isolated person, and drag them toward the edge. A shoved lamprey does not return."
  });
  const enc = findEnc(adv, "enc-blackwater-lampreys");
  enc.balanceWhy = "Three CR 2 snakes are still under Low for four level-5 characters. The Integrity clock is the real finale.";
  enc.scaling = "3 PCs: 2 lampreys (900 XP) against Low 1500. 5 PCs: 4 lampreys (1800 XP) against Low 2500. 6 PCs: 4 lampreys (1800 XP) against Low 3000.";
  enc.balance = "";
  if (!adv.items.some(item => item.id === "item-plus-one-sword")) {
    adv.items.push({
      id: "item-plus-one-sword",
      name: "+1 Longsword",
      kind: "magic item",
      description: "City-issue steel with a thin line of light along the fuller. Awarded only if the people and the span are both saved.",
      effect: "SRD +1 weapon, uncommon. No attunement in SRD 5.2 or SRD 5.1. +1 to attack and damage rolls. Any simple or martial weapon can replace the longsword; the bonus stays +1."
    });
  }
  const lampreyEnc = findEnc(adv, "enc-blackwater-lampreys");
  lampreyEnc.start = "Three blackwater lampreys climb the east rail when the party reaches the center wagons.";
  lampreyEnc.bypass = "An adjacent creature can use an action and a DC 15 Strength (Athletics) check to shove one lamprey into the gorge. DC 15 is this scene's bypass. It is not the grapple escape DC printed on the stat block.";
  investigate(adv, "scene-ford-lie",
    "The mile-post outside the gate has been recruited by two different stories. Fresh chalk sends traffic to a west ford and calls the bridge already gone. Under the chalk, older letters cut into the wood say ASHEN BRIDGE, ONE MILE. A merchant with a turned wagon wants company if you go west. A wet bootprint over the chalk points east, and from that direction comes one wooden crack too large to be a branch. Soren's slate, still in your hand, says the people are on the span.",
    [
      "Quest giver is Bridgewarden Soren Vale. He is on the bridge. The slate at the east gate is how the job reaches the party if he is later dead or out of reach. The gate sergeant only passes the slate. The mayor does not give this job.",
      "Lead A, red herring: the west ford. Motive: the merchant already turned his wagon around and does not want to be the only one who ran. He has not seen the span. The ford is a flooded ditch. Checking it costs about ten minutes.",
      "Lead B: the chalk itself. Motive of whoever wrote it is panic, not a second bridge. It smears. The carved letters do not.",
      "Lead C, physical: Soren's slate and the bootprint both point east. The crack is audible from the true road. Saving the people still counts if the bridge is lost. Say that before they commit.",
      "Let them question the merchant and test the ford. The slate does not stop being true while they do."
    ]);
  finish(adv, 5, "Level 5 sheets add the +1 longsword on Calder Voss and still carry the wand, cloak, and pearl.", {
    name: "Soren Vale",
    npcId: "npc-soren",
    why: "The people on the span are his watch. His slate hires the party at the east gate because he cannot leave them."
  });
  adv.setup.gmSummary += " Pace: the gate slate, a rolled encounter outside town, the false west ford, a second roll on the last mile, arrival on the span with the caustic trap and ash-mortar puzzle, the rescue under Soren's count, the return to the gate, and the Mere lead.";
  save(file, adv);
}

function mere() {
  const file = root + "data/adventures/the-bell-beneath-the-mere.oneshot.json";
  const adv = load(file);
  if (!adv.scenes.some(s => s.id === "scene-noll-hire")) {
    const locations = [
      loc("loc-ferry-stair", "Oakhaven ferry stair", "The ferry stair drops from Oakhaven's east street to a black skiff and a peg for a red scarf. The water here still has ripples. It smells of rope, tar, and cold iron. Noll Vey keeps the fare box nailed to the rail where he can see it without looking.")
    ];
    const hook = beatScene({
      id: "scene-noll-hire",
      title: "The Scarf Is Off the Peg",
      purpose: "Hook the party at Oakhaven's ferry stair: Noll's apprentice is missing and a bell is ringing where the Mere should be quiet.",
      paceBeat: 1,
      locationId: "loc-ferry-stair",
      minutes: 12,
      npcIds: ["npc-noll"],
      readAloud: "Noll Vey stands on the ferry stair with one hand on the empty peg where Tamsin Reed's red scarf should be. The skiff knocks the piling in an ordinary way. Noll does not look ordinary. “She went to answer a bell,” he says. “The Mere is flat. Bells do not ring under flat water unless somebody built them to. I will pay you to bring her back. I will pay you more if you can tell me why the bell thinks it still has a job.”",
      gmNotes: [
        "Noll rows them. If he is refused or killed, the skiff is unlocked and Tamsin's chart is in the fare box. The night continues.",
        "He believes the bell is a haunting. That belief is incomplete, not a lie he is telling on purpose.",
        "Do not reveal the founders' diversion on the stair."
      ],
      exits: ["scene-stair-roll"],
      exitChoices: [{target: "scene-stair-roll", label: "Cast off", description: "Roll once before the chart is clear."}],
      runSteps: [
        {title: "Give the job", text: "Bring Tamsin back. Find out why the bell is ringing. Name the pay from the endings, not a new number."},
        {title: "Show the empty peg", text: "The scarf is the personal stake. The bell is the mystery."},
        {title: "Noll's limit", text: "He will not dive. He will row. If they attack him, use no stat block beyond a commoner and let the chart carry the job."}
      ],
      advanceWhen: "The party is in the skiff or has taken it, and the stair is behind them."
    });
    const roll1 = rollScene({
      id: "scene-stair-roll",
      title: "Roll at the Stair",
      purpose: "A rolled encounter at the ferry stair before the route across the Mere is clear.",
      locationId: "loc-ferry-stair",
      next: "scene-buoy-lie",
      nextLabel: "Read the chart",
      readAloud: "The stair's lower step is slick and the fare box ticks in the wash. Someone has tied a new cork float beside Noll's old one, painted like a channel buoy and pointing at open water that is not the bell-house. The skiff is ready. The direction is not, until you roll.",
      rows: [
        "A dock idler says the bell is a loose buoy knocking a hull. He has not been out. DC 10 Wisdom (Insight): he wants the ferry to stay shut so he can charge for rumors. The cork float is his.",
        "DC 10 Dexterity (Acrobatics) on the slick step. Failure: Prone, wet, no damage, and the fare box spills Tamsin's spare chalk.",
        "A gull drops a scrap of reed-cloth with one stitched letter N. It matches the NIGHT FLOW marks later. It is not the only copy.",
        "One SRD Hunter Shark fin in the stair's shadow. It leaves if they do not enter the water. 2014: Bite +6, reach 5 ft., 13 (2d8+4) piercing; Blood Frenzy; blindsight 30 ft.; speed 0 ft., swim 40 ft. 2024: 14 (3d6+4), blindsight 60 ft., speed 5 ft. AC 12, HP 45, Water Breathing only. If they fight it here, remove one skimmer from the channel later.",
        "Noll hums the wrong three notes on purpose, then stops, ashamed. Color. The real sequence is in the bell-house.",
        "A coil of rope, 50 feet, mundane. Taking it helps the rescue and is not required."
      ]
    });
    const direction = beatScene({
      id: "scene-buoy-lie",
      title: "The Buoy Is Not the Bell",
      purpose: "Give a clear course to the sunken bell-house and retire the loose-buoy red herring.",
      paceBeat: 3,
      locationId: "loc-ferry-stair",
      minutes: 12,
      npcIds: ["npc-noll"],
      readAloud: "Noll flips the new cork float with his hook and shows you the fresh paint on his fingers' opposite. “That is a toy,” he says. “Tamsin paints buoys orange. This one is white because somebody wanted you to chase it.” He unfolds her chart on the fare box. A line of soundings runs from the Ashen Bridge's direction to a square marked BELL, and the square is not where the white float is trying to go.",
      gmNotes: [
        "Red herring: a loose buoy. The chart, the orange-paint habit, and the NIGHT FLOW scrap agree on the bell-house.",
        "If Noll is dead or silent, the chart is still in the box and the float's paint is still fresh.",
        "Chasing the float costs ten minutes and finds empty water. The chart still works."
      ],
      exits: ["scene-mere-roll"],
      exitChoices: [{target: "scene-mere-roll", label: "Row the sounding line", description: "Roll once on the crossing."}],
      runSteps: [
        {title: "Discard the float", text: "White paint, wrong place. Say it is a decoy."},
        {title: "Open the chart", text: "Bridge direction to the bell square. That is the route."},
        {title: "Fail forward", text: "A wrong row still ends with the square visible on the paper."}
      ],
      advanceWhen: "The party is rowing the chart's line, not the decoy."
    });
    const roll2 = rollScene({
      id: "scene-mere-roll",
      title: "Roll on the Crossing",
      purpose: "A rolled encounter while traveling the Mere toward the bell-house.",
      locationId: "loc-reed-channel",
      next: "scene-landing",
      nextLabel: "Reach the landing",
      readAloud: "The Mere goes flat as soon as the stair is behind you. Ripples die without a reason you can point at. Reed islands stand like stitches. Somewhere ahead a bell rings once, under the water, and the skiff's boards answer it through your boots. You are not at the landing. Roll.",
      rows: [
        "A floating oar, Tamsin's initials burned in the grip. DC 10 Wisdom (Perception) spots it. Failure: it knocks the hull and they have it anyway.",
        "DC 10 Strength (Athletics) against a reed snag. Failure: lose five minutes cutting free. The bell rings again so they cannot miss the direction.",
        "Fog for one minute. It hides nothing that matters. The chart still points.",
        "A single Mere Skimmer bumps the hull and leaves. Use the Hunter Shark block if they attack. Otherwise it is a warning, not initiative.",
        "Noll, if present, almost says the founders' names and swallows them. He does not know the diversion. Do not give it away.",
        "A dry tin with chalk and a half-rubbing of one bell note. It helps the puzzle later and is not the only rubbing."
      ]
    });
    roll2.paceBeat = 4;
    adv.scenes.unshift(hook);
    appendScenes(adv, [roll1, direction, roll2], locations);
    adv.initialState.currentSceneId = "scene-noll-hire";
    adv.flowContract.mainSpine.unshift("scene-noll-hire");
    chainSpine(adv, "scene-noll-hire", ["scene-stair-roll", "scene-buoy-lie", "scene-mere-roll"], "scene-landing");
  }
  if (!adv.scenes.some(s => s.id === "scene-return-noll")) {
    const settle = beatScene({
      id: "scene-return-noll",
      title: "Noll Takes the Count",
      purpose: "Return to Oakhaven's ferry stair and settle with Noll, including the Boots of Elvenkind if Ysra was released.",
      paceBeat: 7,
      locationId: "loc-ferry-stair",
      minutes: 12,
      npcIds: ["npc-noll"],
      readAloud: "The ferry stair has ripples again, or it does not, and Oakhaven can hear the difference from the street. Noll is at the peg. He does not ask about founders first. He asks whether Tamsin climbed the stair under her own power. The fare box is open. Inside it, under the coin, is a pair of soft grey boots that do not quite touch the wood the way boots should.",
      gmNotes: [
        "Pay the gold from the ending they chose.",
        "Release ending: the boots are Boots of Elvenkind. No attunement in either edition. 2014: steps make no sound, and advantage only on Dexterity (Stealth) checks that rely on moving silently. 2024: steps make no sound regardless of the surface, and Advantage on Dexterity (Stealth) checks.",
        "Silence and Preserve endings do not include the boots. The custom Mereglass Token is retired. Series level-6 pregens assume the release ending."
      ],
      exits: ["scene-lead-crypt"],
      exitChoices: [{target: "scene-lead-crypt", label: "Open the service map", description: "Take the Founders' Crypt lead."}],
      runSteps: [
        {title: "Tamsin first", text: "Say whether she is alive. Noll's face follows that answer, not the politics."},
        {title: "Pay and boots", text: "Coin always. Boots only if Ysra was released."},
        {title: "What the town will say", text: "Ask what they tell Oakhaven about the founders. That choice is already in the ending."}
      ],
      advanceWhen: "Noll has paid, Tamsin's fate is known, and any boots have been given or withheld."
    });
    const lead = beatScene({
      id: "scene-lead-crypt",
      title: "Resolution: The Stair under the Town",
      purpose: "End the Mere and point at the Founders' Crypt, which is the planned level-7 module and is not written yet.",
      paceBeat: 8,
      locationId: "loc-ferry-stair",
      minutes: 8,
      npcIds: ["npc-noll"],
      readAloud: "The service-tunnel sketch from the archive, or Noll's copy of the rubbing, ends under a building the town still uses. The label is plain: FOUNDERS' CRYPT. The passage is sealed on the Oakhaven side by a door the ferry stair does not open. Noll folds the paper. “That is not a bell,” he says. “That is the people who moved the water. I will not row you there. It is under our own street, and it can wait until you are ready to knock.”",
      gmNotes: [
        "Level 7, the Founders' Crypt, is planned and not written. Do not improvise it as a published module. Stop on the lead.",
        "This module was worth the step from 6 toward 7. Say that, then stop.",
        "The archive map, Ysra's memory, and this rubbing are three sources. Losing Noll does not erase the paper."
      ],
      exits: [],
      runSteps: [
        {title: "Show the crypt", text: "The passage returns under Oakhaven to the Founders' Crypt."},
        {title: "Say it is not ready", text: "The next module is not on the table yet. Do not invent the crypt's rooms."},
        {title: "Close", text: "End at the stair."}
      ],
      advanceWhen: "The crypt lead is recorded and play stops."
    });
    appendScenes(adv, [settle, lead], []);
    pointResolutions(adv, "scene-return-noll", "Return to Noll");
    adv.flowContract.terminalScenes = ["scene-lead-crypt"];
  }
  const skimmer = findEnc(adv, "enc-mere-skimmers").creatures[0];
  Object.assign(skimmer, {
    count: 4,
    ac: 12,
    hp: 45,
    speed: "5 ft., swim 40 ft.",
    cr: "2",
    xp: 450,
    statBlock: "SRD Hunter Shark, reskinned as a Mere skimmer. Large. Water Breathing only. AC 12, HP 45, CR 2, 450 XP.",
    speed: "2014: 0 ft., swim 40 ft. 2024: 5 ft., swim 40 ft.",
    attack: "2014: Bite +6, reach 5 ft., 13 (2d8+4) piercing; Blood Frenzy; blindsight 30 ft.; speed 0 ft., swim 40 ft. 2024: 14 (3d6+4), blindsight 60 ft., speed 5 ft. Bite +6, reach 5 ft., Advantage if the target is missing any Hit Points.",
    trait: "Water Breathing: it can breathe only underwater. It can reach a creature at the rail and cannot chase across the deck. A struck cork float within 60 feet draws the skimmers for 1 round.",
    edition2024: "2024: 14 (3d6+4), blindsight 60 ft., speed 5 ft. Bite +6, reach 5 ft., Advantage if the target is missing any Hit Points. AC 12, HP 45.",
    tactics: "Ram the hull, bite anyone in the water or leaning on the rail, and break off when bloodied. They are not the mystery."
  });
  const enc = findEnc(adv, "enc-mere-skimmers");
  enc.balanceWhy = "Four hunter sharks stay under Low for four level-6 characters. They cannot cross the deck. The bell is the point.";
  enc.scaling = "3 PCs: 3 skimmers (1350 XP) against Low 1800. 5 PCs: 5 skimmers (2250 XP) against Low 3000. 6 PCs: 5 skimmers (2250 XP) against Low 3600.";
  enc.balance = "";
  replaceStrings(adv, [
    ["Noll gives the party a Mereglass Token: once per long rest, gain advantage on one saving throw against being pushed, pulled, or knocked Prone.", "On the release ending, Noll gives Boots of Elvenkind. No attunement in either edition. 2014: advantage only on Dexterity (Stealth) checks that rely on moving silently. 2024: Advantage on Dexterity (Stealth) checks. The custom Mereglass Token is not awarded."],
    ["Mereglass Token", "Boots of Elvenkind"]
  ]);
  retitleItem(adv, "item-mereglass-token", {
    name: "Boots of Elvenkind",
    kind: "magic item",
    description: "Soft grey boots from the fare box, given if Ysra is released.",
    effect: "No attunement in either edition. 2014: steps make no sound, and advantage only on Dexterity (Stealth) checks that rely on moving silently. 2024: steps make no sound regardless of the surface, and Advantage on Dexterity (Stealth) checks. The custom Mereglass Token is not awarded."
  });
  replaceStrings(adv, [
    ["Two Mere Skimmers", "Four Mere Skimmers"],
    ["both skimmers", "the skimmers"],
    ["both Mere Skimmers", "the Mere Skimmers"]
  ]);
  const skimmerEnc = findEnc(adv, "enc-mere-skimmers");
  skimmerEnc.start = "Four Mere Skimmers bump the ferry in the reed channel.";
  skimmerEnc.bypass = "Throw one cork float and strike the water away from the ruin. The skimmers follow it. They breathe only underwater and cannot chase across the deck.";
  investigate(adv, "scene-buoy-lie",
    "Two courses are tied to the same piling. A new white cork float points at open water and a dock idler calls the bell a loose buoy knocking a hull. Tamsin's chart, still folded in the fare box, draws a line of soundings from the Ashen Bridge's direction to a square marked BELL, and that square is not where the white float points. Noll has orange paint under one nail and none of the white. He looks at the float as if it owes him money. He does not say he is sure.",
    [
      "Quest giver is Noll Vey, the ferryman. He wants Tamsin Reed back and he will pay to know why the bell is ringing. He believes it is a haunting. That belief is incomplete. The mayor does not give this job.",
      "Lead A, red herring: the white buoy and the idler. Motive: the idler wants the ferry shut so he can charge for rumors. The paint is fresh and the wrong color. Tamsin paints buoys orange. Chasing the float costs about ten minutes and finds empty water.",
      "Lead B: Noll. Motive: fear for his apprentice, and a habit of blaming ghosts before paper. He will row. He will not dive. If he is refused or dead, the chart is still in the fare box.",
      "Lead C, physical: Tamsin's chart and, if they found it, the reed-cloth scrap stitched with N. The chart is the course. It does not explain the founders yet.",
      "Let them question the idler and Noll, and let them row the wrong water once. The square on the chart is still there when they come back."
    ]);
  finish(adv, 6, "Level 6 sheets add the Boots of Elvenkind on Ness Quinn and still carry the wand, cloak, pearl, and +1 longsword.", {
    name: "Noll Vey",
    npcId: "npc-noll",
    why: "His apprentice is missing and the bell is ringing on his water. He hires the party at the ferry stair."
  });
  adv.setup.gmSummary += " Pace: Noll's hire at the stair, a rolled encounter before the chart, the false buoy, a second roll on the crossing, arrival at the bell-house with the water trap and the note puzzle, Ysra holding the warning, the return to the stair, and the Founders' Crypt lead.";
  save(file, adv);
}

hollow();
watchtower();
orchard();
bridge();
mere();
console.log("oakhaven pace patch applied");
