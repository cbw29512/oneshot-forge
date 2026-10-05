# ONE-SHOT FORGE CONSTITUTION

**Status: LOCKED PROJECT CONTRACT**

This file defines the product identity, architecture, generation rules, AI boundaries, quality gates, and anti-drift rules for One-Shot Forge.

Every human, agent, automation, worker, or future coding session MUST read this file before changing generator behavior, adventure structure, AI prompts, validation, or production workflow.

If another document conflicts with this file, **this file wins** unless the owner explicitly changes this constitution.

---

## 1. Product identity

One-Shot Forge is a **one-shot production engine and farm**.

Its job is to produce many distinct, runnable, high-quality fantasy RPG one-shots from compatible randomized structural modules, then optionally use AI to turn those structures into polished table-ready prose.

The core principle is:

> **The Forge builds the bones. AI puts flesh on them.**

The product is NOT:
- an AI that improvises entire adventures from a blank prompt;
- a prose generator with mechanics added afterward;
- a collection of unrelated random tables with no compatibility logic;
- a single fixed five-room plot copied repeatedly;
- a boss-fight generator;
- a quantity-at-any-cost content mill.

The product IS:
- built around one clear, memorable theme per adventure;
- deterministic where mechanics and story truth matter;
- randomized where variety is useful;
- compatibility-gated so random pieces make sense together;
- auditable;
- reproducible from seeds;
- capable of mass production without lowering the release quality bar.

---

## 2. Authority order

When instructions conflict, use this order:

1. **Owner's explicit current instruction**
2. **docs/FORGE_CONSTITUTION.md**
3. **schema/forge-bones.schema.json**
4. **docs/FORGE_ENGINE.md**
5. **docs/QUALITY.md**
6. **docs/ONESHOT_RECIPE.md**
7. **docs/WORKERS.md**
8. **docs/STATUS.md**
9. Existing implementation details

No worker may silently reinterpret a higher-level rule to fit lower-level code.

If code conflicts with this constitution, the code is wrong.

---

## 3. Two production lanes

One-Shot Forge has two separate lanes.

### A. Curated authored lane

Hand-authored adventures such as existing catalog adventures may continue to exist.

Rules:
- quality over cadence;
- manual author/auditor workflow may remain;
- curated adventures can serve as approved reference examples;
- curated adventures do not define the only legal adventure shape.

### B. Forge Farm lane

The Forge Farm creates candidate adventures from randomized compatible modules.

Rules:
- there is **no fixed daily quantity target**;
- generation can happen in batches;
- candidates are cheap; releases are expensive;
- failed candidates are discarded or repaired;
- only candidates that pass all required gates may become release-ready;
- mass generation MUST NOT bypass validation.

The farm optimizes for:
1. diversity,
2. thematic identity,
3. coherence,
4. table usability,
5. mechanical legality,
6. release quality.

Not raw count.

---

## 4. Canonical adventure spine

Before scene selection, every Forge Farm adventure MUST have a **theme spine**: one short, concrete statement of what makes this night distinct. The selected hook, location, NPC motives, obstacles, clues, puzzle, pressure, twist, finale, and aftermath should reinforce or deliberately reframe that same theme. Compatibility is not enough; unrelated-but-compatible pieces still fail if they make the adventure feel assembled instead of authored.

Every Forge Farm adventure MUST resolve these structural jobs.

The exact number of scenes may vary, but these jobs must be represented.

1. **Preview / Starting Situation**
   - Where are the characters?
   - Where are they going?
   - Why are they moving or present?

2. **Hook / Quest**
   - What are they being asked or forced to do?
   - Examples: find, recover, kill/stop, rescue, escort, protect, investigate, deliver, break a curse, survive, negotiate.

3. **Quest Giver / Quest Source**
   - A person, faction, creature, spirit, object, message, event, or circumstance provides the objective.

4. **Red Herring / Twist / Hidden Truth**
   - Apparent truth and actual truth are separate fields.
   - A twist must change interpretation, choices, stakes, or alliances.
   - A twist must not exist only for surprise.

5. **Trap and/or Puzzle**
   - At least one structured obstacle.
   - Failure MUST move play forward.
   - A bad roll cannot permanently stop the adventure.

6. **Travel to the Main Location**
   - Travel must establish distance, environment, pressure, tone, or cost.
   - Travel may be short but cannot be logically skipped if the destination is remote.

