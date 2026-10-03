import fs from "node:fs";

const d=JSON.parse(fs.readFileSync("data/zero-to-hero/from-zero-to-hero.json","utf8"));
const page=fs.readFileSync("zero-hero.html","utf8");
const script=fs.readFileSync("zero-hero.js","utf8");
const fail=m=>{console.error("Zero-to-Hero validation failed:",m);process.exit(1);};
const ab=["STR","DEX","CON","INT","WIS","CHA"];

if(d.id!=="from-zero-to-hero") fail("wrong id");
if(d.rules?.mode!=="level-0-house-rule"||d.rules?.criticalChecksHouseRule!==true||d.rules?.editionIsolation!==true) fail("Level-0 isolation flags missing");
if(d.rules?.naturalExtremesNeverOverrideTotal!==true) fail("normal total-vs-DC resolution must stay authoritative");

if(d.start?.age!==12||d.start?.className!=="Level 0") fail("must start age 12 at Level 0");
for(const a of ab) if(d.start?.scores?.[a]!==9) fail(a+" must start at 9");

const dev=d.development;
if(dev?.startingPointBuyCost!==6) fail("six starting 9s must carry point-buy value 6");
if(dev?.baseOpportunities!==21) fail("must have 21 base Development Opportunities");
if(dev?.normalTargetValue!==27) fail("normal target must remain 27 point-buy value");
if(dev?.minimumGraduationValue!==27) fail("graduation floor must remain 27 point-buy value");
if(dev?.baseGrowthNeverLost!==true) fail("base development may never be lost");
if(!/stranded/i.test(dev?.maturitySettlementRule||"")||!/Graduation is blocked/i.test(dev?.maturitySettlementRule||"")) fail("maturity settlement / graduation-floor rule missing");
if(dev?.maxPreOriginScore!==15) fail("pre-origin cap must remain 15");
if(dev?.wallet!==true) fail("development wallet must be enabled");
for(const s of [9,10,11,12,13,14]) if(!dev?.costToRaise?.[String(s)]) fail("missing raise cost for "+s);

const expected={
  criticalSuccess:{flexible:2,lesson:0,shiftInvested:0},
  success:{flexible:1,lesson:0,shiftInvested:0},
  failure:{flexible:0,lesson:1,shiftInvested:0},
  criticalFailure:{flexible:0,lesson:1,shiftInvested:1}
};
for(const [outcome,want] of Object.entries(expected)){
  const got=dev?.pointsByOutcome?.[outcome];
  if(!got) fail("missing wallet result for "+outcome);
  for(const k of ["flexible","lesson","shiftInvested"]) if(got[k]!==want[k]) fail(outcome+" "+k+" must be "+want[k]);
}
if(!/different from the attempted ability/i.test(dev?.lessonRule||"")) fail("lesson rule must require an off-path ability");
if(!/move one already-invested/i.test(dev?.criticalFailureRule||"")) fail("critical-failure redirection rule missing");
if(!/extra flexible Development Point/i.test(dev?.criticalSuccessBonusRule||"")) fail("critical-success bonus rule missing");

if(!Array.isArray(d.village?.npcs)||d.village.npcs.length<12) fail("village requires at least 12 recurring NPCs");
for(const n of d.village.npcs){
  for(const k of ["id","name","role","appearance","voice","wants","fears","secret","teaches","provides","change"]){
    if(!n[k]||(Array.isArray(n[k])&&!n[k].length)) fail("NPC "+(n.id||"?")+" missing "+k);
  }
}

if(!Array.isArray(d.chapters)||d.chapters.length!==7) fail("must have seven yearly chapters");
if(d.chapters.map(x=>x.age).join(",")!=="12,13,14,15,16,17,18") fail("chapter ages must be 12 through 18");
let opportunities=0;
for(const c of d.chapters){
  if(!c.objective||!c.pressure||!c.choice||!c.consequence) fail(c.id+" missing runnable chapter fields");
  if(!Array.isArray(c.growthBeats)||c.growthBeats.length!==3) fail(c.id+" must have exactly three growth beats");
  for(const b of c.growthBeats){
    opportunities++;
    if(!Number.isInteger(b.dc)||b.dc<5||b.dc>20) fail(b.id+" invalid DC");
    for(const a of ab) if(!b.approaches?.[a]) fail(b.id+" missing "+a+" approach");
    for(const o of Object.keys(expected)) if(!b.outcomes?.[o]) fail(b.id+" missing "+o+" outcome");
  }
}
if(opportunities!==21) fail("must contain exactly 21 base Development Opportunities");

