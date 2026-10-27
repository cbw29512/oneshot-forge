#!/usr/bin/env node
// Builds the Oakhaven series pregen packs (levels 2–6, SRD 5.1 and SRD 5.2).
// Permanent magic items carry forward from earlier modules. Consumables do not.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const SKILLS = [
  ["acrobatics", "DEX"], ["animal handling", "WIS"], ["arcana", "INT"], ["athletics", "STR"],
  ["deception", "CHA"], ["history", "INT"], ["insight", "WIS"], ["intimidation", "CHA"],
  ["investigation", "INT"], ["medicine", "WIS"], ["nature", "INT"], ["perception", "WIS"],
  ["performance", "CHA"], ["persuasion", "CHA"], ["religion", "INT"], ["sleight of hand", "DEX"],
  ["stealth", "DEX"], ["survival", "WIS"]
];
const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const mod = score => Math.floor((score - 10) / 2);
const profFor = level => (level >= 5 ? 3 : 2);
const xpFor = level => ({2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000}[level]);

const ITEMS = {
  wand: {
    name: "Wand of Secrets",
    bearer: "Ness Quinn",
    from: "Whispers of the Oakhaven Hollow (level 2)",
    text: "Uncommon. No attunement. 3 charges, regains 1d3 expended charges daily at dawn, expend 1 charge. 2014: an action, secret door or trap within 30 feet. 2024: a Magic action, within 60 feet."
  },
  cloak: {
    name: "Cloak of Protection",
    bearer: "Halden Moss",
    from: "Beneath the Eastern Watchtower (level 3)",
    text: "Uncommon, requires attunement. +1 bonus to AC and saving throws while worn. Oakhaven calls it the Saltglass Cloak. The bonus matches SRD 5.2 and the SRD 5.1 Cloak of Protection."
  },
  pearl: {
    name: "Pearl of Power",
    bearer: "Mira Quill",
    from: "The Black Orchard (level 4)",
    text: "Uncommon, requires attunement by a spellcaster. SRD 5.2: Magic action, regain one expended spell slot of level 3 or lower, once until the next dawn. SRD 5.1 wording differs: an action can regain one expended slot, and a slot of 4th level or higher becomes a 3rd-level slot. At these levels nobody has a 4th-level slot, so the result matches."
  },
  sword: {
    name: "+1 Longsword",
    bearer: "Calder Voss",
    from: "The Ashen Bridge (level 5)",
    text: "Weapon, +1. Uncommon. SRD 5.2 does not require attunement. +1 to attack rolls and damage rolls with this weapon. SRD 5.1 +1 weapons likewise do not require attunement."
  },
  boots: {
    name: "Boots of Elvenkind",
    bearer: "Ness Quinn",
    from: "The Bell Beneath the Mere (level 6)",
    text: "Uncommon. No attunement in either edition. 2014: your steps make no sound, and you have advantage on Dexterity (Stealth) checks that rely on moving silently. 2024: your steps make no sound, regardless of the surface, and you have Advantage on Dexterity (Stealth) checks."
  }
};

function carried(level) {
  const list = [];
  if (level >= 2) list.push(ITEMS.wand);
  if (level >= 3) list.push(ITEMS.cloak);
  if (level >= 4) list.push(ITEMS.pearl);
  if (level >= 5) list.push(ITEMS.sword);
  if (level >= 6) list.push(ITEMS.boots);
  return list;
}

function skillBlock(scores, proficient, expertise, prof) {
  const skillsMap = {};
  for (const [name, abil] of SKILLS) {
    const isPro = proficient.has(name);
    const isExp = expertise.has(name);
    const bonus = mod(scores[abil]) + (isPro ? prof : 0) + (isExp ? prof : 0);
    skillsMap[name] = {ability: abil, bonus, proficient: isPro, expertise: isExp};
  }
  return skillsMap;
}

function saveBlock(scores, proficient, prof, cloak) {
  const saveMap = {};
  for (const abil of ABILS) {
    const bonus = mod(scores[abil]) + (proficient.has(abil) ? prof : 0) + (cloak ? 1 : 0);
    saveMap[abil] = {bonus, proficient: proficient.has(abil)};
  }
  return saveMap;
}

function baseSheet(pc) {
  const skillsMap = pc.skillsMap;
  return {
    id: pc.id,
    name: pc.name,
    className: pc.className,
    subclass: pc.subclass,
    race: pc.race,
    background: pc.background,
    role: pc.role,
    recommended: true,
    portrait: pc.portrait,
    alignment: pc.alignment,
    scores: pc.scores,
    saveMap: pc.saveMap,
    skillsMap,
    skills: SKILLS.map(([name]) => name),
    ac: pc.ac,
    acNotes: pc.acNotes,
    initiative: mod(pc.scores.DEX) + (pc.initBonus || 0),
    speedFt: pc.speedFt,
    hp: pc.hp,
    hitDice: pc.hitDice,
    darkvision: 0,
    proficiencies: pc.proficiencies,
    attackList: pc.attackList,
    bonusActions: pc.bonusActions,
    reactions: pc.reactions,
    spellcasting: pc.spellcasting,
    spellList: pc.spellList,
    featureList: pc.featureList,
    equipment: pc.equipment,
    gp: pc.gp,
    personality: pc.personality,
    appearance: pc.appearance,
    passivePerception: 10 + skillsMap.perception.bonus,
    passiveInsight: 10 + skillsMap.insight.bonus,
    passiveInvestigation: 10 + skillsMap.investigation.bonus,
    level: pc.level,
    rules: pc.rules,
    xp: xpFor(pc.level),
    proficiency: pc.prof,
    class: pc.className,
    saves: ABILS.filter(a => pc.saveMap[a].proficient).join(", "),
    speed: pc.speedFt + " ft.",
    attacks: pc.attackList.map(a => a.name).join("; "),
    features: pc.featureList.map(f => f.name).join("; "),
    gear: Array.isArray(pc.equipment) ? pc.equipment.join(", ") : pc.equipment,
    magicItems: pc.magicItems
  };
}

