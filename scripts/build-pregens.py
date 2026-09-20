#!/usr/bin/env python3
"""Compile table-complete 2014 SRD level-4 pregens. Quality over quantity."""
from __future__ import annotations
import json
from pathlib import Path

PB = 2
SKILL_ABIL = {
    "acrobatics": "DEX", "animal handling": "WIS", "arcana": "INT", "athletics": "STR",
    "deception": "CHA", "history": "INT", "insight": "WIS", "intimidation": "CHA",
    "investigation": "INT", "medicine": "WIS", "nature": "INT", "perception": "WIS",
    "performance": "CHA", "persuasion": "CHA", "religion": "INT",
    "sleight of hand": "DEX", "stealth": "DEX", "survival": "WIS",
}
SAVE_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]


def mod(score: int) -> int:
    return (score - 10) // 2


def signed(n: int) -> str:
    return f"+{n}" if n >= 0 else str(n)


def skills(scores, proficient, expertise=None):
    expertise = [s.lower() for s in (expertise or [])]
    proficient = [s.lower() for s in proficient]
    out = {}
    for name, abil in SKILL_ABIL.items():
        bonus = mod(scores[abil])
        exp = name in expertise
        prof = name in proficient or exp
        if exp:
            bonus += PB * 2
        elif prof:
            bonus += PB
        out[name] = {"ability": abil, "bonus": bonus, "proficient": prof, "expertise": exp}
    return out


def saves(scores, proficient):
    proficient = [s.upper() for s in proficient]
    out = {}
    for abil in SAVE_KEYS:
        bonus = mod(scores[abil]) + (PB if abil in proficient else 0)
        out[abil] = {"bonus": bonus, "proficient": abil in proficient}
    return out


def combat(scores, ac, hp, speed, hit_die, darkvision=0, ac_notes=""):
    dex = mod(scores["DEX"])
    wis = mod(scores["WIS"])
    return {
        "ac": ac, "acNotes": ac_notes, "initiative": dex, "speed": speed,
        "hp": hp, "hitDice": f"4d{hit_die}", "proficiency": PB,
        "passivePerception": 10 + wis,  # overwritten if perception proficient
        "darkvision": darkvision,
    }


def finish(pc):
    sk = pc["skills"]
    pc["passivePerception"] = 10 + sk["perception"]["bonus"] - (0 if True else 0)
    # PP is 10 + perception bonus already includes prof
    pc["passivePerception"] = 10 + (sk["perception"]["bonus"] if not sk["perception"]["proficient"] else sk["perception"]["bonus"])
    # Both cases: bonus already has proficiency. PP = 10 + wis + prof if proficient.
    # skills["perception"]["bonus"] IS wis+prof. So PP = 10 + wis_mod + (pb if prof).
    # Wait: skill bonus = mod + pb. PP = 10 + mod + pb if proficient = 10 + skill_bonus only if we used full bonus.
    # Standard: PP = 10 + Perception modifier (which includes prof). Yes PP = 10 + skills[perception].bonus
    pc["passivePerception"] = 10 + sk["perception"]["bonus"]
    pc["passiveInsight"] = 10 + sk["insight"]["bonus"]
    pc["level"] = 4
    pc["rules"] = "5E 2014 SRD"
    pc["xp"] = 2700
    pc["proficiency"] = PB
    pc.setdefault("alignment", "Neutral")
    pc["class"] = f"{pc['className']} ({pc['subclass']})"
    # derived strings for old runner
    pc["saves"] = ", ".join(
        f"{k.title()} {signed(v['bonus'])}" for k, v in pc["saveMap"].items() if v["proficient"]
    )
    pc["skills"] = ", ".join(
        f"{k.title()} {signed(v['bonus'])}" + (" (ex)" if v["expertise"] else "")
        for k, v in sk.items() if v["proficient"]
    )
    pc["speed"] = f"{pc['speedFt']} ft."
    attacks = []
    for a in pc.get("attackList", []):
        line = f"{a['name']}. {signed(a['bonus'])} to hit; {a['damage']} {a['type']}"
        if a.get("notes"):
            line += f"; {a['notes']}"
        attacks.append(line)
    pc["attacks"] = attacks
    pc["features"] = [f"{f['name']}: {f['text']}" for f in pc.get("featureList", [])]
    if pc.get("spellList"):
        sc = pc["spellcasting"]
        sc["cantrips"] = [s["name"] for s in pc["spellList"] if s["level"] == 0]
        sc["prepared"] = [s["name"] for s in pc["spellList"] if s["level"] > 0]
    pc["gear"] = ", ".join(
        (f"{e['qty']}× {e['name']}" if e.get("qty", 1) != 1 else e["name"])
        for e in pc.get("equipment", [])
    ) + (f", {pc.get('gp', 0)} gp" if "gp" in pc else "")
    return pc


def spell(level, name, time, range_, effect, save="", attack=""):
    d = {"level": level, "name": name, "time": time, "range": range_, "effect": effect}
    if save:
        d["save"] = save
    if attack:
        d["attack"] = attack
    return d


def feat(name, source, text, uses=""):
    d = {"name": name, "source": source, "text": text}
    if uses:
        d["uses"] = uses
    return d


def atk(name, bonus, damage, typ, notes=""):
    d = {"name": name, "bonus": bonus, "damage": damage, "type": typ}
    if notes:
        d["notes"] = notes
    return d


# --- characters ---

def brann():
    scores = {"STR": 16, "DEX": 12, "CON": 16, "INT": 10, "WIS": 12, "CHA": 10}
    sk = skills(scores, ["athletics", "perception", "survival", "intimidation"])
    pc = {
        "id": "pregen-brann", "name": "Brann Oakholt", "className": "Fighter", "subclass": "Champion",
        "race": "Human", "background": "Soldier", "role": "Front line", "recommended": True,
        "portrait": "assets/pregens/brann.jpg", "alignment": "Lawful Neutral",
        "scores": scores, "saveMap": saves(scores, ["STR", "CON"]), "skillsMap": sk, "skills": sk,
        "ac": 19, "acNotes": "chain mail 16 + shield 2 + Defense 1", "initiative": 1,
        "speedFt": 30, "hp": 40, "hitDice": "4d10", "darkvision": 0,
        "proficiencies": {
            "armor": ["all armor", "shields"],
            "weapons": ["simple weapons", "martial weapons"],
            "tools": ["dice set", "land vehicles"],
            "languages": ["Common", "Dwarvish"],
        },
        "attackList": [
            atk("Longsword", 5, "1d8+3", "slashing", "versatile 1d10+3; one attack (Extra Attack is fighter 5)"),
            atk("Javelin", 5, "1d6+3", "piercing", "thrown 30/120; 3 carried"),
        ],
        "bonusActions": ["Second Wind (1/rest): regain 1d10+4 hit points."],
        "reactions": [],
        "featureList": [
            feat("Fighting Style: Defense", "Fighter 1", "While wearing armor, +1 AC (already in 19)."),
            feat("Second Wind", "Fighter 1", "Bonus action, 1/rest: regain 1d10+4 HP.", "1/rest"),
            feat("Action Surge", "Fighter 2", "On your turn, take one additional action. 1/rest.", "1/rest"),
            feat("Improved Critical", "Champion 3", "Weapon attacks crit on 19–20."),
            feat("Ability Score Improvement", "Fighter 4", "Already applied in the scores on this sheet."),
            feat("Military Rank", "Soldier", "Soldiers loyal to your former rank still recognize you. You can invoke that rank for food, lodging, or an audience with officers."),
        ],
        "equipment": [
            {"name": "Chain mail", "qty": 1}, {"name": "Shield", "qty": 1},
            {"name": "Longsword", "qty": 1}, {"name": "Javelin", "qty": 3},
            {"name": "Explorer’s pack", "qty": 1},
        ],
        "gp": 12,
        "personality": {
            "trait": "Counts exits. Sleeps in the mail.",
            "ideal": "Hold the line so someone else gets home.",
            "bond": "A dead sergeant’s token in his pouch.",
            "flaw": "Would rather take a hit than admit he was wrong.",
        },
        "appearance": "Human man, early forties, iron-grey stubble, a pale scar along the jaw.",
    }
    return finish(pc)


