const RULESET_KEY = "oneshot-forge:ruleset";

function getRuleset() {
  try {
    const q = new URLSearchParams(location.search).get("rules");
    if (q === "2014" || q === "2024") {
      localStorage.setItem(RULESET_KEY, q);
      return q;
    }
    const saved = localStorage.getItem(RULESET_KEY);
    return saved === "2024" ? "2024" : "2014";
  } catch {
    return "2014";
  }
}

function setRuleset(edition) {
  if (edition !== "2014" && edition !== "2024") return;
  try { localStorage.setItem(RULESET_KEY, edition); } catch {}
  const url = new URL(location.href);
  url.searchParams.set("rules", edition);
  location.assign(url.pathname + url.search + url.hash);
}

function mountRulesetToggle(host) {
  if (!host) return;
  const current = getRuleset();
  host.innerHTML =
    '<div class="rules-toggle" role="group" aria-label="Rules edition">' +
    '<button type="button" data-rules="2014">2014 SRD</button>' +
    '<button type="button" data-rules="2024">2024 SRD</button>' +
    "</div>";
  host.querySelectorAll("button").forEach(btn => {
    const on = btn.getAttribute("data-rules") === current;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) btn.classList.add("on");
    btn.addEventListener("click", () => setRuleset(btn.getAttribute("data-rules")));
  });
}

function rulesetLabel() {
  return getRuleset() === "2024" ? "5E 2024 SRD 5.2.1" : "5E 2014 SRD";
}
