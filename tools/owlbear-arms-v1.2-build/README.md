# Right to OwlBear Arms v1.2 bundle build (free, local)

These scripts rebuilt `assets/bundles/right-to-owlbear-arms-v1.2.zip` on 2026-10-06. They were run from a working directory that holds the repo as `repo/`, with output going to `oa12/`.

1. `edit_docx.py`: applies the v1.2 corrections to the v1.1 editable DM packet with python-docx. These cover the chronology and Edra's motive, the SRD stat references, the Part 1 pointers, and the Magistrate's Mantle name. LibreOffice then converts the result (`soffice --headless --convert-to pdf`), which becomes Part 2.
2. `part1.py` + `render_pdf.py`: render `docs/OWLBEAR_ARMS_V1_2_REPAIR.md` to Part 1 with headless Chrome. The two parts are merged with pypdf.
3. `sheets_pdf.py`: prints `sheets.html?pack=owlbear-arms` to the hero PDF.
4. `overlay.py`: corrects the NPC card text. The old strings are removed from the content stream and the new text is drawn in place. The handout's mantle line was replaced the same way.
5. `clue.html`: the v1.2 clue-flow sheet.

Maps and the Grubbleclaw visual are copied unchanged from the preserved v1.1 bundle. `scripts/validate-owlbear-arms-bundle.py` checks the manifest hashes and verifies that the extracted files match.
