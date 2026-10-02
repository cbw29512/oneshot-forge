(() => {
  "use strict";
  const STORAGE_KEY = "oneshot-forge:zero-hero:v1";
  const ABILITIES = ["STR","DEX","CON","INT","WIS","CHA"];
  const POINT_BUY_COST = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  const els = {};
  let campaign = null;
  let state = null;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const mod = score => Math.floor((Number(score) - 10) / 2);
  const signed = n => (n >= 0 ? "+" : "") + n;

  function blankState() {
    return {
      version:2, chapterIndex:0, age:12,
      identity:{name:"",ancestry:"",family:"",chores:"",aspiration:"",values:"",fears:"",training:"",possessions:"Ordinary clothing and household possessions only.",relationships:"",reputation:"",choices:""},
      scores:{STR:9,DEX:9,CON:9,INT:9,WIS:9,CHA:9},
      marks:{STR:0,DEX:0,CON:0,INT:0,WIS:0,CHA:0},
      growthUsed:0,
      chapterGrowth:{},
      resolvedBeats:{},
      timeline:[],
      graduationEdition:null,
      reflectionStarted:false
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (parsed && (parsed.version === 1 || parsed.version === 2)) {
        state = parsed;
        state.version = 2;
        state.reflectionStarted = Boolean(state.reflectionStarted);
      } else {
        state = blankState();
      }
    } catch { state = blankState(); }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function costFor(score) {
    return Number(campaign.development.costToRaise[String(score)] || 0);
  }

  function pointBuyCost(score) {
    return Number(POINT_BUY_COST[Number(score)] ?? NaN);
  }

  function baseArrayCost(scores = state.scores) {
    return ABILITIES.reduce((sum, ability) => sum + pointBuyCost(scores[ability]), 0);
  }

  function reflectionRemaining() {
    return Math.max(0, Number(campaign.development.finalPointBuyBudget || 27) - baseArrayCost());
  }

  function canFinishReflection(scores, remaining, memo = new Map()) {
    if (remaining === 0) return true;
    if (remaining < 0) return false;
    const key = ABILITIES.map(a => scores[a]).join(",") + "|" + remaining;
    if (memo.has(key)) return memo.get(key);
    for (const ability of ABILITIES) {
      const score = scores[ability];
      if (score >= campaign.development.maxPreOriginScore) continue;
      const delta = pointBuyCost(score + 1) - pointBuyCost(score);
      if (delta > remaining) continue;
      const next = {...scores, [ability]: score + 1};
      if (canFinishReflection(next, remaining - delta, memo)) {
        memo.set(key, true);
        return true;
      }
    }
    memo.set(key, false);
    return false;
  }

  function reflectionOptions() {
    const remaining = reflectionRemaining();
    return ABILITIES.filter(ability => {
      const score = state.scores[ability];
      if (score >= campaign.development.maxPreOriginScore) return false;
      const delta = pointBuyCost(score + 1) - pointBuyCost(score);
      if (delta > remaining) return false;
      const next = {...state.scores, [ability]: score + 1};
      return canFinishReflection(next, remaining - delta);
    });
  }

  function applyReflection(ability) {
    const remaining = reflectionRemaining();
    if (!state.reflectionStarted || remaining <= 0 || !reflectionOptions().includes(ability)) return;
    const before = state.scores[ability];
    const delta = pointBuyCost(before + 1) - pointBuyCost(before);
    state.scores[ability] = before + 1;
    state.timeline.push({
      type:"reflection", age:18, chapter:"Final Reflection", ability,
      result:"No roll. Reassigned " + delta + " already-earned development credit" + (delta === 1 ? "" : "s") + " to complete the legal 27-point base array.",
      scoreAfter:state.scores[ability]
    });
    saveState();
    render();
  }

  function awardDevelopment(ability) {
    const score = state.scores[ability];
    if (score >= campaign.development.maxPreOriginScore) throw new Error(ability + " is already at the Level-0 cap of 15.");
    state.marks[ability] = Number(state.marks[ability] || 0) + 1;
    const needed = costFor(score);
    if (needed && state.marks[ability] >= needed) {
      state.marks[ability] -= needed;
      state.scores[ability] += 1;
    }
    state.growthUsed += 1;
  }

  function outcomeFor(roll,total,dc) {
    const succeeded = total >= dc;
    if (succeeded && roll === 20) return "criticalSuccess";
    if (!succeeded && roll === 1) return "criticalFailure";
    return succeeded ? "success" : "failure";
  }

  function resolveBeat(chapter, beat, ability, roll) {
    const key = chapter.id + ":" + beat.id;
    if (state.resolvedBeats[key]) return;
    if (!ABILITIES.includes(ability)) return;
    if (!Number.isInteger(roll) || roll < 1 || roll > 20) return;
    if (state.scores[ability] >= campaign.development.maxPreOriginScore) {
      alert(ability + " is already 15. Solve this growth opportunity using a different approach.");
      return;
    }
    const total = roll + mod(state.scores[ability]);
    const outcome = outcomeFor(roll,total,beat.dc);
    awardDevelopment(ability);
    state.resolvedBeats[key] = {ability,roll,total,outcome,growthAwarded:1};
    state.chapterGrowth[chapter.id] = Number(state.chapterGrowth[chapter.id] || 0) + 1;
    state.timeline.push({
      age:chapter.age,chapter:chapter.title,beat:beat.title,ability,roll,total,dc:beat.dc,outcome,
      result:beat.outcomes[outcome],scoreAfter:state.scores[ability]
    });
    saveState();
    render();
  }

  function bindIdentity() {
    const map = {
      "char-name":"name","char-ancestry":"ancestry","char-family":"family","char-chores":"chores",
      "char-aspiration":"aspiration","char-values":"values","char-fears":"fears","char-training":"training",
      "char-possessions":"possessions","char-relationships":"relationships","char-reputation":"reputation","char-choices":"choices"
    };
    for (const [id,key] of Object.entries(map)) {
      const el = $(id); el.value = state.identity[key] || "";
      el.oninput = () => { state.identity[key] = el.value; saveState(); renderHeaderOnly(); };
    }
  }

  function renderHeaderOnly() {
    $("sheet-name").textContent = state.identity.name || "Unnamed child";
    $("sheet-meta").textContent = "Age " + state.age + " · Level 0 · Hearthcross";
    $("growth-count").textContent = state.growthUsed + " / " + campaign.development.totalPoints;
  }

  function renderAbilities() {
    $("ability-growth").innerHTML = ABILITIES.map(a => {
      const score=state.scores[a], needed=costFor(score), marks=state.marks[a]||0;
      const guide=campaign.development.abilityGuide[a];
      const meter = score >= 15 ? "CAP REACHED" : marks + " / " + needed + " toward " + (score + 1);
      return '<article class="ability-card"><div><strong>'+a+'</strong><span>'+esc(guide)+'</span></div><b>'+score+'</b><em>'+signed(mod(score))+'</em><small>'+meter+'</small></article>';
    }).join("");
  }

  function renderTimeline() {
    if (!state.timeline.length) {
      $("timeline").innerHTML = '<p class="muted">Your history is blank. The first mini-adventure will write it.</p>';
      return;
    }
    $("timeline").innerHTML = state.timeline.map(e => {
      if (e.type === "reflection") {
        return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><span>'+e.ability+' now '+e.scoreAfter+' · no roll</span><p>'+esc(e.result)+'</p></article>';
      }
      return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><span>'+esc(e.beat)+' — '+e.ability+
        ' d20 '+e.roll+' '+signed(modFromTotal(e.total,e.roll))+' = '+e.total+' vs DC '+e.dc+
        ' · '+labelOutcome(e.outcome)+' · +1 Development Point · '+e.ability+' now '+e.scoreAfter+'</span><p>'+esc(e.result)+'</p></article>';
    }).join("");
  }
  function modFromTotal(total, roll){ return total-roll; }
  function labelOutcome(x){ return ({criticalSuccess:"Critical success",success:"Success",failure:"Failure",criticalFailure:"Critical failure"})[x] || x; }

  function renderBeat(chapter, beat, index) {
    const key=chapter.id+":"+beat.id;
    const done=state.resolvedBeats[key];
    if (done) {
      return '<article class="growth-beat done"><p class="beat-index">Growth '+(index+1)+' of 3 · complete</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="resolved"><b>'+done.ability+' · '+labelOutcome(done.outcome)+'</b><span>d20 '+done.roll+' → total '+done.total+' vs DC '+beat.dc+' · +1 Development Point regardless of result</span><p>'+esc(beat.outcomes[done.outcome])+'</p></div></article>';
    }
    const approachCards=ABILITIES.map(a => '<button type="button" class="approach" data-ability="'+a+'" data-beat="'+esc(beat.id)+'"><b>'+a+'</b><span>'+esc(beat.approaches[a])+'</span></button>').join("");
    return '<article class="growth-beat"><p class="beat-index">Growth '+(index+1)+' of 3 · DC '+beat.dc+'</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="approach-grid">'+approachCards+'</div><div class="roll-box" id="roll-'+esc(beat.id)+'" hidden><label>Chosen approach <strong class="chosen-ability"></strong></label><label>d20 result <input class="d20-input" type="number" min="1" max="20" inputmode="numeric" placeholder="1–20"></label><button type="button" class="button ember resolve-roll">Resolve developmental check</button><p class="muted">The attempt earns one Development Point. The roll determines success, failure, or a critical consequence.</p></div></article>';
  }

  function wireBeats(chapter) {
    document.querySelectorAll(".approach").forEach(btn => btn.addEventListener("click", () => {
      const beatId=btn.dataset.beat;
      const box=$("roll-"+beatId);
      box.hidden=false;
      box.dataset.ability=btn.dataset.ability;
      box.querySelector(".chosen-ability").textContent=btn.dataset.ability;
      document.querySelectorAll('[data-beat="'+CSS.escape(beatId)+'"]').forEach(x => x.classList.toggle("selected", x===btn));
      box.querySelector(".d20-input").focus();
    }));
    document.querySelectorAll(".resolve-roll").forEach(btn => btn.addEventListener("click", () => {
      const box=btn.closest(".roll-box");
      const beatId=box.id.replace(/^roll-/,"");
      const beat=chapter.growthBeats.find(x=>x.id===beatId);
      const roll=Number(box.querySelector(".d20-input").value);
      resolveBeat(chapter,beat,box.dataset.ability,roll);
    }));
  }

  function renderQuest() {
    const chapter=campaign.chapters[state.chapterIndex];
    if (!chapter) {
      $("quest-title").textContent="Origin campaign complete";
      $("quest-objective").textContent="Your Level-0 history is ready for graduation.";
      $("beat-host").innerHTML="";
      $("advance-year").hidden=true;
      $("graduation-panel").hidden=false;
      return;
    }
    $("quest-age").textContent="Age "+chapter.age;
    $("quest-title").textContent=chapter.title;
    $("quest-objective").textContent=chapter.objective;
    $("quest-pressure").textContent=chapter.pressure;
    $("quest-choice").textContent=chapter.choice;
    $("quest-consequence").textContent=chapter.consequence;
    $("beat-host").innerHTML=chapter.growthBeats.map((b,i)=>renderBeat(chapter,b,i)).join("");
    const used=Number(state.chapterGrowth[chapter.id]||0);
    const next=$("advance-year");
    next.hidden=false; next.disabled=used!==campaign.development.pointsPerChapter;
    next.textContent = chapter.age === 18 ? "Complete Level 0 →" : "Finish age "+chapter.age+" → age "+(chapter.age+1);
    next.onclick=()=>{
      if (used!==3) return;
      if (chapter.age === 18) {
        state.reflectionStarted = true;
        state.marks = {STR:0,DEX:0,CON:0,INT:0,WIS:0,CHA:0};
      }
      state.chapterIndex += 1;
      state.age = campaign.chapters[state.chapterIndex]?.age || 18;
      saveState(); render();
      window.scrollTo({top:document.querySelector(".quest-panel").offsetTop-20,behavior:"smooth"});
    };
    $("graduation-panel").hidden=true;
    wireBeats(chapter);
  }

  function renderVillage() {
    const v=campaign.village;
    $("village-host").innerHTML='<p>'+esc(v.pitch)+'</p><div class="npc-grid">'+v.npcs.map(n =>
      '<article><h3>'+esc(n.name)+'</h3><p><b>'+esc(n.role)+'</b></p><p>'+esc(n.appearance)+'</p><p><b>Voice:</b> '+esc(n.voice)+'</p><p><b>Wants:</b> '+esc(n.wants)+'</p><p><b>Fears:</b> '+esc(n.fears)+'</p><p><b>Secret:</b> '+esc(n.secret)+'</p><p><b>Can teach:</b> '+esc(n.teaches.join(", "))+'</p><p><b>Over the years:</b> '+esc(n.change)+'</p></article>'
    ).join("")+'</div>';
  }

  function renderGraduation() {
    const complete = state.chapterIndex >= campaign.chapters.length;
    if (!complete) return;
    const spent = baseArrayCost();
    const target = Number(campaign.development.finalPointBuyBudget || 27);
    const remaining = reflectionRemaining();
    const audit = $("raw-audit");
    const reflection = $("reflection-host");
    audit.innerHTML = '<h3>RAW base-array audit</h3><p><strong>'+spent+' / '+target+' point-buy points converted.</strong> Every roll outcome awarded the same growth. Scores remain at or below '+campaign.development.maxPreOriginScore+' before edition-specific origin adjustments.</p>';

    if (remaining > 0) {
      const options = reflectionOptions();
      reflection.innerHTML = '<div class="zero-house-note"><strong>Final Reflection: '+remaining+' earned point-buy credit'+(remaining===1?'':'s')+' remain.</strong><br>No roll is made. Choose how the last pieces of growing up settle into the character. This adds no new budget; it only converts already-earned development so every graduate reaches the same legal 27-point base budget.</div><div class="reflection-actions">'+
        options.map(a => {
          const delta = pointBuyCost(state.scores[a]+1)-pointBuyCost(state.scores[a]);
          return '<button type="button" class="button small secondary reflection-choice" data-reflect="'+a+'">'+a+' '+state.scores[a]+' → '+(state.scores[a]+1)+' ('+delta+' credit'+(delta===1?'':'s')+')</button>';
        }).join("")+'</div>';
      document.querySelectorAll(".reflection-choice").forEach(btn => btn.onclick=()=>applyReflection(btn.dataset.reflect));
    } else {
      reflection.innerHTML = '<p class="zero-house-note"><strong>Base array certified:</strong> exactly '+target+' point-buy points. RAW graduation may proceed.</p>';
    }

    document.querySelectorAll("[data-edition]").forEach(btn => {
      btn.disabled = remaining !== 0;
      btn.onclick=()=>{
        if (reflectionRemaining() !== 0) return;
        const ed=btn.dataset.edition; state.graduationEdition=ed; saveState();
        const g=campaign.graduation[ed];
        $("graduation-summary").innerHTML='<h3>'+ed+' RAW graduation contract</h3><ol>'+g.order.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><p><strong>Certified pre-origin array ('+baseArrayCost()+'/27):</strong> '+ABILITIES.map(a=>a+' '+state.scores[a]).join(" · ")+'</p><p class="zero-house-note"><strong>RAW mode:</strong> Level-0 familiarity, mentors, reputation and heirlooms remain narrative unless a legal '+ed+' character-creation option grants the mechanical benefit. No extra feat, proficiency, ASI, class feature, spell or magic property is added by default.</p><p class="zero-house-note">Class conversion remains gated to certified Level-1 class packs. Zero-to-Hero will not invent or mix edition mechanics.</p>';
      };
    });
  }

  function render() {
    renderHeaderOnly(); renderAbilities(); renderTimeline(); renderQuest(); renderGraduation();
  }

  async function init() {
    const res=await fetch("data/zero-to-hero/from-zero-to-hero.json",{cache:"no-store"});
    if(!res.ok) throw new Error("Unable to load From Zero to Hero data.");
    campaign=await res.json();
    loadState(); bindIdentity(); renderVillage(); render();
    $("print-growth").onclick=()=>window.print();
    $("reset-growth").onclick=()=>{
      if(!confirm("Reset this Level-0 character and erase all growth history on this browser?")) return;
      localStorage.removeItem(STORAGE_KEY); state=blankState(); bindIdentity(); render();
    };
  }

  init().catch(err=>{
    document.querySelector(".zero-shell").innerHTML='<section class="zero-error"><h1>From Zero to Hero could not load.</h1><p>'+esc(err.message)+'</p></section>';
  });
})();
