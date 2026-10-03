# From Zero to Hero — RAW & Development Audit

**Audit date:** 2026-10-02  
**Scope:** Level-0 development, pass/fail differentiation, 2014/2024 graduation boundary.

## Executive result

From Zero to Hero is intentionally a **Level-0 house-rule origin system**. The finished Level-1 character then uses the selected 2014 or 2024 ruleset for race/species, background, class, HP, proficiency, spells, feats, equipment, and later advancement.

The ability-generation route itself is not RAW. The site therefore audits and labels the final base array instead of pretending otherwise.

## Starting math

The normal 5E point-buy table values a score of 9 at 1 point.

Six starting 9s therefore represent a value of 6.

The campaign has 21 base Development Opportunities. Each opportunity always contributes one baseline development point regardless of success or failure, so completing the campaign guarantees the normal 27-point floor before any critical-success bonus growth:

**6 starting value + 21 baseline development = 27 minimum.**

The Level-0 score cap remains 15 before edition-specific origin adjustments.

## Development wallet

Players accumulate growth instead of automatically assigning it to the ability rolled.

| Outcome | Development result |
| --- | --- |
| Critical success | +2 Flexible Development Points |
| Success | +1 Flexible Development Point |
| Failure | +1 Lesson Point locked to a different ability |
| Critical failure | +1 Lesson Point locked to a different ability, plus redirect 1 already-invested point from the attempted ability into that lesson ability when possible |

Flexible points may be spent on any ability below 15.

Lesson Points can only be spent on the ability attached to the lesson.

The player may spend accumulated points between growth scenes and before graduation.

## Why success and failure are mechanically different

A success says, in effect:

> I solved the problem and can decide where that confidence/practice becomes growth.

A failure says:

> I still learned, but the lesson may not be the one I wanted.

A critical failure is the strongest expression of that idea. It does not erase overall earned development. Instead, it can pull one already-invested point out of the ability used for the failed attempt and move that investment into the different ability taught by the consequence.

Example:

A future Fighter tries to overpower a dangerous mechanism with Strength and critically fails. The scene teaches caution and observation. One invested STR point can move to WIS, and the new Lesson Point is also locked to WIS.

The character did not become weaker overall; the experience changed the direction of development.

Even repeated critical failures cannot reduce the completed campaign below the 27-point baseline. Five critical failures can produce a noticeably different ability distribution, but the player still graduates with at least the full 27-point-buy-equivalent base array.

## Critical success

A critical success earns one extra flexible point beyond the ordinary success point.

There is no artificial critical-bonus cap in the current design. Natural d20 frequency supplies the practical limiter.

If critical-success bonus points are spent so the final base ability array has a point-buy value above 27, the website must label it:

**Heroic / house-rule ability generation**

It may not be presented as standard RAW point buy.

## Hard checks and Character Advantage

The Level-0 campaign intentionally keeps the base success chance low. Developmental DC floors are:
- ages 12–13: DC 15;
- ages 14–16: DC 16;
- ages 17–18: DC 17.

This keeps success uncommon even as ability scores improve.

The balancing lever is **Character Advantage**. A player earns Advantage by grounding the attempted action in established character history, a relationship, mentor lesson, familiarity, possession, prior consequence, a concrete scene feature, or a meaningful accepted risk/cost.

This reward is based on the fictional approach, not acting talent. Quiet or non-theatrical players qualify exactly the same way.

Character Advantage uses the normal two-d20, keep-the-higher procedure. It does not stack. The kept die is the natural result used by the Level-0 critical tier.

No roleplay Disadvantage exists. If the approach does not earn Advantage, the character simply makes the normal hard check.

Because Advantage also increases the chance that the kept die is a natural 20 and sharply reduces the chance that it is a natural 1, strong character-grounded play slightly biases both ordinary success and the critical-growth outcomes without changing the guaranteed 27-point floor.

## Upbringing Lean fairness audit

Upbringing Lean is a Level-0 probability house rule. It does not change the six starting 9s.

Every one of the twelve presets has exactly:
- 2 Favored abilities rolled with Advantage;
- 2 Neutral abilities rolled normally;
- 2 Challenging abilities rolled with Disadvantage.

This gives every preset the same **number** of favorable, neutral, and unfavorable lanes. The profiles differ only in *which* abilities receive those lanes.

