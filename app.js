const ADVENTURE_PACKS = window.ONE_SHOT_ADVENTURES;
if (!ADVENTURE_PACKS) throw new Error("Adventure registry failed to load.");
const DEFAULT_ADVENTURE = ADVENTURE_PACKS["the-lantern-below"];
const PACKAGE_PREFIX = "oneshot-forge:package:";
const STATE_PREFIX = "oneshot-forge:state:";
const LIBRARY_KEY = "oneshot-forge:library";
const LAST_ADVENTURE_KEY = "oneshot-forge:last-adventure";

let adventure = null;
let state = null;
let currentAdventureKey = "";
let selectedNpcId = null;
let rulesetPregens = null;

const el = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));

function safeGet(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    toast("Browser storage is full or unavailable.");
    return false;
  }
}

function safeRemove(key) {
  try { localStorage.removeItem(key); }
  catch {}
}

function stateKey(id=currentAdventureKey) {
  return STATE_PREFIX + id;
}

function packageKey(id=currentAdventureKey) {
  return PACKAGE_PREFIX + id;
}

function toast(message) {
  const node = el("toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
}

function uniqueIds(values, label) {
  const ids = new Set();
  for (const value of values) {
    if (!value || typeof value.id !== "string" || !value.id) throw new Error(label + " contains an item without an id.");
    if (ids.has(value.id)) throw new Error(label + " contains duplicate id " + value.id + ".");
    ids.add(value.id);
  }
  return ids;
}

function validatePackage(pkg) {
  if (!pkg || typeof pkg !== "object") throw new Error("Adventure package must be an object.");
  const required = ["schemaVersion","metadata","quest","truth","npcs","locations","scenes","clues","encounters","maps","recovery","pacing","endings","initialState"];
  const missing = required.filter(key => !(key in pkg));
  if (missing.length) throw new Error("Adventure package is missing: " + missing.join(", "));
  if (pkg.schemaVersion !== "0.1.0") throw new Error("Unsupported adventure schema version: " + pkg.schemaVersion);
  if (!pkg.metadata?.id || !pkg.metadata?.title) throw new Error("Adventure metadata requires id and title.");
  if (!Array.isArray(pkg.scenes) || !pkg.scenes.length) throw new Error("Adventure package has no scenes.");
  if (!Array.isArray(pkg.npcs) || !Array.isArray(pkg.clues) || !Array.isArray(pkg.encounters) || !Array.isArray(pkg.locations)) {
    throw new Error("Adventure NPC, clue, encounter, and location collections must be arrays.");
  }

  const sceneIds = uniqueIds(pkg.scenes, "Scenes");
  const npcIds = uniqueIds(pkg.npcs, "NPCs");
  const clueIds = uniqueIds(pkg.clues, "Clues");
  const encounterIds = uniqueIds(pkg.encounters, "Encounters");
  const locationIds = uniqueIds(pkg.locations, "Locations");

  for (const clue of pkg.clues) {
    if (!Array.isArray(clue.sources) || !clue.sources.length) throw new Error("Clue " + clue.id + " has no delivery source.");
    if (clue.required && clue.sources.length < 2) throw new Error("Required clue " + clue.id + " needs at least two delivery sources.");
  }

  for (const scene of pkg.scenes) {
    if (scene.locationId && !locationIds.has(scene.locationId)) throw new Error("Scene " + scene.id + " references missing location " + scene.locationId + ".");
    for (const id of scene.npcIds || []) if (!npcIds.has(id)) throw new Error("Scene " + scene.id + " references missing NPC " + id + ".");
    for (const id of scene.clueIds || []) if (!clueIds.has(id)) throw new Error("Scene " + scene.id + " references missing clue " + id + ".");
    for (const id of scene.encounterIds || []) if (!encounterIds.has(id)) throw new Error("Scene " + scene.id + " references missing encounter " + id + ".");
    for (const id of scene.exits || []) if (!sceneIds.has(id)) throw new Error("Scene " + scene.id + " exits to missing scene " + id + ".");
  }

  if (!sceneIds.has(pkg.initialState?.currentSceneId)) throw new Error("Initial state references a missing scene.");
  return true;
}

function readLibrary() {
  const raw = safeGet(LIBRARY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLibrary(entries) {
  safeSet(LIBRARY_KEY, JSON.stringify(entries.slice(0, 20)));
}

function persistPackage(pkg) {
  if (!safeSet(packageKey(pkg.metadata.id), JSON.stringify(pkg))) return;
  const library = readLibrary().filter(item => item.id !== pkg.metadata.id);
  library.unshift({
    id:pkg.metadata.id,
    title:pkg.metadata.title,
    level:pkg.metadata.partyLevel,
    partySize:pkg.metadata.partySize,
    durationMinutes:pkg.metadata.durationMinutes,
    seed:pkg.metadata.seed || "",
    savedAt:Date.now()
  });
  writeLibrary(library);
  safeSet(LAST_ADVENTURE_KEY, pkg.metadata.id);
}

function loadSavedPackage(id) {
  const raw = safeGet(packageKey(id));
  if (!raw) return null;
  try {
    const pkg = JSON.parse(raw);
    validatePackage(pkg);
    return pkg;
  } catch {
    return null;
  }
}

function loadState() {
  const saved = safeGet(stateKey());
  try {
    const raw = saved ? JSON.parse(saved) : clone(adventure.initialState);
    return normalizeState(raw);
  } catch {
    return normalizeState(clone(adventure.initialState));
  }
}

function normalizeState(value) {
  const next = value && typeof value === "object" ? value : clone(adventure.initialState);
  next.questStage = next.questStage === "at-priory" ? "main-location" : (next.questStage || "offered");
  next.discoveredClueIds = Array.isArray(next.discoveredClueIds) ? next.discoveredClueIds : [];
  next.revealedSecretIds = Array.isArray(next.revealedSecretIds) ? next.revealedSecretIds : [];
  next.sceneHistory = Array.isArray(next.sceneHistory) ? next.sceneHistory : [];
  next.npcState = next.npcState || {};
  next.locationState = next.locationState || {};
  next.itemState = next.itemState || {};
  next.eventState = next.eventState || {};
  next.completedRunSteps = next.completedRunSteps || {};
  for (const loc of adventure.locations) {
    if (!next.locationState[loc.id]) next.locationState[loc.id] = {revealed:false};
  }
  return next;
}

function saveState() {
  safeSet(stateKey(), JSON.stringify(state));
  safeSet(LAST_ADVENTURE_KEY, currentAdventureKey);
}

async function fetchPack(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load " + url);
  const pkg = await res.json();
  if (!pkg.quickrun) {
    try {
      const side = await fetch(url.replace(/\.oneshot\.json$/, ".quickrun.json"));
      if (side.ok) pkg.quickrun = await side.json();
    } catch { /* optional sidecar */ }
  }
  if ((!pkg.pregens || !pkg.pregens.length) && pkg.pregenPack) {
    try {
      const pr = await fetch(pkg.pregenPack);
      if (pr.ok) {
        const data = await pr.json();
        pkg.pregens = data.characters || data.pregens || data;
      }
    } catch { /* sheets still work from sheets.html */ }
  }
  return pkg;
}

async function loadInitialAdventure() {
  const wanted = new URLSearchParams(location.search).get("id");
  if (wanted && ADVENTURE_PACKS[wanted]) {
    const lastId = safeGet(LAST_ADVENTURE_KEY);
    if (lastId === wanted) {
      const saved = loadSavedPackage(lastId);
      if (saved) {
        try {
          await activateAdventure(saved, {persist:false});
          toast("Resumed " + (saved.metadata?.title || wanted) + ".");
          return;
        } catch (error) {
          console.warn("Saved pack failed; fetching authored.", error);
        }
      }
    }
    const pkg = await fetchPack(ADVENTURE_PACKS[wanted]);
    await activateAdventure(pkg, { persist: true, fresh: lastId !== wanted });
    return;
  }

  const lastId = safeGet(LAST_ADVENTURE_KEY);
  if (lastId) {
    const saved = loadSavedPackage(lastId);
    if (saved) {
      try {
        await activateAdventure(saved, {persist:false});
        toast("Resumed saved adventure.");
        return;
      } catch (error) {
        console.warn("Saved adventure failed; loading reference.", error);
        safeRemove(LAST_ADVENTURE_KEY);
      }
    }
  }

  const pkg = await fetchPack(DEFAULT_ADVENTURE);
  await activateAdventure(pkg, {persist:true});
}

async function activateAdventure(pkg, options={}) {
  validatePackage(pkg);
  adventure = clone(pkg);
  selectedNpcId = null;
  currentAdventureKey = adventure.metadata.id;
  if (options.persist !== false) persistPackage(adventure);
  if (options.fresh) safeRemove(stateKey());
  state = loadState();

  if (!adventure.scenes.some(scene => scene.id === state.currentSceneId)) {
    state.currentSceneId = adventure.scenes[0].id;
  }

  syncForgeControls();
  await refreshRulesetPregens();
  renderAll();
  saveState();
}

async function refreshRulesetPregens() {
  rulesetPregens = null;
  if (typeof getRuleset !== "function" || getRuleset() !== "2024") return;

  // Never leak the shared level-4 pack into a differently leveled adventure.
  // A non-level-4 adventure must explicitly provide its own 2024 pregen pack.
  const pack = adventure?.pregenPack2024 ||
    (adventure?.metadata?.partyLevel === 4 ? "data/pregens/quiet-seals-level-4-2024-srd.json" : null);
  if (!pack) return;

  try {
    const res = await fetch(pack);
    if (res.ok) rulesetPregens = (await res.json()).characters || [];
  } catch (error) {
    console.error("One-Shot Forge could not load the selected 2024 pregen pack", error);
  }
}

function syncForgeControls() {
  const meta = adventure.metadata || {};
  if (!el("forge-level")) return;
  if (meta.partyLevel) el("forge-level").value = String(meta.partyLevel);
  if (meta.partySize) el("forge-party").value = String(meta.partySize);
  if (meta.durationMinutes) el("forge-duration").value = String(Math.round(meta.durationMinutes / 60));
  if (meta.seed && el("forge-seed")) el("forge-seed").value = meta.seed;
  if (el("lock-seed")) el("lock-seed").checked = false;
}

function hasRunProgressed() {
  if (!adventure || !state) return false;
  return state.currentSceneId !== adventure.initialState.currentSceneId ||
    state.questStage !== (adventure.initialState.questStage || "offered") ||
    (state.discoveredClueIds || []).length > 0 ||
    (state.sceneHistory || []).length > 0;
}

function renderAll() {
  const meta = adventure.metadata;
  const planned = adventure.pacing?.plannedMinutes;
  const seedText = meta.seed ? " • seed " + meta.seed : "";
  const plannedText = planned ? " • " + planned + " planned min" : "";
  el("adventure-title").textContent = meta.title;
  document.title = "Run — " + meta.title;
  if (el("module-link")) el("module-link").href = "module.html?id=" + encodeURIComponent(meta.id);
  if (el("print-link")) el("print-link").href = "print.html?id=" + encodeURIComponent(meta.id);
  if (el("cards-link")) {
    el("cards-link").hidden = !(adventure.cards || []).length;
    el("cards-link").href = "cards.html?id=" + encodeURIComponent(meta.id);
  }
  el("adventure-meta").textContent =
    "Level " + meta.partyLevel + " • " + (meta.partySizeRange || (meta.partySize + " players")) + " • " +
    Math.round(meta.durationMinutes / 60) + " hours • " + (meta.tone || []).join(" / ") +
    plannedText + seedText;

  el("quest-objective").textContent = adventure.quest.objective;
  el("quest-stakes").textContent = adventure.quest.stakes;
  el("quest-stage").value = state.questStage;
  if (el("overview-pitch")) {
    const series = adventure.series;
    const pitch = adventure.setup?.pitch || adventure.quest.objective;
    el("overview-pitch").textContent = series
      ? series.title + (series.hub ? " · " + series.hub : "") + " · Night " + series.episode + " — " + pitch
      : pitch;
  }
  if (el("overview-clock")) {
    const bits = [
      "Level " + meta.partyLevel,
      (meta.partySizeRange || (meta.partySize + " players")),
      Math.round(meta.durationMinutes / 60) + " hours",
      adventure.quest.deadline || "No hard clock"
    ];
    if (adventure.series?.giver) bits.push("Giver: " + adventure.series.giver);
    if (adventure.series?.nextTitle) bits.push("Next: " + adventure.series.nextTitle);
    if (adventure.informationContract?.rule) bits.push("No single NPC is required");
    if (typeof getRuleset === "function") bits.push(getRuleset() === "2024" ? "2024 SRD" : "2014 SRD");
    el("overview-clock").innerHTML = bits.map(bit => "<span>" + escapeHtml(bit) + "</span>").join("");
  }
  if (el("ruleset-notes")) {
    const edition = typeof getRuleset === "function" ? getRuleset() : "2014";
    const notes = adventure.rulesets?.[edition]?.tableNotes || [];
    el("ruleset-notes").hidden = !notes.length;
    el("ruleset-notes").innerHTML = notes.length
      ? "<p class=\"eyebrow\">" + escapeHtml(adventure.rulesets[edition].label || edition) + "</p><ul>" +
        notes.map(n => "<li>" + escapeHtml(n) + "</li>").join("") + "</ul>"
      : "";
  }
  renderSavedAdventures();
  renderSceneList();
  renderSceneJump();
  renderScene();
  renderMap();
  renderNpcs();
  renderRequiredClues();
  renderResources();
  renderPathPressure();
  renderRecovery();
  renderAiContext();
  renderPregens();
}

function renderPregens() {
  const wrap = el("pregen-list");
  if (!wrap) return;
  const list = rulesetPregens || adventure.pregens || [];
  if (!list.length) {
    wrap.innerHTML = '<p class="muted">No pregens in this pack.</p>';
    return;
  }
  wrap.innerHTML = list
    .slice()
    .sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)))
    .map(pregenCardHtml)
    .join("");
}

