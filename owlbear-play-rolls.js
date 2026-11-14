/* Generic d20 rolls for the five OwlBear heroes; no combat outcome is automated. */
(function (root) {
  "use strict";
  // Math: published d20 check = uniformly sampled d20 plus canonical bonus.
  // Rejection sampling removes modulo bias from unsigned 32-bit random values.
  function rollD20() {
    try {
      if (!root.crypto?.getRandomValues) throw new Error("Secure browser random source unavailable");
      const value = new Uint32Array(1);
      const limit = 0x100000000 - (0x100000000 % 20);
      do { root.crypto.getRandomValues(value); } while (value[0] >= limit);
      return 1 + (value[0] % 20);
    } catch (error) {
      console.error("OwlBear d20 roll unavailable", error);
      return null;
    }
  }
  function addRollButton(target, label, bonus) {
    try {
      if (!target || !Number.isFinite(Number(bonus))) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "play-roll-button";
      button.dataset.rollLabel = label;
      button.dataset.rollBonus = String(Number(bonus));
      button.setAttribute("aria-label", "Roll " + label + " with " + (bonus >= 0 ? "+" : "") + bonus + " bonus");
      button.textContent = "d20";
      target.appendChild(button);
    } catch (error) { console.error("Could not mount OwlBear roll button", error); }
  }
  function addSheetRolls(sheet, pc) {
    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    const scores = sheet.querySelectorAll(".beyond-abilities .ab");
    abilities.forEach((key, i) => {
      const score = Number(pc.scores?.[key]);
      if (Number.isFinite(score)) addRollButton(scores[i], key + " check", Math.floor((score - 10) / 2));
    });
    const saves = sheet.querySelectorAll(".beyond-saves .beyond-check");
    abilities.forEach((key, i) => {
      const value = pc.saveMap?.[key]?.bonus;
      if (Number.isFinite(value)) addRollButton(saves[i], key + " save", value);
    });
    for (const row of sheet.querySelectorAll(".beyond-skills .beyond-check")) {
      const name = row.querySelector("span")?.textContent?.trim() || "";
      const value = pc.skillsMap?.[name]?.bonus;
      if (Number.isFinite(value)) addRollButton(row, name + " check", value);
    }
    const attacks = sheet.querySelectorAll(".beyond-attack tbody tr");
    (pc.attackList || []).forEach((attack, i) => {
      if (Number.isFinite(attack.bonus) && !/\b(?:Str|Dex|Con|Int|Wis|Cha)\s+DC\s+\d+/i.test(attack.notes || "")) {
        addRollButton(attacks[i]?.querySelector("td"), attack.name + " attack", attack.bonus);
      }
    });
  }
  function initOwlbearRolls(host, characters) {
    try {
      if (!host || !characters?.length) throw new Error("Missing OwlBear characters");
      for (const pc of characters) {
        const sheet = host.querySelector('.screen-sheet[id="' + pc.id + '"]');
        if (!sheet) throw new Error("Hero sheet not found: " + pc.id);
        addSheetRolls(sheet, pc);
        const result = document.createElement("output");
        result.className = "play-roll-result print-hide";
        result.setAttribute("aria-live", "polite");
        result.textContent = "Click Roll d20 beside an ability, save, skill, or attack.";
        sheet.querySelector(".beyond-combat").insertAdjacentElement("afterend", result);
      }
      host.addEventListener("click", event => {
        try {
          const button = event.target.closest("[data-roll-label][data-roll-bonus]");
          if (!button) return;
          const sheet = button.closest(".screen-sheet");
          const result = sheet?.querySelector(".play-roll-result");
          if (!result) return;
          const die = rollD20();
          if (die === null) { result.textContent = "Browser dice unavailable. Use physical dice."; return; }
          const bonus = Number(button.dataset.rollBonus);
          if (!Number.isFinite(bonus)) throw new Error("Invalid canonical roll bonus");
          const total = die + bonus;
          result.textContent = button.dataset.rollLabel + ": d20 " + die + " " +
            (bonus < 0 ? "− " + Math.abs(bonus) : "+ " + bonus) + " = " + total +
            (die === 20 ? " (natural 20)" : die === 1 ? " (natural 1)" : "");
        } catch (error) { console.error("OwlBear d20 interaction failed", error); }
      });
    } catch (error) { console.error("OwlBear roll controls could not start", error); }
  }
  root.initOwlbearRolls = initOwlbearRolls;
})(window);
