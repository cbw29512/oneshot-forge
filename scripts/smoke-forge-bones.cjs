const {generateBones}=require("../forge-bones.js");
const {createFleshRequest,assertBonesUnchanged}=require("../forge-flesh.js");

function assert(value,message){ if(!value) throw new Error(message); }

for(let i=0;i<250;i++){
  const options={seed:"BONES-"+i};
  const a=generateBones(options);
  const b=generateBones(options);
  assert(JSON.stringify(a)===JSON.stringify(b),"same seed must reproduce bones");
  assert(a.randomEncounters.length===2,"exactly two random encounters required");
  assert(a.locationProgression.length>=2,"location progression missing");
  assert(["monster","npc","artifact","ritual","environment","mixed"].includes(a.finale.kind),"illegal finale kind");
  assert(a.finale.noncombatResolution,"finale needs noncombat resolution");
  assert(a.obstacle.failForward,"obstacle must fail forward");
  assert(a.requiredFacts.length>0,"required facts missing");
  for(const fact of a.requiredFacts){
    const bundle=a.requiredClues.find((clue)=>clue.factId===fact.id);
    assert(bundle,"required fact missing clue bundle");
    assert(bundle.sources.length>=3,"required fact needs at least three clue sources");
    assert(bundle.sources.some((source)=>["physical","environmental"].includes(source.kind)),"required fact needs physical/environmental evidence");
  }
  const request=createFleshRequest(a);
  assert(request.bones.seed===a.seed,"AI request lost seed");
  assert(request.forbidden.length>=4,"AI guardrails missing");
  assertBonesUnchanged(a,JSON.parse(JSON.stringify(a)));
}

const locked=generateBones({
  seed:"LOCK-CHECK",
  locks:{origin:"locked origin",destination:"locked destination",giver:"locked giver"}
});
assert(locked.preview.origin==="locked origin","origin lock changed");
assert(locked.preview.destination==="locked destination","destination lock changed");
assert(locked.questGiver.role==="locked giver","giver lock changed");

const original=generateBones({seed:"MUTATION"});
const changed=JSON.parse(JSON.stringify(original));
changed.finale.kind="monster";
if(original.finale.kind==="monster") changed.finale.kind="artifact";
let blocked=false;
try{ assertBonesUnchanged(original,changed); }catch{ blocked=true; }
assert(blocked,"AI mutation guard did not block changed bones");

console.log("Validated 250 deterministic ForgeBones, three-source clue redundancy, locks, and AI immutability.");