7. **Progress Through the Main Location**
   - Usually 2–4 meaningful internal beats.
   - Beats must have different jobs: obstacle, clue, choice, resource pressure, social interaction, discovery, hazard, shortcut, etc.
   - Do not fill locations with rooms that exist only to consume time.

8. **Finale**
   - The finale may be a monster, NPC, artifact, ritual, environmental crisis, faction conflict, escape, moral decision, or mixed problem.
   - A BBEG is OPTIONAL.
   - Combat is OPTIONAL unless the bones explicitly make violence unavoidable.
   - Whenever fiction permits, a noncombat resolution MUST exist.

9. **Aftermath**
   - Return to quest giver, continue the journey, choose a new destination, keep or surrender an object, face consequences, or intentionally leave the outcome unresolved.
   - The original hook must be acknowledged in the aftermath.

10. **Two Random Encounters**
   - Exactly two are generated for the default farm contract.
   - They do not have to be combat.
   - They do not have to relate to the central quest.
   - They must occur at legal insertion points and must not invalidate required adventure information.

---

## 5. ForgeBones is authoritative

**ForgeBones owns reality.**

The deterministic structural engine owns:
- origin;
- destination;
- quest type;
- quest objective;
- quest target;
- quest source / giver role;
- giver motive;
- apparent truth;
- actual truth;
- red herring;
- twist;
- required facts;
- required clues;
- clue redundancy;
- trap mechanics;
- puzzle mechanics;
- DCs;
- fail-forward behavior;
- travel environment;
- travel pressure;
- main-location topology;
- scene order;
- legal exits;
- state transitions;
- random encounter slots;
- random encounter type;
- encounter mechanics;
- rewards;
- timers / clocks;
- finale type;
- finale objective;
- legal noncombat solution;
- failure consequence;
- aftermath mode;
- persistent consequences.

AI does not own any of these.

If generated prose conflicts with ForgeBones, **ForgeBones wins and the prose is rejected**.

---

## 6. AI role: flesh only

AI may improve presentation after valid bones exist.

AI MAY create:
- NPC names when names are not mechanically significant;
- short NPC dialogue;
- speech mannerisms;
- sensory description;
- location atmosphere;
- 2–4 sentence read-aloud;
- connective prose;
- optional cosmetic details;
- visual details that do not imply new mechanics;
- concise GM-facing phrasing.

AI SHALL NOT:
- invent a new required scene;
- remove a required scene;
- change scene order;
- change scene exits;
- change a DC;
- change AC, HP, damage, attacks, saves, conditions, recharge, uses, spell slots, or XP;
- change a timer or deadline;
- add a required clue;
- remove a required clue;
- add a secret that changes the adventure truth;
- change who is lying;
- change the quest giver's motive;
- change the antagonist's motive;
- change the actual truth;
- change the twist;
- change allegiance;
- change a reward;
- create a mandatory fight where the bones allow negotiation;
- turn an artifact/ritual/environmental finale into a monster fight;
- resolve a moral choice for the players;
- import plot material from a reference adventure;
- quote or closely imitate reference text.

Any AI output that violates these rules is invalid.

---

## 7. Reference-adventure policy

Approved reference adventures exist to teach **quality, density, usability, and presentation**.

They are NOT source material for plots.

The AI may learn abstract presentation traits such as:
- how quickly the premise is communicated;
- how much description is useful;
- how to keep room/scene text concise;
- where DCs and concrete numbers appear;
- how to present encounter goals;
- how to make theme visible throughout a one-shot;
- how to end cleanly;
- how to give the GM immediately usable information.

The AI MUST NOT copy or remix:
- plot;
- characters;
- proper names;
- dialogue;
- locations;
- maps;
- unique monsters;
- unique magic items;
- puzzle wording;
- encounter sequences;
- distinctive story elements;
- trade dress;
- prose.

### Reference #1 — The Wishing Cake

Approved lesson set only:
- premise is established immediately;
- the inciting incident moves directly into play;
- rooms have concrete dimensions and game-facing checks;
- the adventure keeps a strong theme across obstacles, creatures, puzzle, treasure, and finale;
- encounters are simple to understand at the table;
- the puzzle has an explicit solution;
- the finale reconnects to the original objective;
- the ending leaves a meaningful player choice.

These are abstract craft lessons only.