function pregenCardHtml(pc) {
  const scores = pc.scores
    ? Object.entries(pc.scores).map(([k,v]) => k + " " + v).join(" · ")
    : "";
  const spells = pc.spellcasting
    ? "<p><b>Spells.</b> DC " + escapeHtml(pc.spellcasting.saveDC) +
      ", +" + escapeHtml(pc.spellcasting.attack) + " · " + escapeHtml(pc.spellcasting.slots) + "</p>" +
      (pc.spellcasting.cantrips?.length ? "<p>Cantrips: " + escapeHtml(pc.spellcasting.cantrips.join(", ")) + "</p>" : "") +
      (pc.spellcasting.prepared?.length ? "<p>Prepared: " + escapeHtml(pc.spellcasting.prepared.join(", ")) + "</p>" : "")
    : "";
  return '<div class="card pregen">' +
    (pc.portrait ? '<img class="pregen-shot" src="' + escapeHtml(pc.portrait) + '" alt="">' : "") +
    "<strong>" + escapeHtml(pc.name) + "</strong>" +
    '<p><span class="badge">' + escapeHtml(pc.class) + "</span> " +
    '<span class="badge">' + escapeHtml(pc.race) + "</span> " +
    '<span class="badge">' + escapeHtml(pc.role) + "</span>" +
    (pc.recommended ? ' <span class="badge">Tonight’s six</span>' : "") +
    "</p>" +
    '<div class="stat-strip">' +
    "<span>AC <b>" + escapeHtml(pc.ac) + "</b></span>" +
    "<span>HP <b>" + escapeHtml(pc.hp) + "</b></span>" +
    "<span>Speed <b>" + escapeHtml(pc.speed) + "</b></span>" +
    "<span>Prof <b>+" + escapeHtml(pc.proficiency) + "</b></span>" +
    "</div>" +
    (scores ? '<p class="tiny">' + escapeHtml(scores) + "</p>" : "") +
    (pc.saves ? "<p><b>Saves.</b> " + escapeHtml(pc.saves) + "</p>" : "") +
    (pc.attacks || []).map(line => "<p>" + escapeHtml(line) + "</p>").join("") +
    spells +
    (pc.features || []).map(line => '<p class="tiny">' + escapeHtml(line) + "</p>").join("") +
    (pc.gear ? '<p class="muted">' + escapeHtml(pc.gear) + "</p>" : "") +
    "</div>";
}

