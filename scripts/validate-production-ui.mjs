#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    errors.push("missing " + rel);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

const products = JSON.parse(read("data/products.json"));
const index = read("index.html");
const run = read("run.html");
const app = read("app.js");
const moduleHtml = read("module.html");
const moduleJs = read("module.js");
const styles = read("styles.css");
const printCenter = read("print.html");

for (const product of products.products || []) {
  const cardMarker = `data-product-id="${product.id}"`;
  if (!index.includes(cardMarker)) errors.push(`${product.id}: missing catalog card`);
  const bundle = product.format === "download-bundle";
  const startUrl = bundle ? product.downloadUrl : `run.html?id=${product.id}`;
  if (!index.includes(`href="${startUrl}"`)) errors.push(`${product.id}: catalog lacks direct start/download path`);
  if (!index.includes(`href="${product.productUrl}"`)) errors.push(`${product.id}: catalog lacks details path`);

  const productPage = read(product.productUrl);
  if (productPage && !productPage.includes("styles.css?v=20261002e")) {
    errors.push(`${product.id}: landing page is not pinned to production gameplay styling`);
  }
  if (productPage && !productPage.includes(bundle ? product.downloadUrl : `run.html?id=${product.id}`)) {
    errors.push(`${product.id}: landing page lacks direct runner path`);
  }
  if (productPage && !productPage.includes(bundle ? 'id="print-materials"' : `print.html?id=${product.id}`)) {
    errors.push(`${product.id}: landing page lacks print-center path`);
  }
  if (bundle && (!productPage.includes('id="start-here"') || !productPage.includes("2014"))) {
    errors.push(`${product.id}: bundle lacks setup or edition guidance`);
  }
  if (productPage && !/class="cover"|class="adventure-cover-art/.test(productPage)) {
    errors.push(`${product.id}: landing page lacks a production visual identity`);
  }
}

for (const required of [
  'class="topbar runner-topbar"',
  'class="runner-menu runner-switcher"',
  'id="scene-purpose-primary"',
  'id="stage-step-status"',
  'id="stage-bar-track"',
  'Adventure reference (optional)'
]) {
  if (!run.includes(required)) errors.push("runner production surface missing: " + required);
}

for (const required of [
  "function updateRunStepStatus(scene)",
  'el("scene-purpose-primary")',
  'el("stage-bar-track")',
  '"Stage checklist complete"'
]) {
  if (!app.includes(required)) errors.push("runner behavior missing: " + required);
}

for (const required of [
  ".runner-popover",
  ".stage-focus",
  ".stage-step-status.complete",
  ".stage-bar-track",
  "max-width: 76rem",
  ".adv-card-art",
  ".adv-card-actions",
  ".hero-proof"
]) {
  if (!styles.includes(required)) errors.push("production CSS missing: " + required);
}

for (const required of [
  'id="module-run-link"',
  'id="module-printouts-link"',
  "module.css?v=20261002p"
]) {
  if (!moduleHtml.includes(required)) errors.push("module production surface missing: " + required);
}

for (const required of [
  "Run this stage in order",
  "Move on when:",
  "Ready lines.",
  "Reactions.",
  "Talk-out.",
  "Bypass."
]) {
  if (!moduleJs.includes(required)) errors.push("module table-play output missing: " + required);
}

if (!index.includes("Player read-aloud") ||
    !index.includes("DM stage checklist") ||
    !index.includes("Fail-forward rules") ||
    !index.includes("Maps & print views")) {
  errors.push("homepage no longer explains the table-ready product contract");
}

for (const required of [
  "hasCompatiblePregens",
  "Pregens not included",
  "bring-your-own characters",
  "disabled: !hasCompatiblePregens"
]) {
  if (!printCenter.includes(required)) errors.push("print center compatibility guard missing: " + required);
}

if (errors.length) {
  console.error("Production gameplay UI validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log("Production gameplay UI OK: catalog, runner, landing pages, and module view expose direct, table-ready play paths.");