No Forge output may reproduce its birthday-cake theft plot, named characters, distinctive creatures, puzzle sequence, item text, room sequence, dialogue, or wording.

### Reference #2 — 100 Rounds

Approved lesson set only:
- a visible countdown can define the entire adventure's urgency;
- the clock should create changing room states and consequences, not just display a number;
- time pressure can coexist with player route choice;
- major clock thresholds should trigger concrete world changes;
- maps can function as decision spaces instead of a linear room list;
- encounter rooms should have tactical identities, environmental interaction, and bypasses where appropriate;
- rewards and consequences can be tied directly to who or what the party saves;
- a short final encounter can provide a strong finish after resource attrition;
- the DM should be told how to preserve tension without forcing slow initiative procedure outside combat.

These are abstract craft lessons only.

No Forge output may reproduce its city-hall siege plot, named characters, room layout, goblin encounter sequence, countdown events, dialogue, map, or wording.

### Reference #3 — The Drowned Reliquary

Approved lesson set only:
- begin with an at-a-glance page that states party assumptions, objective, pressure, and full adventure flow;
- show expected table time and per-section pacing targets;
- make the clock visible and define exactly what actions consume time;
- failed checks should cost time, damage, position, or complications rather than stop progress;
- random events should create motion, pressure, information, resources, or complications and should not default to fights;
- late-adventure random events should yield to the finale rather than distract from it;
- reveal tactical maps as the party reaches them while keeping the full keyed overview for the GM;
- scene pages should state the scene's job before prose;
- important NPCs benefit from compact fields for role, demeanor, wants, fears, hidden information, and voice;
- anticipated player questions and concise prepared answers improve zero-prep usability;
- provide explicit cut guidance when table time is running long.

These are abstract craft lessons only.

No Forge output may reproduce its Sunstone/Tideborn plot, named characters, temple layout, tide-event sequence, custom creatures, dialogue, map, room sequence, or wording.

### Reference #4 — The Night Land

Approved lesson set only:
- establish expected runtime and divide a longer one-shot into clearly timed parts;
- a hub can present several distinct quest options without making the GM search for the hooks;
- each quest or part should advertise its job in one sentence before detailed text;
- NPC presentation is stronger when personality information is compressed into motivation, mannerism, and a representative voice cue;
- boxed text should be separated from adjudication and checks;
- scene difficulty can include explicit adjustment guidance for weaker or stronger parties;
- setting transitions deserve a concise, sensory arrival scene so travel changes the feel of play;
- handouts can externalize player choices instead of burying them in GM prose;
- optional player-created relationships can make a generic opening feel personal without changing the adventure's mechanics;
- multiple jobs/branches can share a hub while remaining independently runnable.

These are abstract craft lessons only.

The Night Land is an official copyrighted D&D/Eberron adventure. No Forge output may reproduce its setting-specific lore, factions, proper names, locations, quest plots, handouts, dialogue, encounters, monsters, maps, campaign structure, trade dress, or wording.

### Adding future references

A new reference may be added only after:
1. owner approval;
2. identifying abstract lessons;
3. recording explicit no-copy boundaries;
4. confirming the reference does not become a mandatory plot template.

Never tell AI to "make an adventure like [reference title]."

Tell AI to follow the Forge's style and usability contract while obeying the generated bones.

---

## 8. Compatibility system

Random does not mean arbitrary.

Every module should support:
- `tags`
- `requires`
- `forbids`
- `provides`

The composer MUST reject combinations that violate requirements.

Examples:
- a "target left willingly" twist requires a target capable of choosing;
- a flood-control puzzle requires water or a plausible hydraulic mechanism;
- blackmail requires an intelligent social actor;
- an animal protecting young requires an animal/monster ecology where offspring make sense;
- a destroyed-object finale cannot require delivering the same intact object afterward.

Compatibility is evaluated before prose generation.

AI must never be used to hand-wave an incompatible combination into seeming coherent.

---

## 9. Locks and rerolls

Every major Forge field must eventually support:
- reroll;
- lock;
- unlock.

Required lockable fields:
- origin;
- destination;
- quest;
- giver;
- twist;
- obstacle;
- travel;
- finale;
- aftermath;
- random encounter 1;
- random encounter 2.

A locked value MUST survive:
- full rerolls;
- partial rerolls;
- AI flesh generation;
- package compilation.

Same seed + same settings + same locks MUST reproduce identical bones.