function currentScene() {
  return adventure.scenes.find(scene => scene.id === state.currentSceneId) || adventure.scenes[0];
}

function renderSavedAdventures() {
  const select = el("saved-adventures");
  if (!select) return;
  const library = readLibrary();
  select.innerHTML = "";
  if (!library.length) {
    const option = document.createElement("option");
    option.textContent = "No saved adventures";
    option.value = "";
    select.appendChild(option);
    el("open-saved").disabled = true;
    return;
  }
  el("open-saved").disabled = false;
  for (const item of library) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title + " — L" + item.level + " / " + Math.round(item.durationMinutes / 60) + "h";
    option.selected = item.id === currentAdventureKey;
    select.appendChild(option);
  }
  if (el("save-status")) {
    el("save-status").textContent = library.length + " adventure" + (library.length === 1 ? "" : "s") + " saved in this browser.";
  }
}

function renderSceneList() {
  const list = el("scene-list");
  list.innerHTML = "";
  el("scene-count").textContent = adventure.scenes.length + " scenes";
  adventure.scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-button";
    button.setAttribute("aria-current", String(scene.id === state.currentSceneId));
    button.innerHTML =
      "<strong>" + (index + 1) + ". " + escapeHtml(scene.title) + "</strong>" +
      "<small>" + (scene.estimatedMinutes || "?") + " min • " + escapeHtml(scene.pacingClass) + "</small>";
    button.addEventListener("click", () => goToScene(scene.id));
    list.appendChild(button);
  });
}

function renderSceneJump() {
  const jump = el("scene-jump");
  if (!jump) return;
  jump.innerHTML = adventure.scenes.map((scene, index) => {
    const label = (index + 1) + ". " + scene.title;
    return '<option value="' + escapeHtml(scene.id) + '">' + escapeHtml(label) + "</option>";
  }).join("");
  jump.value = state.currentSceneId;
}

