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
- Whispers of the Oakhaven Hollow — Oakhaven Module 02, standalone curated lane, Level 3 / 4 players / 2–3 hours. Review/free-preview state with $0.99 target; no checkout claim until commercial gates pass.
- Beneath the Eastern Watchtower — Oakhaven Module 03, standalone curated lane, Level 3 / 4 players / 2–3 hours. Artifact/environment finale; review/free-preview state with $0.99 target.
- The Black Orchard — Oakhaven Module 04, standalone curated lane, Level 3 / 4 players / 2–3 hours. Rescue + resource-choice finale; review/free-preview state with $0.99 target.
- The Ashen Bridge — Oakhaven Module 05, standalone curated lane, Level 3 / 4 players / 2–3 hours. Timed rescue/infrastructure finale; review/free-preview state with $0.99 target.
- The Bell Beneath the Mere — Oakhaven Module 06, standalone curated lane, Level 3 / 4 players / 2–3 hours. Flooded ghost mystery + social-choice finale; review/free-preview state with $0.99 target.

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

## Last session
2026-10-02 — Capped From Zero to Hero Level-0 ability generation at an absolute 30 point-buy value. The completed campaign still guarantees a 27-point floor; critical-success growth may raise the base array only to 28–30. Development Points can still be earned after the cap but cannot increase ability scores or carry hidden mechanical power into Level 1. The spend UI now blocks any investment that would cross 30, graduation audits the 27–30 range, and CI enforces the ceiling.
2026-10-02 — Tuned From Zero to Hero around low base success and Character Advantage. Developmental DC floors are now 15 at ages 12–13, 16 at ages 14–16, and 17 at ages 17–18. A specific character-grounded approach can earn Advantage (two d20s, keep higher); the reason is recorded in the growth history. Advantage may come from bonds, fears, values, aspirations, relationships, mentor lessons, familiarities, possessions, earlier consequences, concrete scene features, or meaningful accepted risks/costs. Acting skill/eloquence is never required, generic repeated justifications do not qualify, Advantage does not stack, and failing to earn it never imposes Disadvantage. The 27-point graduation floor remains guaranteed.
2026-10-02 — Locked the From Zero to Hero baseline at a guaranteed 27-point-buy-equivalent minimum after all 21 base growth opportunities. Success/failure/critical failure still differentiate where development lands, but none can reduce the total baseline budget. Graduation is now blocked below 27. Added Maturity Settlement to return only stranded partial progress or cap-blocked Lesson Points to the flexible wallet; it cannot mint new growth. Critical-success bonus points can still raise the final array above 27 and remain explicitly labeled Heroic/house-rule ability generation.
2026-10-02 — Reworked From Zero to Hero development after owner review. Growth now accumulates in a spend-when-you-want wallet. Success gives +1 Flexible DP; failure gives +1 off-path Lesson DP; critical success gives +2 Flexible DP total; critical failure gives +1 off-path Lesson DP and, when possible, redirects one already-invested point from the attempted ability into that lesson ability. This preserves meaningful success/failure differences without ordinary failure deleting growth. Removed Final Reflection. Graduation now audits and labels the base array: at/below 27 point-buy value is within the normal envelope; spent critical bonuses above 27 are explicitly Heroic/house-rule ability generation. Post-graduation 2014/2024 mechanics remain edition-locked.
2026-10-02 — Audited `From Zero to Hero` for RAW graduation and development fairness. Developmental checks now resolve normal d20+modifier vs DC first; natural 20/1 only adds a Level-0 narrative critical tier and never overrides the total. Critical success/success/failure/critical failure all award exactly one Development Point and zero permanent build delta. Added no-roll Final Reflection to convert incomplete high-score marks into an exact 27-point pre-origin array, locked RAW graduation until that audit passes, made familiarity/mentors/heirlooms narrative-only by default, moved mechanical Origin Legacy to explicit opt-in house-rule mode, and added exhaustive CI proof over every legal 21-choice growth distribution. Official 2014/2024 rule references and boundaries are documented in `docs/ZERO_TO_HERO_RAW_AUDIT.md`.
2026-10-02 — Began owner-directed `From Zero to Hero` Level-0 origin system on an isolated feature branch: ages 12–18, all six abilities start at 9, seven yearly mini-adventures with exactly three development opportunities each (21 total), six valid approaches per growth beat, Level-0-only natural-20/natural-1 critical outcome rules, fail-forward failure, pre-origin score cap 15, persistent Hearthcross village with 14 evolving NPCs, printable/persistent growing-up sheet, and separate 2014/2024 Level-1 graduation contracts. Added CI validation for budget, age progression, NPC completeness, outcome completeness, cap guard, and edition isolation. Graduation into actual class packs remains gated until certified Level-1 packs are wired.
2026-10-02 — Production gameplay/web pass: rebuilt the catalog around direct Run/Resume actions with level/party/time/style tags; widened and simplified the GM runner with compact adventure/resource menus, visible stage objective, checklist progress, stage progress, stronger next-choice navigation, and secondary reference collapse; upgraded long-form modules with runnable stage order, move-on conditions, NPC ready dialogue/reactions, encounter goals/talk-outs/bypasses; added distinct cover-style visual identities to Owlbear and Oakhaven landing pages; made level-3 print materials truthfully block incompatible level-4 pregens; defined and CI-gated docs/PRODUCTION_GAMEPLAY_STANDARD.md. Commercial checkout remains gated.
2026-10-02 — Completed live-catalog NPC reaction consistency: Watchtower and Black Orchard now include accusation responses for every core NPC, so all live adventures expose agreement/refusal/accusation/danger behavior in the GM runner. The catalog zero-prep gate now requires all four states.
2026-10-02 — Continued existing-catalog polish after the Lantern/Well retrofit: deepened Ashen Bridge and Bell Beneath the Mere locations with sensory/spatial cues, strengthened the Mere rescue/ending read-aloud, added accusation reactions for their core NPCs, and updated the shared runner to surface accusation reactions when authored.
2026-10-02 — Began full existing-catalog improvement pass. Retrofitted The Lantern Below and The Well That Would Not Dry to the modern zero-prep stage standard without changing their bones: ordered run steps, explicit move-on conditions, full NPC visual/voice/dialogue/reaction cards, explicit encounter objectives, and stronger pacing cuts. Reconciled Owlbear encounter objectives. Added a catalog-wide CI baseline so every live one-shot must keep runnable scenes, NPC table voice, encounter jobs, and pacing guidance.
2026-10-02 — Compiled ForgeBones into the Adventure Package schema (`forge-compile.js`). Forge Lab now opens the compiled bones package in the runner instead of the old generator. Bones stay attached as `forgeBones` and are not mutated. Not release-ready prose.

