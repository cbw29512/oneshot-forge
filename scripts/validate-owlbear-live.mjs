// Regression checks: play-state updates must not alter canonical hero data or print markup.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const state = require("../owlbear-play-state.js");
const pack = JSON.parse(fs.readFileSync("data/pregens/owlbear-arms-level-6-2014-srd-v1.2.json", "utf8"));
const html = fs.readFileSync("sheets.html", "utf8");
const ui = fs.readFileSync("owlbear-play-ui.js", "utf8");
const css = fs.readFileSync("owlbear-play-ui.css", "utf8");

try {
  assert.deepEqual(pack.characters.map(pc => pc.name), ["Rowan", "Dagna", "Sylvi", "Liora", "Thalen"]);
  assert.equal(new Set(pack.characters.map(pc => pc.id)).size, 5);
  assert.match(html, /owlbear-play-state\.js/);
  assert.match(html, /owlbear-play-ui\.js/);
  assert.match(html, /initOwlbearPlay\(document\.getElementById\("sheets"\), allCharacters\)/);
  assert.match(html, /allCharacters\.map\(printPacket\)/); // All five retain print packets.
  assert.match(css, /@media screen/); // New styling must not affect Letter print.
  assert.match(ui, /aria-pressed/);
  assert.match(ui, /data-play-action/);
  const fighter = pack.characters[0];
  const canonical = JSON.stringify(fighter);
  let f = state.fresh(fighter);
  assert.equal(f.currentHp, 58);
  f = state.change(fighter, f, { type: "temp", amount: 8 });
  f = state.change(fighter, f, { type: "damage", amount: 12 });
  assert.equal(f.tempHp, 0, "Temporary HP must absorb damage first");
  assert.equal(f.currentHp, 54);
  f = state.change(fighter, f, { type: "heal", amount: 1000 });
  assert.equal(f.currentHp, 58, "Healing must not exceed published maximum");
  f = state.change(fighter, f, { type: "damage", amount: 9999 });
  assert.equal(f.currentHp, 0, "Damage must not produce negative HP");
  f = state.change(fighter, f, { type: "death-success" });
  f = state.change(fighter, f, { type: "death-failure" });
  assert.equal(f.deathSuccesses, 1);
  assert.equal(f.deathFailures, 1);
  f = state.change(fighter, f, { type: "death-reset" });
  assert.equal(f.deathSuccesses + f.deathFailures, 0);
  f = state.change(fighter, f, { type: "inspiration" });
  f = state.change(fighter, f, { type: "concentration" });
  assert.equal(f.inspiration, true);
  assert.equal(f.concentrating, true);
  assert.deepEqual(state.change(fighter, f, { type: "reset" }), state.fresh(fighter));
  assert.equal(JSON.stringify(fighter), canonical, "The play tracker must never mutate pregen truth");

  for (const caster of pack.characters.filter(pc => pc.spellcasting)) {
    for (const [level, max] of Object.entries(caster.spellcasting.slots)) {
      let slots = state.fresh(caster);
      for (let i = 0; i < max + 2; i++) slots = state.change(caster, slots, { type: "slot-use", level });
      assert.equal(slots.slotsUsed[level], max, "Slots cannot be overspent");
      slots = state.change(caster, slots, { type: "slot-restore", level });
      assert.equal(slots.slotsUsed[level], max - 1, "One slot can be restored");
      const damaged = state.normalize(caster, { currentHp: -2, slotsUsed: { [level]: 9999 } });
      assert.equal(damaged.currentHp, 0, "Saved state is clamped");
      assert.equal(damaged.slotsUsed[level], max, "Saved slots are clamped");
    }
  }
  console.log("OwlBear live character sheets: 5 canonical heroes, HP, slots, status, print isolation OK");
} catch (error) {
  console.error("OwlBear live character sheet validation failed", error);
  process.exitCode = 1;
}
