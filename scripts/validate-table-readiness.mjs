#!/usr/bin/env node
import fs from "node:fs";

function fail(message) {
  console.error(`TABLE-READINESS: ${message}`);
  process.exitCode = 1;
}

function countWords(value) {
  try {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  } catch (error) {
    console.error(`TABLE-READINESS: could not count words: ${error.message}`);
    return Number.POSITIVE_INFINITY;
  }
}

try {
  const file = process.argv[2];
  if (!file) throw new Error("usage: node scripts/validate-table-readiness.mjs <adventure.json>");
  const adventure = JSON.parse(fs.readFileSync(file, "utf8"));
  const npcs = new Map((adventure.npcs || []).map(npc => [npc.id, npc]));
  const clues = new Map((adventure.clues || []).map(clue => [clue.id, clue]));
  const encounters = new Map((adventure.encounters || []).map(encounter => [encounter.id, encounter]));
  const maxReadAloudWords = 140;
  const maxGmSetupWords = 130;

  // A zero-prep GM must understand the product before scene one without reading the module.
  if (!adventure.metadata?.title?.trim()) fail("adventure has no title.");
  if (!Number.isInteger(adventure.metadata?.partyLevel) || adventure.metadata.partyLevel < 1) fail("adventure has no usable party level.");
  if (!adventure.metadata?.partySizeRange?.trim()) fail("adventure has no supported party-size range.");
  if (!Number.isInteger(adventure.metadata?.durationMinutes) || adventure.metadata.durationMinutes < 30) fail("adventure has no usable play-time estimate.");
  if (!adventure.setup?.pitch?.trim()) fail("adventure has no player-facing pitch/hook.");
  if (!adventure.setup?.gmSummary?.trim()) fail("adventure has no under-a-minute GM setup.");
  const gmSetupWords = countWords(adventure.setup?.gmSummary);
  if (gmSetupWords > maxGmSetupWords) {
    fail(`GM setup is ${gmSetupWords} words; zero-prep setup must stay at or below ${maxGmSetupWords} words (about one minute). Move stage-specific detail to the relevant Stage Card.`);
  }
  if (!adventure.quest?.objective?.trim()) fail("adventure has no immediate quest objective.");
  if (!adventure.quest?.stakes?.trim()) fail("adventure has no stated stakes.");
  if (!adventure.quest?.deadline?.trim()) fail("adventure has no actionable deadline/pressure cue.");
  if (!adventure.quest?.successConditions?.length) fail("adventure has no explicit success conditions for closing the session.");
  if (!adventure.quest?.failureConditions?.length) fail("adventure has no explicit failure conditions for closing the session.");

  for (const scene of adventure.scenes || []) {
    const label = `${scene.id} (${scene.title})`;
    if (!scene.readAloud?.trim()) fail(`${label} has no read-aloud.`);
    const readAloudWords = countWords(scene.readAloud);
    if (readAloudWords > maxReadAloudWords) {
      fail(`${label} read-aloud is ${readAloudWords} words; zero-prep stage text must stay at or below ${maxReadAloudWords}. Move GM-only explanation into gmNotes instead of boxed text.`);
    }
    if (!scene.gmNotes?.length) fail(`${label} has no immediate GM notes.`);
    if (!scene.purpose?.trim()) fail(`${label} has no stage objective/purpose.`);
    if (!Number.isInteger(scene.estimatedMinutes) || scene.estimatedMinutes < 1) fail(`${label} has no usable pacing estimate.`);

    for (const npcId of scene.npcIds || []) {
      const npc = npcs.get(npcId);
      if (!npc) { fail(`${label} references missing NPC ${npcId}.`); continue; }
      if (!npc.role?.trim()) fail(`${npc.name} has no quick-use role.`);
      if (!npc.personality?.length) fail(`${npc.name} has no personality cues.`);
      if (!npc.wants?.length) fail(`${npc.name} has no motive/wants.`);
      if (!npc.voiceCues?.length) fail(`${npc.name} has no dialogue/voice cues.`);
    }

    for (const clueId of scene.clueIds || []) {
      if (!clues.has(clueId)) fail(`${label} references missing clue ${clueId}.`);
    }
    for (const encounterId of scene.encounterIds || []) {
      if (!encounters.has(encounterId)) fail(`${label} references missing encounter ${encounterId}.`);
    }
  }

  for (const clue of adventure.clues || []) {
    if (clue.required && (clue.sources || []).length < 2) {
      fail(`required clue ${clue.id} has fewer than two delivery sources.`);
    }
  }

  const finale = (adventure.scenes || []).at(-1);
  if (!finale) fail("adventure has no scenes.");
  else {
    if (!/(final|resolution|ending|choice|guest|ritual)/i.test(`${finale.title} ${finale.purpose}`)) {
      fail(`last stage ${finale.id} does not read as a clear finale/resolution stage.`);
    }
    if ((finale.exits || []).length) {
      fail(`last stage ${finale.id} still has scene exits; a zero-prep adventure must end with an explicit closure stage, not an unresolved transition.`);
    }
    const closureText = `${finale.purpose || ""} ${(finale.gmNotes || []).join(" ")}`;
    if (!/(end|ending|resolve|resolution|return|surviv|reward|pay|aftermath|consequence)/i.test(closureText)) {
      fail(`last stage ${finale.id} lacks an explicit aftermath/closure cue for the GM.`);
    }
  }

  if (!process.exitCode) {
    console.log(`Table-readiness OK: ${adventure.metadata?.title || file} — ${(adventure.scenes || []).length} stages, ${npcs.size} NPCs, ${clues.size} clues; explicit success/failure closure; GM setup <= ${maxGmSetupWords} words; read-aloud <= ${maxReadAloudWords} words/stage.`);
  }
} catch (error) {
  console.error(`TABLE-READINESS ERROR: ${error.message}`);
  process.exit(1);
}
