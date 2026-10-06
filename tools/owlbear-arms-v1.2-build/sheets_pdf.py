from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/google/chrome/chrome")
    pg=b.new_page(); errs=[]
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://localhost:8765/sheets.html?pack=owlbear-arms", wait_until="networkidle")
    pg.evaluate("document.body.dataset.printTarget='all'")
    pg.emulate_media(media="print")
    pg.pdf(path="oa12/heroes.pdf", format="Letter", print_background=True, prefer_css_page_size=True)
    print("names:", pg.eval_on_selector_all(".cs-name, h2", "els=>els.map(e=>e.textContent.trim()).slice(0,12)"), "errors:", errs)
    b.close()
