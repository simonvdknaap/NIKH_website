"""Controleert alle .yaml-bestanden in images/ voordat de site gebouwd wordt.

Bij een fout wordt per bestand gemeld wat er mis is (met regelnummer), zodat
je niet hoeft te zoeken welk bestand de build laat mislukken.
"""
import glob
import sys

import yaml

fouten = 0
for pad in sorted(glob.glob("images/*.yaml") + glob.glob("images/*.yml")):
    try:
        with open(pad, encoding="utf-8") as f:
            inhoud = yaml.safe_load(f)
        if inhoud is not None and not isinstance(inhoud, dict):
            raise ValueError("het bestand moet regels hebben als 'titel: ...'")
    except Exception as fout:  # noqa: BLE001
        fouten += 1
        regel = ""
        mark = getattr(fout, "problem_mark", None)
        if mark is not None:
            regel = f" (regel {mark.line + 1})"
        uitleg = getattr(fout, "problem", None) or (str(fout).splitlines()[0] if str(fout) else type(fout).__name__)
        print(f"::error file={pad},line={mark.line + 1 if mark else 1}::{pad}{regel}: {uitleg}")
        print(f"FOUT in {pad}{regel}: {uitleg}")
        print("  Tip: meerdere waarden schrijf je met blokhaken, bijv. materiaal: [\"Brons\", \"Cement\"]")

if fouten:
    print(f"\n{fouten} .yaml-bestand(en) met een fout; de site wordt niet gebouwd.")
    sys.exit(1)
print("Alle .yaml-bestanden zijn in orde.")
