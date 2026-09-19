# One-Shot Forge Architecture

## 1. Architectural rule

**The adventure package is authoritative.**

The generator, web runner, AI dialogue layer, printable outputs, and future player view all consume the same structured adventure data.

No feature may require hidden story logic that exists only in UI code or an AI prompt.

## 2. Runtime layers

```text
ADVENTURE TRUTH
  Immutable facts authored/generated before play
        |
        v
GAME STATE
  Mutable facts caused by play
        |
        v
AI / GM ASSISTANCE
  Dialogue, narration, suggestions, recovery
```

### Adventure Truth

Includes:
- premise and objective
- NPC identities, motivations, knowledge, secrets, lies, relationships
- locations and connections
- clues and revelations
- encounters
- traps and puzzles
- antagonist plan
- items and rewards
- success/failure conditions
- pacing data
- recovery routes

AI may not change these facts unless the GM explicitly edits the adventure.

### Game State

Includes:
- current scene/location
- discovered clues
- revealed secrets
- NPC status and attitudes
- defeated/captured/allied enemies
- opened/locked locations
- obtained/lost/destroyed items
- triggered events
- elapsed pacing/time markers
- quest stage

Every new run starts from a fresh initial state.

### AI / GM Assistance

AI may:
- speak as an NPC within that NPC's knowledge
- phrase descriptions
- propose consequences that obey adventure truth
- choose among authored recovery routes
- suggest a new local bridge when players go somewhere unexpected
- summarize current state for the GM

AI may not:
- invent quest-critical facts
- reveal locked secrets early
- grant knowledge an NPC does not possess
- resurrect destroyed facts/items/NPCs
- silently rewrite a player's successful solution
- move required clues without recording the move in game state

## 3. Authority hierarchy

When AI behavior is used, conflicts resolve in this order:

1. Rules/system constraints selected for the adventure
2. Adventure truth
3. Current game state
4. NPC-specific knowledge and permissions
5. Player actions and established consequences
6. AI improvisation

Lower levels never override higher levels.

## 4. Adventure package

Canonical extension for now:

`*.oneshot.json`

Top-level shape:

```json
{
  "schemaVersion": "0.1.0",
  "metadata": {},
  "setup": {},
  "truth": {},
  "quest": {},
  "npcs": [],
  "locations": [],
  "scenes": [],
  "clues": [],
  "encounters": [],
  "puzzles": [],
  "traps": [],
  "items": [],
  "maps": [],
  "events": [],
  "recovery": {},
  "pacing": {},
  "endings": [],
  "initialState": {}
}
```

## 5. Required clue design

A required revelation must never depend on one fragile delivery point.

Each required clue records:
- revelation ID
- normal delivery source
- backup delivery sources
- prerequisites
- whether it may move
- whether discovering it early is allowed

Example:

```json
{
  "id": "clue-monastery-location",
  "revelation": "The cult fled to Blackstone Monastery.",
  "required": true,
  "sources": [
    "npc-mayor-dialogue",
    "mayor-study-map",
    "captured-cultist",
    "wagon-tracks"
  ]
}
```

## 6. NPC contract

Every important NPC must define:

- public identity
- personality/voice cues
- wants
- fears
- knows
- believes
- secrets
- lies
- cannotKnow
- reveal conditions
- persuasion boundaries
- relationship state
- quest function

Dialogue generation receives the NPC contract plus current state. It does not receive permission to rewrite truth.\n\n### Reusable NPC identities\n\nNPC identity and adventure role are deliberately separate concepts. IDs inside an adventure package are local to that package. A recurring NPC name, portrait, or reusable identity may appear in many adventures, while each adventure independently defines that NPC's role, knowledge, motives, secrets, relationships, and allegiance. The runner must never infer an NPC's current role from another adventure.

## 7. Off-script recovery

Recovery protects continuity, not a predetermined route.

Examples:
- Quest giver killed -> required information becomes available through an authored backup source.
- Players refuse the job -> world consequence may expose the same conflict, if authored.
- Clue missed -> alternate clue source remains available.
- Important enemy captured -> interrogation exposes only facts the NPC knows.
- Players guess twist early -> accept the correct deduction; do not replace the twist.
- Players devise a valid bypass -> mark bypassed content and advance state.
- Players travel somewhere unplanned -> improvise local presentation while preserving canonical facts and unresolved goals.

The application should show the GM **why** a recovery suggestion is valid and what state changes it would make before applying it.

## 8. Scene model

Scenes are graph nodes, not mandatory linear chapters.

Each scene has:
- entry conditions
- exits
- purpose
- read-aloud
- GM notes
- NPCs
- encounter/puzzle/trap references
- clues available
- map/location reference
- core/optional/cut-first pacing classification

This lets the same adventure support branching routes while maintaining a clear GM flow.

## 9. Map model

Maps are references to visual assets plus semantic regions.

A region can reference:
- location
- scene
- encounter
- secret/reveal condition
- player visibility

This lets the runner use one map as both a GM navigation surface and, later, a player-facing reveal surface.

## 10. Product boundary

Version 1 is a **Game Master tool**, not a full virtual tabletop.

V1 should:
- build/load adventures
- navigate scenes
- display maps
- track adventure state
- provide NPC reference/dialogue context
- provide recovery suggestions
- expose encounters/puzzles/traps/items quickly

V1 does not need:
- tactical token movement
- voice chat
- character sheet automation
- full combat engine
- rules adjudication for every RPG action

Those can integrate later without becoming prerequisites for running a one-shot.
