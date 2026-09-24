import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CAMPAIGN_PATH = path.join(ROOT, "data/campaigns/quiet-seals.campaign.json");
const ADVENTURES_DIR = path.join(ROOT, "data/adventures");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`[catalog] failed to read ${filePath}: ${error.message}`);
    process.exitCode = 1;
    return null;
  }
}

function main() {
  try {
    const campaign = readJson(CAMPAIGN_PATH);
    if (!campaign) return;

    const filenames = fs.readdirSync(ADVENTURES_DIR)
      .filter((name) => name.endsWith(".oneshot.json"));

    const authored = filenames
      .map((name) => ({ name, pack: readJson(path.join(ADVENTURES_DIR, name)) }))
      .filter(({ pack }) => pack);

    const errors = [];
    for (const { name, pack } of authored) {
      const episode = campaign.episodes?.find((item) => item.title === pack.title);
      if (!episode) continue;

      const expectedPack = `data/adventures/${name}`;
      const expectedHref = `run.html?id=${pack.id}`;

      if (episode.pack !== expectedPack) {
        errors.push(`${episode.title}: campaign pack must be ${expectedPack}`);
      }
      if (episode.href !== expectedHref && !(pack.id === "the-lantern-below" && episode.href === "run.html")) {
        errors.push(`${episode.title}: campaign href must be ${expectedHref}`);
      }
      if (episode.status === "coming") {
        errors.push(`${episode.title}: authored package is runnable but campaign status is still coming`);
      }
    }

    if (errors.length) {
      console.error("[catalog] campaign/adventure drift detected:");
      for (const error of errors) console.error(` - ${error}`);
      process.exitCode = 1;
      return;
    }

    console.log(`[catalog] OK: ${authored.length} authored adventure package(s) checked`);
  } catch (error) {
    console.error(`[catalog] unexpected validator failure: ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}

main();
