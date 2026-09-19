# One-Shot Forge Roadmap

## Phase 1 — Prove the format
- [x] Define product boundary.
- [x] Define initial Adventure Package schema.
- [x] Create one complete reference adventure package.
- [ ] Validate required-clue redundancy.
- [ ] Validate NPC knowledge boundaries.
- [ ] Validate fresh initial game state.
- [ ] Define asset manifest for maps/portraits/handouts.

## Phase 2 — GM Runner
- [x] Load a local `*.oneshot.json` package.
- [x] Adventure overview.
- [x] Scene navigation.
- [x] Read-aloud and GM notes.
- [x] NPC panel.
- [x] Clue discovery tracking.
- [x] Quest-stage tracking.
- [x] Map display and reveal state.
- [ ] Encounter/puzzle/trap/item panels.
- [x] Save/restore local run state.
- [x] Reset adventure to fresh state.

## Phase 3 — Recovery system
- [ ] Detect unresolved required revelations.
- [x] Show authored backup clue sources.
- [x] Apply recovery state changes only after GM approval.
- [ ] Support killed/missing quest giver.
- [ ] Support skipped scene.
- [ ] Support captured/befriended enemy.
- [ ] Support early twist discovery.
- [ ] Support destroyed/lost quest item.
- [ ] Support unplanned travel without inventing canonical facts.

## Phase 4 — NPC AI contract
- [ ] Build NPC context packet from adventure truth + game state.
- [ ] Enforce knows/believes/secrets/cannotKnow.
- [ ] Enforce reveal conditions.
- [ ] Keep speculation distinct from known facts.
- [ ] Never let generated dialogue mutate canonical adventure truth.
- [ ] Log proposed state changes separately from dialogue.

## Phase 5 — Builder
- [ ] Inputs: level, party size, duration, tone, quest type, location type, difficulty.
- [ ] Generate adventure DNA.
- [ ] Lock/reroll every module independently.
- [ ] Build a coherent scene graph.
- [ ] Generate clue redundancy.
- [ ] Generate recovery routes.
- [ ] Generate NPC contracts.
- [ ] Generate pacing classification.
- [ ] Edit before publish.
- [ ] Export Adventure Package.

## Phase 6 — Maps and art
- [ ] Location topology generated from scene graph.
- [ ] Map asset generation pipeline.
- [ ] Semantic room/region IDs.
- [ ] NPC portrait asset pipeline.
- [ ] Handout/item asset support.
- [ ] GM vs player visibility.

## Phase 7 — Library / publish
- [ ] Adventure library.
- [ ] Publish generated adventure into library.
- [ ] Version packages.
- [ ] Import/export packages.
- [ ] Open adventure directly in Run mode.
- [ ] Future player-screen sharing.

## Definition of done for V1

A GM can create or import one complete adventure, open it in a browser, run every scene, view NPCs and maps, track clues and quest state, recover when players depart from the expected route, and finish the adventure without needing a separate PDF or hidden prompt file.
