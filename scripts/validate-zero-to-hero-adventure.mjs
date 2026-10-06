import fs from "node:fs";

const adventure=JSON.parse(fs.readFileSync("data/zero-to-hero/hearthcross-years.adventure.json","utf8"));
const core=JSON.parse(fs.readFileSync("data/zero-to-hero/from-zero-to-hero.json","utf8"));
const page=fs.readFileSync("zero-hero-adventure.html","utf8");
const script=fs.readFileSync("zero-hero-adventure.js","utf8");
const playerPage=fs.readFileSync("zero-hero.html","utf8");
const fullAudit=fs.readFileSync("docs/ZERO_TO_HERO_FULL_AUDIT.md","utf8");

const fail=m=>{console.error("Zero-to-Hero adventure validation failed:",m);process.exit(1);};
const abilities=["STR","DEX","CON","INT","WIS","CHA"];

if(adventure.metadata?.id!=="from-zero-to-hero-hearthcross-years") fail("wrong adventure id");
if(adventure.metadata?.defaultPartySize!==4) fail("default party must remain four players");
if(adventure.metadata?.partySizeRange!=="3–6 players") fail("supported party range must be 3–6");
if(adventure.tableContract?.supportedPlayers?.join(",")!=="3,4,5,6") fail("table contract must support 3/4/5/6 players");
if(!adventure.tableContract?.scaling?.["3"]||!Array.isArray(adventure.tableContract?.threePlayerProcedure)) fail("table contract must explain 3-player play");
if(!/every player gets one distinct Development Check/i.test(adventure.tableContract?.spotlightRule||"")) fail("shared spotlight contract missing");

if(!Array.isArray(adventure.chapters)||adventure.chapters.length!==7) fail("adventure must have seven yearly chapters");
if(adventure.chapters.map(c=>c.age).join(",")!=="12,13,14,15,16,17,18") fail("adventure ages must run 12–18");

let totalBeats=0;
const seen=new Set();
for(const chapter of adventure.chapters){
  if(!Array.isArray(chapter.beats)||chapter.beats.length!==3) fail(chapter.id+" must have exactly three runnable beats");
  if(!chapter.openingReadAloud||chapter.openingReadAloud.length<80) fail(chapter.id+" needs usable opening read-aloud");
  if(!Array.isArray(chapter.dmOpening)||chapter.dmOpening.length<2) fail(chapter.id+" needs opening run steps");
  if(!chapter.closeReadAloud||!chapter.yearbookFocus) fail(chapter.id+" missing year close / Yearbook focus");

  const sourceChapter=core.chapters.find(c=>c.id===chapter.id);
  if(!sourceChapter) fail(chapter.id+" has no matching core chapter");

  for(const beat of chapter.beats){
    totalBeats++;
    const key=chapter.id+":"+beat.growthBeatId;
    if(seen.has(key)) fail("duplicate Growth Beat reference "+key);
    seen.add(key);

    const source=sourceChapter.growthBeats.find(b=>b.id===beat.growthBeatId);
    if(!source) fail(key+" does not resolve to a core Growth Beat");
    if(!beat.readAloud||beat.readAloud.length<70) fail(key+" read-aloud too thin");
    if(!Array.isArray(beat.runSteps)||beat.runSteps.length<3) fail(key+" needs at least three run steps");
    if(!beat.purpose||!beat.consequence||!beat.scrapbookPrompt) fail(key+" missing purpose/consequence/scrapbook prompt");
  }
}
if(totalBeats!==21) fail("adventure must contain exactly 21 runnable Growth Beats");
if(seen.size!==21) fail("all 21 Growth Beat references must be unique");

const coreBeatCount=core.chapters.reduce((n,c)=>n+c.growthBeats.length,0);
if(coreBeatCount!==21) fail("core system no longer has 21 Growth Beats");
if([...seen].some(key=>{
  const [chapterId,beatId]=key.split(":");
  return !core.chapters.find(c=>c.id===chapterId)?.growthBeats.find(b=>b.id===beatId);
})) fail("adventure references unknown growth content");

