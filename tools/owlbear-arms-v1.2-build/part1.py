import markdown, re, sys
md=open("repo/docs/OWLBEAR_ARMS_V1_2_REPAIR.md").read()
md=md.split("# 12. Audit disposition")[0].rstrip().rstrip("-").rstrip()
md=re.sub(r"\*\*Status:.*?\n\nThis document supersedes.*?\*\*v1\.2 wins\*\*\.\n","",md,flags=re.S)
md=md.replace("# Right to OwlBear Arms v1.2 — Authoritative Repair Packet","# Part 1 — Rules of Play (v1.2)")
md=md.replace("Production Pass 1 sourcing:","Sourcing:")
md=re.sub(r"(?m)^(?!- |\s*$)(.+)\n(- )",r"\1\n\n\2",md)
body=markdown.markdown(md,extensions=["tables","sane_lists"])
html=f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: letter; margin: 0.7in 0.75in 0.75in; }}
body {{ font-family: 'Carlito','Lato','Helvetica',sans-serif; font-size: 10.5pt; line-height: 1.38; color:#1d1a16; }}
h1 {{ font-size: 17pt; color:#3b2a4a; border-bottom: 2px solid #3b2a4a; padding-bottom: 3px; margin: 20px 0 8px; page-break-after: avoid; }}
h2 {{ font-size: 13pt; color:#3b2a4a; margin: 14px 0 5px; page-break-after: avoid; }}
h3 {{ font-size: 11pt; margin: 10px 0 4px; page-break-after: avoid; }}
table {{ border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 9.5pt; page-break-inside: avoid; }}
th {{ background:#3b2a4a; color:#fff; text-align:left; padding:4px 6px; }}
td {{ border: 1px solid #c9bfb3; padding: 4px 6px; vertical-align: top; }}
blockquote {{ border-left: 4px solid #b5893b; background:#f6efe2; margin: 8px 0; padding: 6px 10px; }}
hr {{ border: 0; border-top: 1px solid #d6cdc1; margin: 14px 0; }}
.cover {{ page-break-after: always; text-align:center; padding-top: 1.6in; }}
.cover h1 {{ border: 0; font-size: 30pt; letter-spacing: 1px; color:#2a1f33; }}
.cover .sub {{ font-size: 13pt; font-style: italic; margin-bottom: 0.4in; }}
.box {{ text-align:left; border:1px solid #c9bfb3; background:#f6efe2; padding: 12px 16px; margin: 0.3in auto 0; max-width: 5.6in; font-size:10.5pt; }}
.box b {{ color:#3b2a4a; }}
.small {{ font-size: 8.5pt; color:#5b534a; margin-top: 0.5in; }}
</style></head><body>
<div class="cover">
<h1>RIGHT TO OWLBEAR ARMS</h1>
<div class="sub">The DM Book · Version 1.2 · Level 6 · 3–6 players (5 heroes provided) · 2014 rules, SRD 5.1</div>
<p>A village needs its magic weapons. A genius owlbear claims them as legal property.<br>A raiding party arrives at sundown.</p>
<div class="box">
<p><b>How this book is organized</b></p>
<p><b>Part 1 — Rules of Play (this part).</b> The single locked chronology, the four-hour preparation clock and Defense Points, Routes A–E, wave timing, wave rosters with XP math, party-size scaling for 3–6 players, quick-run blocks for every enemy, Grubbleclaw's combat block, the custom items, the negotiation rule, and reveal timing.</p>
<p><b>Part 2 — Scenes, NPCs &amp; Dialogue.</b> Every scene, NPC, dialogue bank, ending and cheat sheet, corrected to match Part 1.</p>
<p>If any line in Part 2 ever seems to disagree with Part 1, <b>Part 1 wins</b>.</p>
<p><b>Heroes:</b> five level-6 SRD 5.1 pregenerated heroes are in <i>02_Pregenerated_Heroes</i>.</p>
</div>
<p class="small">The heroes and stat blocks use material from the System Reference Document 5.1 by Wizards of the Coast LLC, available under the Creative Commons Attribution 4.0 International License (CC BY 4.0). This independent adventure is not affiliated with, endorsed by, or sponsored by Wizards of the Coast. Prepared for Light Tower Table Top Guild.</p>
</div>
{body}
</body></html>"""
open("oa12/part1.html","w").write(html)
print("html ok")
