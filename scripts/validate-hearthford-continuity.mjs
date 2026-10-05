#!/usr/bin/env node
import fs from "node:fs";

const canonical = new Set([
  "npc-cald-wren","npc-oda-flint","npc-brune-holt","npc-maestra-vell","npc-joss-amber",
  "npc-nim-low","npc-sera-moss","npc-idra-quell","npc-brother-halve","npc-old-fenn"
]);

const coverage=JSON.parse(fs.readFileSync("data/level-coverage.json","utf8"));
const failures=[];

for(const entry of coverage.assignments||[]){
  const path=`data/adventures/${entry.adventureId}.oneshot.json`;
  const a=JSON.parse(fs.readFileSync(path,"utf8"));
  const c=a.continuity;
  if(!c) { failures.push(`${entry.adventureId}: missing continuity contract`); continue; }
  if(c.hubId!=="hearthford" || c.hubName!=="Hearthford") failures.push(`${entry.adventureId}: hub must be Hearthford`);
  const recurring=(c.recurringNpcIds||[]).filter(id=>canonical.has(id));
  if(!recurring.length) failures.push(`${entry.adventureId}: no canonical recurring Hearthford NPC`);
  if(c.returnToHub!==true) failures.push(`${entry.adventureId}: returnToHub must be true`);

  const npcIds=new Set((a.npcs||[]).map(n=>n.id));
  for(const id of recurring) if(!npcIds.has(id)) failures.push(`${entry.adventureId}: recurring NPC ${id} missing from npcs`);

  const sceneNpcIds=new Set((a.scenes||[]).flatMap(s=>s.npcIds||[]));
  if(!recurring.some(id=>sceneNpcIds.has(id))) failures.push(`${entry.adventureId}: recurring NPC not bound into any scene`);

  const frame=a.setup?.campaignFrame||"";
  if(!/Hearthford/i.test(frame)) failures.push(`${entry.adventureId}: campaignFrame does not mention Hearthford`);
}

if(failures.length){
  console.error("HEARTHFORD CONTINUITY FAILED");
  for(const f of failures) console.error(" -",f);
  process.exit(1);
}
console.log(`Hearthford continuity OK for ${(coverage.assignments||[]).length} ladder adventures.`);
