# Pregen Print Standard

This file is authoritative for every One-Shot Forge pregen created or regenerated after 2026-09-26.

## Definition of Done

A pregen is not release-ready until a player can receive the printed packet, sit down, and play the character without opening D&D Beyond, another tab, or a rulebook for ordinary combat.

## Packet shape

1. **Page 1 — character/combat sheet**
   - exactly one US Letter page;
   - portrait remains visible in print;
   - full-page fixed composition, not flowing web columns;
   - no clipped boxes, no content bleeding between zones;
   - all text high-contrast and readable at table distance.
2. **Page 2 — inventory**
   - equipment, gold, magic items, attunement, and armor, weapon, tool, and language proficiencies;
   - its own Letter page, so the combat sheet is not clipped.
3. **Following page — combat spell reference**
   - only when the character has spells that need reference;
   - grouped by combat role when useful;
   - concise effect text, not full spellbook prose.

## Page 1 required information

Every pregen must surface:
- character name, class/subclass, level, species, background, alignment/ruleset;
- portrait;
- AC, max HP, writable current HP, temp HP, initiative, speed, proficiency bonus;
- all six ability scores and modifiers;
- all six saving throws, including non-proficient and negative/zero bonuses;
- all 18 skills;
- passive Perception, passive Insight, passive Investigation;
- Hit Dice and death saves;
- Heroic Inspiration / equivalent inspiration tracker;
- conditions / concentration / combat notes;
- every normal weapon/cantrip attack needed in combat with attack/DC, damage, type, range/reach, and important rider;
- standard actions, bonus actions, reactions, and a short Quick Turn;
- limited-use resources with visible tracking;
- defenses/resistances/immunities that matter in combat;
- combat-relevant class/species/subclass features;
- senses (including darkvision), the role line, and the armor class breakdown when the sheet has one;
- armor, weapon, tool, and language proficiencies, equipment, and gold on the inventory page;
- compact personality/roleplay fields only after combat information is satisfied.

## Visual contract

- Screen and print use the same information hierarchy.
- The sheet header names the character, then class and level, species, and background. The rules edition is labeled 2014 or 2024 on the sheet.
- Ability scores are six boxes in a row. The modifier is the large figure. The score sits below it.
- On screen, actions, spells, inventory, and features are separate sections. In print, the character page stays one Letter page. Inventory, magic items, and proficiencies print on the next Letter page. Spells follow when the character has them.
- Skill and save text is solid high-contrast black in print; proficiency is indicated by symbol, not by faded color.
- Weapon names and attack lines are among the largest body text on the sheet.
- Current HP must provide real handwriting space.
- Unused space becomes useful combat notes/tracking space; it must not remain a decorative void while combat text is cramped.
- Personality/flavor yields space before combat data does.
- The sheet must not depend on browser scaling to fit Letter paper.

## Printing contract

- Normal page load never opens the print dialog.
- **Print this character** prints one complete packet.
- **Print all** prints every rendered packet in the active ruleset.
- One character page = one Letter page.
- Spell page = separate Letter page.
- Print state is temporary and must clear after printing.

## Content contract

- Do not show future-level features on a current-level sheet.
- Do not omit a save or skill because the bonus is zero or the character is not proficient.
- Do not rely on color alone to communicate proficiency or state.
- Combat shorthand must state enough to resolve the action at the table.
- Portrait paths are required for every release pregen; missing portrait assets block release.

## Validation

CI should reject regressions in:
- six saves;
- 18 skills;
- portrait presence/path;
- print targeting;
- fixed Letter dimensions;
- high-contrast skill/save styling;
- attack readability;
- future-level feature leakage;
- one-page character composition.

If a generated pregen cannot satisfy this standard, it is a draft, not a sellable/playable pregen.
