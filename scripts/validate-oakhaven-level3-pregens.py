#!/usr/bin/env python3
"""Certification for the 2014 Oakhaven level-3 pregen tranche."""
from __future__ import annotations
import json, logging, subprocess, sys
from pathlib import Path

LOG = logging.getLogger("validate_oakhaven_pregens")
ROOT = Path(__file__).resolve().parents[1]
ABILITIES = {"STR","DEX","CON","INT","WIS","CHA"}
SKILLS = {"acrobatics","animal handling","arcana","athletics","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleight of hand","stealth","survival"}

def require(ok, message):
    if not ok:
        raise AssertionError(message)

def main() -> int:
    try:
        subprocess.run([sys.executable, str(ROOT/"scripts/compile-pregen-progression.py")], cwd=ROOT, check=True)
        path = ROOT/"data/pregens/oakhaven-level-3-2014-srd.json"
        pack = json.loads(path.read_text())
        require(pack["ruleset"] == "5e-2014-srd" and pack["level"] == 3, "edition/level drift")
        require(len(pack["characters"]) == 4, "Oakhaven needs four certified pregens")
        for pc in pack["characters"]:
            require(pc["level"] == 3 and pc["portrait"].startswith("assets/pregens/"), f'{pc["id"]}: identity/portrait')
            require(set(pc["saveMap"]) == ABILITIES, f'{pc["id"]}: six saves required')
            require(set(pc["skillsMap"]) == SKILLS, f'{pc["id"]}: 18 skills required')
            require(not any(" 4" in f.get("source","") and f.get("source","").split()[-1] == "4" for f in pc.get("featureList",[])), f'{pc["id"]}: future-level feature leaked')
            require(pc["hitDice"].startswith("3d"), f'{pc["id"]}: hit dice not level 3')
        by = {c["id"]:c for c in pack["characters"]}
        require(by["pregen-brann"]["hp"] == 28 and by["pregen-brann"]["scores"]["CON"] == 14, "Brann progression")
        require(by["pregen-pell"]["spellcasting"]["slots"] == {"1":4,"2":2} and by["pregen-pell"]["spellcasting"]["saveDC"] == 12, "Pell level-3 casting")
        require(by["pregen-nyx"]["scores"]["DEX"] == 14 and by["pregen-nyx"]["ac"] == 14, "Nyx pre-ASI progression")
        require(by["pregen-ivo"]["spellcasting"]["slots"] == {"1":4,"2":2} and all(s["name"] != "Shatter" for s in by["pregen-ivo"]["spellList"]), "Ivo level-3 spellbook")
        LOG.info("2014 Oakhaven level-3 pregen tranche certified")
        return 0
    except Exception:
        LOG.exception("Oakhaven pregen certification failed")
        return 1

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    sys.exit(main())
