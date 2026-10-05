# Right to OwlBear Arms v1.1 — DM audit

Audited 2026-10-03. Contains story spoilers. **Imported review preview; public release blocked until gameplay corrections pass.**

## Source and preservation

- Source: `cbw29512/FlorenceRPGWebsite`, commit `a6148e4616aadb8a6cfcb6cdae9a0e7430a1356f`.
- Original path: `assets/Right_to_OwlBear_Arms_Complete_Adventure_Bundle_v1.1.zip`.
- Original ZIP Git blob SHA-1: `93db213c977b7d94e78b39af1a96d081d436642c` (1,524,131 bytes).
- Destination: `assets/bundles/right-to-owlbear-arms-v1.1.zip`, byte-for-byte original.
- All 13 entries are present. The 12 payload sizes and SHA-256 hashes match MANIFEST.json. Extracted downloads match the archive bytes.
- Grubbleclaw's site illustration is the original embedded JPEG from the supplied DM visual.
- Original PDFs, DOCX, attribution, and manifest remain unchanged. This audit is separate from the author's adventure.

## What works

- Strong, specific premise: an intelligent owlbear has appropriated village weapons before a dusk raid. Negotiation changes the defense problem.
- Three acts, opening dialogue, NPC motives and tells, legal bargaining, alternate endings, and a practical new-DM fast start are present.
- Edra's secret has multiple named witnesses and physical evidence. Players can reach the owlbear by different routes.
- All five pregens have level-6 fixed-average HP consistent with their listed Constitution; major attack bonuses and spell-slot counts are present.
- Old Cobb's player map was rendered and inspected. It avoids naming the eggs, the traitor, and the egg-raid objective. It is an illustrated reference rather than a measured tactical grid.
- NPC cards distinguish player fronts and DM backs. The final clue flow is clearly DM-only. Treaty and Writ handouts belong after the earned ending.

## Blocking findings and acceptance criteria

| Priority | Evidence in original adventure | Required correction before release certification |
|---|---|---|
| P0: story continuity | p.4 says Tomas died in the logging-camp raid three months ago; p.7 has Cobb leaving Tomas in the owlbear lair and says he died in the woods, not raider hands; p.19 again places the death at the camp; p.23 dates Cobb's lair expedition to two days ago. | Choose one authoritative chronology. Synchronize Cobb, Edra, clue flow, NPC cards, survivor-map context, and cheat sheet. Preserve Edra's motive without contradictory evidence. |
| P0: final-defense procedure | pp.20–22 list two fronts and a Round-3 egg raid, but absent PCs cause unspecified additional Defense Point damage; splitting the party makes each fight “harder by one tier” without instructions. Defense outcomes omit remaining points 1–2. p.22 uses reaching 0; p.29 uses below 0. | State wave timing, travel distance/time, initiative between fronts, exact per-round loss and outcome for every score. Provide playable procedures for village, nest, split, relocated-eggs, and no-alliance routes. |
| P0: training and time | p.9 gives Bess four hours for +1 Defense; p.21 gives her one hour and lists a separate PC-training bonus; p.28 compresses this to one training entry. | One time cost, explicit stacking rule, and a usable preparation clock before dusk. |
| P0: encounter math | p.21 asserts about 8,400 raw XP and “hard-to-deadly” after a large-group multiplier. Monster roster uses ambiguous chief stats and an unspecified modified acolyte/shaman. The source provides no reproducible budget. | Pin every stat block, calculate raw and adjusted XP for each actually simultaneous wave, account for allies and split parties, and playtest the pressure clock. Five level-6 PCs have 2014 Hard 4,500 / Deadly 7,000 thresholds; an asserted 8,400 raw is already beyond Deadly before multipliers. |
| P0: rules at the table | pp.20–21 rely on Monster Manual/page references, undefined “+stealth,” and an acolyte with extra spells/slot. | Supply complete usable enemy and spell procedures, including DCs, resources, timing, morale, and shaman targeting. No essential combat lookup should leave the package. |
| P1: homebrew clarity | pp.17–18 call custom actions Wand of Web and Eversmoking Bottle while changing their standard procedures. “The second time it works” conflicts with the self-web roll. Mantle removal says normal owlbear without a replacement block. Deception starts combat “at disadvantage” without scope/duration. | Label custom item rules explicitly, reconcile the random/scripted web result, define post-mantle stats and HP handling, and specify the affected roll/duration. Check saves, shield AC, and javelin modifiers against the intended custom block. |
| P1: complete heroes | Each of five hero pages gives only key skills and proficient saves. Most spells are names without effects. Ranger second favored-enemy/terrain choices are not supplied. | Rebuild under PREGEN_PRINT_STANDARD: all six saves and eighteen skills, resources, complete class/species features, and readable spell reference backs. Verify legal choices without inventing missing authorial selections. |
| P1: earned player reveals | The treaty explicitly reveals the nest, eggs, retained items, and final agreement. Grubbleclaw's “player safe” card front also mentions proof of inside help. | Label handouts by reveal timing, keep NPC backs and all DM maps hidden, and hold Grubbleclaw's card until the relevant conversation. Check fronts visually at print size. |

## Convenience and publication decision

The catalog now distinguishes this **PDF bundle** from the eight browser-run adventures. Its Start Here page gives one complete ZIP, direct file links, first-reading guidance, printing instructions, and separate player/DM sections. It does not send level-6 players to the site's unrelated level-4 pregens or claim an interactive runner exists.

Current access is a free review preview. Approval and sellable flags remain false because the gameplay audit is unresolved. Import/integrity checks passing do not certify gameplay or encounter balance. The original v1.1 remains available for review; correct the above in a newly versioned edition and rerun the full product gates before release.

## Rules references

- [Official 2014 Basic Rules: Building Combat Encounters](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/building-combat-encounters), level-6 thresholds and multiple-monster adjustment. These thresholds assess the source's assertion, not a certified replacement encounter.
- [Official SRD 5.1 download page](https://www.dndbeyond.com/srd), for the 2014 spell, item, and class baseline. The source's declared basis is 2014/SRD 5.1; it has not been certified for 2024.
- Local contracts: `PRODUCTION_GAMEPLAY_STANDARD.md`, `PREGEN_PRINT_STANDARD.md`, `COMMERCIAL_PRODUCT_CONTRACT.md`, and `AGENTS.md`.