function fighterScores(edition, level) {
  if (edition === "2014") {
    const scores = {STR: 16, DEX: 15, CON: 14, INT: 9, WIS: 11, CHA: 13};
    if (level >= 4) scores.STR = 18;
    if (level >= 6) scores.STR = 20;
    return scores;
  }
  const scores = {STR: 17, DEX: 14, CON: 14, INT: 8, WIS: 10, CHA: 12};
  if (level >= 4) scores.STR = 19;
  if (level >= 6) { scores.STR = 20; scores.CON = 15; }
  return scores;
}

function rogueScores(edition, level) {
  if (edition === "2014") {
    const scores = {STR: 9, DEX: 16, CON: 15, INT: 13, WIS: 14, CHA: 11};
    if (level >= 4) scores.DEX = 18;
    return scores;
  }
  const scores = {STR: 10, DEX: 17, CON: 14, INT: 14, WIS: 12, CHA: 8};
  if (level >= 4) scores.DEX = 19;
  return scores;
}

function clericScores(edition, level) {
  if (edition === "2014") {
    const scores = {STR: 14, DEX: 11, CON: 15, INT: 9, WIS: 16, CHA: 13};
    if (level >= 4) scores.WIS = 18;
    return scores;
  }
  const scores = {STR: 14, DEX: 8, CON: 14, INT: 10, WIS: 17, CHA: 12};
  if (level >= 4) scores.WIS = 19;
  return scores;
}

function wizardScores(edition, level) {
  if (edition === "2014") {
    const scores = {STR: 9, DEX: 14, CON: 15, INT: 16, WIS: 13, CHA: 11};
    if (level >= 4) scores.INT = 18;
    return scores;
  }
  const scores = {STR: 8, DEX: 12, CON: 14, INT: 17, WIS: 14, CHA: 10};
  if (level >= 4) scores.INT = 19;
  return scores;
}

function hpFor(die, level, conMod) {
  const first = die + conMod;
  const later = Math.floor(die / 2) + 1 + conMod;
  return first + later * (level - 1);
}

function itemsFor(name, level) {
  return carried(level).filter(item => item.bearer === name);
}

function fighter(edition, level) {
  const scores = fighterScores(edition, level);
  const prof = profFor(level);
  const mine = itemsFor("Calder Voss", level);
  const sword = mine.some(i => i.name === "+1 Longsword");
  const str = mod(scores.STR);
  const attack = prof + str + (sword ? 1 : 0);
  const dmg = str + (sword ? 1 : 0);
  const ac = 19;
  const proficient = new Set(["athletics", "intimidation", "perception", "survival"]);
  const expertise = new Set();
  if (edition === "2024") proficient.add("insight");
  const skillsMap = skillBlock(scores, proficient, expertise, prof);
  const saveMap = saveBlock(scores, new Set(["STR", "CON"]), prof, false);
  const features = [
    {name: "Fighting Style: Defense", source: edition === "2024" ? "Fighting Style feat" : "Fighter 1", text: "While wearing Light, Medium, or Heavy armor, +1 AC. Included in AC 19."},
    {name: "Second Wind", source: "Fighter 1", text: edition === "2024"
      ? `Bonus Action: regain 1d10 + ${level} HP. 2 uses. Regain 1 use on a Short Rest and all on a Long Rest.`
      : `Bonus Action: regain 1d10 + ${level} HP. Once per Short Rest.`}
  ];
  if (edition === "2024") {
    features.push({name: "Resourceful", source: "Human", text: "You gain Heroic Inspiration whenever you finish a Long Rest. Expend it to reroll any die immediately after rolling it, and use the new roll. You can never have more than one."});
    features.push({name: "Weapon Mastery", source: "Fighter 1", text: "Longsword (Sap), Spear (Sap), Handaxe (Vex). Sap: on a hit, the target has Disadvantage on its next attack roll before the start of your next turn." + (level >= 4 ? " The class table grants 4 masteries from level 4. Choose the fourth weapon from the SRD list at the table; this sheet does not invent a fourth property." : " Levels 1–3 grant 3 masteries.")});
    features.push({name: "Savage Attacker", source: "Soldier origin feat", text: "Once per turn when you hit with a weapon, roll the weapon's damage dice twice and use either roll."});
    features.push({name: "Alert", source: "Human origin feat", text: "Add proficiency bonus to Initiative. After rolling Initiative, you may swap with one willing ally who is not Incapacitated."});
  }
  if (edition === "2014") features.push({name: "Oakhaven Watch", source: "Custom background", text: "The east gate will read you the day's duty slate. No extra mechanic."});
  features.push({name: "Action Surge", source: "Fighter 2", text: edition === "2024"
    ? "On your turn, take one additional action, except the Magic action. Once until you finish a Short or Long Rest."
    : "On your turn, take one additional action. Once per Short Rest. The 2014 feature does not exclude casting a spell."});
  if (edition === "2024") features.push({name: "Tactical Mind", source: "Fighter 2", text: "When you fail an ability check, expend Second Wind to add 1d10 instead of healing. If the check still fails, the use is not spent."});
  if (level >= 3 && edition === "2024") {
    features.push({name: "Improved Critical", source: "Champion 3", text: "Weapon and Unarmed Strike attacks crit on 19–20."});
    features.push({name: "Remarkable Athlete", source: "Champion 3", text: "Advantage on Initiative and Strength (Athletics). After a Critical Hit, move up to half your Speed without provoking Opportunity Attacks. 2014 Remarkable Athlete is level 7 and is not on this sheet."});
  }
  if (level >= 3 && edition === "2014") {
    features.push({name: "Improved Critical", source: "Champion 3", text: "Weapon attacks score a critical hit on 19–20. 2014 Champion does not grant Remarkable Athlete until level 7."});
  }
  if (level >= 5) features.push({name: "Extra Attack", source: "Fighter 5", text: "Attack twice, instead of once, when you take the Attack action on your turn."});
  if (level >= 5 && edition === "2024") features.push({name: "Tactical Shift", source: "Fighter 5", text: "When you use Second Wind as a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks."});
  return baseSheet({
    id: "pregen-calder",
    name: "Calder Voss",
    className: "Fighter",
    subclass: level >= 3 ? "Champion" : "—",
    race: edition === "2024" ? "Human (Medium)" : "Human",
    background: edition === "2024" ? "Soldier (SRD 5.2)" : "Oakhaven Watch (custom background)",
    role: "Front line. Holds the door and the wounded.",
    portrait: "assets/pregens/brann.jpg",
    alignment: "Lawful Good",
    scores, saveMap, skillsMap, prof, level,
    ac, acNotes: "Chain mail 16 + shield 2 + Defense 1 = 19. " + (sword ? "Attacks below include the +1 longsword." : "No magic weapon yet."),
    speedFt: 30,
    hp: hpFor(10, level, mod(scores.CON)),
    hitDice: `${level}d10`,
    proficiencies: {
      armor: ["light armor", "medium armor", "heavy armor", "shields"],
      weapons: ["simple weapons", "martial weapons"],
      tools: edition === "2024" ? ["one gaming set"] : [],
      languages: edition === "2024" ? ["Common", "two standard languages"] : ["Common", "Dwarvish"]
    },
    attackList: [
      {name: sword ? "+1 Longsword" : "Longsword", bonus: attack, damage: `1d8+${dmg}`, type: "slashing", notes: `Versatile 1d10+${dmg}. ${edition === "2024" ? "Sap mastery." : "2014: no weapon mastery."} ${level >= 5 ? "Extra Attack: two attacks with the Attack action." : "One attack with the Attack action."}`},
      {name: "Javelin", bonus: attack - (sword ? 1 : 0), damage: `1d6+${str}`, type: "piercing", notes: "Thrown 30/120. Not the +1 weapon."}
    ],
    bonusActions: ["Second Wind"],
    reactions: ["Opportunity Attack"],
    featureList: features,
    equipment: ["Chain mail", "Shield", sword ? "+1 longsword" : "Longsword", "4 javelins", ...mine.map(i => i.name)],
    gp: 15,
    personality: {trait: "Counts doors, spears, and people before he counts treasure.", ideal: "The town stands if somebody holds the line.", bond: "Oakhaven's east gate taught him the job.", flaw: "He will not leave a fallen person to make a cleaner retreat."},
    appearance: "Broad human in chain mail, shield scarred, voice flat and brief.",
    rules: edition === "2024" ? "SRD 5.2.1" : "SRD 5.1",
    initBonus: edition === "2024" ? prof : 0,
    magicItems: mine,
    spellcasting: undefined,
    spellList: undefined
  });
}