---

## 10. Scene contract

Every required scene must be runnable without the GM inventing missing rules.

A scene should contain, when applicable:

- **Purpose**
- **Location**
- **Situation**
- **Read Aloud** — 2–4 sentences
- **What is happening**
- **NPCs present**
- **What NPCs want**
- **Player-facing choices**
- **Checks / DCs**
- **Combat numbers**
- **Bypass**
- **Success**
- **Failure**
- **Fail Forward**
- **Clues / information**
- **Resources gained/lost**
- **State changes**
- **Exits / next legal scenes**
- **Cut guidance** if optional

The GM should not need another tab to understand a scene's essential mechanics.

---

## 11. Required clue rule

Every fact required to finish the adventure MUST have multiple delivery paths.

Target:
- three sources for every required fact;
- at least one physical/environmental source when practical.

Examples:
- NPC testimony;
- notes/records;
- tracks;
- damaged machinery;
- magical residue;
- visible ritual state;
- corpse/injury evidence;
- architectural evidence.

Killing, losing, ignoring, or distrusting one NPC must not brick the adventure.

Optional lore does not need three-source redundancy.

---

## 12. Failure must move

A failed roll must not convert the game into "nothing happens."

For required progression:
- failure costs time;
- attracts danger;
- spends resources;
- reveals partial information;
- opens a worse route;
- creates a complication;
- advances the clock;
- changes position.

But play continues.

Hard stops are forbidden unless the scene is explicitly an optional branch.

---

## 13. Random encounters

Default Forge contract: **exactly two**.

The pool should include:
- combat;
- social;
- hazard;
- discovery;
- merchant;
- wildlife;
- weird/supernatural;
- treasure/opportunity;
- moral dilemma;
- comic relief.

Rules:
- do not default both encounters to combat;
- unrelated encounters are desirable;
- unrelated does not mean tonally impossible;
- random encounters may provide optional resources or flavor;
- they may never carry the only copy of a required clue;
- skipping one must not break the one-shot.

---

## 14. Finale contract

A finale is a problem, not automatically a stat block.

Legal finale kinds:
- monster;
- NPC;
- artifact;
- ritual;
- environment;
- faction conflict;
- escape;
- moral decision;
- mixed.

Every finale MUST define:
- what is happening now;
- what happens if players do nothing;
- what the players can affect;
- at least two plausible approaches when fiction permits;
- noncombat resolution when fiction permits;
- failure consequence;
- aftermath consequence.

A creature with high HP and no other objective is not sufficient.

---

## 15. Mechanical integrity

Mechanics are generated or selected before AI prose.

Every candidate must verify:
- party level;
- party size;
- rules edition;
- encounter budget where applicable;
- legal DC range;
- legal creature/stat source or clearly original stat block;
- no mixed 2014/2024 character rules;
- no impossible references;
- no contradictory numbers;
- no missing encounter objective;
- no required combat without battle-space information;
- no hidden mechanical rule existing only in prose.

Numbers on the GM-facing scene/card are authoritative.

---

## 16. Copyright and source hygiene

Reference adventures may be copyrighted.

The Forge may learn **abstract craft principles** from them.

The Forge MUST NOT:
- copy text;
- paraphrase distinctive passages too closely;
- copy maps;
- copy proper names;
- copy unique NPCs;
- copy plot sequences;
- copy distinctive puzzles;
- copy unique monsters/items;
- reproduce trade dress.

Reference material is an evaluator/style corpus, not a content bank.

Generated adventures should be independently expressed and based on Forge-owned structural modules plus legally usable rules content.

---

## 17. Farm pipeline

Canonical pipeline:

```
SEED + SETTINGS + LOCKS
        |
        v
SELECT COMPATIBLE MODULES
        |
        v
FORGE BONES
        |
        v
BONES VALIDATION
        |
        v
COMPILE NORMAL ADVENTURE PACKAGE
        |
        v
AI FLESH
        |
        v
IMMUTABILITY CHECK
        |
        v
TABLE-READINESS AUDIT
        |
        v
DIVERSITY / DUPLICATION AUDIT
        |
        v
MECHANICAL AUDIT
        |
        v
RELEASE CANDIDATE
```

No stage may be skipped merely to increase output.

---

## 18. Candidate vs release

Generated does not mean publishable.

