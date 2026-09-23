# One-Shot Forge status

Read this file before doing any work. Update it at the end of every session.
Quality over quantity. See docs/QUALITY.md, docs/ONESHOT_RECIPE.md, docs/WORKERS.md.

## Product
Pick a card. Run stage cards. GitHub Pages. No ads. No WotC IP. Do not touch Iron Pit.

Live: https://cbw29512.github.io/oneshot-forge/

## Cadence
**One authored night per day, then an auditor pass.** If it starts to feel like slop, skip a day. Never two nights in one run.

## Auditor
- Auditor pass: Night 1 — The Lantern Below — 2026-09-20
- Auditor pass: Night 2 — The Well That Would Not Dry — 2026-09-20
  - Five endings (summary had said four)
  - Mill Kade ≠ Oda’s mill; drying-shed fire is in Saltmere
  - Square map: well-house N, Jory SW, drying shed NW, road S
  - Name-Drowned billed as CR 1/4 (Low); talk-out is the door
  - Cistern jobs print DC 13 / 15 / 13 / 15

## Active review
Night 3 — The Watch That Did Not Come Back — authored on `feat/night-3-watch`, draft PR #34.
- Five stage cards: gate hook, old-road guardian, duty-tag puzzle/trap, four-route muster finale, return/revelation.
- Required facts each have three authored sources and physical backup.
- Quick-run sidecar includes all checks, combat numbers, tactics, hazard, rewards, and tactical dimensions.
- CI sale gates now include Night 3 validation/stage-card/clue checks.
- Current exact head `329bb83b2b99971dda2345b70fb29c8e137f2bb1` failed before workflow steps were reported (runner shows zero steps). Treat as infrastructure/workflow-start blocker until a subsequent run exposes a test failure or succeeds; do not merge.

## Next (in order)
1. Auditor pass on Night 3; fix exact-head CI and rules/difficulty issues before merge.
2. Get Chris review on Night 3; preserve sections marked LEAVE ALONE.
3. Only after explicit approval, freeze Night 3 and begin Night 4.
4. Checkout only after owner gives a payment account.

## Do not
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write two nights in one day

## Last session
2026-09-23 — Authored Night 3 and its quick-run reference on a dedicated branch; opened draft PR #34; expanded CI sale gates to cover Night 3. Exact-head Actions run 147 failed before any workflow steps were exposed, so the branch is not merge-ready. Next pass is audit + CI diagnosis, not Night 4.