function rogue(edition, level) {
  const scores = rogueScores(edition, level);
  const prof = profFor(level);
  const mine = itemsFor("Ness Quinn", level);
  const dex = mod(scores.DEX);
  const attack = prof + dex;
  const sneak = level >= 5 ? 3 : level >= 3 ? 2 : 1;
  const proficient = new Set(["stealth", "sleight of hand", "acrobatics", "perception"]);
  if (edition === "2024") proficient.add("investigation").add("athletics").add("insight");
  const expertise = new Set(["stealth", "sleight of hand"]);
  if (level >= 6) expertise.add("perception").add("acrobatics");
  const skillsMap = skillBlock(scores, proficient, expertise, prof);
  if (mine.some(i => i.name.startsWith("Boots"))) {
    skillsMap.stealth.bonus += 0;
    skillsMap.stealth.notes = edition === "2014"
      ? "Boots of Elvenkind: no attunement. Advantage only on Stealth checks that rely on moving silently, not a flat bonus."
      : "Boots of Elvenkind: no attunement. Advantage on Dexterity (Stealth) checks, not a flat bonus.";
  }
  const saveMap = saveBlock(scores, new Set(["DEX", "INT"]), prof, false);
  const features = [
    {name: "Expertise", source: "Rogue 1", text: "Double proficiency on Stealth and Sleight of Hand." + (level >= 6 ? " At 6, also Perception and Acrobatics." : "")},
    {name: "Sneak Attack", source: "Rogue 1", text: `Once per turn, +${sneak}d6 weapon damage with a Finesse or ranged weapon if you have Advantage, or if an ally is within 5 feet of the target and you do not have Disadvantage. 2024 ally must not be Incapacitated. 2014 ally must not be incapacitated.`}
  ];
  if (edition === "2024") {
    features.push({name: "Resourceful", source: "Human", text: "You gain Heroic Inspiration whenever you finish a Long Rest. Expend it to reroll any die immediately after rolling it, and use the new roll. You can never have more than one."});
    features.push({name: "Weapon Mastery", source: "Rogue 1", text: "Shortsword (Vex) and Dagger (Nick). Vex: when you hit and deal damage, Advantage on your next attack against that creature before the end of your next turn. Nick: the Light extra attack is part of the Attack action, once per turn."});
    features.push({name: "Alert", source: "Criminal origin feat", text: "Add your Proficiency Bonus to Initiative. Immediately after rolling Initiative, you may swap with one willing ally in the same combat unless you or that ally is Incapacitated."});
    features.push({name: "Savage Attacker", source: "Human origin feat", text: "Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll."});
    features.push({name: "Cunning Action", source: "Rogue 2", text: "Bonus Action: Dash, Disengage, or Hide."});
  } else {
    features.push({name: "Cunning Action", source: "Rogue 2", text: "Bonus Action: Dash, Disengage, or Hide. 2014 has no Steady Aim and no Cunning Strike."});
  }
  if (level >= 3) {
    features.push({name: "Fast Hands", source: "Thief 3", text: edition === "2024"
      ? "Bonus Action: Sleight of Hand to pick a lock, disarm a trap, or pick a pocket; or take the Utilize action; or take the Magic action to use a magic item that requires that action."
      : "Bonus Action: Sleight of Hand, use an object, or use thieves' tools to disarm a trap or open a lock."});
    features.push({name: "Second-Story Work", source: "Thief 3", text: edition === "2024"
      ? "Climb Speed equal to your Speed. Jump distance uses Dexterity instead of Strength."
      : "Climbing does not cost extra movement. A running long jump uses Dexterity."});
    if (edition === "2024") features.push({name: "Steady Aim", source: "Rogue 3", text: "Bonus Action: Advantage on your next attack this turn if you have not moved. Speed becomes 0 until the end of the turn. Not a 2014 SRD feature."});
  }
  if (level >= 5) {
    features.push({name: "Uncanny Dodge", source: "Rogue 5", text: "Reaction when an attacker you can see hits you: halve that attack's damage (round down)."});
    if (edition === "2024") features.push({name: "Cunning Strike", source: "Rogue 5", text: "When you deal Sneak Attack, forgo 1d6 to add one effect. DC 8 + Dex mod + prof. Trip: Large or smaller target, Dex save or Prone. Withdraw: move half your Speed without Opportunity Attacks. Poison needs a Poisoner's Kit and is not carried."});
  }
  const ac = 12 + dex;
  return baseSheet({
    id: "pregen-ness",
    name: "Ness Quinn",
    className: "Rogue",
    subclass: level >= 3 ? "Thief" : "—",
    race: edition === "2024" ? "Human (Medium)" : "Human",
    background: edition === "2024" ? "Criminal (SRD 5.2)" : "Lane Runner (custom background)",
    role: "Locks, scouting, and the wand that finds traps.",
    portrait: "assets/pregens/nyx.jpg",
    alignment: "Neutral Good",
    scores, saveMap, skillsMap, prof, level,
    ac, acNotes: `Studded leather 12 + Dex ${dex >= 0 ? "+" : ""}${dex} = ${ac}.`,
    speedFt: 30,
    hp: hpFor(8, level, mod(scores.CON)),
    hitDice: `${level}d8`,
    proficiencies: {
      armor: ["light armor"],
      weapons: ["simple weapons", "hand crossbows", "longswords", "rapiers", "shortswords"],
      tools: ["thieves' tools"],
      languages: ["Common", "Thieves' Cant"]
    },
    attackList: [
      {name: "Shortsword", bonus: attack, damage: `1d6+${dex}`, type: "piercing", notes: `Finesse. Sneak Attack +${sneak}d6 once per turn when it qualifies. ${edition === "2024" ? "Vex." : ""}`},
      {name: "Dagger", bonus: attack, damage: `1d4+${dex}`, type: "piercing", notes: "Finesse, light, thrown 20/60. " + (edition === "2024" ? "Nick: one Light extra attack as part of the Attack action, no ability modifier on its damage unless the modifier is negative." : "Two-weapon fighting uses a bonus action and does not add Dex to the off-hand damage.")}
    ],
    bonusActions: ["Cunning Action: Dash, Disengage, or Hide", ...(level >= 3 ? ["Fast Hands"] : []), ...(edition === "2024" && level >= 3 ? ["Steady Aim"] : [])],
    reactions: level >= 5 ? ["Uncanny Dodge"] : ["Opportunity Attack"],
    featureList: features,
    equipment: ["Studded leather", "Shortsword", "2 daggers", "Thieves' tools", ...mine.map(i => i.name)],
    gp: 20,
    personality: {trait: "Names the exit before she names the treasure.", ideal: "A locked door is a question, not an insult.", bond: "The eastern lane still knows her knock.", flaw: "She will open the box before anyone agrees."},
    appearance: "Lean human in studded leather, ink on two fingers, boots quieter than the floor.",
    rules: edition === "2024" ? "SRD 5.2.1" : "SRD 5.1",
    initBonus: edition === "2024" ? prof : 0,
    magicItems: mine
  });
}

