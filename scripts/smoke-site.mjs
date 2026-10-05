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
if (!index.includes("OneShot Forge")) errors.push("homepage must use OneShot Forge brand");
if (!/Everything public here is free|Public adventures remain free/i.test(index)) {
  errors.push("homepage must state the free public-adventure model");
}
if (!index.includes("12 pregens")) errors.push("homepage must say 12 pregens");
if (!index.includes("og:image")) errors.push("homepage missing Open Graph image");
if (!index.includes('src="catalog.js')) errors.push("homepage must hydrate from product contract");
if (!index.includes("SPECIAL PLAYTEST BOXED SET")) errors.push("homepage must distinguish Hearthcross from the one-shot catalog");
if (!index.includes("7 SESSIONS")) errors.push("homepage must disclose Hearthcross campaign length");

if (!index.includes("The Island That Drowns Tomorrow")) {
  errors.push("homepage missing time-loop island development card");
}
if (!index.includes("IN DEVELOPMENT · Not runnable yet")) {
  errors.push("unfinished adventure must remain visibly gated");
}

const productsText = read("data/products.json");
let contract = null;
try {
  contract = JSON.parse(productsText);
  if (!Array.isArray(contract.products)) throw new Error("products must be an array");
  if (contract.businessModel !== "free-ecosystem") errors.push("product contract must declare free-ecosystem business model");

  const productIds = new Set(contract.products.map(product => product.id));
  for (const cardId of [...index.matchAll(/data-product-id="([^"]+)"/g)].map(match => match[1])) {
    if (!productIds.has(cardId)) errors.push(`homepage product card missing from product contract: ${cardId}`);
  }

  for (const product of contract.products) {
    if (product.priceCents !== 0) errors.push(`${product.id}: public catalog price must be 0`);
    if (product.sellable !== false) errors.push(`${product.id}: free ecosystem products must not expose sellable checkout state`);
    if (product.releaseGate?.requiresCheckout !== false) errors.push(`${product.id}: free catalog must not require checkout`);
    if (product.releaseGate?.checkoutConfigured !== false) errors.push(`${product.id}: checkout must remain unconfigured`);
    if (product.commerce?.checkoutUrl) errors.push(`${product.id}: free product must not expose checkout URL`);
    if (product.commerce?.entitlementVerificationUrl) errors.push(`${product.id}: free product must not require entitlement verification`);

    if (product.productUrl?.endsWith(".html")) {
      const page = read(product.productUrl);
      if (!page.includes("OneShot Forge")) errors.push(`${product.id}: product page must use OneShot Forge brand`);
      if (/99¢|\$0\.99/i.test(page)) errors.push(`${product.id}: product page still contains paid-era pricing`);
      if (product.format !== "download-bundle" && !page.includes("Run as DM")) {
        errors.push(`${product.id}: runnable product page must offer Run as DM`);
      }
    }
  }
} catch (error) {
  errors.push("invalid data/products.json: " + error.message);
}

const catalog = read("catalog.js");
for (const required of ["FREE · Complete adventure", "FREE · Playtest adventure", "Run as DM", "Resume as DM"]) {
  if (!catalog.includes(required)) errors.push("free catalog behavior missing: " + required);
}
for (const forbidden of ["window.location.assign", "verifiedEntitlement", "checkout_return", "commerce.checkoutUrl"]) {
  if (catalog.includes(forbidden)) errors.push("free catalog still contains checkout/entitlement behavior: " + forbidden);
}

const run = read("run.html");
for (const id of ["read-aloud", "dm-box", "monster-box", "stage-progress", "scene-exits", "prev-scene", "next-scene"]) {
  if (!run.includes('id="' + id + '"')) errors.push("run.html missing #" + id);
}
if (/id="forge-random"/.test(run)) errors.push("customer runner still has New random");

const app = read("app.js");
if (!app.includes("reactions.accusation")) errors.push("GM runner no longer surfaces authored accusation reactions");