function renderScene() {
  const scene = currentScene();
  const location = adventure.locations.find(item => item.id === scene.locationId);
  el("scene-kicker").textContent = location ? location.name : "Adventure scene";
  el("scene-title").textContent = scene.title;
  document.title = scene.title + " — " + adventure.metadata.title + " | One-Shot Forge";
  if (el("scene-purpose")) el("scene-purpose").textContent = scene.purpose || "";
  if (el("scene-purpose-primary")) el("scene-purpose-primary").textContent = scene.purpose || adventure.quest?.objective || "";
  el("scene-pacing").textContent = (scene.pacingClass || "core") + " • " + (scene.estimatedMinutes || "?") + " min";
  const idx = adventure.scenes.findIndex(s => s.id === scene.id);
  const logicalStage = Number(scene.flowStage || (idx + 1));
  const logicalTotal = Number(scene.flowTotal || adventure.scenes.length);
  if (el("stage-progress")) {
    const flowLabel = scene.flowLabel ? " — " + scene.flowLabel : " — " + (scene.title || "");
    el("stage-progress").textContent = "Stage " + logicalStage + " of " + logicalTotal + flowLabel;
  }
  if (el("stage-bar")) {
    el("stage-bar").style.width = Math.round((logicalStage / logicalTotal) * 100) + "%";
  }
  if (el("stage-bar-track")) {
    el("stage-bar-track").setAttribute("aria-valuemax", String(logicalTotal));
    el("stage-bar-track").setAttribute("aria-valuenow", String(logicalStage));
  }
  if (el("stage-clock")) {
    const deadline = adventure.quest?.deadline || "";
    el("stage-clock").textContent = deadline ? "Time pressure · " + deadline : "No hard time pressure";
  }
  el("read-aloud").textContent = scene.readAloud || "No read-aloud text.";

  const encounters = (scene.encounterIds || [])
    .map(id => adventure.encounters.find(encounter => encounter.id === id))
    .filter(Boolean);
  const checks = tableChecksFor(scene.id);
  const hazards = tableHazardsFor(scene.id);
  const puzzles = (adventure.puzzles || []).filter(item => item.locationId === scene.locationId);
  const traps = (adventure.traps || []).filter(item => item.locationId === scene.locationId);
  const npcs = (scene.npcIds || [])
    .map(id => adventure.npcs.find(npc => npc.id === id))
    .filter(Boolean);

  if (el("dm-box")) {
    el("dm-box").innerHTML = dmBoxHtml(scene, { location, npcs, checks, hazards, puzzles, traps, encounters });
    bindRunStepControls(scene);
    updateRunStepStatus(scene);
  }

  const monsterHtml = encounters.map(encounterCardHtml).join("");
  if (el("monster-box-wrap")) {
    el("monster-box-wrap").hidden = !monsterHtml;
    el("monster-box").innerHTML = monsterHtml;
  }

  const sceneClues = (scene.clueIds || []).map(id => adventure.clues.find(clue => clue.id === id)).filter(Boolean);
  if (el("scene-clues-wrap")) {
    el("scene-clues-wrap").hidden = !sceneClues.length;
    el("scene-clues").innerHTML = "";
    sceneClues.forEach(clue => el("scene-clues").appendChild(clueCard(clue)));
  }

  const note = tableMapNote(scene.id);
  if (el("scene-mapnote-wrap")) {
    el("scene-mapnote-wrap").hidden = !note;
    el("scene-mapnote").innerHTML = note
      ? "<p><b>" + escapeHtml(note.dimensions) + "</b></p><ul>" +
        (note.features || []).map(f => "<li>" + escapeHtml(f) + "</li>").join("") + "</ul>"
      : "";
  }
  renderPlayMaps(scene);
  renderSceneExits(scene);
}

function runStepsHtml(scene) {
  const steps = scene.runSteps || [];
  if (!steps.length) return "";
  const done = state.completedRunSteps?.[scene.id] || [];
  return '<section class="run-sequence"><p class="box-label">Run this stage in order</p><ol>' +
    steps.map((step, index) =>
      '<li class="run-step' + (done[index] ? ' done' : '') + '">' +
        '<label><input type="checkbox" data-run-step="' + index + '"' + (done[index] ? ' checked' : '') + '>' +
        '<span><b>' + escapeHtml(step.title || ("Step " + (index + 1))) + '.</b> ' + escapeHtml(step.text || "") + '</span></label>' +
      '</li>'
    ).join("") + '</ol>' +
    (scene.advanceWhen ? '<div class="advance-when"><b>Move on when:</b> ' + escapeHtml(scene.advanceWhen) + '</div>' : '') +
    '</section>';
}

function updateRunStepStatus(scene) {
  const host = el("stage-step-status");
  if (!host) return;
  const steps = scene.runSteps || [];
  if (!steps.length) {
    host.textContent = "Stage ready";
    host.classList.remove("complete");
    return;
  }
  const done = state.completedRunSteps?.[scene.id] || [];
  const complete = steps.reduce((count, _step, index) => count + Number(Boolean(done[index])), 0);
  host.textContent = complete === steps.length
    ? "Stage checklist complete"
    : complete + " / " + steps.length + " steps complete";
  host.classList.toggle("complete", complete === steps.length);
}

function bindRunStepControls(scene) {
  if (!el("dm-box")) return;
  el("dm-box").querySelectorAll("[data-run-step]").forEach(input => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.runStep);
      if (!state.completedRunSteps[scene.id]) state.completedRunSteps[scene.id] = [];
      state.completedRunSteps[scene.id][index] = input.checked;
      saveState();
      input.closest(".run-step")?.classList.toggle("done", input.checked);
      updateRunStepStatus(scene);
    });
  });
}

