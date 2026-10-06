# Production Pass 1: audit (oneshot-forge)

Branch: `release/production-pass-1` (from `main` @ 2d3ed7c). It has not been merged. It is held for one big publish.
Tests: every `run:` line from `.github/workflows/validate.yml` passes, 85/85, on every commit. A new SRD content gate (`scripts/validate-srd-content.mjs`) runs inside the catalog zero-prep CI step.
Static link and image check: 0 broken refs across HTML and data JSON. The runner (`run.html?id=`) and the module and print views render with no console errors (headless Chrome).

## Cross-cutting issues (all adventures)

| Issue | Fix |
|---|---|
| Encounters had no XP math or scaling, and the index said "4 players" for the Oakhaven modules | Every combat encounter now has `balance` (the 2014 DMG multiplier band and the 2024 budget, for 4 PCs at the stated level) and `scaling` (3 players, and 5–6 players). The runner renders both. The catalog and product pages say "3–6 players (tuned for 4)". |
| Reskinned monsters did not name their SRD source | Each creature has a `statBlock` field (an SRD reskin, or an original with its CR/XP) and an `edition2024` line where the editions differ. The runner shows this as "Stat block / 2024 rules". |
| The runner printed "DC 0" for automatic actions | It now prints "No roll". |
| No durable standard | `docs/PRODUCTION_RULES.md` is linked from AGENTS.md and QUALITY.md, and the CI gate enforces the checkable parts. |
| Card art: 7 of 10 cards were CSS text placeholders (Birthday reused the Mere theme). Grubbleclaw had a white border plus a "DM Visual" title. | New painterly, torchlit card art (see Card art below). |

## Per adventure

### The Lantern Below (L1–2, live)
- Issues: the original creatures (Grave-Thing, Caldus, Pale Guest) had no CR/XP. The Pale Guest's difficulty was unlabelled. There was no scaling. The embedded 2014 pregens used Hex, Armor of Agathys, Dissonant Whispers, Wood Elf and PHB background features.
- Fixes:
  - CR/XP for the originals: Grave-Thing 1/4, Caldus 1, Pale Guest 4. Honest bands: the grave-things are easy; the Pale Guest is medium by XP and hard in play.
  - Scaling added. The sidecar quickrun JSON was synced.
  - Pregens replaced with SRD 5.1 equivalents.
- Status: **production ready.** The cover was already strong and was kept.

### The Well That Would Not Dry (live)
- Issues: no CR/XP, no difficulty bands, no scaling.
- Fixes: Name-Drowned CR 1/4 (easy). Draught CR 4 (medium by XP, high in play). Scaling added.
- Status: **production ready.** The cover was kept.

### The Owlbear Egg (L4, live)
- Issues:
  - The owlbear father had no SRD reference.
  - Orc raiders appear, but the Orc is not in SRD 5.2.1.
  - The Mother owlbear had no CR.
  - The orc wall had no balance note.
  - No scaling.
  - The card was a placeholder.
- Fixes:
  - The father uses the SRD Owlbear (2014), with a 2024 line for two Rend attacks.
  - In 2024 the raiders use the SRD Tough as a substitute.
  - The Mother is an original at CR 6 (2,300 XP); the hatchling is CR 1.
  - The orc wall is labelled a road-closer, not a fight. Scaling added.
  - New art.
- Status: **production ready.**

### Whispers of the Oakhaven Hollow (Module 02)
- Issues:
  - It used the non-SRD Twig Blight and Needle Blight, and the non-SRD Witch Bolt.
  - Malakor was unlabelled. The read-aloud was weak. No balance or scaling.
  - The card was a placeholder.
- Fixes:
  - Thorn-Shrubs are now the SRD Awakened Shrub. Rot-Blooms are the SRD Violet Fungus. The bear is the SRD Black Bear.
  - Witch Bolt became Thunderwave; Shadow Arc became Blight Bolt.
  - Malakor is an original at CR 2. The Heart Tree Core is marked as an object (AC 12, 20 HP).
  - Read-aloud fixed. Balance and scaling added.
  - New art.
- Status: **production ready.**

### Beneath the Eastern Watchtower (Module 03)
- Issues: the Stone-Sump Crawlers were unsourced, and the fight was labelled harder than its XP. No scaling.
- Fixes: the crawlers are SRD Crocodile reskins. Honest Easy label. Scaling for the fight and the sluice.
- Status: **production ready.**

### The Black Orchard (Module 04)
- Issues: the Rag-Stitched Wardens were unsourced. No scaling.
- Fixes: the wardens are SRD Animated Armor reskins (Medium). Balance and scaling added. New art.
- Status: **production ready.**

