/* OwlBear Arms live sheet state. Canonical character values remain in the pregen JSON. */
(function (root) {
  "use strict";

  // Schema: one mutable session record per character; never write into source data.
  // slotsUsed counts expended slots at each published spell level.
  const STORE_KEY = "oneshot-forge:owlbear-arms:live:v1.2";
  function integer(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.trunc(number))) : fallback;
  }
  function fresh(pc) {
    const slotsUsed = {};
    for (const level of Object.keys(pc.spellcasting?.slots || {})) slotsUsed[level] = 0;
    return { currentHp: integer(pc.hp, 0, 9999, 0), tempHp: 0, slotsUsed,
      deathSuccesses: 0, deathFailures: 0, inspiration: false, concentrating: false };
  }
  function normalize(pc, candidate) {
    try {
      const baseline = fresh(pc);
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return baseline;
      const slotsUsed = {};
      for (const [level, maximum] of Object.entries(pc.spellcasting?.slots || {})) {
        slotsUsed[level] = integer(candidate.slotsUsed?.[level], 0, maximum, 0);
      }
      return {
        currentHp: integer(candidate.currentHp, 0, baseline.currentHp, baseline.currentHp),
        tempHp: integer(candidate.tempHp, 0, 999, 0), slotsUsed,
        deathSuccesses: integer(candidate.deathSuccesses, 0, 3, 0),
        deathFailures: integer(candidate.deathFailures, 0, 3, 0),
        inspiration: candidate.inspiration === true,
        concentrating: candidate.concentrating === true
      };
    } catch (error) {
      console.error("OwlBear sheet state could not be read", error);
      return fresh(pc);
    }
  }
  function change(pc, previous, action) {
    const state = normalize(pc, previous);
    try {
      if (!action || typeof action.type !== "string") throw new Error("Missing sheet action");
      const amount = integer(action.amount, 0, 9999, 0);
      switch (action.type) {
        case "damage": {
          // Fifth Edition: temporary HP absorbs damage before ordinary HP.
          const absorbed = Math.min(state.tempHp, amount);
          state.tempHp -= absorbed;
          state.currentHp = Math.max(0, state.currentHp - (amount - absorbed));
          break;
        }
        case "heal": state.currentHp = Math.min(integer(pc.hp, 0, 9999, 0), state.currentHp + amount); break;
        case "temp": state.tempHp = integer(action.amount, 0, 999, state.tempHp); break;
        case "slot-use":
        case "slot-restore": {
          const level = String(action.level || "");
          const max = pc.spellcasting?.slots?.[level];
          if (!Number.isInteger(max)) throw new Error("Unknown spell slot level: " + level);
          const delta = action.type === "slot-use" ? 1 : -1;
          state.slotsUsed[level] = integer(state.slotsUsed[level] + delta, 0, max, 0);
          break;
        }
        case "death-success": state.deathSuccesses = Math.min(3, state.deathSuccesses + 1); break;
        case "death-failure": state.deathFailures = Math.min(3, state.deathFailures + 1); break;
        case "death-reset": state.deathSuccesses = 0; state.deathFailures = 0; break;
        case "inspiration": state.inspiration = !state.inspiration; break;
        case "concentration": state.concentrating = !state.concentrating; break;
        case "reset": return fresh(pc);
        default: throw new Error("Unsupported sheet action: " + action.type);
      }
      return state;
    } catch (error) {
      console.error("OwlBear sheet change rejected", error);
      return state;
    }
  }
  const api = { STORE_KEY, fresh, normalize, change };
  root.OwlbearPlayState = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