function cleric(edition, level) {
  const scores = clericScores(edition, level);
  const prof = profFor(level);
  const mine = itemsFor("Halden Moss", level);
  const cloak = mine.some(i => i.name === "Cloak of Protection");
  const wis = mod(scores.WIS);
  const str = mod(scores.STR);
  const dc = 8 + prof + wis;
  const spellAttack = prof + wis;
  const proficient = new Set(["insight", "religion", "medicine", "history"]);
  if (edition === "2024") proficient.add("persuasion");
  const skillsMap = skillBlock(scores, proficient, new Set(), prof);
  const saveMap = saveBlock(scores, new Set(["WIS", "CHA"]), prof, cloak);
  const cantripDice = level >= 5 ? "2d8" : "1d8";
  const cure = edition === "2024" ? "2d8" : "1d8";
  const healWord = edition === "2024" ? "2d4" : "1d4";
  const features = [];
  if (edition === "2024") {
    features.push({name: "Resourceful", source: "Human", text: "You gain Heroic Inspiration whenever you finish a Long Rest. Expend it to reroll any die immediately after rolling it, and use the new roll. You can never have more than one."});
    features.push({name: "Alert", source: "Human origin feat", text: "Add your Proficiency Bonus to Initiative. Immediately after rolling Initiative, you may swap with one willing ally in the same combat unless you or that ally is Incapacitated."});
    features.push({name: "Divine Order: Protector", source: "Cleric 1", text: "Martial weapon proficiency and Heavy armor training. Life Domain is not chosen until level 3 in 2024."});
    features.push({name: "Magic Initiate (Cleric)", source: "Acolyte origin feat", text: "Guidance and Spare the Dying if not already known, and Bless always prepared. Cast Bless once without a slot per Long Rest; you may also spend a slot."});
    const channelUses = level >= 6 ? 3 : 2;
    if (level >= 2) features.push({name: `Channel Divinity (${channelUses} uses)`, source: "Cleric 2", text: `The SRD 5.2.1 cleric table gives ${channelUses} uses at level ${level} (2 at levels 2–5, 3 at level 6). Regain 1 use on a Short Rest and all on a Long Rest. Divine Spark: Magic action, 30 ft., 1d8 + Wis mod healing OR Con save for that much Necrotic or Radiant (half on success). Turn Undead: Wisdom save or Frightened and Incapacitated for 1 minute, moving away; damage ends it.`});
  } else {
    features.push({name: "Life Domain", source: "Cleric 1", text: "Heavy armor proficiency. Disciple of Life: when a 1st-level or higher spell restores HP, the creature regains extra HP equal to 2 + the spell's level."});
    features.push({name: "Disciple of Life", source: "Life 1", text: "Healing spells of 1st level or higher restore an extra 2 + spell level HP. 2024 moves this feature to level 3."});
    if (level >= 2) features.push({name: "Channel Divinity: Preserve Life", source: "Life 2", text: `Restore ${5 * level} HP divided among creatures within 30 feet, none above half their maximum. Also Turn Undead. Uses: ${level >= 6 ? "2" : "1"} per short rest.`});
  }
  if (edition === "2024" && level >= 3) {
    features.push({name: "Disciple of Life", source: "Life 3", text: "When you cast a spell with a slot that restores HP, the creature regains extra HP equal to 2 + the slot's level on that turn."});
    features.push({name: "Preserve Life", source: "Life 3", text: `Magic action, expend Channel Divinity: restore ${5 * level} HP divided among Bloodied creatures within 30 feet, including you. No creature above half its maximum.`});
  }
  if (level >= 5 && edition === "2024") features.push({name: "Sear Undead", source: "Cleric 5", text: "When you use Turn Undead, each Undead that fails the save also takes Radiant damage equal to a number of d8s equal to your Wisdom modifier (minimum 1d8)."});
  if (level >= 5 && edition === "2014") features.push({name: "Destroy Undead", source: "Cleric 5", text: "When an Undead of CR 1/2 or lower fails its save against Turn Undead, it is destroyed."});
  if (level >= 6) features.push({name: "Blessed Healer", source: "Life 6", text: "When you cast a spell with a slot that restores HP to a creature other than you, you also regain 2 + the slot's level HP."});
  const domain = [];
  if (edition === "2014" || level >= 3) domain.push("Bless", "Cure Wounds");
  if (level >= 3 && edition === "2014") domain.push("Lesser Restoration", "Spiritual Weapon");
  if (level >= 3 && edition === "2024") domain.push("Aid", "Lesser Restoration");
  if (level >= 5 && edition === "2014") domain.push("Revivify", "Beacon of Hope");
  if (level >= 5 && edition === "2024") domain.push("Mass Healing Word", "Revivify");
  const prepared = ["Healing Word", "Shield of Faith", "Bless", "Cure Wounds"];
  const spellList = [
    {level: 0, name: "Sacred Flame", time: "action", range: "60 ft.", effect: `Dex save DC ${dc} or ${cantripDice} radiant. Cover does not help. Cantrip die becomes 2d8 at level 5 in both editions.`},
    {level: 0, name: "Guidance", time: edition === "2024" ? "action" : "action", range: "touch", effect: edition === "2024" ? "Concentration, 1 minute. One willing creature adds 1d4 to one ability check." : "Concentration, 1 minute. Touch: the target may add 1d4 to one ability check before the spell ends."},
    {level: 0, name: "Light", time: "action", range: "touch", effect: "One object sheds bright light 20 ft. and dim light 20 ft. for 1 hour."},
    {level: 1, name: "Cure Wounds", time: "action", range: "touch", effect: `One creature regains ${cure} + ${wis} HP. 2024 is 2d8 + mod; 2014 is 1d8 + mod. Disciple of Life adds 2 + slot level when that feature is on this sheet.`},
    {level: 1, name: "Healing Word", time: "bonus action", range: "60 ft.", effect: `One creature you can see regains ${healWord} + ${wis} HP. 2024 is 2d4 + mod; 2014 is 1d4 + mod.`},
    {level: 1, name: "Bless", time: "action", range: edition === "2024" ? "30 ft." : "30 ft.", effect: "Concentration, 1 minute. Up to three creatures add 1d4 to attack rolls and saving throws."},
    {level: 1, name: "Shield of Faith", time: "bonus action", range: "60 ft.", effect: "Concentration, 10 minutes. One creature gains +2 AC."}
  ];
  if (level >= 4) spellList.push({level: 0, name: "Spare the Dying", time: "action", range: "touch", effect: "A living creature at 0 HP becomes stable."});
  if (level >= 3) spellList.push({level: 2, name: "Lesser Restoration", time: edition === "2024" ? "bonus action" : "action", range: "touch", effect: edition === "2024" ? "End Blinded, Deafened, Paralyzed, or Poisoned. 2024 casting time is a Bonus Action. 2014 is an action and can also end one disease." : "End one disease or the Blinded, Deafened, Paralyzed, or Poisoned condition. Action, not a bonus action."});
  if (level >= 3 && edition === "2014") spellList.push({level: 2, name: "Spiritual Weapon", time: "bonus action", range: "60 ft.", effect: "SRD 5.1 Life Domain, always prepared from cleric level 3. Duration 1 minute, not concentration. A spectral weapon appears within range. Melee spell attack against a creature within 5 feet: 1d8 + your spellcasting modifier force. On later turns, a bonus action moves it 20 feet and repeats the attack. A slot of 3rd level or higher increases the damage by 1d8 for every two slot levels above 2nd. Not on the 2024 Life list."});
  if (level >= 3 && edition === "2024") spellList.push({level: 2, name: "Aid", time: "action", range: "30 ft.", effect: "8 hours. Up to three creatures: +5 max HP and +5 current HP. +5 more per slot level above 2."});
  if (level >= 5) spellList.push({level: 3, name: "Revivify", time: "action", range: "touch", effect: "A creature that died within the last minute returns with 1 HP. Consumes a diamond worth 300+ GP. Cannot restore missing body parts or death from old age."});
  if (level >= 5 && edition === "2014") spellList.push({level: 3, name: "Beacon of Hope", time: "action", range: "30 ft.", effect: "SRD 5.1 Life Domain, always prepared from cleric level 5. Concentration, up to 1 minute. Choose any number of creatures within range. Each target has advantage on Wisdom saving throws and death saving throws, and regains the maximum number of hit points possible from any healing. Not on the 2024 Life list."});
  if (level >= 5 && edition === "2024") spellList.push({level: 3, name: "Mass Healing Word", time: "bonus action", range: "60 ft.", effect: `Up to six creatures regain 2d4 + ${wis} HP.`});
  const ac = (cloak ? 19 : 18);
  return baseSheet({
    id: "pregen-halden",
    name: "Halden Moss",
    className: "Cleric",
    subclass: (edition === "2014" || level >= 3) ? "Life Domain" : "—",
    race: edition === "2024" ? "Human (Medium)" : "Human",
    background: edition === "2024" ? "Acolyte (SRD 5.2)" : "Acolyte (SRD 5.1)",
    role: "Keeps people alive and answers the shrine.",
    portrait: "assets/pregens/pell.jpg",
    alignment: "Neutral Good",
    scores, saveMap, skillsMap, prof, level,
    ac, acNotes: `Chain mail 16 + shield 2 = 18${cloak ? " + Cloak of Protection 1 = 19. Cloak also adds +1 to every saving throw." : "."}`,
    speedFt: 30,
    hp: hpFor(8, level, mod(scores.CON)),
    hitDice: `${level}d8`,
    proficiencies: {
      armor: ["light armor", "medium armor", "heavy armor", "shields"],
      weapons: edition === "2024" ? ["simple weapons", "martial weapons"] : ["simple weapons"],
      tools: [],
      languages: ["Common"]
    },
    attackList: [
      {name: "Mace", bonus: prof + str, damage: `1d6+${str}`, type: "bludgeoning", notes: "One melee attack. Spellcasting is the better action most rounds."},
      {name: "Sacred Flame", bonus: dc, damage: cantripDice, type: "radiant", notes: `Dexterity save DC ${dc}, not an attack roll.`}
    ],
    bonusActions: ["Healing Word", "Shield of Faith", ...(edition === "2014" && level >= 3 ? ["Spiritual Weapon"] : []), ...(edition === "2024" && level >= 3 ? ["Lesser Restoration (2024 bonus action)"] : [])],
    reactions: ["Opportunity Attack"],
    spellcasting: {
      ability: "Wisdom",
      saveDC: dc,
      attack: spellAttack,
      slots: level === 2 ? {1: 3} : level === 3 ? {1: 4, 2: 2} : level === 4 ? {1: 4, 2: 3} : level === 5 ? {1: 4, 2: 3, 3: 2} : {1: 4, 2: 3, 3: 3},
      focus: "holy symbol",
      prepareCount: edition === "2024"
        ? `SRD 5.2 class table says ${({2: 5, 3: 6, 4: 7, 5: 9, 6: 10}[level])} prepared spells; domain spells are extra. This sheet prints only spells whose text was checked. Fill any empty slots from the SRD cleric list.`
        : `SRD 5.1 prepared count is ${wis + level} (Wis mod + cleric level). Life Domain spells are always prepared and extra: Spiritual Weapon from level 3, Beacon of Hope from level 5. Other printed spells are the checked SRD list; fill any remaining slots from the SRD cleric list.`,
      cantrips: spellList.filter(s => s.level === 0).map(s => s.name),
      prepared: [...new Set([...domain, ...prepared])]
    },
    spellList,
    featureList: features,
    equipment: ["Chain mail", "Shield", "Mace", "Holy symbol", ...mine.map(i => i.name)],
    gp: 15,
    personality: {trait: "Asks who is hurt before he asks what is evil.", ideal: "A prayer that does not help a body is unfinished.", bond: "The chapel at Oakhaven still has his spare robe.", flaw: "He will spend the last slot on a stranger."},
    appearance: "Weathered human in chain mail under a plain cloak, holy symbol worn smooth.",
    rules: edition === "2024" ? "SRD 5.2.1" : "SRD 5.1",
    initBonus: edition === "2024" ? prof : 0,
    magicItems: mine
  });
}

