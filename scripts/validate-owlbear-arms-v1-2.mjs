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
// Original portraits are required for every printable OwlBear Arms hero.
// This extends the validation rather than silently accepting blank portrait boxes.
for (const pc of pack.characters) {
  if (!pc.portrait || !pc.portrait.endsWith(".svg")) fail(pc.name + " missing original portrait");
  if (!fs.existsSync(pc.portrait)) fail(pc.name + " portrait file is not in the repository: " + pc.portrait);
  const portrait = read(pc.portrait);
  if (!portrait.includes("<svg") || !portrait.includes("viewBox=")) fail(pc.name + " portrait is not valid SVG markup");
}

const ranger = pack.characters.find(pc => pc.name === "Thalen");
const rangerText = JSON.stringify(ranger);
if (!rangerText.includes("humanoids (raiders)") || !rangerText.includes("monstrosities") || !rangerText.includes("forest") || !rangerText.includes("grassland")) fail("ranger favored enemy/terrain choices not explicit");

const page = read("adventures/right-to-owlbear-arms.html");
for (const required of ["OWLBEAR_ARMS_V1_2_REPAIR.md","sheets.html?pack=owlbear-arms","preserved v1.1"]) {
  if (!page.includes(required)) fail("product page missing v1.2 route: " + required);
}
// OwlBear Arms product-page layout contract: print links stay real, action geometry stays stable.
const layoutCss = read("owlbear-arms.css");
for (const required of [
  "grid-template-columns: repeat(2, minmax(0, 1fr))",
  ".owlbear-kit-body .setup-steps > li",
  "flex-direction: column",
  ".owlbear-kit-body .setup-steps > li > .button",
  "margin-top: auto",
  "@media screen and (max-width: 540px)"
]) {
  if (!layoutCss.includes(required)) fail("product-page alignment contract missing: " + required);
}
if (!page.includes('owlbear-arms.css?v=20261114c')) fail("OwlBear Arms stylesheet cache version is stale");
if (!page.includes('id="release-notes"')) fail("technical notes must be reachable from a collapsed section");
if (!page.includes('02_Pregenerated_Heroes/Right_To_Bear_Arms_Pregenerated_Heroes_Level_6_v1.2.pdf')) fail("five printable hero sheets link is missing");
if ((page.match(/<li><h3>/g) || []).length !== 3) fail("expected exactly three setup steps");

// Cobb's new handout must be player-safe. The DM map and the locked ZIP
// remain separate until the binary download is explicitly regenerated.
const cobbPath = "assets/bundles/owlbear-arms-v1.2/03_Maps/Old_Cobb_Rough_Survivor_Map_PLAYER.svg";
const cobb = read(cobbPath);
for (const clue of ["Brindlebarrow", "TOMAS", "CAVE", "BELLS"]) {
  if (!cobb.toLowerCase().includes(clue.toLowerCase())) fail("Cobb's sketch missing visible grounded landmark: " + clue);
}
for (const spoiler of ["SMOKE CHAMBER", "TACTICAL TESTING GROUND", "NEST & TREASURE", "NEGOTIATION CHAMBER", "SIDE TUNNEL"]) {
  if (cobb.toUpperCase().includes(spoiler)) fail("Cobb's player sketch reveals DM-only layout: " + spoiler);
}
if (!page.includes("Old_Cobb_Survivor_Map_PLAYER.pdf")) fail("the corrected player PDF link is missing");
const corrected = fs.readFileSync("assets/bundles/owlbear-arms-v1.2/03_Maps/Old_Cobb_Survivor_Map_PLAYER.pdf");
if (!corrected.subarray(0, 5).toString().startsWith("%PDF-")) fail("Cobb's corrected printout is not a PDF");
for (const spoiler of ["SMOKE CHAMBER", "TACTICAL TESTING GROUND", "NEST & TREASURE", "NEGOTIATION CHAMBER"]) {
  if (corrected.toString("latin1").toUpperCase().includes(spoiler)) fail("the printable Cobb map leaks DM-only rooms");
}

const sheets = read("sheets.html");
if (!sheets.includes("owlbear-pregen-print.css?v=20261115a")) fail("premium printable stylesheet is not wired");
if (!sheets.includes('classList.add("owlbear-print")')) fail("OwlBear sheet styling must be scoped to this pack");
const printCss = read("owlbear-pregen-print.css");
if (!printCss.includes("@media print") || !printCss.includes(".beyond-print")) fail("premium print rules missing");

if (!sheets.includes('requestedPack === "owlbear-arms"') || !sheets.includes("owlbear-arms-level-6-2014-srd-v1.2.json")) fail("sheet renderer does not expose v1.2 heroes");

console.log("OwlBear Arms v1.2 repair OK: chronology, defense, rules, reveals, and five complete hero data sheets.");
