(() => {
  "use strict";

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const SITE_ROOT = new URL(".", document.currentScript && document.currentScript.src || location.href);
  const SERIES_KEYS = {
    "Oakhaven Adventures": ["oakhaven"],
    "The Quiet Seals": ["quiet-seals"],
    // The Fencewalker of Bellmere is the Hearthcross road tale and Cryptid Case 01.
    "Hearthcross Road Tales": ["hearthcross-road", "cryptid"],
    "Cryptid Cases": ["cryptid"]
  };

  function seriesKeysFor(adventure) {
    const mapped = SERIES_KEYS[adventure?.series?.title];
    if (Array.isArray(mapped)) return mapped.filter(Boolean);
    return mapped ? [mapped] : [];
  }

  function siteFetch(path, options) {
    return fetch(new URL(path, SITE_ROOT), options);
  }

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
    if (product.currentAccess === "free-starter") return "FREE STARTER · Complete adventure";
    if (product.currentAccess === "free-preview") return product.format === "download-bundle"
      ? "Free preview · PDF bundle" : "Live · Free preview";
    return "Coming after review";
  }

  function priceChipLabel(product) {
    if (!product || product.priceCents === 0 || product.currentAccess === "free-starter") return "Free";
    if (releaseGate(product)) return money.format(product.priceCents / 100);
    if (product.priceCents === 99) return "$0.99 (coming soon)";
    return "Free";
  }

  function editionLabel(product) {
    if (product && product.rulesSupport === "2014") return "2014 rules only";
    if (product && product.rulesSupport === "2024") return "2024 rules only";
    return "Works with 2014 and 2024 rules";
  }

  function hoursLabel(minutes) {
    const hours = Number(minutes) / 60;
    if (!Number.isFinite(hours) || hours <= 0) return "";
    if (Math.abs(hours - Math.round(hours)) < 0.05) {
      const whole = Math.round(hours);
      return whole === 1 ? "about 1 hour" : `about ${whole} hours`;
    }
    return `${Math.floor(hours)}–${Math.ceil(hours)} hours`;
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
    const downloadLabel = action.dataset.downloadLabel || "Download complete kit";
    action.textContent = canSell
      ? `Buy ${money.format(product.priceCents / 100)}`
      : product.currentAccess === "free-starter" ? (resume ? "Resume free adventure" : "Play free adventure")
      : product.format === "download-bundle" ? downloadLabel
      : resume ? "Resume game" : "Run now";
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

  function paintChipAndEdition(product) {
    const chip = priceChipLabel(product);
    const edition = editionLabel(product);
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    const page = document.querySelector(`[data-product-page="${CSS.escape(product.id)}"]`);
    for (const root of [card, page]) {
      if (!root) continue;
      root.querySelectorAll("[data-price-chip]").forEach(node => { node.textContent = chip; });
      root.querySelectorAll("[data-edition-badge]").forEach(node => { node.textContent = edition; });
    }
  }

  function paintAdventureFacts(product, adventure) {
    const level = Number(adventure?.metadata?.partyLevel || product.level || 0);
    const hours = adventure ? hoursLabel(adventure.metadata?.durationMinutes) : (product.playTime || "");
    const seriesKeys = seriesKeysFor(adventure);
    const card = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    const page = document.querySelector(`[data-product-page="${CSS.escape(product.id)}"]`);
    if (card) {
      if (level) card.dataset.level = String(level);
      if (seriesKeys.length) card.dataset.series = seriesKeys.join(" ");
    }
    for (const root of [card, page]) {
      if (!root) continue;
      if (level) root.querySelectorAll('[data-fact="level"]').forEach(node => { node.textContent = `Level ${level}`; });
      if (hours) root.querySelectorAll('[data-fact="hours"]').forEach(node => { node.textContent = hours; });
    }
    return adventure;
  }

  function fillLevelFilter() {
    const select = document.getElementById("filter-level");
    if (!select) return;
    const levels = [...document.querySelectorAll(".catalog .adv-card[data-level]")]
      .map(card => Number(card.dataset.level))
      .filter(level => level > 0);
    const unique = [...new Set(levels)].sort((a, b) => a - b);
    const current = select.value;
    select.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "All levels";
    select.append(all);
    for (const level of unique) {
      const option = document.createElement("option");
      option.value = String(level);
      option.textContent = `Level ${level}`;
      select.append(option);
    }
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  function applyFilters() {
    const level = document.getElementById("filter-level")?.value || "";
    const series = document.getElementById("filter-series")?.value || "";
    document.querySelectorAll(".catalog .adv-card").forEach(card => {
      if (!card.dataset.productId) {
        card.hidden = Boolean(level || series);
        return;
      }
      const levelOk = !level || card.dataset.level === level;
      const seriesKeys = (card.dataset.series || "").split(/\s+/).filter(Boolean);
      const seriesOk = !series || seriesKeys.includes(series);
      card.hidden = !(levelOk && seriesOk);
    });
  }

  function bindFilters() {
    for (const id of ["filter-level", "filter-series"]) {
      const select = document.getElementById(id);
      if (select && !select.dataset.bound) {
        select.dataset.bound = "true";
        select.addEventListener("change", applyFilters);
      }
    }
  }

  function applyProduct(product, entitlement = "none") {
    paintChipAndEdition(product);
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

  async function loadAdventure(id) {
    try {
      const response = await siteFetch(`data/adventures/${id}.oneshot.json`, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`One-Shot Forge could not read adventure facts for ${id}`, error);
      return null;
    }
  }

  async function hydrateCatalog() {
    try {
      const response = await siteFetch("data/products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`product contract HTTP ${response.status}`);
      const contract = await response.json();
      if (!Array.isArray(contract.products)) throw new Error("product contract has no products array");

      const returnedProductId = checkoutReturnProductId();
      await Promise.all(contract.products.map(async (product) => {
        const entitlement = await verifiedEntitlement(product);
        applyProduct(product, entitlement);
        const adventure = await loadAdventure(product.id);
        paintAdventureFacts(product, adventure);
        if (returnedProductId === product.id && entitlement !== "owned") {
          console.warn(`One-Shot Forge checkout returned before ownership was verified for ${product.id}`);
        }
      }));
      fillLevelFilter();
      bindFilters();
      applyFilters();
      clearCheckoutReturn();
    } catch (error) {
      // Fail closed: static markup remains preview/run UI and never becomes purchase UI.
      console.error("One-Shot Forge catalog hydration failed", error);
      bindFilters();
    }
  }

  bindFilters();
  hydrateCatalog();
})();
