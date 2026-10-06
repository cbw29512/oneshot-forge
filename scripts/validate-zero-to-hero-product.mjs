import fs from "node:fs";

const fail=m=>{console.error("Zero-to-Hero product validation failed:",m);process.exit(1);};
const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);

const requiredFiles=[
  "zero-hero-kit.html","zero-hero-kit.css",
  "zero-hero-adventure.html","zero-hero-adventure.js","zero-hero-adventure.css",
  "zero-hero-module.html","zero-hero-module.js","zero-hero-module.css",
  "zero-hero.html","zero-hero.js","zero-hero.css",
  "zero-hero-starters.html","zero-hero-starters.js","zero-hero-starters.css",
  "zero-hero-journal.html","zero-hero-journal.js","zero-hero-journal.css",
  "zero-hero-awards.html","zero-hero-awards.js","zero-hero-awards.css",
  "zero-hero-npcs.html","zero-hero-npcs.js","zero-hero-npcs.css",
  "zero-hero-rules.html","zero-hero-rules.css",
  "assets/zero-hero/hearthcross-player-map.svg",
  "assets/zero-hero/hearthcross-dm-map.svg",
  "data/zero-to-hero/hearthcross-starters.json",
  "data/zero-to-hero/hearthcross-years.adventure.json",
  "data/zero-to-hero/from-zero-to-hero.json",
  "docs/ZERO_TO_HERO_PRODUCT_MANIFEST.md"
];
for(const p of requiredFiles) if(!exists(p)) fail("missing boxed-set file: "+p);

const kit=read("zero-hero-kit.html");
for(const href of [
  "zero-hero-adventure.html","zero-hero-module.html","zero-hero-starters.html",
  "zero-hero.html","zero-hero-journal.html","zero-hero-awards.html","zero-hero-npcs.html",
  "zero-hero-rules.html","assets/zero-hero/hearthcross-player-map.svg","assets/zero-hero/hearthcross-dm-map.svg"
]) if(!kit.includes('href="'+href+'"')&&!kit.includes('href="'+href+'"')) fail("Start Here missing link: "+href);
for(const phrase of ["10-MINUTE FIRST-SESSION SETUP","PRINT CHECKLIST","THE RULES IN ONE MINUTE"]) if(!kit.includes(phrase)) fail("Start Here missing buyer guidance: "+phrase);

const starters=JSON.parse(read("data/zero-to-hero/hearthcross-starters.json"));
if(starters.characters?.length!==6) fail("starter pack must contain exactly six Level-0 children");
if(starters.defaultParty?.length!==4) fail("starter pack must mark exactly four default characters");
if(starters.alternates?.length!==2) fail("starter pack must provide two 5th/6th alternates");
for(const id of ["tod-hale","merlon-quill","halley-brindle","mira-alder","fen-bell","lark-cask"]) if(!starters.characters.find(c=>c.id===id)) fail("starter missing: "+id);
for(const pc of starters.characters){
  for(const a of ["STR","DEX","CON","INT","WIS","CHA"]) if(pc.scores?.[a]!==9) fail(pc.id+" must start "+a+" at 9");
  if(pc.favored?.length!==2||pc.neutral?.length!==2||pc.challenging?.length!==2) fail(pc.id+" must use 2/2/2 upbringing");
  const all=[...pc.favored,...pc.neutral,...pc.challenging];
  if(new Set(all).size!==6) fail(pc.id+" upbringing must partition all six abilities");
  if(!pc.raceSpecies||!pc.upbringingProfile) fail(pc.id+" missing fixed race/species or upbringing");
}

const starterPage=read("zero-hero-starters.js");
if(!/CLASS/.test(read("zero-hero-starters.html"))&&!/NOT CHOSEN YET/.test(starterPage)) fail("starter sheets must make class unchosen obvious");
if(!/Rules edition:/.test(starterPage)||!/2014/.test(starterPage)||!/2024/.test(starterPage)) fail("starter sheets must expose edition lock");

const journal=read("zero-hero-journal.js");
for(const age of [12,13,14,15,16,17,18]) if(!journal.includes("age:"+age)) fail("journal missing age "+age);
for(const title of ["Spring Chore Day","Spring Dance","Harvest Fair & Team Games","Apprentice Week","Road to Bellmere","The Long Storm","The Last Spring Dance"]) if(!journal.includes(title)) fail("journal missing chapter "+title);
if((journal.match(/milestone-slot/g)||[]).length<1||!journal.includes("milestone(y.age,1)")||!journal.includes("milestone(y.age,3)")) fail("journal must provide three milestone slots per year");

