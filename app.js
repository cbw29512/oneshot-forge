const DEFAULT_ADVENTURE = "data/adventures/the-lantern-below.oneshot.json";
const PACKAGE_PREFIX = "oneshot-forge:package:";
const STATE_PREFIX = "oneshot-forge:state:";
const LIBRARY_KEY = "oneshot-forge:library";
const LAST_ADVENTURE_KEY = "oneshot-forge:last-adventure";

let adventure = null;
let state = null;
let currentAdventureKey = "";
let selectedNpcId = null;

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
  if (!saved) return clone(adventure.initialState);
  try { return normalizeState(JSON.parse(saved)); }
  catch { return clone(adventure.initialState); }
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
  for (const loc of adventure.locations) {
    if (!next.locationState[loc.id]) next.locationState[loc.id] = {revealed:false};
  }
  return next;
}

function saveState() {
  safeSet(stateKey(), JSON.stringify(state));
  safeSet(LAST_ADVENTURE_KEY, currentAdventureKey);
}

async function loadInitialAdventure() {
  const lastId = safeGet(LAST_ADVENTURE_KEY);
  if (lastId) {
    const saved = loadSavedPackage(lastId);
    if (saved) {
      await activateAdventure(saved, {persist:false});
      toast("Resumed saved adventure.");
      return;
    }
  }

  const res = await fetch(DEFAULT_ADVENTURE);
  if (!res.ok) throw new Error("Could not load the reference adventure.");
  await activateAdventure(await res.json(), {persist:true});
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
  renderAll();
  saveState();
}

function syncForgeControls() {
  const meta = adventure.metadata || {};
  if (meta.partyLevel) el("forge-level").value = String(meta.partyLevel);
  if (meta.partySize) el("forge-party").value = String(meta.partySize);
  if (meta.durationMinutes) el("forge-duration").value = String(Math.round(meta.durationMinutes / 60));
  if (meta.seed) el("forge-seed").value = meta.seed;
}

function hasRunProgressed() {
  if (!adventure || !state) return false;
  return state.currentSceneId !== adventure.initialState.currentSceneId ||
    state.questStage !== (adventure.initialState.questStage || "offered") ||
    state.discoveredClueIds.length > 0 ||
    state.sceneHistory.length > 0;
}

function renderAll() {
  const meta = adventure.metadata;
  const planned = adventure.pacing?.plannedMinutes;
  const seedText = meta.seed ? " • seed " + meta.seed : "";
  const plannedText = planned ? " • " + planned + " planned min" : "";
  el("adventure-title").textContent = meta.title;
  el("adventure-meta").textContent =
    "Level " + meta.partyLevel + " • " + meta.partySize + " players • " +
    Math.round(meta.durationMinutes / 60) + " hours • " + (meta.tone || []).join(" / ") +
    plannedText + seedText;

  el("quest-objective").textContent = adventure.quest.objective;
  el("quest-stakes").textContent = adventure.quest.stakes;
  el("quest-stage").value = state.questStage;
  renderSavedAdventures();
  renderSceneList();
  renderScene();
  renderMap();
  renderNpcs();
  renderRequiredClues();
  renderResources();
  renderRecovery();
  renderAiContext();
}

function currentScene() {
  return adventure.scenes.find(scene => scene.id === state.currentSceneId) || adventure.scenes[0];
}

