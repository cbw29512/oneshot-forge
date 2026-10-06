#!/usr/bin/env node
import fs from "node:fs";

const fail = msg => { console.error("Job-board validation failed: " + msg); process.exit(1); };
const board = JSON.parse(fs.readFileSync("data/job-board.json","utf8"));
const products = JSON.parse(fs.readFileSync("data/products.json","utf8"));
const index = fs.readFileSync("index.html","utf8");
const registry = fs.readFileSync("adventure-registry.js","utf8");

if (!Array.isArray(board.notices) || board.notices.length < 4) fail("expected at least four live notices");
const ids = new Set();
for (const notice of board.notices) {
  if (!notice.id || ids.has(notice.id)) fail("notice ids must be unique and non-empty");
  ids.add(notice.id);
  const product = products.products.find(p => p.id === notice.id);
  if (!product) fail(notice.id + " has no product contract");
  if (!registry.includes('"' + notice.id + '"')) fail(notice.id + " has no runner registry entry");
  if (!notice.headline?.startsWith("Wanted adventurers for ")) fail(notice.id + " headline must begin with 'Wanted adventurers for '");
  for (const field of ["issuer","urgency","type","teaser","party","time","href"]) if (!notice[field]) fail(notice.id + " missing " + field);
  if (Number(notice.level) !== Number(product.level)) fail(notice.id + " level disagrees with product contract");
  if (!notice.href.includes("id=" + notice.id)) fail(notice.id + " href does not open its adventure");
  for (const required of [notice.headline, notice.issuer, notice.urgency, notice.type]) {
    if (!index.includes(required)) fail(notice.id + " homepage notice drifted from job-board data: " + required);
  }
}
console.log("Job board OK: " + board.notices.length + " in-world adventure postings match product/runner data.");
