const {generateBones}=require("../forge-bones.js");
const {createFleshRequest,assertBonesUnchanged}=require("../forge-flesh.js");

function assert(value,message){ if(!value) throw new Error(message); }

for(let i=0;i<250;i++){
  const options={seed:"BONES-"+i};
  const a=generateBones(options);
  const b=generateBones(options);
  assert(JSON.stringify(a)===JSON.stringify(b),"same seed must reproduce bones");
  assert(a.theme?.id&&a.theme?.spine,"authoritative theme spine missing");
  assert(Array.isArray(a.theme.motifs)&&a.theme.motifs.length>=2,"theme motifs missing");
  assert(a.randomEncounters.length===2,"exactly two random encounters required");
  assert(a.locationProgression.length>=2,"location progression missing");
  assert(["monster","npc","artifact","ritual","environment","mixed"].includes(a.finale.kind),"illegal finale kind");
  assert(a.finale.noncombatResolution,"finale needs noncombat resolution");
  assert(a.obstacle.failForward,"obstacle must fail forward");
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

console.log("Validated 250 deterministic ForgeBones plus locks and AI immutability.");
