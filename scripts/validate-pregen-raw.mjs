#!/usr/bin/env node
import fs from "node:fs";

const errors = [];
const readJson = path => {
  if (!fs.existsSync(path)) {
    errors.push("missing " + path);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(path, "utf8")); }
  catch (error) {
    errors.push(path + ": invalid JSON: " + error.message);
    return null;
  }
};

const abilityMod = score => Math.floor((Number(score) - 10) / 2);
const expectedPB = level => level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;
const fixedAverageByDie = {6:4,8:5,10:6,12:7};

const WEAPONS = {
  "club": {die:"1d4", ability:"STR"},
  "dagger": {die:"1d4", ability:"FINESSE"},
  "greatclub": {die:"1d8", ability:"STR"},
  "handaxe": {die:"1d6", ability:"STR"},
  "javelin": {die:"1d6", ability:"STR"},
  "light hammer": {die:"1d4", ability:"STR"},
  "mace": {die:"1d6", ability:"STR"},
  "quarterstaff": {die:"1d6", versatile:"1d8", ability:"STR"},
  "sickle": {die:"1d4", ability:"STR"},
  "spear": {die:"1d6", versatile:"1d8", ability:"STR"},
  "light crossbow": {die:"1d8", ability:"DEX"},
  "dart": {die:"1d4", ability:"FINESSE"},
  "shortbow": {die:"1d6", ability:"DEX"},
  "sling": {die:"1d4", ability:"DEX"},
  "battleaxe": {die:"1d8", versatile:"1d10", ability:"STR"},
  "flail": {die:"1d8", ability:"STR"},
  "glaive": {die:"1d10", ability:"STR"},
  "greataxe": {die:"1d12", ability:"STR"},
  "greatsword": {die:"2d6", ability:"STR"},
  "halberd": {die:"1d10", ability:"STR"},
  "lance": {die:"1d12", ability:"STR"},
  "longsword": {die:"1d8", versatile:"1d10", ability:"STR"},
  "maul": {die:"2d6", ability:"STR"},
  "morningstar": {die:"1d8", ability:"STR"},
  "pike": {die:"1d10", ability:"STR"},
  "rapier": {die:"1d8", ability:"FINESSE"},
  "scimitar": {die:"1d6", ability:"FINESSE"},
  "shortsword": {die:"1d6", ability:"FINESSE"},
  "trident": {die:"1d6", versatile:"1d8", ability:"STR"},
  "war pick": {die:"1d8", ability:"STR"},
  "warhammer": {die:"1d8", versatile:"1d10", ability:"STR"},
  "whip": {die:"1d4", ability:"FINESSE"},
  "blowgun": {die:"1", ability:"DEX"},
  "hand crossbow": {die:"1d6", ability:"DEX"},
  "heavy crossbow": {die:"1d10", ability:"DEX"},
  "longbow": {die:"1d8", ability:"DEX"},
  "net": {die:null, ability:"DEX"}
};

const SKILL_ABILITY = {
  "acrobatics":"DEX","animal handling":"WIS","arcana":"INT","athletics":"STR",
  "deception":"CHA","history":"INT","insight":"WIS","intimidation":"CHA",
  "investigation":"INT","medicine":"WIS","nature":"INT","perception":"WIS",
  "performance":"CHA","persuasion":"CHA","religion":"INT","sleight of hand":"DEX",
  "stealth":"DEX","survival":"WIS"
};

function normalizeWeapon(name="") {
  const n = String(name).toLowerCase().trim();
  return Object.keys(WEAPONS).find(w => n === w || n.startsWith(w + " ") || n.startsWith(w + " +")) || null;
}

function firstDie(text="") {
  return String(text).match(/\b(?:\d+d\d+|\d+)\b/i)?.[0]?.toLowerCase() || null;
}

