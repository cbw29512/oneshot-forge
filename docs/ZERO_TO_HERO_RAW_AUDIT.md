# From Zero to Hero — RAW & Development Audit

**Audit date:** 2026-10-02  
**Scope:** Level-0 development, 2014 graduation boundary, 2024 graduation boundary, pass/fail fairness.

## Executive result

From Zero to Hero is intentionally a **Level-0 house-rule campaign**. It cannot itself be called RAW because neither the 2014 nor 2024 core rules define this age-12-to-Level-1 growth procedure.

The release target is therefore:

> **House-rule journey, RAW destination.**

The moment a character graduates, the generated Level-1 sheet must be legal under the selected edition with no silent Level-0 bonuses.

## Authoritative rules checked

### 2014

D&D Basic Rules 2014 / SRD 5.1 point buy:
- 27 points;
- scores cost 0/1/2/3/4/5/7/9 for 8 through 15;
- 15 is the pre-racial maximum under point buy.

Official Basic Rules:
https://www.dndbeyond.com/sources/dnd/basic-rules-2014/step-by-step-characters

2014 ability checks resolve by d20 + modifier vs DC. A natural 1 is not an automatic failure on an ability check, and ability checks do not score critical hits.

Official Sage Advice Compendium:
https://www.dndbeyond.com/sources/sac/sage-advice-compendium

### 2024 / SRD 5.2.1

SRD 5.2.1 uses the same 27-point point-cost table for generated ability scores.

Official SRD 5.2.1 Character Creation:
https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf

2024 backgrounds provide the ability-score increases, an Origin feat, skill proficiencies, a tool proficiency, and equipment/GP choice. Species do not supply the normal 2024 background ASI.

Official 2024 Character Origins:
https://www.dndbeyond.com/sources/dnd/br-2024/character-origins

2024 D20 Tests resolve by total vs target number. Automatic natural-20 hit / natural-1 miss language applies to attack rolls, not all ability checks.

Official 2024 Playing the Game:
https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game

## Finding 1 — starting six 9s is mathematically compatible

Under point buy, a 9 costs 1 point.

Six starting 9s therefore represent 6 of the normal 27 points.

That leaves exactly:

**27 - 6 = 21**

development credits for the Level-0 campaign.

This is why the campaign uses seven yearly chapters with three growth opportunities each:

**7 × 3 = 21.**

The growth cost from 9 through 15 mirrors the official point-buy cost curve:
- 9→10: 1
- 10→11: 1
- 11→12: 1
- 12→13: 1
- 13→14: 2
- 14→15: 2

## Finding 2 — pass/fail must not change build power

Previous design already awarded one Development Point on any attempt, which was directionally correct.

The contract is now explicit:

| Outcome | Development Points | Permanent build delta |
| --- | ---: | ---: |
| Critical success | 1 | 0 |
| Success | 1 | 0 |
| Failure | 1 | 0 |
| Critical failure | 1 | 0 |

A check can change the fiction, but it cannot directly grant or remove:
- ability points;
- proficiency;
- feat;
- spell;
- class feature;
- permanent magic-item property;
- graduation eligibility.

This prevents lucky players from becoming mechanically stronger than unlucky players.

## Finding 3 — critical outcomes needed a RAW boundary correction

Normal 2014/2024 ability checks are total-vs-DC checks. Natural 20/1 do not generally auto-resolve an ability check.

From Zero to Hero therefore resolves the normal result first.

Only after that:
- successful total + natural 20 = **critical success story tier**;
- failed total + natural 1 = **critical failure story tier**.

The extra critical tier is still a Level-0 house rule, but it no longer replaces normal 5E success/failure resolution.

## Finding 4 — incomplete high-score marks could create unequal graduates

Because 13→14 and 14→15 cost two credits, some perfectly valid development patterns can end age 18 with incomplete marks.

Those characters would otherwise finish below the full 27-point budget even though they completed all 21 growth opportunities.

Fix: **Final Reflection**.

After the last mini-adventure:
1. no more development points are awarded;
2. incomplete marks return to the already-earned point-buy remainder;
3. the player allocates that remainder without a roll;
4. no score may exceed 15;
5. graduation remains locked until the base array audits to exactly 27 points.

CI exhaustively tests all legal 21-choice distributions and verifies that Final Reflection can finish each one at 27 points.

## Finding 5 — training must not become free proficiency

Level-0 can record:
- weapon practice;
- skill practice;
- tools;
- languages;
- apprentice work;
- mentor instruction.

These are **familiarity/history**, not proficiency bonus sources.

At RAW graduation they only become mechanical when the selected legal package grants them:
- 2014 race/background/class;
- 2024 species/background/class.

If no legal choice grants it, it remains character history.

## Finding 6 — heirlooms and mentors must be nonmechanical by default

A magical heirloom, bonus feat, extra ASI, or extra proficiency would make the finished Level-1 character non-RAW unless some legal rule grants it.

Therefore **RAW Graduation is default**:
- heirloom = mundane/narrative;
- mentor = narrative contact;
- no bonus feat;
- no extra ASI;
- no extra proficiency;
- no free spell/class feature/magic property.

A future **Heroic Legacy** mode may explicitly enable those as house rules. It must be opt-in and visibly marked non-RAW.

## Development rails

### 1. Ability rail
Exactly 21 earned development credits plus the six-point starting floor. Roll outcome never changes the amount.

### 2. Training rail
Repeated behavior, apprenticeship, and time-skip choices create familiarity tags. Single-roll success does not grant proficiency.

### 3. Story rail
Success/failure can change relationships, reputation, scars, village state, mentor trust, possessions, and narrative heirloom history. These are meaningful but mechanically neutral in RAW Graduation mode.

## Release requirements

Before Level-1 conversion is considered finished:
- Level-0 state must show 21/21 development opportunities completed;
- base array must cost exactly 27 point-buy points and contain only scores 8–15 before edition adjustments;
- 2014 and 2024 origin mechanics must stay separate;
- natural 20/1 Level-0 story tiers must never leak into normal ability-check rules;
- no familiarity may become an extra proficiency without a legal source;
- RAW Graduation must add no house-rule reward;
- generated Level-1 sheets must pass the normal pregen/ruleset certification for that edition.

**Audit verdict:** the Level-0 layer remains intentionally house-rule; the corrected boundary can produce a fully RAW Level-1 base character once certified edition-specific graduation packs are wired.