function wizard(edition, level) {
  const scores = wizardScores(edition, level);
  const prof = profFor(level);
  const mine = itemsFor("Mira Quill", level);
  const int = mod(scores.INT);
  const dex = mod(scores.DEX);
  const dc = 8 + prof + int;
  const spellAttack = prof + int;
  const bolt = level >= 5 ? "2d10" : "1d10";
  const proficient = new Set(["arcana", "investigation", "history", "insight"]);
  if (edition === "2024") proficient.add("nature");
  const expertise = new Set(edition === "2024" ? ["arcana"] : []);
  const skillsMap = skillBlock(scores, proficient, expertise, prof);
  const saveMap = saveBlock(scores, new Set(["INT", "WIS"]), prof, false);
  const features = [
    {name: "Arcane Recovery", source: "Wizard 1", text: `Once per Long Rest, at the end of a Short Rest, recover expended slots whose total levels do not exceed ${Math.ceil(level / 2)} and none of which is 6th level or higher.`},
    {name: "Ritual Adept", source: edition === "2024" ? "Wizard 1" : "Wizard 1", text: "You can cast a ritual from your spellbook without preparing it. 2024 names this Ritual Adept; 2014 is part of Spellcasting. Read from the book."}
  ];
  if (edition === "2024") {
    features.push({name: "Resourceful", source: "Human", text: "You gain Heroic Inspiration whenever you finish a Long Rest. Expend it to reroll any die immediately after rolling it, and use the new roll. You can never have more than one."});
    features.push({name: "Alert", source: "Human origin feat", text: "Add your Proficiency Bonus to Initiative. Immediately after rolling Initiative, you may swap with one willing ally in the same combat unless you or that ally is Incapacitated."});
    features.push({name: "Scholar", source: "Wizard 2", text: "Expertise in Arcana."});
    features.push({name: "Magic Initiate (Wizard)", source: "Sage origin feat", text: "Light and Mage Hand, and Shield always prepared. Cast Shield once without a slot per Long Rest."});
  }
  if (level >= 3 && edition === "2024") {
    features.push({name: "Potent Cantrip", source: "Evoker 3", text: "If you miss with a damaging cantrip or the target saves, the target takes half the cantrip's damage and no extra effect. 2014 Potent Cantrip is level 6."});
    features.push({name: "Evocation Savant", source: "Evoker 3", text: "Two Evocation spells of level 2 or lower were added to the book for free (Thunderwave, Scorching Ray). When you gain a new slot level, add one Evocation spell of that level for free."});
  }
  if (level >= 2 && edition === "2014") {
    features.push({name: "Sculpt Spells", source: "Evoker 2", text: "When you cast an evocation spell that affects other creatures you can see, choose 1 + the spell's level of them. They automatically succeed and take no damage. 2024 moves Sculpt Spells to level 6."});
    features.push({name: "Evocation Savant", source: "Evoker 2", text: "Copying evocation spells into the spellbook costs half the usual gold and time."});
  }
  if (level >= 5) features.push({name: "Memorize / 3rd-level slots", source: "Wizard 5", text: edition === "2024" ? "Memorize Spell: whenever you finish a Short Rest, you can replace one prepared spell with another spell from your book of a level you can cast." : "3rd-level spell slots. 2014 has no Memorize Spell feature."});
  if (level >= 6 && edition === "2024") features.push({name: "Sculpt Spells", source: "Evoker 6", text: "When you cast an Evocation spell that affects other creatures you can see, choose 1 + the spell's level of them. They automatically succeed and take no damage even if a success would normally deal half."});
  if (level >= 6 && edition === "2014") features.push({name: "Potent Cantrip", source: "Evoker 6", text: "Creatures who save against your cantrip, or whom you miss, take half the cantrip's damage and no additional effect."});
  const preparedCount = edition === "2024" ? ({2: 5, 3: 6, 4: 7, 5: 9, 6: 10}[level]) : int + level;
  const spellList = [
    {level: 0, name: "Fire Bolt", time: "action", range: "120 ft.", effect: `Ranged spell attack +${spellAttack}, ${bolt} fire. A flammable unattended object starts burning. ${level >= 5 && edition === "2024" ? "Potent Cantrip: half damage on a miss." : ""}`},
    {level: 0, name: "Prestidigitation", time: "action", range: "10 ft.", effect: "A minor sensory effect: clean, soil, warm, chill, flavor, or a mark, lasting up to 1 hour."},
    {level: 0, name: "Ray of Frost", time: "action", range: "60 ft.", effect: `Ranged spell attack +${spellAttack}, ${level >= 5 ? "2d8" : "1d8"} cold, and the target's speed drops by 10 feet until the start of your next turn.`},
    {level: 1, name: "Mage Armor", time: "action", range: "touch", effect: `8 hours. A willing unarmored creature's base AC becomes 13 + Dex modifier. On Mira that is ${13 + dex}.`},
    {level: 1, name: "Shield", time: "reaction", range: "self", effect: "When you are hit by an attack or targeted by Magic Missile: +5 AC until the start of your next turn, including against the triggering attack, and Magic Missile deals no damage."},
    {level: 1, name: "Magic Missile", time: "action", range: "120 ft.", effect: "Three darts, each 1d4+1 force, hitting automatically. You may split them. +1 dart per slot level above 1."},
    {level: 1, name: "Thunderwave", time: "action", range: "self (15-ft cube)", effect: `Con save DC ${dc}: 2d8 thunder and pushed 10 feet, or half damage and not pushed on a success.`}
  ];
  if (level >= 3) spellList.push(
    {level: 2, name: "Misty Step", time: "bonus action", range: "self", effect: "Teleport up to 30 feet to an unoccupied space you can see."},
    {level: 2, name: "Scorching Ray", time: "action", range: "120 ft.", effect: `Three rays, each a ranged spell attack +${spellAttack} for 2d6 fire. One extra ray per slot level above 2.`}
  );
  if (level >= 5) spellList.push({level: 3, name: "Fireball", time: "action", range: "150 ft.", effect: `20-foot radius. Dex save DC ${dc}: 8d6 fire, half on a success. Unattended flammable objects ignite. ${level >= 6 && edition === "2024" ? "Sculpt Spells can spare 4 creatures (1 + spell level)." : ""}`});
  const ac = 13 + dex;
  return baseSheet({
    id: "pregen-mira",
    name: "Mira Quill",
    className: "Wizard",
    subclass: level >= 3 ? "Evoker" : (edition === "2014" ? "Evoker" : "—"),
    race: edition === "2024" ? "Human (Medium)" : "Human",
    background: edition === "2024" ? "Sage (SRD 5.2)" : "Apothecary Clerk (custom background)",
    role: "Control, fire, and the spell the party is missing.",
    portrait: "assets/pregens/ivo.jpg",
    alignment: "Neutral Good",
    scores, saveMap, skillsMap, prof, level,
    ac, acNotes: `Unarmored 10 + Dex ${dex} until Mage Armor: base AC 13 + Dex = ${ac}.`,
    speedFt: 30,
    hp: hpFor(6, level, mod(scores.CON)),
    hitDice: `${level}d6`,
    proficiencies: {
      armor: [],
      weapons: ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"],
      tools: edition === "2024" ? ["calligrapher's supplies"] : [],
      languages: ["Common"]
    },
    attackList: [
      {name: "Fire Bolt", bonus: spellAttack, damage: bolt, type: "fire", notes: "Ranged spell attack, 120 ft."},
      {name: "Dagger", bonus: prof + dex, damage: `1d4+${dex}`, type: "piercing", notes: "Finesse, thrown 20/60. Use only if a spell is wrong."}
    ],
    bonusActions: level >= 3 ? ["Misty Step"] : [],
    reactions: ["Shield"],
    spellcasting: {
      ability: "Intelligence",
      saveDC: dc,
      attack: spellAttack,
      slots: level === 2 ? {1: 3} : level === 3 ? {1: 4, 2: 2} : level === 4 ? {1: 4, 2: 3} : level === 5 ? {1: 4, 2: 3, 3: 2} : {1: 4, 2: 3, 3: 3},
      focus: "arcane focus (quarterstaff)",
      prepareCount: String(preparedCount),
      cantrips: spellList.filter(s => s.level === 0).map(s => s.name),
      prepared: spellList.filter(s => s.level > 0).map(s => s.name).slice(0, preparedCount)
    },
    spellList,
    featureList: features,
    equipment: ["Quarterstaff (arcane focus)", "Dagger", "Spellbook", "Component pouch", ...mine.map(i => i.name)],
    gp: 10,
    personality: {trait: "Reads the label before she touches the bottle.", ideal: "A spell you cannot explain is a spell you should not cast yet.", bond: "Kaelen's drying room still has her old stool.", flaw: "She will spend the slot to learn what the thing is."},
    appearance: "Sharp-eyed human with a soot-marked spellbook and a staff wrapped in linen.",
    rules: edition === "2024" ? "SRD 5.2.1" : "SRD 5.1",
    initBonus: edition === "2024" ? prof : 0,
    magicItems: mine
  });
}