def pell():
    scores = {"STR": 14, "DEX": 8, "CON": 16, "INT": 10, "WIS": 16, "CHA": 12}
    sk = skills(scores, ["medicine", "insight", "religion", "persuasion"])
    pc = {
        "id": "pregen-pell", "name": "Sister Pell Bramble", "className": "Cleric", "subclass": "Life Domain",
        "race": "Hill Dwarf", "background": "Acolyte", "role": "Healer and support", "recommended": True,
        "portrait": "assets/pregens/pell.jpg", "alignment": "Lawful Good",
        "scores": scores, "saveMap": saves(scores, ["WIS", "CHA"]), "skillsMap": sk, "skills": sk,
        "ac": 18, "acNotes": "chain mail 16 + shield 2", "initiative": -1,
        "speedFt": 25, "hp": 39, "hitDice": "4d8", "darkvision": 60,
        "proficiencies": {
            "armor": ["light", "medium", "heavy", "shields"],
            "weapons": ["simple weapons", "warhammer (dwarf)"],
            "tools": ["smith’s tools"],
            "languages": ["Common", "Dwarvish", "Celestial"],
        },
        "attackList": [
            atk("Warhammer", 4, "1d8+2", "bludgeoning", "versatile 1d10+2"),
            atk("Sacred Flame", 0, "1d8", "radiant", "Dex DC 13; 60 ft.; cover does not help"),
        ],
        "bonusActions": [
            "Spiritual Weapon (if cast): melee spell +5, 1d8+3 force, 20 ft.",
            "Healing Word (if a 1st-level slot remains): 1d4+5 HP, 60 ft. Disciple of Life: extra +3 HP.",
        ],
        "reactions": [],
        "spellcasting": {
            "ability": "Wisdom", "saveDC": 13, "attack": 5,
            "slots": {"1": 4, "2": 3}, "focus": "holy symbol",
            "prepareCount": "7 (Wis 3 + cleric 4); domain spells always prepared and do not count",
        },
        "spellList": [
            spell(0, "Sacred Flame", "action", "60 ft.", "Dex DC 13 or 1d8 radiant. Cover does not help."),
            spell(0, "Guidance", "action", "touch", "Concentration 1 min. Target adds 1d4 to one ability check."),
            spell(0, "Light", "action", "touch", "Object shines 20 ft. bright / 20 ft. dim, 1 hour."),
            spell(0, "Spare the Dying", "action", "touch", "A living creature at 0 HP becomes stable."),
            spell(1, "Bless", "action", "30 ft.", "Concentration 1 min. Up to 3 creatures add 1d4 to attacks and saves. Domain."),
            spell(1, "Cure Wounds", "action", "touch", "1d8+3 HP, plus Disciple of Life +3 (total 1d8+6). Domain."),
            spell(1, "Healing Word", "bonus", "60 ft.", "1d4+3 HP, plus Disciple of Life +3 (total 1d4+6)."),
            spell(1, "Shield of Faith", "bonus", "60 ft.", "Concentration 10 min. +2 AC."),
            spell(1, "Detect Magic", "action", "self", "Concentration 10 min. Sense magic in 30 ft. Ritual."),
            spell(2, "Spiritual Weapon", "bonus", "60 ft.", "1 min, no concentration. Spell attack +5, 1d8+3 force. Domain."),
            spell(2, "Lesser Restoration", "action", "touch", "End one disease or one condition: blinded, deafened, paralyzed, poisoned. Domain."),
            spell(2, "Aid", "action", "30 ft.", "8 hours. 3 creatures gain +5 current and max HP."),
            spell(2, "Hold Person", "action", "60 ft.", "Concentration 1 min. Wis DC 13 or paralyzed. Repeat save at end of turn."),
        ],
        "featureList": [
            feat("Disciple of Life", "Life 1", "When you restore HP with a 1st-level or higher spell, extra HP = 2 + the spell’s level."),
            feat("Channel Divinity: Turn Undead", "Cleric 2", "Action, 1/rest. Undead within 30 ft. that see/hear you: Wis DC 13 or turned 1 minute.", "1/rest shared"),
            feat("Channel Divinity: Preserve Life", "Life 2", "Action, 1/rest. Restore 20 HP split among creatures within 30 ft. (not undead/constructs), each up to half their HP max.", "1/rest shared"),
            feat("Dwarven Resilience", "Hill Dwarf", "Advantage on saves vs poison. Resistance to poison damage. Darkvision 60 ft. Speed 25 is not reduced by heavy armor."),
            feat("Dwarven Toughness", "Hill Dwarf", "+1 HP per level (already in 39)."),
            feat("Shelter of the Faithful", "Acolyte", "You and companions can receive free healing and care at a temple of your faith."),
            feat("Spellcasting", "Cleric 1", "Wis DC 13, +5 to hit. Slots 4/3. Prepare Wis mod + level = 7, plus domain spells."),
        ],
        "equipment": [
            {"name": "Chain mail"}, {"name": "Shield"}, {"name": "Warhammer"},
            {"name": "Holy symbol"}, {"name": "Healer’s kit"}, {"name": "Acolyte’s vestments"},
        ],
        "gp": 15,
        "personality": {
            "trait": "Touches the iron of a lantern the way other people touch a holy symbol.",
            "ideal": "Mend what you can. Do not pretend a cage is a blessing.",
            "bond": "The chapel at Briar Glen still owes her a letter.",
            "flaw": "Will spend a spell slot on a stranger before she keeps one for herself.",
        },
        "appearance": "Hill dwarf woman, copper braid, kind tired eyes, warhammer looped at the hip.",
    }
    return finish(pc)


