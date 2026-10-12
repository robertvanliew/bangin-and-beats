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

# smaller variants for the nav (~160px shown), footer and hero (~380px shown)
for w in (320, 480, 800):
    v = fit(img, w)
    v.save(out / f"bangin-beats-logo-{w}.webp", quality=86, method=6)
    v.quantize(256, method=Image.FASTOCTREE).save(out / f"bangin-beats-logo-{w}.png", optimize=True)

# favicon: transparent square, logo only, filling the width (browser tabs).
fav = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
lg = fit(img, 252)
fav.alpha_composite(lg, ((256 - lg.width) // 2, (256 - lg.height) // 2))
fav.quantize(256, method=Image.FASTOCTREE).save(out / "favicon.png", optimize=True)

# apple-touch-icon: iOS paints transparency black anyway and Apple wants it
# opaque, so the home-screen icon keeps the logo on black.
sq = Image.new("RGBA", (180, 180), (10, 10, 10, 255))
lg = fit(img, int(180 * 0.9))
sq.alpha_composite(lg, ((180 - lg.width) // 2, (180 - lg.height) // 2))
sq.convert("RGB").save(out / "apple-touch-icon.png", optimize=True)

og = Image.new("RGBA", (1200, 630), (10, 10, 10, 255))
lg = fit(img, 900)
if lg.height > 560:
    lg = lg.resize((round(lg.width * 560 / lg.height), 560), Image.LANCZOS)
og.alpha_composite(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2))
og.convert("RGB").save(out / "og-image.jpg", quality=85, optimize=True)
print("ok")