### The Ashen Bridge (Module 05)
- Issues: the lampreys were unsourced, the rescue clock did not scale with party size, and one entry showed "DC 0".
- Fixes: the lampreys are SRD Constrictor Snake reskins. The rescue clock now scales. The runner shows "No roll". New art.
- Status: **production ready.**

### The Bell Beneath the Mere (Module 06)
- Issues: the Mere Skimmers were unsourced. No scaling. The card was a placeholder.
- Fixes: the skimmers are SRD Reef Shark reskins. Balance and scaling added. New art.
- Status: **production ready.**

### Birthday One Shot (playtest preview, not for sale)
- Issues: the pregens use non-SRD content:
  - Path of the Totem Warrior (Bear and Wolf)
  - School of Illusion
  - Forest Gnome
  - Folk Hero, Outlander, Charlatan, Guild Artisan and Noble backgrounds
  
  The card reused the Mere placeholder.
- Fixes: new art only. The pregens were **not rewritten**, because this is a personalized product. Proposed swaps: Berserker, Evocation, Rock Gnome, and backgrounds relabelled "(custom background)" with original features.
- Round 2 fix (approved): the pregens are now SRD 5.1 only.
  - Birthday Hero and Jonnelle: Path of the Berserker (Frenzy).
  - Fizzwick: School of Evocation and Rock Gnome (stats recomputed: Dex 15, Int 17, HP 20, AC 12/15).
  - Every background is a custom background with an original feature.
  - Rules fixes along the way:
    - Barbarian HP is now 35.
    - Skill counts are legal (Jonnelle, Mira, Fizzwick, Poppy and Garrick each had extra skills).
    - Mira wore chain mail with Str 10, so she now has scale mail (AC 16).
    - Garrick's AC is 19 (chain mail, shield and Defense).
    - Cantrip and prepared-spell counts are legal. Poppy's Perception is +3.
    - Non-SRD tools renamed (Dragonchess set → playing card set; baker's tools → cook's utensils).
  - The stale, divergent pregen copies in data.js and production.js were removed; player-data.js is the one that loads.
  - Birthday is a 2014-only product, so there are no 2024 sheets to recompute.
- Status: **production ready (rules)**. It is still review-only and not for sale, per products.json.

### Right to OwlBear Arms (v1.1 PDF bundle)
- Issues: these are known v1.1 rules and hero-reference issues, already flagged on the card. PR #106 contains a v1.2 repair. The card image had a white border, a title caption and baked-in text.
- Fixes: a clean card crop or new art. The bundle was left to #106.
- Round 2: v1.2 from #106 was folded in and audited.
  - Thalen is now Human (Wood Elf is not in SRD 5.1). Rowan, Sylvi, Liora and Thalen have custom backgrounds.
  - Enemies are sourced to SRD stat blocks: Scout, Berserker (Ash Berserker HP 36 → 67, matching the claimed CR 2), and Bandit Captain.
  - The Ash Shaman is honestly CR 1 (200 XP), and the wave XP was recomputed.
  - Party-size scaling for 3, 4, 5 and 6 PCs was added. The catalog now says 3–6 players.
  - The downloadable ZIP is still the original v1.1 PDFs. The v1.2 packet and the on-site sheets are the source of truth.
- Status: **production ready (v1.2 procedure and sheets)**. Rebuilding the PDF bundle is a separate layout task.

### From Zero to Hero (boxed set)
- Issues: none found by the validators or the non-SRD and IP name scan. No deep narrative pass was done this run.
- Checked:
  - No combat. The species and starters are SRD only (Human, Elf, Halfling, Dwarf). No non-SRD or IP names.
  - Growth-beat DCs are 15/16/17 by age band, a documented design choice (docs/ZERO_TO_HERO_STANDARD.md). Failure still grows the character (fail-forward).
  - Each of the three relief arms has 3 or more reachable clues across the beats, and Sable's age-18 reveal is the safety net against a dead end.
  - The pages render with no console errors.
- Fix: the DM mystery summary (`campaignMystery.threeReliefArms[].keyEvidence`) listed only 2 clues per arm. It now lists all three.
- Round 2 (approved): 3-player support.
  - Every Growth Beat has a `threePlayerAdjustment`: a named village NPC handles the 4th job off-screen and reports back any clue.
  - Rotation runs A–C. Competitions add an NPC competitor (Fen Bell or Lark Cask). Starter guidance covers three players.
  - The runner has a 3-player option and the print module shows the note.
  - The catalog, kit, standard and manifest say 3–6, and the validators were updated to 3–6.
- Status: **production ready.**