2026-10-02 — Fixed a release-blocking GM runner readability defect reported from the live Mere Bell stage card: nested spoken/NPC/transition panels had inherited dark text on a dark brown surface. Standardized those panels on a high-contrast paper palette, enlarged dense dialogue text/spacing, added a 7:1 contrast regression gate, and cache-busted the runner stylesheet.
2026-10-01 — Built Oakhaven Module 06 `The Bell Beneath the Mere`: Mere Level 0–3, skimmer bypass, LOW/HIGH/LOW warning puzzle, Tamsin air-pocket rescue with alternate route at max flood, founder diversion archive, release/silence/preserve Ysra endings, two visual handouts/maps, and Module 07 Founders' Crypt hook.
2026-10-01 — Built Oakhaven Module 05 `The Ashen Bridge`: six-person bridge rescue, four-integrity visible clock, ash-lime mixing puzzle, guide-line/cargo preparation, optional medicine-wagon reward, hanging-rescue fail-forward, three outcome states, bridge map/handout, and Module 06 Mere bell-chamber hook.
2026-10-01 — Built Oakhaven Module 04 `The Black Orchard`: nonlethal orchard wardens, three-offering fail-forward puzzle, Lio rescue, living wardstone truth, Return/Take/Living-Graft finale, three consequence endings, two maps, and Module 05 Ashen Bridge hook.
2026-10-01 — Built Oakhaven Module 03 `Beneath the Eastern Watchtower`: flooded-undercroft bypass/combat, 5/3/1 pressure puzzle, Tower Strain clock, three-job Gloam Sluice repair finale, destructive-core shortcut, three consequence endings, two tactical maps, zero-prep quick-run data, and Module 04 Black Orchard hook. Also centralized authored adventure browser paths in `adventure-registry.js` with a CI drift validator.
2026-10-01 — Built Oakhaven Module 02 `Whispers of the Oakhaven Hollow` as an authoritative Adventure Package: Bramble Guard map/hazard, fail-forward moonstone puzzle, Shroud clock, Heart Tree Core job, lethal/nonlethal Malakor resolutions, tactical maps, quick-run numbers, storefront preview wiring, and level-safe pregen fallback. Commercial state remains review/free-preview with a $0.99 target.
2026-09-26 — Auditor pass on The Owlbear Egg (findings above) + confirmed it is a standalone, not a Quiet Seals night. Fixed a storefront oversight: The Well That Would Not Dry is authored and CI-clean but was missing from `data/products.json` and the homepage; added it as a live free-preview card (now three playable nights). No new night authored. The Watch still waits.
2026-09-20 — Product pass, not Night 3: Well cover, maps actually render (`src` vs `asset`), print module honors `?id=`, dusk/moonrise on the stage card, sticky Next/Back, Night 1/2 switcher. Author still waits for tomorrow for the Watch.

2026-09-26 — Began Forge v2 foundation: deterministic ForgeBones schema/generator, explicit AI flesh immutability contract, 250-seed smoke coverage, and a Forge Lab bones preview / AI brief.

2026-09-26 — Added locked `docs/FORGE_CONSTITUTION.md` as the highest-priority project contract. Separated curated cadence from Forge Farm batch production and registered The Wishing Cake as Reference #1 for abstract craft lessons only.

2026-09-26 — Owlbear tonight polish: added a visible dawn/hatching clock, made the return ending depend on the father's fate, synchronized the mother card, and added actionable pacing cuts without removing core consequences.

## Locked standards — 2026-09-26

- The clean-print fixed Letter pregen format is now canonical: see `docs/PREGEN_PRINT_STANDARD.md`.
- Scene narration, location description, NPC voice, monster behavior, and printable cards are governed by `docs/PRESENTATION_STANDARD.md`.
- Current polish target: bring The Owlbear Egg through the presentation gate without changing its approved consequence structure.
