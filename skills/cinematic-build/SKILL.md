---
name: cinematic-build
description: Scaffolds and builds the site: Vite 8 (or Astro 7, or a WordPress hybrid theme via `wp-theme`) + vanilla CSS layers and DTCG tokens + GSAP 3.15.1+ + Lenis wiring, RTL first, with performance guardrails and fallback chains. Use when the user says "build", "scaffold", "hero", "section", "scene", "תבנה", "סצנה", or when art-direction.md and motion-spec.md exist and code does not.
---

# Cinematic build — one hand, scene by scene

Prerequisites: `design/art-direction.md` and `design/motion-spec.md`. If either is missing or
has holes, go back; a build that invents design mid-way produces generic work.

## 1. Scaffold (once)
Copy `${CLAUDE_SKILL_DIR}/assets/scaffold/` into the project root, then:
```powershell
npm init -y; npm i gsap lenis; npm i -D vite sharp playwright @axe-core/playwright
```
Structure:
```
index.html            semantic, lang="he" dir="rtl", LCP element static in place
src/styles/
  reset.css  tokens.css (generated from design/tokens/tokens.json)  base.css  components.css  motion.css
src/js/
  main.js             registers plugins, Lenis + ticker bridge, matchMedia, scene loader
  scenes/<scene>.js   one module per scene, exports init(ctx) and returns a cleanup
public/               fonts (subset woff2), media (poster first), icons sprite
```
CSS layer order, declared once in `base.css`: `@layer reset, tokens, base, components, utilities, motion;`.
Dev server for the browser pane: `.claude/launch.json` is already set to `npm run dev` on 5173.
Astro 7 instead of Vite when there are more than ~5 pages or a CMS: same layers, `<ClientRouter />` for transitions, `<Image>` for responsive images. When Delivery is a WordPress theme, the same `src/` builds with Vite 8 into the theme and is enqueued as script modules: see `wp-theme`.

## 2. Build order
1. **Tokens first.** `design/tokens/tokens.json` to `src/styles/tokens.css` (`node scripts/build-tokens.mjs`). No magic numbers after this point.
2. **Hero scene alone, to the end.** Desktop and mobile as two compositions, real strings, real poster, the load sequence from the motion spec, reduced-motion variant. Render, record, show once.
3. **Then scene by scene**, each joined to the previous (overlap, continuation, background that starts early). Never a hard cut unless it is the one deliberate cut.
4. **Nav, footer, cursor, preloader, primary action** are scenes too; they are designed, not defaulted.
5. **Transitions** last: View Transitions names, `@starting-style` entrances.

## 3. Wiring (in the scaffold's main.js)
```js
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
const lenis = new Lenis({ autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({ ignoreMobileResize: true });
document.fonts.ready.then(() => ScrollTrigger.refresh());
const mm = gsap.matchMedia();
mm.add({ desktop: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' }, ctx => { /* scenes */ return () => {} });
```
Never a second rAF loop. Never `normalizeScroll()` together with Lenis. Plugins a scene needs rarely are `await import()`ed inside that scene.

## 4. Guardrails (checked every scene)
- LCP element is an `<img>` or text, painted in place, `fetchpriority="high"`, poster under 100 KB preloaded; video and WebGL attach after `load` or idle.
- Transform and opacity only; `will-change` around the animation, not global; no layout reads in scroll, pointer or rAF handlers. Text reveals split by lines only (`motion-language`).
- `100dvh`/`100svh` for pinned panels; `anticipatePin: 1`.
- `content-visibility: auto` with `contain-intrinsic-size` below the fold.
- Degrade on `navigator.connection?.saveData`, `deviceMemory < 4`, `hardwareConcurrency <= 4`: shorter frame sequences, no shader loop.
- Fallback chain: WebGPU -> WebGL2 -> poster; `@supports` gates for scroll-driven CSS and anchor positioning; cross-document transitions degrade to a cut.
- JS under 150 KB gzipped total; hero media under 1.5 MB; fonts subset (`asset-pipeline`).
- RTL: logical properties only, `<bdi>` around numbers and Latin, mirrored directional icons (`hebrew-rtl-israel`).
- Speculation Rules `prerender` for the top two links as a Chrome bonus (in WordPress through core's speculative loading, `wp-theme` section 5).

## 5. Component craft (every interactive element)
Resting, hover, focus-visible, active, disabled, loading. Hover and active more contrasty than rest. `touch-action: manipulation`. Tap targets 24 px minimum. Buttons state the outcome in Hebrew.

## 6. Done means
Rendered at 390 and 1440, light and dark, RTL, recorded, traced at 4x CPU, axe clean, reduced-motion checked (`visual-review`), and the scene appears in `design/components.md` if it introduced a component.
