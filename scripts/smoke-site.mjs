#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { errors.push("missing " + rel); return ""; }
  return fs.readFileSync(file, "utf8");
}

const index = read("index.html");
if (!index.includes('id="nights"')) errors.push("homepage missing #nights catalog");
if (!/Choose tonight/i.test(index)) errors.push("homepage must lead with choose-tonight catalog");
if (!index.includes("Coming after review")) errors.push("next adventure must remain gated behind review");
if (!index.includes("12 pregens")) errors.push("homepage must say 12 pregens");
if (!index.includes("og:image")) errors.push("homepage missing Open Graph image");
if (!index.includes('src="catalog.js')) errors.push("homepage must hydrate from product contract");

const productsText = read("data/products.json");
try {
  const contract = JSON.parse(productsText);
  if (!Array.isArray(contract.products)) throw new Error("products must be an array");
  const productIds = new Set(contract.products.map(product => product.id));
  for (const cardId of [...index.matchAll(/data-product-id="([^"]+)"/g)].map(match => match[1])) {
    if (!productIds.has(cardId)) errors.push(`homepage product card missing from product contract: ${cardId}`);
  }
  for (const product of contract.products) {
    const gate = product.releaseGate || {};
    const commerce = product.commerce || {};
    const commerceReady = Boolean(commerce.provider && commerce.checkoutUrl && commerce.entitlementMode === "server-verified" && commerce.entitlementVerificationUrl);
    const gated = product.sellable && gate.approved && gate.checkoutConfigured && commerceReady;
    if (gate.checkoutConfigured && !commerceReady) errors.push(`${product.id}: checkoutConfigured requires provider, checkout URL, and server-verified entitlement endpoint`);
    if (product.sellable && !gated) errors.push(`${product.id}: sellable product has incomplete release gate`);
    if (!gated && index.includes(`data-product-id="${product.id}" data-commercial-state="sellable"`)) errors.push(`${product.id}: homepage exposes Buy state before release gates pass`);
  }
} catch (error) { errors.push("invalid data/products.json: " + error.message); }

const catalog = read("catalog.js");
for (const required of [
  "checkoutConfigured", "gate.approved", "commerce.checkoutUrl", 'commerce.entitlementMode === "server-verified"',
  "commerce.entitlementVerificationUrl", "event.preventDefault()", 'target.protocol !== "https:"', "window.location.assign(target.href)",
  'params.get("checkout_return")', "await verifiedEntitlement(product)", 'entitlement !== "owned"', "clearCheckoutReturn()", "window.history.replaceState"
]) {
  if (!catalog.includes(required)) errors.push("catalog checkout/entitlement gate missing: " + required);
}

const entitlement = read("docs/ENTITLEMENT_API.md");
for (const required of ["GET /api/entitlements/{productId}", '"owned": true', "401", "404", "503", "fail closed", "Price is never trusted from browser input", "localStorage"]) {
  if (!entitlement.includes(required)) errors.push("entitlement contract missing: " + required);
}

const run = read("run.html");
for (const id of ["read-aloud", "dm-box", "monster-box", "stage-progress", "scene-exits", "prev-scene", "next-scene"]) if (!run.includes('id="' + id + '"')) errors.push("run.html missing #" + id);
if (/id="forge-random"/.test(run)) errors.push("customer runner still has New random");
const app = read("app.js");
if (!app.includes("reactions.accusation")) errors.push("GM runner no longer surfaces authored accusation reactions");

const lantern = read("adventures/the-lantern-below.html");
if (!lantern.includes("Start adventure")) errors.push("adventure page missing Start adventure");
for (const rel of ["about.html", "privacy.html", "contact.html", "forge.html", "cards.html", "cards.js", "robots.txt", "sitemap.xml", "assets/cover-lantern.jpg", "data/adventures/the-lantern-below.oneshot.json", "data/adventures/the-well-that-would-not-dry.oneshot.json", "data/adventures/the-owlbear-egg.oneshot.json", "data/adventures/whispers-of-the-oakhaven-hollow.oneshot.json", "data/adventures/beneath-the-eastern-watchtower.oneshot.json", "adventures/the-owlbear-egg.html", "adventures/whispers-of-the-oakhaven-hollow.html", "adventures/beneath-the-eastern-watchtower.html", "assets/maps/oakhaven/bramble-guard-grid.svg", "assets/maps/oakhaven/heart-tree-grid.svg", "assets/maps/oakhaven/flooded-sally-tunnel-grid.svg", "assets/maps/oakhaven/gloam-sluice-grid.svg", "data/adventures/the-black-orchard.oneshot.json", "adventures/the-black-orchard.html", "assets/maps/oakhaven/black-orchard-rows-grid.svg", "assets/maps/oakhaven/rootheart-quarry-grid.svg", "data/adventures/the-ashen-bridge.oneshot.json", "adventures/the-ashen-bridge.html", "assets/maps/oakhaven/ashen-bridge-grid.svg", "assets/maps/oakhaven/ashhouse-mortar-handout.svg", "data/adventures/the-bell-beneath-the-mere.oneshot.json", "adventures/the-bell-beneath-the-mere.html", "assets/maps/oakhaven/drowned-bell-house-grid.svg", "assets/maps/oakhaven/founder-diversion-handout.svg", "adventure-registry.js"]) read(rel);
if (!index.includes("the-lantern-below")) errors.push("homepage missing active Lantern card");
if (!index.includes("the-owlbear-egg")) errors.push("homepage missing Owlbear Egg preview card");
if (!index.includes("whispers-of-the-oakhaven-hollow")) errors.push("homepage missing Oakhaven Module 02 preview card");
if (!index.includes("beneath-the-eastern-watchtower")) errors.push("homepage missing Oakhaven Module 03 preview card");
if (!index.includes("the-black-orchard")) errors.push("homepage missing Oakhaven Module 04 preview card");
if (!index.includes("the-ashen-bridge")) errors.push("homepage missing Oakhaven Module 05 preview card");
if (!index.includes("the-bell-beneath-the-mere")) errors.push("homepage missing Oakhaven Module 06 preview card");

const hrefs = [...index.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
for (const href of hrefs) {
  if (/^https?:|^mailto:|^#/.test(href)) continue;
  const clean = href.split("?")[0].split("#")[0];
  if (clean && !fs.existsSync(path.join(root, clean))) errors.push("broken homepage link " + href);
}


const owlbearPage = read("adventures/the-owlbear-egg.html");
if (!owlbearPage.includes("cards.html?id=the-owlbear-egg")) errors.push("Owlbear page missing printable cards link");

if (errors.length) {
  console.error("Smoke failed:");
  errors.forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log("Site smoke OK");
