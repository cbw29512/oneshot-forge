#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate-presentation.mjs <adventure.json>");
  process.exit(1);
}
const a = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const scenes = new Map((a.scenes || []).map(s => [s.id, s]));
const locations = new Map((a.locations || []).map(l => [l.id, l]));
const cards = new Map((a.cards || []).map(c => [c.id, c]));

function need(ok, msg) { if (!ok) errors.push(msg); }
function words(s="") { return String(s).trim().split(/\s+/).filter(Boolean).length; }

for (const scene of a.scenes || []) {
  const label = scene.id || "scene";
  need(scene.readAloud?.trim(), `${label} missing readAloud`);
  need(words(scene.readAloud) >= 25, `${label} readAloud is too thin for table delivery`);
  need(words(scene.readAloud) <= 180, `${label} readAloud is too long to read cleanly`);
  need(scene.runSteps?.length >= 2, `${label} needs ordered runSteps`);
  need(scene.advanceWhen?.trim(), `${label} missing advanceWhen`);
  for (const target of scene.exits || []) need(scenes.has(target), `${label} exits to missing scene ${target}`);
  if (scene.locationId) need(locations.has(scene.locationId), `${label} references missing location ${scene.locationId}`);
}

for (const loc of a.locations || []) {
  need(words(loc.description) >= 18, `${loc.id} location description is too thin`);
}

for (const npc of a.npcs || []) {
  need(words(npc.description) >= 12, `${npc.id} missing strong visual description`);
  need(Array.isArray(npc.tableDialogue) && npc.tableDialogue.length >= 2 && npc.tableDialogue.length <= 3,
    `${npc.id} needs 2-3 tableDialogue lines`);
  for (const key of ["agreement","refusal","danger"]) {
    need(npc.reactions?.[key]?.trim(), `${npc.id} missing ${key} reaction`);
  }
  need(npc.voiceCues?.length, `${npc.id} missing voice cues`);
  need(npc.wants?.length, `${npc.id} missing wants`);
  need(npc.knows?.length, `${npc.id} missing knows`);
}

const flow = a.flowContract?.mainSpine || [];
for (let i=0; i<flow.length-1; i++) {
  const here=scenes.get(flow[i]), next=flow[i+1];
  need(here, `flowContract missing scene ${flow[i]}`);
  if (here) need((here.exits || []).includes(next), `main spine ${flow[i]} does not exit to ${next}`);
}

for (const card of a.cards || []) {
  need(words(card.front) >= 10, `${card.id} front description is too thin`);
  if (card.type === "npc") {
    need(card.back?.dialogue?.length >= 2, `${card.id} NPC card needs usable dialogue`);
  }
  if (card.type === "creature") {
    need(card.back?.stats?.trim(), `${card.id} creature card missing stats`);
    need(card.back?.rules?.length, `${card.id} creature card missing runnable rules`);
    need(card.back?.dmNotes?.length, `${card.id} creature card missing behavior/tactics notes`);
  }
}

if (a.metadata?.id === "the-owlbear-egg") {
  const mother = cards.get("card-mother-owlbear");
  const rageText = JSON.stringify(mother?.back || {});
  need(/all damage except psychic/i.test(rageText), "mother card drifted from all-damage-except-psychic rage");
  const eat = scenes.get("scene-eat");
  need(/all damage except psychic/i.test(JSON.stringify(eat?.gmNotes || [])), "scene-eat mother rage note drifted");
}

if (errors.length) {
  console.error("Presentation validation failed:");
  errors.forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log(`Presentation OK: ${a.metadata?.title || file} — ${a.scenes?.length || 0} scenes, ${a.npcs?.length || 0} NPCs, ${a.cards?.length || 0} cards.`);
