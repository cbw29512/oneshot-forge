(() => {
  "use strict";

  // Canonical browser registry for authored adventure-package paths.
  // Commerce/release state remains authoritative in data/products.json.
  // Oakhaven series, one level each: hollow 2, watchtower 3, orchard 4, bridge 5, mere 6.
  // Level 1 and level 10 are the mayor's quests and are not packages yet. Levels 7–9 are not written.
  window.ONE_SHOT_ADVENTURES = Object.freeze({
    "the-lantern-below": "data/adventures/the-lantern-below.oneshot.json",
    "the-well-that-would-not-dry": "data/adventures/the-well-that-would-not-dry.oneshot.json",
    "the-owlbear-egg": "data/adventures/the-owlbear-egg.oneshot.json",
    "whispers-of-the-oakhaven-hollow": "data/adventures/whispers-of-the-oakhaven-hollow.oneshot.json",
    "beneath-the-eastern-watchtower": "data/adventures/beneath-the-eastern-watchtower.oneshot.json",
    "the-black-orchard": "data/adventures/the-black-orchard.oneshot.json",
    "the-ashen-bridge": "data/adventures/the-ashen-bridge.oneshot.json",
    "the-bell-beneath-the-mere": "data/adventures/the-bell-beneath-the-mere.oneshot.json",
    "the-fencewalker-of-bellmere": "data/adventures/the-fencewalker-of-bellmere.oneshot.json",
    "the-lanternback-of-reedwater": "data/adventures/the-lanternback-of-reedwater.oneshot.json",
    "the-wedding-that-never-ends": "data/adventures/the-wedding-that-never-ends.oneshot.json"
  });
})();
