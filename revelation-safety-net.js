// Live zero-prep safety net for plot-critical revelations.
// Shows authored backup delivery routes on the active Stage Card only after play has progressed.
(() => {
  "use strict";

  function unresolvedRequiredClues() {
    try {
      if (!adventure || !state) return [];
      const discovered = new Set(state.discoveredClueIds || []);
      return (adventure.clues || []).filter(clue => clue.required && !discovered.has(clue.id));
    } catch (error) {
      console.error("Revelation safety net: failed to calculate unresolved clues.", error);
      return [];
    }
  }

  function renderSafetyNet() {
    try {
      const stage = document.getElementById("active-scene");
      const exits = document.getElementById("scene-exits-wrap");
      if (!stage || !exits) return;

      let panel = document.getElementById("revelation-safety-net");
      if (!panel) {
        panel = document.createElement("section");
        panel.id = "revelation-safety-net";
        panel.className = "dm-box";
        panel.setAttribute("aria-live", "polite");
        exits.parentNode.insertBefore(panel, exits);
      }

      const progressed = typeof hasRunProgressed === "function" && hasRunProgressed();
      const unresolved = progressed ? unresolvedRequiredClues() : [];
      panel.hidden = !unresolved.length;
      if (!unresolved.length) {
        panel.innerHTML = "";
        return;
      }

      panel.innerHTML =
        '<p class="box-label">Plot safety net — GM only</p>' +
        '<p><b>' + unresolved.length + ' required revelation' + (unresolved.length === 1 ? '' : 's') +
        ' still unresolved.</b> If the party bypassed the expected source, use one of these authored backups. Do not invent or move facts silently.</p>' +
        unresolved.map(clue =>
          '<div class="card"><strong>' + escapeHtml(clue.revelation) + '</strong>' +
          '<p class="muted">Remaining authored delivery options:</p><ul>' +
          (clue.sources || []).map(source => '<li>' + escapeHtml(source) + '</li>').join('') +
          '</ul></div>'
        ).join('');
    } catch (error) {
      console.error("Revelation safety net: failed to render.", error);
    }
  }

  try {
    if (typeof renderScene !== "function") {
      console.error("Revelation safety net: renderScene is unavailable.");
      return;
    }
    const baseRenderScene = renderScene;
    renderScene = function renderSceneWithSafetyNet() {
      try {
        baseRenderScene();
        renderSafetyNet();
      } catch (error) {
        console.error("Revelation safety net: stage render failed.", error);
        baseRenderScene();
      }
    };
    renderSafetyNet();
  } catch (error) {
    console.error("Revelation safety net: initialization failed.", error);
  }
})();
