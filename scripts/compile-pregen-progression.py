#!/usr/bin/env python3
"""Compile a lower-level pregen pack from an audited progression patch."""
from __future__ import annotations
import json, logging, re, sys
from pathlib import Path

LOG = logging.getLogger("pregen_progression")
ROOT = Path(__file__).resolve().parents[1]
ABIL = {"acrobatics":"DEX","animal handling":"WIS","arcana":"INT","athletics":"STR","deception":"CHA","history":"INT","insight":"WIS","intimidation":"CHA","investigation":"INT","medicine":"WIS","nature":"INT","perception":"WIS","performance":"CHA","persuasion":"CHA","religion":"INT","sleight of hand":"DEX","stealth":"DEX","survival":"WIS"}

def mod(score: int) -> int:
    return (score - 10) // 2

def replace_tree(value, replacements):
    if isinstance(value, str):
        for old, new in replacements.items():
            value = value.replace(old, new)
        return value
    if isinstance(value, list):
        return [replace_tree(v, replacements) for v in value]
    if isinstance(value, dict):
        return {k: replace_tree(v, replacements) for k, v in value.items()}
    return value

def derive(character, spec):
    pc = json.loads(json.dumps(character))
    pc["scores"].update(spec.get("scoreOverrides", {}))
    pc["level"], pc["xp"], pc["hitDice"] = 3, 900, re.sub(r"^4", "3", pc["hitDice"])
    for key in ("hp", "ac", "acNotes"):
        if key in spec: pc[key] = spec[key]
    removed = set(spec.get("removeSources", []))
    pc["featureList"] = [f for f in pc.get("featureList", []) if f.get("source") not in removed and f.get("name") != "Ability Score Improvement"]
    pc["spellList"] = [s for s in pc.get("spellList", []) if s.get("name") not in set(spec.get("removeSpells", []))]
    pc = replace_tree(pc, spec.get("textReplacements", {}))
    if pc.get("spellcasting"):
        sc = pc["spellcasting"]
        if "spellSaveDC" in spec: sc["saveDC"] = spec["spellSaveDC"]
        if "spellAttack" in spec: sc["attack"] = spec["spellAttack"]
        if "slots" in spec: sc["slots"] = spec["slots"]
        if "prepareCount" in spec: sc["prepareCount"] = spec["prepareCount"]
        sc["cantrips"] = [s["name"] for s in pc["spellList"] if s["level"] == 0]
        sc["prepared"] = [s["name"] for s in pc["spellList"] if s["level"] > 0]
    for save, row in pc["saveMap"].items():
        row["bonus"] = mod(pc["scores"][save]) + (2 if row.get("proficient") else 0)
    for name, row in pc["skillsMap"].items():
        row["ability"] = ABIL[name]
        row["bonus"] = mod(pc["scores"][row["ability"]]) + (4 if row.get("expertise") else 2 if row.get("proficient") else 0)
    delta = spec.get("attackBonusDelta", 0)
    for attack in pc.get("attackList", []):
        attack["bonus"] += delta
        for old, new in spec.get("attackDamageText", {}).items():
            attack["damage"] = attack["damage"].replace(old, new)
    pc["initiative"] = mod(pc["scores"]["DEX"])
    pc["passivePerception"] = 10 + pc["skillsMap"]["perception"]["bonus"]
    pc["passiveInsight"] = 10 + pc["skillsMap"]["insight"]["bonus"]
    pc["features"] = [f'{f["name"]}: {f["text"]}' for f in pc.get("featureList", [])]
    return pc

def main() -> int:
    try:
        patch_path = ROOT / "data/pregens/oakhaven-level-3-2014.patch.json"
        patch = json.loads(patch_path.read_text())
        base = json.loads((ROOT / patch["basePack"]).read_text())
        by_id = {c["id"]: c for c in base["characters"]}
        chars = [derive(by_id[cid], patch["characters"][cid]) for cid in patch["party"]]
        out = {"schema":"oneshot-forge-character-pack/0.2","ruleset":patch["ruleset"],"level":3,"series":patch["series"],"note":"Generated from audited progression patch; 2014 only.","recommendedParty":patch["party"],"characters":chars}
        target = ROOT / "data/pregens/oakhaven-level-3-2014-srd.json"
        target.write_text(json.dumps(out, indent=2) + "\n")
        LOG.info("wrote %s with %d characters", target, len(chars))
        return 0
    except Exception:
        LOG.exception("level-3 pregen compilation failed")
        return 1

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    sys.exit(main())
