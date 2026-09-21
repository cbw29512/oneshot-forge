(() => {
  "use strict";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  function labelFor(product) {
    if (product.sellable) return `${money.format(product.priceCents / 100)} · Ready to buy`;
    if (product.currentAccess === "free-preview") return "Live · Free preview";
    return "Coming after review";
  }

  function applyProduct(product) {
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!card) return;

    const status = card.querySelector("[data-product-status]");
    if (status) status.textContent = labelFor(product);

    const action = card.querySelector("[data-product-action]");
    if (!action) return;

    // Browser state never invents a checkout URL. A Buy action is allowed only
    // after the product contract says every release gate is satisfied.
    const gate = product.releaseGate || {};
    const canSell = product.sellable && gate.approved && gate.checkoutConfigured;
    action.textContent = canSell ? `Buy ${money.format(product.priceCents / 100)}` : "Start adventure";
    action.dataset.commercialState = canSell ? "sellable" : "preview";
  }

  async function hydrateCatalog() {
    try {
      const response = await fetch("data/products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`product contract HTTP ${response.status}`);
      const contract = await response.json();
      if (!Array.isArray(contract.products)) throw new Error("product contract has no products array");
      contract.products.forEach(applyProduct);
    } catch (error) {
      // Fail closed: static markup remains a free-preview/run experience and
      // never becomes a purchase UI when commercial state cannot be verified.
      console.error("One-Shot Forge catalog hydration failed", error);
    }
  }

  hydrateCatalog();
})();
