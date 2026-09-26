#!/usr/bin/env node
import fs from "node:fs";

const errors = [];
const read = path => fs.existsSync(path) ? fs.readFileSync(path, "utf8") : (errors.push("missing " + path), "");

const sheets = read("sheets.html");
const css = read("styles.css");

for (const required of [
  "characterClass(pc)",
  "pc.className || pc.class",
  "Portrait of ",
  "waitImagesThenPrint",
  "printMainPage(pc)",
  "printSpellPage(pc)",
  "printPacket(pc)",
  'params.get("pc")',
  "selected.map(printPacket)",
  "allCharacters.filter",
  "Print this character",
  "Print all",
  "Saving Throws — All Six",
  "Current HP",
  "Temp HP",
  "Death Saves",
  "Resources & Defenses",
  "Passive Perception",
  "Passive Insight",
  "Class / Spell Save DC",
  "Heroic Inspiration",
  "Action Economy",
  "Standard Actions",
  "Roll / DC",
  "resourceBoxes(uses)",
  '"Cantrip" : "L" + spell.level',
  '"Concentration"',
  "durationMatch",
  "pr-hp-grid",
  "pr-current-hp",
  "Conditions / Concentration / Combat Notes",
  "quickTurn(pc)",
  "spellRole(spell)",
  "Damage","Control","Healing","Defense","Utility"
]) {
  if (!sheets.includes(required)) errors.push("sheets.html missing " + required);
}

for (const required of [
  "@page",
  "size: Letter portrait",
  "print-color-adjust: exact",
  ".screen-sheet { display: none !important; }",
  ".print-only { display: block !important; }",
  ".pr-page",
  ".pr-spell-page",
  ".pr-port",
  "object-fit:cover",
  ".pr-writebox",
  "min-height:1.02in",
  ".pr-condition-box",
  ".pr-quickturn",
  ".pr-fixed-grid",
  "grid-template-areas",
  ".pr-zone-abilities",
  ".pr-zone-saves",
  ".pr-zone-skills",
  ".pr-zone-tracker",
  ".pr-zone-attacks",
  ".pr-zone-actions",
  ".pr-zone-resources",
  ".pr-zone-side",
  ".pr-zone-character",
  ".pr-zone-features",
  ".pr-mini-stats",
  ".pr-standard-actions",
  ".pr-resource-columns",
  "border-bottom:.6pt solid #d3cec8",
  "justify-content:space-between !important",
  "overflow:hidden !important",
  "flex-direction:column !important",
  "display:flex !important",
  "-webkit-text-fill-color:#111",
  "grid-template-columns:auto 1fr auto",
  "ab-mod",
  "ab-score",
  "ab-name",
  "@media (max-width: 620px)",
  ".web-fixed-sheet .pr-atk",
  ".web-fixed-sheet .pr-skill-list .sk",
  ".web-fixed-sheet .pr-fixed-grid",
  "web-fixed-sheet",
  "font-size:8.05pt",
  "font-size:7.9pt",
  "font-size:8.8pt",
  "font-size:8.25pt",
  ".pr-zone-skills .sk *",
  "color:#111 !important",
  "font-size:7.55pt",
  "Combat notes / ammunition / special attack riders",
  "font-size:11pt",
  "grid-template-rows:repeat(18,minmax(.22in,1fr))",
  "1.45in 1.43in",
  "grid-template-rows:repeat(3,1fr)",
  "font-size:10.2pt",
  "grid-template-rows:repeat(18,1fr)"
]) {
  if (!css.includes(required)) errors.push("print CSS missing " + required);
}

for (const packPath of [
  "data/pregens/quiet-seals-level-4-2014-srd.json",
  "data/pregens/quiet-seals-level-4-2024-srd.json"
]) {
  const raw = read(packPath);
  if (!raw) continue;
  const pack = JSON.parse(raw);
  const recommended = (pack.characters || []).filter(pc => pc.recommended);
  if (recommended.length !== 6) errors.push(packPath + " must have exactly six recommended pregens");
  for (const pc of recommended) {
    if (!pc.name) errors.push(packPath + " has unnamed recommended pregen");
    if (!(pc.className || pc.class)) errors.push(pc.name + " missing className/class");
    if (!pc.portrait) errors.push(pc.name + " missing portrait path");
    else if (!fs.existsSync(pc.portrait)) errors.push(pc.name + " portrait missing: " + pc.portrait);
    if (!pc.attackList?.length) errors.push(pc.name + " missing attacks");
    for (const attack of (pc.attackList || [])) {
      if (/Extra Attack is (?:fighter|ranger|paladin) 5/i.test(attack.notes || "")) errors.push(pc.name + " has future-level Extra Attack note on current sheet");
    }
    if (!pc.featureList?.length) errors.push(pc.name + " missing features");
    for (const ability of ["STR","DEX","CON","INT","WIS","CHA"]) {
      if (pc.scores?.[ability] == null) errors.push(pc.name + " missing " + ability + " ability score");
      if (!pc.saveMap?.[ability] || typeof pc.saveMap[ability].bonus !== "number") errors.push(pc.name + " missing " + ability + " saving throw");
    }
    for (const skill of ["acrobatics","animal handling","arcana","athletics","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleight of hand","stealth","survival"]) {
      if (!pc.skillsMap?.[skill] || typeof pc.skillsMap[skill].bonus !== "number") errors.push(pc.name + " missing skill " + skill);
    }
    if (pc.ac == null || pc.hp == null || pc.initiative == null || !(pc.speedFt || pc.speed)) errors.push(pc.name + " missing core combat stat");
    if (!pc.hitDice) errors.push(pc.name + " missing hit dice");
    if (pc.passivePerception == null || pc.passiveInsight == null) errors.push(pc.name + " missing passive score");
    if (pc.spellList?.length) {
      if (!pc.spellcasting?.ability || pc.spellcasting.saveDC == null || pc.spellcasting.attack == null) errors.push(pc.name + " missing spellcasting stats");
      if (!pc.spellcasting?.slots) errors.push(pc.name + " missing spell slots");
    }
  }
}

if (errors.length) {
  console.error("Pregen print validation failed:");
  errors.forEach(error => console.error(" - " + error));
  process.exit(1);
}
console.log("Pregen print packet OK: six recommended only, print-all + individual packets, one main page, optional spell page, portraits retained.");
