# One-Shot Forge Development Rules

## Product
One-Shot Forge is an original fantasy RPG one-shot builder and web GM runner. Do not use protected logos, copied trade dress, or protected setting/adventure text.

## Architecture
1. The Adventure Package is authoritative.
2. Builder and Runner use the same schema.
3. Adventure truth is immutable during play unless the GM explicitly edits it.
4. Game state is separate, mutable, and resettable.
5. AI may improvise wording and local presentation, never canonical facts.
6. Required revelations need redundant delivery paths.
7. Recovery preserves continuity, not a forced script.
8. Scenes form a graph and may be skipped/bypassed.
9. New adventures should require data/content, not new application code.
10. Keep V1 focused on GM adventure running; do not accidentally build a full VTT or universal combat engine.

## Development
- Prefer small modules and explicit data contracts.
- Validate package data at boundaries.
- Fail clearly on malformed or unsupported adventure packages.
- Never silently invent missing canonical data.
- Keep original package data separate from runtime state.
- Add tests for schema changes and state transitions.
- Before adding a field, decide whether it belongs to immutable truth, mutable state, or presentation.