function dmBoxHtml(scene, bits) {
  const chunks = [];
  const runSteps = runStepsHtml(scene);
  if (runSteps) chunks.push(runSteps);
  if (scene.purpose) chunks.push("<p><b>This room.</b> " + escapeHtml(scene.purpose) + "</p>");
  if (scene.gmNotes && scene.gmNotes.length) {
    chunks.push("<p><b>What you know.</b></p><ul>" +
      scene.gmNotes.map(note => "<li>" + escapeHtml(note) + "</li>").join("") + "</ul>");
  }
  if (bits.location?.description) {
    chunks.push('<section class="dm-spoken-layer"><p class="box-label">Describe the place</p><p>' +
      escapeHtml(bits.location.description) + '</p></section>');
  }
  if (bits.npcs.length) {
    chunks.push('<section class="dm-spoken-layer"><p class="box-label">NPCs — play them like this</p>' +
      bits.npcs.map(npc => {
        const wants = (npc.wants || []).slice(0, 2);
        const dialogue = (npc.tableDialogue || []).slice(0, 3);
        const reactions = npc.reactions || {};
        return '<div class="dm-npc">' +
          '<p><b><button type="button" class="npc-link" data-stat="' + escapeHtml(npc.name) + '">' + escapeHtml(npc.name) + '</button>.</b> ' + escapeHtml(npc.description || npc.role || '') + '</p>' +
          (npc.role ? '<p><b>Role.</b> ' + escapeHtml(npc.role) + '</p>' : '') +
          (npc.questFunction ? '<p><b>Function.</b> ' + escapeHtml(npc.questFunction) + '</p>' : '') +
          (npc.voiceCues?.length ? '<p><b>Voice.</b> ' + escapeHtml(npc.voiceCues.join('; ')) + '</p>' : '') +
          (wants.length ? '<p><b>Wants now.</b> ' + escapeHtml(wants.join('; ')) + '</p>' : '') +
          (dialogue.length ? '<div class="dm-dialogue"><b>Say:</b>' + dialogue.map(line =>
            '<blockquote>' + escapeHtml(line) + '</blockquote>').join('') + '</div>' : '') +
          ((reactions.agreement || reactions.refusal || reactions.accusation || reactions.danger) ?
            '<p class="tiny"><b>React.</b> ' +
              [reactions.agreement && ('Agree: ' + reactions.agreement),
               reactions.refusal && ('Refuse: ' + reactions.refusal),
               reactions.accusation && ('Accuse: ' + reactions.accusation),
               reactions.danger && ('Danger: ' + reactions.danger)]
                .filter(Boolean).map(escapeHtml).join(' · ') + '</p>' : '') +
        '</div>';
      }).join('') + '</section>');
  }
  if (bits.checks.length) {
    chunks.push("<p><b>Checks.</b></p>" + bits.checks.map(check =>
      "<p><b>" + (check.dc ? "DC " + escapeHtml(check.dc) : "No roll") + " " + escapeHtml(check.ability) + " — " + escapeHtml(check.label) + ".</b> " +
      "Success: " + escapeHtml(check.success) + " Failure: " + escapeHtml(check.failure) + "</p>"
    ).join(""));
  }
  if (bits.traps.length) {
    chunks.push("<p><b>Traps.</b></p>" + bits.traps.map(trap =>
      "<p><b>" + escapeHtml(trap.name) + ".</b> Trigger: " + escapeHtml(trap.trigger) +
      (trap.save || trap.dc ? " · " + escapeHtml(trap.save || ("DC " + trap.dc)) : "") +
      ". " + escapeHtml(trap.effect || "") +
      (trap.purpose ? " Fail-forward: " + escapeHtml(trap.purpose) : "") + "</p>"
    ).join(""));
  }
  if (bits.puzzles.length) {
    chunks.push("<p><b>Puzzle (solution is for you).</b></p>" + bits.puzzles.map(item =>
      "<p><b>" + escapeHtml(item.name) + ".</b> " + escapeHtml(item.prompt) +
      " <b>Solution:</b> " + escapeHtml(item.solution) +
      " Fail-forward: " + escapeHtml(item.failForward) + "</p>"
    ).join(""));
  }
  if (bits.hazards.length) {
    chunks.push("<p><b>Hazards.</b></p>" + bits.hazards.map(h =>
      "<p><b>" + escapeHtml(h.trigger) + ".</b> Save: " + escapeHtml(h.save) +
      " Failure: " + escapeHtml(h.failure) + " Success: " + escapeHtml(h.success) + "</p>"
    ).join(""));
  }
  const endings = (scene.endingIds || [])
    .map(id => adventure.endings.find(ending => ending.id === id))
    .filter(Boolean);
  if (endings.length) {
    chunks.push("<p><b>Ending options.</b></p>" + endings.map(ending =>
      '<div class="ending-option"><b>' + escapeHtml(ending.name) + '.</b> ' +
      '<span class="muted">Use when: ' + escapeHtml(ending.condition) + '</span>' +
      '<p>' + escapeHtml(ending.result) + '</p></div>'
    ).join(""));
  }
  const specials = bits.encounters.filter(enc => enc.talkOut || enc.bypass || enc.special);
  if (specials.length) {
    chunks.push("<p><b>Special.</b></p>" + specials.map(enc =>
      "<p><b>" + escapeHtml(enc.name) + ".</b> " +
      [enc.special, enc.talkOut && ("Talk-out: " + enc.talkOut), enc.bypass && ("Bypass: " + enc.bypass)]
        .filter(Boolean).map(escapeHtml).join(" ") + "</p>"
    ).join(""));
  }
  if (scene.exitChoices?.length) {
    chunks.push('<section class="dm-spoken-layer dm-transition"><p class="box-label">Transition</p>' +
      scene.exitChoices.map(choice =>
        '<p><b>' + escapeHtml(choice.label || 'Continue') + '.</b> ' +
        escapeHtml(choice.description || '') + '</p>').join('') + '</section>');
  }
  return chunks.join("") || "<p>Nothing hidden in this room beyond the boxed text.</p>";
}

function tableRef() {
  return adventure?.quickrun || null;
}

function tableEncounter(id) {
  return (tableRef()?.encounters || []).find(item => item.id === id) || null;
}

function tableChecksFor(sceneId) {
  return (tableRef()?.checks || []).filter(item => item.sceneId === sceneId);
}

function tableHazardsFor(sceneId) {
  return (tableRef()?.hazards || []).filter(item => item.sceneId === sceneId);
}

function tableMapNote(sceneId) {
  return (tableRef()?.mapNotes || []).find(item => item.sceneId === sceneId) || null;
}

function creatureBlockHtml(creature) {
  const extras = [creature.statBlock && ("Stat block. " + creature.statBlock), creature.saves && ("Saves. " + creature.saves), creature.resistances && ("Resistances. " + creature.resistances), creature.immunities && ("Immunities. " + creature.immunities), creature.attack, creature.ranged, creature.action, creature.reaction, creature.trait, creature.edition2024 && ("2024 rules (SRD 5.2.1). " + creature.edition2024)]
    .filter(Boolean);
  const stats = '<div class="stat-strip">' +
    "<span>AC <b>" + escapeHtml(creature.ac) + "</b></span>" +
    "<span>HP <b>" + escapeHtml(creature.hp) + "</b></span>" +
    "<span>Speed <b>" + escapeHtml(creature.speed) + "</b></span>" +
    (creature.cr !== undefined ? "<span>CR <b>" + escapeHtml(creature.cr) + "</b></span>" : "") +
    "</div>" + extras.map(line => "<p>" + escapeHtml(line) + "</p>").join("");
  if (typeof registerStat === "function") registerStat(creature.name, "<h3>" + escapeHtml(creature.name) + "</h3>" + stats);
  return '<div class="creature">' +
    "<strong>" + escapeHtml(creature.count) + "× <button type=\"button\" class=\"npc-link\" data-stat=\"" + escapeHtml(creature.name) + "\">" + escapeHtml(creature.name) + "</button></strong>" +
    (creature.tactics ? '<p class="tiny"><b>Tactics.</b> ' + escapeHtml(creature.tactics) + "</p>" : "") +
    '<p class="tiny muted">Stats are in the appendix. Click the name.</p>' +
    "</div>";
}

function checkCardHtml(check) {
  return '<div class="card check-card">' +
    "<strong>" + escapeHtml(check.label) + "</strong>" +
    '<p><span class="badge">' + (check.dc ? "DC " + escapeHtml(check.dc) : "No roll") + "</span> " +
    '<span class="badge">' + escapeHtml(check.ability) + "</span></p>" +
    "<p><b>Success.</b> " + escapeHtml(check.success) + "</p>" +
    "<p><b>Failure.</b> " + escapeHtml(check.failure) + "</p>" +
    "</div>";
}

