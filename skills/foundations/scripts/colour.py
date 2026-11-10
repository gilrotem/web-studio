#!/usr/bin/env python3
"""OKLCH <-> sRGB and WCAG 2 contrast. Standard library only. Run with: python -I colour.py ...

  python -I colour.py oklch  #0076A7 #112A43          hex -> oklch()
  python -I colour.py ratio  #112A43 #FFFFFF          one contrast ratio
  python -I colour.py table  colours.json pairs.json  a contrast table in Markdown

`colours.json` is {"role": "#hex", ...}. `pairs.json` is a list of
{"text": "role", "grounds": ["role", ...], "use": "what the role is for"}.
The table marks each ratio: body (>= 4.5), large/UI only (>= 3), or NOT ALLOWED (< 3).

Import it from a sheet builder to print the numbers the sheet shows:
  from colour import contrast, hex_to_oklch, fmt
"""
import json
import math
import sys


def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin_to_srgb(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return '#%02X%02X%02X' % tuple(max(0, min(255, round(c * 255))) for c in rgb)


def rgb_to_oklab(rgb):
    r, g, b = [srgb_to_lin(c) for c in rgb]
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    return (0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_)


def oklab_to_rgb(lab):
    L, a, b = lab
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return tuple(lin_to_srgb(max(0, min(1, c))) for c in (r, g, bb))


def hex_to_oklch(h):
    L, a, b = rgb_to_oklab(hex_to_rgb(h))
    return (L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360)


def oklch_to_hex(L, C, H):
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    return rgb_to_hex(oklab_to_rgb((L, a, b)))


def lum(h):
    r, g, b = [srgb_to_lin(c) for c in hex_to_rgb(h)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def over(fg, bg, alpha):
    """The opaque colour of `fg` at `alpha` over `bg` (for hover fades and scrims)."""
    f, g = hex_to_rgb(fg), hex_to_rgb(bg)
    return rgb_to_hex(tuple(alpha * x + (1 - alpha) * y for x, y in zip(f, g)))


def fmt(L, C, H):
    return f"oklch({L * 100:.1f}% {C:.3f} {H:.1f})"


def verdict(r):
    return "body" if r >= 4.5 else ("large/UI only" if r >= 3 else "NOT ALLOWED")


def table(colours, pairs):
    out = ["| Text role | Ground | Ratio | Passes as | Use |", "|---|---|---|---|---|"]
    for p in pairs:
        for g in p["grounds"]:
            r = contrast(colours[p["text"]], colours[g])
            out.append(f"| {p['text']} | {g} | {r:.2f} | {verdict(r)} | {p.get('use', '')} |")
    return "\n".join(out)


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == 'oklch':
        for h in a[1:]:
            print(h, fmt(*hex_to_oklch(h)))
    elif len(a) == 3 and a[0] == 'ratio':
        r = contrast(a[1], a[2])
        print(f"{a[1]} on {a[2]}: {r:.2f} ({verdict(r)})")
    elif len(a) == 3 and a[0] == 'table':
        with open(a[1], encoding='utf-8') as f:
            colours = json.load(f)
        with open(a[2], encoding='utf-8') as f:
            pairs = json.load(f)
        print(table(colours, pairs))
    else:
        print(__doc__)
        sys.exit(1)
