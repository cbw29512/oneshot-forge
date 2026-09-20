#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    errors.push("missing " + rel);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

const index = read("index.html");
if (!index.includes('id="nights"')) errors.push("homepage missing #nights catalog");
if (!/Choose tonight/i.test(index)) errors.push("homepage must lead with choose-tonight catalog");
if (!index.includes("Coming soon")) errors.push("unwritten nights must say Coming soon");
if (!index.includes("12 pregens")) errors.push("homepage must say 12 pregens");
if (!index.includes("og:image")) errors.push("homepage missing Open Graph image");

const run = read("run.html");
for (const id of ["read-aloud", "dm-box", "monster-box", "stage-progress", "scene-exits", "prev-scene", "next-scene"]) {
  if (!run.includes('id="' + id + '"')) errors.push("run.html missing #" + id);
}
if (/id="forge-random"/.test(run)) errors.push("customer runner still has New random");

const lantern = read("adventures/the-lantern-below.html");
if (!lantern.includes("Start adventure")) errors.push("adventure page missing Start adventure");

for (const rel of [
  "about.html", "privacy.html", "contact.html", "forge.html",
  "robots.txt", "sitemap.xml", "assets/cover-lantern.jpg",
  "data/adventures/the-lantern-below.oneshot.json"
]) read(rel);

const hrefs = [...index.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
for (const href of hrefs) {
  if (/^https?:|^mailto:|^#/.test(href)) continue;
  const clean = href.split("?")[0].split("#")[0];
  if (!clean) continue;
  if (!fs.existsSync(path.join(root, clean))) errors.push("broken homepage link " + href);
}

if (errors.length) {
  console.error("Smoke failed:");
  errors.forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log("Site smoke OK");
