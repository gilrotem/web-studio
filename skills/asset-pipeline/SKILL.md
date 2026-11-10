---
name: asset-pipeline
description: Produces and optimizes every asset for the site: responsive AVIF/WebP images with sharp, ffmpeg video loops and posters, scroll-scrub frame sequences, SVGO-clean SVG and icon sprites, Hebrew-subset WOFF2 fonts, glTF compression, Hebrew-safe OG images, and routes AI generation (fal FLUX.2, Nano Banana, Recraft for vectors, rembg locally). Use when the user says "image", "video", "font", "icon", "SVG", "poster", "תמונה", "סרטון", "פונט", or when a scene needs media that does not exist yet.
---

# Asset pipeline — everything that is not code

Tools installed on this machine: ffmpeg (winget), sharp (npm, per project), svgo, @gltf-transform/cli,
fonttools (`pyftsubset`), rembg, vtracer, Playwright. Scripts live in `${CLAUDE_SKILL_DIR}/scripts/`.

## 1. Images
`node ${CLAUDE_SKILL_DIR}/scripts/images.mjs <in-dir> <out-dir> [widths=480,960,1440,2000]` writes AVIF + WebP per width plus a 20 px blurred placeholder JSON.
Markup: `<picture>` with AVIF then WebP sources, `srcset`/`sizes`, explicit `width`/`height`, `loading="lazy"` except the LCP image which gets `fetchpriority="high"` and a preload. One grading across the page (apply the same sharp `modulate`/`tint` to all).

## 2. Video
- Loop: `ffmpeg -i in.mov -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart hero.mp4` and `-c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 -an hero.webm`. 2 to 6 s loops; longer than 30 s goes HLS.
- Poster: `ffmpeg -ss 00:00:02 -i hero.mp4 -frames:v 1 poster.png` then through images.mjs. Poster under 100 KB; it is the LCP.
- Markup: `autoplay muted loop playsinline poster preload="metadata"`; attach `src` after load.
- **Scroll-scrub frame sequence**: `node ${CLAUDE_SKILL_DIR}/scripts/frames.mjs <in.mp4> <out-dir> --fps 24 --widths 1280,720 --quality 80` (ffmpeg to PNG, sharp to WebP per breakpoint). Cap at ~150 frames desktop, ~80 mobile; preload the first 10, then the rest in the background; draw with GSAP `snap: "frame"`.

## 3. SVG and icons
- `svgo --multipass -i in.svg -o out.svg` (SVGO 4 keeps viewBox and title; do not re-enable their removal). Flatten transforms on export, 1-decimal precision, `fill="currentColor"`.
- One icon set, one stroke weight, one size grid; build a sprite: `svgo -f icons/ -o sprite-src/` then concatenate into `<svg><symbol id>` and reference with `<use href="#id">`. Mirror only directional icons in RTL (`hebrew-rtl-israel`).
- Animated SVG: GSAP DrawSVG (strokes), MorphSVG (`shapeIndex: "auto"`, `smooth: true`), MotionPath. Lottie/dotLottie for designer exports; Rive for interactive.
- Vectorize a raster logo: `vtracer --input logo.png --output logo.svg --colormode color --mode spline`, then SVGO, then hand-clean anchors.

## 4. Fonts
`${CLAUDE_SKILL_DIR}/scripts/subset-font.ps1 -In Font.ttf -Out public/fonts/font-he.woff2` runs pyftsubset with Hebrew + Basic Latin + shekel (`U+0590-05FF, U+FB1D-FB4F, U+0020-007E, U+00A0, U+20AA`) and all layout features. Declare:
```css
@font-face { font-family: 'X'; src: url(/fonts/x-he.woff2) format('woff2'); font-display: swap; unicode-range: U+0590-05FF, U+FB1D-FB4F, U+0020-007E, U+00A0, U+20AA; }
```
Keep variable axes only when more than two weights are used. Preload at most one or two files. Add `size-adjust`/`ascent-override` fallbacks to avoid CLS. Licensing: Google Fonts Hebrew families are OFL; AlefAlefAlef and Fontimonim need a per-site webfont licence; check Fontef's EULA.

## 5. 3D
`gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress ktx2` (KTX2 needs `toktx` on PATH; without it use `--texture-compress webp`). Target under 2 MB per hero model.

## 6. OG and social images
Satori does not shape RTL. Render `og.html` (1200x630) with Playwright: `npx playwright screenshot --viewport-size=1200,630 og.html public/og.png`.

## 7. Generation routing
| Need | Route |
|---|---|
| Textures, atmospheres, abstract plates, hero backgrounds | fal.ai FLUX.2 via the `fal-image` skill (key in `.env.local` as `FAL_AI_API_KEY`) |
| Edits with reference consistency | Gemini image (Nano Banana) via fal |
| Icons, logos, vector illustration | Recraft V4 Vector (API), then SVGO |
| Cut-outs | `rembg i in.png out.png` locally (free) |
| Upscale | Real-ESRGAN ncnn-vulkan portable |
| Video plates | Veo 3.1 / Kling 3 / Runway; expensive, only for the remembered moment |
Never generate the business's premises or people as if real. Keep a provenance note in `design/art-direction.md` section 5 (EU AI Act Art. 50 marking applies from Aug 2026 for EU audiences).
