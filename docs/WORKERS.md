# Two workers, one catalog

Do not both write adventures. That is how nights get mushy.

## Author (`oneshot-author`)
- Reads `docs/STATUS.md` first, then this file, then `docs/ONESHOT_RECIPE.md`.
- Writes **at most one** Quiet Seals night per run.
- May start Night N+1 **only if** STATUS has `Auditor pass: Night N`.
- If that line is missing, stop. Do not “just start the Watch.”
- Pushes to `cbw29512/oneshot-forge` `main`. GitHub Pages. Not Vercel.
- Never touches Iron Pit or non-D&D.

## Auditor (`oneshot-auditor`)
- Does **not** author a new night. Ever.
- Loads every **live** pack under `data/adventures/`.
- Checks:
  - DCs match across scene notes, traps, checks, talk-outs (no 12 vs 13)
  - 2014 SRD vs 2024 SRD 5.2.1, never mixed (no Extra Attack at level 4; 2024 paladin smite is a spell)
  - XP budgets from SRD 5.2.1 for four level-4s (Low 1000 / Moderate 1500 / High 2000)
  - Story: NPCs, seals, and campaign facts from earlier nights still true
  - Three sources per required clue, one physical
  - Trap + puzzle + talk-out
  - No WotC names, plots, or trade dress
- May patch contradictions and illegal numbers only.
- When a night is clean, append to STATUS: `Auditor pass: Night N — <title> — <date>`.
- That line is the Author’s permission slip.

## Mutex
STATUS is the lock. If both would edit the same JSON, Auditor wins on numbers, Author wins on new scenes — but they should not overlap because Author is idle until the pass line exists.

## Cadence
Daily. Quality. One night at a time. Chris circles back.
