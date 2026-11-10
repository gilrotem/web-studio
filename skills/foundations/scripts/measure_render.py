#!/usr/bin/env python3
"""Put numbers next to a word of taste: measure a rendered screenshot.

Needs numpy and Pillow. Run with: python -I measure_render.py render.png [options]

Prints, for the whole image or for a --box region:

  dark share   the share of pixels darker than --dark (OKLab lightness, default 0.45).
               Answers "too dark", "heavy": how much of the page the dark surfaces cover.
  flat share   the share of pixels within --tol (default 6/255 per channel) of the single most
               common colour. Answers "too clean", "a block of colour": how flat the field is.
  L range      the 2nd and 98th percentile of lightness. With a reference's render measured the
               same way, it shows whether a dark skin is darker or lighter than the reference.

  --box X0 Y0 X1 Y1   measure a region only (for one section of a full-page capture)
  --dark 0.45         the lightness under which a pixel counts as dark
  --tol 6             the per-channel tolerance for "the same colour"

Measure the render before and after a change and write both numbers into the review note. A
change that was supposed to fix "flat" and did not move the flat share did not fix it.
"""
import argparse

import numpy as np
from PIL import Image


def oklab_l(rgb):
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    l = 0.4122214708 * lin[..., 0] + 0.5363325363 * lin[..., 1] + 0.0514459929 * lin[..., 2]
    m = 0.2119034982 * lin[..., 0] + 0.6806995451 * lin[..., 1] + 0.1073969566 * lin[..., 2]
    s = 0.0883024619 * lin[..., 0] + 0.2817188376 * lin[..., 1] + 0.6299787005 * lin[..., 2]
    return 0.2104542553 * np.cbrt(l) + 0.7936177850 * np.cbrt(m) - 0.0040720468 * np.cbrt(s)


def main():
    p = argparse.ArgumentParser(description="Dark share, flat share and lightness range of a render.")
    p.add_argument("image")
    p.add_argument("--box", type=int, nargs=4, metavar=("X0", "Y0", "X1", "Y1"))
    p.add_argument("--dark", type=float, default=0.45)
    p.add_argument("--tol", type=int, default=6)
    a = p.parse_args()

    img = Image.open(a.image).convert("RGB")
    if a.box:
        img = img.crop(tuple(a.box))
    px = np.asarray(img)
    L = oklab_l(px.astype(np.float64) / 255)

    q = (px // 8).reshape(-1, 3).astype(np.int64)             # 32 levels per channel to find the mode
    keys = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
    mode_key = np.bincount(keys).argmax()
    mode = px.reshape(-1, 3)[keys == mode_key].mean(0)
    flat = (np.abs(px.astype(np.float64) - mode).max(-1) <= a.tol).mean()

    print(f"{a.image}  {px.shape[1]}x{px.shape[0]}" + (f"  box {a.box}" if a.box else ""))
    print(f"dark share (L < {a.dark}): {(L < a.dark).mean() * 100:.1f}%")
    print(f"flat share (within {a.tol}/255 of #{int(round(mode[0])):02X}{int(round(mode[1])):02X}{int(round(mode[2])):02X}): {flat * 100:.1f}%")
    print(f"L range (2nd to 98th percentile): {np.percentile(L, 2) * 100:.1f} to {np.percentile(L, 98) * 100:.1f}")


if __name__ == "__main__":
    main()