def nyx():
    scores = {"STR": 8, "DEX": 16, "CON": 14, "INT": 12, "WIS": 13, "CHA": 12}
    sk = skills(
        scores,
        ["stealth", "sleight of hand", "acrobatics", "perception", "investigation", "deception"],
        expertise=["stealth", "sleight of hand"],
    )
    # thieves' tools expertise is a tool, not a skill — note in features
    pc = {
        "id": "pregen-nyx", "name": "Nyx Keller", "className": "Rogue", "subclass": "Thief",
        "race": "Lightfoot Halfling", "background": "Criminal", "role": "Scout and striker", "recommended": True,
        "portrait": "assets/pregens/nyx.jpg", "alignment": "Chaotic Neutral",
        "scores": scores, "saveMap": saves(scores, ["DEX", "INT"]), "skillsMap": sk, "skills": sk,
        "ac": 15, "acNotes": "studded leather 12 + Dex 3", "initiative": 3,
        "speedFt": 25, "hp": 31, "hitDice": "4d8", "darkvision": 0,
        "proficiencies": {
            "armor": ["light armor"],
            "weapons": ["simple weapons", "hand crossbows", "longswords", "rapiers", "shortswords"],
            "tools": ["thieves’ tools (expertise +7)", "dice set", " forgery kit"],
            "languages": ["Common", "Halfling", "Thieves’ Cant"],
        },
        "attackList": [
            atk("Rapier", 5, "1d8+3", "piercing", "finesse; Sneak Attack +2d6 if advantage or an ally is within 5 ft. of the target and you don’t have disadvantage"),
            atk("Shortbow", 5, "1d6+3", "piercing", "range 80/320; same Sneak Attack rule"),
        ],
        "bonusActions": [
            "Cunning Action: Dash, Disengage, or Hide.",
            "Fast Hands: Cunning Action to Use an Object, thieves’ tools (trap/lock), or Sleight of Hand.",
        ],
        "reactions": [],
        "featureList": [
            feat("Sneak Attack", "Rogue 1", "Once per turn, +2d6 damage when you hit with a finesse or ranged weapon and have advantage, or an ally is within 5 ft. of the target and you don’t have disadvantage."),
            feat("Cunning Action", "Rogue 2", "Bonus action: Dash, Disengage, or Hide."),
            feat("Fast Hands", "Thief 3", "Use Cunning Action for Use an Object, Dex (Sleight of Hand), or thieves’ tools to pick a lock or disarm a trap."),
            feat("Second-Story Work", "Thief 3", "Climbing does not cost extra movement. Running jump distance +3 ft. (Dex mod)."),
            feat("Lucky", "Halfling", "When you roll a 1 on an attack, check, or save, reroll and use the new roll."),
            feat("Brave", "Halfling", "Advantage on saves against being frightened."),
            feat("Halfling Nimbleness", "Halfling", "Move through the space of any creature of a size larger than yours."),
            feat("Naturally Stealthy", "Lightfoot", "You can attempt to hide even when you are obscured only by a creature one size larger than you."),
            feat("Criminal Contact", "Criminal", "You have a reliable contact who can pass messages through the criminal network."),
        ],
        "equipment": [
            {"name": "Studded leather"}, {"name": "Rapier"}, {"name": "Shortbow"},
            {"name": "Arrows", "qty": 20}, {"name": "Thieves’ tools"}, {"name": "Crowbar"},
        ],
        "gp": 18,
        "personality": {
            "trait": "Smiles when people lock things. Locks are a kind of invitation.",
            "ideal": "Nobody should own a secret that can eat a town.",
            "bond": "Still owes Tamsin a bottle from two winters ago.",
            "flaw": "Will pick a pocket to see if she can, even when she does not need to.",
        },
        "appearance": "Lightfoot halfling, short dark hair, rain-dark leather, a grin that is not always kind.",
    }
    return finish(pc)


def ivo():
    scores = {"STR": 8, "DEX": 14, "CON": 14, "INT": 16, "WIS": 12, "CHA": 10}
    sk = skills(scores, ["arcana", "investigation", "history", "insight"])
    pc = {
        "id": "pregen-ivo", "name": "Ivo Ashletter", "className": "Wizard", "subclass": "Evocation",
        "race": "High Elf", "background": "Sage", "role": "Damage and control", "recommended": True,
        "portrait": "assets/pregens/ivo.jpg", "alignment": "Neutral",
        "scores": scores, "saveMap": saves(scores, ["INT", "WIS"]), "skillsMap": sk, "skills": sk,
        "ac": 12, "acNotes": "unarmored 10 + Dex 2; 15 with Mage Armor", "initiative": 2,
        "speedFt": 30, "hp": 26, "hitDice": "4d6", "darkvision": 60,
        "proficiencies": {
            "armor": [],
            "weapons": ["daggers", "darts", "slings", "quarterstaffs", "light crossbows", "longsword (elf)", "shortsword (elf)", "shortbow (elf)", "longbow (elf)"],
            "tools": [],
            "languages": ["Common", "Elvish", "Draconic", "Celestial"],
        },
        "attackList": [
            atk("Fire Bolt", 5, "1d10", "fire", "ranged spell, 120 ft.; ignites flammable objects"),
            atk("Dagger", 4, "1d4+2", "piercing", "finesse, thrown 20/60"),
        ],
        "bonusActions": ["Misty Step (if a 2nd-level slot remains): teleport 30 ft. you can see."],
        "reactions": ["Shield (1st-level slot): +5 AC until the start of your next turn, including against the triggering attack. Also auto-stops Magic Missile."],
        "spellcasting": {
            "ability": "Intelligence", "saveDC": 13, "attack": 5,
            "slots": {"1": 4, "2": 3}, "focus": "arcane focus",
            "prepareCount": "7 (Int 3 + wizard 4). Spellbook holds more. Rituals: Detect Magic.",
        },
        "spellList": [
            spell(0, "Fire Bolt", "action", "120 ft.", "Ranged spell +5; 1d10 fire."),
            spell(0, "Mage Hand", "action", "30 ft.", "Spectral hand, 1 minute, 10 lb., no attack."),
            spell(0, "Prestidigitation", "action", "10 ft.", "Tiny sensory trick, 1 hour or instant."),
            spell(0, "Minor Illusion", "action", "30 ft.", "Sound or image, 5-ft cube, 1 minute. High-elf extra cantrip."),
            spell(1, "Mage Armor", "action", "touch", "8 hours. Unarmored AC = 13 + Dex (15)."),
            spell(1, "Magic Missile", "action", "120 ft.", "3 darts, 1d4+1 force each, automatic hit. Sculpt does not apply (no save)."),
            spell(1, "Shield", "reaction", "self", "+5 AC until your next turn starts. Also stops Magic Missile."),
            spell(1, "Burning Hands", "action", "self (15-ft cone)", "Dex DC 13, 3d6 fire, half on success. Sculpt Spells."),
            spell(1, "Detect Magic", "action", "self", "Ritual. Concentration 10 min. Sense magic in 30 ft."),
            spell(2, "Scorching Ray", "action", "120 ft.", "3 rays, ranged spell +5, 2d6 fire each. Sculpt does not apply."),
            spell(2, "Misty Step", "bonus", "self", "Teleport 30 ft. to a space you can see."),
            spell(2, "Shatter", "action", "60 ft. (10-ft radius)", "Con DC 13, 3d8 thunder, half on success. Creatures of stone/metal/glass have disadvantage. Sculpt Spells."),
        ],
        "featureList": [
            feat("Spellcasting", "Wizard 1", "Int DC 13, +5. Slots 4/3. Prepare 7 from the book. Rituals if in the book."),
            feat("Arcane Recovery", "Wizard 1", "1/day after a short rest, recover slot levels totaling 2 (wizard level ÷ 2).", "1/day"),
            feat("Sculpt Spells", "Evocation 2", "When you cast an evocation that affects others you can see, choose 1 + spell level creatures. They auto-succeed the save and take no damage."),
            feat("Fey Ancestry", "High Elf", "Advantage vs charm. Magic cannot put you to sleep. Darkvision 60 ft. Trance: 4 hours instead of sleep."),
            feat("Researcher", "Sage", "If you do not know a piece of lore, you usually know where to find it."),
        ],
        "equipment": [
            {"name": "Spellbook"}, {"name": "Dagger"}, {"name": "Arcane focus (crystal)"},
            {"name": "Scholar’s pack"}, {"name": "Bottle of ink"},
        ],
        "gp": 22,
        "personality": {
            "trait": "Writes the last word he heard before he forgets it. Habit. Not a joke.",
            "ideal": "A seal that needs a village’s silence is a bad seal.",
            "bond": "The priory library still has a book he did not finish.",
            "flaw": "Will stop in a fight to read an inscription.",
        },
        "appearance": "High elf, ink on the fingers, scholar’s coat gone to weather.",
    }
    return finish(pc)


