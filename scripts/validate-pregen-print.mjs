#!/usr/bin/env node
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const errors = [];
const read = path => fs.existsSync(path) ? fs.readFileSync(path, "utf8") : (errors.push("missing " + path), "");

const sheets = read("sheets.html");
const css = read("styles.css");
const sheetCss = read("character-sheet.css");
const builder = read("pregen-builder.js");
const builderPage = read("pregen-builder.html");
const index = read("index.html");

for (const required of [
  "characterClass(pc)",
  "pc.className || pc.class",
  "Portrait of ",
  "waitImagesThenPrint",
  "printMainPage(pc)",
  "printSpellPage(pc)",
  "printGearPage(pc)",
  "function spellOutNotes",
  "pc.role",
  "pc.acNotes",
  "pc.gp",
  "Darkvision ",
  "beyond-death",
  "beyond-senses",
  "beyond-ac-note",
  "printPacket(pc)",
  "Print this character",
  "Print all",
  "Saving Throws — All Six",
  "Current HP",
  "Temp HP",
  "Death Saves",
  "Resources & Defenses",
  "Passive Perception",
  "Passive Insight",
  "Class / Spell Save DC",
  "Heroic Inspiration",
  "Action Economy",
  "Standard Actions",
  "Roll / DC",
  "resourceBoxes(uses)",
  '"Cantrip" : "L" + spell.level',
  '"Concentration"',
  "durationMatch",
  "pr-hp-grid",
  "pr-current-hp",
  "Conditions / Concentration / Combat Notes",
  "quickTurn(pc)",
  "spellRole(spell)",
  "function isFeatureHeavy(pc)",
  "pr-resource-heavy",
  "function isResourceHeavy(pc)",
  "pr-roleplay-compact",
  "pr-feature-heavy",
  "Damage","Control","Healing","Defense","Utility"
]) {
  if (!sheets.includes(required)) errors.push("sheets.html missing " + required);
}

for (const required of [
  "@page",
  "size: Letter portrait",
  "print-color-adjust: exact",
  ".screen-sheet { display: none !important; }",
  ".print-only { display: block !important; }",
  ".pr-page",
  ".pr-spell-page",
  ".pr-port",
  "object-fit:cover",
  ".pr-writebox",
  "min-height:1.02in",
  ".pr-condition-box",
  ".pr-quickturn",
  ".pr-fixed-grid",
  "grid-template-areas",
  ".pr-zone-abilities",
  ".pr-zone-saves",
  ".pr-zone-skills",
  ".pr-zone-tracker",
  ".pr-zone-attacks",
  ".pr-zone-actions",
  ".pr-zone-resources",
  ".pr-zone-side",
  ".pr-zone-character",
  ".pr-zone-features",
  ".pr-mini-stats",
  ".pr-standard-actions",
  ".pr-resource-columns",
  "grid-template-areas:",
  "pr-roleplay-compact",
  "pr-feature-heavy",
  "grid-template-rows:1fr 1fr",
  "grid-template-columns:1fr 1fr",
  "height:33.333%",
  "flex-flow:row wrap",
  "height:8.96in",
  "zoom:1",
  "height:11in",
  "width:8.5in",
  "margin: 0",
  "border-bottom:.6pt solid #d3cec8",
  "justify-content:space-between !important",
  "overflow:hidden !important",
  "flex-direction:column !important",
  "display:flex !important",
  "-webkit-text-fill-color:#111",
  "grid-template-columns:auto 1fr auto",
  "ab-mod",
  "ab-score",
  "ab-name",
  "@media (max-width: 620px)",
  ".web-fixed-sheet .pr-atk",
  ".web-fixed-sheet .pr-skill-list .sk",
  ".web-fixed-sheet .pr-fixed-grid",
  "web-fixed-sheet",
  "font-size:8.05pt",
  "font-size:7.9pt",
  "font-size:8.8pt",
  "font-size:8.25pt",
  ".pr-zone-skills .sk *",
  "color:#111 !important",
  "font-size:7.55pt",
  "Combat notes / ammunition / special attack riders",
  "font-size:11pt",
  "grid-template-rows:repeat(18,minmax(.22in,1fr))",
  "1.45in 1.43in",
  "grid-template-rows:repeat(3,1fr)",
  "font-size:10.2pt",
  "grid-template-rows:repeat(18,1fr)"
]) {
  if (!css.includes(required)) errors.push("print CSS missing " + required);
}

