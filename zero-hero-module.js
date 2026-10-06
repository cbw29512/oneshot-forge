(() => {
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const AB=["STR","DEX","CON","INT","WIS","CHA"];
function list(xs){return '<ul>'+((xs||[]).map(x=>'<li>'+esc(x)+'</li>').join(""))+'</ul>';}
function scene(ch,b,src,index){
 return '<section class="module-scene">'+
  '<header><p>GROWTH BEAT '+(index+1)+' OF 3 · '+b.minutes+' MIN</p><h3>'+esc(b.title)+'</h3><span>DC '+esc(src.dc)+'</span></header>'+
  '<p class="purpose"><b>Purpose:</b> '+esc(b.purpose)+'</p>'+
  '<div class="location"><b>Location:</b> '+esc(b.location||"")+'</div>'+
  '<div class="readaloud"><b>READ ALOUD</b><blockquote>'+esc(b.readAloud)+'</blockquote></div>'+
  '<div class="module-two"><section><h4>Run this beat</h4>'+list(b.runSteps)+'</section><section><h4>Default 4-player jobs</h4>'+list(b.fourPlayerJobs)+(b.threePlayerAdjustment?'<p><em>'+esc(b.threePlayerAdjustment)+'</em></p>':'')+'</section></div>'+
  '<section class="npc-block"><h4>NPC voices</h4>'+((b.npcDialogue||[]).map(n=>'<article><b>'+esc(n.npc)+'</b> <i>'+esc(n.voice||"")+'</i>'+list((n.lines||[]).map(x=>'“'+x+'”'))+'</article>').join("")||'<p>No featured dialogue.</p>')+'</section>'+
  '<section class="check-block"><div><h4>Development Check</h4><p>'+esc(src.prompt)+'</p></div><strong>DC '+esc(src.dc)+'</strong>'+
   '<div class="approaches">'+AB.map(a=>'<p><b>'+a+'</b> '+esc(src.approaches[a])+'</p>').join("")+'</div>'+
   '<div class="outcomes"><p><b>Critical success:</b> '+esc(src.outcomes.criticalSuccess)+'</p><p><b>Success:</b> '+esc(src.outcomes.success)+'</p><p><b>Failure:</b> '+esc(src.outcomes.failure)+'</p><p><b>Critical failure:</b> '+esc(src.outcomes.criticalFailure)+'</p></div>'+
  '</section>'+
  '<div class="module-two dm-secret"><section><h4>Hidden clue</h4>'+list(b.mysteryClues)+'</section><section><h4>Branches / consequences</h4>'+list(b.branches)+'</section></div>'+
  '<section class="scrap"><h4>Scrapbook</h4><p>'+esc(b.scrapbookPrompt)+'</p><p><b>Carry forward:</b> '+esc(b.consequence)+'</p></section>'+
  '<p class="advance"><b>MOVE ON WHEN:</b> '+esc(b.advanceWhen||"Every player has acted and the scene is resolved.")+'</p>'+
 '</section>';
}
function chapter(ch,coreCh,idx){
 return '<article class="module-chapter">'+
 '<header class="chapter-cover"><p>CHAPTER '+(idx+1)+' OF 7 · AGE '+ch.age+'</p><h2>'+esc(ch.title)+'</h2><strong>'+esc(ch.chapterArc||ch.sessionGoal)+'</strong></header>'+
 '<p class="chapter-goal">'+esc(ch.sessionGoal)+'</p>'+
 '<div class="readaloud opening"><b>OPENING READ ALOUD</b><blockquote>'+esc(ch.openingReadAloud)+'</blockquote></div>'+
 '<section><h3>Before you begin</h3>'+list(ch.dmOpening)+'</section>'+
 ch.beats.map((b,i)=>scene(ch,b,coreCh.growthBeats.find(x=>x.id===b.growthBeatId),i)).join("")+
 '<section class="year-close"><h3>Close the year</h3><blockquote>'+esc(ch.closeReadAloud)+'</blockquote><p><b>Yearbook focus:</b> '+esc(ch.yearbookFocus)+'</p></section>'+
 '</article>';
}
async function init(){
 const [ar,cr]=await Promise.all([fetch("data/zero-to-hero/hearthcross-years.adventure.json",{cache:"no-store"}),fetch("data/zero-to-hero/from-zero-to-hero.json",{cache:"no-store"})]);
 if(!ar.ok||!cr.ok)throw new Error("Module data could not load.");
 const a=await ar.json(),core=await cr.json();
 const mystery=a.campaignMystery;
 const cover='<section class="module-cover"><p>ONE-SHOT FORGE · LEVEL-0 ORIGIN CAMPAIGN</p><h1>'+esc(a.metadata.title)+'</h1><h2>Full DM Module</h2><p>'+esc(a.premise.playerPitch)+'</p><div><span>4 players default</span><span>4–6 supported</span><span>7 chapters</span><span>Ages 12–18</span></div><p class="module-note">Use the Player Growth Sheet for the development wallet and scrapbook ledger. This module supplies the story, scenes, clues, NPCs, branches, and table procedure.</p></section>';
 const quick='<section class="module-reference"><h2>DM Quick Start</h2><div class="module-two"><section><h3>Core rule</h3><p>'+esc(a.tableContract.spotlightRule)+'</p>'+list(a.tableContract.fourPlayerProcedure)+'</section><section><h3>Failure</h3><p>'+esc(a.premise.failureRule)+'</p><p><b>5 players:</b> '+esc(a.tableContract.scaling["5"])+'</p><p><b>6 players:</b> '+esc(a.tableContract.scaling["6"])+'</p></section></div><h3>Hearthcross Six</h3><div class="six-table">'+a.hearthcrossSix.contests.map(c=>'<span><b>'+c.ability+'</b> '+esc(c.name)+'</span>').join("")+'</div></section>';
 const truth='<section class="module-reference dm-truth"><h2>DM Truth: '+esc(mystery.name)+'</h2><p>'+esc(mystery.dmTruth)+'</p><p><b>Theme:</b> '+esc(mystery.theme)+'</p><p><b>No-villain rule:</b> '+esc(mystery.noVillainRule)+'</p><h3>Clue ladder</h3>'+mystery.clueLadder.map(c=>'<article><b>Age '+c.age+'</b><p>'+esc(c.clue)+'</p><small><b>Meaning then:</b> '+esc(c.meaningNow)+'<br><b>Meaning later:</b> '+esc(c.meaningLater)+'</small></article>').join("")+'<h3>Legal finales</h3>'+mystery.finaleOptions.map(x=>'<article><b>'+esc(x.name)+'</b><p>'+esc(x.requirements)+'</p><p><b>Cost:</b> '+esc(x.cost)+'</p><p><b>Future:</b> '+esc(x.future)+'</p></article>').join("")+'</section>';
 const maps='<section class="module-reference"><h2>Maps</h2><p>Print the Player Map for the table and keep the DM map hidden.</p><div class="map-links"><a href="assets/zero-hero/hearthcross-player-map.svg">Hearthcross Player Map</a><a href="assets/zero-hero/hearthcross-dm-map.svg">Hearthcross DM Map</a></div></section>';
 document.getElementById("module-host").innerHTML=cover+quick+truth+maps+a.chapters.map((ch,i)=>chapter(ch,core.chapters.find(c=>c.id===ch.id),i)).join("")+'<section class="module-reference"><h2>End-of-campaign audit</h2>'+list(a.gmAuditChecklist)+'</section>';
 document.getElementById("print-module").onclick=()=>window.print();
}
init().catch(e=>document.getElementById("module-host").innerHTML='<p>'+esc(e.message)+'</p>');
})();