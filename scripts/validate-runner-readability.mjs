#!/usr/bin/env node
import fs from "node:fs";

const css = fs.readFileSync("styles.css", "utf8");
const errors = [];

function cssHex(name) {
  const match = css.match(new RegExp("--" + name + ":\\s*(#[0-9a-fA-F]{6})\\s*;"));
  if (!match) {
    errors.push("missing CSS color token --" + name);
    return "#000000";
  }
  return match[1];
}

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const raw = hex.slice(1);
  const r = channel(parseInt(raw.slice(0, 2), 16));
  const g = channel(parseInt(raw.slice(2, 4), 16));
  const b = channel(parseInt(raw.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

const paper = cssHex("gm-paper");
const paperAlt = cssHex("gm-paper-alt");
const ink = cssHex("gm-ink");
const muted = cssHex("gm-ink-muted");
const label = cssHex("gm-label");

for (const [name, fg, bg, minimum] of [
  ["GM body text", ink, paper, 7],
  ["GM muted text", muted, paper, 7],
  ["GM small labels", label, paper, 7],
  ["GM dialogue text", ink, paperAlt, 7],
  ["GM dialogue labels", label, paperAlt, 7]
]) {
  const value = ratio(fg, bg);
  if (value < minimum) {
    errors.push(`${name} contrast ${value.toFixed(2)}:1 is below ${minimum}:1`);
  } else {
    console.log(`${name}: ${value.toFixed(2)}:1`);
  }
}

for (const required of [
  /\.dm-spoken-layer\s*\{[^}]*background:\s*var\(--gm-paper\)[^}]*color:\s*var\(--gm-ink\)/s,
  /\.dm-dialogue blockquote\s*\{[^}]*background:\s*var\(--gm-paper-alt\)[^}]*color:\s*var\(--gm-ink\)/s,
  /\.dm-spoken-layer > \.box-label\s*\{[^}]*color:\s*var\(--gm-label\)/s
]) {
  if (!required.test(css)) errors.push("runner GM readability rule is missing or no longer uses the certified high-contrast palette");
}

const hearthcrossCss = fs.readFileSync("zero-hero-adventure.css", "utf8");
if (!/\.zero-adventure-body \.dm-box\s*\{[^}]*background:var\(--gm-paper\);color:var\(--gm-ink\)/s.test(hearthcrossCss)) {
  errors.push("Hearthcross DM instructions must use the certified paper/ink palette");
}

if (errors.length) {
  console.error("Runner readability validation failed:");
  errors.forEach(error => console.error(" -", error));
  process.exit(1);
}

console.log("Runner GM reading surfaces meet enhanced 7:1 contrast checks.");
