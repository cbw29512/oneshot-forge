(() => {
  "use strict";

  function rewardsForScene(sceneId) {
    try {
      const rewards = adventure?.quickrun?.rewards;
      if (!Array.isArray(rewards)) return [];
      return rewards.filter(reward => reward?.sceneId === sceneId);
    } catch (error) {
      console.error("Could not resolve stage rewards.", error);
      return [];
    }
  }

  function rewardCardHtml(reward) {
    return '<div class="card stage-reward">' +
      '<span class="badge">Reward</span>' +
      '<p><b>When.</b> ' + escapeHtml(reward.when || "When earned") + '</p>' +
      '<p><b>Give.</b> ' + escapeHtml(reward.reward || "") + '</p>' +
      '</div>';
  }

  function renderStageRewards() {
    try {
      const wrap = document.getElementById("scene-rewards-wrap");
      const list = document.getElementById("scene-rewards");
      if (!wrap || !list || typeof currentScene !== "function") return;

      const scene = currentScene();
      const rewards = rewardsForScene(scene?.id);
      wrap.hidden = rewards.length === 0;
      list.innerHTML = rewards.map(rewardCardHtml).join("");
    } catch (error) {
      console.error("Could not render stage rewards.", error);
    }
  }

  try {
    if (typeof renderScene !== "function") {
      console.error("Stage rewards disabled: renderScene is unavailable.");
      return;
    }
    const baseRenderScene = renderScene;
    renderScene = function renderSceneWithRewards() {
      try {
        baseRenderScene();
        renderStageRewards();
      } catch (error) {
        console.error("Stage reward render failed.", error);
        baseRenderScene();
      }
    };
  } catch (error) {
    console.error("Stage rewards could not initialize.", error);
  }
})();
