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
- CI sale gates include Night 3 validation/stage-card/clue checks.
- `quickrun.js` now recognizes Night 3 by package id, removing one review-path gap.
- Runner/module authored-package registries still need Night 3 registration before the webpage can be called zero-prep runnable end-to-end.
- The prior exact-head Actions run failed before workflow steps were reported (runner showed zero steps). Treat as infrastructure/workflow-start blocker until a subsequent run exposes a test failure or succeeds; do not merge.

## Next (in order)
1. Register Night 3 in the main runner/module package maps, then run the exact-head CI gates.
2. Auditor pass on Night 3; fix any rules/difficulty or table-readiness issues.
3. Get Chris review on Night 3; preserve sections marked LEAVE ALONE.
4. Only after explicit approval, freeze Night 3 and begin Night 4.
5. Checkout only after owner gives a payment account.

## Do not
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write two nights in one day

## Last session
2026-09-23 — Continued Night 3 rather than starting a new adventure. Registered its package in the quick-run loader and re-audited the delivery path. The authored package/sidecar and CI sale gates exist in draft PR #34, but the main runner/module registries still need Night 3 before end-to-end webpage review is complete. Prior Actions failure exposed zero workflow steps, so no code test failure has yet been identified.