function clean(pc) {
  if (!pc.spellcasting) delete pc.spellcasting;
  if (!pc.spellList) delete pc.spellList;
  return pc;
}

const unsettled = [
  "Settled: SRD 5.1 has no encounter-budget table. These sheets do not print 2014 Easy, Medium, Hard, or Deadly labels. Encounter bands use the SRD 5.2.1 XP budget.",
  "Settled: Boots of Elvenkind need no attunement in SRD 5.1 or SRD 5.2. 2014 grants advantage only on Dexterity (Stealth) checks that rely on moving silently. 2024 grants Advantage on Dexterity (Stealth) checks, and your steps make no sound.",
  "Settled: 2014 Life Domain always prepares Spiritual Weapon from cleric level 3 and Beacon of Hope from cleric level 5. Both spells are printed on those 2014 sheets. 2024 Life Domain does not prepare either spell.",
  "Settled: Wand of Secrets has 3 charges and regains 1d3 at dawn in both editions. 2014: an action, secret door or trap within 30 feet. 2024: a Magic action, within 60 feet.",
  "Settled: Hunter Shark and Giant Constrictor Snake are printed with separate 2014 and 2024 attack lines in the adventures.",
  "Settled edition difference: 2024 Cure Wounds is 2d8 + modifier and Healing Word is 2d4 + modifier. 2014 is 1d8 + modifier and 1d4 + modifier.",
  "Settled edition difference: 2024 Lesser Restoration is a Bonus Action and does not mention disease. 2014 is an action and can end one disease.",
  "Settled: 2024 subclasses begin at level 3. 2014 Life Domain is level 1. 2014 Evocation school is level 2. 2014 Champion and Thief are level 3. 2024 Channel Divinity is 2 uses at cleric levels 2–5 and 3 uses at level 6."
];

