import fs from "node:fs";

try {
  const pack = JSON.parse(fs.readFileSync("data/adventures/the-lantern-below.oneshot.json", "utf8"));
  const scaling = JSON.parse(fs.readFileSync("data/adventures/the-lantern-below.finale-scaling.json", "utf8"));
  const errors = [];

  const encounter = (pack.encounters || []).find(item => item.id === scaling.encounterId);
  const creature = encounter?.creatures?.find(item => item.name === "The Pale Guest");

  if (!encounter) errors.push(`Missing encounter ${scaling.encounterId}.`);
  if (!creature) errors.push("Missing Pale Guest creature in finale encounter.");
  if (creature && creature.ac !== scaling.baseline.bossAC) errors.push(`Scaling AC ${scaling.baseline.bossAC} does not match package AC ${creature.ac}.`);
  if (creature && creature.hp !== scaling.baseline.bossHP) errors.push(`Scaling HP ${scaling.baseline.bossHP} does not match package HP ${creature.hp}.`);

  const sizes = (scaling.partyScaling || []).map(row => row.partySize);
  for (const requiredSize of [3, 4, 5, 6]) {
    if (!sizes.includes(requiredSize)) errors.push(`Missing finale scaling for party size ${requiredSize}.`);
  }

  for (const row of scaling.partyScaling || []) {
    if (row.bossHP !== scaling.baseline.bossHP) errors.push(`Party size ${row.partySize} changes boss HP; scale pressure instead.`);
    if (!Array.isArray(row.adjustments) || row.adjustments.length === 0) errors.push(`Party size ${row.partySize} has no authored adjustments.`);
  }

  if (errors.length) {
    console.error("Lantern finale scaling validation failed:\n- " + errors.join("\n- "));
    process.exit(1);
  }

  console.log("Lantern finale scaling validation passed for parties of 3–6 without HP scaling.");
} catch (error) {
  console.error("Lantern finale scaling validation crashed.", error);
  process.exit(1);
}