At age 12 with ability 9 (-1) against DC 15:
- Neutral succeeds on 16–20: **25%**;
- Advantage succeeds about **43.75%**;
- Disadvantage succeeds about **6.25%**.

That is intentionally a strong upbringing signal before the ability scores themselves diverge.

Character Advantage interacts through normal advantage/disadvantage cancellation:
- Neutral + Character Advantage → Advantage;
- Challenging + Character Advantage → Normal;
- Favored + Character Advantage → still Advantage.

There is no double Advantage.

No acting penalty exists. Upbringing Disadvantage is fixed by the selected Level-0 profile; it is not imposed because a player was quiet, brief, or untheatrical.

The profile locks after the first resolved Growth Beat so a player cannot swap profiles between checks to chase favorable dice.

Upbringing Lean ends mechanically at Level 1. It remains scrapbook/history context only and cannot grant permanent Advantage, Disadvantage, proficiency, save proficiency, ASI, feat, spell, or class feature.

## D20 resolution boundary

The check itself still resolves using the normal 5E procedure:

**d20 + relevant modifiers vs DC.**

From Zero to Hero then applies its Level-0 development outcome.

The extra critical-success/critical-failure treatment is a Level-0 house rule and must not leak into ordinary Level-1+ ability checks.

## Training and proficiency

Practice with skills, weapons, tools, languages, magic, hunting, medicine, crafting, and similar activities is tracked as **familiarity/history**.

That familiarity is not automatically a 5E proficiency.

At Level 1 it becomes mechanical only if a legal option in the selected edition grants it:
- 2014 race/background/class;
- 2024 species/background/class.

Otherwise it remains part of the character's history.

## Graduation audit

Before generating Level 1, show:
- final base ability array;
- point-buy value of that array;
- unspent Flexible Points;
- unspent Lesson Points;
- partial invested development that has not yet completed a score increase;
- total critical-success bonus points earned.

Graduation is blocked below **27 point-buy value**.

Lesson Points remain locked to their tagged ability where they can still be spent. If a Lesson Point is blocked by the pre-origin cap, or invested progress is stranded below a two-point increase, **Maturity Settlement** may return only that already-earned stranded growth to the flexible wallet. It creates no new development.

At exactly 27, the character has the complete baseline development budget.

If the base array is 28–30 because critical-success bonus points were spent, label it **Heroic / house-rule ability generation**. The Level-0 array may never exceed 30. Extra Development Points earned after reaching that ceiling remain nonmechanical/unspent and cannot carry hidden power into Level 1.

Once the array is frozen, all later mechanics must be legal for the selected 2014 or 2024 ruleset.

## Release invariants

CI must reject any implementation that:
- changes the six starting 9s;
- removes the 15 pre-origin cap;
- changes the 21 base growth opportunities;
- lowers the age-band DC floors below 15 / 16 / 17;
- grants Character Advantage without a specific fiction-grounded reason;
- penalizes weak presentation or acting with Disadvantage;
- gives any Upbringing Lean more or fewer than 2 Favored / 2 Neutral / 2 Challenging abilities;
- lets Upbringing Lean alter the six starting 9s;
- allows the Upbringing Lean to be swapped after the first resolved Growth Beat;
- lets Upbringing Advantage/Disadvantage stack instead of cancel;
- carries Upbringing Lean mechanical Advantage/Disadvantage into Level 1;
- stacks Character Advantage beyond the normal two-d20 keep-high procedure;
- awards success anything other than +1 flexible point;
- awards failure anything other than +1 off-path Lesson Point;
- awards critical success anything other than +2 flexible points total;
- lets critical failure redirect more than one already-invested point;
- permits a Lesson Point to be assigned to the attempted ability;
- silently converts familiarity into proficiency;
- mixes 2014 and 2024 graduation mechanics;
- allows graduation below 27 after all 21 base opportunities;
- allows Maturity Settlement to create points that were not already earned;
- claims an above-27 base array is normal RAW point buy;
- permits any Level-0 base array above 30;
- converts Development Points remaining after the 30-point ceiling into hidden Level-1 mechanical power.

**Audit conclusion:** pass/fail has a meaningful mechanical identity without lowering the baseline character budget. Failure redirects growth; critical failure can reshape the build; critical success can make it slightly stronger. Completing the full origin campaign always guarantees at least a 27-point-buy-equivalent base array, with an absolute 30-point ceiling. The Level-0 ability-generation method remains transparently house rule, while the post-graduation game stays edition-locked.
