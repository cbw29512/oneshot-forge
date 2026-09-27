import fs from "node:fs";

function fail(message) {
  console.error("Pregen progression validation failed:", message);
  process.exit(1);
}

function expectedProficiency(level) {
  return 2 + Math.floor((level - 1) / 4);
}

function expectedFighterAttacks(level) {
  if (level >= 20) return 4;
  if (level >= 11) return 3;
  if (level >= 5) return 2;
  return 1;
}

try {
  const path = process.argv[2];
  if (!path) fail("usage: node scripts/validate-pregen-progression.mjs <progression.json>");
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  if (data.schema !== "oneshot-forge-pregen-progression/0.1") fail("unsupported schema");
  if (!data.characterId || !data.ruleset || !data.identity || !Array.isArray(data.levels)) fail("missing progression identity");
  if (!Array.isArray(data.equipmentHistory) || !Array.isArray(data.magicItemHistory)) fail("history arrays are required");

  const acquisitionLevel = new Map();
  for (const event of data.magicItemHistory) {
    if (!Number.isInteger(event.level) || event.level < 1 || event.level > 20) fail("magic-item history event has illegal level");
    if (!Array.isArray(event.items) || event.items.length === 0) fail("magic-item history event requires items[]");
    for (const item of event.items) {
      if (event.event === "acquired" && !acquisitionLevel.has(item)) acquisitionLevel.set(item, event.level);
    }
  }

  let prior = null;
  const seen = new Set();
  for (const snapshot of data.levels) {
    if (seen.has(snapshot.level)) fail(`duplicate level ${snapshot.level}`);
    seen.add(snapshot.level);
    if (snapshot.level < 1 || snapshot.level > 20) fail(`illegal level ${snapshot.level}`);
    if (snapshot.proficiency !== expectedProficiency(snapshot.level)) fail(`wrong proficiency at level ${snapshot.level}`);
    if (snapshot.hitDice !== `${snapshot.level}d10`) fail(`wrong fighter hit dice at level ${snapshot.level}`);
    if (!Number.isInteger(snapshot.hp) || snapshot.hp < 1) fail(`invalid HP at level ${snapshot.level}`);
    if (!Number.isInteger(snapshot.STR) || snapshot.STR < 1 || snapshot.STR > 20) fail(`invalid STR at level ${snapshot.level}`);
    if (snapshot.CON != null && (!Number.isInteger(snapshot.CON) || snapshot.CON < 1 || snapshot.CON > 20)) fail(`invalid CON at level ${snapshot.level}`);
    if (snapshot.DEX != null && (!Number.isInteger(snapshot.DEX) || snapshot.DEX < 1 || snapshot.DEX > 20)) fail(`invalid DEX at level ${snapshot.level}`);
    if (snapshot.attacksPerAction !== expectedFighterAttacks(snapshot.level)) fail(`wrong Fighter attacks/action at level ${snapshot.level}`);
    if (!Array.isArray(snapshot.magicItems)) fail(`missing magicItems[] at level ${snapshot.level}`);
    for (const item of snapshot.magicItems) {
      const acquired = acquisitionLevel.get(item);
      if (!acquired) fail(`${item} appears at level ${snapshot.level} without an acquisition event`);
      if (acquired > snapshot.level) fail(`${item} leaked backward into level ${snapshot.level} before acquisition at level ${acquired}`);
    }
    if (!Array.isArray(snapshot.gained)) fail(`missing gained features at level ${snapshot.level}`);
    if (prior && snapshot.level !== prior.level + 1) fail(`level gap after ${prior.level}`);
    if (prior && snapshot.hp < prior.hp) fail(`HP regressed at level ${snapshot.level}`);
    if (prior && snapshot.STR < prior.STR) fail(`STR regressed at level ${snapshot.level}`);
    prior = snapshot;
  }

  for (const event of data.equipmentHistory) {
    if (!Number.isInteger(event.level) || event.level < 1 || event.level > 20) fail("equipment history event has illegal level");
  }

  const maxLevel = data.levels.at(-1)?.level || 0;
  const leakedHistory = data.magicItemHistory.filter((event) => event.level > maxLevel);
  if (leakedHistory.length) fail("future magic-item history leaked into current progression");

  console.log(`Validated ${data.identity.name}: levels 1-${maxLevel}, Fighter feature timing, proficiency, HP, attacks, and magic-item acquisition timing.`);
} catch (error) {
  console.error("Pregen progression validator crashed:", error);
  process.exit(1);
}
