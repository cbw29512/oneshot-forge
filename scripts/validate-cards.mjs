#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate-cards.mjs <adventure.json>");
  process.exit(1);
}
const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
const cards = adventure.cards || [];
const errors = [];
if (!cards.length) errors.push("adventure has no cards");
const ids = new Set();
for (const card of cards) {
  if (!card.id) errors.push("card missing id");
  if (ids.has(card.id)) errors.push("duplicate card id " + card.id);
  ids.add(card.id);
  if (!card.title) errors.push((card.id || "card") + " missing title");
  if (!card.type) errors.push((card.id || "card") + " missing type");
  if (!card.front) errors.push((card.id || "card") + " missing front");
  if (!card.image) errors.push((card.id || "card") + " missing image path");
  else if (!fs.existsSync(card.image)) errors.push((card.id || "card") + " image file does not exist: " + card.image);
  if (!card.imageAlt) errors.push((card.id || "card") + " missing imageAlt");
  if (!card.back?.role) errors.push((card.id || "card") + " missing back.role");
  if (!card.back?.location) errors.push((card.id || "card") + " missing back.location");
  if (!Array.isArray(card.back?.dialogue) || !card.back.dialogue.length) errors.push((card.id || "card") + " missing back.dialogue[]");
  if (!Array.isArray(card.back?.rules) || !card.back.rules.length) errors.push((card.id || "card") + " missing back.rules[]");
  if (!Array.isArray(card.back?.dmNotes) || !card.back.dmNotes.length) errors.push((card.id || "card") + " missing back.dmNotes[]");
  if ((card.back?.dialogue || []).length > 3) errors.push((card.id || "card") + " has too many dialogue lines for readable tarot back");
  if ((card.back?.rules || []).length > 4) errors.push((card.id || "card") + " has too many rules for readable tarot back");
  if ((card.back?.dmNotes || []).length > 3) errors.push((card.id || "card") + " has too many DM notes for readable tarot back");
}
for (const required of ["card-baby-owlbear","card-father-owlbear","card-mother-owlbear","card-sella","card-mara","card-torren","card-elmorrow"]) {
  if (!ids.has(required)) errors.push("missing required Owlbear Egg card " + required);
}
const renderer = fs.readFileSync("cards.js", "utf8");
for (const required of ["mirrorFour", "print-fronts", "print-backs", "DM notes", "Dialogue / voice"]) {
  if (!renderer.includes(required)) errors.push("card renderer missing " + required);
}
if (errors.length) {
  console.error("Card validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}
console.log("Adventure cards OK: " + cards.length + " cards in " + adventure.metadata.title);
