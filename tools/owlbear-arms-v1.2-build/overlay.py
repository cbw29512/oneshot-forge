import io, sys
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
H=792
def make(edits, src, out, blank=None):
    blank=blank or {}
    """edits: {page_index: [(x0,yTop,x1,yBottom, text, size, maxlines|None)]}  coords top-left"""
    r=PdfReader(src); w=PdfWriter()
    for i,page in enumerate(r.pages):
        if i in blank:
            from pypdf.generic import ContentStream, TextStringObject, NameObject
            cs=ContentStream(page.get_contents(),r); n=0
            for k,(o,op) in enumerate(cs.operations):
                if op==b"Tj" and any(str(o[0]).startswith(pfx) for pfx in blank[i]):
                    cs.operations[k]=([TextStringObject("")],op); n+=1
            page.replace_contents(cs); print("page",i,"blanked",n)
        if i in edits:
            buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=(612,H))
            for (x0,y0,x1,y1,text,size,lead,font) in edits[i]:
                c.setFillColorRGB(1,1,1); c.rect(x0-1,H-y1-1.5,x1-x0+2,y1-y0+2.5,stroke=0,fill=1)
                if text:
                    c.setFillColorRGB(0,0,0); c.setFont(font,size)
                    lines=simpleSplit(text,font,size,x1-x0)
                    y=H-y0-size*0.95
                    for ln in lines: c.drawString(x0,y,ln); y-=lead
            c.save(); buf.seek(0)
            page.merge_page(PdfReader(buf).pages[0])
        w.add_page(page)
    w.add_metadata({"/Title":"Right to OwlBear Arms v1.2"})
    with open(out,"wb") as f: w.write(f)
    print("wrote",out)
F="Helvetica"
foot=lambda: (200,773,412,782,"Right to OwlBear Arms v1.2 NPC Cards - duplex, flip on short edge",6.5,8.4,F)
# NPC cards
B="repo/assets/bundles/owlbear-arms/05_NPC_Cards/Right_To_Bear_Arms_NPC_Cards_Duplex.pdf"
E={0:[foot()],1:[foot(),
 (370,512.5,578,537,"I saw the smoke. Then the chirping. Like little birds. / We split up near the lair. When I found Tomas, it wasn't claws.",6.5,8.4,F),
 (370,564.3,578,589,"Tomas survived the camp raid. He died two days ago in the woods at raider hands, carrying proof of Edra's betrayal. Cobb blames the owlbear at first.",6.5,8.4,F),
 (370,616.1,578,641,"Provides the crude survivor map and, if pressed, the truth: blade wounds, coat cut open. Knows the hills, cave chirps, and safe paths.",6.5,8.4,F),
 (370,668.0,578,693,"Give the party the map. His news about Tomas breaks Edra's cover. Guide them toward the safest paths and lair.",6.5,8.4,F)],
 2:[foot(),(447,457,579,473,"Genius owlbear - strategist, self-appointed magistrate",6.5,8.4,F)],
 3:[foot(),
 (82.8,135.2,290,159,"South gate. It is the weak point. / One patrol rotation. That's all it was, the first time.",6.5,8.4,F),
 (82.8,187.0,290,211,"Actual traitor. Sold the raiders patrol routes, then fed her brother Tomas false leads to hide it. Does not know he is dead.",6.5,8.4,F)]}
FT="Right To Bear Arms NPC Cards - FINAL"
BL={0:[FT],1:[FT,"I saw the smoke. Then the chirping. Like little birds. / Tomas","is dead. Died months","Tomas Vell died in the original","with a corpse","Provides the crude survivor map and the truth","Knows the hills, cave chirps","Give the party the map. Reveal","motive. Guide them"],
 2:[FT,"INT 19 owlbear","magistrate"],3:[FT,"South gate. It is the weak point. / He sent","Wrapped around his ring","Actual traitor. She fed","he is already dead"]}
make(E,B,"oa12/npc_cards_v1.2.pdf",BL)
