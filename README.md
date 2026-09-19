# One-Shot Forge

One-Shot Forge is an original fantasy RPG adventure builder and web-based Game Master runner.

The project is designed around four connected pieces:

1. **One-Shot Builder** — create a complete adventure from structured, reusable parts.
2. **Adventure Package** — one portable JSON format containing adventure truth, scenes, NPCs, clues, encounters, maps, rewards, pacing, and recovery logic.
3. **Web GM Runner** — upload/load an adventure package and run it from the browser without digging through a PDF.
4. **AI Director Contract** — constrain AI dialogue and improvisation so it follows established world truth, NPC knowledge, current game state, and recovery rules instead of inventing plot facts.

## Product goals

- Original branding and original adventure content.
- No D&D logo or copied Wizards trade dress.
- Designed for 5E-compatible fantasy RPG adventures without depending on protected setting material.
- Modular generation: lock good components, reroll weak ones, then build a coherent adventure.
- Adventures must be runnable, not just interesting prompts.
- Every required clue should have backup delivery routes.
- Player choices may change the route through the adventure without forcing the story back onto a script.
- AI may improvise presentation, dialogue, and local details, but may not overwrite adventure truth.
- New adventures should require data/content creation, not new application code.

## Core architecture

```text
Builder
  -> Adventure Package
      -> GM Runner
      -> AI Director
      -> Printable/exportable DM material
```

The Adventure Package is the center of the system. Builder and Runner must both read/write the same schema.

## Initial build order

1. Define the Adventure Package schema.
2. Hand-author one complete reference adventure.
3. Build a browser runner that can run that package.
4. Add NPC dialogue constraints and off-script recovery.
5. Add generation tables and lock/reroll assembly.
6. Add map support and player-facing reveal state.
7. Add publishing/library workflow.

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.
