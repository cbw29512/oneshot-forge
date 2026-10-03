# From Zero to Hero — RAW & Development Audit

**Audit date:** 2026-10-02  
**Scope:** Level-0 development, pass/fail differentiation, 2014/2024 graduation boundary.

## Executive result

From Zero to Hero is intentionally a **Level-0 house-rule origin system**. The finished Level-1 character then uses the selected 2014 or 2024 ruleset for race/species, background, class, HP, proficiency, spells, feats, equipment, and later advancement.

The ability-generation route itself is not RAW. The site therefore audits and labels the final base array instead of pretending otherwise.

## Starting math

The normal 5E point-buy table values a score of 9 at 1 point.

Six starting 9s therefore represent a value of 6.

The campaign has 21 base Development Opportunities. If each produces one normal development point and no critical-success bonus is spent, the character can reach the normal 27-point target:

**6 starting value + 21 development = 27.**

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

## Critical success

A critical success earns one extra flexible point beyond the ordinary success point.

There is no artificial critical-bonus cap in the current design. Natural d20 frequency supplies the practical limiter.

If critical-success bonus points are spent so the final base ability array has a point-buy value above 27, the website must label it:

**Heroic / house-rule ability generation**

It may not be presented as standard RAW point buy.

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

If the base array is 27 point-buy value or lower and every score is 15 or lower, it is **within the normal point-buy envelope**, although the route used to generate it was still the Level-0 house rule.

If the base array exceeds 27, label it **Heroic / house-rule ability generation**.

Once the array is frozen, all later mechanics must be legal for the selected 2014 or 2024 ruleset.

## Release invariants

CI must reject any implementation that:
- changes the six starting 9s;
- removes the 15 pre-origin cap;
- changes the 21 base growth opportunities;
- awards success anything other than +1 flexible point;
- awards failure anything other than +1 off-path Lesson Point;
- awards critical success anything other than +2 flexible points total;
- lets critical failure redirect more than one already-invested point;
- permits a Lesson Point to be assigned to the attempted ability;
- silently converts familiarity into proficiency;
- mixes 2014 and 2024 graduation mechanics;
- claims an above-27 base array is normal RAW point buy.

**Audit conclusion:** pass/fail now has a meaningful mechanical identity without making ordinary failure erase character growth. Critical failure can reshape the build; critical success can make it slightly stronger. The resulting Level-0 ability-generation method remains transparently house rule, while the post-graduation game stays edition-locked.
