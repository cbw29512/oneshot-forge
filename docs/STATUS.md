# One-Shot Forge status

Read this file before doing any work. Update it at the end of every session.
Quality over quantity. See docs/QUALITY.md, docs/ONESHOT_RECIPE.md, docs/WORKERS.md.

## Product
Pick a card. Run stage cards. GitHub Pages. No ads. No WotC IP. Do not touch Iron Pit.

Live: https://cbw29512.github.io/oneshot-forge/

## Cadence
**One authored night per day, then an auditor pass.** If it starts to feel like slop, skip a day. Never two nights in one run.

## Standalone one-shots (outside The Quiet Seals)
- The Owlbear Egg — standalone one-shot, NOT a Quiet Seals night. Owner confirmed 2026-09-26. Do not fold it into `data/campaigns/quiet-seals.campaign.json` or the recipe night list. Reuses the shared level-4 pregens.

## Auditor
- Auditor pass: Night 1 — The Lantern Below — 2026-09-20
- Auditor pass: Night 2 — The Well That Would Not Dry — 2026-09-20
  - Five endings (summary had said four)
  - Mill Kade ≠ Oda’s mill; drying-shed fire is in Saltmere
  - Square map: well-house N, Jory SW, drying shed NW, road S
  - Name-Drowned billed as CR 1/4 (Low); talk-out is the door
  - Cistern jobs print DC 13 / 15 / 13 / 15
- Auditor pass: The Owlbear Egg (standalone) — 2026-09-26
  - Solid: moral-fork recipe hits all six beats; 5 required clues each have 3 authored sources; 4 legal endings; talk-out is feeding the father (no mandatory BBEG); snare trap has fail-forward (alarm bell); two puzzles both fail-forward; 2014 + 2024 rulesets noted; both pregen packs exist.
  - Fix (owner to confirm): father fight is the SRD owlbear (AC 13 / HP 59 = CR 3 / 700 XP) but the encounter never states CR or XP budget. 700 XP is under the recipe's Low (1,000) budget for 4×L4, yet the block reads "medium." Print CR/XP on the card and reconcile the difficulty label.
  - Fix (owner to confirm): no drawn grid battle map. Overview map `asset` is null and there are 0 playMaps; the square fight gives dimensions (60×60 ft) + features as text but no rendered grid. Recipe wants a grid for every fight.
  - Note: the clock is a resource/famine clock ("~2.5 days of food" + ration board), not a visible ticking time clock. Acceptable, but flagging against QUALITY bar #2.

## Forge direction (locked 2026-09-26)
- Random generation builds deterministic adventure bones first.
- Bones own facts, mechanics, scene order, clues, twists, DCs, outcomes, finale type, aftermath, and exactly two random encounters.
- AI adds dialogue, sensory description, read-aloud, and connective prose only. AI may not mutate authoritative bones.
- Preview fields will support independent reroll + lock behavior.
- Curated authored adventures remain valid examples/products; the runner consumes the same normalized package regardless of origin.

## Next (in order)
1. Compile ForgeBones into the normal Adventure Package schema so the new bones become authoritative for random adventures.
2. Add per-field reroll + lock controls to Forge Lab.
3. Expand compatibility-tagged scene pools.
4. Repair/audit Night 3 before merging it.
5. Checkout only after owner gives a payment account

## Do not
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write two nights in one day

## Last session
2026-09-26 — Auditor pass on The Owlbear Egg (findings above) + confirmed it is a standalone, not a Quiet Seals night. Fixed a storefront oversight: The Well That Would Not Dry is authored and CI-clean but was missing from `data/products.json` and the homepage; added it as a live free-preview card (now three playable nights). No new night authored. The Watch still waits.
2026-09-20 — Product pass, not Night 3: Well cover, maps actually render (`src` vs `asset`), print module honors `?id=`, dusk/moonrise on the stage card, sticky Next/Back, Night 1/2 switcher. Author still waits for tomorrow for the Watch.

2026-09-26 — Began Forge v2 foundation: deterministic ForgeBones schema/generator, explicit AI flesh immutability contract, 250-seed smoke coverage, and a Forge Lab bones preview / AI brief.