### Quiet Seals pregens (2014 and 2024 packs)
- 2014 fixes:
  - Mael: Hex → Command, Armor of Agathys → Burning Hands.
  - Sable: Dissonant Whispers → Sleep.
  - Kael: Wood Elf → High Elf.
  - All PHB background features replaced with original features, and the backgrounds relabelled "(custom background)".
- 2024 fixes:
  - Hill Dwarf → Dwarf, Lightfoot Halfling → Halfling, Lucky → Luck.
  - Tough removed: Brann takes Skilled (HP 40); Hester becomes Acolyte with Magic Initiate (Cleric) and Skilled (HP 36).
  - Kael: Outlander/Guide → Criminal with Alert.
  - Wood Elf traits corrected to the 2024 SRD (Druidcraft and Longstrider, no Mask of the Wild).
- Remaining: the 2024 sheets do not list the level-4 ASI feat explicitly. The scores already include it. This is cosmetic.
- Not changed: Birthday One Shot pregens (see above).
- `scripts/build-pregens*.py` are marked STALE, because rerunning them would revert these fixes.
- Status: **production ready.** The ASI note is minor.

## Card art (commit 83f9cb3)
- Model: DreamShaper 8 LCM (CreativeML OpenRAIL-M, commercial use OK), run locally on CPU. **Spend $0.** OpenArt was not used: the Free plan has 8 credits and the cheapest model costs 10.
- New files, all 1200x638 (the card's 16:8.5 ratio) and 70–140 KB:
  - `assets/cover-owlbear-egg.jpg`, `cover-whispers.jpg`, `cover-watchtower.jpg`, `cover-black-orchard.jpg`, `cover-ashen-bridge.jpg`, `cover-mere-bell.jpg`, `cover-birthday.jpg`: these replace CSS text placeholders on the index cards and the product-page covers.
  - `cover-owlbear-arms.jpg`: the index card now uses a borderless crop of Grubbleclaw with the baked-in sign, sash and map text inpainted out. `assets/grubbleclaw.jpg` was not changed; it is still the DM visual on the Owlbear Arms page.
- Kept: `cover-lantern.jpg` and `cover-well.jpg` are already strong and on-style.
- Before/after: `/workspace/oneshot-pass1/before-after/` contains:
  - `card-before-<id>.png` and `card-after-<id>.png` (rendered cards)
  - `catalog-before-after.jpg` (side by side)
  - `images/` (the raw new covers plus `grubbleclaw-BEFORE.jpg`)
- Known gaps:
  - The Ashen Bridge art shows the bridge in the storm but not the two wagons (the card copy mentions wagons).
  - The Watchtower art shows the flooded vault and crystal glow but not the brass machine.
  - A paid model would get these details.

## Round 2 (approved follow-ups)

### PR #106 folded in (merge commit f312910)
- Conflicts were in Whispers and index.html. Resolved by keeping the pass-1 SRD fixes (no blights, Thunderwave not Witch Bolt, CR/XP/balance/scaling, 3–6 tags) and adopting #106's richer Malakor background and lucid-pause tactics plus its new card copy.

### The Fencewalker of Bellmere (new, from #106; level 1)
- Checked:
  - Three-clue rule: each of the 3 required revelations has 3 sources.
  - Recovery routes mean no single witness or the creature is required.
  - DC 11 checks, all fail-forward. Evacuation is always a legal win. SRD scan is clean.
- Fixes:
  - The Fencewalker is labelled an original creature at CR 1/4 (50 XP) with DMG math, plus a 2024 note.
  - Balance notes say it is not a fight.
  - Scaling for 3–6 players on all three encounters, using existing NPCs (Pella, Hesta).
  - Catalog, product page and products.json say 3–6 players.
  - New card art.
- Status: **production ready.**

### The Lanternback of Reedwater (new, from #106; level 2)
- Checked:
  - Each of the 4 required revelations has 3 sources, and the recovery routes cover them.
  - DC 10–12, fail-forward. Closing the channel or evacuating is always a legal win.
- Fixes:
  - The Lanternback is labelled an original creature at CR 1/4 (50 XP).
  - Balance notes and 3–6 scaling on all four encounters, using existing NPCs (Bram, Nessa).
  - Copy updated to 3–6 players. New card art.
- Status: **production ready.**

### Other #106 content
- The job board, WORLD_AND_NARRATIVE_STANDARD and CATALOG_THEME_AUDIT are clean on the SRD/IP scan. Their validators run in CI and pass.

### Art retries
- Ashen Bridge: the free model would not put wagons on a bridge from prompts alone, and 6 prompt variants failed. Two covered wagons with lanterns were drawn onto a generated storm bridge and blended with img2img. The wagons now read clearly.
- Watchtower: a screening batch of 7 found one image with the brass gear machine. It was refined at full resolution.
- Before/after files are in `before-after/round2/`.
