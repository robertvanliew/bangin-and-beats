import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "logos"
img = Image.open(src).convert("RGBA")
img = img.crop(img.getbbox())  # trim transparent margin

def fit(im, w):
    r = w / im.width
    return im.resize((w, round(im.height * r)), Image.LANCZOS)

main = fit(img, 1200)
main.quantize(256, method=Image.FASTOCTREE).save(out / "bangin-beats-logo.png", optimize=True)
main.save(out / "bangin-beats-logo.webp", quality=85, method=6)

# favicon / touch icon: square, logo centered on black
for name, size in [("favicon.png", 512), ("apple-touch-icon.png", 180)]:
    sq = Image.new("RGBA", (size, size), (10, 10, 10, 255))
    lg = fit(img, int(size * 0.9))
    sq.alpha_composite(lg, ((size - lg.width) // 2, (size - lg.height) // 2))
    sq.convert("RGB").save(out / name, optimize=True)

og = Image.new("RGBA", (1200, 630), (10, 10, 10, 255))
lg = fit(img, 900)
if lg.height > 560:
    lg = lg.resize((round(lg.width * 560 / lg.height), 560), Image.LANCZOS)
og.alpha_composite(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2))
og.convert("RGB").save(out / "og-image.jpg", quality=85, optimize=True)
print("ok")
