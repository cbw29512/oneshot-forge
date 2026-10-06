window.__statBlocks = window.__statBlocks || {};
function registerStat(name, html) {
  if (!name) return;
  window.__statBlocks[name] = html;
}
function openStat(name) {
  let pop = document.getElementById("stat-pop");
  if (!pop) {
    pop = document.createElement("div");
    pop.id = "stat-pop";
    pop.innerHTML = '<div class="stat-pop-card" role="dialog"><button type="button" class="stat-pop-close">Close</button><div class="stat-pop-body"></div></div>';
    document.body.appendChild(pop);
    pop.addEventListener("click", event => {
      if (event.target === pop || event.target.classList.contains("stat-pop-close")) pop.hidden = true;
    });
  }
  pop.querySelector(".stat-pop-body").innerHTML = window.__statBlocks[name] || "<p>No combat block for " + name + ".</p>";
  pop.hidden = false;
}
document.addEventListener("click", event => {
  const button = event.target.closest(".npc-link");
  if (button) openStat(button.getAttribute("data-stat"));
});
function renderStatAppendix(blocks) {
  let host = document.getElementById("stat-appendix");
  if (!host) {
    host = document.createElement("section");
    host.id = "stat-appendix";
    host.innerHTML = "<h2>Appendix: stat blocks</h2><div class='appendix-grid'></div>";
    (document.querySelector("main") || document.body).appendChild(host);
  }
  host.querySelector(".appendix-grid").innerHTML = blocks.join("") || "<p>No combat blocks.</p>";
}
