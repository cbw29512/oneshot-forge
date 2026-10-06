#!/usr/bin/env node
import fs from "node:fs";

const fail = message => { console.error("OwlBear Arms v1.2 validation failed: " + message); process.exit(1); };
const read = path => {
  try { return fs.readFileSync(path, "utf8"); }
  catch (error) { fail("missing " + path + ": " + error.message); }
};

const repair = read("docs/OWLBEAR_ARMS_V1_2_REPAIR.md");
for (const required of [
  "Tomas survived that raid",
  "Tomas died in the woods",
  "4 Preparation Hours",
  "Minimum 0.",
  "Maximum 6.",
  "Route A",
  "Route B",
  "Route C",
  "Route D",
  "Route E",
  "Final DP",
  "| **0** | Overrun.",
  "Full Village waves",
  "Split Village waves",
  "Nest waves",
  "Ash Shaman",
  "Magistrate Grubbleclaw",
  "CUSTOM ADVENTURE ITEM",
  "Cobb's Web Wand — CUSTOM",
  "Cobb's Smoke Bottle — CUSTOM",
  "next Charisma ability check against Grubbleclaw",
  "Ending-only"
]) {
  if (!repair.includes(required)) fail("repair packet missing: " + required);
}

const pack = JSON.parse(read("data/pregens/owlbear-arms-level-6-2014-srd-v1.2.json"));
if (pack.level !== 6 || pack.characters?.length !== 5) fail("expected five level-6 heroes");
const skills = ["acrobatics","animal handling","arcana","athletics","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleight of hand","stealth","survival"];
for (const pc of pack.characters) {
  if (!pc.name || !pc.className || pc.level !== 6) fail("hero identity/level missing");
  for (const ability of ["STR","DEX","CON","INT","WIS","CHA"]) {
    if (typeof pc.scores?.[ability] !== "number") fail(pc.name + " missing score " + ability);
    if (typeof pc.saveMap?.[ability]?.bonus !== "number") fail(pc.name + " missing save " + ability);
  }
  for (const skill of skills) if (typeof pc.skillsMap?.[skill]?.bonus !== "number") fail(pc.name + " missing skill " + skill);
  if (!pc.attackList?.length || !pc.featureList?.length || !pc.quickTurn) fail(pc.name + " missing combat procedure");
  if (pc.spellcasting && (!pc.spellList?.length || pc.spellcasting.saveDC == null || pc.spellcasting.attack == null)) fail(pc.name + " incomplete spell reference");
  for (const spell of pc.spellList || []) if (!spell.name || !spell.time || !spell.range || !spell.effect) fail(pc.name + " has incomplete spell entry");
}
const ranger = pack.characters.find(pc => pc.name === "Thalen");
const rangerText = JSON.stringify(ranger);
if (!rangerText.includes("humanoids (raiders)") || !rangerText.includes("monstrosities") || !rangerText.includes("forest") || !rangerText.includes("grassland")) fail("ranger favored enemy/terrain choices not explicit");

const page = read("adventures/right-to-owlbear-arms.html");
for (const required of ["OWLBEAR_ARMS_V1_2_REPAIR.md","sheets.html?pack=owlbear-arms","preserved v1.1"]) {
  if (!page.includes(required)) fail("product page missing v1.2 route: " + required);
}
const sheets = read("sheets.html");
if (!sheets.includes('requestedPack === "owlbear-arms"') || !sheets.includes("owlbear-arms-level-6-2014-srd-v1.2.json")) fail("sheet renderer does not expose v1.2 heroes");

console.log("OwlBear Arms v1.2 repair OK: chronology, defense, rules, reveals, and five complete hero data sheets.");
