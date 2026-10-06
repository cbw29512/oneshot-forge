import sys
from playwright.sync_api import sync_playwright
url,out,head,foot=sys.argv[1:5]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/google/chrome/chrome")
    pg=b.new_page(); pg.goto(url, wait_until="networkidle")
    pg.emulate_media(media="print")
    kw=dict(path=out,format="Letter",print_background=True,margin={"top":"0.7in","bottom":"0.75in","left":"0.6in","right":"0.6in"})
    if head!="-":
        kw.update(display_header_footer=True,
          header_template=f'<div style="font-size:7pt;color:#777;width:100%;text-align:right;margin-right:0.6in">{head}</div>',
          footer_template=f'<div style="font-size:7pt;color:#777;width:100%;text-align:center">{foot} <span class="pageNumber"></span></div>')
    pg.pdf(**kw); b.close()
print("pdf",out)
