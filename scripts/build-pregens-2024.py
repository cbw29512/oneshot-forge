#!/usr/bin/env python3
"""2024 SRD 5.2.1 conversions of tonight's six. Same people, legal 2024 features only."""
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def feat(name, source, text, uses=""):
    d = {"name": name, "source": source, "text": text}
    if uses:
        d["uses"] = uses
    return d


def patch_common(pc, rules_note):
    pc["rules"] = "5E 2024 SRD 5.2.1"
    pc["ruleset"] = "2024"
    pc["conversionNote"] = rules_note
    return pc


def brann(pc):
    pc["initiative"] = 1  # Remarkable Athlete is advantage, not +init
    pc["featureList"] = [
        feat("Weapon Mastery", "Fighter 1", "You can use mastery with four weapon kinds (level 4). Tonight: Longsword (Sap), Javelin (Slow), Battleaxe (Topple), Mace (Sap). Change one kind after a Long Rest."),
        feat("Fighting Style: Defense", "Fighter 1", "While wearing armor, +1 AC (already in 19)."),
        feat("Second Wind", "Fighter 1", "Bonus Action, regain 1d10+4 HP. 3 uses. Regain one use on a Short Rest, all on a Long Rest.", "3"),
        feat("Tactical Mind", "Fighter 2", "When you fail an ability check, expend a Second Wind (no HP) to add 1d10. If you still fail, you do not lose the use."),
        feat("Action Surge", "Fighter 2", "Once per Short Rest, take one extra action on your turn. It cannot be the Magic action.", "1/short rest"),
        feat("Improved Critical", "Champion 3", "Weapons and Unarmed Strikes crit on 19–20."),
        feat("Remarkable Athlete", "Champion 3", "Advantage on Initiative and Strength (Athletics). After you score a Critical Hit, move up to half your Speed without Opportunity Attacks."),
        feat("Savage Attacker", "Soldier origin feat", "Once per turn when you hit with a weapon, you can reroll the weapon’s damage dice and use either total."),
        feat("Tough", "Human Versatile", "+2 HP per character level (already included: 48 HP)."),
        feat("Resourceful", "Human", "After you finish a Long Rest, you gain Heroic Inspiration."),
        feat("Skillful", "Human", "One extra skill proficiency (already on the sheet)."),
    ]
    pc["hp"] = 48
    pc["hitDice"] = "4d10"
    pc["bonusActions"] = ["Second Wind (3 uses): regain 1d10+4 HP."]
    pc["masteries"] = ["Longsword: Sap (hit: target has Disadvantage on its next attack before your next turn)", "Javelin: Slow (hit and damage: target’s Speed −10 ft. until your next turn)"]
    return patch_common(pc, "2014 Champion rebuilt on 2024 Fighter 4 / Champion 3 / Human / Soldier. Extra Attack is still level 5.")


def pell(pc):
    pc["speedFt"] = 30
    pc["darkvision"] = 120
    pc["featureList"] = [
        feat("Divine Order: Protector", "Cleric 1", "Martial weapons and Heavy armor (already using chain mail)."),
        feat("Spellcasting", "Cleric 1", "Wis DC 13, +5. Slots 4/3. Prepare Wis + level = 7, plus domain spells."),
        feat("Disciple of Life", "Life 3", "When a 1st-level or higher spell you cast restores HP, extra HP = 2 + the spell’s level."),
        feat("Channel Divinity", "Cleric 2", "2 uses. Regain 1 on a Short Rest, all on a Long Rest. Turn Undead or Preserve Life (restore 20 HP split, 30 ft., not undead/constructs, up to half max each).", "2"),
        feat("Dwarven Resilience", "Dwarf", "Resistance to Poison damage. Advantage on saves to avoid or end Poisoned. Darkvision 120 ft."),
        feat("Dwarven Toughness", "Dwarf", "+1 HP per level (already in 39). Speed 30."),
        feat("Magic Initiate (Cleric)", "Acolyte origin feat", "One extra cleric cantrip (Guidance is covered). 1st-level Healing Word 1/Long Rest without a slot, and you can still spend slots on it."),
        feat("Stonecunning", "Dwarf", "Bonus Action: Tremorsense 60 ft. for 10 minutes, 1/Long Rest, on stone."),
    ]
    pc["bonusActions"] = [
        "Spiritual Weapon if cast: +5, 1d8+3 force.",
        "Healing Word if a slot remains: 1d4+5 HP plus Disciple of Life.",
        "Stonecunning: Tremorsense 60 ft., 10 minutes, 1/LR on stone.",
    ]
    pc["speed"] = "30 ft."
    return patch_common(pc, "2014 Life Cleric rebuilt on 2024 Cleric 4 (subclass at 3) / Dwarf / Acolyte. Channel Divinity is 2 uses.")


