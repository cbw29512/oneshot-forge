/* OwlBear Arms: live, local-only controls layered over the immutable printable sheets. */
(function (root) {
  "use strict";
  const stateApi = root.OwlbearPlayState;
  const escape = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function slotRows(pc, state) {
    return Object.entries(pc.spellcasting?.slots || {}).map(([level, max]) => {
      const spent = state.slotsUsed[level] || 0;
      const marks = Array.from({ length: max }, (_, i) =>
        '<span class="play-slot-dot' + (i < spent ? ' used' : '') + '" aria-hidden="true"></span>').join("");
      return '<div class="play-slot-row"><strong>Level ' + escape(level) + '</strong><span class="play-slot-marks">' +
        marks + '</span><span>' + (max - spent) + ' / ' + max + ' left</span>' +
        '<button type="button" data-play-action="slot-restore" data-level="' + escape(level) + '" aria-label="Restore level ' + escape(level) + ' slot">− spent</button>' +
        '<button type="button" data-play-action="slot-use" data-level="' + escape(level) + '" aria-label="Use level ' + escape(level) + ' slot">+ spent</button></div>';
    }).join("");
  }
  function trackerMarkup(pc, state) {
    const max = Math.max(1, Number(pc.hp) || 1);
    const percent = Math.round(100 * state.currentHp / max);
    const slots = slotRows(pc, state);
    return '<div class="play-console-head"><div><span class="play-kicker">TABLE MODE</span><h3>Combat tracker</h3></div>' +
      '<button type="button" class="play-reset" data-play-action="reset">Reset this hero</button></div>' +
      '<div class="play-console-grid"><section class="play-hp-box" aria-label="Hit points">' +
      '<div class="play-hp-line"><span>Current HP</span><strong aria-live="polite">' + state.currentHp + ' <small>/ ' + max + '</small></strong></div>' +
      '<div class="play-hp-track" role="meter" aria-label="Current hit points" aria-valuemin="0" aria-valuemax="' + max +
      '" aria-valuenow="' + state.currentHp + '"><span style="width:' + percent + '%"></span></div>' +
      '<p class="play-temporary">Temporary HP <strong>' + state.tempHp + '</strong></p>' +
      '<div class="play-actions"><label>HP change <input data-play-amount type="number" min="1" max="9999" value="1" inputmode="numeric"></label>' +
      '<button type="button" data-play-action="damage">Damage</button><button type="button" data-play-action="heal">Heal</button></div>' +
      '<div class="play-actions"><label>Set temporary HP <input data-play-temp type="number" min="0" max="999" value="' +
      state.tempHp + '" inputmode="numeric"></label><button type="button" data-play-action="temp">Set temp HP</button></div></section>' +
      '<section class="play-status-box" aria-label="Combat status">' +
      '<div class="play-toggle-row"><button type="button" data-play-action="inspiration" aria-pressed="' + state.inspiration +
      '">Inspiration ' + (state.inspiration ? '✓' : '○') + '</button>' +
      '<button type="button" data-play-action="concentration" aria-pressed="' + state.concentrating +
      '">Concentrating ' + (state.concentrating ? '✓' : '○') + '</button></div>' +
      '<h4>Death saving throws</h4><div class="play-death-row"><span>Successes <b>' +
      '●'.repeat(state.deathSuccesses) + '○'.repeat(3 - state.deathSuccesses) + '</b></span>' +
      '<button type="button" data-play-action="death-success">+ Success</button></div>' +
      '<div class="play-death-row"><span>Failures <b>' + '●'.repeat(state.deathFailures) +
      '○'.repeat(3 - state.deathFailures) + '</b></span>' +
      '<button type="button" data-play-action="death-failure">+ Failure</button></div>' +
      '<button type="button" class="play-reset" data-play-action="death-reset">Clear death saves</button></section></div>' +
      (slots ? '<section class="play-spell-slots"><h4>Spell slots</h4>' + slots + '</section>' : '') +
      '<p class="play-footnote">Tracks only what you enter. Saved in this browser; does not change the character or printed sheets.</p>';
  }
  function initOwlbearPlay(host, characters) {
    try {
      if (!stateApi || !host || !Array.isArray(characters) || !characters.length) throw new Error("OwlBear play prerequisites unavailable");
      const pcs = new Map(characters.map(pc => [pc.id, pc]));
      const sheets = new Map(characters.map(pc => [pc.id, host.querySelector('.screen-sheet[id="' + pc.id + '"]')]));
      if ([...sheets.values()].some(sheet => !sheet)) throw new Error("A hero sheet is missing");
      let saved = {};
      try { saved = JSON.parse(root.localStorage.getItem(stateApi.STORE_KEY) || "{}") || {}; }
      catch (error) { console.warn("OwlBear state not available; using defaults", error); }
      const state = { selected: pcs.has(saved.selected) ? saved.selected : characters[0].id, byId: {} };
      for (const pc of characters) state.byId[pc.id] = stateApi.normalize(pc, saved.byId?.[pc.id]);
      const chooser = document.createElement("nav");
      chooser.className = "play-roster print-hide";
      chooser.setAttribute("aria-label", "Choose a character");
      for (const pc of characters) {
        const button = document.createElement("button");
        button.type = "button"; button.dataset.playSelect = pc.id;
        button.className = "play-hero-option";
        const initial = document.createElement("span"); initial.className = "play-avatar";
        initial.textContent = pc.name.slice(0, 1).toUpperCase();
        const label = document.createElement("span"); label.className = "play-hero-name";
        label.textContent = pc.name;
        const klass = document.createElement("small"); klass.textContent = pc.className + " · Level " + pc.level;
        label.appendChild(klass); button.append(initial, label); chooser.appendChild(button);
        const consolePanel = document.createElement("section");
        consolePanel.className = "play-console print-hide";
        sheets.get(pc.id).querySelector(".beyond-combat").insertAdjacentElement("afterend", consolePanel);
      }
      host.prepend(chooser);
      const persist = () => {
        try { root.localStorage.setItem(stateApi.STORE_KEY, JSON.stringify(state)); }
        catch (error) { console.warn("OwlBear session could not be saved", error); }
      };
      const render = () => {
        for (const pc of characters) {
          const active = pc.id === state.selected;
          sheets.get(pc.id).hidden = !active;
          const tab = chooser.querySelector('[data-play-select="' + pc.id + '"]');
          tab.setAttribute("aria-pressed", String(active));
          if (active) sheets.get(pc.id).querySelector(".play-console").innerHTML = trackerMarkup(pc, state.byId[pc.id]);
        }
      };
      host.addEventListener("click", event => {
        try {
          const choice = event.target.closest("[data-play-select]");
          if (choice && pcs.has(choice.dataset.playSelect)) { state.selected = choice.dataset.playSelect; render(); persist(); return; }
          const button = event.target.closest("[data-play-action]");
          if (!button) return;
          const sheet = button.closest(".screen-sheet");
          if (!sheet || sheet.id !== state.selected) return;
          const pc = pcs.get(sheet.id);
          if (!pc) throw new Error("Unknown selected hero");
          const type = button.dataset.playAction;
          if (type === "reset" && !root.confirm("Reset " + pc.name + "'s tracked HP, spell slots, and status?")) return;
          const input = sheet.querySelector(type === "temp" ? "[data-play-temp]" : "[data-play-amount]");
          const amount = input ? input.value : undefined;
          state.byId[pc.id] = stateApi.change(pc, state.byId[pc.id], { type, level: button.dataset.level, amount });
          render(); persist();
        } catch (error) { console.error("OwlBear sheet interaction failed", error); }
      });
      render();
    } catch (error) { console.error("OwlBear live sheets could not start", error); }
  }
  root.initOwlbearPlay = initOwlbearPlay;
})(window);
