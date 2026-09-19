const PACKAGE_PREFIX = "oneshot-forge:package:";
const LAST_ADVENTURE_KEY = "oneshot-forge:last-adventure";
const DEFAULT_ADVENTURE = "data/adventures/the-lantern-below.oneshot.json";

const el = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

function readLocal(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

async function loadAdventure() {
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("id") || readLocal(LAST_ADVENTURE_KEY);
  if (requestedId) {
    const raw = readLocal(PACKAGE_PREFIX + requestedId);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
  }
  const response = await fetch(DEFAULT_ADVENTURE);
  if (!response.ok) throw new Error("Could not load an adventure.");
  return response.json();
}

function list(values) {
  return (values || []).map(value => "<li>" + esc(value) + "</li>").join("");
}

function renderMeta(adventure) {
  const m = adventure.metadata;
  el("module-title").textContent = m.title;
  document.title = m.title + " — One-Shot Forge";
  el("module-subtitle").textContent = adventure.quest.objective;
  el("cover-pitch").textContent = adventure.setup?.pitch || adventure.quest.stakes;
  el("cover-meta").innerHTML = [
    "Level " + m.partyLevel,
    m.partySize + " players",
    Math.round(m.durationMinutes/60) + " hours",
    ...(m.tone || [])
  ].map(value => '<span class="meta-chip">' + esc(value) + '</span>').join("");

  const requiredClues = adventure.clues.filter(clue => clue.required).length;
  el("glance-grid").innerHTML = [
    ["Objective", adventure.quest.objective],
    ["Stakes", adventure.quest.stakes],
    ["Deadline", adventure.quest.deadline],
    ["Structure", adventure.scenes.length + " scenes • " + adventure.encounters.length + " encounters • " + requiredClues + " required revelations"]
  ].map(([label,value]) =>
    '<div class="glance-card"><strong>' + esc(label) + '</strong><span>' + esc(value) + '</span></div>'
  ).join("");

  el("adventure-summary").textContent = adventure.setup?.gmSummary || adventure.quest.objective;
  const truth = (adventure.truth?.facts || []).map(fact => fact.text).join(" ");
  el("adventure-background").textContent =
    truth || "The adventure's background is established by its central quest, NPC motives, and hidden truths.";

  el("running-notes").innerHTML =
    '<div class="gm-box"><ul>' +
    '<li>Keep the deadline visible: <b>' + esc(adventure.quest.deadline) + '</b>.</li>' +
    '<li>Required revelations have backup delivery sources. Never stall the adventure because one clue source was missed.</li>' +
    '<li>Reward clever bypasses. Preserve established facts, not a predetermined route.</li>' +
    '<li>Reserve approximately ' + esc(adventure.pacing?.bossReserveMinutes || "?") + ' minutes for the finale.</li>' +
    '</ul></div>';
}

function renderNpcs(adventure) {
  el("npc-appendix").innerHTML = adventure.npcs.map(npc =>
    '<article class="npc-card">' +
    '<h3>' + esc(npc.name) + '</h3>' +
    '<p><span class="label">Role.</span> ' + esc(npc.role) + '</p>' +
    '<p><span class="label">Personality.</span> ' + esc((npc.personality || []).join(", ")) + '</p>' +
    '<p><span class="label">Wants.</span> ' + esc((npc.wants || []).join("; ")) + '</p>' +
    '<p><span class="label">Knows.</span> ' + esc((npc.knows || []).join("; ")) + '</p>' +
    '<p><span class="label">Secrets.</span> ' + esc((npc.secrets || []).join("; ")) + '</p>' +
    '<p><span class="label">Use in play.</span> ' + esc(npc.questFunction || npc.role) + '</p>' +
    '</article>'
  ).join("");
}

function renderFlow(adventure) {
  const nodes = [];
  adventure.scenes.forEach((scene,index) => {
    if (index) nodes.push('<span class="flow-arrow">→</span>');
    nodes.push('<span class="flow-node">' + (index+1) + '. ' + esc(scene.title) + '</span>');
  });
  el("flow-map").innerHTML = nodes.join("");
}

function encounterBlock(encounter) {
  const m = encounter.mechanics;
  const stats = m ? (
    '<div class="statline">' +
      '<div><span>Count</span><b>' + esc(m.count) + '</b></div>' +
      '<div><span>AC</span><b>' + esc(m.ac) + '</b></div>' +
      '<div><span>HP</span><b>' + esc(m.hpEach) + '</b></div>' +
      '<div><span>Save DC</span><b>' + esc(m.saveDC) + '</b></div>' +
    '</div>' +
    '<p><span class="label">Attack.</span> ' + esc(m.basicAttack) + '</p>' +
    (m.attacksPerTurn > 1 ? '<p><span class="label">Multiattack.</span> ' + esc(m.attacksPerTurn) + ' attacks per turn.</p>' : '') +
    '<p><span class="label">Signature.</span> ' + esc(m.signature) + '</p>'
  ) : "";
  return '<div class="encounter-block">' +
    '<h3>' + esc(encounter.name) + '</h3>' +
    '<p><span class="label">' + esc(encounter.type || "Encounter") + '.</span> ' + esc(encounter.summary || "") + '</p>' +
    stats +
    '<p><span class="label">Resolution.</span> ' + esc(encounter.resolution || "") + '</p>' +
    '</div>';
}

function renderScenes(adventure) {
  el("scene-chapters").innerHTML = adventure.scenes.map((scene,index) => {
    const location = adventure.locations.find(item => item.id === scene.locationId);
    const encounters = (scene.encounterIds || [])
      .map(id => adventure.encounters.find(item => item.id === id))
      .filter(Boolean);
    const clues = (scene.clueIds || [])
      .map(id => adventure.clues.find(item => item.id === id))
      .filter(Boolean);
    const puzzles = (adventure.puzzles || []).filter(item => item.locationId === scene.locationId);
    const exits = (scene.exits || [])
      .map(id => adventure.scenes.find(item => item.id === id)?.title)
      .filter(Boolean);

    return '<article class="scene-chapter">' +
      '<div class="scene-headline"><div>' +
        '<div class="scene-number">Scene ' + (index+1) + '</div>' +
        '<h2>' + esc(scene.title) + '</h2>' +
      '</div><div class="scene-meta">' + esc(scene.estimatedMinutes || "?") + ' min • ' + esc(scene.pacingClass || "core") + '</div></div>' +
      '<p><span class="label">Location.</span> ' + esc(location?.name || "Unspecified") + '</p>' +
      '<p><span class="label">Purpose.</span> ' + esc(scene.purpose || "") + '</p>' +
      '<h3>Read Aloud</h3>' +
      '<div class="boxed-text">' + esc(scene.readAloud || "No boxed text.") + '</div>' +
      '<h3>GM Guidance</h3>' +
      '<div class="gm-box"><ul>' + list(scene.gmNotes || []) + '</ul></div>' +
      (clues.length ? '<h3>Revelations</h3>' + clues.map(clue =>
        '<div class="clue-card"><b>' + esc(clue.revelation) + '</b><ul>' + list(clue.sources) + '</ul></div>'
      ).join("") : '') +
      (puzzles.length ? '<h3>Puzzle</h3>' + puzzles.map(puzzle =>
        '<div class="gm-box"><p><b>' + esc(puzzle.name) + '</b></p><p>' + esc(puzzle.prompt) + '</p><p><span class="label">Solution.</span> ' + esc(puzzle.solution) + '</p><p><span class="label">Fail forward.</span> ' + esc(puzzle.failForward) + '</p></div>'
      ).join("") : '') +
      (encounters.length ? '<h3>Encounters</h3>' + encounters.map(encounterBlock).join("") : '') +
      (exits.length ? '<h3>Development</h3><p>From here, the party can continue to ' + esc(exits.join(" or ")) + '.</p>' : '<h3>Development</h3><p>This scene concludes the adventure.</p>') +
      '</article>';
  }).join("");
}

function renderClues(adventure) {
  el("clue-matrix").innerHTML = '<div class="clue-grid">' + adventure.clues.map(clue =>
    '<article class="clue-card">' +
      '<h3>' + esc(clue.required ? "Required Revelation" : "Optional Revelation") + '</h3>' +
      '<p><b>' + esc(clue.revelation) + '</b></p>' +
      '<p class="label">Available from:</p><ul>' + list(clue.sources) + '</ul>' +
    '</article>'
  ).join("") + '</div>';
}

function renderEndings(adventure) {
  el("ending-list").innerHTML = adventure.endings.map(ending =>
    '<article class="ending-card">' +
      '<h3>' + esc(ending.name) + '</h3>' +
      '<p><span class="label">Trigger.</span> ' + esc(ending.condition) + '</p>' +
      '<p><span class="label">Result.</span> ' + esc(ending.result) + '</p>' +
    '</article>'
  ).join("");
}

function renderRecovery(adventure) {
  el("recovery-guide").innerHTML = adventure.recovery.routes.map(route =>
    '<article class="recovery-card">' +
      '<h3>' + esc(route.trigger) + '</h3>' +
      '<p>' + esc(route.response) + '</p>' +
      '<p><span class="label">State change.</span> ' + esc((route.stateChanges || []).join(" ")) + '</p>' +
    '</article>'
  ).join("");
}

async function render() {
  const adventure = await loadAdventure();
  renderMeta(adventure);
  renderNpcs(adventure);
  renderFlow(adventure);
  renderScenes(adventure);
  renderClues(adventure);
  renderEndings(adventure);
  renderRecovery(adventure);
}

el("print-module").addEventListener("click", () => window.print());

render().catch(error => {
  el("module").innerHTML = '<section class="module-section"><h1>Could not render module</h1><p>' + esc(error.message) + '</p></section>';
});