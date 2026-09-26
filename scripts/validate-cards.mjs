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
  if (!card.back?.role) errors.push((card.id || "card") + " missing back.role");
  if (!Array.isArray(card.back?.rules) || !card.back.rules.length) errors.push((card.id || "card") + " missing back.rules[]");
}
for (const required of ["card-baby-owlbear","card-father-owlbear","card-mother-owlbear","card-sella","card-mara","card-torren","card-elmorrow"]) {
  if (!ids.has(required)) errors.push("missing required Owlbear Egg card " + required);
}
if (errors.length) {
  console.error("Card validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}
console.log("Adventure cards OK: " + cards.length + " cards in " + adventure.metadata.title);
