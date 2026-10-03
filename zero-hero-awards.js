(() => {
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ordinal=n=>{n=Number(n);if(n%100>=11&&n%100<=13)return n+"th";return n+(n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th");};
function awardFor(c,place){
 if(place<=3)return c.awards?.[String(place)];
 return c.consolations?.[place-4]||c.consolations?.at(-1);
}
function card(c,place){
 const a=awardFor(c,place)||{title:"Participation Memory",category:"Consolation",memory:"You were there, and the story stayed with you."};
 const badge=place<=3?ordinal(place)+" PLACE":"CONSOLATION";
 return '<article class="award-card">'+
  '<header><span>'+esc(c.fairnessLaneLabel||c.primaryAbility||"EVENT")+'</span><strong>'+badge+'</strong></header>'+
  '<h2>'+esc(a.title)+'</h2>'+
  '<p class="award-event">'+esc(c.name)+'</p>'+
  '<p class="award-memory">'+esc(a.memory)+'</p>'+
  '<div class="award-result"><span>Official result</span><b>'+ordinal(place)+' of ______</b></div>'+
  '<div class="award-note"><span>My note</span><i></i><i></i></div>'+
  '<footer>Hearthcross · Age '+esc(c.age)+' · Story award · no extra DP</footer>'+
 '</article>';
}
async function init(){
 const res=await fetch("data/zero-to-hero/from-zero-to-hero.json",{cache:"no-store"});if(!res.ok)throw new Error("Competition library could not load.");
 const d=await res.json();
 const core=d.scrapbook.competitions.filter(c=>c.developmentCore);
 document.getElementById("award-host").innerHTML=core.map(c=>Array.from({length:6},(_,i)=>card(c,i+1)).join("")).join("");
 document.getElementById("print-awards").onclick=()=>window.print();
}
init().catch(e=>document.getElementById("award-host").innerHTML='<p>'+esc(e.message)+'</p>');
})();