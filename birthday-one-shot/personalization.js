(() => {
  "use strict";

  const STORAGE_KEY = "99centoneshots:birthday-hero-name";
  const DEFAULT_NAME = "Birthday Hero";

  function cleanName(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[^\p{L}\p{M} .'-]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }

  function heroName() {
    try {
      return cleanName(localStorage.getItem(STORAGE_KEY)) || DEFAULT_NAME;
    } catch (error) {
      console.warn("Birthday One Shot could not read personalization", error);
      return DEFAULT_NAME;
    }
  }

  function replaceText(value, name) {
    if (typeof value !== "string") return value;
    return value
      .replaceAll("the Birthday Hero's", `${name}'s`)
      .replaceAll("The Birthday Hero's", `${name}'s`)
      .replaceAll("the Birthday Hero", name)
      .replaceAll("The Birthday Hero", name)
      .replaceAll("Birthday Hero's", `${name}'s`)
      .replaceAll("Birthday Hero", name);
  }

  function personalize(value, name, seen = new WeakSet()) {
    if (typeof value === "string") return replaceText(value, name);
    if (!value || typeof value !== "object") return value;
    if (seen.has(value)) return value;
    seen.add(value);

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        value[i] = personalize(value[i], name, seen);
      }
      return value;
    }

    for (const key of Object.keys(value)) {
      value[key] = personalize(value[key], name, seen);
    }
    return value;
  }

  function applyName(name) {
    const cleaned = cleanName(name) || DEFAULT_NAME;
    if (window.ADVENTURE) personalize(window.ADVENTURE, cleaned);
    document.querySelectorAll("[data-birthday-hero-text]").forEach((node) => {
      node.textContent = replaceText(node.dataset.birthdayHeroText || node.textContent, cleaned);
    });
    const input = document.getElementById("birthday-hero-name");
    if (input) input.value = cleaned === DEFAULT_NAME ? "" : cleaned;
    return cleaned;
  }

  const initialName = heroName();
  applyName(initialName);

  const form = document.getElementById("birthday-hero-form");
  const input = document.getElementById("birthday-hero-name");
  const status = document.getElementById("birthday-hero-status");

  if (form && input) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const cleaned = cleanName(input.value);
      try {
        if (cleaned) localStorage.setItem(STORAGE_KEY, cleaned);
        else localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Birthday One Shot could not save personalization", error);
      }
      window.location.reload();
    });
  }

  const reset = document.getElementById("birthday-hero-reset");
  if (reset) {
    reset.addEventListener("click", () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Birthday One Shot could not reset personalization", error);
      }
      window.location.reload();
    });
  }

  if (status) {
    status.textContent = initialName === DEFAULT_NAME
      ? "Using the default role name until you enter the birthday person's name."
      : `Personalized for ${initialName}. This name is saved only in this browser.`;
  }
})();