if(!d.graduation?.["2014"]||!d.graduation?.["2024"]) fail("both edition graduation contracts required");
if(d.graduation["2014"].forbidden.join(" ").includes("2014 background")) fail("2014 graduation contract appears corrupted");
for(const k of ["abilityArray","proficiencies","heirloom","mentor","mechanics"]) if(!d.graduation?.rawAudit?.[k]) fail("graduation audit missing "+k);

if(!/development wallet/i.test(page)) fail("public page must explain the development wallet");
if(!/critical failure can redirect/i.test(page)) fail("public page must disclose critical-failure redirection");
if(!/Heroic \/ house-rule ability generation/.test(script)) fail("graduation must label above-27 arrays as house rule");
if(!/minimumGraduationValue\|\|27/.test(script)) fail("graduation must read the 27-point floor");
if(!/const ready=value>=floor && lessons===0/.test(script)) fail("graduation must be blocked below the floor or with unresolved Lesson Points");
if(!/btn\.disabled=!ready/.test(script)) fail("edition buttons must remain disabled until the floor is secured");
if(!/settleMaturityCredits/.test(script)) fail("Maturity Settlement implementation missing");
if(!/state\.wallet\.flexible\+=reclaimed/.test(script)) fail("stranded earned growth must return to the flexible wallet");
if(!/state\.invested\[ability\]-=partial/.test(script)) fail("partial stranded investment recovery missing");
if(!/version:3/.test(script)) fail("wallet state version missing");
if(!/wallet:\{flexible:0,lessons:blankAbilityMap\(0\)\}/.test(script)) fail("wallet state missing");
if(!/state\.wallet\.flexible\+=Number\(rule\.flexible\|\|0\)/.test(script)) fail("flexible award path missing");
if(!/state\.wallet\.lessons\[lessonAbility\]\+=Number\(rule\.lesson\)/.test(script)) fail("Lesson Point award path missing");
if(!/lessonAbility===attemptedAbility/.test(script)) fail("lesson ability must be prevented from matching attempted ability");
if(!/state\.invested\[attemptedAbility\]-=1/.test(script)||!/state\.invested\[lessonAbility\]\+=1/.test(script)) fail("critical-failure invested-point redirect missing");
if(!/state\.scores\[ability\] < campaign\.development\.maxPreOriginScore/.test(script)) fail("ability cap guard missing");
if(!/const succeeded=total>=dc/.test(script)) fail("checks must resolve normal total-vs-DC first");
if(/finalReflection|reflectionRemaining|canFinishReflection/.test(script)) fail("superseded Final Reflection logic must not remain");
if(!/criticalBonusEarned\+=1/.test(script)) fail("critical-success bonus tracking missing");
if(!/27-point minimum guaranteed/.test(script)) fail("graduation summary must state the minimum guarantee");

// Prove the point-buy curve used by the wallet remains aligned with the 5E 8–15 table.
const pointCost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const raise={9:1,10:1,11:1,12:1,13:2,14:2};
for(const score of Object.keys(raise).map(Number)){
  if(pointCost[score+1]-pointCost[score]!==dev.costToRaise[String(score)]) fail("wallet raise cost drift at "+score);
}

// Baseline conservation proof: every non-critical-success result still contributes one base point,
 // critical success contributes that same base point plus one bonus, and critical-failure redirection is 1-for-1.
 const baseFromOutcomes=[
   expected.success.flexible+expected.success.lesson,
   expected.failure.flexible+expected.failure.lesson,
   expected.criticalFailure.flexible+expected.criticalFailure.lesson
 ];
 if(baseFromOutcomes.some(x=>x!==1)) fail("success/failure/critical-failure must each preserve one baseline Development Point");
 if(expected.criticalSuccess.flexible+expected.criticalSuccess.lesson!==2) fail("critical success must be one baseline point plus one bonus");
 if(dev.startingPointBuyCost+dev.baseOpportunities!==dev.minimumGraduationValue) fail("6 starting value + 21 base growth must equal the 27-point floor");

console.log("From Zero to Hero OK — 27-point minimum guaranteed, differentiated outcomes conserved, hard-lesson redirection, critical bonuses, edition-isolated graduation.");
