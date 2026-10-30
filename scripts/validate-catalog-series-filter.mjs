#!/usr/bin/env node
// Regression contract: catalog category filters must work without duplicate
// Oakhaven navigation. No browser dependencies or external services required.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

try {
  // Data schema: card.dataset = {productId, series, level}; card.hidden
  // represents the visible/hidden state produced by the real filter.
  const root = path.resolve(import.meta.dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "catalog.js"), "utf8");
  assert.ok(!html.includes('id="oakhaven-series"'), "Remove redundant series row");
  assert.ok(!html.includes('href="#oakhaven-series"'), "Remove redundant nav link");
  assert.ok(html.includes('<option value="oakhaven">Oakhaven</option>'),
    "Retain Oakhaven in the dropdown");

  const start = js.indexOf("  function applyFilters() {");
  const end = js.indexOf("  function bindFilters() {", start);
  assert.ok(start >= 0 && end > start, "Cannot locate actual catalog filter");
  const filterCode = js.slice(start, end);
  const attr = (tag, key) =>
    tag.match(new RegExp(`data-${key}="([^"]+)"`))?.[1] || "";
  const original = [...html.matchAll(/<article class="adv-card live"([^>]+)>/g)]
    .map(match => ({
      dataset: {
        productId: attr(match[1], "product-id"),
        series: attr(match[1], "series"),
        level: attr(match[1], "level"),
      },
      hidden: false,
    }));
  assert.ok(original.length >= 5, "Missing catalog cards");

  // State logic: selection changes are applied to the same card collection.
  const selected = { series: "", level: "" };
  const document = {
    getElementById: id => ({
      value: id === "filter-series" ? selected.series : selected.level,
    }),
    querySelectorAll: () => original,
  };
  const expectedIds = (series, level) => original.filter(card =>
    (!level || card.dataset.level === level) &&
    (!series || card.dataset.series.split(/\\s+/).includes(series))
  ).map(card => card.dataset.productId);
  const cases = [
    ["oakhaven", ""],
    ["oakhaven", "3"],
    ["", ""],
    ["quiet-seals", ""],
    ["cryptid", ""],
    ["standalone", ""],
    ["hearthcross-road", ""],
  ];
  for (const [series, level] of cases) {
    selected.series = series;
    selected.level = level;
    // Run the existing production filter in a constrained Node VM, not a
    // rewritten imitation. The mock supplies only the DOM selectors it reads.
    vm.runInNewContext(filterCode + "\\napplyFilters();", { document },
      { timeout: 1000 });
    const visible = original.filter(card => !card.hidden)
      .map(card => card.dataset.productId);
    assert.deepEqual(visible, expectedIds(series, level),
      `Filter mismatch (series=${series}, level=${level})`);
    console.log(`PASS series=${series || "all"}, level=${level || "all"}: ${visible.length} cards`);
  }
} catch (error) {
  console.error("Catalog filter regression failed:", error.message);
  process.exitCode = 1;
}
