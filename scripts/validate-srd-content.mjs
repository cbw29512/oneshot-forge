#!/usr/bin/env node
// Production pass 1 gate: SRD-only names, honest encounter math, party-size scaling.
// See docs/PRODUCTION_RULES.md.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const rel = (p) => path.join(root, p);
const list = (dir, re) => fs.readdirSync(rel(dir)).filter((f) => re.test(f)).map((f) => `${dir}/${f}`);

// Names that are not in SRD 5.1 or SRD 5.2.1, or are Wizards product identity.
const ALWAYS_BANNED = [
  "twig blight", "needle blight", "vine blight", "witch bolt", "armor of agathys", "toll the dead",
  "thorn whip", "booming blade", "green-flame blade", "silvery barbs", "beholder", "mind flayer",
  "illithid", "displacer beast", "githyanki", "githzerai", "kuo-toa", "yuan-ti", "umber hulk",
  "carrion crawler", "slaad", "forgotten realms", "faerûn", "faerun", "waterdeep", "baldur's gate",
  "eberron", "greyhawk", "ravenloft", "strahd", "tiamat", "mordenkainen", "tasha's", "xanathar",
  "bigby", "drizzt", "elminster", "totem warrior", "school of illusion", "forest gnome", "dragonchess", "illusion savant"
];
// Present in SRD 5.2.1 but not in SRD 5.1: banned only in 2014-labelled material.
const BANNED_2014 = ["hex", "dissonant whispers", "wood elf", "mask of the wild"];

const files2014 = ["data/pregens/quiet-seals-level-4-2014-srd.json", "birthday-one-shot/player-data.js", "data/pregens/owlbear-arms-level-6-2014-srd-v1.2.json"];
const adventureFiles = list("data/adventures", /\.oneshot\.json$/);
const scanFiles = [...adventureFiles, ...list("data/pregens", /\.json$/), ...list("adventures", /\.html$/), ...list("birthday-one-shot", /\.(js|html)$/), "index.html"];

const hit = (text, term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);

for (const file of scanFiles) {
  const text = fs.readFileSync(rel(file), "utf8");
  for (const term of ALWAYS_BANNED) if (hit(text, term)) errors.push(`${file}: non-SRD / protected name "${term}"`);
  if (files2014.includes(file)) {
    for (const term of BANNED_2014) if (hit(text, term)) errors.push(`${file}: "${term}" is not in SRD 5.1 (2014 pack)`);
  }
}

// Lantern embeds the 2014 pack.
const lantern = JSON.parse(fs.readFileSync(rel("data/adventures/the-lantern-below.oneshot.json"), "utf8"));
const embedded = JSON.stringify(lantern.pregens || []);
for (const term of BANNED_2014) if (hit(embedded, term)) errors.push(`the-lantern-below embedded pregens: "${term}" is not in SRD 5.1`);

// Every combat encounter must show its math and its 3-6 player scaling; every creature its CR/XP and source.
for (const file of adventureFiles) {
  const adv = JSON.parse(fs.readFileSync(rel(file), "utf8"));
  for (const enc of adv.quickrun?.encounters || []) {
    const creatures = enc.creatures || [];
    if (!creatures.length) continue;
    if (!enc.balance) errors.push(`${file} ${enc.id}: missing balance (XP math)`);
    if (!enc.scaling) errors.push(`${file} ${enc.id}: missing scaling for 3-6 players`);
    for (const c of creatures) {
      if (c.object) { if (!c.statBlock) errors.push(`${file} ${enc.id} ${c.name}: object needs statBlock`); continue; }
      if (c.cr === undefined || !c.xp) errors.push(`${file} ${enc.id} ${c.name}: missing cr/xp`);
      if (!c.statBlock) errors.push(`${file} ${enc.id} ${c.name}: missing statBlock source (SRD reskin or original)`);
    }
  }
}

if (errors.length) {
  console.error(`SRD content gate failed (${errors.length}):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`SRD content gate OK: ${adventureFiles.length} adventures, ${scanFiles.length} files scanned`);