def nyx(pc):
    pc["initiative"] = 5  # Dex +3 + PB +2 from 2024 Alert
    pc["initiativeBonusOverride"] = 2
    pc["speedFt"] = 30
    pc["speed"] = "30 ft."
    pc["featureList"] = [
        feat("Weapon Mastery", "Rogue 1", "Rapier (Vex) and Shortbow (Slow). Vex: hit gives Advantage on your next attack against that creature before your next turn."),
        feat("Sneak Attack", "Rogue 1", "Once per turn +2d6 when you hit with a Finesse or Ranged weapon and have Advantage, or an ally is within 5 ft. of the target and you don’t have Disadvantage."),
        feat("Cunning Action", "Rogue 2", "Bonus Action: Dash, Disengage, or Hide."),
        feat("Fast Hands", "Thief 3", "Cunning Action: Use an Object, Sleight of Hand, or thieves’ tools on a lock or trap."),
        feat("Second-Story Work", "Thief 3", "Climbing costs no extra movement. Running jump + Dex modifier feet."),
        feat("Lucky", "Halfling", "When you roll a 1 on a d20 test, reroll and use the new roll."),
        feat("Brave", "Halfling", "Advantage on saves against Frightened. Advantage vs Frightened; you can also move through a larger creature’s space."),
        feat("Naturally Stealthy", "Halfling", "You can take Hide when you have merely Three-Quarters cover behind a creature at least one size larger."),
        feat("Alert", "Criminal origin feat", "Initiative Proficiency: add your Proficiency Bonus to Initiative (already +5 total). Initiative Swap: after rolling, you can swap Initiative with one willing ally in the same combat if neither is Incapacitated."),
    ]
    pc["masteries"] = ["Rapier: Vex", "Shortbow: Slow"]
    return patch_common(pc, "2014 Thief rebuilt on 2024 Rogue 4 / Thief 3 / Halfling / Criminal. Cunning Strike is level 5 — not on this sheet.")


def ivo(pc):
    pc["featureList"] = [
        feat("Spellcasting", "Wizard 1", "Int DC 13, +5. Slots 4/3. Prepare 7. Rituals if in the book."),
        feat("Ritual Adept / Arcane Recovery", "Wizard 1–2", "1/day after a Short Rest, recover slot levels totaling 2."),
        feat("Sculpt Spells", "Evoker 3", "When you cast an Evocation with an area, choose 1 + spell level creatures. They auto-succeed and take no damage."),
        feat("Elven Lineage (High)", "Elf", "Darkvision 60. Fey Ancestry. Trance 4 hours. Extra wizard cantrip (Minor Illusion) using Intelligence."),
        feat("Magic Initiate (Wizard)", "Sage origin feat", "One extra wizard cantrip. Shield 1/Long Rest without a slot, and you can still spend slots on it."),
        feat("Keen Senses", "Elf", "Proficiency in Insight, Perception, or Survival — Perception already listed."),
    ]
    return patch_common(pc, "2014 Evoker rebuilt on 2024 Wizard 4 (subclass at 3) / Elf High / Sage. No Extra Attack. No 3rd-level slots.")


def kael(pc):
    pc["featureList"] = [
        feat("Spellcasting", "Ranger 1", "Wis DC 12, +4. 3 first-level slots. Prepare 5. Druidic Focus allowed."),
        feat("Favored Enemy", "Ranger 1", "Hunter’s Mark is always prepared. You can cast it twice per Long Rest without a slot (then with slots)."),
        feat("Weapon Mastery", "Ranger 1", "Longbow (Slow) and Shortsword (Vex)."),
        feat("Deft Explorer", "Ranger 2", "Expertise in one skill (Perception — already doubled on the 2014 sheet as proficiency only; 2024: Perception +6 expertise). Speed +10 while unencumbered is not granted; Wood Elf speed 35 remains."),
        feat("Fighting Style: Archery", "Ranger 2", "+2 to ranged attack rolls (already in +7)."),
        feat("Hunter’s Prey: Colossus Slayer", "Hunter 3", "Once per turn, when you hit a creature that is missing any HP, +1d8 damage."),
        feat("Hunter’s Lore", "Hunter 3", "While a creature is under your Hunter’s Mark, you know its Immunities, Resistances, and Vulnerabilities."),
        feat("Elven Lineage (Wood)", "Elf", "Darkvision 60. Fey Ancestry. Trance. Speed 35. Mask of the Wild: Hide when only lightly obscured by nature."),
        feat("Magic Initiate (Druid)", "Guide origin feat", "Druid cantrip Produce Flame. Goodberry 1/Long Rest without a slot."),
    ]
    pc["skillsMap"]["perception"]["expertise"] = True
    pc["skillsMap"]["perception"]["bonus"] = 6
    pc["passivePerception"] = 16
    pc["masteries"] = ["Longbow: Slow", "Shortsword: Vex"]
    pc["spellcasting"]["prepareCount"] = "Hunter’s Mark always prepared. 3 first-level slots. 2 free Hunter’s Mark / Long Rest."
    return patch_common(pc, "2014 Hunter rebuilt on 2024 Ranger 4 / Hunter 3 / Wood Elf / Guide. Extra Attack is level 5.")


