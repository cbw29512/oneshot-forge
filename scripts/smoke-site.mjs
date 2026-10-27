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
if (!index.includes("12 ready-made characters")) errors.push("homepage must say 12 ready-made characters");
if (!index.includes("Everything here is free to play right now. Paid versions will cost $0.99 each.")) errors.push("homepage must state the free-now / $0.99 later price");
if (!index.includes("Oakhaven series")) errors.push("homepage must show the Oakhaven series row");
if (!index.includes("Levels 1 and 7-10 coming")) errors.push("homepage must say levels 1 and 7-10 are coming");
if (!index.includes('id="filter-level"') || !index.includes('id="filter-series"')) errors.push("homepage must offer level and series filters");
if (!index.includes("Works with 2014 and 2024 rules") || !index.includes("2014 rules only")) errors.push("homepage must show edition badges");
if (!index.includes("$0.99 (coming soon)") || !index.includes(">Free<")) errors.push("homepage cards must show Free and $0.99 coming-soon chips");
if (!/assets\/cover-[^"]+\.webp/.test(index) || !index.includes('loading="lazy"')) errors.push("homepage covers must be lazy-loaded WebP");
if (!index.includes("og:image")) errors.push("homepage missing Open Graph image");
if (!index.includes('src="catalog.js')) errors.push("homepage must hydrate from product contract");
if (!index.includes("99¢ One-Shots")) errors.push("homepage must use 99¢ One-Shots customer-facing brand");
if (!index.includes("Start free. Then pick a 99¢ night.")) errors.push("homepage must state the free-starter/99¢ offer");
if (!index.includes("SPECIAL PLAYTEST BOXED SET")) errors.push("homepage must distinguish Hearthcross from the one-shot catalog");
if (!index.includes("7 SESSIONS")) errors.push("homepage must disclose Hearthcross campaign length");
if (!index.includes("Not for sale")) errors.push("homepage must keep Hearthcross commercial state explicit");

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

try {
  const contract = JSON.parse(productsText);
  const lanternProduct = contract.products.find(product => product.id === "the-lantern-below");
  if (!lanternProduct) errors.push("Lantern free starter missing from product contract");
  else {
    if (lanternProduct.currentAccess !== "free-starter") errors.push("Lantern must remain the permanent free starter");
    if (lanternProduct.priceCents !== 0) errors.push("Lantern free starter price must remain 0");
    if (lanternProduct.sellable !== false) errors.push("Lantern free starter must not enter paid checkout");
    if (lanternProduct.releaseGate?.requiresCheckout !== false) errors.push("Lantern free starter must not require checkout");
  }
} catch (error) {
  errors.push("could not validate Lantern free-starter contract: " + error.message);
}

try {
  const contract = JSON.parse(productsText);
  for (const product of contract.products || []) {
    if (!product.productUrl?.endsWith(".html")) continue;
    const page = read(product.productUrl);
    if (!page.includes("99¢ One-Shots")) {
      errors.push(`${product.id}: product page must use 99¢ One-Shots customer-facing brand`);
    }
    if (!page.includes("What you get / what you need")) {
      errors.push(`${product.id}: product page missing what you get / what you need`);
    }
    if (!page.includes("data-edition-badge")) {
      errors.push(`${product.id}: product page missing an edition badge`);
    }
    if (product.id !== "the-lantern-below" && !page.includes("Free to play while we finish testing. It will cost $0.99 when it launches.")) {
      errors.push(`${product.id}: product page missing the public checkout line`);
    }
  }
} catch (error) {
  errors.push("could not validate product-page branding: " + error.message);
}

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

const sheets = read("sheets.html");
if (!sheets.includes('<meta name="description"')) errors.push("sheets.html missing meta description");
const run = read("run.html");
if (!run.includes('<meta name="description"')) errors.push("run.html missing meta description");
for (const id of ["read-aloud", "dm-box", "monster-box", "stage-progress", "scene-exits", "prev-scene", "next-scene"]) if (!run.includes('id="' + id + '"')) errors.push("run.html missing #" + id);
if (/id="forge-random"/.test(run)) errors.push("customer runner still has New random");
const app = read("app.js");
if (!app.includes("reactions.accusation")) errors.push("GM runner no longer surfaces authored accusation reactions");

const lantern = read("adventures/the-lantern-below.html");
if (!lantern.includes("Start adventure")) errors.push("adventure page missing Start adventure");
if (!lantern.includes("PERMANENT FREE STARTER")) errors.push("Lantern page must identify the permanent free starter");
if (!lantern.includes("99¢ One-Shots")) errors.push("Lantern page must use storefront brand");
for (const rel of ["about.html", "privacy.html", "contact.html", "forge.html", "cards.html", "cards.js", "robots.txt", "sitemap.xml", "assets/cover-lantern.jpg", "adventures/birthday-one-shot.html", "birthday-one-shot/index.html", "birthday-one-shot/data.js", "birthday-one-shot/production.js", "birthday-one-shot/player-data.js", "birthday-one-shot/streamlined.js", "birthday-one-shot/personalization.js", "birthday-one-shot/app.js", "birthday-one-shot/official-format.js", "birthday-one-shot/styles.css", "data/adventures/the-lantern-below.oneshot.json", "data/adventures/the-well-that-would-not-dry.oneshot.json", "data/adventures/the-owlbear-egg.oneshot.json", "data/adventures/whispers-of-the-oakhaven-hollow.oneshot.json", "data/adventures/beneath-the-eastern-watchtower.oneshot.json", "adventures/the-owlbear-egg.html", "adventures/whispers-of-the-oakhaven-hollow.html", "adventures/beneath-the-eastern-watchtower.html", "assets/maps/oakhaven/bramble-guard-grid.svg", "assets/maps/oakhaven/heart-tree-grid.svg", "assets/maps/oakhaven/flooded-sally-tunnel-grid.svg", "assets/maps/oakhaven/gloam-sluice-grid.svg", "data/adventures/the-black-orchard.oneshot.json", "adventures/the-black-orchard.html", "assets/maps/oakhaven/black-orchard-rows-grid.svg", "assets/maps/oakhaven/rootheart-quarry-grid.svg", "data/adventures/the-ashen-bridge.oneshot.json", "adventures/the-ashen-bridge.html", "assets/maps/oakhaven/ashen-bridge-grid.svg", "assets/maps/oakhaven/ashhouse-mortar-handout.svg", "data/adventures/the-bell-beneath-the-mere.oneshot.json", "adventures/the-bell-beneath-the-mere.html", "assets/maps/oakhaven/drowned-bell-house-grid.svg", "assets/maps/oakhaven/founder-diversion-handout.svg", "adventure-registry.js"]) read(rel);
if (!index.includes("the-lantern-below")) errors.push("homepage missing active Lantern card");
if (!index.includes("the-owlbear-egg")) errors.push("homepage missing Owlbear Egg preview card");
if (!index.includes("birthday-one-shot")) errors.push("homepage missing Birthday One Shot review card");
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


const birthdayProduct = JSON.parse(productsText).products.find(product => product.id === "birthday-one-shot");
if (!birthdayProduct) errors.push("Birthday One Shot missing from product contract");
else {
  if (birthdayProduct.sellable !== false) errors.push("Birthday One Shot must remain non-sellable during review");
  if (birthdayProduct.status !== "review") errors.push("Birthday One Shot must remain in review status");
  if (birthdayProduct.releaseGate?.approved !== false) errors.push("Birthday One Shot release approval must remain false");
  if (birthdayProduct.releaseGate?.checkoutConfigured !== false) errors.push("Birthday One Shot checkout must remain closed");
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
for (const rel of [
  "birthday-one-shot/data.js",
  "birthday-one-shot/production.js",
  "birthday-one-shot/streamlined.js"
]) {
  const birthdayCopy = read(rel);
  const genderLeak = /Birthday Hero[^\n"']{0,180}\b(?:she|her|hers)\b|\b(?:she|her|hers)\b[^\n"']{0,180}Birthday Hero/i;
  if (genderLeak.test(birthdayCopy)) errors.push(`Birthday Hero personalization still has gendered copy in ${rel}`);
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
  errors.forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log("Site smoke OK");