def kael():
    scores = {"STR": 12, "DEX": 16, "CON": 14, "INT": 10, "WIS": 14, "CHA": 8}
    sk = skills(scores, ["perception", "stealth", "survival", "nature", "athletics"])
    pc = {
        "id": "pregen-kael", "name": "Kael Thornwake", "className": "Ranger", "subclass": "Hunter",
        "race": "Wood Elf", "background": "Outlander", "role": "Ranged hunter", "recommended": True,
        "portrait": "assets/pregens/kael.jpg", "alignment": "Neutral Good",
        "scores": scores, "saveMap": saves(scores, ["STR", "DEX"]), "skillsMap": sk, "skills": sk,
        "ac": 16, "acNotes": "scale mail 14 + Dex 2 (medium, max 2)", "initiative": 3,
        "speedFt": 35, "hp": 36, "hitDice": "4d10", "darkvision": 60,
        "proficiencies": {
            "armor": ["light", "medium", "shields"],
            "weapons": ["simple weapons", "martial weapons"],
            "tools": [],
            "languages": ["Common", "Elvish", "Sylvan"],
        },
        "attackList": [
            atk("Longbow", 7, "1d8+3", "piercing", "Archery included; range 150/600; two-handed. Extra Attack is ranger 5 — one shot."),
            atk("Shortsword", 5, "1d6+3", "piercing", "finesse"),
        ],
        "bonusActions": ["Hunter’s Mark (if a 1st-level slot remains): bonus, concentration 1 hour. +1d6 damage vs one target; advantage to track it."],
        "reactions": [],
        "spellcasting": {
            "ability": "Wisdom", "saveDC": 12, "attack": 4,
            "slots": {"1": 3}, "focus": "druidic focus (optional)",
            "prepareCount": "Known ranger spells, not prepared: 3.",
        },
        "spellList": [
            spell(1, "Hunter’s Mark", "bonus", "90 ft.", "Concentration 1 hour. +1d6 damage vs the marked creature. Bonus action to move it when the target drops."),
            spell(1, "Goodberry", "action", "touch", "10 berries, 1 HP each, 24 hours. A creature can eat one as an action."),
            spell(1, "Cure Wounds", "action", "touch", "1d8+2 HP."),
        ],
        "featureList": [
            feat("Favored Enemy: Undead", "Ranger 1", "Advantage on Survival to track undead and on Int checks to recall about them."),
            feat("Natural Explorer: Forest", "Ranger 1", "In forests: 2× food, ignore difficult terrain (you), advantage on initiative if not incapacitated, travel benefits for the group."),
            feat("Fighting Style: Archery", "Ranger 2", "+2 to attack rolls with ranged weapons (already in +7)."),
            feat("Colossus Slayer", "Hunter 3", "Once per turn, when you hit a creature below its HP maximum, +1d8 damage."),
            feat("Primeval Awareness", "Ranger 3", "Expend a spell slot: for 1 minute per slot level, sense favored enemies within 1 mile (6 miles in your favored terrain).", "spell slot"),
            feat("Mask of the Wild", "Wood Elf", "Hide when only lightly obscured by foliage, heavy rain, falling snow, mist, or other natural phenomena."),
            feat("Fey Ancestry", "Elf", "Advantage vs charm. Magic cannot put you to sleep. Darkvision 60. Trance 4 hours."),
            feat("Wanderer", "Outlander", "You can always recall the layout of surrounding territory and find food and water for yourself and five others when the land can provide."),
        ],
        "equipment": [
            {"name": "Scale mail"}, {"name": "Longbow"}, {"name": "Arrows", "qty": 20},
            {"name": "Shortsword"}, {"name": "Explorer’s pack"},
        ],
        "gp": 11,
        "personality": {
            "trait": "Speaks after he has counted the birds. If the birds are gone, he speaks faster.",
            "ideal": "The wood does not owe anyone a lantern.",
            "bond": "A sister who stopped writing from Saltmere.",
            "flaw": "Will not sleep inside a sealed room.",
        },
        "appearance": "Wood elf, green cloak gone dark with rain, longbow taller than some doors.",
    }
    return finish(pc)


def hester():
    scores = {"STR": 16, "DEX": 8, "CON": 14, "INT": 10, "WIS": 12, "CHA": 16}
    sk = skills(scores, ["persuasion", "insight", "athletics", "religion"])
    pc = {
        "id": "pregen-hester", "name": "Hester Brine", "className": "Paladin", "subclass": "Oath of Devotion",
        "race": "Human", "background": "Folk Hero", "role": "Face and second front line", "recommended": True,
        "portrait": "assets/pregens/hester.jpg", "alignment": "Lawful Good",
        "scores": scores, "saveMap": saves(scores, ["WIS", "CHA"]), "skillsMap": sk, "skills": sk,
        "ac": 18, "acNotes": "chain mail 16 + shield 2", "initiative": -1,
        "speedFt": 30, "hp": 36, "hitDice": "4d10", "darkvision": 0,
        "proficiencies": {
            "armor": ["all armor", "shields"],
            "weapons": ["simple weapons", "martial weapons"],
            "tools": ["smith’s tools", "land vehicles"],
            "languages": ["Common", "Celestial"],
        },
        "attackList": [
            atk("Longsword", 5, "1d8+5", "slashing", "Dueling +2 already in damage; versatile 1d10+5 without shield. One attack (Extra Attack is paladin 5). Smite on hit."),
            atk("Javelin", 5, "1d6+3", "piercing", "thrown 30/120"),
        ],
        "bonusActions": [
            "Divine Smite is not a bonus — it is on hit. Sacred Weapon (Channel): bonus action, 1 minute, attacks with one weapon use +5 (Cha) instead of Str, and the weapon is magical.",
        ],
        "reactions": [],
        "spellcasting": {
            "ability": "Charisma", "saveDC": 13, "attack": 5,
            "slots": {"1": 3}, "focus": "holy symbol",
            "prepareCount": "Cha mod + half paladin level (min 1) = 3+2 = 5, plus oath spells.",
        },
        "spellList": [
            spell(1, "Bless", "action", "30 ft.", "Concentration 1 min. Up to 3 creatures add 1d4 to attacks and saves."),
            spell(1, "Cure Wounds", "action", "touch", "1d8+3 HP."),
            spell(1, "Heroism", "action", "touch", "Concentration 1 min. Immune to frightened; 3 temp HP at the start of each turn."),
            spell(1, "Protection from Evil and Good", "action", "touch", "Concentration 10 min. Aberrations, celestials, elementals, fey, fiends, undead: disadvantage to hit the target; target can’t be charmed, frightened, or possessed by them. Oath."),
            spell(1, "Sanctuary", "bonus", "30 ft.", "1 min. Attackers must Wis DC 13 or choose a new target. Ends if the warded creature attacks or casts a spell that affects an enemy. Oath."),
        ],
        "featureList": [
            feat("Divine Sense", "Paladin 1", "Action. 4 uses (1 + Cha). Until the end of your next turn, know location of celestials, fiends, and undead within 60 ft. not behind total cover, and consecrated/desecrated places.", "4/long rest"),
            feat("Lay on Hands", "Paladin 1", "Action. Pool of 20 HP. Heal that much, or spend 5 HP from the pool to neutralize one poison or one disease.", "20 HP pool"),
            feat("Fighting Style: Dueling", "Paladin 2", "+2 damage with a melee weapon in one hand and no other weapon (already in 1d8+5)."),
            feat("Divine Smite", "Paladin 2", "When you hit with a melee weapon, expend a spell slot: +2d8 radiant (1st) or +3d8 (2nd). +1d8 vs undead or fiend. You have only 1st-level slots: +2d8, or +3d8 vs undead/fiend."),
            feat("Divine Health", "Paladin 3", "Immune to disease."),
            feat("Channel Divinity: Sacred Weapon", "Devotion 3", "Bonus action, 1/rest. 1 minute. One weapon: add Cha (+3) to attack rolls (use this instead of Str if better — +6 to hit), magical, sheds light.", "1/rest shared"),
            feat("Channel Divinity: Turn the Unholy", "Devotion 3", "Action, 1/rest. Fiends and undead within 30 ft. that see/hear you: Wis DC 13 or turned 1 minute.", "1/rest shared"),
            feat("Rustic Hospitality", "Folk Hero", "Common folk will hide you from the law or anyone searching, if you are not putting them in undue danger."),
        ],
        "equipment": [
            {"name": "Chain mail"}, {"name": "Shield"}, {"name": "Longsword"},
            {"name": "Javelin", "qty": 3}, {"name": "Holy symbol (iron lantern)"},
        ],
        "gp": 14,
        "personality": {
            "trait": "Keeps her oaths short so she can keep them.",
            "ideal": "A village should not have to rent its safety from a secret.",
            "bond": "The miller’s family in her home hamlet still writes.",
            "flaw": "Will not lie even when a lie would keep someone alive.",
        },
        "appearance": "Human woman, mid-thirties, cropped black hair, an iron lantern on a chain instead of a sunburst.",
    }
    return finish(pc)


