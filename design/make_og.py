"""
Génère la vignette de partage (Discord, X, etc.) : 1200 x 630, e-paper, papier sur encre.
    python design/make_og.py <fichier.png>
Utilise Consolas si elle est présente (Windows), sinon une police monospace du système.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

INK, PAPER, GREY = (0x11, 0x11, 0x11), (0xEC, 0xEB, 0xE6), (0x8A, 0x89, 0x84)
W, H = 1200, 630

CELLS = None


def icon_cells():
    """Même marque que make_icon.py : écran e-paper encadré avec un « 3 » en pixels."""
    three = ["####.", "....#", "....#", ".###.", "....#", "....#", "####."]
    c = set()
    for i in range(1, 15):
        c |= {(i, 1), (i, 14), (1, i), (14, i)}
    for dy, row in enumerate(three):
        for dx, ch in enumerate(row):
            if ch == "#":
                c.add((5 + dx, 4 + dy))
    c |= {(7, 12), (8, 12)}
    return c


def font(bold, size):
    names = (["consolab.ttf", "DejaVuSansMono-Bold.ttf", "LiberationMono-Bold.ttf"] if bold
             else ["consola.ttf", "DejaVuSansMono.ttf", "LiberationMono-Regular.ttf"])
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main(out):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # bloc d'encre à gauche avec la marque
    d.rectangle([0, 0, 440, H], fill=INK)
    mark = Image.new("RGB", (16, 16), INK)
    for x, y in icon_cells():
        mark.putpixel((x, y), PAPER)
    img.paste(mark.resize((352, 352), Image.NEAREST), (44, 139))

    # ombre dure derrière le texte, façon fenêtre e-paper
    left = 500
    d.rectangle([left + 10, 70 + 10, W - 50 + 10, 470 + 10], fill=INK)
    d.rectangle([left, 70, W - 50, 470], fill=PAPER, outline=INK, width=5)
    d.rectangle([left, 70, W - 50, 112], fill=INK)
    d.text((left + 20, 78), "RETRO-DECK MD-1", font=font(True, 28), fill=PAPER)
    d.text((W - 50 - 20, 80), "WINDOWS", font=font(False, 22), fill=PAPER, anchor="ra")

    d.text((left + 28, 160), "Three tasks.", font=font(True, 72), fill=INK)
    d.text((left + 28, 246), "A clearer day.", font=font(True, 72), fill=INK)
    d.line([left + 28, 372, W - 78, 372], fill=INK, width=3)
    d.text((left + 28, 394), "Trois tâches. Une journée plus claire.", font=font(False, 25), fill=INK)
    d.text((left + 28, 436), "Planning · focus · notes .md · fiches de révision", font=font(False, 19), fill=GREY)

    # bandeau du bas
    d.rectangle([440, 520, W, H], fill=INK)
    d.text((left, 548), "NO ACCOUNT. NO CLOUD. NO RENT.", font=font(True, 34), fill=PAPER)
    d.text((left, 592), "retrodeck.lastparadox.dev", font=font(False, 22), fill=PAPER)

    img.save(out, optimize=True)
    print("vignette écrite :", out, os.path.getsize(out), "octets")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "og-image.png")
