import fs from "node:fs";

function read(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch (error) {
    console.error(`Narrative gate could not read ${path}:`, error.message);
    process.exit(1);
  }
}

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    console.error(`Narrative gate failed: missing ${label}: ${needle}`);
    process.exit(1);
  }
}

const standard = read("docs/WORLD_AND_NARRATIVE_STANDARD.md");
const index = read("index.html");
const zeroHero = read("zero-hero-kit.html");
const watchtower = read("adventures/beneath-the-eastern-watchtower.html");
const bridge = read("adventures/the-ashen-bridge.html");
const mere = read("adventures/the-bell-beneath-the-mere.html");
const birthday = read("adventures/birthday-one-shot.html");
const owlbearArms = read("adventures/right-to-owlbear-arms.html");

const well = JSON.parse(read("data/adventures/the-well-that-would-not-dry.oneshot.json"));
const hollow = JSON.parse(read("data/adventures/whispers-of-the-oakhaven-hollow.oneshot.json"));
const lantern = JSON.parse(read("data/adventures/the-lantern-below.oneshot.json"));
const watchtowerData = JSON.parse(read("data/adventures/beneath-the-eastern-watchtower.oneshot.json"));
const orchardData = JSON.parse(read("data/adventures/the-black-orchard.oneshot.json"));
const bridgeData = JSON.parse(read("data/adventures/the-ashen-bridge.oneshot.json"));
const birthdayData = read("birthday-one-shot/data.js");

requireText(standard, "Theme spine — one memorable idea, all the way through", "theme-spine standard");
requireText(standard, "Literal and easy to DM", "literal-DM standard");

for (const question of [
  "Who needs something?",
  "What happens if the heroes do nothing?",
  "What truth is initially hidden?",
  "What meaningful choice cannot be solved simply by killing something?",
  "What will the world remember afterward?"
]) {
  requireText(standard, question, "five-question story test");
}

requireText(index, "Hearthcross, Hearthford, and Oakhaven share one connected region", "shared-world storefront promise");
requireText(index, "the thief may have taken it because the lantern was never a blessing", "Lantern moral hook");
requireText(index, "Two communities need the same living wardstone", "Black Orchard dilemma");
requireText(index, "The law is unclear. The claws are not.", "OwlBear Arms voice");

requireText(zeroHero, "THE HEARTHCROSS SIX", "Zero-to-Hero character-first section");
for (const name of ["Tod Hale", "Merlon Quill", "Halley Brindle", "Mira Alder", "Fen Bell", "Lark Cask"]) {
  requireText(zeroHero, name, `starter child ${name}`);
}

requireText(watchtower, "What Oakhaven remembers:", "Watchtower consequence memory");
requireText(bridge, "Saving every person counts as success even if the bridge itself is lost.", "Bridge values hierarchy");
requireText(bridge, "What Oakhaven remembers:", "Bridge consequence memory");
requireText(mere, "What Oakhaven remembers:", "Mere consequence memory");
requireText(birthday, "Make the Birthday Person the Hero", "Birthday personalization headline");
requireText(owlbearArms, "legal-procedural comedy flagship", "OwlBear Arms flagship positioning");

if (!well.setup?.pitch?.toLowerCase().includes("name-stone")) {
  console.error("Narrative gate failed: Well authoritative pitch must connect the curse to the name-stone.");
  process.exit(1);
}

const lanternOil = lantern.truth?.facts?.find(f => f.id === "fact-oilless-light");
if (!lanternOil || !/Emberglass itself supplied the flame/i.test(lanternOil.text || "")) {
  console.error("Narrative gate failed: Lantern oil-less mystery payoff missing.");
  process.exit(1);
}
if (!birthdayData.includes("I made a birthday wish here once") || !birthdayData.includes("lost on the road")) {
  console.error("Narrative gate failed: Birthday finale drifted back into abstract hope stakes.");
  process.exit(1);
}
for (const [label, data] of [["Watchtower",watchtowerData],["Black Orchard",orchardData],["Ashen Bridge",bridgeData]]) {
  if (!data.setup?.characterPressure) {
    console.error(`Narrative gate failed: ${label} missing explicit want-driven character pressure.`);
    process.exit(1);
  }
}

const malakorFact = hollow.truth?.facts?.find(f => f.id === "fact-malakor-person");
if (!malakorFact || !/still intermittently himself/i.test(malakorFact.text || "")) {
  console.error("Narrative gate failed: Malakor must remain explicitly recoverable as a person, not only a combat state.");
  process.exit(1);
}

requireText(owlbearArms, "OWLBEAR_ARMS_V1_2_REPAIR.md", "OwlBear Arms v1.2 repair route");
requireText(owlbearArms, "sheets.html?pack=owlbear-arms", "OwlBear Arms repaired heroes route");
console.log("Catalog narrative/world gate OK");