function validatePack(path, edition) {
  const pack = readJson(path);
  if (!pack) return;
  if (!Array.isArray(pack.characters) || !pack.characters.length) {
    errors.push(path + ": no characters");
    return;
  }

  for (const pc of pack.characters) {
    const who = path + " :: " + (pc.name || pc.id || "unnamed");
    const level = Number(pc.level ?? pack.level);
    if (!Number.isInteger(level) || level < 1 || level > 20) errors.push(who + ": invalid level " + level);
    const pb = expectedPB(level);
    if (pc.proficiency !== pb) errors.push(who + ": proficiency " + pc.proficiency + " should be +" + pb + " at level " + level);

    for (const ability of ["STR","DEX","CON","INT","WIS","CHA"]) {
      const score = pc.scores?.[ability];
      if (!Number.isInteger(score)) {
        errors.push(who + ": missing/invalid " + ability);
        continue;
      }
      const save = pc.saveMap?.[ability];
      if (!save || typeof save.bonus !== "number") {
        errors.push(who + ": missing save " + ability);
      } else {
        const expected = abilityMod(score) + (save.proficient ? pb : 0);
        if (save.bonus !== expected) errors.push(who + ": " + ability + " save " + save.bonus + " should be " + expected);
      }
    }

    for (const [skill, ability] of Object.entries(SKILL_ABILITY)) {
      const entry = pc.skillsMap?.[skill];
      if (!entry || typeof entry.bonus !== "number") {
        errors.push(who + ": missing skill " + skill);
        continue;
      }
      const mult = entry.expertise ? 2 : entry.proficient ? 1 : 0;
      const expected = abilityMod(pc.scores[ability]) + pb * mult;
      if (entry.bonus !== expected) errors.push(who + ": " + skill + " " + entry.bonus + " should be " + expected);
    }

    const expectedPP = 10 + (pc.skillsMap?.perception?.bonus ?? 0);
    const expectedPI = 10 + (pc.skillsMap?.insight?.bonus ?? 0);
    if (pc.passivePerception !== expectedPP) errors.push(who + ": passive Perception " + pc.passivePerception + " should be " + expectedPP);
    if (pc.passiveInsight !== expectedPI) errors.push(who + ": passive Insight " + pc.passiveInsight + " should be " + expectedPI);

    if (typeof pc.initiative === "number") {
      const expectedInitiative = abilityMod(pc.scores.DEX) + Number(pc.initiativeBonusOverride || 0);
      if (pc.initiative !== expectedInitiative) {
        errors.push(who + ": initiative bonus " + pc.initiative + " should be " + expectedInitiative + " from Dex plus recorded initiative bonuses");
      }
    }

    const hitDiceText = String(pc.hitDice || "");
    const hd = hitDiceText.match(/^(\d+)d(6|8|10|12)$/);
    if (!hd) errors.push(who + ": invalid hitDice " + hitDiceText);
    else if (Number(hd[1]) !== level) errors.push(who + ": hitDice count " + hd[1] + " should equal level " + level);

    if (!Number.isInteger(pc.hp) || pc.hp < 1) errors.push(who + ": invalid HP " + pc.hp);
    if (hd) {
      const die = Number(hd[2]);
      const con = abilityMod(pc.scores.CON);
      const perLevelBonus = Number(pc.hpBonusPerLevel || 0);
      const expectedHP = die + con + perLevelBonus + (level - 1) * (fixedAverageByDie[die] + con + perLevelBonus);
      if (pc.hp !== expectedHP) errors.push(who + ": HP " + pc.hp + " should be " + expectedHP + " using fixed-average advancement and recorded per-level bonuses");
    }
    if (!Number.isInteger(pc.ac) || pc.ac < 8 || pc.ac > 30) errors.push(who + ": implausible AC " + pc.ac);

    for (const attack of pc.attackList || []) {
      const dmg = String(attack.damage || "");
      if (/\bd20\b/i.test(dmg) || /\d+d20\b/i.test(dmg)) {
        errors.push(who + ": " + attack.name + " uses d20 as damage die: " + dmg);
      }
      const weaponKey = normalizeWeapon(attack.name);
      if (!weaponKey) continue;
      const weapon = WEAPONS[weaponKey];
      const die = firstDie(dmg);
      if (weapon.die && die !== weapon.die) {
        errors.push(who + ": " + attack.name + " base damage " + die + " should start with " + weapon.die);
      }
      if (typeof attack.bonus === "number") {
        const str = abilityMod(pc.scores.STR);
        const dex = abilityMod(pc.scores.DEX);
        const ability = weapon.ability === "DEX" ? dex : weapon.ability === "FINESSE" ? Math.max(str,dex) : str;
        const magic = Number(attack.magicBonus || 0);
        const override = Number(attack.attackBonusOverride || 0);
        const expected = ability + pb + magic + override;
        if (attack.bonus !== expected) {
          errors.push(who + ": " + attack.name + " attack bonus " + attack.bonus + " should be " + expected + " (ability + PB" + (magic ? " + magic" : "") + (override ? " + sourced bonus" : "") + ")");
        }
      }
      if (weapon.versatile && attack.notes && /versatile/i.test(attack.notes) && !attack.notes.toLowerCase().includes(weapon.versatile)) {
        errors.push(who + ": " + attack.name + " versatile die should be " + weapon.versatile);
      }
    }

    if (pc.spellcasting) {
      const abilityName = String(pc.spellcasting.ability || "").slice(0,3).toUpperCase();
      if (!pc.scores?.[abilityName]) {
        errors.push(who + ": invalid spellcasting ability " + pc.spellcasting.ability);
      } else {
        const mod = abilityMod(pc.scores[abilityName]);
        const expectedDC = 8 + pb + mod + Number(pc.spellcasting.saveDCBonus || 0);
        const expectedAtk = pb + mod + Number(pc.spellcasting.attackBonus || 0);
        if (pc.spellcasting.saveDC !== expectedDC) errors.push(who + ": spell save DC " + pc.spellcasting.saveDC + " should be " + expectedDC);
        if (pc.spellcasting.attack !== expectedAtk) errors.push(who + ": spell attack " + pc.spellcasting.attack + " should be +" + expectedAtk);
      }
    }


    if (edition === "2024") {
      const background = String(pc.background || "");
      const coreBackgrounds = new Set(["Acolyte","Criminal","Sage","Soldier","Guide","Farmer"]);
      if (["Brann Oakholt","Sister Pell Bramble","Nyx Keller","Ivo Ashletter","Kael Thornwake","Hester Brine"].includes(pc.name) && !coreBackgrounds.has(background)) {
        errors.push(who + ": legacy/non-2024 background label leaked into 2024 root: " + background);
      }

      const spells = Object.fromEntries((pc.spellList || []).map(s => [s.name, s]));
      if (spells["Cure Wounds"] && !/2d8/i.test(spells["Cure Wounds"].effect || "")) {
        errors.push(who + ": 2024 Cure Wounds must use 2d8 base healing");
      }
      if (spells["Healing Word"] && !/2d4/i.test(spells["Healing Word"].effect || "")) {
        errors.push(who + ": 2024 Healing Word must use 2d4 base healing");
      }
      if (spells["Spiritual Weapon"] && !/concentration/i.test(spells["Spiritual Weapon"].effect || "")) {
        errors.push(who + ": 2024 Spiritual Weapon must require Concentration");
      }
      if (spells["Goodberry"] && !/Bonus Action/i.test(spells["Goodberry"].effect || "")) {
        errors.push(who + ": 2024 Goodberry must state Bonus Action to eat a berry");
      }
      if (spells["Spare the Dying"] && String(spells["Spare the Dying"].range || "").toLowerCase() === "touch") {
        errors.push(who + ": 2024 Spare the Dying starts at 15 ft., not touch");
      }

      const alert = (pc.featureList || []).find(f => f.name === "Alert");
      if (alert && (/\+5 Initiative/i.test(alert.text || "") || /cannot be surprised/i.test(alert.text || ""))) {
        errors.push(who + ": legacy 2014 Alert text leaked into 2024 pregen");
      }
    }

    if (edition === "2014") {
      const spells = Object.fromEntries((pc.spellList || []).map(s => [s.name, s]));
      if (spells["Cure Wounds"] && /2d8/i.test(spells["Cure Wounds"].effect || "")) {
        errors.push(who + ": 2024 Cure Wounds leaked into 2014 pregen");
      }
      if (spells["Healing Word"] && /2d4/i.test(spells["Healing Word"].effect || "")) {
        errors.push(who + ": 2024 Healing Word leaked into 2014 pregen");
      }
      if (spells["Spiritual Weapon"] && /concentration/i.test(spells["Spiritual Weapon"].effect || "") && !/no concentration/i.test(spells["Spiritual Weapon"].effect || "")) {
        errors.push(who + ": 2024 Spiritual Weapon concentration leaked into 2014 pregen");
      }
    }

    const editionText = JSON.stringify({rules:pc.rules,ruleset:pc.ruleset,conversionNote:pc.conversionNote});
    if (edition === "2014" && /2024|5\.2/i.test(editionText)) errors.push(who + ": 2024 marker leaked into 2014 pack");
    if (edition === "2024" && !/2024|5\.2/i.test(editionText)) errors.push(who + ": missing explicit 2024 rules marker");
  }
}

validatePack("data/pregens/shared/2014/level-01.json", "2014");
validatePack("data/pregens/quiet-seals-level-4-2014-srd.json", "2014");
validatePack("data/pregens/quiet-seals-level-4-2024-srd.json", "2024");

if (errors.length) {
  console.error("Pregen RAW validation failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log("Pregen RAW validation OK: derived stats, weapon dice, attack bonuses, saves, skills, spell math, hit dice, and edition isolation.");