Candidate states:
- `generated`
- `bones-valid`
- `fleshed`
- `audited`
- `release-ready`
- `rejected`

Only `release-ready` adventures may enter a public catalog.

A failed candidate should usually be regenerated or locally repaired instead of lowering the gate.

---

## 19. Automatic rejection conditions

Reject a candidate if any of these are true:

- incompatible modules;
- missing quest objective;
- twist contradicts quest state;
- finale cannot logically follow the adventure;
- required clue has only one fragile source;
- failed puzzle can permanently stop play;
- two required random encounters are missing;
- both random encounters are functionally duplicates without intent;
- AI changed authoritative bones;
- NPC knows information they cannot know;
- mechanics disagree across sections;
- location graph is impossible;
- scene exit references missing scene;
- reward depends on impossible state;
- combat lacks enough information to run;
- prose introduces a new required mechanic;
- finale is only a bag of HP;
- no clear one-sentence theme spine can be identified;
- major required scenes feel thematically interchangeable with unrelated adventures;
- a twist abandons the original premise instead of deepening or reframing it;
- adventure is substantially derivative of a reference work;
- output contains copied reference wording;
- runtime is badly over/under target without cut/add guidance.

---

## 20. Diversity protection

Mass generation creates repetition risk.

The farm must track or test:
- repeated titles;
- repeated quest + twist + finale combinations;
- repeated NPC-role clusters;
- repeated location sequences;
- repeated read-aloud phrases;
- repeated encounter pairings;
- repeated puzzles;
- repeated ending structures;
- repeated theme spines;
- adventures where the theme appears only in names or flavor text while mechanics remain generic.

Different names pasted onto the same adventure do not count as diversity. Different mechanics pasted under the same generic fantasy skin do not count either.

The long-term goal is **combinatorial diversity with coherent state**, not cosmetic reskinning.

---

## 21. Quality threshold

A release-ready one-shot must be:
- explainable in one memorable sentence;
- thematically coherent from hook through aftermath;
- understandable quickly;
- runnable with minimal prep;
- coherent from hook to aftermath;
- mechanically complete;
- specific enough to feel authored;
- flexible enough to survive player choices;
- concise enough to use during play;
- distinct from recent releases;
- free of copied reference expression.

If a candidate is mediocre, reject it.

Do not publish it because the farm needs a number.

---

## 22. Anti-drift startup checklist

Before changing Forge code, prompts, schemas, modules, or workers:

1. Read this constitution.
2. Read `docs/STATUS.md`.
3. Read `docs/FORGE_ENGINE.md`.
4. Read `docs/QUALITY.md`.
5. Identify whether work is **Curated Lane** or **Forge Farm Lane**.
6. State which authoritative data structure is being changed.
7. Preserve deterministic bones.
8. Preserve AI immutability.
9. Add/update tests for new behavior.
10. Do not weaken gates to make CI pass.

If any step is skipped, stop and correct the process.

---

## 23. Change-control rule

The following are **constitutional changes** and require explicit owner approval:

- changing the bones-first architecture;
- allowing AI to own mechanics or story truth;
- removing the two-random-encounter default;
- making BBEG combat mandatory;
- removing fail-forward;
- removing compatibility gating;
- allowing reference plots/text to be reused;
- removing deterministic seed reproduction;
- weakening release gates;
- merging curated and farm workflows into one uncontrolled process.

A worker may propose these changes.

A worker may NOT silently implement them.

---

## 24. Definition of Done — Forge Farm v1

Forge Farm v1 is complete when:

- ForgeBones compiles directly into the normal Adventure Package;
- every major structural field can reroll independently;
- every major structural field can lock;
- compatibility rules reject nonsense combinations;
- exactly two random encounters are generated by default;
- finale type is not assumed to be combat;
- AI flesh consumes bones without mutating them;
- AI mutation is automatically detected;
- reference adventures affect style only;
- candidate adventures pass automated structural and mechanical audits;
- duplicate/near-duplicate candidates are flagged;
- the normal runner can run a forged adventure without special-case logic;
- a batch process can generate many candidates and surface only passing ones.

Until all items above are true, the farm is under construction.

---

## 25. Final rule

When uncertain, preserve this separation:

> **Forge = truth, structure, mechanics, consequences.**
>
> **AI = voice, description, dialogue, presentation.**
>
> **Validator = permission to ship.**

Do not blur these responsibilities.
