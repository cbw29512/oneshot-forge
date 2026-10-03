const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadBrowserModule(relPath) {
  const fullPath = path.resolve(__dirname, relPath);
  const source = fs.readFileSync(fullPath, "utf8");
  const sandbox = {
    module: { exports: {} },
    exports: {},
    globalThis: {},
    console,
    crypto: globalThis.crypto,
    Uint32Array,
    Date,
    Math
  };
  vm.runInNewContext(source, sandbox, { filename: fullPath });
  return sandbox.module.exports;
}

const { generateBones } = loadBrowserModule("../forge-bones.js");
const { compileBones } = loadBrowserModule("../forge-compile.js");
const { assertBonesUnchanged } = loadBrowserModule("../forge-flesh.js");

function assert(value, message) {
  if (!value) throw new Error(message);
}

for (let i = 0; i < 40; i++) {
  const options = { level: (i % 5) + 1, partySize: 3 + (i % 3), durationHours: 3, tone: "mystery" };
  const bones = generateBones({ seed: "COMPILE-" + i });
  const pkg = compileBones(bones, options);
  const again = compileBones(generateBones({ seed: "COMPILE-" + i }), options);
  assert(JSON.stringify(pkg) === JSON.stringify(again), "compile must be deterministic");
  assert(pkg.forgeBones && assertBonesUnchanged(bones, pkg.forgeBones), "compiled package dropped bones");
  assert(pkg.metadata.seed === bones.seed, "seed lost");
  assert(pkg.quest.objective === bones.hook.objective, "quest objective drifted");
  assert(pkg.truth.secrets[0].text === bones.twist.actualTruth, "truth drifted");
  assert(pkg.encounters.length === 3, "encounter slots");
  assert(pkg.recovery.routes.length >= 3, "recovery");
  assert(pkg.initialState.currentSceneId === "scene-hook", "opening");
}

console.log("Compiled 40 ForgeBones packages without mutating bones.");