for (const required of [
  "data-tab=\"actions\"",
  "data-tab=\"spells\"",
  "data-tab=\"inventory\"",
  "data-tab=\"features\"",
  "edition-badge",
  "Always prepared",
  "Attunement",
  "Passive Investigation",
  "ab-mod",
  "ab-score",
  "beyond-abilities",
  "To hit / Roll / DC",
  "Range"
]) {
  if (!sheets.includes(required)) errors.push("sheets.html missing redesigned sheet marker " + required);
}
for (const required of [
  ".beyond-abilities",
  ".edition-badge",
  "grid-template-columns: repeat(6, minmax(0, 1fr))",
  ".ab-mod",
  ".ab-score",
  "size: Letter portrait",
  "width: 8.5in",
  "height: 11in",
  "@media (max-width: 720px)",
  "print-color-adjust: exact",
  "color: #111"
]) {
  if (!sheetCss.includes(required)) errors.push("character-sheet.css missing " + required);
}
if (!builder.includes("const OFFER_LEVEL_ZERO = false")) errors.push("pregen builder must keep level 0 hidden");
if (!builderPage.includes("level from 1 to 20")) errors.push("pregen builder page must offer levels 1–20");
if (/Level 0 until you say otherwise/.test(builderPage)) errors.push("pregen builder must not advertise level 0 characters");
if (/starts at level 0/i.test(index)) errors.push("homepage character area must not send visitors to level 0 sheets");
if (!index.includes("zero-hero-kit.html")) errors.push("Hearthcross adventure must stay linked from the homepage");
const builderCss = read("pregen-builder.css");
if (/font-size:\s*\.8rem\b/.test(builderCss)) errors.push("pregen-builder.css still uses a .8rem font size; on-screen type must be at least .875rem");
if (!builderCss.includes(".875rem")) errors.push("pregen-builder.css missing the .875rem floor");
if (!builder.includes("beyond-death")) errors.push("pregen builder death saves must use separate success and failure lines");
if (!sheetCss.includes(".beyond-death span { display: block; }")) errors.push("death saves must put Success and Failure on separate lines");
for (const packPath of [
  "data/pregens/oakhaven-level-5-2024-srd.json",
  "data/pregens/oakhaven-level-6-2024-srd.json"
]) {
  const pack = JSON.parse(read(packPath) || "{}");
  for (const pc of pack.characters || []) {
    const names = (pc.equipment || []).map(item => String(typeof item === "string" ? item : item.name || "").trim().toLowerCase());
    const swords = names.filter(name => name === "+1 longsword");
    if (swords.length > 1) errors.push(packPath + " " + pc.name + " lists the +1 longsword more than once");
  }
}

for (const packPath of [
  "data/pregens/quiet-seals-level-4-2014-srd.json",
  "data/pregens/quiet-seals-level-4-2024-srd.json"
]) {
  const raw = read(packPath);
  if (!raw) continue;
  const pack = JSON.parse(raw);
  const recommended = (pack.characters || []).filter(pc => pc.recommended);
  if (recommended.length !== 6) errors.push(packPath + " must have exactly six recommended pregens");
  for (const pc of recommended) {
    if (!pc.name) errors.push(packPath + " has unnamed recommended pregen");
    if (!(pc.className || pc.class)) errors.push(pc.name + " missing className/class");
    if (!pc.portrait) errors.push(pc.name + " missing portrait path");
    else if (!fs.existsSync(pc.portrait)) errors.push(pc.name + " portrait missing: " + pc.portrait);
    if (!pc.attackList?.length) errors.push(pc.name + " missing attacks");
    for (const attack of (pc.attackList || [])) {
      if (/Extra Attack is (?:fighter|ranger|paladin) 5/i.test(attack.notes || "")) errors.push(pc.name + " has future-level Extra Attack note on current sheet");
    }
    if (!pc.featureList?.length) errors.push(pc.name + " missing features");
    for (const ability of ["STR","DEX","CON","INT","WIS","CHA"]) {
      if (pc.scores?.[ability] == null) errors.push(pc.name + " missing " + ability + " ability score");
      if (!pc.saveMap?.[ability] || typeof pc.saveMap[ability].bonus !== "number") errors.push(pc.name + " missing " + ability + " saving throw");
    }
    for (const skill of ["acrobatics","animal handling","arcana","athletics","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleight of hand","stealth","survival"]) {
      if (!pc.skillsMap?.[skill] || typeof pc.skillsMap[skill].bonus !== "number") errors.push(pc.name + " missing skill " + skill);
    }
    if (pc.ac == null || pc.hp == null || pc.initiative == null || !(pc.speedFt || pc.speed)) errors.push(pc.name + " missing core combat stat");
    if (!pc.hitDice) errors.push(pc.name + " missing hit dice");
    if (pc.passivePerception == null || pc.passiveInsight == null) errors.push(pc.name + " missing passive score");
    if (pc.spellList?.length) {
      if (!pc.spellcasting?.ability || pc.spellcasting.saveDC == null || pc.spellcasting.attack == null) errors.push(pc.name + " missing spellcasting stats");
      if (!pc.spellcasting?.slots) errors.push(pc.name + " missing spell slots");
    }
  }
}

function chromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try {
      const found = execFileSync("bash", ["-lc", "command -v " + name], { encoding: "utf8" }).trim();
      if (found && fs.existsSync(found)) return found;
    } catch { /* try the next name */ }
  }
  return "";
}

