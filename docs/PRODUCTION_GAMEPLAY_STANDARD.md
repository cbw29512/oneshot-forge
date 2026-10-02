# Production Gameplay Standard

**Status: release gate for the public One-Shot Forge gameplay experience**

This standard governs whether an adventure is easy enough to discover, understand, run, resume, and print without the GM reverse-engineering the site.

Commercial release is a separate gate. Passing this document does not enable checkout or mark a product sellable.

## 1. Catalog

Every live adventure must expose:
- a one-sentence play premise;
- level;
- supported party size;
- expected play time;
- a useful play-style tag;
- a direct **Run now** path;
- a separate details/print-options path;
- truthful access/release status.

If browser progress exists, the direct action should become **Resume game** when practical.

## 2. Adventure landing page

A first-time GM must be able to answer within one screen:
- What is this adventure about?
- What level and party size is it for?
- How long will it take?
- What makes its play pattern distinct?
- Where do I start the live runner?
- Where do I print the module/materials?

The page must not imply purchase availability before the commercial gate is actually ready.

## 3. Live GM runner

The runner is the primary product surface.

The current screen must make these items visually obvious:
1. current stage and overall progress;
2. time pressure or absence of a hard clock;
3. current scene objective;
4. player read-aloud;
5. ordered DM run steps;
6. exact checks, encounter numbers, hazards, and puzzle solution when relevant;
7. NPC voice/dialogue/reactions when relevant;
8. the condition that ends the stage;
9. legal next scene choice(s).

Secondary reference material must not compete with the active stage.

Run progress must persist per adventure. Reset must require deliberate user action.

## 4. Readability

GM-facing gameplay text is a release-critical accessibility surface.

Required:
- no dark-on-dark or light-on-light reading panels;
- critical GM surfaces meet the repository's enhanced contrast gate;
- body text is comfortably readable at normal desktop zoom;
- dense dialogue receives adequate line-height and spacing;
- buttons are large enough for touch;
- focus states remain visible;
- layouts remain usable on narrow screens without horizontal navigation overflow.

## 5. Printable / long-form module

The module must be runnable offline, not just archival prose.

Every scene must include:
- objective;
- location and useful location description;
- ordered run steps;
- move-on condition;
- read-aloud;
- GM guidance;
- encounter objective/resolution/bypass when relevant.

Important NPCs must include ready-to-speak dialogue and reaction guidance.

## 6. Maps, cards, and print center

The print center must keep the selected adventure in context.

Available materials must be reachable without reconstructing URLs:
- pregens where the adventure actually supplies compatible pregens;
- full module;
- maps/handouts when supplied;
- cards when supplied.

Unavailable materials must be labeled unavailable rather than linking to empty output.

## 7. Production validation

A gameplay-facing release candidate is not production-ready until:
- authored adventure validation passes;
- zero-prep stage validation passes;
- table-readiness passes;
- required clue delivery passes;
- spoken presentation passes;
- catalog zero-prep baseline passes;
- adventure registry passes;
- runner readability passes;
- production gameplay UI passes;
- site smoke passes;
- the exact PR head is green;
- the merged commit's GitHub Pages deployment succeeds.

Do not weaken a validator to make a release pass. Repair the product.

## 8. Definition of "production ready"

For One-Shot Forge, **production ready** means:

> A GM unfamiliar with the adventure can pick it from the catalog, start or resume it, run the session from the active stage card, recover from player deviation, and print what they need without developer knowledge.

It does **not** mean the commercial checkout gate has been approved.