function renderSavedAdventures() {
  const select = el("saved-adventures");
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

function renderScene() {
  const scene = currentScene();
  const location = adventure.locations.find(item => item.id === scene.locationId);
  el("scene-kicker").textContent = location ? location.name : "Adventure scene";
  el("scene-title").textContent = scene.title;
  el("scene-purpose").textContent = scene.purpose;
  el("scene-pacing").textContent = (scene.pacingClass || "core") + " • " + (scene.estimatedMinutes || "?") + " min";
  el("read-aloud").textContent = scene.readAloud || "No read-aloud text.";
  el("gm-notes").innerHTML = (scene.gmNotes || []).map(note => "<li>" + escapeHtml(note) + "</li>").join("");

  const sceneClues = (scene.clueIds || []).map(id => adventure.clues.find(clue => clue.id === id)).filter(Boolean);
  el("scene-clues-wrap").hidden = !sceneClues.length;
  el("scene-clues").innerHTML = "";
  sceneClues.forEach(clue => el("scene-clues").appendChild(clueCard(clue)));

  const encounters = (scene.encounterIds || []).map(id => adventure.encounters.find(encounter => encounter.id === id)).filter(Boolean);
  el("scene-encounters-wrap").hidden = !encounters.length;
  el("scene-encounters").innerHTML = encounters.map(encounterCardHtml).join("");

  const puzzles = (adventure.puzzles || []).filter(item => item.locationId === scene.locationId);
  const traps = (adventure.traps || []).filter(item => item.locationId === scene.locationId);
  el("scene-puzzles-wrap").hidden = !puzzles.length && !traps.length;
  el("scene-puzzles").innerHTML = [
    ...puzzles.map(item => resourceCardHtml("Puzzle", item.name, item.prompt, "Solution: " + item.solution + " • Fail forward: " + item.failForward)),
    ...traps.map(item => resourceCardHtml("Trap", item.name, item.trigger, item.effect || item.purpose || ""))
  ].join("");

  renderSceneExits(scene);
}

function encounterCardHtml(encounter) {
  const mechanics = encounter.mechanics;
  let mechanicsHtml = "";
  if (mechanics) {
    mechanicsHtml =
      '<div class="stat-strip">' +
      '<span><b>' + mechanics.count + '</b> creature' + (mechanics.count === 1 ? "" : "s") + '</span>' +
      '<span>AC <b>' + mechanics.ac + '</b></span>' +
      '<span>HP <b>' + mechanics.hpEach + '</b> each</span>' +
      '<span>Speed <b>' + escapeHtml(mechanics.speed) + '</b></span>' +
      '</div>' +
      '<div class="quick-block">' +
      '<p><b>Attack.</b> ' + escapeHtml(mechanics.basicAttack) + '</p>' +
      (mechanics.attacksPerTurn > 1 ? '<p><b>Multiattack.</b> ' + mechanics.attacksPerTurn + ' attacks per turn.</p>' : '') +
      '<p><b>Signature.</b> ' + escapeHtml(mechanics.signature) + '</p>' +
      '<p class="tiny muted">' + escapeHtml(mechanics.balanceNote) + '</p>' +
      '</div>';
  }
  return '<div class="card">' +
    '<strong>' + escapeHtml(encounter.name) + '</strong>' +
    '<p><span class="badge">' + escapeHtml(encounter.type || "encounter") + '</span> ' +
    '<span class="badge">' + escapeHtml(encounter.difficulty || "") + '</span></p>' +
    '<p>' + escapeHtml(encounter.summary || "") + '</p>' +
    mechanicsHtml +
    '<p class="muted">' + escapeHtml(encounter.resolution || "") + '</p>' +
    '</div>';
}

function resourceCardHtml(kind, name, body, detail) {
  return '<div class="card"><span class="badge">' + escapeHtml(kind) + '</span>' +
    '<strong>' + escapeHtml(name || kind) + '</strong>' +
    '<p>' + escapeHtml(body || "") + '</p>' +
    (detail ? '<p class="muted">' + escapeHtml(detail) + '</p>' : '') +
    '</div>';
}

function renderSceneExits(scene) {
  const exits = (scene.exits || []).map(id => adventure.scenes.find(item => item.id === id)).filter(Boolean);
  const wrap = el("scene-exits");
  wrap.innerHTML = "";
  el("scene-exits-wrap").hidden = !exits.length;

  exits.forEach(exitScene => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button secondary small";
    button.textContent = exitScene.title + " →";
    button.addEventListener("click", () => goToScene(exitScene.id));
    wrap.appendChild(button);
  });

  el("prev-scene").disabled = !state.sceneHistory.length;
  if (exits.length === 1) {
    el("next-scene").disabled = false;
    el("next-scene").textContent = "Next →";
    el("next-scene").dataset.target = exits[0].id;
  } else if (exits.length > 1) {
    el("next-scene").disabled = true;
    el("next-scene").textContent = "Choose a path";
    delete el("next-scene").dataset.target;
  } else {
    el("next-scene").disabled = true;
    el("next-scene").textContent = "End";
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

function renderRecovery() {
  const wrap = el("recovery-list");
  wrap.innerHTML = "";
  adventure.recovery.routes.forEach(route => {
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
  let seed = el("forge-seed").value.trim();
  if (!seed) {
    seed = globalThis.OneShotGenerator.newSeed();
    el("forge-seed").value = seed;
  }
  const generated = globalThis.OneShotGenerator.generate({
    level:Number(el("forge-level").value || 4),
    partySize:Number(el("forge-party").value || 4),
    durationHours:Number(el("forge-duration").value || 4),
    tone:el("forge-tone").value || "random",
    seed
  });
  activateAdventure(generated, {persist:true, fresh:true});
  toast("New one-shot forged and saved.");
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

el("prev-scene").addEventListener("click", goBackScene);
el("next-scene").addEventListener("click", () => {
  const target = el("next-scene").dataset.target;
  if (target) goToScene(target);
});
el("quest-stage").addEventListener("change", event => {
  state.questStage = event.target.value;
  saveState();
  renderAiContext();
});
el("reset-state").addEventListener("click", () => {
  if (!adventure || !confirm("Reset only this adventure's play progress? The saved adventure itself will remain in your library.")) return;
  safeRemove(stateKey());
  state = normalizeState(clone(adventure.initialState));
  selectedNpcId = null;
  saveState();
  renderAll();
  toast("Run progress reset.");
});
el("export-adventure").addEventListener("click", exportAdventure);
el("load-file").addEventListener("click", () => el("file-input").click());
el("new-seed").addEventListener("click", () => {
  el("forge-seed").value = globalThis.OneShotGenerator?.newSeed?.() || "";
});
el("open-saved").addEventListener("click", openSavedAdventure);

["forge-random","forge-random-side"].forEach(id => {
  el(id).addEventListener("click", forgeRandomAdventure);
});

el("file-input").addEventListener("change", async event => {
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
  document.body.innerHTML =
    '<main style="padding:2rem;color:white;background:#12100d;min-height:100vh">' +
    "<h1>One-Shot Forge</h1><p>" + escapeHtml(error.message) + "</p>" +
    "<p>Refresh the page or load a valid .oneshot.json adventure.</p></main>";
});