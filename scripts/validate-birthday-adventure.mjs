#!/usr/bin/env node
import fs from "node:fs";
import vm from "node:vm";

const errors = [];
const need = (ok, message) => { if (!ok) errors.push(message); };

try {
  const data = fs.readFileSync("birthday-one-shot/data.js", "utf8");
  const production = fs.readFileSync("birthday-one-shot/production.js", "utf8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    data + "\n" + production + "\nglobalThis.__ADVENTURE = ADVENTURE;",
    context
  );
  const adventure = context.__ADVENTURE;
  const source = data + "\n" + production;

  need(/2014 rules/i.test(adventure?.party || ""), "Birthday package must state its rules edition");
  for (const forbidden of ["Totem Warrior", "School of Illusion"]) {
    need(!source.includes(forbidden), `non-SRD subclass returned: ${forbidden}`);
  }

  need(Array.isArray(adventure?.rooms) && adventure.rooms.length >= 5, "Birthday adventure needs runnable rooms");
  for (const room of adventure.rooms || []) {
    const label = room.id || room.title || "room";
    need(room.readAloud?.trim(), `${label} missing read-aloud`);
    need(Array.isArray(room.details) && room.details.length >= 2, `${label} missing runnable details`);
    need(Array.isArray(room.checks), `${label} missing checks[]`);
    if (label !== "finale") need(room.transition?.trim(), `${label} missing narrative transition`);

    const requiredRoll = /must succeed|required check|only if.*dc\s*\d+/i.test(JSON.stringify(room));
    need(!requiredRoll, `${label} appears to gate required progress behind one roll`);
  }

  for (const npc of adventure.npcs || []) {
    need(npc.role?.trim(), `${npc.name} missing role`);
    need(npc.voice?.trim(), `${npc.name} missing voice`);
    need(npc.goal?.trim(), `${npc.name} missing motive/goal`);
    need(npc.secret?.trim(), `${npc.name} missing truth/secret relationship`);
    need(Array.isArray(npc.lines) && npc.lines.length >= 2, `${npc.name} needs table dialogue`);
  }

  const finale = (adventure.rooms || []).find(room => room.id === "finale");
  need(finale, "Birthday adventure missing finale");
  if (finale) {
    const finaleText = JSON.stringify(finale).toLowerCase();
    need(/social|persuasion|compassion|sincere|speak/.test(finaleText), "finale needs a noncombat/social resolution route");
    need(/birthday hero.*choose|chooses.*birthday hero/i.test(JSON.stringify(finale)), "Birthday Hero must retain final wish choice");
  }

  need(Array.isArray(adventure.pregens) && adventure.pregens.length >= 6, "Birthday package needs player-ready pregens");

  if (errors.length) {
    console.error("Birthday adventure validation failed:");
    errors.forEach(error => console.error(" -", error));
    process.exit(1);
  }

  console.log(`Birthday adventure OK — ${adventure.rooms.length} rooms, ${adventure.npcs.length} NPCs, 2014 SRD boundary preserved.`);
} catch (error) {
  console.error(`BIRTHDAY-ADVENTURE ERROR: ${error.message}`);
  process.exit(1);
}