def rook():
    scores = {"STR": 16, "DEX": 14, "CON": 16, "INT": 8, "WIS": 12, "CHA": 10}
    sk = skills(scores, ["athletics", "perception", "survival", "intimidation"])
    pc = {
        "id": "pregen-rook", "name": "Rook Helmer", "className": "Barbarian", "subclass": "Path of the Berserker",
        "race": "Half-Orc", "background": "Outlander", "role": "Rage striker", "recommended": False,
        "portrait": "", "alignment": "Chaotic Neutral",
        "scores": scores, "saveMap": saves(scores, ["STR", "CON"]), "skillsMap": sk, "skills": sk,
        "ac": 15, "acNotes": "Unarmored Defense 10+Dex 2+Con 3", "initiative": 2,
        "speedFt": 30, "hp": 45, "hitDice": "4d12", "darkvision": 60,
        "proficiencies": {
            "armor": ["light", "medium", "shields"],
            "weapons": ["simple weapons", "martial weapons"],
            "tools": [],
            "languages": ["Common", "Orc", "Giant"],
        },
        "attackList": [
            atk("Greataxe", 5, "1d12+3", "slashing", "two-handed; +2 damage while raging (1d12+5). One attack (Extra Attack is barbarian 5)."),
            atk("Javelin", 5, "1d6+3", "piercing", "thrown 30/120"),
        ],
        "bonusActions": [
            "Enter rage (3/long rest).",
            "Frenzy: while raging, bonus melee weapon attack. When the rage ends, 1 level of exhaustion.",
        ],
        "reactions": [],
        "featureList": [
            feat("Rage", "Barbarian 1", "Bonus action, 3/long rest, 1 minute. Advantage on Str checks and saves; +2 melee Str damage; resistance to bludgeoning, piercing, slashing. Ends if you don’t attack or take damage for a turn.", "3/long rest"),
            feat("Unarmored Defense", "Barbarian 1", "AC = 10 + Dex + Con while not wearing armor (15). Shield allowed; he is not using one."),
            feat("Reckless Attack", "Barbarian 2", "Advantage on melee Str attacks this turn; attacks against you have advantage until your next turn."),
            feat("Danger Sense", "Barbarian 2", "Advantage on Dex saves against effects you can see. Not if blinded, deafened, or incapacitated."),
            feat("Frenzy", "Berserker 3", "When you rage, you can frenzy: bonus melee weapon attack each turn. When the rage ends, gain 1 exhaustion."),
            feat("Relentless Endurance", "Half-Orc", "1/long rest, when you drop to 0 HP and don’t die outright, drop to 1 HP instead.", "1/long rest"),
            feat("Savage Attacks", "Half-Orc", "On a melee crit, roll one extra weapon damage die."),
            feat("Wanderer", "Outlander", "Always know the surrounding territory; find food and water for six when the land allows."),
        ],
        "equipment": [{"name": "Greataxe"}, {"name": "Javelin", "qty": 4}, {"name": "Explorer’s pack"}],
        "gp": 9,
        "personality": {"trait": "Laughs once, then hits.", "ideal": "Die on your feet.", "bond": "A brother who took the other road.", "flaw": "Cannot walk away from a dare."},
        "appearance": "Half-orc, grey-green, a split lip that never quite closed.",
    }
    return finish(pc)