function hazardCardHtml(hazard) {
  return '<div class="card">' +
    '<span class="badge">Hazard</span>' +
    "<strong>" + escapeHtml(hazard.trigger) + "</strong>" +
    "<p><b>Save.</b> " + escapeHtml(hazard.save) + "</p>" +
    "<p><b>Failure.</b> " + escapeHtml(hazard.failure) + "</p>" +
    "<p><b>Success.</b> " + escapeHtml(hazard.success) + "</p>" +
    '<p class="muted">Fail forward: ' + escapeHtml(hazard.failForward) + "</p>" +
    "</div>";
}

function encounterCardHtml(encounter) {
  const table = tableEncounter(encounter.id);
  const mechanics = encounter.mechanics;
  let body = "";
  if (table) {
    body += "<p><b>Objective.</b> " + escapeHtml(table.objective) + "</p>";
    body += '<p class="quick-block"><b>Opening beat.</b> ' + escapeHtml(table.start) + "</p>";
    body += (table.creatures || []).map(creatureBlockHtml).join("");
    if (table.balance) body += '<p class="tiny"><b>Balance.</b> ' + escapeHtml(table.balance) + "</p>";
    if (table.scaling) body += '<p class="tiny"><b>Party size.</b> ' + escapeHtml(table.scaling) + "</p>";
    if (table.bypass) body += "<p><b>De-escalate / bypass.</b> " + escapeHtml(table.bypass) + "</p>";
    if (table.ritual) body += '<p class="quick-block"><b>Binding.</b> ' + escapeHtml(table.ritual) + "</p>";
    if (table.destroy) body += "<p><b>Destroy.</b> " + escapeHtml(table.destroy) + "</p>";
    if (table.bargain) body += "<p><b>Bargain.</b> " + escapeHtml(table.bargain) + "</p>";
    body += '<p class="muted"><b>End.</b> ' + escapeHtml(table.end) + "</p>";
  } else if (mechanics) {
    const stats = '<div class="stat-strip"><span>AC <b>' + mechanics.ac + '</b></span><span>HP <b>' + mechanics.hpEach + '</b></span><span>Speed <b>' + escapeHtml(mechanics.speed) + '</b></span></div><p><b>Attack.</b> ' + escapeHtml(mechanics.basicAttack) + '</p><p><b>Signature.</b> ' + escapeHtml(mechanics.signature) + '</p>';
    if (typeof registerStat === "function") registerStat(encounter.name, "<h3>" + escapeHtml(encounter.name) + "</h3>" + stats);
    body += '<p class="tiny muted">Combat numbers are in the appendix. Click the name.</p>';
  }
  return '<div class="card">' +
    "<strong><button type=\"button\" class=\"npc-link\" data-stat=\"" + escapeHtml(encounter.name) + "\">" + escapeHtml(encounter.name) + "</button></strong>" +
    '<p><span class="badge">' + escapeHtml(encounter.type || "encounter") + "</span> " +
    '<span class="badge">' + escapeHtml(encounter.difficulty || "") + "</span></p>" +
    "<p>" + escapeHtml(encounter.summary || "") + "</p>" +
    body +
    (encounter.resolution ? '<p class="muted">' + escapeHtml(encounter.resolution) + "</p>" : "") +
    "</div>";
}

function resourceCardHtml(kind, name, body, detail) {
  return '<div class="card"><span class="badge">' + escapeHtml(kind) + '</span>' +
    '<strong>' + escapeHtml(name || kind) + '</strong>' +
    '<p>' + escapeHtml(body || "") + '</p>' +
    (detail ? '<p class="muted">' + escapeHtml(detail) + '</p>' : '') +
    '</div>';
}

function renderPlayMaps(scene) {
  const wrap = el("play-maps");
  if (!wrap) return;
  const maps = (adventure.playMaps || []).filter(m =>
    (m.sceneIds || []).includes(scene.id) || (m.kind === "handout" && scene.id === "scene-hook")
  );
  if (!maps.length) {
    wrap.hidden = true;
    wrap.innerHTML = "";
    return;
  }
  wrap.hidden = false;
  wrap.innerHTML = maps.map(m => {
    const tag = m.kind === "combat" ? "Combat map" : "Player handout";
    const img = m.asset || m.src;
    return '<figure class="play-map">' +
      '<figcaption><span class="badge">' + escapeHtml(tag) + "</span> " +
      escapeHtml(m.title) + " · " + escapeHtml(m.scale || m.grid || "") + "</figcaption>" +
      (img ? '<a href="' + escapeHtml(img) + '" target="_blank" rel="noopener"><img src="' +
        escapeHtml(img) + '" alt="' + escapeHtml(m.title) + '"></a>' : "") +
      ((m.notes || []).length ? "<ul>" + m.notes.map(n => "<li>" + escapeHtml(n) + "</li>").join("") + "</ul>" : "") +
      "</figure>";
  }).join("");
}

function renderSceneExits(scene) {
  const configured = Array.isArray(scene.exitChoices) && scene.exitChoices.length
    ? scene.exitChoices
    : (scene.exits || []).map(target => ({target}));
  const exits = configured.map(choice => {
    const sceneRef = adventure.scenes.find(item => item.id === choice.target);
    return sceneRef ? {choice, scene:sceneRef} : null;
  }).filter(Boolean);
  const wrap = el("scene-exits");
  wrap.innerHTML = "";
  el("scene-exits-wrap").hidden = !exits.length;

  exits.forEach(({choice, scene:exitScene}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button secondary next-choice";
    button.innerHTML = "<b>" + escapeHtml(choice.label || exitScene.title) + " →</b>" +
      (choice.description ? "<small>" + escapeHtml(choice.description) + "</small>" : "");
    button.addEventListener("click", () => goToScene(exitScene.id));
    wrap.appendChild(button);
  });

  el("prev-scene").disabled = !(state.sceneHistory && state.sceneHistory.length);
  if (exits.length === 1) {
    el("next-scene").disabled = false;
    el("next-scene").textContent = (exits[0].choice.label || "Next") + " →";
    el("next-scene").dataset.target = exits[0].scene.id;
  } else if (exits.length > 1) {
    el("next-scene").disabled = true;
    el("next-scene").textContent = "Choose one path above";
    delete el("next-scene").dataset.target;
  } else {
    el("next-scene").disabled = true;
    el("next-scene").textContent = "Adventure complete";
    delete el("next-scene").dataset.target;
  }
}

