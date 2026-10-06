# Production rules (read before you touch an adventure)

These rules came out of Production Pass 1 (branch `release/production-pass-1`). Every agent and
contributor follows them. `scripts/validate-srd-content.mjs` enforces the checkable parts, and it runs inside the
"Validate catalog zero-prep baseline" CI step.

## 1. Release discipline
- Netlify deploys `main` on every merge. **Never push or merge to `main` directly.**
- Work on a `release/*` branch and open a **draft** PR. Chris publishes many changes in one big merge.
- One commit per adventure (or per concern), with a clear message. Keep the CI suite green. `.github/workflows/validate.yml` lists every check.
- Do not change the 99¢ pricing, checkout and entitlement logic, or legal copy except to fix an obvious error.

## 2. Rules content: SRD only
- Use only SRD 5.1 (2014) and SRD 5.2.1 (2024) content: monsters, spells, conditions, classes, subclasses, species, backgrounds, feats and magic items. Use the edition that matches the ruleset toggle, and keep the two editions separate.
  - 2014-only material must not use 2024-only content (for example Hex, Dissonant Whispers, Wood Elf in the 2014 pack), and the reverse holds too.
  - SRD 5.1 has one subclass per class (Champion, Thief, Evocation, Devotion, Hunter, Lore, Life, Land, Open Hand, Draconic, Fiend, Berserker). SRD 5.2.1 has one per class as well.
  - SRD 5.2.1 backgrounds are Acolyte, Criminal, Sage and Soldier. Its origin feats are Alert, Magic Initiate, Savage Attacker and Skilled. **Tough is not in the SRD.**
  - SRD 5.1 has one background: Acolyte. Any other 2014 background must be labelled "(custom background)" and use an original feature.
- Do not use Wizards product identity: no beholder, mind flayer, displacer beast, githyanki, yuan-ti, kuo-toa, umber hulk, slaad, setting names, or named NPCs and deities from WotC settings. Do not use non-SRD monsters such as Twig Blight or Needle Blight.
- Write condition names and rules the way the SRD does: Restrained, Frightened, Prone, Poisoned, Incapacitated, and so on. Respect action, bonus action and reaction economy.
- **Reskins:** name the SRD stat block in the creature's `statBlock` field, e.g. "SRD Crocodile reskin (2014 & 2024)". Note 2024 differences in `edition2024`.
- **Original creatures:** say so in `statBlock`, give a `cr` and `xp` built with DMG creature-creation math, and keep the statistics consistent with that CR.
- **Objects** in an encounter, e.g. a ward core, get `object: true` and a `statBlock` line that gives AC and HP.

## 3. Difficulty and balance
- Ability check DCs follow DMG guidance: easy 10, medium 15, hard 20. Reserve DC 25 or higher for heroic feats. Never print "DC 0". A step with no roll says "No roll".
- Every combat encounter in `quickrun.encounters` has:
  - `balance`: the XP math for the stated level and a party of 4. Use both the 2014 DMG multiplier band and the 2024 XP budget, and label the result honestly. If it is "medium by XP, hard in play", say that and say why.
  - `scaling`: concrete adjustments for **3 and for 5–6 players**. Add or remove named creatures, or change HP and clocks.
- Fights that are meant to be impossible, such as a road-closing horde, say so in `balance` and give the escape.

## 4. Playability (zero prep)
- Each scene runs in order and has read-aloud text, a goal, and checks with DCs. Every check **moves the game on success and on failure** (fail-forward).
- No single point of failure. In a mystery, every key conclusion has **three reachable clues** (the three-clue rule).
- NPC names stay the same in the data, the product page, the runner and print. Each NPC has a voice line and a motive.
- Runner links (`/run?id=...`), module and print views, maps and images must all work. Keep the static link and image check at 0 broken refs.
- Each adventure lists its party size as "3–6 players (tuned for 4)" and its level, and the same values appear on the index card and the product page.

## 5. Card art
- Use one consistent style: painterly, torchlit, dark fantasy oil painting, warm light and deep shadow, muted palette.
- The image must depict that adventure's actual key scene. No text, no frames or borders, no signatures, no real people, no WotC IP.
- Export as `assets/cover-<slug>.jpg`, about 1200 px wide, cropped to the card ratio (16:8.5), under 300 KB. Give it an `alt` that describes the scene.
- Generators must have licences that allow commercial use without extra registration. Pass 1 used the DreamShaper 8 LCM model (CreativeML OpenRAIL-M), run locally. Do not spend paid credits without Chris's approval.

## 6. Before you open the PR
- Run every `run:` line from `validate.yml` locally (or the equivalent) and confirm all of them pass.
- Run `node scripts/validate-srd-content.mjs`.
- Bump the cache-busting query strings when you change `app.js` or `quickrun.js`.
- Do not rerun `scripts/build-pregens*.py`. They are stale and would revert the SRD fixes. Edit `data/pregens/*.json` directly.
