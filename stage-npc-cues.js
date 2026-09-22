// Stage-card NPC portrayal enhancement.
// Keeps roleplay-critical personality and motive beside the NPC's role/voice.
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
          if (!personality && !wants) return "";

          return "<p><b>Run " + escapeHtml(npc.name) + ".</b>" +
            (personality ? " Personality: " + escapeHtml(personality) + "." : "") +
            (wants ? " Wants now: " + escapeHtml(wants) + "." : "") +
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