const six=adventure.hearthcrossSix;
if(!six||six.contests?.length!==6) fail("Hearthcross Six must contain exactly six core contests");
const sixAbilities=six.contests.map(c=>c.ability);
if(sixAbilities.slice().sort().join(",")!==abilities.slice().sort().join(",")) fail("Hearthcross Six must contain exactly one contest per ability");
if(new Set(six.contests.map(c=>c.id)).size!==6) fail("Hearthcross Six contest ids must be unique");

const coreCompetitions=core.scrapbook?.competitions?.filter(c=>c.developmentCore);
if(coreCompetitions?.length!==6) fail("core scrapbook must mark exactly six fairness-core contests");
const coreAbilities=coreCompetitions.map(c=>c.primaryAbility);
if(coreAbilities.slice().sort().join(",")!==abilities.slice().sort().join(",")) fail("core scrapbook fairness slate must be one contest per ability");

for(const contest of six.contests){
  const source=coreCompetitions.find(c=>c.id===contest.id);
  if(!source) fail("Hearthcross Six contest missing from core scrapbook: "+contest.id);
  if(source.primaryAbility!==contest.ability) fail(contest.id+" ability drift between adventure and core");
  if(source.allowedAbilities?.length!==1||source.allowedAbilities[0]!==contest.ability) fail(contest.id+" must use one primary ability for comparable placement");
}

for(const profile of core.upbringingLeans.profiles){
  const favored=six.contests.filter(c=>profile.advantage.includes(c.ability)).length;
  const neutral=six.contests.filter(c=>profile.neutral.includes(c.ability)).length;
  const challenging=six.contests.filter(c=>profile.disadvantage.includes(c.ability)).length;
  if(favored!==2||neutral!==2||challenging!==2) fail(profile.id+" does not receive exactly 2 Favored / 2 Neutral / 2 Challenging Hearthcross Six contests");
}

if(!/Growth Sheet/.test(page)||!/party-size/.test(page)||!/chapter-list/.test(page)||!/scene-card/.test(page)) fail("DM runner missing core UI");
if(!/zero-hero\.html/.test(page)) fail("DM runner must link to player Growth Sheet");
if(!/zero-hero-adventure\.html/.test(playerPage)) fail("player sheet must link back to DM adventure");
if(!/absoluteBeatIndex/.test(script)||!/spotlightOrder/.test(script)) fail("DM runner must calculate 21-beat progress and rotating spotlight");
if(!/state\.partySize/.test(script)||!/\[3,4,5,6\]/.test(script)) fail("DM runner must persist supported party size");
if(!/coreBeat\(chapter\.id, beat\.growthBeatId\)/.test(script)) fail("DM runner must bind each scene to authoritative core Growth Beat data");

const finalChapter=adventure.chapters.at(-1);
if(finalChapter.id!=="age-18-last-spring-dance") fail("final chapter drifted");
if(finalChapter.beats.at(-1)?.growthBeatId!=="last-dance-3") fail("Watchstone crisis must remain the final Growth Beat");
if(!/Watchstone/i.test(finalChapter.beats.at(-1)?.title||"")||!/not a monster fight by default/i.test(finalChapter.dmOpening?.join(" ")||"")) fail("finale must remain a community crisis rather than default boss fight");

const early=JSON.stringify(adventure.chapters.filter(c=>c.age<=15)).toLowerCase();
for(const banned of ["mandatory combat","kill the monster","lethal fight"]) if(early.includes(banned)) fail("ages 12–15 drifted toward lethal adventure stakes: "+banned);

if(!/Prior issue: fixed in this pass/.test(fullAudit)||!/Hearthcross Six/.test(fullAudit)||!/certified Level-1/.test(fullAudit)) fail("full audit must document fixed fairness issue and remaining Level-1 blocker");

console.log("Zero to Hero adventure OK — 4-player default, 3–6 scaling, 7 years, 21 bound Growth Beats, balanced Hearthcross Six, real DM runner, Watchstone finale.");
