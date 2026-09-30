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
1. Compile ForgeBones into the normal Adventure Package schema so the new bones become authoritative for random adventures.
2. Add per-field reroll + lock controls to Forge Lab.
3. Expand compatibility-tagged scene pools.
4. Repair/audit Night 3 before merging it.
5. Checkout only after owner gives a payment account

## Do not
- Violate `docs/FORGE_CONSTITUTION.md`
- Let AI mutate ForgeBones
- Use reference adventures as plot/content banks
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write two curated Quiet Seals nights in one day

## Last session
2026-09-26 — Auditor pass on The Owlbear Egg (findings above) + confirmed it is a standalone, not a Quiet Seals night. Fixed a storefront oversight: The Well That Would Not Dry is authored and CI-clean but was missing from `data/products.json` and the homepage; added it as a live free-preview card (now three playable nights). No new night authored. The Watch still waits.
2026-09-20 — Product pass, not Night 3: Well cover, maps actually render (`src` vs `asset`), print module honors `?id=`, dusk/moonrise on the stage card, sticky Next/Back, Night 1/2 switcher. Author still waits for tomorrow for the Watch.

2026-09-26 — Began Forge v2 foundation: deterministic ForgeBones schema/generator, explicit AI flesh immutability contract, 250-seed smoke coverage, and a Forge Lab bones preview / AI brief.

2026-09-26 — Added locked `docs/FORGE_CONSTITUTION.md` as the highest-priority project contract. Separated curated cadence from Forge Farm batch production and registered The Wishing Cake as Reference #1 for abstract craft lessons only.

2026-09-26 — Owlbear tonight polish: added a visible dawn/hatching clock, made the return ending depend on the father's fate, synchronized the mother card, and added actionable pacing cuts without removing core consequences.

## Locked standards — 2026-09-26

- The clean-print fixed Letter pregen format is now canonical: see `docs/PREGEN_PRINT_STANDARD.md`.
- Scene narration, location description, NPC voice, monster behavior, and printable cards are governed by `docs/PRESENTATION_STANDARD.md`.
- Current polish target: bring The Owlbear Egg through the presentation gate without changing its approved consequence structure.

## Revenue pass — 2026-09-29

- Clarified homepage package contents, preview availability, and search/share metadata.
- Added the owner's optional support URL to the homepage and all product pages.
- Balanced catalog cards using a small storefront-only stylesheet.
- Product pages now reuse the existing catalog gates; product-contract loading resolves from the script URL so nested pages load the root contract.
- Added behavioral validation for preview, complete release gates, verified ownership, wrong-product ownership, failed requests, forged checkout returns, and HTTPS checkout navigation.
- All 21 repository validation steps pass locally. Product prices and release flags are unchanged.
- Real paid sales remain blocked on adventure approval/freeze, a provider account, trusted verification, and protected paid delivery. See `docs/REVENUE_PATHS.md`.
- Prepared for review only; no production publishing is authorized by this pass.
