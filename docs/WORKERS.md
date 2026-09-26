# Workers and the Forge Farm

**FIRST READ:** `docs/FORGE_CONSTITUTION.md`. It is the highest-priority project contract. If this file conflicts with it, the constitution wins.

Curated Author and Auditor must not both write the same adventure. Forge Farm workers may batch-generate candidates only through the constitution-defined bones → validation → AI flesh → audit pipeline.

## Author (`oneshot-author`)
- Reads `docs/FORGE_CONSTITUTION.md` first, then `docs/STATUS.md`, this file, and `docs/ONESHOT_RECIPE.md`.
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


## Forge Farm worker
- Reads `docs/FORGE_CONSTITUTION.md` first.
- May generate many candidates in one run.
- MUST use ForgeBones as authoritative state.
- MUST preserve deterministic seeds and locks.
- MUST run compatibility validation before AI flesh.
- MUST reject AI output that mutates bones.
- MUST run structural, mechanical, duplication, and table-readiness gates before marking a candidate release-ready.
- MUST NOT import plots, names, dialogue, distinctive encounters, maps, puzzles, monsters, items, or wording from reference adventures.
- Reference adventures teach presentation quality only.
- A failed candidate is regenerated/repaired; the gate is not weakened.
