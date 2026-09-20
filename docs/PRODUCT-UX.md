# One-Shot Forge Product UX Contract

## Core product promise

One-Shot Forge sells and runs original, 5E-compatible, zero-prep one-shot adventures. A GM should be able to open the site, choose an adventure, and begin running it immediately without reading the full module first.

## Required player flow

1. **Hero page**
   - Explain the zero-prep promise in one screen.
   - Show clear level, party size, play-time, tone, and price expectations.
   - The primary action is to choose an adventure, not configure the engine.

2. **Adventure cards**
   - Adventures appear as flexible catalog cards.
   - Each card shows title, one-sentence hook, level, party size, expected duration, tone, and status/price.
   - Opening a card launches that adventure's runner.
   - Generator/admin controls must not dominate the customer-facing catalog.

3. **Stage-card runner**
   - The adventure is run from beginning to end as an ordered sequence of scene/stage cards.
   - The active card contains everything the GM needs for that stage:
     - read-aloud text
     - immediate objective
     - GM notes
     - checks/DCs and consequences
     - NPC cues
     - clues
     - encounters/stat blocks
     - traps/hazards/puzzles
     - treasure/rewards
     - tactical/map callouts
     - pacing guidance
     - exits/next choices
   - The GM should not need to search side panels for information required to run the current stage.

4. **Branching without fragmentation**
   - Player choices may create multiple paths.
   - Different routes should reconverge on shared core revelations and a coherent finale whenever the adventure design allows it.
   - A skipped scene must never permanently hide a required clue.
   - Alternate paths should change costs, encounters, allies, clues, positioning, or consequences rather than creating multiple separate modules the GM must prep.
   - The finale may offer multiple resolutions while still resolving the same central conflict.

5. **End state**
   - The final card resolves the adventure, applies rewards/consequences, and clearly closes the run.
   - The GM should be able to review the path taken and ending reached without reconstructing the session manually.

## Design rule

Every feature should be judged against one question:

> Can a GM run this adventure directly from the webpage, in order, without preparation or hunting for information?

If not, the feature or content is incomplete.
