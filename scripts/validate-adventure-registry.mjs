#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    errors.push(`missing ${rel}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

try {
  const sandbox = { window: {} };
  vm.runInNewContext(read("adventure-registry.js"), sandbox, { filename: "adventure-registry.js" });
  const registry = sandbox.window.ONE_SHOT_ADVENTURES;
  if (!registry || typeof registry !== "object") {
    errors.push("adventure-registry.js did not expose window.ONE_SHOT_ADVENTURES");
  }

  const products = JSON.parse(read("data/products.json"));
  const productIds = new Set((products.products || []).map(product => product.id));
  const registryIds = new Set(Object.keys(registry || {}));

  for (const product of products.products || []) {
    // PDF bundles have their own checked file manifest; never invent an empty runner package.
    if (product.format === "download-bundle") {
      if (registryIds.has(product.id) || product.runnerUrl) errors.push(`${product.id}: bundle must not claim a web runner`);
      if (!product.downloadUrl || !fs.existsSync(path.join(root, product.downloadUrl))) errors.push(`${product.id}: missing bundle download`);
    } else if (product.format === "standalone-browser") {
      if (registryIds.has(product.id)) errors.push(`${product.id}: standalone browser runner must not also claim authored-package registry entry`);
      const runnerPath = String(product.runnerUrl || "").split("?")[0].split("#")[0];
      if (!runnerPath || !fs.existsSync(path.join(root, runnerPath))) errors.push(`${product.id}: missing standalone browser runner ${product.runnerUrl || "(none)"}`);
    } else if (!registryIds.has(product.id)) errors.push(`product ${product.id} is missing from adventure registry`);
    if (!product.productUrl || !fs.existsSync(path.join(root, product.productUrl))) {
      errors.push(`product ${product.id} has missing productUrl ${product.productUrl || "(none)"}`);
    }
  }

  for (const [id, rel] of Object.entries(registry || {})) {
    if (!productIds.has(id)) errors.push(`registry adventure ${id} is missing from product contract`);
    const text = read(rel);
    if (!text) continue;
    try {
      const pack = JSON.parse(text);
      if (pack.metadata?.id !== id) {
        errors.push(`registry id ${id} points to package metadata.id ${pack.metadata?.id || "(missing)"}`);
      }
    } catch (error) {
      errors.push(`registry package ${id} is invalid JSON: ${error.message}`);
    }
  }
} catch (error) {
  errors.push(error.message);
}

if (errors.length) {
  console.error("Adventure registry validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log("Adventure registry OK: product contract, package paths, and metadata IDs are synchronized.");
