(() => {
  "use strict";

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  function commerceFor(product) {
    return product.commerce || {};
  }

  function deliveryReady(product) {
    const delivery = product.delivery || {};
    return Boolean(
      (!delivery.browserRequiredForPaid || delivery.browserReady) &&
      (!delivery.zipRequiredForPaid || delivery.zipReady) &&
      delivery.printReady
    );
  }

  function releaseGate(product) {
    const gate = product.releaseGate || {};
    const commerce = commerceFor(product);
    return Boolean(
      product.sellable &&
      gate.approved &&
      gate.dmPlaytestApproved &&
      gate.checkoutConfigured &&
      deliveryReady(product) &&
      commerce.provider &&
      commerce.checkoutUrl &&
      commerce.entitlementMode === "server-verified" &&
      commerce.entitlementVerificationUrl
    );
  }

  function checkoutReturn() {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        productId: params.get("checkout_return") || "",
        sessionId: params.get("session_id") || "",
      };
    } catch (error) {
      console.error("99¢ One-Shots could not inspect checkout return", error);
      return { productId: "", sessionId: "" };
    }
  }

  function clearCheckoutReturn() {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("checkout_return") && !url.searchParams.has("session_id")) return;
      url.searchParams.delete("checkout_return");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (error) {
      console.error("99¢ One-Shots could not clear checkout return", error);
    }
  }

  function labelFor(product, entitlement) {
    if (entitlement === "owned") return "Owned · Ready to run";
    if (releaseGate(product)) return `${money.format(product.priceCents / 100)} · Ready to buy`;
    if (product.currentAccess === "free-starter") return "FREE STARTER · Complete adventure";
    if (product.currentAccess === "free-preview") return product.format === "download-bundle"
      ? "Review build · Download kit" : "Playtest preview · Not for sale";
    return "Coming after review";
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
      console.warn(`One-Shot Forge could not inspect saved progress for ${productId}`, error);
      return false;
    }
  }

  function configureAction(action, product, entitlement) {
    const owned = entitlement === "owned";
    const canSell = releaseGate(product) && !owned;
    const resume = hasLocalProgress(product.id);
    action.textContent = canSell
      ? `Buy ${money.format(product.priceCents / 100)}`
      : product.format === "download-bundle" ? "Download complete kit"
      : resume ? "Resume game" : "Run now";
    action.dataset.commercialState = owned ? "owned" : canSell ? "sellable" : "preview";

    if (canSell) {
      const checkoutUrl = commerceFor(product).checkoutUrl;
      action.dataset.checkoutUrl = checkoutUrl;
      action.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const originalText = action.textContent;
        action.setAttribute("aria-busy", "true");
        action.textContent = "Opening secure checkout…";

        try {
          const response = await fetch(checkoutUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "content-type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ productId: product.id }),
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.url) {
            throw new Error(result.error || `checkout HTTP ${response.status}`);
          }

          const target = new URL(result.url);
          if (target.protocol !== "https:" || !/\.stripe\.com$/i.test(target.hostname)) {
            throw new Error("checkout response was not a Stripe HTTPS URL");
          }

          window.location.assign(target.href);
        } catch (error) {
          action.removeAttribute("aria-busy");
          action.textContent = originalText;
          console.error(`99¢ One-Shots checkout blocked for ${product.id}`, error);
          window.alert("Secure checkout could not be opened. Please try again.");
        }
      });
    }
  }

  function applyProduct(product, entitlement = "none") {
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!card) return;
    const status = card.querySelector("[data-product-status]");
    if (status) status.textContent = labelFor(product, entitlement);
    const action = card.querySelector("[data-product-action]");
    if (action) configureAction(action, product, entitlement);
  }

  async function verifiedEntitlement(product, sessionId = "") {
    const endpoint = commerceFor(product).entitlementVerificationUrl || product.entitlementVerificationUrl;
    if (!endpoint) return "none";
    try {
      const url = new URL(endpoint, window.location.href);
      url.searchParams.set("productId", product.id);
      if (sessionId) url.searchParams.set("session_id", sessionId);
      const response = await fetch(url.href, { cache: "no-store", credentials: "include", headers: { Accept: "application/json" } });
      if (!response.ok) return "none";
      const result = await response.json();
      return result && result.productId === product.id && result.access === "owned" ? "owned" : "none";
    } catch (error) {
      console.error(`One-Shot Forge entitlement verification failed for ${product.id}`, error);
      return "none";
    }
  }

  async function hydrateCatalog() {
    try {
      const response = await fetch("data/products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`product contract HTTP ${response.status}`);
      const contract = await response.json();
      if (!Array.isArray(contract.products)) throw new Error("product contract has no products array");

      const returned = checkoutReturn();
      await Promise.all(contract.products.map(async (product) => {
        const returnSessionId = returned.productId === product.id ? returned.sessionId : "";
        const entitlement = await verifiedEntitlement(product, returnSessionId);
        applyProduct(product, entitlement);
        if (returned.productId === product.id && entitlement !== "owned") {
          console.warn(`99¢ One-Shots checkout returned before ownership was verified for ${product.id}`);
        }
      }));
      clearCheckoutReturn();
    } catch (error) {
      // Fail closed: static markup remains preview/run UI and never becomes purchase UI.
      console.error("One-Shot Forge catalog hydration failed", error);
    }
  }

  hydrateCatalog();
})();