function startServer(root) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const file = path.normalize(path.join(root, rel));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("missing"); return; }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function measurePrintPages(base, routes) {
  const bin = chromePath();
  if (!bin) throw new Error("Chrome is required for the print height check");
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), "sheet-print-"));
  const proc = spawn(bin, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--user-data-dir=" + userData,
    "--remote-debugging-port=0",
    "about:blank"
  ], { stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Chrome did not open a debugging port")), 20000);
    const take = chunk => {
      log += chunk;
      const match = log.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
      if (match) { clearTimeout(timer); resolve(Number(match[1])); }
    };
    proc.stdout.on("data", take);
    proc.stderr.on("data", take);
    proc.on("exit", code => reject(new Error("Chrome exited " + code + " before the debugging port opened")));
  });
  const version = await fetch("http://127.0.0.1:" + port + "/json/version").then(r => r.json());
  const browser = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    browser.addEventListener("open", resolve);
    browser.addEventListener("error", () => reject(new Error("Chrome debugging socket failed")));
  });
  let nextId = 0;
  const pending = new Map();
  const waiters = [];
  browser.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
    if (message.method) {
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i](message)) waiters.splice(i, 1);
      }
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => reject(new Error(method + " timed out")), 20000);
    pending.set(id, message => {
      clearTimeout(timer);
      if (message.error) reject(new Error(method + " " + JSON.stringify(message.error)));
      else resolve(message.result || {});
    });
    browser.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const waitFor = method => new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), 8000);
    waiters.push(message => {
      if (message.method !== method) return false;
      clearTimeout(timer);
      resolve(message);
      return true;
    });
  });
  try {
    const created = await send("Target.createTarget", { url: "about:blank" });
    const attached = await send("Target.attachToTarget", { targetId: created.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await send("Page.enable", {}, sessionId);
    await send("Runtime.enable", {}, sessionId);
    await send("Emulation.setEmulatedMedia", { media: "print" }, sessionId);
    await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 16000, deviceScaleFactor: 1, mobile: false }, sessionId);
    const expression = `(() => {
      document.body.dataset.printTarget = "all";
      const pages = [...document.querySelectorAll("article.pr-page")];
      return pages.map(page => {
        const box = page.getBoundingClientRect();
        let lowest = box.top;
        let offender = "";
        for (const node of page.querySelectorAll("*")) {
          const style = getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = node.getBoundingClientRect();
          if (rect.width < 1 && rect.height < 1) continue;
          if (rect.bottom > lowest + 0.5) {
            lowest = rect.bottom;
            offender = String(node.className || node.tagName).slice(0, 80);
          }
        }
        return {
          id: page.getAttribute("data-print-pc") || "",
          kind: page.classList.contains("pr-gear-page") ? "inventory" : page.classList.contains("pr-spell-page") ? "spells" : "character",
          pageHeight: Math.round(box.height),
          overflow: Math.ceil(lowest - box.bottom),
          offender,
          printMedia: matchMedia("print").matches
        };
      });
    })()`;
    const measured = [];
    for (const route of routes) {
      const loaded = waitFor("Page.loadEventFired");
      await send("Page.navigate", { url: base + "/" + route }, sessionId);
      await loaded;
      await send("Emulation.setEmulatedMedia", { media: "print" }, sessionId);
      await new Promise(resolve => setTimeout(resolve, 50));
      let pages = [];
      for (let attempt = 0; attempt < 40; attempt++) {
        const result = await send("Runtime.evaluate", { expression, returnByValue: true }, sessionId);
        pages = result.result?.value || [];
        if (pages.length) break;
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (!pages.length) errors.push(route + " rendered no print pages");
      for (const page of pages) {
        measured.push(route + " " + page.id + " " + page.kind);
        if (!page.printMedia) errors.push(route + " did not render in print media");
        if (page.pageHeight < 1000 || page.pageHeight > 1056) errors.push(route + " " + page.id + " " + page.kind + " page is " + page.pageHeight + "px; Letter height must be 1056px or less and actually laid out");
        if (page.overflow > 1) errors.push(route + " " + page.id + " " + page.kind + " clips " + page.overflow + "px (" + page.offender + ")");
      }
    }
    return measured.length;
  } finally {
    browser.close();
    proc.kill();
  }
}

const printRoutes = [
  "sheets.html?rules=2014",
  "sheets.html?rules=2024",
  "sheets.html?pack=owlbear-arms",
  ...[2, 3, 4, 5, 6].flatMap(level => [
    "sheets.html?pack=oakhaven-" + level + "&rules=2014",
    "sheets.html?pack=oakhaven-" + level + "&rules=2024"
  ])
];

const server = await startServer(process.cwd());
try {
  const count = await measurePrintPages("http://127.0.0.1:" + server.address().port, printRoutes);
  if (!count) errors.push("print height check measured no sheets");
} catch (error) {
  errors.push("print height check failed: " + error.message);
} finally {
  server.close();
}

if (errors.length) {
  console.error("Pregen print validation failed:");
  errors.forEach(error => console.error(" - " + error));
  process.exit(1);
}
console.log("Pregen print packet OK: six recommended only, print-all + individual packets, one main page, inventory page, optional spell page, every sheet within 1056px.");
