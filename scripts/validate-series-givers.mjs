import fs from 'node:fs';

const campaignPath = 'data/campaigns/quiet-seals.campaign.json';

function fail(message) {
  console.error(`SERIES GIVER ERROR: ${message}`);
  process.exitCode = 1;
}

try {
  const campaign = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
  const episodes = new Map((campaign.episodes || []).map((episode) => [episode.number, episode]));
  const npcs = new Map((campaign.npcs || []).map((npc) => [npc.id, npc]));
  const authored = (campaign.episodes || []).filter((episode) => episode.pack);

  for (const episode of authored) {
    try {
      const adventure = JSON.parse(fs.readFileSync(episode.pack, 'utf8'));
      const expectedNpc = npcs.get(episode.giver);
      const actualGiver = adventure.series?.giver;

      if (!expectedNpc) {
        fail(`Episode ${episode.number} references unknown campaign giver ${episode.giver}.`);
        continue;
      }
      if (!actualGiver) {
        fail(`${episode.pack} has no series.giver.`);
        continue;
      }
      if (actualGiver !== expectedNpc.name) {
        fail(`${episode.pack} series.giver is "${actualGiver}" but campaign episode ${episode.number} assigns "${expectedNpc.name}".`);
      } else {
        console.log(`Series giver OK: episode ${episode.number} -> ${actualGiver}`);
      }
    } catch (error) {
      fail(`Could not validate ${episode.pack}: ${error.message}`);
    }
  }

  if (!process.exitCode) console.log(`Series giver validation passed for ${authored.length} authored episodes.`);
} catch (error) {
  console.error(`SERIES GIVER VALIDATOR FAILED: ${error.message}`);
  process.exit(1);
}
