#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

try {
  const coverage = JSON.parse(fs.readFileSync("data/level-coverage.json", "utf8"));
  for (const entry of coverage.assignments || []) {
    const path = `data/adventures/${entry.adventureId}.oneshot.json`;
    const result = spawnSync(process.execPath, ["scripts/validate-structural-integrity.mjs", path], { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status || 1);
  }
  console.log(`Structural integrity OK for ${(coverage.assignments || []).length} ladder adventures.`);
} catch (error) {
  console.error("LADDER STRUCTURAL-INTEGRITY ERROR:", error.message);
  process.exit(1);
}
