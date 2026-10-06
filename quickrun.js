const QUICKRUN_PACKS = window.ONE_SHOT_ADVENTURES;
if (!QUICKRUN_PACKS) throw new Error("Adventure registry failed to load.");
const QUICKRUN_DEFAULT = QUICKRUN_PACKS["the-lantern-below"];
const PACKAGE_DEFAULT = QUICKRUN_DEFAULT;

const qrEsc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

function qrList(items) {
  return (items || []).map(item => `<li>${qrEsc(item)}</li>`).join("");
}

function renderCreature(creature) {
  const lines = [creature.attack, creature.ranged, creature.action, creature.reaction, creature.trait]
    .filter(Boolean);
  return `<div class="encounter-block"><h4>${qrEsc(creature.count)}× ${qrEsc(creature.name)}</h4>
    <div class="statline"><div><span>AC</span><b>${qrEsc(creature.ac)}</b></div><div><span>HP</span><b>${qrEsc(creature.hp)}</b></div><div><span>Speed</span><b>${qrEsc(creature.speed)}</b></div>${creature.cr !== undefined ? `<div><span>CR</span><b>${qrEsc(creature.cr)}</b></div>` : ""}</div>
    ${creature.statBlock ? `<p><span class="label">Stat block.</span> ${qrEsc(creature.statBlock)}${creature.xp ? ` (${qrEsc(creature.xp)} XP)` : ""}</p>` : ""}
    ${creature.saves ? `<p><span class="label">Saves.</span> ${qrEsc(creature.saves)}</p>` : ""}
    ${creature.resistances ? `<p><span class="label">Resistances.</span> ${qrEsc(creature.resistances)}</p>` : ""}
    ${creature.immunities ? `<p><span class="label">Immunities.</span> ${qrEsc(creature.immunities)}</p>` : ""}
    ${lines.map(line => `<p>${qrEsc(line)}</p>`).join("")}
    ${creature.edition2024 ? `<p><span class="label">2024 rules (SRD 5.2.1).</span> ${qrEsc(creature.edition2024)}</p>` : ""}
    <p><span class="label">Tactics.</span> ${qrEsc(creature.tactics)}</p></div>`;
}

function renderQuickrun(data) {
  const host = document.getElementById("quickrun-reference");
  if (!host) return;
  host.innerHTML = `<h2>Zero-Prep Quick Run</h2>
    <p class="section-intro">Everything below is adventure-specific table material. Keep this section open during play.</p>
    <h3>Checks & Consequences</h3>${data.checks.map(check => `<div class="gm-box"><p><b>${qrEsc(check.label)} — ${check.dc ? `DC ${qrEsc(check.dc)}` : "No roll"}</b> • ${qrEsc(check.ability)}</p><p><span class="label">Success.</span> ${qrEsc(check.success)}</p><p><span class="label">Failure.</span> ${qrEsc(check.failure)}</p></div>`).join("")}
    <h3>Encounter Quick-Runs</h3>${data.encounters.map(enc => `<article class="npc-card"><h3>${qrEsc(enc.id.replace("enc-", "").replaceAll("-", " "))}</h3><p><span class="label">Objective.</span> ${qrEsc(enc.objective)}</p><p>${qrEsc(enc.start)}</p>${(enc.creatures || []).map(renderCreature).join("")}${enc.balance ? `<p><span class="label">Balance.</span> ${qrEsc(enc.balance)}</p>` : ""}${enc.scaling ? `<p><span class="label">Party size.</span> ${qrEsc(enc.scaling)}</p>` : ""}${enc.bypass ? `<p><span class="label">Bypass.</span> ${qrEsc(enc.bypass)}</p>` : ""}${enc.ritual ? `<p><span class="label">Binding.</span> ${qrEsc(enc.ritual)}</p>` : ""}${enc.destroy ? `<p><span class="label">Destroy.</span> ${qrEsc(enc.destroy)}</p>` : ""}${enc.bargain ? `<p><span class="label">Bargain.</span> ${qrEsc(enc.bargain)}</p>` : ""}<p><span class="label">End.</span> ${qrEsc(enc.end)}</p></article>`).join("")}
    <h3>Hazards</h3>${data.hazards.map(h => `<div class="gm-box"><p><b>${qrEsc(h.trigger)}</b> — ${qrEsc(h.save)}</p><p><span class="label">Failure.</span> ${qrEsc(h.failure)}</p><p><span class="label">Success.</span> ${qrEsc(h.success)}</p><p><span class="label">Fail forward.</span> ${qrEsc(h.failForward)}</p></div>`).join("")}
    <h3>Rewards</h3><ul>${qrList(data.rewards.map(r => `${r.when} — ${r.reward}`))}</ul>
    <h3>Map Callouts</h3>${data.mapNotes.map(map => `<div class="gm-box"><p><b>${qrEsc(map.sceneId)}</b> • ${qrEsc(map.dimensions)}</p><ul>${qrList(map.features)}</ul></div>`).join("")}`;
}

async function loadQuickrun() {
  try {
    const id = new URLSearchParams(location.search).get("id");
    const url = (id && QUICKRUN_PACKS[id]) || PACKAGE_DEFAULT;
    const packRes = await fetch(url);
    if (packRes.ok) {
      const pkg = await packRes.json();
      if (pkg.quickrun) {
        renderQuickrun(pkg.quickrun);
        return;
      }
    }
    throw new Error("No quickrun in pack");
  } catch (error) {
    console.error("[quickrun] Could not load zero-prep reference", error);
    const host = document.getElementById("quickrun-reference");
    if (host) host.innerHTML = `<h2>Zero-Prep Quick Run</h2><p>Quick-run reference unavailable. ${qrEsc(error.message)}</p>`;
  }
}

loadQuickrun();