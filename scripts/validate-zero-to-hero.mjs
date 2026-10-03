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
if(dev?.maximumGraduationValue!==30) fail("graduation ceiling must remain 30 point-buy value");
if(!/never exceed/i.test(dev?.statGrowthCapRule||"")||!/30/.test(dev?.statGrowthCapRule||"")) fail("30-point stat-growth cap rule missing");
if(dev?.baseGrowthNeverLost!==true) fail("base development may never be lost");
if(!/stranded/i.test(dev?.maturitySettlementRule||"")||!/Graduation is blocked/i.test(dev?.maturitySettlementRule||"")) fail("maturity settlement / graduation-floor rule missing");
if(dev?.maxPreOriginScore!==15) fail("pre-origin cap must remain 15");
if(dev?.wallet!==true) fail("development wallet must be enabled");
if(dev?.challengeProfile?.roleplayAdvantage!==true) fail("Character Advantage must be enabled");
if(dev?.challengeProfile?.advantageStacks!==false) fail("Character Advantage may not stack");
if(dev?.challengeProfile?.noRoleplayDisadvantage!==true) fail("roleplay may not impose Disadvantage");
if(!Array.isArray(dev?.challengeProfile?.criteria)||dev.challengeProfile.criteria.length<3) fail("Character Advantage criteria missing");
if(dev?.challengeProfile?.dcByAgeBand?.["12-13"]!==15||dev?.challengeProfile?.dcByAgeBand?.["14-16"]!==16||dev?.challengeProfile?.dcByAgeBand?.["17-18"]!==17) fail("hard DC age curve must remain 15/16/17");
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

if(!d.lifeFirstDesign||d.lifeFirstDesign.ordinaryLifeYears?.join(",")!=="12,13,14,15") fail("life-first ordinary years must be ages 12–15");
if(d.continuity?.growthBeatParticipation?.noEarlyClose!==true) fail("shared Growth Beats may not close before every player acts");
if(d.continuity?.growthBeatParticipation?.rotateSpotlight!==true) fail("Growth Beat spotlight order must rotate");
if(d.continuity?.growthBeatParticipation?.supportAllowed!==true) fail("shared Growth Beats must permit fictional support");
if(d.continuity?.yearbook?.requiredAfterEachChapter!==true) fail("Yearbook reflection must be required after each chapter");
if(d.continuity?.yearbook?.grantsDevelopment!==false) fail("Yearbook reflection may never grant Development Points");
if(!Array.isArray(d.continuity?.betweenYears)||d.continuity.betweenYears.length!==6) fail("exactly six between-year interludes required");
if(d.continuity.betweenYears.map(x=>x.afterAge).join(",")!=="12,13,14,15,16,17") fail("between-year interludes must bridge ages 12 through 17");
if(!Array.isArray(d.continuity?.villageTimeline)||d.continuity.villageTimeline.length!==7) fail("village timeline requires one visible change per year");
if(!/whole group/i.test(d.lifeFirstDesign.groupRule||"")) fail("life-first design must explicitly keep the whole group involved");
if(!Array.isArray(d.chapters)||d.chapters.length!==7) fail("must have seven yearly chapters");
if(d.chapters.map(x=>x.age).join(",")!=="12,13,14,15,16,17,18") fail("chapter ages must be 12 through 18");
const expectedLifeEvents={
  12:"community chores",
  13:"village dance",
  14:"fair and competitions",
  15:"work and mentorship",
  16:"first trip away from home",
  17:"community emergency",
  18:"coming-of-age celebration and final crisis"
};
for(const c of d.chapters){
  if(c.lifeEvent!==expectedLifeEvents[c.age]) fail("age "+c.age+" life event drifted from the life-first campaign rhythm");
  if(!c.groupActivity||c.groupActivity.length<40) fail(c.id+" needs a clear whole-group reason to be involved");
}
const earlyText=JSON.stringify(d.chapters.filter(c=>c.age<=15)).toLowerCase();
for(const banned of ["monster attack","raider","kill the","mandatory combat","world-saving"]) if(earlyText.includes(banned)) fail("ages 12–15 drifted away from ordinary village life: "+banned);
let opportunities=0;
for(const c of d.chapters){
  if(!c.objective||!c.pressure||!c.choice||!c.consequence) fail(c.id+" missing runnable chapter fields");
  if(!Array.isArray(c.growthBeats)||c.growthBeats.length!==3) fail(c.id+" must have exactly three growth beats");
  for(const b of c.growthBeats){
    opportunities++;
    if(!Number.isInteger(b.dc)||b.dc<5||b.dc>20) fail(b.id+" invalid DC");
    const floor=c.age<=13?15:c.age<=16?16:17;
    if(b.dc<floor) fail(b.id+" DC "+b.dc+" is below age-"+c.age+" floor "+floor);
    for(const a of ab) if(!b.approaches?.[a]) fail(b.id+" missing "+a+" approach");
    for(const o of Object.keys(expected)) if(!b.outcomes?.[o]) fail(b.id+" missing "+o+" outcome");
  }
}
if(opportunities!==21) fail("must contain exactly 21 base Development Opportunities");

