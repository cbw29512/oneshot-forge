# One-Shot Forge Development Rules

## Product
One-Shot Forge is an original fantasy RPG one-shot builder and web GM runner. Do not use protected logos, copied trade dress, or protected setting/adventure text.

## Architecture
1. The Adventure Package is authoritative.
2. Builder and Runner use the same schema.
3. Adventure truth is immutable during play unless the GM explicitly edits it.
4. Game state is separate, mutable, and resettable.
5. AI may improvise wording and local presentation, never canonical facts.
6. Required revelations need at least three independent delivery paths. At least one path must be physical (notes, tracks, inscriptions, a ward) so the adventure cannot hinge on a single NPC being alive, friendly, or present. Recovery routes must cover: quest giver refused or dead, antagonist attacked or skipped, a core scene bypassed. The finale must still be reachable and resolvable without any one named NPC.
7. Recovery preserves continuity, not a forced script.
8. Scenes form a graph and may be skipped/bypassed.
9. New adventures should require data/content, not new application code.
10. Keep V1 focused on GM adventure running; do not accidentally build a full VTT or universal combat engine.\n11. NPC IDs are package-scoped. The same NPC name, portrait, or reusable identity may appear in multiple adventures, and each adventure may assign that NPC a different role, knowledge set, secrets, motives, relationships, or allegiance. Never treat an NPC's role as a global property.

## Development
- Prefer small modules and explicit data contracts.
- Validate package data at boundaries.
- Fail clearly on malformed or unsupported adventure packages.
- Never silently invent missing canonical data.
- Keep original package data separate from runtime state.
- Add tests for schema changes and state transitions.
- Follow `docs/PRODUCTION_RULES.md` (SRD-only content, encounter math and 3–6 player scaling, fail-forward, card art style, never push to `main`).
## Scheduled work
- Stay on this repository only.
- Read `docs/STATUS.md` first. Do the next item on that list. Update STATUS when you stop.
- If the next item is blocked (needs payment account, Episode 2 facts the owner has not confirmed), stop and write the blocker in STATUS. Do not invent a different project.
- Do not skip an authored night to start a later one. Rules-check the last live night, then write the next. Chris will circle back.

