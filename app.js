const DEFAULT_ADVENTURE = "data/adventures/the-lantern-below.oneshot.json";
let adventure = null;
let state = null;
let currentAdventureKey = "";
let selectedNpcId = null;

const el = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));

function storageKey() {
  return "oneshot-forge:state:" + currentAdventureKey;
}

function toast(message) {
  const node = el("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 1800);
}

function validatePackage(pkg) {
  const required = ["schemaVersion","metadata","quest","truth","npcs","locations","scenes","clues","encounters","maps","recovery","pacing","endings","initialState"];
  const missing = required.filter(key => !(key in pkg));
  if (missing.length) throw new Error("Adventure package is missing: " + missing.join(", "));
  if (!Array.isArray(pkg.scenes) || !pkg.scenes.length) throw new Error("Adventure package has no scenes.");
  if (!pkg.metadata.id || !pkg.metadata.title) throw new Error("Adventure metadata requires id and title.");
}

function loadState() {
  const saved = localStorage.getItem(storageKey());
  if (!saved) return clone(adventure.initialState);
  try { return JSON.parse(saved); }
  catch { return clone(adventure.initialState); }
}

function saveState() {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

async function loadDefault() {
  const res = await fetch(DEFAULT_ADVENTURE);
  if (!res.ok) throw new Error("Could not load the reference adventure.");
  await activateAdventure(await res.json());
}

async function activateAdventure(pkg) {
  validatePackage(pkg);
  adventure = pkg;
  currentAdventureKey = adventure.metadata.id;
  state = loadState();
  if (!adventure.scenes.some(s => s.id === state.currentSceneId)) {
    state.currentSceneId = adventure.scenes[0].id;
  }
  renderAll();
}

function renderAll() {
  const m = adventure.metadata;
  el("adventure-title").textContent = m.title;
  el("adventure-meta").textContent = `Level ${m.partyLevel} • ${m.partySize} players • ${Math.round(m.durationMinutes/60)} hours • ${m.tone.join(" / ")}`;
  el("quest-objective").textContent = adventure.quest.objective;
  el("quest-stakes").textContent = adventure.quest.stakes;
  el("quest-stage").value = state.questStage;
  renderSceneList();
  renderScene();
  renderMap();
  renderNpcs();
  renderRequiredClues();
  renderRecovery();
  renderAiContext();
}

function currentScene() {
  return adventure.scenes.find(s => s.id === state.currentSceneId) || adventure.scenes[0];
}

function renderSceneList() {
  const list = el("scene-list");
  list.innerHTML = "";
  el("scene-count").textContent = adventure.scenes.length + " scenes";
  adventure.scenes.forEach((scene, index) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "scene-button";
    b.setAttribute("aria-current", String(scene.id === state.currentSceneId));
    b.innerHTML = `<strong>${index + 1}. ${escapeHtml(scene.title)}</strong><small>${scene.estimatedMinutes || "?"} min • ${escapeHtml(scene.pacingClass)}</small>`;
    b.addEventListener("click", () => goToScene(scene.id));
    list.appendChild(b);
  });
}

function renderScene() {
  const scene = currentScene();
  const location = adventure.locations.find(x => x.id === scene.locationId);
  el("scene-kicker").textContent = location ? location.name : "Adventure scene";
  el("scene-title").textContent = scene.title;
  el("scene-purpose").textContent = scene.purpose;
  el("scene-pacing").textContent = `${scene.pacingClass} • ${scene.estimatedMinutes || "?"} min`;
  el("read-aloud").textContent = scene.readAloud || "No read-aloud text.";
  el("gm-notes").innerHTML = (scene.gmNotes || []).map(note => `<li>${escapeHtml(note)}</li>`).join("");

  const sceneClues = (scene.clueIds || []).map(id => adventure.clues.find(c => c.id === id)).filter(Boolean);
  el("scene-clues-wrap").hidden = !sceneClues.length;
  el("scene-clues").innerHTML = "";
  sceneClues.forEach(clue => el("scene-clues").appendChild(clueCard(clue)));

  const encounters = (scene.encounterIds || []).map(id => adventure.encounters.find(e => e.id === id)).filter(Boolean);
  el("scene-encounters-wrap").hidden = !encounters.length;
  el("scene-encounters").innerHTML = encounters.map(enc => `
    <div class="card">
      <strong>${escapeHtml(enc.name)}</strong>
      <p><span class="badge">${escapeHtml(enc.type || "encounter")}</span> <span class="badge">${escapeHtml(enc.difficulty || "")}</span></p>
      <p>${escapeHtml(enc.summary || "")}</p>
      <p class="muted">${escapeHtml(enc.resolution || "")}</p>
    </div>`).join("");

  const idx = adventure.scenes.findIndex(s => s.id === scene.id);
  el("prev-scene").disabled = idx <= 0;
  el("next-scene").disabled = idx >= adventure.scenes.length - 1;
}

function clueCard(clue) {
  const card = document.createElement("div");
  const found = state.discoveredClueIds.includes(clue.id);
  card.className = "card" + (found ? " discovered" : "");
  card.innerHTML = `
    <strong>${escapeHtml(clue.revelation)}</strong>
    <p class="muted">${clue.required ? "Required revelation" : "Optional clue"} • ${clue.sources.length} source(s)</p>
    <div class="card-actions"></div>`;
  const actions = card.querySelector(".card-actions");
  const b = document.createElement("button");
  b.type = "button";
  b.className = "button small " + (found ? "secondary" : "");
  b.textContent = found ? "Mark undiscovered" : "Discover clue";
  b.addEventListener("click", () => toggleClue(clue.id));
  actions.appendChild(b);
  return card;
}

function renderRequiredClues() {
  const required = adventure.clues.filter(c => c.required);
  const foundCount = required.filter(c => state.discoveredClueIds.includes(c.id)).length;
  el("clue-progress").textContent = `${foundCount}/${required.length}`;
  const wrap = el("required-clues");
  wrap.innerHTML = "";
  required.forEach(clue => wrap.appendChild(clueCard(clue)));
}

function toggleClue(id) {
  const idx = state.discoveredClueIds.indexOf(id);
  if (idx >= 0) state.discoveredClueIds.splice(idx, 1);
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
    card.innerHTML = `
      <strong>${escapeHtml(npc.name)}</strong>
      <p>${escapeHtml(npc.role)}</p>
      <p class="muted">${escapeHtml((npc.personality || []).join(" • "))}</p>
      <p><span class="badge">${escapeHtml(npcState.status)}</span> <span class="badge">${escapeHtml(npcState.attitude)}</span></p>
      <div class="card-actions"></div>`;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "button small secondary";
    b.textContent = "AI dialogue context";
    b.addEventListener("click", () => {
      selectedNpcId = npc.id;
      renderAiContext();
      el("ai-context").scrollIntoView({behavior:"smooth", block:"nearest"});
    });
    card.querySelector(".card-actions").appendChild(b);
    wrap.appendChild(card);
  });
}

