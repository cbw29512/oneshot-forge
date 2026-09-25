# One-Shot Forge status

Read this file before doing any work. Update it at the end of every session.
Quality over quantity. See docs/QUALITY.md, docs/ONESHOT_RECIPE.md, docs/WORKERS.md.

## Product
Pick a card. Run stage cards. GitHub Pages. No ads. No WotC IP. Do not touch Iron Pit.

Live: https://cbw29512.github.io/oneshot-forge/

## Cadence
**One active authored night at a time.** Do not start the next one until Chris approves and freezes the current product. Quality over quantity.

## Auditor
- Auditor pass: Night 1 — The Lantern Below — 2026-09-20
- Auditor pass: Night 2 — The Well That Would Not Dry — 2026-09-20
  - Five endings (summary had said four)
  - Mill Kade ≠ Oda’s mill; drying-shed fire is in Saltmere
  - Square map: well-house N, Jory SW, drying shed NW, road S
  - Name-Drowned billed as CR 1/4 (Low); talk-out is the door
  - Cistern jobs print DC 13 / 15 / 13 / 15
- Auditor pass: Night 3 — The Watch That Did Not Come Back — 2026-09-24
  - Five-stage flow remains coherent and bounded to the four-hour target.
  - Required revelations have three delivery sources with physical backups.
  - Road and finale encounters have explicit talk-out/bypass procedures.
  - Duty-tag puzzle has player-facing prompt, solution, trap procedure, and fail-forward.
  - Preparation changes finale odds without making the camp mandatory.
  - Finale supports repair, release, bargain, or break/fight; final stage terminates cleanly.

## Active review
Night 3 — The Watch That Did Not Come Back — `feat/night-3-watch`, draft PR #34.
- Target: level 4, 3–6 players, about 4 hours.
- Five stage cards: gate hook, old-road guardian, duty-tag puzzle/trap, four-route muster finale, return/revelation.
- Required facts each have three authored sources and physical backup.
- Adventure package includes checks, consequences, combat numbers, tactics, hazards, rewards, maps/tactical dimensions, NPC cues, and transitions.
- Quick-run sidecar is synchronized and registered.
- Main runner and module package registries recognize Night 3.
- Terminal-stage validation is generic: every nonterminal core stage must transition and the final ordered stage must terminate.
- Exact head `e83af87a670252fb621a0b08bdcf0cb39cd6ae4e` passed Validate One-Shot Forge #159.
- Technical/zero-prep certification is green. Do not freeze or merge until Chris explicitly approves the adventure.

## Next (in order)
1. Hold Night 3 stable for Chris review; only fix verified defects or requested changes.
2. Preserve any section Chris marks LEAVE ALONE unless a verified bug requires correction.
3. After explicit approval, freeze Night 3 as a completed product and merge its approved PR.
4. Only then begin a meaningfully different Night 4.
5. Checkout only after owner gives a payment account.

## Do not
- Mix non-D&D
- Fake Beyond upload
- Call unwritten nights available
- Invent payment
- Write a new night while Night 3 awaits approval

## Last session
2026-09-24 — Re-read the active Night 3 package and certification state. Corrected stale project status that still claimed the runner/module registration and CI were blocked. Night 3 is now end-to-end registered and exact-head CI #159 is green at `e83af87a`. No filler scenes were added after certification; the product is intentionally held at the review gate pending Chris approval.