def sable():
    scores = {"STR": 8, "DEX": 14, "CON": 14, "INT": 10, "WIS": 12, "CHA": 16}
    sk = skills(
        scores,
        ["persuasion", "deception", "insight", "acrobatics", "stealth", "perception", "investigation"],
        expertise=["persuasion", "deception"],
    )
    pc = {
        "id": "pregen-sable", "name": "Sable Quinn", "className": "Bard", "subclass": "College of Lore",
        "race": "Half-Elf", "background": "Entertainer", "role": "Face, support, and control", "recommended": False,
        "portrait": "", "alignment": "Chaotic Good",
        "scores": scores, "saveMap": saves(scores, ["DEX", "CHA"]), "skillsMap": sk, "skills": sk,
        "ac": 14, "acNotes": "studded leather 12 + Dex 2", "initiative": 2,
        "speedFt": 30, "hp": 31, "hitDice": "4d8", "darkvision": 60,
        "proficiencies": {
            "armor": ["light armor"],
            "weapons": ["simple weapons", "hand crossbows", "longswords", "rapiers", "shortswords"],
            "tools": ["lute", "flute", "drum", "disguise kit"],
            "languages": ["Common", "Elvish", "Halfling"],
        },
        "attackList": [
            atk("Rapier", 4, "1d8+2", "piercing", "finesse"),
            atk("Vicious Mockery", 0, "1d4", "psychic", "Wis DC 13; 60 ft.; on a fail, also disadvantage on its next attack"),
        ],
        "bonusActions": ["Bardic Inspiration (d6, 3/long rest): give a creature within 60 ft. a d6 to add to one check, save, or attack within 10 minutes."],
        "reactions": ["Cutting Words: when a creature you can see within 60 ft. makes an attack, check, or damage roll, spend Bardic Inspiration to subtract 1d6 (before the result)."],
        "spellcasting": {
            "ability": "Charisma", "saveDC": 13, "attack": 5,
            "slots": {"1": 4, "2": 3}, "focus": "lute",
            "prepareCount": "Known bard spells: 7. Cantrips: 2.",
        },
        "spellList": [
            spell(0, "Mage Hand", "action", "30 ft.", "Spectral hand, 1 minute."),
            spell(1, "Healing Word", "bonus", "60 ft.", "1d4+3 HP."),
            spell(1, "Faerie Fire", "action", "60 ft. (20-ft cube)", "Dex DC 13 or outlined in light. Attacks against it have advantage. Concentration 1 min."),
            spell(1, "Dissonant Whispers", "action", "60 ft.", "Wis DC 13 or 3d6 psychic and use its reaction to move away. Half damage on success."),
            spell(1, "Thunderwave", "action", "self (15-ft cube)", "Con DC 13 or 2d8 thunder and push 10 ft. Half damage on success."),
            spell(2, "Shatter", "action", "60 ft. (10-ft radius)", "Con DC 13, 3d8 thunder, half on success."),
            spell(2, "Hold Person", "action", "60 ft.", "Wis DC 13 or paralyzed. Concentration 1 min."),
            spell(2, "Suggestion", "action", "30 ft.", "Wis DC 13 or follow a reasonable course. Concentration 8 hours."),
            spell(2, "Enhance Ability", "action", "touch", "Concentration 1 hour. Advantage on checks of one ability; extra benefits for Str/Dex/Con."),
        ],
        "featureList": [
            feat("Bardic Inspiration", "Bard 1", "Bonus action, 3/long rest (Cha). d6, 10 minutes, added to one check/save/attack.", "3/long rest"),
            feat("Jack of All Trades", "Bard 2", "+1 (half proficiency) to any ability check that doesn’t already include proficiency."),
            feat("Song of Rest", "Bard 2", "During a short rest, you and allies who hear you regain an extra 1d6 HP if they spend a hit die."),
            feat("Cutting Words", "Lore 3", "Reaction: spend inspiration to subtract 1d6 from an enemy attack, check, or damage within 60 ft."),
            feat("Bonus Proficiencies", "Lore 3", "Three extra skills (already on the sheet)."),
            feat("Expertise", "Bard 3", "Double proficiency on Persuasion and Deception (already on the sheet)."),
            feat("Fey Ancestry", "Half-Elf", "Advantage vs charm. Magic cannot put you to sleep. Darkvision 60. +2 Cha / +1 Dex / +1 Con already in scores."),
            feat("By Popular Demand", "Entertainer", "You can always find a place to perform; free lodging at the inn where you perform."),
        ],
        "equipment": [{"name": "Studded leather"}, {"name": "Rapier"}, {"name": "Lute"}, {"name": "Diplomat’s pack"}],
        "gp": 16,
        "personality": {"trait": "Fills silences so other people do not have to.", "ideal": "A story that needs a cage is the wrong story.", "bond": "A song unfinished because the subject forgot their name.", "flaw": "Cannot resist an audience."},
        "appearance": "Half-elf, sharp cheekbones, a lute case scarred by weather.",
    }
    return finish(pc)


def bram():
    scores = {"STR": 10, "DEX": 12, "CON": 14, "INT": 10, "WIS": 16, "CHA": 8}
    sk = skills(scores, ["nature", "survival", "perception", "medicine"])
    pc = {
        "id": "pregen-bram", "name": "Bram Willow", "className": "Druid", "subclass": "Circle of the Land (Forest)",
        "race": "Human", "background": "Hermit", "role": "Control and utility caster", "recommended": False,
        "portrait": "", "alignment": "Neutral",
        "scores": scores, "saveMap": saves(scores, ["INT", "WIS"]), "skillsMap": sk, "skills": sk,
        "ac": 16, "acNotes": "hide 12 + Dex 1 + shield 2", "initiative": 1,
        "speedFt": 30, "hp": 31, "hitDice": "4d8", "darkvision": 0,
        "proficiencies": {
            "armor": ["light", "medium", "shields (nonmetal)"],
            "weapons": ["clubs", "daggers", "darts", "javelins", "maces", "quarterstaffs", "scimitars", "sickles", "slings", "spears"],
            "tools": ["herbalism kit"],
            "languages": ["Common", "Druidic", "Sylvan"],
        },
        "attackList": [
            atk("Shillelagh staff", 5, "1d8+3", "bludgeoning", "bonus to activate, 1 minute, uses Wis"),
            atk("Produce Flame", 5, "1d8", "fire", "ranged spell 30 ft., or hold as a light"),
        ],
        "bonusActions": ["Shillelagh: bonus, 1 minute, staff is magical 1d8+Wis."],
        "reactions": [],
        "spellcasting": {
            "ability": "Wisdom", "saveDC": 13, "attack": 5,
            "slots": {"1": 4, "2": 3}, "focus": "druidic focus",
            "prepareCount": "Wis + level = 7, plus Forest circle spells always prepared.",
        },
        "spellList": [
            spell(0, "Produce Flame", "action", "30 ft.", "Light, or hurl +5 / 1d8 fire."),
            spell(0, "Shillelagh", "bonus", "touch", "Staff 1d8+3 magical bludgeoning, 1 minute."),
            spell(0, "Guidance", "action", "touch", "Concentration 1 min. +1d4 to one check."),
            spell(1, "Entangle", "action", "90 ft. (20-ft square)", "Str DC 13 or restrained. Difficult terrain. Concentration 1 min."),
            spell(1, "Goodberry", "action", "touch", "10 berries, 1 HP each."),
            spell(1, "Healing Word", "bonus", "60 ft.", "1d4+3 HP."),
            spell(1, "Thunderwave", "action", "self (15-ft cube)", "Con DC 13 or 2d8 thunder and push 10 ft."),
            spell(2, "Moonbeam", "action", "120 ft.", "Concentration 1 min. 5-ft cylinder, Con DC 13 or 2d10 radiant when it appears and when they enter/end turn. Wild Shape creatures have disadvantage."),
            spell(2, "Spike Growth", "action", "150 ft. (20-ft radius)", "Concentration 10 min. Difficult terrain; 2d4 piercing per 5 ft. moved."),
            spell(2, "Pass without Trace", "action", "self", "Concentration 1 hour. You and allies within 30 ft. +10 Stealth; no tracks."),
            spell(2, "Heat Metal", "action", "60 ft.", "Concentration 1 min. 2d8 fire to a metal object; Con DC 13 or drop it. Bonus action to re-deal."),
            spell(2, "Barkskin", "action", "touch", "Forest circle. Concentration 1 hour. AC cannot be less than 16."),
            spell(2, "Spider Climb", "action", "touch", "Forest circle. Concentration 1 hour. Walk on walls and ceilings."),
        ],
        "featureList": [
            feat("Wild Shape", "Druid 2", "2/short rest. Beast CR 1/2, no fly, up to 2 hours. You keep Wis/Int/Cha, gain beast HP/AC.", "2/short rest"),
            feat("Natural Recovery", "Land 2", "1/long rest, after a short rest, recover slot levels totaling 2.", "1/long rest"),
            feat("Circle Spells (Forest)", "Land 3", "Barkskin and Spider Climb always prepared, do not count against prepares."),
            feat("Discovery", "Hermit", "The quiet seclusion of your hermitage gave you a unique and powerful discovery — here: you can always find potable water if it exists within a mile."),
        ],
        "equipment": [{"name": "Hide armor"}, {"name": "Shield (wood)"}, {"name": "Quarterstaff"}, {"name": "Druidic focus"}, {"name": "Explorer’s pack"}],
        "gp": 12,
        "personality": {"trait": "Listens to wells the way other people listen to sermons.", "ideal": "What grows back is the only honest miracle.", "bond": "A grove cut for lantern-oil.", "flaw": "Will not burn wood if a spell can do the work."},
        "appearance": "Human, moss-stained cloak, staff of living willow.",
    }
    return finish(pc)


