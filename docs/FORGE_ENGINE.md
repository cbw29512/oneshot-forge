# Forge Engine: bones first, AI flesh second

## Definition of Done

A generated one-shot is valid when the deterministic Forge can produce the full adventure structure without AI, reproduce it from the same seed, preserve locked choices, provide exactly two random encounters, and define a legal finale and aftermath. AI may then improve presentation without changing facts or mechanics.

## Data ownership

### ForgeBones is authoritative
The Forge owns:
- starting place and destination;
- quest type and objective;
- quest giver role;
- apparent truth and actual truth;
- red herring / twist;
- trap or puzzle mechanics;
- travel environment;
- internal location progression;
- finale type, objective, legal noncombat path, and failure state;
- exactly two random encounters;
- aftermath;
- DCs, damage, conditions, rewards, clues, state transitions, and scene order.

### AI flesh is non-authoritative
AI may write:
- NPC dialogue;
- voice flavor;
- read-aloud text;
- sensory location descriptions;
- short transitions;
- optional cosmetic names/titles when a bone field explicitly allows it.

AI may not:
- add/remove scenes;
- change a DC, AC, HP, attack, damage, reward, timer, or condition;
- add a required clue or secret;
- change quest truth, twist, allegiance, motive, finale type, or outcome;
- convert a noncombat solution into a mandatory fight;
- alter scene exits or state transitions.

## Required adventure spine

1. Preview: where the party is and where it is going.
2. Hook: what the quest is.
3. Quest giver.
4. Red herring / plot twist.
5. Trap and/or puzzle.
6. Travel to the quest location.
7. Progress through the location.
8. Finale: monster, NPC, artifact, ritual, environment, or mixed; combat is optional unless the bones explicitly say otherwise.
9. Aftermath: return to the giver or continue with life.
10. Two random encounters inserted at legal slots. They may be unrelated to the quest.

## State flow

```
seed + locks
  -> choose compatible modules
  -> ForgeBones
  -> validate bones
  -> compile Adventure Package
  -> optional AI flesh request
  -> validate AI patch against immutable bones
  -> render in normal GM runner
```

The runner must never need to know whether a package was authored by hand, forged randomly, or fleshed out by AI.

## Compatibility

Every random module should eventually expose:
- `tags`
- `requires`
- `forbids`
- `provides`

The composer selects only modules whose requirements are satisfied by current adventure state. This is how the Forge scales to millions of combinations without producing nonsense.

## Locks

Any preview field may be locked before reroll:
- origin
- destination
- quest
- giver
- twist
- obstacle
- travel
- finale
- aftermath
- random encounter 1
- random encounter 2

Locked values are part of the seed input contract and must survive every reroll until unlocked.
