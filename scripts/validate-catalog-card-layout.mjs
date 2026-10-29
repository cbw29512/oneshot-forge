#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

try {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "catalog-card-consistency.css"), "utf8");
  const cards = [...html.matchAll(/<article class="adv-card live"[^>]*>[\s\S]*?<\/article>/g)]
    .map(match => match[0]);
  const ids = new Set();

  if (!html.includes('href="catalog-card-consistency.css?v=20261029a"')) {
    errors.push("catalog does not load the consistency stylesheet");
  }
  if (cards.length < 10) errors.push("expected at least ten catalog adventure cards");

  for (const [index, card] of cards.entries()) {
    const id = card.match(/data-product-id="([^"]+)"/)?.[1];
    const label = id || `card ${index + 1}`;
    if (!id || ids.has(id)) errors.push(`${label}: missing or duplicate product ID`);
    ids.add(id);
    const required = [
      [/^<article[^>]+data-level="/, "level for filtering"],
      [/^<article[^>]+data-series="/, "series for filtering"],
      [/<img[^>]+src="assets\/cover-[^"]+\.webp"[^>]+alt="[^"]+"/, "cover and alt"],
      [/class="adv-card-body"/, "card body"],
      [/class="price-chip" data-price-chip/, "price badge"],
      [/class="edition-badge" data-edition-badge/, "rules badge"],
      [/data-product-status/, "availability"],
      [/<h3>[^<]+<\/h3>/, "title"],
      [/<h3>[^<]+<\/h3>\s*<p>[^<]+<\/p>/, "story summary"],
      [/class="adv-tags"/, "fact tags"],
      [/class="adv-card-actions"/, "action row"],
      [/data-product-action/, "primary action"],
      [/class="text-link" href="[^"]+"/, "details link"]
    ];
    for (const [pattern, field] of required) {
      if (!pattern.test(card)) errors.push(`${label}: missing ${field}`);
    }
    if ((card.match(/class="adv-tag"/g) || []).length !== 4) {
      errors.push(`${label}: expected the same four fact slots`);
    }
  }

  for (const rule of [
    "aspect-ratio: 16 / 8.5",
    "grid-template-rows:",
    "-webkit-line-clamp: 5",
    "grid-template-columns: repeat(2, minmax(0, 1fr))",
    "grid-column: 1 / -1"
  ]) {
    if (!css.includes(rule)) errors.push(`missing card layout rule: ${rule}`);
  }
  if (html.includes("Download the complete kit (PDF + maps, ~1.7 MB)")) {
    errors.push("oversized catalog action label returned");
  }
} catch (error) {
  errors.push(`catalog layout validation could not run: ${error.message}`);
}

if (errors.length) {
  console.error("Catalog card UI validation failed:");
  errors.forEach(error => console.error(" - " + error));
  process.exitCode = 1;
} else {
  console.log("Catalog card UI contract OK");
}
