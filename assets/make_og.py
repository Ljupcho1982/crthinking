"""Generate the 1200x630 Open Graph social-preview card for CRThinking (Blade Runner theme)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

W, H = 1200, 630
FONTS = r"C:\Windows\Fonts"
def font(name, size): return ImageFont.truetype(os.path.join(FONTS, name), size)

# --- base vertical gradient (deep noir) ---
base = Image.new("RGB", (W, H), (3, 3, 6))
top, bot = (8, 6, 14), (16, 6, 10)
px = base.load()
for y in range(H):
    t = y / H
    r = int(top[0] + (bot[0] - top[0]) * t)
    g = int(top[1] + (bot[1] - top[1]) * t)
    b = int(top[2] + (bot[2] - top[2]) * t)
    for x in range(W):
        px[x, y] = (r, g, b)

# --- neon glow blobs (cyan / magenta / amber) ---
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
def blob(cx, cy, rad, col):
    gd.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=col)
blob(120, 90, 260, (0, 70, 90))       # cyan top-left
blob(1080, 120, 240, (90, 14, 50))    # magenta top-right
blob(620, 640, 380, (90, 40, 12))     # amber bottom
glow = glow.filter(ImageFilter.GaussianBlur(90))
base = Image.blend(base, Image.composite(glow, base, Image.new("L", (W, H), 130)), 0.0)
base = Image.eval(base, lambda v: v)  # noop keep
base = Image.blend(base, glow, 0.0)
img = Image.new("RGB", (W, H))
img.paste(base)
img = Image.blend(img, glow, 0.55)

draw = ImageDraw.Draw(img)

# --- faint scanlines ---
sl = Image.new("L", (W, H), 0)
sd = ImageDraw.Draw(sl)
for y in range(0, H, 3):
    sd.line([(0, y), (W, y)], fill=26)
img = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), img, sl)
draw = ImageDraw.Draw(img)   # rebind after img reassignment

# --- city skyline silhouette at bottom ---
sky = ImageDraw.Draw(img)
import random
random.seed(7)
x = 0
while x < W:
    bw = random.randint(26, 64)
    bh = random.randint(30, 120)
    sky.rectangle([x, H - bh, x + bw - 4, H], fill=(6, 9, 12))
    # a window light
    if random.random() > 0.4:
        c = random.choice([(0, 233, 255), (255, 46, 136), (255, 177, 92)])
        sky.rectangle([x + bw // 2, H - bh + 10, x + bw // 2 + 3, H - bh + 13], fill=c)
    x += bw

def neon_text(xy, text, fnt, fill, glow_cols, anchor="la"):
    # glowing text: blurred coloured copies under a crisp top layer
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.text(xy, text, font=fnt, fill=fill + (255,), anchor=anchor)
    for col, blur in glow_cols:
        g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd2 = ImageDraw.Draw(g)
        gd2.text(xy, text, font=fnt, fill=col + (255,), anchor=anchor)
        g = g.filter(ImageFilter.GaussianBlur(blur))
        img.paste(g, (0, 0), g)
    img.paste(layer, (0, 0), layer)

# --- logo mark: neon hexagon ---
cx, cy, R = 150, 150, 52
pts = [(cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a))) for a in range(-90, 270, 60)]
hexlayer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(hexlayer)
hd.line(pts + [pts[0]], fill=(0, 233, 255, 255), width=5, joint="curve")
hg = hexlayer.filter(ImageFilter.GaussianBlur(7))
img.paste(hg, (0, 0), hg)
img.paste(hexlayer, (0, 0), hexlayer)

# --- text ---
neon_text((226, 118), "CRThinking", font("segoeui.ttf", 86),
          (236, 244, 255), [((0, 233, 255), 14), ((255, 46, 136), 22)])
draw.text((230, 230), "APPLIED  LLM  &  AI  ENGINEERING", font=font("arialbd.ttf", 30),
          fill=(255, 177, 92))
neon_text((60, 320), "Bespoke intelligence,", font("segoeui.ttf", 64),
          (232, 244, 255), [((0, 233, 255), 10), ((255, 46, 136), 16)])
neon_text((60, 398), "built for the few who demand more.", font("segoeui.ttf", 64),
          (232, 244, 255), [((0, 233, 255), 10), ((255, 46, 136), 16)])

draw.text((60, 540), "Fine-tuned local LLMs  ·  Offline voice agents  ·  Domain copilots",
          font=font("arial.ttf", 26), fill=(150, 170, 180))

out = os.path.join(os.path.dirname(__file__), "og-image.png")
img.save(out, "PNG")
print("saved", out, img.size)