def sora():
    scores = {"STR": 10, "DEX": 16, "CON": 14, "INT": 10, "WIS": 16, "CHA": 8}
    sk = skills(scores, ["acrobatics", "stealth", "insight", "athletics"])
    pc = {
        "id": "pregen-sora", "name": "Sora Palewalk", "className": "Monk", "subclass": "Way of the Open Hand",
        "race": "Human", "background": "Hermit", "role": "Mobile striker", "recommended": False,
        "portrait": "", "alignment": "Lawful Neutral",
        "scores": scores, "saveMap": saves(scores, ["STR", "DEX"]), "skillsMap": sk, "skills": sk,
        "ac": 16, "acNotes": "Unarmored Defense 10+Dex 3+Wis 3", "initiative": 3,
        "speedFt": 40, "hp": 31, "hitDice": "4d8", "darkvision": 0,
        "proficiencies": {
            "armor": [],
            "weapons": ["simple weapons", "shortswords"],
            "tools": ["flute", "herbalism kit"],
            "languages": ["Common", "Elvish"],
        },
        "attackList": [
            atk("Unarmed strike", 5, "1d4+3", "bludgeoning", "Martial Arts: bonus unarmed after an attack"),
            atk("Dart", 5, "1d4+3", "piercing", "thrown 20/60"),
        ],
        "bonusActions": [
            "Martial Arts: one unarmed strike after you attack.",
            "Ki (4 points): Flurry of Blows (2 unarmed), Patient Defense (Dodge), Step of the Wind (Dash or Disengage, jump distance doubled).",
        ],
        "reactions": ["Deflect Missiles: reduce ranged weapon damage by 1d10+7. If you reduce to 0, spend 1 ki to throw it back (+5, 1d4+3)."],
        "featureList": [
            feat("Unarmored Defense", "Monk 1", "AC = 10 + Dex + Wis while not wearing armor or a shield (16)."),
            feat("Martial Arts", "Monk 1", "Dex for monk weapons and unarmed. Unarmed 1d4. Bonus unarmed after an attack."),
            feat("Ki", "Monk 2", "4 points, short rest. Save DC 13 (8+PB+Wis).", "4 ki"),
            feat("Unarmored Movement", "Monk 2", "+10 ft. speed while unarmored (40)."),
            feat("Deflect Missiles", "Monk 3", "Reaction: reduce ranged weapon damage by 1d10 + Dex + monk level (1d10+7)."),
            feat("Open Hand Technique", "Open Hand 3", "When you hit with Flurry, choose: Dex DC 13 or prone; Str DC 13 or push 15 ft.; or it cannot take reactions until the end of your next turn."),
            feat("Slow Fall", "Monk 4", "Reaction: reduce fall damage by 20 (5 × monk level)."),
            feat("Discovery", "Hermit", "You know a quiet path into any walled town if you have a day to watch it."),
        ],
        "equipment": [{"name": "Darts", "qty": 10}, {"name": "Explorer’s pack"}],
        "gp": 8,
        "personality": {"trait": "Counts breaths instead of counting coin.", "ideal": "Do not hold what you cannot carry.", "bond": "A teacher who walked into mist and did not walk out.", "flaw": "Will not strike a turned back, even a guilty one."},
        "appearance": "Human, cropped hair, bare forearms, rain on old scars.",
    }
    return finish(pc)


def vexa():
    scores = {"STR": 10, "DEX": 14, "CON": 16, "INT": 8, "WIS": 10, "CHA": 16}
    sk = skills(scores, ["arcana", "intimidation", "persuasion", "insight"])
    pc = {
        "id": "pregen-vexa", "name": "Vexa Ember", "className": "Sorcerer", "subclass": "Draconic Bloodline (Red)",
        "race": "Dragonborn (red)", "background": "Folk Hero", "role": "Burst damage", "recommended": False,
        "portrait": "", "alignment": "Chaotic Good",
        "scores": scores, "saveMap": saves(scores, ["CON", "CHA"]), "skillsMap": sk, "skills": sk,
        "ac": 15, "acNotes": "Draconic Resilience 13 + Dex 2", "initiative": 2,
        "speedFt": 30, "hp": 34, "hitDice": "4d6", "darkvision": 0,
        "proficiencies": {
            "armor": [],
            "weapons": ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"],
            "tools": ["smith’s tools", "land vehicles"],
            "languages": ["Common", "Draconic"],
        },
        "attackList": [
            atk("Fire Bolt", 5, "1d10", "fire", "ranged spell 120 ft."),
            atk("Breath Weapon", 0, "2d6", "fire", "1/short rest; 15-ft cone; Dex DC 13; half on success"),
        ],
        "bonusActions": ["Quickened Spell (2 sorcery points): cast a 1-action spell as a bonus action."],
        "reactions": ["Shield if known — not on her known list. She uses cover."],
        "spellcasting": {
            "ability": "Charisma", "saveDC": 13, "attack": 5,
            "slots": {"1": 4, "2": 3}, "focus": "arcane focus",
            "prepareCount": "Known: 5 spells, 4 cantrips. Sorcery points: 4.",
        },
        "spellList": [
            spell(0, "Fire Bolt", "action", "120 ft.", "+5, 1d10 fire."),
            spell(0, "Prestidigitation", "action", "10 ft.", "Tiny trick."),
            spell(0, "Light", "action", "touch", "20/20 light, 1 hour."),
            spell(0, "Mage Hand", "action", "30 ft.", "Spectral hand."),
            spell(1, "Burning Hands", "action", "self (15-ft cone)", "Dex DC 13, 3d6 fire, half on success."),
            spell(1, "Magic Missile", "action", "120 ft.", "3 darts, 1d4+1 force, auto-hit."),
            spell(1, "Shield", "reaction", "self", "+5 AC until your next turn starts. Stops Magic Missile."),
            spell(2, "Scorching Ray", "action", "120 ft.", "3 rays, +5, 2d6 fire each."),
            spell(2, "Shatter", "action", "60 ft. (10-ft radius)", "Con DC 13, 3d8 thunder, half on success."),
        ],
        "featureList": [
            feat("Draconic Resilience", "Draconic 1", "AC 13 + Dex when unarmored (15). +1 HP per sorcerer level (in 34)."),
            feat("Dragon Ancestor (Red)", "Draconic 1", "You speak Draconic. Fire is your element. (Elemental Affinity is level 6 — not yet.)"),
            feat("Font of Magic", "Sorcerer 2", "4 sorcery points. Convert points ↔ slots (2 pts = 1st, 3 pts = 2nd).", "4 points"),
            feat("Metamagic: Quickened Spell", "Sorcerer 3", "2 points: a 1-action spell becomes a bonus action."),
            feat("Metamagic: Twinned Spell", "Sorcerer 3", "Points = spell level. Twin a single-target spell that does not target you."),
            feat("Breath Weapon", "Dragonborn", "1/short rest. 15-ft cone fire, Dex DC 13 (8+PB+Con), 2d6, half on success.", "1/short rest"),
            feat("Damage Resistance", "Dragonborn", "Resistance to fire."),
            feat("Rustic Hospitality", "Folk Hero", "Common folk hide you if you are not endangering them."),
        ],
        "equipment": [{"name": "Arcane focus (ember-glass shard)"}, {"name": "Dungeoneer’s pack"}],
        "gp": 19,
        "personality": {"trait": "Keeps her hands warm on purpose.", "ideal": "Fire that you aim is better than fire that you hide in a lantern.", "bond": "A forge that burned down with her name on the lintel.", "flaw": "Scorches first, apologizes if anyone is still standing."},
        "appearance": "Red dragonborn, soot along the scales, a shard of amber at her throat.",
    }
    # Vexa has Shield in spell list - 5 spells: burning hands, magic missile, shield, scorching ray, shatter. Good.
    # reactions should mention Shield
    pc["reactions"] = ["Shield (1st-level slot): +5 AC until the start of your next turn, including against the triggering attack."]
    return finish(pc)


