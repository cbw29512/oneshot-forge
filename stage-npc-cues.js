// Stage-card NPC portrayal enhancement.
// Keeps roleplay-critical personality, motive, fear, and reveal timing beside the NPC's role/voice.
(() => {
  "use strict";

  try {
    if (typeof dmBoxHtml !== "function") {
      console.error("Stage NPC cues: dmBoxHtml is unavailable.");
      return;
    }

    const baseDmBoxHtml = dmBoxHtml;

    dmBoxHtml = function stageNpcDmBoxHtml(scene, bits) {
      try {
        const html = baseDmBoxHtml(scene, bits);
        if (!bits?.npcs?.length) return html;

        const portrayal = bits.npcs.map(npc => {
          const personality = Array.isArray(npc.personality) ? npc.personality.filter(Boolean).join(", ") : "";
          const wants = Array.isArray(npc.wants) ? npc.wants.filter(Boolean).join("; ") : "";
          const fears = Array.isArray(npc.fears) ? npc.fears.filter(Boolean).join("; ") : "";
          const reveal = Array.isArray(npc.revealRules) && npc.revealRules.length
            ? npc.revealRules
                .filter(rule => rule?.fact || rule?.when)
                .map(rule => (rule.fact ? rule.fact : "Reveal") + (rule.when ? " — " + rule.when : ""))
                .join("; ")
            : "";
          if (!personality && !wants && !fears && !reveal) return "";

          return "<p><b>Run " + escapeHtml(npc.name) + ".</b>" +
            (personality ? " Personality: " + escapeHtml(personality) + "." : "") +
            (wants ? " Wants now: " + escapeHtml(wants) + "." : "") +
            (fears ? " Fears: " + escapeHtml(fears) + "." : "") +
            (reveal ? " Reveal cue: " + escapeHtml(reveal) + "." : "") +
            "</p>";
        }).filter(Boolean).join("");

        return portrayal ? html + "<p><b>Portrayal at a glance.</b></p>" + portrayal : html;
      } catch (error) {
        console.error("Stage NPC cues: failed to render portrayal cues.", error);
        return baseDmBoxHtml(scene, bits);
      }
    };
  } catch (error) {
    console.error("Stage NPC cues: initialization failed.", error);
  }
})();
