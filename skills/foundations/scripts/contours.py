#!/usr/bin/env python3
"""A seamless contour-line tile as one SVG: periodic hills, an index line every Nth contour.

Needs numpy and scikit-image. Run with: python -I contours.py out/contours.svg [options]

  --size 1920 1080   tile size in px (it repeats seamlessly in both directions)
  --hills 11         number of hills; fewer reads calmer
  --levels 18        number of contour levels; more reads denser
  --index 4          every Nth line is the heavier index line (0 for none)
  --seed 23          change it to get a different terrain; keep it to reproduce one

The SVG is black strokes on nothing. It is used as a CSS mask, never as an image, so the page's
tokens colour it and a second mask (the shape of the light) decides where it shows:

  .field::before { content:''; position:absolute; inset:0; background: var(--relief-line);
    mask-image: url(contours.svg), radial-gradient(50% 80% at 36% 44%, #000 0%, transparent 85%);
    mask-size: var(--relief-tile) auto, 100% 100%; mask-repeat: repeat, no-repeat;
    mask-composite: intersect;
    -webkit-mask-image: url(contours.svg), radial-gradient(50% 80% at 36% 44%, #000 0%, transparent 85%);
    -webkit-mask-size: var(--relief-tile) auto, 100% 100%; -webkit-mask-repeat: repeat, no-repeat;
    -webkit-mask-composite: source-in; }

A texture like this is one option for a field's relief, not a house style. Use it when the
subject has to do with land, measurement or maps; otherwise find the subject's own texture.
"""
import argparse
import math
import random

import numpy as np
from skimage import measure


def main():
    p = argparse.ArgumentParser(description="Seamless contour-line tile (SVG).")
    p.add_argument("out")
    p.add_argument("--size", type=int, nargs=2, default=[1920, 1080])
    p.add_argument("--hills", type=int, default=11)
    p.add_argument("--levels", type=int, default=18)
    p.add_argument("--index", type=int, default=4)
    p.add_argument("--seed", type=int, default=23)
    a = p.parse_args()

    W, H = a.size
    nx, ny = 256, max(8, round(256 * H / W))
    rnd = random.Random(a.seed)
    xs = np.linspace(0, W, nx + 1)
    ys = np.linspace(0, H, ny + 1)
    X, Y = np.meshgrid(xs, ys)
    F = np.zeros_like(X)
    for _ in range(a.hills):
        cx, cy = rnd.uniform(0, W), rnd.uniform(0, H)
        sx, sy = rnd.uniform(.10, .24) * W, rnd.uniform(.10, .24) * W
        th = rnd.uniform(0, math.pi)
        amp = rnd.uniform(.5, 1.0)
        for ox in (-W, 0, W):                          # wrap each hill so the tile is periodic
            for oy in (-H, 0, H):
                dx, dy = X - cx - ox, Y - cy - oy
                u = dx * math.cos(th) + dy * math.sin(th)
                v = -dx * math.sin(th) + dy * math.cos(th)
                F += amp * np.exp(-(u * u / (2 * sx * sx) + v * v / (2 * sy * sy)))
    F = (F - F.min()) / (F.max() - F.min())

    thin, bold = [], []
    for li in range(1, a.levels):
        for c in measure.find_contours(F, li / a.levels):
            if len(c) < 10:
                continue
            d = "M" + " L".join(f"{pt[1] * W / nx:.1f} {pt[0] * H / ny:.1f}" for pt in c[::2])
            if (c[0] == c[-1]).all():
                d += "Z"
            (bold if a.index and li % a.index == 0 else thin).append(f'<path d="{d}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
           f'fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">'
           f'<g stroke-width="1" opacity=".6">{"".join(thin)}</g>'
           f'<g stroke-width="1.7">{"".join(bold)}</g></svg>')
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(svg)
    print(a.out, len(thin), "thin,", len(bold), "index,", len(svg) // 1024, "kB")


if __name__ == "__main__":
    main()
