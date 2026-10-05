#!/usr/bin/env node
import fs from "node:fs";

const coverage=JSON.parse(fs.readFileSync("data/level-coverage.json","utf8"));
const curriculum=JSON.parse(fs.readFileSync("data/dnd-curriculum-coverage.json","utf8"));
const failures=[];

for(const entry of coverage.assignments||[]){
  const row=curriculum.levels?.[String(entry.level)];
  if(!row) failures.push(`Level ${entry.level}: missing curriculum row`);
  else {
    if(row.adventureId!==entry.adventureId) failures.push(`Level ${entry.level}: curriculum adventure mismatch`);
    if(!Array.isArray(row.focus)||row.focus.length<5) failures.push(`Level ${entry.level}: needs at least 5 teaching focuses`);
  }
}
if(curriculum.nextLevel!==coverage.nextLevel) failures.push(`curriculum nextLevel ${curriculum.nextLevel} does not match ladder nextLevel ${coverage.nextLevel}`);

if(failures.length){
  console.error("D&D CURRICULUM COVERAGE FAILED");
  for(const f of failures) console.error(" -",f);
  process.exit(1);
}
console.log(`D&D curriculum coverage OK for ${(coverage.assignments||[]).length} ladder adventures.`);
