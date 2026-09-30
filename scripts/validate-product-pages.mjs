import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// Use the real contract and script; fixtures change release state, never behavior.
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "catalog.js"), "utf8");
const contract = JSON.parse(fs.readFileSync(path.join(root, "data/products.json"), "utf8"));
const base = contract.products[0];
const scriptUrl = "https://cbw29512.github.io/oneshot-forge/catalog.js?v=test";
const contractUrl = "https://cbw29512.github.io/oneshot-forge/data/products.json";

async function mount(product, options = {}) {
  try {
    const state = { requests: [], listeners: {}, navigation: [], logs: [] };
    const action = { textContent: "Start adventure", dataset: {},
      addEventListener: (name, listener) => { state.listeners[name] = listener; } };
    const status = { textContent: "Live · Free preview" };
    const page = new URL(options.pageUrl || `https://cbw29512.github.io/oneshot-forge/${base.productUrl}`);
    const card = { querySelector: (selector) => selector.includes("status") ? status : action };
    const context = {
      Intl, URL, URLSearchParams, CSS: { escape: (value) => value },
      document: { currentScript: { src: scriptUrl }, querySelector: () => card },
      window: { location: { href: page.href, search: page.search,
        assign: (url) => { state.navigation.push(url); } }, history: { replaceState() {} } },
      console: { error: (...args) => { state.logs.push(args); },
        warn: (...args) => { state.logs.push(args); } },
      fetch: async (url) => {
        state.requests.push(url);
        if (url === contractUrl) {
          if (options.failCatalog) throw new Error("catalog offline");
          return { ok: true, json: async () => ({ products: [product] }) };
        }
        return { ok: !options.failVerification,
          json: async () => options.entitlement || { productId: product.id, access: "none" } };
      }
    };
    vm.runInNewContext(source, context);
    // Hydration is asynchronous; let its resolved fetch promises finish first.
    await new Promise((resolve) => setImmediate(resolve));
    return { ...state, action, status };
  } catch (error) {
    console.error("Product-page fixture failed", error);
    throw error;
  }
}

try {
  for (const product of contract.products) {
    const html = fs.readFileSync(path.join(root, product.productUrl), "utf8");
    assert.ok(html.includes(`data-product-id="${product.id}"`), `${product.id}: catalog binding missing`);
    assert.ok(html.includes('src="../catalog.js'), `${product.id}: catalog script missing`);
    assert.ok(html.includes("data-product-action"), `${product.id}: action binding missing`);
  }
  const preview = await mount(base);
  assert.equal(preview.requests[0], contractUrl, "nested product page must fetch root catalog");
  assert.equal(preview.action.dataset.commercialState, "preview");
  assert.equal(preview.action.textContent, "Start adventure");

  const paid = { ...base, sellable: true,
    releaseGate: { approved: true, checkoutConfigured: true },
    commerce: { provider: "test", checkoutUrl: "https://checkout.example.test/product",
      entitlementMode: "server-verified", entitlementVerificationUrl: "https://api.example.test/{productId}" } };
  const ready = await mount(paid);
  assert.equal(ready.action.textContent, "Buy $0.99");
  assert.equal(ready.action.dataset.commercialState, "sellable");
  ready.listeners.click({ preventDefault() {}, stopPropagation() {} });
  assert.deepEqual(ready.navigation, [paid.commerce.checkoutUrl]);

  for (const gate of ["approved", "checkoutConfigured"]) {
    const denied = await mount({ ...paid, releaseGate: { ...paid.releaseGate, [gate]: false } });
    assert.equal(denied.action.dataset.commercialState, "preview", `${gate} must remain required`);
    assert.equal(denied.listeners.click, undefined);
  }
  const owned = await mount(paid, { entitlement: { productId: paid.id, access: "owned" } });
  assert.equal(owned.action.dataset.commercialState, "owned");
  assert.equal(owned.action.textContent, "Start adventure");

  const wrongOwner = await mount(paid, { entitlement: { productId: "another-product", access: "owned" } });
  assert.equal(wrongOwner.action.dataset.commercialState, "sellable");
  const failedVerification = await mount(paid, { failVerification: true });
  assert.equal(failedVerification.action.dataset.commercialState, "sellable");
  const failedCatalog = await mount(paid, { failCatalog: true });
  assert.equal(failedCatalog.action.textContent, "Start adventure");
  assert.equal(failedCatalog.listeners.click, undefined);
  assert.ok(failedCatalog.logs.length, "catalog failure must remain visible to maintainers");

  const forgedReturn = await mount(base, { pageUrl: `https://cbw29512.github.io/oneshot-forge/${base.productUrl}?checkout_return=${base.id}&owned=true` });
  assert.equal(forgedReturn.action.dataset.commercialState, "preview");
  const insecure = await mount({ ...paid, commerce: { ...paid.commerce, checkoutUrl: "http://checkout.example.test/" } });
  insecure.listeners.click({ preventDefault() {}, stopPropagation() {} });
  assert.equal(insecure.navigation.length, 0, "insecure checkout navigation must be blocked");
  assert.ok(insecure.logs.length);
  console.log("Product-page commerce states: PASS (nested URLs, release gates, ownership, failures, HTTPS)");
} catch (error) {
  console.error("Product-page commerce validation failed", error);
  process.exitCode = 1;
}
