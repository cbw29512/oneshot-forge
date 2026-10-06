(() => {
  "use strict";

  const STORAGE_KEY = "oneshot-forge:zero-hero-adventure:v1";
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  let adventure;
  let core;
  let state = {chapterIndex:0, beatIndex:0, partySize:4};

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Number.isInteger(saved.chapterIndex) && Number.isInteger(saved.beatIndex) && [3,4,5,6].includes(Number(saved.partySize))) {
        state = {chapterIndex:saved.chapterIndex, beatIndex:saved.beatIndex, partySize:Number(saved.partySize)};
      }
    } catch {}
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function coreChapter(id) {
    return core.chapters.find(c => c.id === id);
  }

  function coreBeat(chapterId, beatId) {
    return coreChapter(chapterId)?.growthBeats?.find(b => b.id === beatId);
  }

  function absoluteBeatIndex() {
    let total = 0;
    for (let i=0; i<state.chapterIndex; i++) total += adventure.chapters[i].beats.length;
    return total + state.beatIndex;
  }

  function spotlightOrder() {
    const size = state.partySize;
    const start = absoluteBeatIndex() % size;
    const order = [];
    for (let i=0;i<size;i++) order.push("Player " + (((start+i)%size)+1));
    return order;
  }

  function renderChapters() {
    $("chapter-list").innerHTML = adventure.chapters.map((chapter,index) =>
      '<button type="button" class="chapter-jump '+(index===state.chapterIndex?"active":"")+'" data-index="'+index+'">'+
      '<span>Age '+chapter.age+'</span><strong>'+esc(chapter.title)+'</strong></button>'
    ).join("");
    document.querySelectorAll(".chapter-jump").forEach(btn => {
      btn.onclick = () => {
        state.chapterIndex = Number(btn.dataset.index);
        state.beatIndex = 0;
        saveState();
        render();
        window.scrollTo({top:0,behavior:"smooth"});
      };
    });
  }

  function renderParty() {
    $("party-size").value = String(state.partySize);
    const scaling = adventure.tableContract.scaling[String(state.partySize)];
    $("party-scaling").textContent = state.partySize === 4
      ? "Default procedure: four distinct player checks in every Growth Beat."
      : scaling;
  }

  function renderChapter() {
    const chapter = adventure.chapters[state.chapterIndex];
    $("chapter-age").textContent = "AGE " + chapter.age;
    $("chapter-title").textContent = chapter.title;
    $("chapter-progress").textContent = "Chapter "+(state.chapterIndex+1)+" of "+adventure.chapters.length;
    $("chapter-goal").textContent = chapter.sessionGoal;
    $("chapter-opening").textContent = chapter.openingReadAloud;
    $("chapter-opening-steps").innerHTML = chapter.dmOpening.map(step => "<li>"+esc(step)+"</li>").join("");
    $("chapter-close-readaloud").textContent = chapter.closeReadAloud;
    $("yearbook-focus").textContent = chapter.yearbookFocus;
    renderChapters();
  }

  function renderBeat() {
    const chapter = adventure.chapters[state.chapterIndex];
    const beat = chapter.beats[state.beatIndex];
    const source = coreBeat(chapter.id, beat.growthBeatId);
    if (!source) throw new Error("Missing core Growth Beat "+chapter.id+" / "+beat.growthBeatId);

    $("beat-progress").textContent = "Growth Beat "+(state.beatIndex+1)+" of "+chapter.beats.length;
    $("beat-title").textContent = beat.title;
    $("beat-minutes").textContent = beat.minutes+" min";
    $("beat-purpose").textContent = beat.purpose;
    $("beat-location").textContent = beat.location || "";
    $("beat-readaloud").textContent = beat.readAloud;
    $("beat-runsteps").innerHTML = beat.runSteps.map(step => "<li>"+esc(step)+"</li>").join("");
    $("scrapbook-prompt").textContent = beat.scrapbookPrompt;
    $("beat-consequence").textContent = beat.consequence;
    $("advance-when").textContent = beat.advanceWhen || "When every player has acted and the scene's main problem is resolved.";
    $("four-player-jobs").innerHTML = (beat.fourPlayerJobs||[]).map((job,i)=>'<article><span>'+(state.partySize===3&&i===3?'NPC (3 players)':'Player '+(i+1))+'</span><p>'+esc(job)+'</p></article>').join("") + (state.partySize===3&&beat.threePlayerAdjustment?'<p class="muted three-player-note">'+esc(beat.threePlayerAdjustment)+'</p>':'');
    $("npc-dialogue").innerHTML = (beat.npcDialogue||[]).map(npc=>
      '<article><h3>'+esc(npc.npc)+'</h3><p class="muted">'+esc(npc.voice||"")+'</p><ul>'+((npc.lines||[]).map(line=>'<li>“'+esc(line)+'”</li>').join(""))+'</ul></article>'
    ).join("") || '<p class="muted">No featured NPC dialogue in this beat.</p>';
    $("mystery-clues").innerHTML = (beat.mysteryClues||[]).map(clue=>'<li>'+esc(clue)+'</li>').join("") || '<li>No hidden Watchstone clue in this beat.</li>';
    $("beat-branches").innerHTML = (beat.branches||[]).map(branch=>'<li>'+esc(branch)+'</li>').join("") || '<li>Carry the recorded consequence forward.</li>';

    const order = spotlightOrder();
    $("spotlight-order").innerHTML =
      '<strong>Start with '+esc(order[0])+'.</strong> Then '+order.slice(1).map(esc).join(" → ")+'.';

    $("growth-reference-title").textContent = source.title;
    $("growth-dc").textContent = "DC "+source.dc;
    $("growth-prompt").textContent = source.prompt;
    $("growth-approaches").innerHTML = ["STR","DEX","CON","INT","WIS","CHA"].map(a =>
      '<article><b>'+a+'</b><p>'+esc(source.approaches[a])+'</p></article>'
    ).join("");
    $("growth-outcomes").innerHTML = [
      ["Critical success",source.outcomes.criticalSuccess],
      ["Success",source.outcomes.success],
      ["Failure",source.outcomes.failure],
      ["Critical failure",source.outcomes.criticalFailure]
    ].map(([label,text]) => '<article><b>'+esc(label)+'</b><p>'+esc(text)+'</p></article>').join("");

    const absolute = absoluteBeatIndex();
    $("absolute-progress").textContent = (absolute+1)+" / 21";
    $("prev-beat").disabled = absolute === 0;
    $("next-beat").textContent = absolute === 20 ? "Final year complete" : (state.beatIndex===chapter.beats.length-1 ? "Next year →" : "Next beat →");
  }

  function renderReference() {
    $("mystery-truth").textContent = adventure.campaignMystery?.dmTruth || "";
    $("mystery-theme").textContent = adventure.campaignMystery?.theme || "";
    $("mystery-no-villain").textContent = adventure.campaignMystery?.noVillainRule || "";
    $("clue-ladder").innerHTML = (adventure.campaignMystery?.clueLadder||[]).map(clue=>
      '<article><strong>Age '+clue.age+'</strong><p>'+esc(clue.clue)+'</p><small><b>Now:</b> '+esc(clue.meaningNow)+'<br><b>Later:</b> '+esc(clue.meaningLater)+'</small></article>'
    ).join("");
    $("six-purpose").textContent = adventure.hearthcrossSix.purpose;
    $("six-grid").innerHTML = adventure.hearthcrossSix.contests.map(c =>
      '<article><span>'+esc(c.ability)+'</span><strong>'+esc(c.name)+'</strong></article>'
    ).join("");
    $("gm-audit").innerHTML = adventure.gmAuditChecklist.map(x => "<li>"+esc(x)+"</li>").join("");
  }

  function render() {
    state.chapterIndex = Math.max(0,Math.min(state.chapterIndex,adventure.chapters.length-1));
    const beats = adventure.chapters[state.chapterIndex].beats;
    state.beatIndex = Math.max(0,Math.min(state.beatIndex,beats.length-1));
    renderParty();
    renderChapter();
    renderBeat();
    renderReference();
    saveState();
  }

  function move(delta) {
    let absolute = absoluteBeatIndex() + delta;
    absolute = Math.max(0, Math.min(20, absolute));
    let cursor = 0;
    for (let ci=0; ci<adventure.chapters.length; ci++) {
      const count = adventure.chapters[ci].beats.length;
      if (absolute < cursor + count) {
        state.chapterIndex = ci;
        state.beatIndex = absolute - cursor;
        break;
      }
      cursor += count;
    }
    render();
    $("scene-card").scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function init() {
    const [adventureRes,coreRes] = await Promise.all([
      fetch("data/zero-to-hero/hearthcross-years.adventure.json",{cache:"no-store"}),
      fetch("data/zero-to-hero/from-zero-to-hero.json",{cache:"no-store"})
    ]);
    if (!adventureRes.ok || !coreRes.ok) throw new Error("Could not load Zero to Hero adventure data.");
    adventure = await adventureRes.json();
    core = await coreRes.json();
    loadState();

    $("party-size").onchange = () => {
      state.partySize = Number($("party-size").value);
      saveState();
      render();
    };
    $("prev-beat").onclick = () => move(-1);
    $("next-beat").onclick = () => move(1);
    $("print-chapter").onclick = () => window.print();
    $("reset-adventure").onclick = () => {
      if (!confirm("Reset the DM adventure runner to age 12, Growth Beat 1? Player Growth Sheets are not affected.")) return;
      state = {chapterIndex:0,beatIndex:0,partySize:4};
      saveState();
      render();
    };

    render();
  }

  init().catch(err => {
    document.querySelector(".zero-adventure-shell").innerHTML =
      '<section class="panel"><h1>Adventure could not load</h1><p>'+esc(err.message)+'</p></section>';
  });
})();