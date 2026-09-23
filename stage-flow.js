// Compact recovery strip for a GM who loses their place mid-session.
// Uses only authoritative Adventure Package + persisted run state.
(() => {
  "use strict";

  function esc(value) {
    try {
      return typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "");
    } catch (error) {
      console.error("Stage flow: failed to escape value.", error);
      return "";
    }
  }

  function renderStageFlow() {
    try {
      const host = document.getElementById("stage-flow");
      if (!host || !adventure || !state) return;

      const scenes = Array.isArray(adventure.scenes) ? adventure.scenes : [];
      const current = scenes.find(scene => scene.id === state.currentSceneId) || null;
      const required = (adventure.clues || []).filter(clue => clue.required);
      const found = new Set(state.discoveredClueIds || []);
      const foundRequired = required.filter(clue => found.has(clue.id));
      const exits = (current?.exits || [])
        .map(id => scenes.find(scene => scene.id === id))
        .filter(Boolean);
      const finale = scenes.find(scene => /final|ritual|boss/i.test([scene.id, scene.title, scene.purpose].join(" "))) || scenes[scenes.length - 1] || null;

      const route = exits.length
        ? exits.map(scene => esc(scene.title)).join(" / ")
        : "Adventure resolution";
      const clueStatus = required.length
        ? `${foundRequired.length}/${required.length} required revelations found`
        : "No required revelation gate";
      const finaleText = finale
        ? (current?.id === finale.id ? "You are at the finale" : `Reconverges on: ${finale.title}`)
        : "Follow the current stage exits";

      host.innerHTML =
        '<div class="glance-item"><span>You are here</span><strong>' + esc(current?.title || "Unknown stage") + '</strong></div>' +
        '<div class="glance-item"><span>Known truth</span><strong>' + esc(clueStatus) + '</strong></div>' +
        '<div class="glance-item"><span>Route forward</span><strong>' + route + '<br><small>' + esc(finaleText) + '</small></strong></div>';
      host.hidden = false;
    } catch (error) {
      console.error("Stage flow: render failed.", error);
    }
  }

  try {
    if (typeof renderScene !== "function") throw new Error("renderScene is unavailable.");
    const baseRenderScene = renderScene;
    renderScene = function renderSceneWithFlow() {
      try {
        baseRenderScene();
        renderStageFlow();
      } catch (error) {
        console.error("Stage flow: wrapped scene render failed.", error);
        throw error;
      }
    };
    renderStageFlow();
  } catch (error) {
    console.error("Stage flow: initialization failed.", error);
  }
})();
