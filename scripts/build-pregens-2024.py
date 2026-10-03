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
    pc["hpBonusPerLevel"] = 2
    pc["hitDice"] = "4d10"
    pc["bonusActions"] = ["Second Wind (3 uses): regain 1d10+4 HP."]
    pc["masteries"] = ["Longsword: Sap (hit: target has Disadvantage on its next attack before your next turn)", "Javelin: Slow (hit and damage: target’s Speed −10 ft. until your next turn)"]
    return patch_common(pc, "2014 Champion rebuilt on 2024 Fighter 4 / Champion 3 / Human / Soldier. Extra Attack is still level 5.")


def pell(pc):
    pc["speedFt"] = 30
    pc["darkvision"] = 120
    pc["featureList"] = [
        feat("Divine Order: Protector", "Cleric 1", "Martial weapons and Heavy armor (already using chain mail)."),
        feat("Spellcasting", "Cleric 1", "Wis DC 13, +5. Slots 4/3. Level 4 Cleric prepares 7 Cleric spells; Life Domain spells are always prepared in addition."),
        feat("Disciple of Life", "Life 3", "When a spell cast with a spell slot restores HP, add 2 + the slot level to that healing on the turn you cast it."),
        feat("Channel Divinity", "Cleric 2", "2 uses. Regain 1 on a Short Rest, all on a Long Rest. Options: Divine Spark (1d8+Wis healing or Con-save Radiant/Necrotic damage), Turn Undead, or Life Domain Preserve Life (20 HP split among Bloodied creatures within 30 ft., no target above half HP).", "2"),
        feat("Dwarven Resilience", "Dwarf", "Resistance to Poison damage. Advantage on saves to avoid or end Poisoned. Darkvision 120 ft."),
        feat("Dwarven Toughness", "Dwarf", "+1 HP per level (already in 39). Speed 30."),
        feat("Magic Initiate (Cleric)", "Acolyte origin feat", "Two additional Cleric cantrips: Mending and Thaumaturgy. Healing Word is always prepared and can be cast 1/Long Rest without a slot; spell slots can also cast it."),
        feat("Stonecunning", "Dwarf", "Bonus Action: Tremorsense 60 ft. for 10 minutes while on/touching stone. Uses equal Proficiency Bonus (2), all regained on a Long Rest.", "2/LR"),
    ]
    pc["bonusActions"] = [
        "Spiritual Weapon if cast: concentration up to 1 minute; +5 melee spell attack, 1d8+3 force.",
        "Healing Word: 2d4+6 HP total at 1st level with Disciple of Life.",
        "Stonecunning: Tremorsense 60 ft., 10 minutes, 2/LR at this level, on/touching stone.",
    ]
    pc["speed"] = "30 ft."
    pc["spellcasting"]["prepareCount"] = "7 prepared Cleric spells at level 4, plus always-prepared Life Domain spells; Magic Initiate spells are separate."
    pc["spellcasting"]["cantrips"] = ["Sacred Flame", "Guidance", "Light", "Spare the Dying", "Mending", "Thaumaturgy"]
    pc["spellcasting"]["prepared"] = ["Command", "Detect Magic", "Guiding Bolt", "Healing Word", "Hold Person", "Shield of Faith", "Spiritual Weapon", "Aid", "Bless", "Cure Wounds", "Lesser Restoration"]
    by_name = {s["name"]: s for s in pc["spellList"]}
    by_name["Spare the Dying"].update({"range": "15 ft.", "effect": "A creature in range at 0 HP becomes Stable. Range increases at character levels 5, 11, and 17."})
    by_name["Cure Wounds"].update({"effect": "2d8+3 HP, plus Disciple of Life +3 (total 2d8+6) with a 1st-level slot. Life Domain."})
    by_name["Healing Word"].update({"effect": "2d4+3 HP, plus Disciple of Life +3 (total 2d4+6) with a 1st-level slot."})
    by_name["Spiritual Weapon"].update({"effect": "Concentration up to 1 minute. Melee spell attack +5, 1d8+3 force; Bonus Action on later turns to move up to 20 ft. and attack again."})
    pc["spellList"].extend([
        {"level": 0, "name": "Mending", "time": "1 minute", "range": "touch", "effect": "Repair one break or tear in an object, up to 1 foot in any dimension."},
        {"level": 0, "name": "Thaumaturgy", "time": "action", "range": "30 ft.", "effect": "Create one minor divine wonder from the spell’s listed options for up to 1 minute."},
        {"level": 1, "name": "Command", "time": "action", "range": "60 ft.", "effect": "Wis DC 13 or the target follows one listed one-word command on its next turn."},
        {"level": 1, "name": "Guiding Bolt", "time": "action", "range": "120 ft.", "effect": "Ranged spell +5; 4d6 radiant, and the next attack against the target before the end of your next turn has Advantage."}
    ])
    return patch_common(pc, "2014 Life Cleric identity rebuilt on 2024 Cleric 4 / Life Domain 3 / Dwarf / Acolyte with 2024-native spell preparation and spell text.")


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
    pc["background"] = "Guide"
    pc["spellcasting"]["prepareCount"] = "5 prepared Ranger spells at level 4, plus Hunter’s Mark always prepared. 3 first-level slots; 2 free Hunter’s Mark casts per Long Rest."
    pc["spellcasting"]["prepared"] = ["Hunter’s Mark", "Cure Wounds", "Ensnaring Strike", "Fog Cloud", "Goodberry", "Longstrider"]
    by_name = {s["name"]: s for s in pc["spellList"]}
    by_name["Cure Wounds"].update({"effect": "2d8+2 HP."})
    by_name["Goodberry"].update({"range": "self", "effect": "Create 10 berries for 24 hours. A creature uses a Bonus Action to eat one, regaining 1 HP and gaining a day’s nourishment."})
    pc["spellList"].extend([
        {"level": 1, "name": "Ensnaring Strike", "time": "bonus", "range": "self", "effect": "After you hit with a weapon attack, vines can Restrain the target on a failed Strength save; concentration up to 1 minute."},
        {"level": 1, "name": "Fog Cloud", "time": "action", "range": "120 ft.", "effect": "Concentration up to 1 hour; create a heavily obscured 20-ft-radius sphere of fog."},
        {"level": 1, "name": "Longstrider", "time": "action", "range": "touch", "effect": "For 1 hour, the target’s Speed increases by 10 ft."}
    ])
    return patch_common(pc, "2014 Hunter identity rebuilt on 2024 Ranger 4 / Hunter 3 / Wood Elf / Guide with 2024 prepared-spell rules. Extra Attack is level 5.")


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
    pc["background"] = "Farmer"
    pc["hp"] = 44
    pc["hpBonusPerLevel"] = 2
    pc["spellcasting"]["prepareCount"] = "5 prepared Paladin spells at level 4, plus Oath of Devotion spells and Divine Smite always prepared."
    pc["spellcasting"]["prepared"] = ["Bless", "Command", "Compelled Duel", "Cure Wounds", "Heroism", "Protection from Evil and Good", "Shield of Faith", "Divine Smite"]
    pc["spellList"] = [
        {"level": 1, "name": "Bless", "time": "action", "range": "30 ft.", "effect": "Concentration up to 1 minute. Up to 3 creatures add 1d4 to attack rolls and saving throws."},
        {"level": 1, "name": "Command", "time": "action", "range": "60 ft.", "effect": "Wis DC 13 or the target follows one listed one-word command on its next turn."},
        {"level": 1, "name": "Compelled Duel", "time": "bonus", "range": "30 ft.", "effect": "Concentration up to 1 minute. Wis DC 13 or the target is drawn into a duel with you under the spell’s restrictions."},
        {"level": 1, "name": "Cure Wounds", "time": "action", "range": "touch", "effect": "2d8+3 HP."},
        {"level": 1, "name": "Heroism", "time": "action", "range": "touch", "effect": "Concentration up to 1 minute. Target is immune to Frightened and gains 3 Temp HP at the start of each of its turns."},
        {"level": 1, "name": "Protection from Evil and Good", "time": "action", "range": "touch", "effect": "Concentration up to 10 minutes. Protects against Aberrations, Celestials, Elementals, Fey, Fiends, and Undead. Oath."},
        {"level": 1, "name": "Shield of Faith", "time": "bonus", "range": "60 ft.", "effect": "Concentration up to 10 minutes. Target gains +2 AC. Oath."},
        {"level": 1, "name": "Divine Smite", "time": "bonus after hit", "range": "self", "effect": "Immediately after a melee weapon or Unarmed Strike hit: +2d8 radiant; +1d8 more against a Fiend or Undead. 1 free cast/LR, otherwise a slot."}
    ]
    pc["bonusActions"] = [
        "Lay on Hands (touch).",
        "Divine Smite after a melee hit (spell; 1 free/LR then slots).",
        "Sacred Weapon (Channel).",
    ]
    pc["masteries"] = ["Longsword: Sap", "Javelin: Slow"]
    return patch_common(pc, "2014 Devotion Paladin identity rebuilt on 2024 Paladin 4 / Oath of Devotion 3 / Human / Farmer with 2024 prepared-spell and Smite rules. Extra Attack is level 5.")


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