function clueCard(clue) {
  const card = document.createElement("div");
  const found = state.discoveredClueIds.includes(clue.id);
  card.className = "card" + (found ? " discovered" : "");
  card.innerHTML =
    "<strong>" + escapeHtml(clue.revelation) + "</strong>" +
    '<p class="muted">' + (clue.required ? "Required revelation" : "Optional clue") +
    " • " + clue.sources.length + " source(s)</p>" +
    '<details><summary>Delivery sources</summary><ul>' +
    clue.sources.map(source => "<li>" + escapeHtml(source) + "</li>").join("") +
    "</ul></details><div class=\"card-actions\"></div>";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button small " + (found ? "secondary" : "");
  button.textContent = found ? "Mark undiscovered" : "Discover clue";
  button.addEventListener("click", () => toggleClue(clue.id));
  card.querySelector(".card-actions").appendChild(button);
  return card;
}

function renderRequiredClues() {
  const required = adventure.clues.filter(clue => clue.required);
  const foundCount = required.filter(clue => state.discoveredClueIds.includes(clue.id)).length;
  el("clue-progress").textContent = foundCount + "/" + required.length;
  const wrap = el("required-clues");
  wrap.innerHTML = "";
  required.forEach(clue => wrap.appendChild(clueCard(clue)));
}

function toggleClue(id) {
  const index = state.discoveredClueIds.indexOf(id);
  if (index >= 0) state.discoveredClueIds.splice(index, 1);
  else state.discoveredClueIds.push(id);
  saveState();
  renderScene();
  renderRequiredClues();
  renderAiContext();
}

function renderNpcs() {
  const wrap = el("npc-list");
  wrap.innerHTML = "";
  adventure.npcs.forEach(npc => {
    const npcState = state.npcState[npc.id] || {status:"unknown",attitude:"unknown"};
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<strong>" + escapeHtml(npc.name) + "</strong>" +
      "<p>" + escapeHtml(npc.role) + "</p>" +
      '<p class="muted">' + escapeHtml((npc.personality || []).join(" • ")) + "</p>" +
      '<p><span class="badge">' + escapeHtml(npcState.status) + '</span> <span class="badge">' + escapeHtml(npcState.attitude) + "</span></p>" +
      '<details><summary>GM knowledge</summary><p><b>Wants:</b> ' + escapeHtml((npc.wants || []).join("; ")) +
      '</p><p><b>Knows:</b> ' + escapeHtml((npc.knows || []).join("; ")) +
      '</p><p><b>Secrets:</b> ' + escapeHtml((npc.secrets || []).join("; ")) + "</p></details>" +
      '<div class="card-actions"></div>';

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button small secondary";
    button.textContent = "AI dialogue context";
    button.addEventListener("click", () => {
      selectedNpcId = npc.id;
      renderAiContext();
      el("ai-context").scrollIntoView({behavior:"smooth", block:"nearest"});
    });
    card.querySelector(".card-actions").appendChild(button);
    wrap.appendChild(card);
  });
}

function renderResources() {
  const wrap = el("resource-list");
  const cards = [];
  for (const item of adventure.items || []) {
    const stateText = state.itemState[item.id] ? "Current: " + state.itemState[item.id] : "";
    cards.push(resourceCardHtml("Item", item.name, item.description, stateText));
  }
  for (const event of adventure.events || []) {
    cards.push(resourceCardHtml("Event", event.name, event.effect, ""));
  }
  for (const ending of adventure.endings || []) {
    cards.push(resourceCardHtml("Ending", ending.name, ending.condition, ending.result));
  }
  for (const reward of tableRef()?.rewards || []) {
    cards.push(resourceCardHtml("Reward", reward.when, reward.reward, ""));
  }
  wrap.innerHTML = cards.join("") || '<p class="muted">No additional resources.</p>';
}

function renderAiContext() {
  const pre = el("ai-context");
  if (!selectedNpcId) {
    pre.textContent = "No NPC selected.";
    return;
  }
  const npc = adventure.npcs.find(item => item.id === selectedNpcId);
  if (!npc) {
    pre.textContent = "No NPC selected.";
    return;
  }
  const packet = {
    authority:[
      "Do not contradict adventure truth.",
      "Use current game state.",
      "The NPC may state knows as facts and believes as beliefs.",
      "Do not reveal locked secrets unless the GM confirms the reveal condition.",
      "Never invent quest-critical facts."
    ],
    npc:{
      name:npc.name,role:npc.role,personality:npc.personality,voiceCues:npc.voiceCues,
      wants:npc.wants,fears:npc.fears,knows:npc.knows,believes:npc.believes,lies:npc.lies,
      cannotKnow:npc.cannotKnow,lockedSecrets:npc.secrets,revealRules:npc.revealRules
    },
    currentState:state,
    discoveredRevelations:adventure.clues
      .filter(clue => state.discoveredClueIds.includes(clue.id))
      .map(clue => clue.revelation)
  };
  pre.textContent = JSON.stringify(packet, null, 2);
}

function renderPathPressure() {
  const wrap = el("pressure-list");
  if (!wrap) return;
  const pp = adventure.pathPressure;
  if (!pp) {
    wrap.innerHTML = '<p class="muted">This pack has no prepared/rushed track.</p>';
    return;
  }
  const bits = [];
  bits.push("<p>" + escapeHtml(pp.principle || "") + "</p>");
  if (pp.notDeviation?.length) {
    bits.push("<p class=\"muted\">Not a rush: " + escapeHtml(pp.notDeviation.join(" ")) + "</p>");
  }
  bits.push("<p><b>They did the work</b></p>");
  for (const row of pp.prepared || []) {
    bits.push('<div class="card"><strong>' + escapeHtml(row.when) + "</strong><p>" + escapeHtml(row.payoff) + "</p></div>");
  }
  bits.push("<p><b>They rushed or murdered</b></p>");
  for (const row of pp.rushed || []) {
    bits.push('<div class="card"><strong>' + escapeHtml(row.when) + "</strong><p>" + escapeHtml(row.cost) + "</p></div>");
  }
  wrap.innerHTML = bits.join("");
}

function renderRecovery() {
  const wrap = el("recovery-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  (adventure.recovery?.routes || []).forEach(route => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<strong>" + escapeHtml(route.trigger) + "</strong>" +
      "<p>" + escapeHtml(route.response) + "</p>" +
      '<p class="muted">' + escapeHtml((route.stateChanges || []).join(" ")) + "</p>" +
      '<div class="card-actions"></div>';
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button small secondary";
    button.textContent = "Apply recovery";
    button.addEventListener("click", () => applyRecovery(route));
    card.querySelector(".card-actions").appendChild(button);
    wrap.appendChild(card);
  });
}