def hester(pc):
    pc["featureList"] = [
        feat("Lay on Hands", "Paladin 1", "Bonus Action, touch. Pool of 20 HP. Heal, or spend 5 from the pool to remove Poisoned.", "20 HP pool"),
        feat("Spellcasting", "Paladin 1", "Cha DC 13, +5. 3 first-level slots. Prepare 5 plus oath spells."),
        feat("Weapon Mastery", "Paladin 1", "Longsword (Sap) and Javelin (Slow)."),
        feat("Fighting Style: Dueling", "Paladin 2", "+2 damage with a melee weapon in one hand and no other weapon (already in 1d8+5)."),
        feat("Paladin’s Smite", "Paladin 2", "Divine Smite is a spell, always prepared. Casting time: Bonus Action immediately after you hit with a melee weapon or Unarmed Strike. 2d8 Radiant (1st). You can cast it 1/Long Rest without a slot, then by spending slots."),
        feat("Channel Divinity", "Paladin 3", "2 uses. Regain 1 on a Short Rest. Divine Sense (Bonus Action, 10 minutes: locate Celestials, Fiends, Undead, consecrated/desecrated within 60 ft.) or Sacred Weapon.", "2"),
        feat("Sacred Weapon", "Devotion 3", "Channel Divinity. 10 minutes. Melee weapon: add Cha (+3) to attack rolls, deal Radiant if you choose, sheds light."),
        feat("Oath Spells", "Devotion 3", "Always prepared: Protection from Evil and Good, Shield of Faith."),
        feat("Tough", "Farmer / Folk Hero origin feat", "+2 HP per level (already included: 44 HP)."),
        feat("Resourceful", "Human", "Heroic Inspiration after a Long Rest."),
    ]
    pc["hp"] = 44
    pc["bonusActions"] = [
        "Lay on Hands (touch).",
        "Divine Smite after a melee hit (spell; 1 free/LR then slots).",
        "Sacred Weapon (Channel).",
    ]
    pc["masteries"] = ["Longsword: Sap", "Javelin: Slow"]
    return patch_common(pc, "2014 Devotion Paladin rebuilt on 2024 Paladin 4. Smite is a spell. Extra Attack is level 5. Turn the Unholy is not the 2024 Channel option — Sacred Weapon and Divine Sense are.")


def stringify(pc):
    sk = pc.get("skillsMap") or {}
    pc["skills"] = ", ".join(
        f"{k.title()} {'+' if v['bonus']>=0 else ''}{v['bonus']}" + (" (ex)" if v.get("expertise") else "")
        for k, v in sk.items() if v.get("proficient")
    )
    pc["features"] = [f"{f['name']}: {f['text']}" for f in pc.get("featureList", [])]
    pc["speed"] = f"{pc.get('speedFt', 30)} ft."
    return pc


def main():
    src = json.loads((ROOT / "data/pregens/quiet-seals-level-4-2014-srd.json").read_text())
    six = [c for c in src["characters"] if c.get("recommended")]
    out = []
    patchers = {
        "pregen-brann": brann,
        "pregen-pell": pell,
        "pregen-nyx": nyx,
        "pregen-ivo": ivo,
        "pregen-kael": kael,
        "pregen-hester": hester,
    }
    for c in six:
        pc = deepcopy(c)
        pc = patchers[c["id"]](pc)
        out.append(stringify(pc))
    pack = {
        "schema": "oneshot-forge-character-pack/0.2",
        "ruleset": "5e-2024-srd-5.2.1",
        "level": 4,
        "series": "The Quiet Seals",
        "note": "Same six people as the 2014 pack, rebuilt on SRD 5.2.1. D&D Beyond cannot import this. Toggle 2014/2024 on the site.",
        "recommendedParty": [c["id"] for c in out],
        "characters": out,
    }
    path = ROOT / "data/pregens/quiet-seals-level-4-2024-srd.json"
    path.write_text(json.dumps(pack, indent=2) + "\n")
    print("2024", len(out), path.stat().st_size)


if __name__ == "__main__":
    main()
