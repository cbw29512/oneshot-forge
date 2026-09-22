(() => {
  "use strict";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  function releaseGate(product) {
    const gate = product.releaseGate || {};
    return Boolean(product.sellable && gate.approved && gate.checkoutConfigured);
  }

  function labelFor(product, entitlement) {
    if (entitlement === "owned") return "Owned · Ready to run";
    if (releaseGate(product)) return `${money.format(product.priceCents / 100)} · Ready to buy`;
    if (product.currentAccess === "free-preview") return "Live · Free preview";
    return "Coming after review";
  }

  function applyProduct(product, entitlement = "none") {
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!card) return;

    const status = card.querySelector("[data-product-status]");
    if (status) status.textContent = labelFor(product, entitlement);

    const action = card.querySelector("[data-product-action]");
    if (!action) return;

    const owned = entitlement === "owned";
    const canSell = releaseGate(product) && !owned;
    action.textContent = owned ? "Start adventure" : canSell ? `Buy ${money.format(product.priceCents / 100)}` : "Start adventure";
    action.dataset.commercialState = owned ? "owned" : canSell ? "sellable" : "preview";
  }

  async function verifiedEntitlement(product) {
    const endpoint = product.entitlementVerificationUrl;
    if (!endpoint) return "none";

    try {
      const url = endpoint.replace("{productId}", encodeURIComponent(product.id));
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
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

      await Promise.all(contract.products.map(async (product) => {
        const entitlement = await verifiedEntitlement(product);
        applyProduct(product, entitlement);
      }));
    } catch (error) {
      // Fail closed: static markup remains a free-preview/run experience and
      // never becomes a purchase UI when commercial state cannot be verified.
      console.error("One-Shot Forge catalog hydration failed", error);
    }
  }

  hydrateCatalog();
})();