function applyRecovery(route) {
  const patch = route.patch || {};
  if (Array.isArray(patch.discoverClueIds)) {
    patch.discoverClueIds.forEach(id => {
      if (!state.discoveredClueIds.includes(id)) state.discoveredClueIds.push(id);
    });
  }
  if (patch.setCurrentSceneId && adventure.scenes.some(scene => scene.id === patch.setCurrentSceneId)) {
    if (state.currentSceneId !== patch.setCurrentSceneId) state.sceneHistory.push(state.currentSceneId);
    state.currentSceneId = patch.setCurrentSceneId;
    revealCurrentLocation();
  }
  if (patch.itemState) state.itemState = {...state.itemState, ...patch.itemState};
  saveState();
  renderAll();
  toast("Recovery applied.");
}

function renderMap() {
  const map = el("map");
  map.innerHTML = "";
  const mapData = adventure.maps[0];
  el("map-title").textContent = mapData?.name || "Adventure Map";
  if (!mapData) {
    map.textContent = "No map in this package.";
    return;
  }

  mapData.regions.forEach(region => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-region";
    if (region.sceneId === state.currentSceneId) button.classList.add("active");
    const scene = adventure.scenes.find(item => item.id === region.sceneId);
    const location = scene && adventure.locations.find(item => item.id === scene.locationId);
    if (location && state.locationState[location.id]?.revealed) button.classList.add("revealed");
    button.style.left = region.x + "%";
    button.style.top = region.y + "%";
    button.style.width = region.w + "%";
    button.style.height = region.h + "%";
    button.textContent = region.label;
    button.setAttribute("aria-label", "Go to " + region.label);
    button.addEventListener("click", () => goToScene(region.sceneId));
    map.appendChild(button);
  });
}

function revealCurrentLocation() {
  const scene = currentScene();
  if (scene?.locationId) {
    if (!state.locationState[scene.locationId]) state.locationState[scene.locationId] = {};
    state.locationState[scene.locationId].revealed = true;
  }
}

function goToScene(id, options={}) {
  const scene = adventure.scenes.find(item => item.id === id);
  if (!scene || id === state.currentSceneId) return;
  if (options.recordHistory !== false) state.sceneHistory.push(state.currentSceneId);
  state.currentSceneId = id;
  revealCurrentLocation();
  saveState();
  renderAll();
  if (options.focus !== false) el("scene-title").focus({preventScroll:true});
  if (window.matchMedia("(max-width: 760px)").matches) {
    el("active-scene").scrollIntoView({behavior:"smooth", block:"start"});
  }
}

function goBackScene() {
  const previous = state.sceneHistory.pop();
  if (!previous || !adventure.scenes.some(scene => scene.id === previous)) return;
  state.currentSceneId = previous;
  revealCurrentLocation();
  saveState();
  renderAll();
  el("scene-title").focus({preventScroll:true});
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
}

function exportAdventure() {
  if (!adventure) return;
  const blob = new Blob([JSON.stringify(adventure, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = (adventure.metadata.title || "adventure").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".oneshot.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Adventure exported.");
}

function forgeRandomAdventure() {
  if (!globalThis.OneShotGenerator?.generate) {
    alert("Random generator is unavailable.");
    return;
  }
  if (hasRunProgressed() && !confirm("Forge a new adventure? Your current adventure and progress are already saved and can be reopened from Saved adventures.")) {
    return;
  }
  const reuseSeed = Boolean(el("lock-seed")?.checked);
  let seed = reuseSeed ? el("forge-seed").value.trim() : "";
  if (!seed) seed = globalThis.OneShotGenerator.newSeed();
  el("forge-seed").value = seed;
  const generated = globalThis.OneShotGenerator.generate({
    level:Number(el("forge-level").value || 4),
    partySize:Number(el("forge-party").value || 4),
    durationHours:Number(el("forge-duration").value || 4),
    tone:el("forge-tone").value || "random",
    seed
  });
  const alreadySaved = Boolean(loadSavedPackage(generated.metadata.id));
  activateAdventure(generated, {persist:true, fresh:!alreadySaved});
  if (el("lock-seed")) el("lock-seed").checked = false;
  toast(alreadySaved ? "Reopened the saved run for this seed." : "New random one-shot forged and saved.");
}

function openSavedAdventure() {
  const id = el("saved-adventures").value;
  if (!id) return;
  const pkg = loadSavedPackage(id);
  if (!pkg) {
    toast("Saved adventure could not be loaded.");
    return;
  }
  activateAdventure(pkg, {persist:false});
  toast("Saved adventure opened.");
}

el("prev-scene")?.addEventListener("click", goBackScene);
el("next-scene")?.addEventListener("click", () => {
  const target = el("next-scene").dataset.target;
  if (target) goToScene(target);
});
el("scene-jump")?.addEventListener("change", event => {
  goToScene(event.target.value);
});
el("quest-stage")?.addEventListener("change", event => {
  state.questStage = event.target.value;
  saveState();
  renderAiContext();
});
el("reset-state")?.addEventListener("click", () => {
  if (!adventure || !confirm("Reset only this adventure's play progress? The saved adventure itself will remain in your library.")) return;
  safeRemove(stateKey());
  state = normalizeState(clone(adventure.initialState));
  selectedNpcId = null;
  saveState();
  renderAll();
  toast("Run progress reset.");
});
el("export-adventure")?.addEventListener("click", exportAdventure);
el("load-file")?.addEventListener("click", () => el("file-input").click());
if (el("copy-readaloud")) {
  el("copy-readaloud").addEventListener("click", async () => {
    const text = el("read-aloud")?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      toast("Read-aloud copied.");
    } catch {
      toast("Could not copy.");
    }
  });
}
el("new-seed")?.addEventListener("click", () => {
  if (el("forge-seed")) el("forge-seed").value = globalThis.OneShotGenerator?.newSeed?.() || "";
});
el("open-saved")?.addEventListener("click", openSavedAdventure);

["forge-random","forge-random-side"].forEach(id => {
  el(id)?.addEventListener("click", forgeRandomAdventure);
});

el("file-input")?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    await activateAdventure(JSON.parse(text), {persist:true, fresh:true});
    toast("Adventure imported and saved.");
  } catch (error) {
    alert("Could not load adventure: " + error.message);
  } finally {
    event.target.value = "";
  }
});

loadInitialAdventure().catch(error => {
  console.error(error);
  const title = el("adventure-title");
  if (title) title.textContent = "Could not open adventure";
  const meta = el("adventure-meta");
  if (meta) meta.textContent = error.message;
  toast(error.message || "Adventure failed to load.");
});

if (el("ruleset-host") && typeof mountRulesetToggle === "function") {
  mountRulesetToggle(el("ruleset-host"));
}