function renderAiContext() {
  const pre = el("ai-context");
  if (!selectedNpcId) {
    pre.textContent = "No NPC selected.";
    return;
  }
  const npc = adventure.npcs.find(n => n.id === selectedNpcId);
  if (!npc) return;
  const packet = {
    authority: [
      "Do not contradict adventure truth.",
      "Use current game state.",
      "The NPC may state knows as facts and believes as beliefs.",
      "Do not reveal secrets unless a reveal rule is satisfied by the GM.",
      "Never invent quest-critical facts."
    ],
    npc: {
      name: npc.name,
      role: npc.role,
      personality: npc.personality,
      voiceCues: npc.voiceCues,
      wants: npc.wants,
      fears: npc.fears,
      knows: npc.knows,
      believes: npc.believes,
      lies: npc.lies,
      cannotKnow: npc.cannotKnow,
      lockedSecrets: npc.secrets
    },
    currentState: state,
    discoveredRevelations: adventure.clues
      .filter(c => state.discoveredClueIds.includes(c.id))
      .map(c => c.revelation)
  };
  pre.textContent = JSON.stringify(packet, null, 2);
}

function renderRecovery() {
  const wrap = el("recovery-list");
  wrap.innerHTML = "";
  adventure.recovery.routes.forEach(route => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${escapeHtml(route.trigger)}</strong>
      <p>${escapeHtml(route.response)}</p>
      <p class="muted">${escapeHtml((route.stateChanges || []).join(" "))}</p>
      <div class="card-actions"></div>`;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "button small secondary";
    b.textContent = "Apply recovery";
    b.addEventListener("click", () => applyRecovery(route));
    card.querySelector(".card-actions").appendChild(b);
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
  if (patch.setCurrentSceneId && adventure.scenes.some(s => s.id === patch.setCurrentSceneId)) {
    state.currentSceneId = patch.setCurrentSceneId;
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
  if (!mapData) {
    map.textContent = "No map in this package.";
    return;
  }
  mapData.regions.forEach(region => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "map-region";
    if (region.sceneId === state.currentSceneId) b.classList.add("active");
    const scene = adventure.scenes.find(s => s.id === region.sceneId);
    const loc = scene && adventure.locations.find(l => l.id === scene.locationId);
    if (loc && state.locationState[loc.id] && state.locationState[loc.id].revealed) b.classList.add("revealed");
    b.style.left = region.x + "%";
    b.style.top = region.y + "%";
    b.style.width = region.w + "%";
    b.style.height = region.h + "%";
    b.textContent = region.label;
    b.addEventListener("click", () => goToScene(region.sceneId));
    map.appendChild(b);
  });
}

function goToScene(id) {
  const scene = adventure.scenes.find(s => s.id === id);
  if (!scene) return;
  state.currentSceneId = id;
  if (scene.locationId && state.locationState[scene.locationId]) {
    state.locationState[scene.locationId].revealed = true;
  }
  saveState();
  renderAll();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

el("prev-scene").addEventListener("click", () => {
  const idx = adventure.scenes.findIndex(s => s.id === state.currentSceneId);
  if (idx > 0) goToScene(adventure.scenes[idx - 1].id);
});
el("next-scene").addEventListener("click", () => {
  const idx = adventure.scenes.findIndex(s => s.id === state.currentSceneId);
  if (idx >= 0 && idx < adventure.scenes.length - 1) goToScene(adventure.scenes[idx + 1].id);
});
el("quest-stage").addEventListener("change", event => {
  state.questStage = event.target.value;
  saveState();
  renderAiContext();
});
el("reset-state").addEventListener("click", () => {
  if (!adventure || !confirm("Reset this adventure run to its original state?")) return;
  localStorage.removeItem(storageKey());
  state = clone(adventure.initialState);
  selectedNpcId = null;
  renderAll();
  toast("Run reset.");
});
el("file-input").addEventListener("change", async event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    await activateAdventure(JSON.parse(text));
    toast("Adventure loaded.");
  } catch (err) {
    alert("Could not load adventure: " + err.message);
  } finally {
    event.target.value = "";
  }
});

loadDefault().catch(err => {
  document.body.innerHTML = `<main style="padding:2rem;color:white;background:#12100d;min-height:100vh"><h1>One-Shot Forge</h1><p>${escapeHtml(err.message)}</p><p>Deploy or serve this folder through a web server so the reference JSON can load.</p></main>`;
});
