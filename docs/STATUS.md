# One-Shot Forge status

Read `docs/FORGE_CONSTITUTION.md` before this file. The constitution is the locked project contract.
Update this file at the end of every session.
Quality over quantity. See docs/FORGE_CONSTITUTION.md, docs/QUALITY.md, docs/ONESHOT_RECIPE.md, docs/WORKERS.md.

## Product
Pick a card. Run stage cards. GitHub Pages. No ads. No WotC IP. Do not touch Iron Pit.

Live: https://cbw29512.github.io/oneshot-forge/

## Cadence
**Curated lane:** one authored Quiet Seals night per day, then an auditor pass. If it starts to feel like slop, skip a day.

**Forge Farm lane:** batch generation is allowed. There is no daily quantity target. Candidates may be generated in volume, but only constitution-compliant, audited candidates may become release-ready.

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
  - Current package: 9 scenes across 6 logical stages, 4 NPCs, 5 clues, 1 fail-forward strongbox puzzle, 4 endings, 2 grid battle maps, 7 printable tarot cards, 2014/2024 pregen packs.
  - Father encounter is explicitly CR 3 / 700 XP and labeled Low by XP for four level-4 characters; its danger comes from village consequences rather than inflated encounter math.
  - Visible physical clock: the egg hatches at dawn. Its state advances on-screen as intact → knock → hairline crack → spreading crack → hatching.
  - Return ending is stateful: if the father survived, returning the egg can end peacefully; if the party killed him, the mother retrieves the hatchling and attacks in Maternal Rage.
  - The standalone is not required to inherit Quiet Seals' mandatory trap beat; no filler trap is added just to satisfy stale campaign-specific notes.

## Forge direction (locked 2026-09-26)
- Random generation builds deterministic adventure bones first.
- Bones own facts, mechanics, scene order, clues, twists, DCs, outcomes, finale type, aftermath, and exactly two random encounters.
- AI adds dialogue, sensory description, read-aloud, and connective prose only. AI may not mutate authoritative bones.
- Preview fields will support independent reroll + lock behavior.
- Curated authored adventures remain valid examples/products; the runner consumes the same normalized package regardless of origin.

## Next (in order)
1. Add per-field reroll + lock controls to Forge Lab.
2. Expand compatibility-tagged scene pools.
3. Repair/audit Night 3 before merging it.
4. Checkout only after owner gives a payment account

## Do not
- Violate `docs/FORGE_CONSTITUTION.md`
- Let AI mutate ForgeBones
- Use reference adventures as plot/content banks
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write two curated Quiet Seals nights in one day
- Touch Iron Pit

## Last session
2026-09-29 — STATUS item 1: compile ForgeBones into the Adventure Package schema. Bones now emit requiredFacts/requiredClues (3-source, one physical). `forge-compiler.js` builds a pre-flesh package (empty readAloud). Forge Lab "Forge and open" now saves the compiled package, not the old generator pack. 50-seed compiler smoke is in CI. Left Night 3 and Iron Pit alone.

2026-09-26 — Auditor pass on The Owlbear Egg (findings above) + confirmed it is a standalone, not a Quiet Seals night. Fixed a storefront oversight: The Well That Would Not Dry is authored and CI-clean but was missing from `data/products.json` and the homepage; added it as a live free-preview card (now three playable nights). No new night authored. The Watch still waits.
