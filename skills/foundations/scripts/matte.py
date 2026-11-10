#!/usr/bin/env python3
"""A studio portrait against a plain backdrop: cut it out, or swap the backdrop for the palette.

Needs numpy, Pillow and scikit-image. Run with: python -I matte.py ...

  python -I matte.py cut  portrait.jpg  out/portrait-cut.webp
  python -I matte.py swap portrait.jpg  out/portrait-regraded.jpg  --lo "#0A3A62" --hi "#377FAC"

cut   Writes an RGBA image. Alpha comes from the colour distance to a smooth model of the
      backdrop; edge pixels have the backdrop colour unmixed out of them, so the cut-out carries
      no halo on a new ground.
swap  Keeps the photograph and replaces the backdrop by difference:
        new = pixel + a_bg * (newBackdrop - backdropModel)
      The new backdrop runs from --lo (where the old one was darkest) to --hi (lightest), so the
      studio light's fall-off survives. Shadows and soft edges survive too.

How the backdrop is found: neutral mid-tone pixels (low saturation, mid luminance) connected to
the top or side borders, eroded hard, then blurred into a smooth model. It therefore expects a
plain, fairly neutral studio backdrop that touches the top and side edges of the frame. Tune:

  --sat 0.14        max saturation counted as backdrop (raise for a tinted backdrop)
  --lum 0.2 0.7     luminance range counted as backdrop
  --t1 0.035 --t2 0.14   the distance ramp: below t1 is backdrop, above t2 is subject
  --sigma 44        blur of the backdrop model, in pixels (lower for small images)
  --debug mask.png  write the backdrop alpha, to see what was taken

Always check the result at full size on a light ground and on a deep ground before use. Hair,
beards, glasses and dark clothing near a dark backdrop are where it fails; if an edge fails, a
dedicated matting model (the `cutout` job of the fal-image skill) is the next tool, and this
script's `swap` can still regrade its backdrop.
"""
import argparse
import sys

import numpy as np
from PIL import Image
from skimage import color as skcolor
from skimage import filters, measure, morphology

LUMA = np.array([.2126, .7152, .0722], dtype=np.float32)


def rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def border_connected(mask):
    """Keep only the components of `mask` that touch the top, left or right edge."""
    lab = measure.label(mask, connectivity=1)
    ids = (set(np.unique(lab[0, :])) | set(np.unique(lab[:, 0])) | set(np.unique(lab[:, -1]))) - {0}
    return np.isin(lab, list(ids))


def backdrop(a, sat_max, lum_lo, lum_hi, t1, t2, sigma):
    """-> (a_bg, model, core): backdrop alpha 0..1, the smooth backdrop colour model, the core mask."""
    lum = a @ LUMA
    sat = skcolor.rgb2hsv(a)[..., 1]
    cand = morphology.opening((sat < sat_max) & (lum > lum_lo) & (lum < lum_hi), morphology.disk(4))
    core = morphology.erosion(border_connected(cand), morphology.disk(14)).astype(np.float32)
    if core.sum() < 0.01 * core.size:
        sys.exit("no backdrop found: under 1% of the frame is neutral and border-connected. "
                 "Raise --sat or widen --lum, or this photograph has no plain backdrop.")
    w = filters.gaussian(core, sigma=sigma) + 1e-6
    model = np.stack([filters.gaussian(a[..., c] * core, sigma=sigma) / w for c in range(3)], -1)
    d = np.abs(a - model).max(-1)                     # colour distance to the backdrop model
    near = (d < t2) & (w > .04)                       # the model is valid only near real samples
    region = border_connected(near)
    x = np.clip((d - t1) / (t2 - t1), 0, 1)
    ramp = 1 - x * x * (3 - 2 * x)                    # 1 on the backdrop, 0 on the subject
    a_bg = filters.gaussian((ramp * region).astype(np.float32), sigma=.6)
    return a_bg, model, core


def load(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255


def cut(args):
    a = load(args.src)
    a_bg, model, _ = backdrop(a, args.sat, args.lum[0], args.lum[1], args.t1, args.t2, args.sigma)
    alpha = 1 - a_bg
    fg = (a - a_bg[..., None] * model) / np.maximum(alpha[..., None], .06)   # unmix the backdrop
    fg = np.where(alpha[..., None] > .98, a, np.clip(fg, 0, 1))
    rgba = np.dstack([fg, alpha])
    rgba[alpha < .012] = 0
    img = Image.fromarray((rgba * 255).astype(np.uint8), "RGBA")
    if args.out.lower().endswith('.webp'):
        img.save(args.out, quality=args.quality, method=6)
    else:
        img.save(args.out)
    if args.debug:
        Image.fromarray((a_bg * 255).astype(np.uint8)).save(args.debug)
    print(args.out, "subject share", round(float((alpha > .5).mean()), 3))


def swap(args):
    a = load(args.src)
    H, W = a.shape[:2]
    a_bg, model, core = backdrop(a, args.sat, args.lum[0], args.lum[1], args.t1, args.t2, args.sigma)
    mL = model @ LUMA
    bl = mL[core > 0]
    lo, hi = np.percentile(bl, 1), np.percentile(bl, 99.8)
    t = np.clip((mL - lo) / max(hi - lo, 1e-6), 0, 1) ** args.gamma
    new_b = rgb(args.lo)[None, None] * (1 - t[..., None]) + rgb(args.hi)[None, None] * t[..., None]
    res = a + a_bg[..., None] * (new_b - model)
    res += (np.random.default_rng(3).random((H, W))[..., None] - .5) / 255      # dither against banding
    Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(args.out, quality=args.quality, subsampling=0)
    if args.debug:
        Image.fromarray((a_bg * 255).astype(np.uint8)).save(args.debug)
    print(args.out, "backdrop share", round(float((a_bg > .5).mean()), 3))


def main():
    p = argparse.ArgumentParser(description="Cut out a studio portrait or swap its backdrop.")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("cut", "swap"):
        s = sub.add_parser(name)
        s.add_argument("src")
        s.add_argument("out")
        s.add_argument("--sat", type=float, default=.14)
        s.add_argument("--lum", type=float, nargs=2, default=[.2, .7])
        s.add_argument("--t1", type=float, default=.035)
        s.add_argument("--t2", type=float, default=.14)
        s.add_argument("--sigma", type=float, default=44)
        s.add_argument("--quality", type=int, default=92)
        s.add_argument("--debug")
        if name == "swap":
            s.add_argument("--lo", required=True, help="hex for the darkest part of the new backdrop")
            s.add_argument("--hi", required=True, help="hex for the lightest part of the new backdrop")
            s.add_argument("--gamma", type=float, default=1.0)
    args = p.parse_args()
    (cut if args.cmd == "cut" else swap)(args)


if __name__ == "__main__":
    main()
