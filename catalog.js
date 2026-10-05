(() => {
  "use strict";

  function labelFor(product) {
    if (product.currentAccess === "free-starter") return "FREE · Complete adventure";
    if (product.currentAccess === "free-preview") {
      return product.format === "download-bundle" ? "FREE · Review bundle" : "FREE · Playtest adventure";
    }
    return "In development";
  }

  function hasLocalProgress(productId) {
    try {
      const raw = localStorage.getItem("oneshot-forge:state:" + productId);
      if (!raw) return false;
      const state = JSON.parse(raw);
      if ((state.sceneHistory || []).length) return true;
      if ((state.discoveredClueIds || []).length) return true;
      return Object.values(state.completedRunSteps || {}).some(steps =>
        Array.isArray(steps) && steps.some(Boolean)
      );
    } catch (error) {
      console.warn(`OneShot Forge could not inspect saved progress for ${productId}`, error);
      return false;
    }
  }

  function configureAction(action, product) {
    const resume = hasLocalProgress(product.id);
    if (product.format === "download-bundle") {
      action.textContent = "Download free kit";
      return;
    }
    action.textContent = resume ? "Resume as DM" : "Run as DM";
    action.dataset.commercialState = "free";
  }

  function applyProduct(product) {
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!card) return;
    const status = card.querySelector("[data-product-status]");
    if (status) status.textContent = labelFor(product);
    const action = card.querySelector("[data-product-action]");
    if (action) configureAction(action, product);
  }

  async function hydrateCatalog() {
    try {
      const response = await fetch("data/products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`product contract HTTP ${response.status}`);
      const contract = await response.json();
      if (!Array.isArray(contract.products)) throw new Error("product contract has no products array");
      contract.products.forEach(applyProduct);
    } catch (error) {
      console.error("OneShot Forge catalog hydration failed", error);
    }
  }

  hydrateCatalog();
})();
