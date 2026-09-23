// Zero-prep finale scaling for authored adventures.
// Keeps party-size adjustments on the active Stage Card instead of in a side reference.
(() => {
  "use strict";

  const SCALE_FILES = {
    "the-lantern-below": "data/adventures/the-lantern-below.finale-scaling.json"
  };
  let scaling = null;

  function selectedPartySize() {
    try {
      const raw = new URLSearchParams(window.location.search).get("party");
      const requested = Number(raw);
      if (Number.isInteger(requested) && requested >= 3 && requested <= 6) return requested;
      return Number(adventure?.metadata?.partySize) || 4;
    } catch (error) {
      console.error("Finale scaling: failed to resolve party size.", error);
      return 4;
    }
  }

  function renderFinaleScaling() {
    try {
      const exits = document.getElementById("scene-exits-wrap");
      if (!exits || !scaling || !state || state.currentSceneId !== scaling.sceneId) {
        document.getElementById("finale-scaling")?.remove();
        return;
      }

      const partySize = selectedPartySize();
      const rule = (scaling.partyScaling || []).find(item => item.partySize === partySize);
      if (!rule) {
        console.error("Finale scaling: no authored rule for party size", partySize);
        return;
      }

      let panel = document.getElementById("finale-scaling");
      if (!panel) {
        panel = document.createElement("section");
        panel.id = "finale-scaling";
        panel.className = "dm-box";
        exits.parentNode.insertBefore(panel, exits);
      }
      panel.innerHTML =
        '<p class="box-label">Finale scaling — GM only</p>' +
        '<p><b>' + escapeHtml(partySize) + ' players.</b> ' + escapeHtml(rule.gmCue || "") + '</p><ul>' +
        (rule.adjustments || []).map(item => '<li>' + escapeHtml(item) + '</li>').join("") +
        '</ul>';
    } catch (error) {
      console.error("Finale scaling: failed to render.", error);
    }
  }

  async function loadScaling() {
    try {
      if (!adventure?.metadata?.id) return;
      const path = SCALE_FILES[adventure.metadata.id];
      if (!path) return;
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status + " loading " + path);
      const data = await response.json();
      if (data.adventureId !== adventure.metadata.id) throw new Error("Scaling adventureId does not match active adventure.");
      scaling = data;
      renderFinaleScaling();
    } catch (error) {
      scaling = null;
      console.error("Finale scaling: failed to load authored scaling.", error);
    }
  }

  try {
    if (typeof renderScene !== "function") {
      console.error("Finale scaling: renderScene is unavailable.");
      return;
    }
    const baseRenderScene = renderScene;
    renderScene = function renderSceneWithFinaleScaling() {
      try {
        baseRenderScene();
        renderFinaleScaling();
      } catch (error) {
        console.error("Finale scaling: stage render failed.", error);
        baseRenderScene();
      }
    };
    loadScaling();
  } catch (error) {
    console.error("Finale scaling: initialization failed.", error);
  }
})();
