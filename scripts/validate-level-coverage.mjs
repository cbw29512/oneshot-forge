#!/usr/bin/env node
import fs from "node:fs";

const errors = [];
const fail = message => errors.push(message);

try {
  const coverage = JSON.parse(fs.readFileSync("data/level-coverage.json", "utf8"));
  const products = JSON.parse(fs.readFileSync("data/products.json", "utf8")).products || [];
  const seenLevels = new Set();
  const seenIds = new Set();

  if (!Number.isInteger(coverage.nextLevel) || coverage.nextLevel < 1 || coverage.nextLevel > 20) {
    fail("nextLevel must be an integer from 1 to 20");
  }

  for (const entry of coverage.assignments || []) {
    if (!Number.isInteger(entry.level) || entry.level < 1 || entry.level > 20) fail(`${entry.adventureId}: invalid ladder level`);
    if (seenLevels.has(entry.level)) fail(`level ${entry.level} is assigned more than once before full 1-20 coverage`);
    if (seenIds.has(entry.adventureId)) fail(`${entry.adventureId}: duplicate ladder assignment`);
    seenLevels.add(entry.level);
    seenIds.add(entry.adventureId);

    const path = `data/adventures/${entry.adventureId}.oneshot.json`;
    if (!fs.existsSync(path)) {
      fail(`${entry.adventureId}: missing adventure package`);
      continue;
    }
    const adventure = JSON.parse(fs.readFileSync(path, "utf8"));
    if (adventure.metadata?.partyLevel !== entry.level) {
      fail(`${entry.adventureId}: package level ${adventure.metadata?.partyLevel} does not match ladder level ${entry.level}`);
    }
    const product = products.find(item => item.id === entry.adventureId);
    if (!product) fail(`${entry.adventureId}: missing product contract`);
    else if (product.level !== entry.level) fail(`${entry.adventureId}: product level ${product.level} does not match ladder level ${entry.level}`);
  }

  const assigned = [...seenLevels].sort((a,b)=>a-b);
  for (let i=0; i<assigned.length; i++) {
    if (assigned[i] !== i + 1) fail(`ladder has a gap before level ${assigned[i]}`);
  }
  const expectedNext = Math.min(20, assigned.length + 1);
  if (coverage.nextLevel !== expectedNext) {
    fail(`nextLevel is ${coverage.nextLevel}; expected ${expectedNext}`);
  }

  if (errors.length) {
    console.error("Level coverage validation failed:");
    errors.forEach(error => console.error(" -", error));
    process.exit(1);
  }
  console.log(`Level coverage OK: ${assigned.length} rung(s) assigned; next new adventure is level ${coverage.nextLevel}.`);
} catch (error) {
  console.error("LEVEL-COVERAGE ERROR:", error.message);
  process.exit(1);
}
