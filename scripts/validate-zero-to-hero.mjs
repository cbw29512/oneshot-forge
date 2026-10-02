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
for(const s of [9,10,11,12,13,14]) if(!d.development?.costToRaise?.[String(s)]) fail("missing cost for score "+s);
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
if(d.graduation["2014"].forbidden.join(" ").includes("2014 background")) fail("2014 graduation contract appears corrupted");
if(d.graduation.originLegacy?.bonusFeatDefault!==false) fail("bonus feat must not be default");
const page=fs.readFileSync("zero-hero.html","utf8");
const script=fs.readFileSync("zero-hero.js","utf8");
if(!/From Zero to Hero/.test(page)||!/21/.test(page)||!/Level-0-only rule/.test(page)) fail("public growth sheet lacks rule disclosure");
if(!/oneshot-forge:zero-hero:v1/.test(script)||!/criticalSuccess/.test(script)||!/criticalFailure/.test(script)) fail("growth state/outcomes missing");
if(!/state\.scores\[ability\] >= campaign\.development\.maxPreOriginScore/.test(script)) fail("score cap guard missing");
console.log("From Zero to Hero OK — 7 chapters, 21 growth beats, village cast, critical outcomes, edition-isolated graduation.");
