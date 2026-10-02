import fs from "node:fs";

const file="data/zero-to-hero/from-zero-to-hero.json";
const d=JSON.parse(fs.readFileSync(file,"utf8"));
const fail=m=>{console.error("Zero-to-Hero validation failed:",m);process.exit(1);};
const ab=["STR","DEX","CON","INT","WIS","CHA"];

if(d.id!=="from-zero-to-hero") fail("wrong id");
if(d.rules?.mode!=="level-0-house-rule"||d.rules?.criticalChecksHouseRule!==true||d.rules?.editionIsolation!==true) fail("Level-0 isolation/critical house-rule flags missing");
if(d.start?.age!==12||d.start?.className!=="Level 0") fail("must start age 12 at Level 0");
for(const a of ab) if(d.start?.scores?.[a]!==9) fail(a+" must start at 9");
if(d.development?.totalPoints!==21||d.development?.pointsPerChapter!==3||d.development?.maxPreOriginScore!==15) fail("development budget must be 21 / 3 per chapter / cap 15");
if(d.development?.startingPointBuyCost!==6||d.development?.finalPointBuyBudget!==27) fail("RAW point-buy bridge must be 6 starting / 27 final");
for(const s of [9,10,11,12,13,14]) if(!d.development?.costToRaise?.[String(s)]) fail("missing cost for score "+s);
for(const o of ["criticalSuccess","success","failure","criticalFailure"]){
  if(d.development?.growthPointsByOutcome?.[o]!==1) fail(o+" must award exactly one Development Point");
  if(d.development?.permanentBuildDeltaByOutcome?.[o]!==0) fail(o+" may not change permanent build power");
}
if(d.development?.finalReflection?.enabled!==true||d.development?.finalReflection?.requiresExactBudget!==true) fail("Final Reflection exact-budget rule missing");
if(d.rules?.naturalExtremesNeverOverrideTotal!==true) fail("natural extremes must not override normal total-vs-DC resolution");
if(!Array.isArray(d.village?.npcs)||d.village.npcs.length<12) fail("village requires at least 12 recurring NPCs");
for(const n of d.village.npcs){
  for(const k of ["id","name","role","appearance","voice","wants","fears","secret","teaches","provides","change"]) if(!n[k]|| (Array.isArray(n[k])&&!n[k].length)) fail("NPC "+(n.id||"?")+" missing "+k);
}
if(!Array.isArray(d.chapters)||d.chapters.length!==7) fail("must have seven yearly chapters");
const ages=d.chapters.map(x=>x.age);
if(ages.join(",")!=="12,13,14,15,16,17,18") fail("chapter ages must be 12 through 18");
let opportunities=0;
for(const c of d.chapters){
  if(!c.objective||!c.pressure||!c.choice||!c.consequence) fail(c.id+" missing runnable chapter fields");
  if(!Array.isArray(c.growthBeats)||c.growthBeats.length!==3) fail(c.id+" must have exactly three growth beats");
  for(const b of c.growthBeats){
    opportunities++;
    if(!Number.isInteger(b.dc)||b.dc<5||b.dc>20) fail(b.id+" invalid DC");
    for(const a of ab) if(!b.approaches?.[a]) fail(b.id+" missing "+a+" approach");
    for(const o of ["criticalSuccess","success","failure","criticalFailure"]) if(!b.outcomes?.[o]) fail(b.id+" missing "+o+" outcome");
  }
}
if(opportunities!==21) fail("must contain exactly 21 Development Opportunities");
if(!d.graduation?.["2014"]||!d.graduation?.["2024"]) fail("both edition graduation contracts required");
if(d.graduation?.rawDefault!==true) fail("RAW graduation must be default");
if(d.graduation["2014"].forbidden.join(" ").includes("2014 background")) fail("2014 graduation contract appears corrupted");
if(d.graduation.originLegacy?.bonusFeatDefault!==false||d.graduation.originLegacy?.enabledByDefault!==false) fail("mechanical Origin Legacy must be opt-in, not default");
for(const k of ["abilityArray","proficiencies","heirloom","mentor"]) if(!d.graduation?.rawAudit?.[k]) fail("RAW graduation audit missing "+k);
const page=fs.readFileSync("zero-hero.html","utf8");
const script=fs.readFileSync("zero-hero.js","utf8");
if(!/From Zero to Hero/.test(page)||!/21/.test(page)||!/Level-0-only story rule/.test(page)) fail("public growth sheet lacks rule disclosure");
if(!/oneshot-forge:zero-hero:v1/.test(script)||!/criticalSuccess/.test(script)||!/criticalFailure/.test(script)) fail("growth state/outcomes missing");
if(!/state\.scores\[ability\] >= campaign\.development\.maxPreOriginScore/.test(script)) fail("score cap guard missing");
if(!/const succeeded = total >= dc/.test(script)) fail("developmental checks must resolve normal total-vs-DC first");
if(/if \(roll === 20\) return "criticalSuccess"/.test(script)||/if \(roll === 1\) return "criticalFailure"/.test(script)) fail("natural 20/1 may not automatically override ability-check totals");
if(!/growthAwarded:1/.test(script)) fail("resolved beats must record equal +1 growth");
if(!/baseArrayCost/.test(script)||!/reflectionRemaining/.test(script)||!/canFinishReflection/.test(script)) fail("Final Reflection RAW budget audit is not implemented");
if(!/btn\.disabled = remaining !== 0/.test(script)) fail("edition graduation must stay locked until the 27-point array is complete");

// Exhaustively prove that every legal distribution of 21 growth choices can finish at exactly 27 points.
const pointCost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const raiseCost=score=>pointCost[score+1]-pointCost[score];
function applyCount(count){
  let score=9, partial=0;
  for(let i=0;i<count;i++){
    if(score>=15) return null;
    partial++;
    const need=d.development.costToRaise[String(score)];
    if(partial>=need){ partial-=need; score++; }
  }
  return {score,partial};
}
function canFinish(scores,remaining,memo=new Set()){
  if(remaining===0) return true;
  if(remaining<0) return false;
  const key=scores.join(",")+"|"+remaining;
  if(memo.has(key)) return false;
  memo.add(key);
  for(let i=0;i<scores.length;i++){
    if(scores[i]>=15) continue;
    const delta=raiseCost(scores[i]);
    if(delta>remaining) continue;
    const next=[...scores]; next[i]++;
    if(canFinish(next,remaining-delta,memo)) return true;
  }
  return false;
}
let auditedDistributions=0;
function walk(prefix,left,slots){
  if(slots===1){
    const counts=[...prefix,left];
    if(left>8) return;
    const applied=counts.map(applyCount);
    if(applied.some(x=>!x)) return;
    const scores=applied.map(x=>x.score);
    const spent=scores.reduce((sum,score)=>sum+pointCost[score],0);
    if(spent>27) fail("development distribution exceeds RAW point-buy budget: "+counts.join(","));
    const remaining=27-spent;
    if(!canFinish(scores,remaining)) fail("Final Reflection cannot complete distribution: "+counts.join(","));
    auditedDistributions++;
    return;
  }
  for(let n=0;n<=Math.min(8,left);n++) walk([...prefix,n],left-n,slots-1);
}
walk([],21,6);
if(!auditedDistributions) fail("no development distributions audited");

console.log("From Zero to Hero OK — 7 chapters, 21 equal-growth beats, "+auditedDistributions+" development distributions RAW-budget audited, outcome-neutral progression, edition-isolated graduation.");
