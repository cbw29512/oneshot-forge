// Headless-browser smoke test: verify the real page renders the five live heroes.
import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
function chromePath() {
  try {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
      const output = execFileSync("bash", ["-lc", "command -v " + name + " || true"], { encoding: "utf8" }).trim();
      if (output && fs.existsSync(output)) return output;
    }
    throw new Error("Chrome executable not found");
  } catch (error) { console.error("OwlBear browser test cannot locate Chrome", error); throw error; }
}
const types = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json",
  ".jpg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".svg":"image/svg+xml" };
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const file = path.normalize(path.join(root, relative));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); res.end("missing"); return; }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  } catch (error) {
    console.error("OwlBear browser-test server error", error);
    res.writeHead(500); res.end("error");
  }
});
try {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  async function dump(route) {
    const args = ["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
      "--no-first-run","--virtual-time-budget=8000","--dump-dom",base + "/" + route];
    const { stdout } = await execFileAsync(chromePath(), args, { timeout: 30000, maxBuffer: 12 * 1024 * 1024 });
    return stdout;
  }
  const html = await dump("sheets.html?pack=owlbear-arms");
  const count = pattern => (html.match(pattern) || []).length;
  assert.equal(count(/class="play-hero-option"/g), 5, "Exactly five selection cards must render");
  assert.equal(count(/class="play-console print-hide"/g), 5, "Every hero must have a tracker");
  assert.equal(count(/class="play-roll-result print-hide"/g), 5, "Every hero must have dice feedback");
  assert.equal(count(/data-play-amount/g), 1, "Only the selected hero has visible tracker controls");
  assert.ok(count(/class="play-roll-button"/g) >= 25, "Published skills and saves need roll controls");
  for (const name of ["Rowan","Dagna","Sylvi","Liora","Thalen"]) {
    assert.match(html, new RegExp('data-play-select="owlbear-' + name.toLowerCase() + '"'));
  }
  assert.ok(!html.includes('<div id="sheets"><p>Could not load ready-made characters.</p>'),
    "The rendered sheet container must not be a load error");
  const ordinary = await dump("sheets.html?rules=2014");
  assert.doesNotMatch(ordinary, /class="play-roster print-hide"/, "Other character packs must not gain OwlBear controls");
  console.log("OwlBear browser smoke: 5 selection cards, 5 trackers, dice buttons, other pack isolation OK");
} catch (error) {
  console.error("OwlBear live sheet browser smoke failed", error);
  process.exitCode = 1;
} finally {
  server.close();
}