const playerMap=read("assets/zero-hero/hearthcross-player-map.svg");
const dmMap=read("assets/zero-hero/hearthcross-dm-map.svg");
for(const place of ["Common Green","Watchstone","Crossmarket","Quill House","Cask &amp; Anvil","Venn's Remedies","Fox &amp; Ferry","Alderwood","Hearth River","Bellmere Road"]) {
  if(!playerMap.includes(place)) fail("player map missing location "+place);
}
for(const secret of ["NORTH ARM","EAST ARM","SOUTH ARM","smuggler cut","Clue year marker"]) if(!dmMap.includes(secret)) fail("DM map missing secret overlay "+secret);
for(const forbidden of ["NORTH ARM","EAST ARM","SOUTH ARM","smuggler cut","Clue year marker"]) if(playerMap.includes(forbidden)) fail("player map leaks DM secret: "+forbidden);

const awards=read("zero-hero-awards.js");
if(!/Array\.from\(\{length:6\}/.test(awards)) fail("award deck must render six placements per competition");
if(!/no extra DP/i.test(read("zero-hero-awards.html"))) fail("award page must disclose no extra DP");
if(!/2\.5in/.test(read("zero-hero-awards.css"))||!/3\.5in/.test(read("zero-hero-awards.css"))) fail("award cards must remain 2.5x3.5");

const rules=read("zero-hero-rules.html");
for(const phrase of ["STR 9","2 Favored","Character Advantage","27 point-buy value","Absolute Level-0 ceiling","Competition placement","Homebrew stops at graduation"]) if(!rules.includes(phrase)) fail("quick rules missing: "+phrase);

const npcs=read("zero-hero-npcs.js");
for(const field of ["appearance","voice","wants","fears","secret","teaches","provides","change"]) if(!npcs.includes("n."+field)) fail("NPC deck missing field "+field);

const module=read("zero-hero-module.js");
for(const phrase of ["DM Truth","Clue ladder","Legal finales","Default 4-player jobs","MOVE ON WHEN"]) if(!module.includes(phrase)) fail("full module missing renderer surface: "+phrase);
if(!module.includes("hearthcross-player-map.svg")||!module.includes("hearthcross-dm-map.svg")) fail("full module must link both maps");

const core=JSON.parse(read("data/zero-to-hero/from-zero-to-hero.json"));
if(core.preClassShell?.enabled!==true||core.preClassShell?.lockRequiredBeforeFirstGrowthBeat!==true) fail("product must include immutable pre-class shell");
if(core.preClassShell?.rawPlaceholders?.length<12) fail("pre-class shell must visibly reserve RAW slots");

const adv=JSON.parse(read("data/zero-to-hero/hearthcross-years.adventure.json"));
if(adv.chapters?.length!==7) fail("boxed adventure must have seven chapters");
if(adv.chapters.reduce((n,c)=>n+c.beats.length,0)!==21) fail("boxed adventure must have 21 Growth Beats");
if(!adv.campaignMystery?.dmTruth||adv.campaignMystery.clueLadder?.length!==7||adv.campaignMystery.finaleOptions?.length<3) fail("campaign mystery must include truth, seven-year clue ladder, and at least three finales");
for(const ch of adv.chapters) for(const beat of ch.beats){
  if(!beat.location||beat.location.length<60) fail(ch.id+"/"+beat.growthBeatId+" needs table-ready location description");
  if(!Array.isArray(beat.fourPlayerJobs)||beat.fourPlayerJobs.length!==4) fail(ch.id+"/"+beat.growthBeatId+" must provide four default player jobs");
  if(typeof beat.threePlayerAdjustment!=="string"||!beat.threePlayerAdjustment.startsWith("Three players")) fail(ch.id+"/"+beat.growthBeatId+" must say how to run with three players");
  if(!Array.isArray(beat.npcDialogue)||beat.npcDialogue.length<1) fail(ch.id+"/"+beat.growthBeatId+" needs ready NPC dialogue");
  if(!beat.advanceWhen||beat.advanceWhen.length<30) fail(ch.id+"/"+beat.growthBeatId+" needs exact move-on condition");
}

const manifest=read("docs/ZERO_TO_HERO_PRODUCT_MANIFEST.md");
for(const section of ["DM packet","Player packet","Maps","Scrapbook and award kit","Journal","Graduation kit","Buyer-experience release test"]) if(!manifest.includes(section)) fail("product manifest missing "+section);

console.log("Zero to Hero boxed product OK — Start Here, full DM module + runner, six Level-0 starters, journal, player/DM maps, award deck, NPC reference, quick rules, scrapbook/graduation surfaces, seven-year adventure.");