const requiredLadder = [
  "the-last-treat-of-gloamwick",
  "the-empty-chair-of-harvesthome",
  "the-gift-that-never-arrived",
  "the-year-that-wouldnt-end",
  "the-heartloom-of-rosebridge",
  "the-first-egg-of-greenhollow",
  "the-last-rocket-of-founding-day",
  "the-lanterns-we-left-behind",
  "the-graduation-that-opened-the-sky"
];

for (const id of requiredLadder) {
  if (!index.includes(id)) errors.push(`homepage missing Hearthford ladder card: ${id}`);
  read(`data/adventures/${id}.oneshot.json`);
  read(`adventures/${id}.html`);
}

for (const id of [
  "the-lantern-below",
  "the-well-that-would-not-dry",
  "the-owlbear-egg",
  "birthday-one-shot",
  "whispers-of-the-oakhaven-hollow",
  "beneath-the-eastern-watchtower",
  "the-black-orchard",
  "the-ashen-bridge",
  "the-bell-beneath-the-mere"
]) {
  if (!index.includes(id)) errors.push(`homepage missing existing adventure card: ${id}`);
}

for (const rel of [
  "about.html", "privacy.html", "contact.html", "forge.html", "cards.html", "cards.js",
  "robots.txt", "sitemap.xml", "adventure-registry.js",
  "assets/maps/holiday/bellmere-ghost-road-grid.svg",
  "assets/maps/holiday/bellmere-crossroads-grid.svg",
  "assets/maps/holiday/bellmere-memorial-hill-grid.svg",
  "assets/maps/special/ninefold-capstone-hall-grid.svg",
  "assets/maps/special/ninefold-projection-labs-grid.svg",
  "assets/maps/special/ninefold-observatory-grid.svg"
]) read(rel);

const hrefs = [...index.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
for (const href of hrefs) {
  if (/^https?:|^mailto:|^#/.test(href)) continue;
  const clean = href.split("?")[0].split("#")[0];
  if (clean && !fs.existsSync(path.join(root, clean))) errors.push("broken homepage link " + href);
}

if (contract) {
  const birthdayProduct = contract.products.find(product => product.id === "birthday-one-shot");
  if (!birthdayProduct) errors.push("Birthday One Shot missing from product contract");
  else {
    if (birthdayProduct.sellable !== false) errors.push("Birthday One Shot must remain non-sellable during review");
    if (birthdayProduct.status !== "review") errors.push("Birthday One Shot must remain in review status");
    if (birthdayProduct.releaseGate?.approved !== false) errors.push("Birthday One Shot release approval must remain false");
  }
}

const birthdayPersonalization = read("birthday-one-shot/personalization.js");
for (const required of [
  "99centoneshots:birthday-hero-name",
  "localStorage.setItem",
  "localStorage.removeItem",
  "Birthday Hero",
  "window.location.reload()"
]) {
  if (!birthdayPersonalization.includes(required)) errors.push("Birthday personalization missing: " + required);
}

for (const forbidden of ["Wendy", "wendy", "birthday girl", "birthday boy"]) {
  for (const rel of [
    "birthday-one-shot/data.js",
    "birthday-one-shot/player-data.js",
    "birthday-one-shot/production.js",
    "birthday-one-shot/streamlined.js",
    "birthday-one-shot/index.html"
  ]) {
    if (read(rel).includes(forbidden)) errors.push(`Birthday package still contains fixed personalization '${forbidden}' in ${rel}`);
  }
}

const owlbearPage = read("adventures/the-owlbear-egg.html");
if (!owlbearPage.includes("cards.html?id=the-owlbear-egg")) errors.push("Owlbear page missing printable cards link");

if (errors.length) {
  console.error("Smoke failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}
console.log("Site smoke OK — free catalog, DM runner links, Hearthford ladder, and development gates verified.");
