// Compact table-facing summary for the active Stage Card.
// Derived from the authoritative Adventure Package; no duplicate adventure prose.
(() => {
  "use strict";

  function esc(value) {
    try {
      return typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "");
    } catch (error) {
      console.error("Stage glance: failed to escape value.", error);
      return "";
    }
  }

  function activeScene() {
    try {
      if (!adventure?.scenes || !state?.currentSceneId) return null;
      return adventure.scenes.find(scene => scene.id === state.currentSceneId) || null;
    } catch (error) {
      console.error("Stage glance: failed to resolve active scene.", error);
      return null;
    }
  }

  function renderStageGlance() {
    try {
      const host = document.getElementById("stage-glance");
      if (!host) return;
      const scene = activeScene();
      if (!scene) {
        host.hidden = true;
        host.innerHTML = "";
        return;
      }

      const checks = typeof tableChecksFor === "function" ? tableChecksFor(scene.id) : [];
      const encounterCount = (scene.encounterIds || []).length;
      const exitCount = (scene.exits || []).length;
      const pressure = [
        scene.estimatedMinutes ? scene.estimatedMinutes + " min" : null,
        encounterCount ? encounterCount + " encounter" + (encounterCount === 1 ? "" : "s") : null,
        checks.length ? checks.length + " keyed check" + (checks.length === 1 ? "" : "s") : null
      ].filter(Boolean).join(" · ") || "Roleplay / exploration";

      host.innerHTML =
        '<div class="glance-item"><span>Objective</span><strong>' + esc(scene.purpose || "Advance this stage and follow the players’ choice.") + '</strong></div>' +
        '<div class="glance-item"><span>Pressure</span><strong>' + esc(pressure) + '</strong></div>' +
        '<div class="glance-item"><span>Decision</span><strong>' + esc(exitCount > 1 ? exitCount + " meaningful next choices" : exitCount === 1 ? "1 clear transition" : "Resolve the adventure") + '</strong></div>';
      host.hidden = false;
    } catch (error) {
      console.error("Stage glance: render failed.", error);
    }
  }

  try {
    if (typeof renderScene !== "function") throw new Error("renderScene is unavailable.");
    const baseRenderScene = renderScene;
    renderScene = function renderSceneWithGlance() {
      try {
        baseRenderScene();
        renderStageGlance();
      } catch (error) {
        console.error("Stage glance: wrapped scene render failed.", error);
        throw error;
      }
    };
    renderStageGlance();
  } catch (error) {
    console.error("Stage glance: initialization failed.", error);
  }
})();