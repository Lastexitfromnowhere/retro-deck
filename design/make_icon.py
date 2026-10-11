"""
Génère la marque de RETRO-DECK MD-1 : un écran e-paper encadré qui affiche un « 3 », papier sur encre.
Grille de 16 x 16 cases, donc nette à 16 px comme à 1024 px (aucun lissage).

    python design/make_icon.py <dossier de sortie>

Produit : icon.svg, icon-1024.png, favicon.ico (16/32/48), apple-touch-icon.png (180), icon-512.png.
"""
import os
import sys
from PIL import Image

INK = (0x11, 0x11, 0x11)
PAPER = (0xEC, 0xEB, 0xE6)

THREE = [          # le « 3 » en pixels, 5 x 7
    "####.",
    "....#",
    "....#",
    ".###.",
    "....#",
    "....#",
    "####.",
]
GRID = 16


def cells():
    """Cases « papier » de la grille 16 x 16 : le cadre fin de l'écran, le 3 au centre, le petit bouton."""
    out = set()
    for i in range(1, 15):
        out |= {(i, 1), (i, 14), (1, i), (14, i)}
    for dy, row in enumerate(THREE):
        for dx, ch in enumerate(row):
            if ch == "#":
                out.add((5 + dx, 4 + dy))
    out |= {(7, 12), (8, 12)}
    return out


def svg():
    c = cells()
    rects = []
    for y in range(GRID):  # une bande horizontale par suite de cases contiguës
        x = 0
        while x < GRID:
            if (x, y) in c:
                x0 = x
                while x < GRID and (x, y) in c:
                    x += 1
                rects.append(f'<rect x="{x0}" y="{y}" width="{x - x0}" height="1"/>')
            else:
                x += 1
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">'
        '<rect width="16" height="16" fill="#111111"/>'
        '<g fill="#ECEBE6">' + "".join(rects) + "</g></svg>\n"
    )


def render(size):
    img = Image.new("RGB", (GRID, GRID), INK)
    for x, y in cells():
        img.putpixel((x, y), PAPER)
    return img.resize((size, size), Image.NEAREST)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "icon.svg"), "w", encoding="utf-8", newline="\n").write(svg())
    render(1024).save(os.path.join(out, "icon-1024.png"))
    render(512).save(os.path.join(out, "icon-512.png"))
    render(180).save(os.path.join(out, "apple-touch-icon.png"))
    # .ico : chaque taille est rendue séparément depuis la grille (pas de réduction floue)
    render(256).save(os.path.join(out, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("icônes écrites dans", out)
