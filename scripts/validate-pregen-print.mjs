#!/usr/bin/env node
import fs from "node:fs";

const errors = [];
const read = path => fs.existsSync(path) ? fs.readFileSync(path, "utf8") : (errors.push("missing " + path), "");

const sheets = read("sheets.html");
const css = read("styles.css");

for (const required of [
  "characterClass(pc)",
  "pc.className || pc.class",
  "cs-print-mark",
  "Portrait of ",
  "waitImagesThenPrint"
]) {
  if (!sheets.includes(required)) errors.push("sheets.html missing " + required);
}

for (const required of [
  "@page",
  "size: Letter portrait",
  "print-color-adjust: exact",
  "page-break-after: always",
  ".cs-port",
  "object-fit: cover"
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
    if (!pc.featureList?.length) errors.push(pc.name + " missing features");
  }
}

if (errors.length) {
  console.error("Pregen print validation failed:");
  errors.forEach(error => console.error(" - " + error));
  process.exit(1);
}
console.log("Pregen print packet OK: portraits, class headers, Letter print layout, and six recommended sheets per edition.");
