#!/usr/bin/env python3
"""
Turn a folder of candidates into the two things a reviewer actually needs, both
local and free.

  python sheet.py --in DIR [--sheet] [--review] [--cols 4] [--cell 420] [--max 1024]

--sheet   one numbered contact sheet: DIR/_sheet.jpg
          For picking one winner out of several variants of the SAME slot.
          NOT for judging fine detail: at thumbnail size baked-in lettering,
          hands and small faces are invisible, which is exactly how a defect
          once survived a whole round.

--review  downscaled full-frame copies in DIR/_review/, longest side --max.
          For a set of DIFFERENT images that each need their own approval.
          An image costs roughly (w*h)/750 tokens to look at AFTER the API
          shrinks anything whose longest side exceeds ~1568px. So 2048x1152
          arrives as ~1568x882 and costs ~1,840; 1024x576 costs ~790. Lettering,
          hands and faces are all still legible at 1024.

Default is both. Nothing is deleted or overwritten in place.
"""

import argparse
import json
import math
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow is required:  python -m pip install Pillow")

EXTS = (".png", ".jpg", ".jpeg", ".webp")
BG = (16, 16, 18)
FG = (238, 238, 240)
DIM = (150, 150, 156)


API_MAX_SIDE = 1568  # the API shrinks anything longer than this before billing


def seen_tokens(w, h):
    """Tokens once the API has shrunk the long side to API_MAX_SIDE."""
    longest = max(w, h)
    if longest > API_MAX_SIDE:
        k = API_MAX_SIDE / longest
        w, h = w * k, h * k
    return round(w * h / 750)


def candidates(d):
    return sorted(
        f for f in os.listdir(d)
        if f.lower().endswith(EXTS) and not f.startswith("_")
        and os.path.isfile(os.path.join(d, f))
    )


def font(size):
    for name in ("arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def contact_sheet(src, files, cols, cell, out_path):
    label_h = max(18, cell // 16)
    pad = max(6, cell // 48)
    rows = math.ceil(len(files) / cols)
    W = cols * (cell + pad) + pad
    H = rows * (cell + label_h + pad) + pad

    sheet = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(sheet)
    f_num = font(max(12, cell // 22))
    f_name = font(max(10, cell // 30))

    for i, name in enumerate(files):
        r, c = divmod(i, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        try:
            im = Image.open(os.path.join(src, name)).convert("RGB")
        except Exception:
            draw.rectangle([x, y, x + cell, y + cell], outline=(90, 40, 40))
            continue
        im.thumbnail((cell, cell), Image.LANCZOS)
        sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))

        n = str(i + 1)
        tw = draw.textlength(n, font=f_num)
        draw.rectangle([x, y, x + tw + 10, y + f_num.size + 6], fill=(0, 0, 0))
        draw.text((x + 5, y + 3), n, font=f_num, fill=FG)
        draw.text((x, y + cell + 3), name[:44], font=f_name, fill=DIM)

    sheet.save(out_path, "JPEG", quality=88, optimize=True)
    return sheet.size


def review_copies(src, files, out_dir, max_side):
    os.makedirs(out_dir, exist_ok=True)
    made = []
    for i, name in enumerate(files):
        try:
            im = Image.open(os.path.join(src, name)).convert("RGB")
        except Exception:
            continue
        before = im.size
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        stem = os.path.splitext(name)[0]
        dest = os.path.join(out_dir, f"{i + 1:02d}-{stem}.jpg")
        im.save(dest, "JPEG", quality=86, optimize=True)
        made.append((i + 1, name, before, im.size, seen_tokens(im.width, im.height)))
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--review", action="store_true")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--cell", type=int, default=420)
    ap.add_argument("--max", type=int, default=1024)
    a = ap.parse_args()

    if not a.sheet and not a.review:
        a.sheet = a.review = True

    src = os.path.abspath(a.src)
    files = candidates(src)
    if not files:
        sys.exit(f"no candidate images in {src}")

    print(f"{len(files)} candidates in {src}")
    index = {"dir": src, "count": len(files), "files": {}}

    if a.sheet:
        out = os.path.join(src, "_sheet.jpg")
        w, h = contact_sheet(src, files, a.cols, a.cell, out)
        shrunk = max(w, h) > API_MAX_SIDE
        print(f"  sheet   {out}  {w}x{h}  ~{seen_tokens(w, h)} tokens to look at")
        print( "          numbered left to right, top to bottom; answer by number")
        if shrunk:
            k = API_MAX_SIDE / max(w, h)
            print(f"          NOTE: the API shrinks this to {round(w * k)}x{round(h * k)}, so each cell"
                  f" arrives ~{round(a.cell * k)}px. Triage only - fine detail is not visible.")
        for i, n in enumerate(files):
            index["files"][str(i + 1)] = n

    if a.review:
        out_dir = os.path.join(src, "_review")
        made = review_copies(src, files, out_dir, a.max)
        if made:
            tot = sum(m[4] for m in made)
            native = sum(seen_tokens(m[2][0], m[2][1]) for m in made)
            print(f"  review  {out_dir}  {len(made)} copies, longest side {a.max}")
            print(f"          ~{tot} tokens for the set, vs ~{native} at native size")
        for n, name, _b, _s, _t in made:
            index["files"][str(n)] = name

    with open(os.path.join(src, "_index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, indent=2)
    print(f"  index   {os.path.join(src, '_index.json')}  (number -> filename)")


if __name__ == "__main__":
    main()
