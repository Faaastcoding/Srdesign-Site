#!/usr/bin/env python3
"""
Vectorisation automatique du logo SR Design -> SVG propre pour extrusion 3D.
Chaîne 100% ligne de commande (aucun logiciel graphique manuel).

Dépendances : pip install pillow numpy scipy svgelements  +  apt install potrace

Étapes :
  1. Nettoyage : on part du canal alpha du PNG (fond transparent) pour une
     silhouette nette, insensible aux dégradés/reflets chrome.
  2. Séparation : ouverture morphologique -> on isole la masse épaisse du
     monogramme "SR" et on écarte l'anneau fin + les "circuits" (générés
     ensuite de façon procédurale dans Three.js, bien plus léger).
  3. Tracé : potrace sur une version agrandie/lissée, avec forte simplification
     (turdsize + opttolerance) pour un minimum de points = moins de polygones.
  4. Normalisation : on aplati le transform potrace et on recale le chemin dans
     le repère du logo d'origine (440x204) pour aligner l'anneau procédural.

Sortie : build/logo3d/sr-monogram.svg  (+ le "d" est embarqué dans assets/logo3d.js)
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as ndi
from svgelements import SVG, Path as SPath, Move, Line, Close, CubicBezier, QuadraticBezier

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "logo.png"
OUT_SVG = ROOT / "build" / "logo3d" / "sr-monogram.svg"
TMP = Path("/tmp/logo3d_build"); TMP.mkdir(exist_ok=True)

# Repère du logo d'origine + bbox mesurée du monogramme (pour recaler le tracé).
W, H = 440, 204
LETTERS_BBOX = (116, 77, 320, 174)  # x0,y0,x1,y1


def isolate_letters():
    im = Image.open(SRC).convert("RGBA")
    al = np.asarray(im).astype(np.int32)[..., 3]
    op = al > 40
    filled = ndi.binary_fill_holes(op)              # bouche les reflets chrome
    er = ndi.binary_erosion(filled, iterations=5)   # supprime anneau fin + whiskers
    lbl, n = ndi.label(er)
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    keep = np.zeros_like(er)
    for i, s in enumerate(sizes, 1):
        if s > 150:                                 # écarte points/résidus
            keep |= (lbl == i)
    letters = ndi.binary_dilation(keep, iterations=6)  # restaure l'épaisseur
    letters = ndi.binary_fill_holes(letters)
    letters = ndi.binary_closing(letters, iterations=2)
    return letters


def trace(letters):
    m = Image.fromarray(np.where(letters, 255, 0).astype(np.uint8), "L")
    hi = m.resize((m.width * 3, m.height * 3), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2))
    arr = np.asarray(hi)
    bw = np.where(arr > 110, 0, 255).astype(np.uint8)   # lettres NOIRES sur BLANC
    pbm = TMP / "letters_hi.pbm"
    Image.fromarray(bw, "L").convert("1").save(pbm)
    raw = TMP / "sr_raw.svg"
    subprocess.run(["potrace", str(pbm), "-s", "-o", str(raw),
                    "--turdsize", "40", "--opttolerance", "0.6", "--alphamax", "1.0"], check=True)
    return raw


def normalize(raw_svg):
    svg = SVG.parse(str(raw_svg))
    paths = [SPath(e) for e in svg.elements() if isinstance(e, SPath)]
    X0 = Y0 = 1e9; X1 = Y1 = -1e9
    for p in paths:
        b = p.bbox(); X0 = min(X0, b[0]); Y0 = min(Y0, b[1]); X1 = max(X1, b[2]); Y1 = max(Y1, b[3])
    tx0, ty0, tx1, ty1 = LETTERS_BBOX
    sx = (tx1 - tx0) / (X1 - X0); sy = (ty1 - ty0) / (Y1 - Y0)
    mx = lambda x: tx0 + (x - X0) * sx
    my = lambda y: ty0 + (y - Y0) * sy

    def emit(p):
        d = []
        for seg in p:
            if isinstance(seg, Move):   d.append(f"M{mx(seg.end.x):.2f},{my(seg.end.y):.2f}")
            elif isinstance(seg, Line): d.append(f"L{mx(seg.end.x):.2f},{my(seg.end.y):.2f}")
            elif isinstance(seg, Close):d.append("Z")
            elif isinstance(seg, CubicBezier):
                d.append(f"C{mx(seg.control1.x):.2f},{my(seg.control1.y):.2f} "
                         f"{mx(seg.control2.x):.2f},{my(seg.control2.y):.2f} "
                         f"{mx(seg.end.x):.2f},{my(seg.end.y):.2f}")
            elif isinstance(seg, QuadraticBezier):
                d.append(f"Q{mx(seg.control.x):.2f},{my(seg.control.y):.2f} "
                         f"{mx(seg.end.x):.2f},{my(seg.end.y):.2f}")
        return "".join(d)

    return " ".join(emit(p) for p in paths)


def main():
    if not SRC.exists():
        sys.exit(f"Introuvable : {SRC}")
    letters = isolate_letters()
    raw = trace(letters)
    d = normalize(raw)
    OUT_SVG.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
        f'<path fill="#0b1220" d="{d}"/></svg>\n')
    print(f"OK -> {OUT_SVG}  ({len(d)} caractères de chemin, {d.count('M')} sous-chemins)")
    print("   Colle ce 'd' dans SR_PATH de assets/logo3d.js si tu régénères.")


if __name__ == "__main__":
    main()
