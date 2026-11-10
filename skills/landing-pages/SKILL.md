---
name: landing-pages
description: >
  The craft floor for a landing or marketing page built in clean HTML/CSS/JS:
  structure, conversion, type and space defaults, code standards. Use inside the
  page job (with `mode-page`) whenever the task is to design, build or refine a
  landing page, hero section, marketing page, pricing section or any standalone
  promotional layout.
---

# Premium Landing Pages

Build landing pages that look like they came from a top design studio: clean
code, premium visuals, maximum functionality.

## Workflow

1. **Read the intent from the contract** (asked once at birth): the goal, the
   single primary action, the brand, the audience. Nothing is asked mid-build.
   If there is a reference site or screenshot, study it before building.
2. **Set the aesthetic direction.** Apply the `signature` skill and the project's art-direction document
   BEFORE writing CSS. Never build a generic layout and "style it later" — the
   direction comes first. For brand projects, the brand `tokens.css` is the source
   of truth and overrides any default.
3. **Design the structure** as semantic sections: hero → social proof → benefits
   → features → testimonials → pricing/offer → FAQ → final CTA → footer. Drop
   sections that don't serve the single conversion goal. Every section earns its
   place.
4. **Build mobile-first**, then enhance for larger screens, starting from the hard
   defaults below — never arbitrary values.
5. **Critique visually, don't just verify.** With the page running, screenshot it
   at 360 / 768 / 1440 via the preview tools, then critique each viewport against
   the premium bar (type rhythm, spacing, hierarchy, the signature element) — not
   merely "does it render." Fix and re-screenshot until it reads premium.
6. **Self-review** against `references/quality-checklist.md` before declaring done.

## Premium design principles (non-negotiable)

Aesthetic *direction* — palette personality, type pairing, the signature element,
and avoiding templated defaults — is owned by the `signature` skill and the art-direction document; apply them
first. The rules here are the **craft floor** beneath that direction:
start from these hard defaults, deviate only with a reason, never with arbitrary
values.

- **Type.** Modular scale, ratio 1.25 (mobile) → 1.333 (desktop), fluid via
  `clamp()`. Body 16–18px; line-height 1.0–1.25 headings / 1.5–1.8 reading text (the canon in `system-packs`). At most
  two families (display + body). Real weights 300/400/600/700 — never faux-bold.
- **Spacing.** 4px base; scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
  Section padding `clamp(64px, 10vw, 128px)`. Whitespace is the #1 premium signal —
  when unsure, add more.
- **Color.** One dominant brand color + a neutral ramp (never pure #000/#fff for
  everything) + one accent reserved for the CTA. Tokens as CSS custom properties
  (the project's tokens.css is the source).
- **Radius & grid.** One radius scale (e.g. 8 / 12 / 16px), never mixed at random;
  pills only for chips/badges. Content max-width 1100–1280px with generous gutters;
  12-col or an intentional asymmetric grid; aligned and optically corrected.
- **Depth.** Layered, low-opacity shadows (e.g. `0 1px 2px rgba(0,0,0,.04),
  0 8px 24px rgba(0,0,0,.08)`), subtle borders, gentle gradients — never a single
  harsh drop-shadow.
- **Motion.** One coordinated page-load reveal + purposeful hover/scroll
  micro-interactions; `transform`/`opacity` only for 60fps. Respect
  `prefers-reduced-motion`. Never animate for the sake of it.

## Code standards

- **Semantic HTML5**: `<header> <main> <section> <article> <nav> <footer>`,
  proper heading hierarchy (one `<h1>`), `<button>` for actions, `<a>` for links.
- **CSS**: custom properties for the design system; `clamp()` for fluid type and
  spacing; logical, low-specificity selectors; mobile-first media queries. No
  `!important`.
- **JS**: vanilla, progressive enhancement, no framework unless asked. Defer
  scripts. Page must be usable with JS disabled where feasible.
- **No bloat.** No jQuery, no heavy UI libs, no unused CSS.
- **Accessibility**: WCAG AA contrast, focus states, `alt` text, ARIA only when
  semantics don't suffice, keyboard-navigable.
- **Performance**: lazy-load below-fold images, modern formats (WebP/AVIF) with
  fallback, `width`/`height` on images to avoid CLS, system-font fallback stack.

## Starter template

`assets/template.html` is a self-contained premium starter
(namespaced CSS, design tokens, scroll-reveal, responsive). Use it as the
skeleton, then customize — don't rebuild boilerplate from scratch each time.

## Output expectations

The page lives in the project's `design/build/` as clean HTML/CSS/JS: a page
folder (`<slug>/index.html` + `assets/`), with CSS and JS in their own files.
