(() => {
  "use strict";

  const STORAGE_KEY = "oneshot-forge:zero-hero:v1";
  const ABILITIES = ["STR","DEX","CON","INT","WIS","CHA"];
  const POINT_BUY_COST = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};

  let campaign = null;
  let state = null;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const mod = score => Math.floor((Number(score) - 10) / 2);
  const signed = n => (n >= 0 ? "+" : "") + n;

  function blankAbilityMap(value=0) {
    return Object.fromEntries(ABILITIES.map(a => [a,value]));
  }

  function blankState() {
    return {
      version:3,
      chapterIndex:0,
      age:12,
      identity:{
        name:"",ancestry:"",family:"",chores:"",aspiration:"",
        values:"",fears:"",training:"",
        possessions:"Ordinary clothing and household possessions only.",
        relationships:"",reputation:"",choices:""
      },
      scores:blankAbilityMap(9),
      invested:blankAbilityMap(0),
      wallet:{flexible:0,lessons:blankAbilityMap(0)},
      growthUsed:0,
      criticalBonusEarned:0,
      chapterGrowth:{},
      resolvedBeats:{},
      timeline:[],
      graduationEdition:null
    };
  }

  function pointBuyCost(score) {
    return Number(POINT_BUY_COST[Number(score)] ?? NaN);
  }

  function costFor(score) {
    return Number(campaign.development.costToRaise[String(score)] || 0);
  }

  function scoreFromInvested(points) {
    let score=9;
    let remaining=Math.max(0,Number(points)||0);
    while(score < campaign.development.maxPreOriginScore) {
      const need=costFor(score);
      if(!need || remaining < need) break;
      remaining-=need;
      score+=1;
    }
    return score;
  }

  function spentToReach(score) {
    return pointBuyCost(score) - pointBuyCost(9);
  }

  function recomputeScores() {
    for(const ability of ABILITIES) {
      state.invested[ability]=Math.max(0,Number(state.invested[ability]||0));
      state.scores[ability]=scoreFromInvested(state.invested[ability]);
    }
  }

  function migrateState(parsed) {
    if(!parsed || ![1,2,3].includes(parsed.version)) return blankState();
    if(parsed.version===3) {
      parsed.wallet ||= {flexible:0,lessons:blankAbilityMap(0)};
      parsed.wallet.lessons ||= blankAbilityMap(0);
      parsed.invested ||= blankAbilityMap(0);
      for(const a of ABILITIES) {
        parsed.wallet.lessons[a]=Number(parsed.wallet.lessons[a]||0);
        parsed.invested[a]=Number(parsed.invested[a]||0);
      }
      parsed.criticalBonusEarned=Number(parsed.criticalBonusEarned||0);
      parsed.version=3;
      state=parsed;
      recomputeScores();
      return state;
    }

    const migrated=blankState();
    migrated.chapterIndex=Number(parsed.chapterIndex||0);
    migrated.age=Number(parsed.age||12);
    migrated.identity={...migrated.identity,...(parsed.identity||{})};
    migrated.growthUsed=Number(parsed.growthUsed||0);
    migrated.chapterGrowth=parsed.chapterGrowth||{};
    migrated.resolvedBeats=parsed.resolvedBeats||{};
    migrated.timeline=parsed.timeline||[];
    migrated.graduationEdition=parsed.graduationEdition||null;

    for(const a of ABILITIES) {
      const oldScore=Number(parsed.scores?.[a]||9);
      const oldMark=Number(parsed.marks?.[a]||0);
      migrated.invested[a]=Math.max(0,(pointBuyCost(oldScore)-pointBuyCost(9))+oldMark);
    }
    state=migrated;
    recomputeScores();
    return state;
  }

  function loadState() {
    try {
      state=migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"));
    } catch {
      state=blankState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  }

  function totalLessonWallet() {
    return ABILITIES.reduce((sum,a)=>sum+Number(state.wallet.lessons[a]||0),0);
  }

  function totalWallet() {
    return Number(state.wallet.flexible||0)+totalLessonWallet();
  }

  function baseArrayCost() {
    return ABILITIES.reduce((sum,a)=>sum+pointBuyCost(state.scores[a]),0);
  }

  function pendingInvestedProgress(ability) {
    return Math.max(0,state.invested[ability]-spentToReach(state.scores[ability]));
  }

  function totalPendingInvestedProgress() {
    return ABILITIES.reduce((sum,a)=>sum+pendingInvestedProgress(a),0);
  }

  function cappedLessonPoints() {
    return ABILITIES.reduce((sum,a)=>sum+(canInvest(a)?0:Number(state.wallet.lessons[a]||0)),0);
  }

  function settleMaturityCredits() {
    if(state.chapterIndex<campaign.chapters.length) return;
    let reclaimed=0;

    for(const ability of ABILITIES) {
      const partial=pendingInvestedProgress(ability);
      if(partial>0) {
        state.invested[ability]-=partial;
        reclaimed+=partial;
      }
      if(!canInvest(ability) && state.wallet.lessons[ability]>0) {
        reclaimed+=Number(state.wallet.lessons[ability]||0);
        state.wallet.lessons[ability]=0;
      }
    }

    if(!reclaimed) return;
    state.wallet.flexible+=reclaimed;
    recomputeScores();
    state.timeline.push({
      type:"maturity",age:18,chapter:"Maturity Settlement",
      result:reclaimed+" stranded Development Point"+(reclaimed===1?"":"s")+" returned to the flexible wallet. No development was lost."
    });
    saveState();
    render();
  }

  function canInvest(ability) {
    return state.scores[ability] < campaign.development.maxPreOriginScore;
  }

  function investPoint(ability,source) {
    if(!ABILITIES.includes(ability)||!canInvest(ability)) return;
    if(source==="flexible") {
      if(state.wallet.flexible<1) return;
      state.wallet.flexible-=1;
    } else if(source==="lesson") {
      if(state.wallet.lessons[ability]<1) return;
      state.wallet.lessons[ability]-=1;
    } else return;

    state.invested[ability]+=1;
    recomputeScores();
    state.timeline.push({
      type:"spend",age:state.age,chapter:"Development",
      ability,result:(source==="flexible"?"Flexible":"Lesson")+" Development Point invested in "+ability+".",
      scoreAfter:state.scores[ability]
    });
    saveState();
    render();
  }

  function outcomeFor(roll,total,dc) {
    const succeeded=total>=dc;
    if(succeeded && roll===20) return "criticalSuccess";
    if(!succeeded && roll===1) return "criticalFailure";
    return succeeded ? "success" : "failure";
  }

  function finalizeBeat(chapter,beat,attemptedAbility,roll,outcome,lessonAbility=null) {
    const key=chapter.id+":"+beat.id;
    if(state.resolvedBeats[key]) return;

    const total=roll+mod(state.scores[attemptedAbility]);
    const rule=campaign.development.pointsByOutcome[outcome];
    let shifted=0;

    state.wallet.flexible+=Number(rule.flexible||0);

    if(Number(rule.lesson||0)>0) {
      if(!lessonAbility || lessonAbility===attemptedAbility || !canInvest(lessonAbility)) return;
      state.wallet.lessons[lessonAbility]+=Number(rule.lesson);
    }

    if(Number(rule.shiftInvested||0)>0 && state.invested[attemptedAbility]>0 && lessonAbility && canInvest(lessonAbility)) {
      state.invested[attemptedAbility]-=1;
      state.invested[lessonAbility]+=1;
      shifted=1;
      recomputeScores();
    }

    if(outcome==="criticalSuccess") state.criticalBonusEarned+=1;

    state.growthUsed+=1;
    state.chapterGrowth[chapter.id]=Number(state.chapterGrowth[chapter.id]||0)+1;
    state.resolvedBeats[key]={
      attemptedAbility,roll,total,outcome,lessonAbility,
      flexibleEarned:Number(rule.flexible||0),
      lessonEarned:Number(rule.lesson||0),
      shifted
    };

    const growthText=outcome==="criticalSuccess"
      ? "+2 flexible Development Points"
      : outcome==="success"
        ? "+1 flexible Development Point"
        : outcome==="failure"
          ? "+1 "+lessonAbility+" Lesson Point"
          : "+1 "+lessonAbility+" Lesson Point"+(shifted?" and 1 invested "+attemptedAbility+" point shifted to "+lessonAbility:"");

    state.timeline.push({
      type:"check",age:chapter.age,chapter:chapter.title,beat:beat.title,
      ability:attemptedAbility,lessonAbility,roll,total,dc:beat.dc,outcome,
      result:beat.outcomes[outcome],growthText,
      scoreAfter:state.scores[attemptedAbility]
    });

    saveState();
    render();
  }

  function resolveBeat(chapter,beat,attemptedAbility,roll,lessonAbility=null) {
    const key=chapter.id+":"+beat.id;
    if(state.resolvedBeats[key]) return {done:true};
    if(!ABILITIES.includes(attemptedAbility)) return {error:"Choose an approach."};
    if(!Number.isInteger(roll)||roll<1||roll>20) return {error:"Enter a d20 result from 1 to 20."};

    const total=roll+mod(state.scores[attemptedAbility]);
    const outcome=outcomeFor(roll,total,beat.dc);

    if((outcome==="failure"||outcome==="criticalFailure") && !lessonAbility) {
      return {needsLesson:true,outcome,total};
    }

    finalizeBeat(chapter,beat,attemptedAbility,roll,outcome,lessonAbility);
    return {done:true};
  }

  function bindIdentity() {
    const map={
      "char-name":"name","char-ancestry":"ancestry","char-family":"family","char-chores":"chores",
      "char-aspiration":"aspiration","char-values":"values","char-fears":"fears","char-training":"training",
      "char-possessions":"possessions","char-relationships":"relationships","char-reputation":"reputation","char-choices":"choices"
    };
    for(const [id,key] of Object.entries(map)) {
      const el=$(id);
      el.value=state.identity[key]||"";
      el.oninput=()=>{state.identity[key]=el.value;saveState();renderHeaderOnly();};
    }
  }

  function renderHeaderOnly() {
    $("sheet-name").textContent=state.identity.name||"Unnamed child";
    $("sheet-meta").textContent="Age "+state.age+" · Level 0 · Hearthcross";
    $("growth-count").textContent=state.growthUsed+" / "+campaign.development.baseOpportunities;
    const wallet=$("development-wallet");
    if(wallet) {
      wallet.innerHTML='<strong>'+state.wallet.flexible+'</strong> flexible · <strong>'+totalLessonWallet()+'</strong> lesson · <strong>'+state.criticalBonusEarned+'</strong> critical bonus earned';
    }
  }

  function renderAbilities() {
    $("ability-growth").innerHTML=ABILITIES.map(a=>{
      const score=state.scores[a];
      const pending=pendingInvestedProgress(a);
      const need=score>=15?0:costFor(score);
      const lesson=state.wallet.lessons[a]||0;
      const progress=score>=15?"CAP REACHED":pending+" / "+need+" invested toward "+(score+1);
      const flexButton=state.wallet.flexible>0&&canInvest(a)
        ? '<button type="button" class="button small secondary spend-point" data-source="flexible" data-ability="'+a+'">Spend flexible</button>'
        : "";
      const lessonButton=lesson>0&&canInvest(a)
        ? '<button type="button" class="button small spend-point" data-source="lesson" data-ability="'+a+'">Spend lesson ('+lesson+')</button>'
        : "";
      return '<article class="ability-card"><div><strong>'+a+'</strong><span>'+esc(campaign.development.abilityGuide[a])+'</span></div><b>'+score+'</b><em>'+signed(mod(score))+'</em><small>'+progress+'</small><div class="ability-spend">'+flexButton+lessonButton+'</div></article>';
    }).join("");

    document.querySelectorAll(".spend-point").forEach(btn=>{
      btn.onclick=()=>investPoint(btn.dataset.ability,btn.dataset.source);
    });
  }

  function renderTimeline() {
    if(!state.timeline.length) {
      $("timeline").innerHTML='<p class="muted">Your history is blank. The first mini-adventure will write it.</p>';
      return;
    }
    $("timeline").innerHTML=state.timeline.map(e=>{
      if(e.type==="spend") {
        return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><span>'+e.ability+' now '+e.scoreAfter+'</span><p>'+esc(e.result)+'</p></article>';
      }
      if(e.type==="maturity") {
        return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><p>'+esc(e.result)+'</p></article>';
      }
      const lesson=e.lessonAbility?' · lesson: '+e.lessonAbility:"";
      return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><span>'+esc(e.beat)+' — '+e.ability+
        ' d20 '+e.roll+' '+signed(e.total-e.roll)+' = '+e.total+' vs DC '+e.dc+
        ' · '+labelOutcome(e.outcome)+lesson+'</span><p>'+esc(e.growthText||"")+'</p><p>'+esc(e.result)+'</p></article>';
    }).join("");
  }

  function labelOutcome(x) {
    return ({criticalSuccess:"Critical success",success:"Success",failure:"Failure",criticalFailure:"Critical failure"})[x]||x;
  }

  function renderBeat(chapter,beat,index) {
    const key=chapter.id+":"+beat.id;
    const done=state.resolvedBeats[key];
    if(done) {
      const growth=done.outcome==="criticalSuccess"
        ? "+2 flexible DP"
        : done.outcome==="success"
          ? "+1 flexible DP"
          : "+1 "+done.lessonAbility+" Lesson DP"+(done.shifted?" · shifted 1 invested point":"");
      return '<article class="growth-beat done"><p class="beat-index">Growth '+(index+1)+' of 3 · complete</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="resolved"><b>'+done.attemptedAbility+' · '+labelOutcome(done.outcome)+'</b><span>d20 '+done.roll+' → total '+done.total+' vs DC '+beat.dc+' · '+esc(growth)+'</span><p>'+esc(beat.outcomes[done.outcome])+'</p></div></article>';
    }

    const approaches=ABILITIES.map(a=>
      '<button type="button" class="approach" data-ability="'+a+'" data-beat="'+esc(beat.id)+'"><b>'+a+'</b><span>'+esc(beat.approaches[a])+'</span></button>'
    ).join("");

    return '<article class="growth-beat"><p class="beat-index">Growth '+(index+1)+' of 3 · DC '+beat.dc+'</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="approach-grid">'+approaches+'</div><div class="roll-box" id="roll-'+esc(beat.id)+'" hidden><label>Chosen approach <strong class="chosen-ability"></strong></label><label>d20 result <input class="d20-input" type="number" min="1" max="20" inputmode="numeric" placeholder="1–20"></label><button type="button" class="button ember resolve-roll">Resolve developmental check</button><p class="muted">Success earns flexible growth. Failure earns growth somewhere else. Critical success earns an extra point. Critical failure can redirect an already-invested point.</p><div class="lesson-picker" hidden></div></div></article>';
  }

  function showLessonPicker(chapter,beat,box,attemptedAbility,roll,outcome,total) {
    const host=box.querySelector(".lesson-picker");
    const options=ABILITIES.filter(a=>a!==attemptedAbility&&canInvest(a));
    host.hidden=false;
    host.innerHTML='<div class="zero-house-note"><strong>'+labelOutcome(outcome)+'. What did the character learn instead?</strong><br>Choose a different ability justified by the consequence. The lesson point is locked there.'+
      (outcome==="criticalFailure"&&state.invested[attemptedAbility]>0
        ? ' One already-invested '+attemptedAbility+' point will also shift to that ability.'
        : '')+'</div><div class="lesson-actions">'+
      options.map(a=>'<button type="button" class="button small secondary choose-lesson" data-lesson="'+a+'">'+a+' — '+esc(campaign.development.abilityGuide[a])+'</button>').join("")+
      '</div>';

    host.querySelectorAll(".choose-lesson").forEach(btn=>{
      btn.onclick=()=>finalizeBeat(chapter,beat,attemptedAbility,roll,outcome,btn.dataset.lesson);
    });
  }

  function wireBeats(chapter) {
    document.querySelectorAll(".approach").forEach(btn=>btn.addEventListener("click",()=>{
      const beatId=btn.dataset.beat;
      const box=$("roll-"+beatId);
      box.hidden=false;
      box.dataset.ability=btn.dataset.ability;
      box.querySelector(".chosen-ability").textContent=btn.dataset.ability;
      box.querySelector(".lesson-picker").hidden=true;
      document.querySelectorAll('[data-beat="'+CSS.escape(beatId)+'"]').forEach(x=>x.classList.toggle("selected",x===btn));
      box.querySelector(".d20-input").focus();
    }));

    document.querySelectorAll(".resolve-roll").forEach(btn=>btn.addEventListener("click",()=>{
      const box=btn.closest(".roll-box");
      const beatId=box.id.replace(/^roll-/,"");
      const beat=chapter.growthBeats.find(x=>x.id===beatId);
      const ability=box.dataset.ability;
      const roll=Number(box.querySelector(".d20-input").value);
      const result=resolveBeat(chapter,beat,ability,roll);
      if(result?.error) {
        alert(result.error);
        return;
      }
      if(result?.needsLesson) showLessonPicker(chapter,beat,box,ability,roll,result.outcome,result.total);
    }));
  }

  function renderQuest() {
    const chapter=campaign.chapters[state.chapterIndex];
    if(!chapter) {
      $("quest-title").textContent="Origin campaign complete";
      $("quest-objective").textContent="Spend any remaining Development Points, then freeze your Level-0 array for graduation.";
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
    next.hidden=false;
    next.disabled=used!==3;
    next.textContent=chapter.age===18?"Complete Level 0 →":"Finish age "+chapter.age+" → age "+(chapter.age+1);
    next.onclick=()=>{
      if(used!==3) return;
      state.chapterIndex+=1;
      state.age=campaign.chapters[state.chapterIndex]?.age||18;
      saveState();
      render();
      window.scrollTo({top:document.querySelector(".quest-panel").offsetTop-20,behavior:"smooth"});
    };

    $("graduation-panel").hidden=true;
    wireBeats(chapter);
  }

  function renderVillage() {
    const v=campaign.village;
    $("village-host").innerHTML='<p>'+esc(v.pitch)+'</p><div class="npc-grid">'+v.npcs.map(n=>
      '<article><h3>'+esc(n.name)+'</h3><p><b>'+esc(n.role)+'</b></p><p>'+esc(n.appearance)+'</p><p><b>Voice:</b> '+esc(n.voice)+'</p><p><b>Wants:</b> '+esc(n.wants)+'</p><p><b>Fears:</b> '+esc(n.fears)+'</p><p><b>Secret:</b> '+esc(n.secret)+'</p><p><b>Can teach:</b> '+esc(n.teaches.join(", "))+'</p><p><b>Over the years:</b> '+esc(n.change)+'</p></article>'
    ).join("")+'</div>';
  }

  function renderGraduation() {
    if(state.chapterIndex<campaign.chapters.length) return;

    const value=baseArrayCost();
    const floor=Number(campaign.development.minimumGraduationValue||27);
    const over=Math.max(0,value-floor);
    const shortfall=Math.max(0,floor-value);
    const pending=totalPendingInvestedProgress();
    const lessons=totalLessonWallet();
    const cappedLessons=cappedLessonPoints();
    const unspent=totalWallet();
    const audit=$("raw-audit");
    const reflection=$("reflection-host");
    const ready=value>=floor && lessons===0;

    audit.innerHTML='<h3>Ability-generation audit</h3><p><strong>Current base array point-buy value: '+value+'.</strong> Zero-to-Hero graduation floor: <strong>'+floor+'</strong>.</p>'+
      (shortfall
        ? '<p class="zero-house-note"><strong>'+shortfall+' point'+(shortfall===1?'':'s')+' still need to become ability scores.</strong> Critical failures can redirect development, but they can never make the finished character fall below the '+floor+'-point floor.</p>'
        : over
          ? '<p class="zero-house-note"><strong>Heroic / house-rule ability generation:</strong> this is '+over+' point'+(over===1?'':'s')+' above the '+floor+'-point floor because critical-success bonus growth was spent.</p>'
          : '<p class="zero-house-note"><strong>Minimum development secured:</strong> the character has reached the full '+floor+'-point floor.</p>');

    let settleButton="";
    if(pending>0 || cappedLessons>0) {
      settleButton='<button type="button" class="button small secondary" id="settle-maturity">Return stranded growth to flexible pool</button>';
    }

    reflection.innerHTML='<p><strong>Unspent wallet:</strong> '+state.wallet.flexible+' flexible · '+lessons+' lesson. <strong>Partial invested progress:</strong> '+pending+'.</p>'+
      (lessons
        ? '<p class="muted">Spend remaining Lesson Points in their tagged abilities. If a lesson is blocked by the 15 cap, the settlement control converts only that stranded lesson to flexible growth.</p>'
        : shortfall
          ? '<p class="muted">Spend flexible points until the base array reaches at least '+floor+'. The character cannot graduate below that floor.</p>'
          : unspent||pending
            ? '<p class="muted">The minimum is secured. Extra unspent growth may be spent now or left unused; it never becomes a hidden Level-1 bonus.</p>'
            : '<p class="muted">All earned development is currently reflected in the ability array.</p>')+
      settleButton;

    const settle=$("settle-maturity");
    if(settle) settle.onclick=settleMaturityCredits;

    document.querySelectorAll("[data-edition]").forEach(btn=>{
      btn.disabled=!ready;
      btn.onclick=()=>{
        if(!ready) return;
        const ed=btn.dataset.edition;
        state.graduationEdition=ed;
        saveState();
        const g=campaign.graduation[ed];
        $("graduation-summary").innerHTML='<h3>'+ed+' graduation contract</h3><ol>'+g.order.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><p><strong>Frozen Level-0 base array ('+baseArrayCost()+' point-buy value):</strong> '+ABILITIES.map(a=>a+' '+state.scores[a]).join(" · ")+'</p><p class="zero-house-note"><strong>27-point minimum guaranteed:</strong> failures and critical failures changed where this character developed, not whether the character received the full baseline development budget.</p><p class="zero-house-note"><strong>Rules boundary:</strong> From Zero to Hero determines the base scores. From this point forward, species/race, background, class, HP, proficiency, spells, feats, equipment and later advancement use the selected '+ed+' rules only. Training, mentors and heirlooms stay narrative unless a legal rule or explicitly enabled house rule grants mechanics.</p>';
      };
    });
  }

  function render() {
    renderHeaderOnly();
    renderAbilities();
    renderTimeline();
    renderQuest();
    renderGraduation();
  }

  async function init() {
    const res=await fetch("data/zero-to-hero/from-zero-to-hero.json",{cache:"no-store"});
    if(!res.ok) throw new Error("Unable to load From Zero to Hero data.");
    campaign=await res.json();
    loadState();
    bindIdentity();
    renderVillage();
    render();

    $("print-growth").onclick=()=>window.print();
    $("reset-growth").onclick=()=>{
      if(!confirm("Reset this Level-0 character and erase all growth history on this browser?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state=blankState();
      bindIdentity();
      render();
    };
  }

  init().catch(err=>{
    document.querySelector(".zero-shell").innerHTML='<section class="zero-error"><h1>From Zero to Hero could not load.</h1><p>'+esc(err.message)+'</p></section>';
  });
})();
