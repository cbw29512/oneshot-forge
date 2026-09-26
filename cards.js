const CARD_PACKS = {
  "the-lantern-below": "data/adventures/the-lantern-below.oneshot.json",
  "the-well-that-would-not-dry": "data/adventures/the-well-that-would-not-dry.oneshot.json",
  "the-owlbear-egg": "data/adventures/the-owlbear-egg.oneshot.json"
};

function waitImagesThenPrint(root) {
  const imgs = [...(root || document).querySelectorAll("img")];
  const pending = imgs.filter(i => !i.complete);
  let done = false;
  const go = () => { if (done) return; done = true; window.print(); };
  if (!pending.length) { setTimeout(go, 250); return; }
  let n = pending.length;
  const tick = () => { if (--n <= 0) go(); };
  pending.forEach(i => { i.addEventListener("load", tick); i.addEventListener("error", tick); });
  setTimeout(go, 3000);
}

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

function list(items, cls="back-list") {
  if (!Array.isArray(items) || !items.length) return "";
  return '<ul class="' + cls + '">' + items.map(item => '<li>' + esc(item) + '</li>').join("") + '</ul>';
}

function frontBody(card) {
  const image = card.image
    ? '<img class="front-image" src="' + esc(card.image) + '" alt="' + esc(card.imageAlt || card.title) + '" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'
    : "";
  const fallback = '<div class="front-fallback"' + (card.image ? ' hidden' : '') + '>' + esc(card.front || card.title) + '</div>';
  return image + fallback +
    '<div class="front-banner"><small>' + esc(card.frontLabel || card.type || "card") + '</small><strong>' + esc(card.title) + '</strong></div>';
}

function backBody(card) {
  const back = card.back || {};
  return '<div class="back-kicker">' + esc(card.type || "card") + ' · DM back</div>' +
    '<h2>' + esc(card.title) + '</h2>' +
    (back.role ? '<div class="back-block"><h3>Role</h3><p>' + esc(back.role) + '</p></div>' : '') +
    (back.location ? '<div class="back-block"><h3>Where</h3><p>' + esc(back.location) + '</p></div>' : '') +
    (back.stats ? '<div class="statline-card">' + esc(back.stats) + '</div>' : '') +
    (back.dialogue?.length ? '<div class="back-block"><h3>Dialogue / voice</h3>' + list(back.dialogue) + '</div>' : '') +
    (back.rules?.length ? '<div class="back-block"><h3>Checks / rules</h3>' + list(back.rules) + '</div>' : '') +
    (back.dmNotes?.length ? '<div class="back-block"><h3>DM notes</h3>' + list(back.dmNotes) + '</div>' : '');
}

function screenCard(card) {
  return '<button class="flip-card" type="button" aria-label="Flip ' + esc(card.title) + '" aria-pressed="false" data-flipped="false">' +
    '<span class="flip-inner">' +
      '<span class="card-face front">' + frontBody(card) + '</span>' +
      '<span class="card-face back">' + backBody(card) + '</span>' +
    '</span></button>';
}

function printCard(card, side) {
  return '<article class="print-card ' + side + '">' + (side === "front" ? frontBody(card) : backBody(card)) + '</article>';
}

function chunks(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

function mirrorFour(cards) {
  const c = cards.slice();
  return [c[1], c[0], c[3], c[2]].filter(Boolean);
}

function renderPrintDeck(cards) {
  const sheets = [];
  for (const chunk of chunks(cards, 4)) {
    sheets.push('<section class="print-sheet front-sheet">' + chunk.map(card => printCard(card, "front")).join("") + '</section>');
    sheets.push('<section class="print-sheet back-sheet">' + mirrorFour(chunk).map(card => printCard(card, "back")).join("") + '</section>');
  }
  document.getElementById("print-deck").innerHTML = sheets.join("");
}

function printMode(mode) {
  document.body.classList.remove("print-fronts", "print-backs", "print-pairs");
  document.body.classList.add(mode);
  requestAnimationFrame(() => window.print());
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
  document.getElementById("cards-meta").textContent =
    cards.length + " tarot cards · 2.75 × 4.75 in · art fronts · DM backs · mirrored back sheets for alignment.";
  document.getElementById("back-link").href = "run.html?id=" + encodeURIComponent(id);
  document.getElementById("screen-deck").innerHTML = cards.map(screenCard).join("");
  renderPrintDeck(cards);

  document.querySelectorAll(".flip-card").forEach(button => {
    button.addEventListener("click", () => {
      const flipped = button.dataset.flipped !== "true";
      button.dataset.flipped = String(flipped);
      button.setAttribute("aria-pressed", String(flipped));
    });
  });
}

document.getElementById("print-fronts").addEventListener("click", () => printMode("print-fronts"));
document.getElementById("print-backs").addEventListener("click", () => printMode("print-backs"));
document.getElementById("print-all").addEventListener("click", () => printMode("print-pairs"));

loadCards().then(() => {
  if (new URLSearchParams(location.search).get("print") === "1") waitImagesThenPrint();
}).catch(error => {
  document.getElementById("screen-deck").innerHTML = '<div class="card"><b>Could not load cards.</b><p>' + esc(error.message) + '</p></div>';
});
