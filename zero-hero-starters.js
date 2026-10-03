(() => {
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const AB=["STR","DEX","CON","INT","WIS","CHA"];
let pack;

function card(pc,index){
  const defaultParty=pack.defaultParty.includes(pc.id);
  return '<article class="starter-sheet" id="'+esc(pc.id)+'">'+
    '<header class="starter-head">'+
      '<div><p class="starter-kicker">FROM ZERO TO HERO · LEVEL 0'+(defaultParty?' · DEFAULT FOUR':' · OPTIONAL 5TH/6TH')+'</p>'+
      '<h2>'+esc(pc.name)+'</h2><p>'+esc(pc.raceSpecies)+' · Age '+pc.age+' · Hearthcross</p></div>'+
      '<div class="class-blank"><small>CLASS</small><strong>NOT CHOSEN YET</strong></div>'+
    '</header>'+
    '<p class="tagline">'+esc(pc.tagline)+'</p>'+
    '<section class="scores">'+AB.map(a=>'<div><span>'+a+'</span><strong>'+pc.scores[a]+'</strong><small>-1</small></div>').join("")+'</section>'+
    '<section class="upbringing"><h3>'+esc(title(pc.upbringingProfile))+'-shaped upbringing</h3>'+
      '<div class="lanes"><span class="fav">Favored · Advantage<br><b>'+esc(pc.favored.join(" · "))+'</b></span>'+
      '<span>Neutral<br><b>'+esc(pc.neutral.join(" · "))+'</b></span>'+
      '<span class="chal">Challenging · Disadvantage<br><b>'+esc(pc.challenging.join(" · "))+'</b></span></div>'+
      '<p>Upbringing changes Level-0 check odds only. It does not force a future class.</p></section>'+
    '<div class="starter-columns">'+
      '<section><h3>Home & childhood</h3><p><b>Family:</b> '+esc(pc.family)+'</p><p><b>Chores:</b> '+esc(pc.chores)+'</p><p><b>Possessions:</b> '+esc(pc.possessions)+'</p></section>'+
      '<section><h3>Who I might become</h3><p><b>Aspiration:</b> '+esc(pc.aspiration)+'</p><p><b>Values:</b> '+esc(pc.values)+'</p><p><b>Fears:</b> '+esc(pc.fears)+'</p></section>'+
    '</div>'+
    '<section class="relationships"><h3>People already in my life</h3><p>'+esc(pc.relationships)+'</p></section>'+
    '<section class="starting-hook"><h3>My first hook</h3><p>'+esc(pc.startingHook)+'</p></section>'+
    '<section class="edition-lock"><div><small>LOCK BEFORE FIRST GROWTH BEAT</small><p>Rules edition: □ 2014 &nbsp;&nbsp; □ 2024</p></div><div><small>RACE / SPECIES</small><p>'+esc(pc.raceSpecies)+' — immutable identity</p></div></section>'+
    '<section class="waiting-raw"><h3>Waiting for graduation</h3><div><span>Background</span><span>Class</span><span>HP / Hit Die</span><span>Saves</span><span>Proficiencies</span><span>Equipment</span><span>Spells</span><span>Feats</span></div><p>These remain blank until the Level-0 base array is frozen and the locked edition supplies the legal Level-1 package.</p></section>'+
    '<footer><span>Player name: __________________________</span><span>Scrapbook starts at Age 12</span></footer>'+
  '</article>';
}
function title(x){return x?x.charAt(0).toUpperCase()+x.slice(1):"";}
async function init(){
 const res=await fetch("data/zero-to-hero/hearthcross-starters.json",{cache:"no-store"});
 if(!res.ok) throw new Error("Starter pack could not load.");
 pack=await res.json();
 $("starter-host").innerHTML=pack.characters.map(card).join("");
 $("print-all").onclick=()=>window.print();
}
init().catch(e=>$("starter-host").innerHTML='<p>'+esc(e.message)+'</p>');
})();