def mael():
    scores = {"STR": 8, "DEX": 14, "CON": 14, "INT": 10, "WIS": 12, "CHA": 16}
    sk = skills(scores, ["deception", "intimidation", "arcana", "investigation"])
    pc = {
        "id": "pregen-mael", "name": "Mael Dusk", "className": "Warlock", "subclass": "The Fiend (Pact of the Tome)",
        "race": "Tiefling", "background": "Charlatan", "role": "Short-rest blaster", "recommended": False,
        "portrait": "", "alignment": "Neutral",
        "scores": scores, "saveMap": saves(scores, ["WIS", "CHA"]), "skillsMap": sk, "skills": sk,
        "ac": 13, "acNotes": "leather 11 + Dex 2", "initiative": 2,
        "speedFt": 30, "hp": 31, "hitDice": "4d8", "darkvision": 60,
        "proficiencies": {
            "armor": ["light armor"],
            "weapons": ["simple weapons"],
            "tools": ["disguise kit", "forgery kit"],
            "languages": ["Common", "Infernal"],
        },
        "attackList": [
            atk("Eldritch Blast", 5, "1d10+3", "force", "Agonizing Blast included; 120 ft.; one beam (two beams at warlock 5)"),
            atk("Dagger", 4, "1d4+2", "piercing", "finesse, thrown 20/60"),
        ],
        "bonusActions": ["Hex (if a slot remains): bonus, concentration 1 hour. +1d6 necrotic vs one target; disadvantage on checks of one ability."],
        "reactions": ["Hellish Rebuke (slot or 1/day racial as 2nd-level): when you take damage, Dex DC 13, 3d10 fire (racial 2nd) or 2d10 if a 1st-equivalent — you only have 2nd-level slots: 3d10, half on success."],
        "spellcasting": {
            "ability": "Charisma", "saveDC": 13, "attack": 5,
            "slots": {"2": 2}, "focus": "arcane focus",
            "prepareCount": "Pact Magic: 2 slots of 2nd level, regain on short rest. 5 known spells. Cantrips: EB + 1 warlock + 3 tome + thaumaturgy racial.",
        },
        "spellList": [
            spell(0, "Eldritch Blast", "action", "120 ft.", "+5, 1d10+3 force (Agonizing Blast). One beam."),
            spell(0, "Minor Illusion", "action", "30 ft.", "Tome cantrip."),
            spell(0, "Guidance", "action", "touch", "Tome cantrip. +1d4 to one check."),
            spell(0, "Mage Hand", "action", "30 ft.", "Tome cantrip."),
            spell(0, "Prestidigitation", "action", "10 ft.", "Warlock cantrip."),
            spell(0, "Thaumaturgy", "action", "30 ft.", "Tiefling racial. Harmless sensory, 1 minute."),
            spell(2, "Hex", "bonus", "90 ft.", "Concentration 1 hour. +1d6 necrotic; disadvantage on chosen ability checks."),
            spell(2, "Armor of Agathys", "action", "self", "1 hour. 10 temp HP (cast at 2nd). Attackers who hit you in melee take 10 cold."),
            spell(2, "Misty Step", "bonus", "self", "Teleport 30 ft. you can see."),
            spell(2, "Hold Person", "action", "60 ft.", "Wis DC 13 or paralyzed. Concentration 1 min."),
            spell(2, "Scorching Ray", "action", "120 ft.", "3 rays, +5, 2d6 fire each."),
            spell(2, "Hellish Rebuke", "reaction", "60 ft.", "When you take damage. Dex DC 13, 3d10 fire at 2nd, half on success. Also 1/day racial as 2nd-level."),
        ],
        "featureList": [
            feat("Pact Magic", "Warlock 1", "2 slots of 2nd level. They return on a short rest. Cha DC 13, +5."),
            feat("Dark One’s Blessing", "Fiend 1", "When you reduce a hostile creature to 0 HP, gain temp HP = Cha mod + warlock level (7)."),
            feat("Eldritch Invocations (2 at level 4)", "Warlock 2", "Agonizing Blast: add Cha to EB damage. Devil’s Sight: 120 ft. vision in magical and nonmagical darkness. (Book of Ancient Secrets is a 5th-level invocation pick — not yet.)"),
            feat("Pact of the Tome", "Warlock 3", "Book of Shadows: three extra cantrips (Guidance, Mage Hand, Minor Illusion)."),
            feat("Infernal Legacy", "Tiefling", "Thaumaturgy at will. Hellish Rebuke 1/day as a 2nd-level spell. Fire resistance. Darkvision 60."),
            feat("False Identity", "Charlatan", "You have a second identity with papers and acquaintances. You can forge documents as long as you have seen an example."),
            feat("Not yet: Dark One’s Own Luck", "Fiend 6", "You do not have this. It arrives at warlock 6. Do not use it."),
        ],
        "equipment": [{"name": "Leather armor"}, {"name": "Dagger"}, {"name": "Book of Shadows"}, {"name": "Arcane focus"}],
        "gp": 20,
        "personality": {"trait": "Keeps the contract in a pocket he can burn.", "ideal": "A bad bargain is still a bargain until you write a better one.", "bond": "A name he sold and wants back.", "flaw": "Will not admit he is afraid of the dark he can see through."},
        "appearance": "Tiefling, ash-grey, a book bound in something that is not leather.",
    }
    return finish(pc)


def main():
    chars = [brann(), pell(), nyx(), ivo(), kael(), hester(), rook(), sable(), bram(), sora(), vexa(), mael()]
    # restore skillsMap after finish overwrote pc["skills"] with a string
    # finish uses pc["skills"] as map then overwrites. Need skillsMap saved inside finish — I set skillsMap before overwrite. Good.
    pack = {
        "schema": "oneshot-forge-character-pack/0.2",
        "ruleset": "5e-2014-srd",
        "level": 4,
        "series": "The Quiet Seals",
        "note": "Table-complete original characters. D&D Beyond cannot import this file. Print sheets.html instead.",
        "recommendedParty": ["pregen-brann", "pregen-pell", "pregen-nyx", "pregen-ivo", "pregen-kael", "pregen-hester"],
        "characters": chars,
    }
    root = Path(__file__).resolve().parents[1]
    out = root / "data/pregens/quiet-seals-level-4-2014-srd.json"
    out.write_text(json.dumps(pack, indent=2) + "\n")
    adv_path = root / "data/adventures/the-lantern-below.oneshot.json"
    adv = json.loads(adv_path.read_text())
    adv["pregens"] = chars
    adv_path.write_text(json.dumps(adv, indent=2) + "\n")
    print("wrote", len(chars), "characters", out.stat().st_size)


if __name__ == "__main__":
    main()