if(!d.graduation?.["2014"]||!d.graduation?.["2024"]) fail("both edition graduation contracts required");
if(d.graduation["2014"].forbidden.join(" ").includes("2014 background")) fail("2014 graduation contract appears corrupted");
for(const k of ["abilityArray","proficiencies","heirloom","mentor","mechanics"]) if(!d.graduation?.rawAudit?.[k]) fail("graduation audit missing "+k);

if(!/development wallet/i.test(page)) fail("public page must explain the development wallet");
if(!/group-resolution-note/.test(page)||!/yearbook-host/.test(page)) fail("public page must expose shared-beat and Yearbook continuity surfaces");
if(!/30-point maximum/i.test(page)) fail("public page must disclose the absolute 30-point maximum");
if(!/How Character Advantage is earned/.test(page)||!/No roleplay Disadvantage/.test(page)) fail("public page must explain fair Character Advantage criteria");
if(!/critical failure can redirect/i.test(page)) fail("public page must disclose critical-failure redirection");
if(!/Heroic \/ house-rule ability generation/.test(script)) fail("graduation must label above-27 arrays as house rule");
if(!/maximumGraduationValue\|\|30/.test(script)) fail("script must read the 30-point ceiling");
if(!/arrayCostForInvested\(next\) <= maximumArrayValue\(\)/.test(script)) fail("Development Point spending must be blocked above 30");
if(!/minimumGraduationValue\|\|27/.test(script)) fail("graduation must read the 27-point floor");
if(!/const ready=value>=floor && value<=ceiling && lessons===0/.test(script)) fail("graduation must enforce the 27–30 range and resolve Lesson Points");
if(!/btn\.disabled=!ready/.test(script)) fail("edition buttons must remain disabled until the floor is secured");
if(!/settleMaturityCredits/.test(script)) fail("Maturity Settlement implementation missing");
if(!/state\.wallet\.flexible\+=reclaimed/.test(script)) fail("stranded earned growth must return to the flexible wallet");
if(!/state\.invested\[ability\]-=partial/.test(script)) fail("partial stranded investment recovery missing");
if(!/version:5/.test(script)) fail("Yearbook continuity state version missing");
if(!/yearbook:\{\}/.test(script)) fail("Yearbook state missing");
if(!/yearbookComplete/.test(script)||!/saveYearbook/.test(script)) fail("Yearbook completion/save logic missing");
if(!/next\.disabled=used!==3 \|\| !yearbookComplete\(chapter\)/.test(script)) fail("age advancement must wait for Yearbook completion");
if(!/type:"yearbook"/.test(script)) fail("Yearbook history entries must be persisted");
if(!/wallet:\{flexible:0,lessons:blankAbilityMap\(0\)\}/.test(script)) fail("wallet state missing");
if(!/state\.wallet\.flexible\+=Number\(rule\.flexible\|\|0\)/.test(script)) fail("flexible award path missing");
if(!/state\.wallet\.lessons\[lessonAbility\]\+=Number\(rule\.lesson\)/.test(script)) fail("Lesson Point award path missing");
if(!/lessonAbility===attemptedAbility/.test(script)) fail("lesson ability must be prevented from matching attempted ability");
if(!/state\.invested\[attemptedAbility\]-=1/.test(script)||!/state\.invested\[lessonAbility\]\+=1/.test(script)) fail("critical-failure invested-point redirect missing");
if(!/state\.scores\[ability\] >= campaign\.development\.maxPreOriginScore/.test(script)) fail("ability score cap guard missing");
if(!/const succeeded=total>=dc/.test(script)) fail("checks must resolve normal total-vs-DC first");
if(!/Math\.max\(roll1,roll2\)/.test(script)) fail("Advantage must use the higher of two d20s");
if(!/advantageReason/.test(script)||!/Character Advantage earned/.test(script)) fail("Advantage reason capture missing");
if(!/Advantage requires two d20 results/.test(script)) fail("Advantage must require two d20 inputs");
if(!/Record the specific character or scene reason/.test(script)) fail("Advantage must require a fiction-grounded reason");
if(/disadvantage/i.test(script)) fail("Zero-to-Hero script must not introduce roleplay Disadvantage");
if(/finalReflection|reflectionRemaining|canFinishReflection/.test(script)) fail("superseded Final Reflection logic must not remain");
if(!/criticalBonusEarned\+=1/.test(script)) fail("critical-success bonus tracking missing");
if(!/27-point minimum · 30-point maximum/.test(script)) fail("graduation summary must state the locked 27–30 range");

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
if(dev.maximumGraduationValue-dev.minimumGraduationValue!==3) fail("Zero-to-Hero heroic headroom must remain exactly 3 point-buy value");

console.log("From Zero to Hero OK — life-first village arc, shared per-player Growth Beats, Yearbook continuity, 27–30 point range, Character Advantage, differentiated outcomes, edition-isolated graduation.");
