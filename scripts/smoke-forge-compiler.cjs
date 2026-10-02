const {generateBones}=require("../forge-bones.js");
const {compileBones}=require("../forge-compiler.js");

function assert(value,message){ if(!value) throw new Error(message); }

for(let i=0;i<250;i++){
  const bones=generateBones({seed:"PACKAGE-"+i});
  const pkg=compileBones(bones,{level:4,partySize:4,durationHours:4});
  assert(pkg.schemaVersion==="0.1.0","wrong package schema version");
  assert(pkg.metadata.seed===bones.seed,"compiler lost seed");
  assert(pkg.metadata.source==="ForgeBones","source provenance missing");
  assert(pkg.encounters.length===2,"compiler must preserve exactly two random encounters");
  assert(pkg.clues.filter(c=>c.required).every(c=>c.sources.length>=3),"required clues need three sources");
  assert(pkg.recovery.routes.length>=3,"recovery routes missing");
  assert(pkg.scenes.some(s=>s.id==="scene-finale"),"finale scene missing");
  assert(pkg.scenes.find(s=>s.id==="scene-finale").gmNotes.join(" ").includes(bones.finale.noncombatResolution),"noncombat finale lost");
  assert(pkg.initialState.currentSceneId==="scene-hook","initial state must start at hook");
  assert(pkg.quest.objective===bones.hook.objective,"authoritative objective changed");
  assert(pkg.truth.secrets[0].text===bones.twist.actualTruth,"authoritative truth changed");
}

const locked=generateBones({seed:"PACKAGE-LOCK",locks:{origin:"locked origin",finale:["artifact","locked artifact","decide its fate","seal it safely","it breaks loose"]}});
const compiled=compileBones(locked);
assert(compiled.setup.openingLocation==="locked origin","origin lock changed during compilation");
assert(compiled.scenes.find(s=>s.id==="scene-finale").gmNotes.join(" ").includes("seal it safely"),"finale lock changed during compilation");

console.log("Validated 250 ForgeBones Adventure Package compilations plus lock preservation.");