for (const level of [2, 3, 4, 5, 6]) {
  for (const edition of ["2014", "2024"]) {
    const characters = [fighter(edition, level), rogue(edition, level), cleric(edition, level), wizard(edition, level)].map(clean);
    for (const pc of characters) {
      if (Object.keys(pc.skillsMap).length !== 18) throw new Error(pc.name + " skills");
      if (Object.keys(pc.saveMap).length !== 6) throw new Error(pc.name + " saves");
      if (!pc.attackList.length || !pc.featureList.length) throw new Error(pc.name + " empty");
      if (pc.hp < 8) throw new Error(pc.name + " hp");
    }
    const pack = {
      id: `oakhaven-level-${level}-${edition}`,
      title: `Oakhaven level ${level} · ${edition === "2024" ? "SRD 5.2.1" : "SRD 5.1"}`,
      level,
      edition,
      rules: edition === "2024" ? "SRD 5.2.1" : "SRD 5.1",
      party: "Calder Voss (Fighter), Ness Quinn (Rogue), Halden Moss (Cleric), Mira Quill (Wizard)",
      carryForward: carried(level),
      dropInNote: "These four are the series party. They carry every permanent SRD magic item earned on the best path of each earlier Oakhaven module. Consumables are not assumed to remain. A table that drops in without those modules can set the extra items aside. SRD 5.2 Starting at Higher Levels gives a smaller default kit (levels 2–4: one common item; levels 5–10: one common and one uncommon). The series kit is earned treasure, not that starting package.",
      unsettledRules: unsettled,
      characters
    };
    const file = path.join(root, "data", "pregens", `oakhaven-level-${level}-${edition}-srd.json`);
    fs.writeFileSync(file, JSON.stringify(pack, null, 2) + "\n");
    console.log("wrote", path.relative(root, file));
  }
}
