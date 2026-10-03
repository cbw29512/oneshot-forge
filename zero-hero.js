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
      version:5,
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
      yearbook:{},
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
    if(!parsed || ![1,2,3,4,5].includes(parsed.version)) return blankState();
    if(parsed.version===3 || parsed.version===4 || parsed.version===5) {
      parsed.wallet ||= {flexible:0,lessons:blankAbilityMap(0)};
      parsed.wallet.lessons ||= blankAbilityMap(0);
      parsed.invested ||= blankAbilityMap(0);
      for(const a of ABILITIES) {
        parsed.wallet.lessons[a]=Number(parsed.wallet.lessons[a]||0);
        parsed.invested[a]=Number(parsed.invested[a]||0);
      }
      parsed.criticalBonusEarned=Number(parsed.criticalBonusEarned||0);
      parsed.yearbook ||= {};
      parsed.version=5;
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
    migrated.yearbook=parsed.yearbook||{};
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

  function arrayCostForInvested(invested) {
    return ABILITIES.reduce((sum,ability)=>sum+pointBuyCost(scoreFromInvested(Number(invested[ability]||0))),0);
  }

  function maximumArrayValue() {
    return Number(campaign.development.maximumGraduationValue||30);
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
    if(state.scores[ability] >= campaign.development.maxPreOriginScore) return false;
    const next={...state.invested,[ability]:Number(state.invested[ability]||0)+1};
    return arrayCostForInvested(next) <= maximumArrayValue();
  }

  function canRedirectInvestedPoint(fromAbility,toAbility) {
    if(fromAbility===toAbility || Number(state.invested[fromAbility]||0)<1) return false;
    const next={...state.invested};
    next[fromAbility]-=1;
    next[toAbility]=Number(next[toAbility]||0)+1;
    if(scoreFromInvested(next[toAbility]) > campaign.development.maxPreOriginScore) return false;
    return arrayCostForInvested(next) <= maximumArrayValue();
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

  function finalizeBeat(chapter,beat,attemptedAbility,rollData,outcome,lessonAbility=null) {
    const key=chapter.id+":"+beat.id;
    if(state.resolvedBeats[key]) return;

    const {roll1,roll2,keptRoll,advantage,advantageReason,total}=rollData;
    const rule=campaign.development.pointsByOutcome[outcome];
    let shifted=0;

    state.wallet.flexible+=Number(rule.flexible||0);

    if(Number(rule.lesson||0)>0) {
      if(!lessonAbility || lessonAbility===attemptedAbility) return;
      state.wallet.lessons[lessonAbility]+=Number(rule.lesson);
    }

    if(Number(rule.shiftInvested||0)>0 && lessonAbility && canRedirectInvestedPoint(attemptedAbility,lessonAbility)) {
      state.invested[attemptedAbility]-=1;
      state.invested[lessonAbility]+=1;
      shifted=1;
      recomputeScores();
    }

    if(outcome==="criticalSuccess") state.criticalBonusEarned+=1;

    state.growthUsed+=1;
    state.chapterGrowth[chapter.id]=Number(state.chapterGrowth[chapter.id]||0)+1;
    state.resolvedBeats[key]={
      attemptedAbility,roll:keptRoll,roll1,roll2,keptRoll,advantage,advantageReason,total,outcome,lessonAbility,
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
      ability:attemptedAbility,lessonAbility,roll:keptRoll,roll1,roll2,advantage,advantageReason,total,dc:beat.dc,outcome,
      result:beat.outcomes[outcome],growthText,
      scoreAfter:state.scores[attemptedAbility]
    });

    saveState();
    render();
  }

  function resolveBeat(chapter,beat,attemptedAbility,roll1,roll2=null,advantage=false,advantageReason="",lessonAbility=null) {
    const key=chapter.id+":"+beat.id;
    if(state.resolvedBeats[key]) return {done:true};
    if(!ABILITIES.includes(attemptedAbility)) return {error:"Choose an approach."};
    if(!Number.isInteger(roll1)||roll1<1||roll1>20) return {error:"Enter the first d20 result from 1 to 20."};
    if(advantage && (!Number.isInteger(roll2)||roll2<1||roll2>20)) return {error:"Advantage requires two d20 results from 1 to 20."};
    if(advantage && String(advantageReason||"").trim().length<5) return {error:"Record the specific character or scene reason that earned Advantage."};

    const keptRoll=advantage?Math.max(roll1,roll2):roll1;
    const total=keptRoll+mod(state.scores[attemptedAbility]);
    const outcome=outcomeFor(keptRoll,total,beat.dc);
    const rollData={roll1,roll2:advantage?roll2:null,keptRoll,advantage:Boolean(advantage),advantageReason:String(advantageReason||"").trim(),total};

    if((outcome==="failure"||outcome==="criticalFailure") && !lessonAbility) {
      return {needsLesson:true,outcome,total,rollData};
    }

    finalizeBeat(chapter,beat,attemptedAbility,rollData,outcome,lessonAbility);
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
      if(e.type==="yearbook") {
        return '<article class="yearbook-entry"><strong>Age '+e.age+' · Yearbook</strong><p><b>Memory:</b> '+esc(e.memory)+'</p>'+
          (e.relationship?'<p><b>Relationship:</b> '+esc(e.relationship)+'</p>':"")+
          (e.aspiration?'<p><b>Aspiration:</b> '+esc(e.aspiration)+'</p>':"")+
          (e.interlude?'<p><b>Between the years:</b> '+esc(e.interlude)+'</p>':"")+
          '</article>';
      }
      const lesson=e.lessonAbility?' · lesson: '+e.lessonAbility:"";
      const rollText=e.advantage
        ? 'Advantage ['+e.roll1+', '+e.roll2+'] → '+e.roll
        : 'd20 '+e.roll;
      const advantageText=e.advantageReason?'<p><b>Advantage:</b> '+esc(e.advantageReason)+'</p>':"";
      return '<article><strong>Age '+e.age+' · '+esc(e.chapter)+'</strong><span>'+esc(e.beat)+' — '+e.ability+
        ' · '+rollText+' '+signed(e.total-e.roll)+' = '+e.total+' vs DC '+e.dc+
        ' · '+labelOutcome(e.outcome)+lesson+'</span>'+advantageText+'<p>'+esc(e.growthText||"")+'</p><p>'+esc(e.result)+'</p></article>';
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
      const rollText=done.advantage?'Advantage ['+done.roll1+', '+done.roll2+'] → '+done.roll:'d20 '+done.roll;
      const advantageReason=done.advantageReason?'<p><b>Advantage earned:</b> '+esc(done.advantageReason)+'</p>':"";
      return '<article class="growth-beat done"><p class="beat-index">Growth '+(index+1)+' of 3 · complete</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="resolved"><b>'+done.attemptedAbility+' · '+labelOutcome(done.outcome)+'</b><span>'+rollText+' → total '+done.total+' vs DC '+beat.dc+' · '+esc(growth)+'</span>'+advantageReason+'<p>'+esc(beat.outcomes[done.outcome])+'</p></div></article>';
    }

    const approaches=ABILITIES.map(a=>
      '<button type="button" class="approach" data-ability="'+a+'" data-beat="'+esc(beat.id)+'"><b>'+a+'</b><span>'+esc(beat.approaches[a])+'</span></button>'
    ).join("");

    return '<article class="growth-beat"><p class="beat-index">Growth '+(index+1)+' of 3 · DC '+beat.dc+'</p><h3>'+esc(beat.title)+'</h3><p>'+esc(beat.prompt)+'</p><div class="approach-grid">'+approaches+'</div><div class="roll-box" id="roll-'+esc(beat.id)+'" hidden><label>Chosen approach <strong class="chosen-ability"></strong></label><label class="advantage-toggle"><input class="advantage-check" type="checkbox"> Character Advantage earned</label><div class="advantage-fields" hidden><label>Why this earned Advantage <input class="advantage-reason" type="text" maxlength="180" placeholder="Bond, fear, mentor lesson, prior history, scene feature, meaningful risk…"></label></div><div class="dice-entry"><label>First d20 <input class="d20-input d20-first" type="number" min="1" max="20" inputmode="numeric" placeholder="1–20"></label><label class="second-d20" hidden>Second d20 <input class="d20-input d20-second" type="number" min="1" max="20" inputmode="numeric" placeholder="1–20"></label></div><button type="button" class="button ember resolve-roll">Resolve developmental check</button><p class="muted">Base checks are intentionally hard. Ground the action in who the character is or what they have learned to earn Advantage. Success earns flexible growth; failure earns an off-path lesson; critical success earns an extra point; critical failure can redirect invested growth.</p><div class="lesson-picker" hidden></div></div></article>';
  }

  function showLessonPicker(chapter,beat,box,attemptedAbility,rollData,outcome,total) {
    const host=box.querySelector(".lesson-picker");
    const options=ABILITIES.filter(a=>a!==attemptedAbility);
    host.hidden=false;
    host.innerHTML='<div class="zero-house-note"><strong>'+labelOutcome(outcome)+'. What did the character learn instead?</strong><br>Choose a different ability justified by the consequence. The lesson point is locked there.'+
      (outcome==="criticalFailure"&&state.invested[attemptedAbility]>0
        ? ' One already-invested '+attemptedAbility+' point will also shift to that ability.'
        : '')+'</div><div class="lesson-actions">'+
      options.map(a=>'<button type="button" class="button small secondary choose-lesson" data-lesson="'+a+'">'+a+' — '+esc(campaign.development.abilityGuide[a])+'</button>').join("")+
      '</div>';

    host.querySelectorAll(".choose-lesson").forEach(btn=>{
      btn.onclick=()=>finalizeBeat(chapter,beat,attemptedAbility,rollData,outcome,btn.dataset.lesson);
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

    document.querySelectorAll(".advantage-check").forEach(check=>check.addEventListener("change",()=>{
      const box=check.closest(".roll-box");
      box.querySelector(".advantage-fields").hidden=!check.checked;
      box.querySelector(".second-d20").hidden=!check.checked;
      if(!check.checked) {
        box.querySelector(".advantage-reason").value="";
        box.querySelector(".d20-second").value="";
      }
    }));

    document.querySelectorAll(".resolve-roll").forEach(btn=>btn.addEventListener("click",()=>{
      const box=btn.closest(".roll-box");
      const beatId=box.id.replace(/^roll-/,"");
      const beat=chapter.growthBeats.find(x=>x.id===beatId);
      const ability=box.dataset.ability;
      const advantage=box.querySelector(".advantage-check").checked;
      const roll1=Number(box.querySelector(".d20-first").value);
      const roll2=advantage?Number(box.querySelector(".d20-second").value):null;
      const reason=advantage?box.querySelector(".advantage-reason").value:"";
      const result=resolveBeat(chapter,beat,ability,roll1,roll2,advantage,reason);
      if(result?.error) {
        alert(result.error);
        return;
      }
      if(result?.needsLesson) showLessonPicker(chapter,beat,box,ability,result.rollData,result.outcome,result.total);
    }));
  }

  function yearbookRecord(chapter) {
    const existing=state.yearbook[chapter.id]||{};
    return {
      memory:existing.memory||"",
      relationship:existing.relationship||"",
      aspirationStatus:existing.aspirationStatus||"",
      aspiration:existing.aspiration||state.identity.aspiration||"",
      villageNote:existing.villageNote||"",
      interlude:existing.interlude||""
    };
  }

  function yearbookComplete(chapter) {
    const y=yearbookRecord(chapter);
    return y.memory.trim().length>=10 && ["same","changed"].includes(y.aspirationStatus);
  }

  function saveYearbook(chapter) {
    const host=$("yearbook-host");
    if(!host) return false;
    const memory=host.querySelector("[data-yearbook='memory']")?.value.trim()||"";
    const relationship=host.querySelector("[data-yearbook='relationship']")?.value.trim()||"";
    const aspirationStatus=host.querySelector("[data-yearbook='aspirationStatus']")?.value||"";
    const aspiration=host.querySelector("[data-yearbook='aspiration']")?.value.trim()||state.identity.aspiration||"";
    const villageNote=host.querySelector("[data-yearbook='villageNote']")?.value.trim()||"";
    const interlude=host.querySelector("[data-yearbook='interlude']")?.value.trim()||"";

    if(memory.length<10) {
      alert("Record at least one sentence about what your character remembers from this year.");
      return false;
    }
    if(!["same","changed"].includes(aspirationStatus)) {
      alert("Choose whether the character's aspiration stayed the same or changed.");
      return false;
    }
    if(aspirationStatus==="changed" && aspiration.length<3) {
      alert("Write the new thing your character is striving to become.");
      return false;
    }

    state.yearbook[chapter.id]={memory,relationship,aspirationStatus,aspiration,villageNote,interlude};
    if(aspirationStatus==="changed") state.identity.aspiration=aspiration;

    state.timeline=state.timeline.filter(e=>!(e.type==="yearbook"&&e.chapterId===chapter.id));
    state.timeline.push({
      type:"yearbook",chapterId:chapter.id,age:chapter.age,chapter:chapter.title,
      memory,relationship,aspiration:aspirationStatus==="same"?(state.identity.aspiration||"Unchanged"):aspiration,
      villageNote,interlude
    });
    saveState();
    bindIdentity();
    render();
    return true;
  }

  function renderYearbook(chapter,used) {
    const host=$("yearbook-host");
    if(!host) return;
    if(used!==campaign.development.pointsPerChapter && used!==3) {
      host.innerHTML='<p class="muted">Finish all three Growth Beats before closing this year.</p>';
      return;
    }

    const y=yearbookRecord(chapter);
    const transition=campaign.continuity?.betweenYears?.find(x=>x.afterAge===chapter.age);
    const village=campaign.continuity?.villageTimeline?.find(x=>x.age===chapter.age);
    const aspirationNow=state.identity.aspiration||"";

    host.innerHTML='<div class="yearbook-card"><p class="eyebrow ember">YEARBOOK · STORY ONLY · NO DEVELOPMENT POINTS</p>'+
      '<h3>What changed at age '+chapter.age+'?</h3>'+
      '<p class="muted">These answers become character history and may later support Character Advantage when they actually matter to a scene.</p>'+
      '<label>What will your character still remember from this year?<textarea data-yearbook="memory" rows="2" placeholder="One concrete memory…">'+esc(y.memory)+'</textarea></label>'+
      '<label>Which relationship changed most?<textarea data-yearbook="relationship" rows="2" placeholder="Friend, rival, family, mentor…">'+esc(y.relationship)+'</textarea></label>'+
      '<label>Are you still striving to become the same thing?<select data-yearbook="aspirationStatus"><option value="">Choose…</option><option value="same"'+(y.aspirationStatus==="same"?" selected":"")+'>Yes — the aspiration is still mine</option><option value="changed"'+(y.aspirationStatus==="changed"?" selected":"")+'>No — it changed this year</option></select></label>'+
      '<label>Current aspiration<textarea data-yearbook="aspiration" rows="2">'+esc(y.aspiration||aspirationNow)+'</textarea></label>'+
      (village?'<div class="village-change"><b>Hearthcross this year:</b> '+esc(village.ambientChange)+'<br><span>'+esc(village.choiceSensitive)+'</span></div>':"")+
      '<label>What change in Hearthcross matters to your character?<textarea data-yearbook="villageNote" rows="2">'+esc(y.villageNote)+'</textarea></label>'+
      (transition?'<div class="between-years"><p class="eyebrow">BETWEEN THE YEARS · '+esc(transition.title)+'</p><p>'+esc(transition.prompt)+'</p><p class="muted">'+esc(transition.villageChange)+'</p><label>Your small memory<textarea data-yearbook="interlude" rows="2" placeholder="Optional, but useful later…">'+esc(y.interlude)+'</textarea></label></div>':"")+
      '<button type="button" class="button secondary" id="save-yearbook">Save yearbook entry</button>'+
      (yearbookComplete(chapter)?'<span class="yearbook-saved">Yearbook complete ✓</span>':"")+
      '</div>';

    const save=$("save-yearbook");
    if(save) save.onclick=()=>saveYearbook(chapter);
  }

  function renderQuest() {
    const chapter=campaign.chapters[state.chapterIndex];
    if(!chapter) {
      $("quest-title").textContent="Origin campaign complete";
      $("quest-objective").textContent="Spend any remaining Development Points, then freeze your Level-0 array for graduation.";
      $("beat-host").innerHTML="";
      $("yearbook-host").innerHTML="";
      $("advance-year").hidden=true;
      $("graduation-panel").hidden=false;
      return;
    }

    $("quest-age").textContent="Age "+chapter.age;
    $("quest-title").textContent=chapter.title;
    $("quest-life-event").textContent=chapter.lifeEvent+" · "+chapter.tone;
    $("quest-group").textContent=chapter.groupActivity;
    $("quest-objective").textContent=chapter.objective;
    $("quest-pressure").textContent=chapter.pressure;
    $("quest-choice").textContent=chapter.choice;
    $("quest-consequence").textContent=chapter.consequence;
    $("group-resolution-note").textContent=campaign.continuity?.growthBeatParticipation?.rule||"";
    $("beat-host").innerHTML=chapter.growthBeats.map((b,i)=>renderBeat(chapter,b,i)).join("");

    const used=Number(state.chapterGrowth[chapter.id]||0);
    renderYearbook(chapter,used);
    const next=$("advance-year");
    next.hidden=false;
    next.disabled=used!==3 || !yearbookComplete(chapter);
    next.textContent=chapter.age===18?"Complete Level 0 →":"Finish age "+chapter.age+" → age "+(chapter.age+1);
    next.onclick=()=>{
      if(used!==3 || !yearbookComplete(chapter)) return;
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

  function brief(value,max=180) {
    const textValue=String(value||"").trim();
    return textValue.length>max ? textValue.slice(0,max-1).trimEnd()+"…" : textValue;
  }

  function graduationOutcomeCounts() {
    const rows=Object.values(state.resolvedBeats||{});
    return {
      criticalSuccess:rows.filter(x=>x.outcome==="criticalSuccess").length,
      success:rows.filter(x=>x.outcome==="success").length,
      failure:rows.filter(x=>x.outcome==="failure").length,
      criticalFailure:rows.filter(x=>x.outcome==="criticalFailure").length
    };
  }

  function graduationTier(value) {
    return value>Number(campaign.development.minimumGraduationValue||27)
      ? "Heroic / house-rule ability generation"
      : "Full baseline development";
  }

  function renderGraduationKeepsakes() {
    const host=$("graduation-keepsakes");
    if(!host) return;

    const complete=state.chapterIndex>=campaign.chapters.length;
    const value=baseArrayCost();
    const floor=Number(campaign.development.minimumGraduationValue||27);
    const ceiling=maximumArrayValue();
    const ready=complete && value>=floor && value<=ceiling && totalLessonWallet()===0 && Boolean(state.graduationEdition);

    host.hidden=!ready;
    if(!ready) return;

    const keepsake=campaign.graduationKeepsakes;
    const name=state.identity.name.trim()||"Unnamed Character";
    const ancestry=state.identity.ancestry.trim()||"Unrecorded ancestry / species";
    const family=state.identity.family.trim()||"Family / guardians not recorded";
    const aspiration=state.identity.aspiration.trim()||"The road ahead is still being discovered.";
    const edition=state.graduationEdition;
    const tier=graduationTier(value);
    const counts=graduationOutcomeCounts();

    $("certificate-title").textContent=keepsake.certificateTitle;
    $("certificate-name").textContent=name;
    $("certificate-copy").textContent=name+" of Hearthcross, having grown from age 12 to age 18 through seven years of shared village life, has completed the From Zero to Hero origin years and stands ready for certified Level-1 creation under the "+edition+" ruleset.";
    $("certificate-array").innerHTML=ABILITIES.map(a=>'<div><span>'+a+'</span><strong>'+state.scores[a]+'</strong></div>').join("");
    $("certificate-details").innerHTML=
      '<div><span>Home</span><strong>Hearthcross</strong></div>'+
      '<div><span>Ancestry / species</span><strong>'+esc(ancestry)+'</strong></div>'+
      '<div><span>Ruleset</span><strong>'+esc(edition)+'</strong></div>'+
      '<div><span>Base-array value</span><strong>'+value+' / '+ceiling+'</strong></div>'+
      '<div><span>Origin result</span><strong>'+esc(tier)+'</strong></div>'+
      '<div><span>Critical successes</span><strong>'+counts.criticalSuccess+'</strong></div>';
    $("certificate-aspiration").innerHTML='<span>At the threshold of adventure:</span> “'+esc(brief(aspiration,220))+'”';
    $("certificate-signatures").innerHTML=keepsake.signatureLines.map(label=>'<div><span></span><small>'+esc(label)+'</small></div>').join("");
    $("certificate-boundary").textContent=campaign.graduationKeepsakes.ruleBoundary;

    $("chronicle-subtitle").textContent=name+" · Hearthcross · Ages 12–18 · "+edition+" graduation path";
    $("chronicle-identity").innerHTML=
      '<div><span>Family / guardians</span><strong>'+esc(brief(family,120))+'</strong></div>'+
      '<div><span>Childhood work</span><strong>'+esc(brief(state.identity.chores,120)||"Not recorded")+'</strong></div>'+
      '<div><span>Final aspiration</span><strong>'+esc(brief(aspiration,160))+'</strong></div>'+
      '<div><span>Final base array</span><strong>'+ABILITIES.map(a=>a+" "+state.scores[a]).join(" · ")+' · '+value+' points</strong></div>';

    $("chronicle-years").innerHTML=campaign.chapters.map(chapter=>{
      const y=state.yearbook?.[chapter.id]||{};
      const parts=[];
      if(y.relationship) parts.push("Relationship: "+brief(y.relationship,110));
      if(y.aspirationStatus==="changed"&&y.aspiration) parts.push("Aspiration changed: "+brief(y.aspiration,110));
      if(y.interlude) parts.push("Between years: "+brief(y.interlude,110));
      return '<article><div class="chronicle-year-label"><b>Age '+chapter.age+'</b><span>'+esc(chapter.title)+'</span></div>'+
        '<p>'+esc(brief(y.memory,190)||"No memory recorded.")+'</p>'+
        (parts.length?'<small>'+esc(parts.join(" · "))+'</small>':"")+
        '</article>';
    }).join("");

    $("chronicle-people").innerHTML=
      '<p><b>Relationships:</b> '+esc(brief(state.identity.relationships,300)||"Not recorded")+'</p>'+
      '<p><b>Reputation / scars:</b> '+esc(brief(state.identity.reputation,240)||"Not recorded")+'</p>'+
      '<p><b>Values:</b> '+esc(brief(state.identity.values,220)||"Not recorded")+'</p>'+
      '<p><b>Fears:</b> '+esc(brief(state.identity.fears,180)||"Not recorded")+'</p>';

    $("chronicle-growth").innerHTML=
      '<p><b>Training / familiarities:</b> '+esc(brief(state.identity.training,280)||"Not recorded")+'</p>'+
      '<p><b>Possessions / heirloom history:</b> '+esc(brief(state.identity.possessions,280)||"Not recorded")+'</p>'+
      '<p><b>Important choices:</b> '+esc(brief(state.identity.choices,280)||"Not recorded")+'</p>';

    $("chronicle-outcomes").innerHTML=
      '<div><strong>'+counts.criticalSuccess+'</strong><span>critical successes</span></div>'+
      '<div><strong>'+counts.success+'</strong><span>successes</span></div>'+
      '<div><strong>'+counts.failure+'</strong><span>hard lessons</span></div>'+
      '<div><strong>'+counts.criticalFailure+'</strong><span>critical failures</span></div>'+
      '<div><strong>'+state.criticalBonusEarned+'</strong><span>critical bonus DP earned</span></div>'+
      '<div><strong>'+value+'</strong><span>final point-buy value</span></div>';
    $("chronicle-boundary").textContent=campaign.graduationKeepsakes.ruleBoundary;
  }

  function printZeroHero(mode) {
    const classes=["print-growth","print-certificate","print-graduation-packet"];
    classes.forEach(c=>document.body.classList.remove(c));
    document.body.classList.add(mode);
    const cleanup=()=>{
      classes.forEach(c=>document.body.classList.remove(c));
      window.removeEventListener("afterprint",cleanup);
    };
    window.addEventListener("afterprint",cleanup);
    window.print();
  }

  function renderGraduation() {
    if(state.chapterIndex<campaign.chapters.length) {
      if($("graduation-keepsakes")) $("graduation-keepsakes").hidden=true;
      return;
    }

    const value=baseArrayCost();
    const floor=Number(campaign.development.minimumGraduationValue||27);
    const ceiling=maximumArrayValue();
    const over=Math.max(0,value-floor);
    const shortfall=Math.max(0,floor-value);
    const pending=totalPendingInvestedProgress();
    const lessons=totalLessonWallet();
    const cappedLessons=cappedLessonPoints();
    const unspent=totalWallet();
    const audit=$("raw-audit");
    const reflection=$("reflection-host");
    const ready=value>=floor && value<=ceiling && lessons===0;

    audit.innerHTML='<h3>Ability-generation audit</h3><p><strong>Current base array point-buy value: '+value+'.</strong> Zero-to-Hero range: <strong>'+floor+'–'+ceiling+'</strong>.</p>'+
      (shortfall
        ? '<p class="zero-house-note"><strong>'+shortfall+' point'+(shortfall===1?'':'s')+' still need to become ability scores.</strong> Critical failures can redirect development, but they can never make the finished character fall below the '+floor+'-point floor.</p>'
        : over
          ? '<p class="zero-house-note"><strong>Heroic / house-rule ability generation:</strong> this is '+over+' point'+(over===1?'':'s')+' above the '+floor+'-point floor because critical-success bonus growth was spent. The absolute Level-0 cap is '+ceiling+'.</p>'
          : '<p class="zero-house-note"><strong>Minimum development secured:</strong> the character has reached the full '+floor+'-point floor. Critical-success growth can raise it only as high as '+ceiling+'.</p>');

    let settleButton="";
    if(pending>0 || cappedLessons>0) {
      settleButton='<button type="button" class="button small secondary" id="settle-maturity">Return stranded growth to flexible pool</button>';
    }

    reflection.innerHTML='<p><strong>Unspent wallet:</strong> '+state.wallet.flexible+' flexible · '+lessons+' lesson. <strong>Partial invested progress:</strong> '+pending+'.</p>'+
      (lessons
        ? '<p class="muted">Spend remaining Lesson Points in their tagged abilities. If a lesson is blocked by the 15 cap, the settlement control converts only that stranded lesson to flexible growth.</p>'
        : shortfall
          ? '<p class="muted">Spend flexible points until the base array reaches at least '+floor+'. The character cannot graduate below that floor.</p>'
          : value>=ceiling
            ? '<p class="muted">The '+ceiling+'-point stat cap is reached. Any remaining Development Points stay recorded but cannot increase the base ability array or become hidden Level-1 bonuses.</p>'
            : unspent||pending
              ? '<p class="muted">The minimum is secured. Extra earned growth may be spent only while the base array remains at or below '+ceiling+'. Unspent growth never becomes a hidden Level-1 bonus.</p>'
              : '<p class="muted">All earned development is currently reflected in the ability array.</p>')+
      settleButton;

    const settle=$("settle-maturity");
    if(settle) settle.onclick=settleMaturityCredits;

    const showEdition=ed=>{
      const g=campaign.graduation[ed];
      $("graduation-summary").innerHTML='<h3>'+ed+' graduation contract</h3><ol>'+g.order.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><p><strong>Frozen Level-0 base array ('+baseArrayCost()+' point-buy value):</strong> '+ABILITIES.map(a=>a+' '+state.scores[a]).join(" · ")+'</p><p class="zero-house-note"><strong>27-point minimum · 30-point maximum:</strong> failures can reshape the character, and critical successes can make the array exceptional, but Level-0 stat development can never leave the '+floor+'–'+ceiling+' range.</p><p class="zero-house-note"><strong>Rules boundary:</strong> From Zero to Hero determines the base scores. From this point forward, species/race, background, class, HP, proficiency, spells, feats, equipment and later advancement use the selected '+ed+' rules only. Training, mentors and heirlooms stay narrative unless a legal rule or explicitly enabled house rule grants mechanics.</p><p><strong>Graduation keepsakes unlocked:</strong> the Hearthcross certificate and Origin Chronicle below are commemorative only.</p>';
    };

    document.querySelectorAll("[data-edition]").forEach(btn=>{
      btn.disabled=!ready;
      btn.classList.toggle("selected",state.graduationEdition===btn.dataset.edition);
      btn.onclick=()=>{
        if(!ready) return;
        const ed=btn.dataset.edition;
        state.graduationEdition=ed;
        saveState();
        showEdition(ed);
        renderGraduationKeepsakes();
      };
    });

    if(ready && state.graduationEdition && campaign.graduation[state.graduationEdition]) {
      showEdition(state.graduationEdition);
    }
    renderGraduationKeepsakes();
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

    $("print-growth").onclick=()=>printZeroHero("print-growth");
    $("print-certificate").onclick=()=>printZeroHero("print-certificate");
    $("print-graduation-packet").onclick=()=>printZeroHero("print-graduation-packet");
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
