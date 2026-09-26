const CARD_PACKS = {
  "the-lantern-below": "data/adventures/the-lantern-below.oneshot.json",
  "the-well-that-would-not-dry": "data/adventures/the-well-that-would-not-dry.oneshot.json",
  "the-owlbear-egg": "data/adventures/the-owlbear-egg.oneshot.json"
};

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

function renderCard(card, side) {
  const back = card.back || {};
  if (side === "front") {
    return '<article class="print-card card-front">' +
      '<p class="eyebrow">' + esc(card.type || "card") + ' · front</p>' +
      '<h2>' + esc(card.title) + '</h2>' +
      '<div class="front-art">' + esc(card.front || "") + '</div>' +
      '<p class="tiny">One-Shot Forge · ' + esc(card.id) + '</p>' +
      '</article>';
  }
  const rules = (back.rules || []).map(rule => '<li>' + esc(rule) + '</li>').join("");
  return '<article class="print-card card-back">' +
    '<p class="eyebrow">' + esc(card.type || "card") + ' · back</p>' +
    '<h2>' + esc(card.title) + '</h2>' +
    (back.role ? '<p><b>Role.</b> ' + esc(back.role) + '</p>' : '') +
    (back.stats ? '<div class="statline-card">' + esc(back.stats) + '</div>' : '') +
    (rules ? '<ul class="back-list">' + rules + '</ul>' : '') +
    '<p class="tiny">One-Shot Forge · ' + esc(card.id) + '</p>' +
    '</article>';
}

async function loadCards() {
  const id = new URLSearchParams(location.search).get("id") || "the-owlbear-egg";
  const url = CARD_PACKS[id];
  if (!url) throw new Error("Unknown adventure card pack.");
  const response = await fetch(url, {cache:"no-store"});
  if (!response.ok) throw new Error("Could not load adventure cards.");
  const adventure = await response.json();
  const cards = adventure.cards || [];
  if (!cards.length) throw new Error("This adventure has no printable card set yet.");
  document.title = adventure.metadata.title + " Cards — One-Shot Forge";
  document.getElementById("cards-title").textContent = adventure.metadata.title + " — Cards";
  document.getElementById("cards-meta").textContent = cards.length + " tarot-size cards · fronts and backs shown side by side";
  document.getElementById("back-link").href = "run.html?id=" + encodeURIComponent(id);
  document.getElementById("card-pairs").innerHTML = cards.map(card =>
    '<div class="pair-label">' + esc(card.title) + '</div>' + renderCard(card, "front") + renderCard(card, "back")
  ).join("");
}

document.getElementById("print-cards").addEventListener("click", () => window.print());
loadCards().catch(error => {
  document.getElementById("card-pairs").innerHTML = '<div class="card"><b>Could not load cards.</b><p>' + esc(error.message) + '</p></div>';
});
