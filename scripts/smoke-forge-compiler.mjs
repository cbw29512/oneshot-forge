#!/usr/bin/env node
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {generateBones}=require("../forge-bones.js");
const {compileBones}=require("../forge-compiler.js");

try {
  for (let i=0;i<50;i++) {
    const seed=`COMPILER-${i}`;
    const bones=generateBones({seed});
    const pkg=compileBones(bones);
    assert.equal(pkg.truth.facts.length,bones.requiredFacts.length);
    assert.deepEqual(pkg.truth.facts,bones.requiredFacts);
    assert.equal(pkg.clues.length,bones.requiredClues.length);
    assert.equal(pkg.encounters.length,2);
    assert.equal(pkg.scenes.filter((scene)=>scene.id.startsWith("scene-random-")).length,2);
    assert.equal(pkg.initialState.currentSceneId,"scene-preview");
    const sceneIds=new Set(pkg.scenes.map((scene)=>scene.id));
    const locationIds=new Set(pkg.locations.map((location)=>location.id));
    const npcIds=new Set(pkg.npcs.map((npc)=>npc.id));
    const encounterIds=new Set(pkg.encounters.map((encounter)=>encounter.id));
    const clueIds=new Set(pkg.clues.map((clue)=>clue.id));
    for (const scene of pkg.scenes) {
      assert.ok(locationIds.has(scene.locationId),`${seed}: unknown location ${scene.locationId}`);
      for (const id of scene.npcIds || []) assert.ok(npcIds.has(id),`${seed}: unknown NPC ${id}`);
      for (const id of scene.encounterIds || []) assert.ok(encounterIds.has(id),`${seed}: unknown encounter ${id}`);
      for (const id of scene.clueIds || []) assert.ok(clueIds.has(id),`${seed}: unknown clue ${id}`);
      for (const id of scene.exits || []) assert.ok(sceneIds.has(id),`${seed}: unknown exit ${id}`);
    }
    assert.ok(pkg.scenes.every((scene)=>scene.readAloud===""),"compiler must not invent AI flesh");
    assert.ok(pkg.endings.some((ending)=>ending.id==="ending-noncombat"),"noncombat ending must survive compilation");
    for (const clue of pkg.clues) {
      assert.ok(clue.sources.length>=3,"required clue redundancy must survive compilation");
    }
  }
  console.log("Forge compiler smoke OK: 50 deterministic packages preserve truth, clues, references, two encounters, and AI-flesh boundary.");
} catch (error) {
  console.error("Forge compiler smoke failed:",error);
  process.exit(1);
}
