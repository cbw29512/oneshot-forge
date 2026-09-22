(() => {
  "use strict";

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  function commerceFor(product) {
    return product.commerce || {};
  }

  function releaseGate(product) {
    const gate = product.releaseGate || {};
    const commerce = commerceFor(product);
    return Boolean(
      product.sellable && gate.approved && gate.checkoutConfigured &&
      commerce.provider && commerce.checkoutUrl &&
      commerce.entitlementMode === "server-verified" && commerce.entitlementVerificationUrl
    );
  }

  function checkoutReturnProductId() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("checkout_return") || "";
    } catch (error) {
      console.error("One-Shot Forge could not inspect checkout return", error);
      return "";
    }
  }

  function clearCheckoutReturn() {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("checkout_return")) return;
      url.searchParams.delete("checkout_return");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (error) {
      console.error("One-Shot Forge could not clear checkout return", error);
    }
  }

  function labelFor(product, entitlement) {
    if (entitlement === "owned") return "Owned · Ready to run";
    if (releaseGate(product)) return `${money.format(product.priceCents / 100)} · Ready to buy`;
    if (product.currentAccess === "free-preview") return "Live · Free preview";
    return "Coming after review";
  }

  function configureAction(action, product, entitlement) {
    const owned = entitlement === "owned";
    const canSell = releaseGate(product) && !owned;
    action.textContent = owned ? "Start adventure" : canSell ? `Buy ${money.format(product.priceCents / 100)}` : "Start adventure";
    action.dataset.commercialState = owned ? "owned" : canSell ? "sellable" : "preview";

    if (canSell) {
      const checkoutUrl = commerceFor(product).checkoutUrl;
      action.dataset.checkoutUrl = checkoutUrl;
      action.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          const target = new URL(checkoutUrl, window.location.href);
          if (target.protocol !== "https:") throw new Error("checkout URL must use HTTPS");
          window.location.assign(target.href);
        } catch (error) {
          console.error(`One-Shot Forge checkout blocked for ${product.id}`, error);
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

  async function verifiedEntitlement(product) {
    const endpoint = commerceFor(product).entitlementVerificationUrl || product.entitlementVerificationUrl;
    if (!endpoint) return "none";
    try {
      const url = endpoint.replace("{productId}", encodeURIComponent(product.id));
      const response = await fetch(url, { cache: "no-store", credentials: "include", headers: { Accept: "application/json" } });
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

      const returnedProductId = checkoutReturnProductId();
      await Promise.all(contract.products.map(async (product) => {
        const entitlement = await verifiedEntitlement(product);
        applyProduct(product, entitlement);
        if (returnedProductId === product.id && entitlement !== "owned") {
          console.warn(`One-Shot Forge checkout returned before ownership was verified for ${product.id}`);
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
