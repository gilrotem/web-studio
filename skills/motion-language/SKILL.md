---
name: motion-language
description: Writes design/motion-spec.md and decides how motion is built: easing and duration tokens, scene choreography, scroll-telling, transitions, reduced-motion design, and the GSAP vs CSS scroll-driven vs View Transitions split. Use when the user says "motion", "animation", "scroll", "transition", "אנימציה", "תנועה", or before any scene is coded.
---

# Motion language — the spec and the recipes

Motion is narrative structure, not decoration. Every animation answers "what does this explain,
connect or reveal?" The output is `design/motion-spec.md` plus the choice of engine per scene.
Aligned to the state of the craft on 2026-11-09 (the `craft-research` skill, `motion_material` note).

## 1. The spec (`design/motion-spec.md`)
1. **Tempo word and purpose statement** (one line each).
2. **Easing tokens**: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for entering; `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` for things already on screen; `--ease-emph: cubic-bezier(0.3, 0, 0.8, 0.15)` for exits; a spring for spatial moves (critically damped, no overshoot unless the brand is playful). GSAP equivalents: `power3.out`, `power2.inOut`, `expo.out`, `CustomEase`. No bounce, no elastic.
3. **Duration tokens**: press 120 ms, UI 200 to 280 ms, drawer 480 ms, scene reveal 800 to 1200 ms; scroll motion is distance-driven (`scrub`), never time-driven.
4. **Choreography rules**: one dominant element moves first; stagger 30 to 60 ms (text lines 100 ms); enter from where it came from; exits faster than enters; follow-through on close; nothing autoplays over 5 s without a visible pause control (WCAG 2.2.2); interruptible mid-motion. Transitions between states are continuous, never a cut or a plain fade: juries score the transition itself.
5. **Load sequence**: preloader or not (a preloader that delays content is a defect); the first 1.5 s frame by frame; the LCP image or text is painted in its final place before JS, no fade-in on it.
6. **Scene choreography table**: per scene: trigger (load, scroll scrub, pin, hover, click), engine, what moves, from/to, duration or scroll distance, hand-over to the next scene.
7. **Transitions**: between pages (cross-document View Transitions as enhancement; Barba only if a canvas must persist) and between states.
8. **Reduced motion**: a complete second design, not a switch-off. Same layout and hierarchy; opacity crossfades of 150 to 250 ms instead of travel; masked text appears in place; video becomes its poster; a shader scene becomes a still or a slow breathing frame with no scroll camera; page transitions off; smooth scroll off. Written per scene. A visible motion toggle in the header or footer.
9. **Budget**: 60 fps on a mid-range phone at 390 px (Chrome's calibrated mid-tier preset or 4x CPU; confirm on a real device, since CPU throttling ignores GPU cost); transform and opacity only; `will-change` set and removed around an animation; no layout reads in scroll handlers; no long task over 200 ms during scroll.

## 2. Engine decision (versions as of 2026-11-09)
| Need | Use |
|---|---|
| Progress bars, parallax, simple view reveals, pure functions of scroll | CSS scroll-driven animations (`animation-timeline: view()`), Baseline newly available since 27 Oct 2026 (Firefox 159); still inside `@supports` |
| Pinning, scrub with smoothing, snap, horizontal tracks, canvas or WebGL driven by scroll, callbacks | GSAP 3.15.1+ ScrollTrigger (all plugins free; 3.15.1 fixes RTL line breaks in SplitText and a matchMedia resize regression) |
| Per-line text reveals | GSAP SplitText, lines only, `mask: "lines"`, `autoSplit`, `aria: "none"` with the real text kept in the DOM; never characters (screen-reader failures documented Feb 2026; Hebrew final forms) |
| Grid to detail, layout morphs | GSAP Flip |
| Page to page | View Transitions (`@view-transition { navigation: auto }` + `view-transition-name`); same-document is Baseline, cross-document has no Firefox yet, so it degrades to a cut; Astro `<ClientRouter />` only when the native path is unavailable |
| Entrances from display none, popovers, dialogs | `@starting-style` + `transition-behavior: allow-discrete` |
| Smooth weighted scroll | Lenis 1.3.27+ driven by `gsap.ticker` (`autoRaf: false`; `respectReducedMotion` is on by default); never with `normalizeScroll()` |
| Designer-authored character or icon animation | Rive (interactive) or dotLottie (linear) |
| React project | Motion 14 for presence and layout, GSAP for scroll choreography |

## 3. Recipes
- **Pinned scene**: `gsap.timeline({ scrollTrigger: { trigger, pin: true, scrub: 1, end: "+=200%", anticipatePin: 1 } })`.
- **Horizontal track (RTL)**: panels laid out with `direction: rtl`; tween with positive `x` values; never read `scrollLeft` (sign differs per engine); nested triggers get `containerAnimation`.
- **Text reveal**: `document.fonts.ready.then(() => SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, aria: "none", onSplit: s => gsap.from(s.lines, { yPercent: 100, duration: 0.6, stagger: 0.1, ease: "expo.out" }) }))`; revert after the intro.
- **Frame sequence scrub**: tween `{ frame: 0 }` to `n - 1` with `snap: "frame"`, draw to canvas in `onUpdate`; frames per breakpoint from `asset-pipeline`, poster is an exact match of frame 0.
- **Flip**: `const s = Flip.getState(items); reorder(); Flip.from(s, { duration: 0.6, ease: "power2.inOut", absolute: true })`.
- **Observer deck**: `Observer.create({ type: "wheel,touch,pointer", onDown, onUp, tolerance: 10, preventDefault: true })`.
- **Responsive and reduced**: everything inside `gsap.matchMedia()` with keys `(min-width: 768px)` and `(prefers-reduced-motion: no-preference)`; a `reduce` branch that builds the reduced design; `gsap.context()` per scene, reverted on teardown.
- **Refresh discipline**: `document.fonts.ready.then(() => ScrollTrigger.refresh())`; `ScrollTrigger.config({ ignoreMobileResize: true })`; `100dvh` not `100vh` for pinned panels.

## 4. Review
Record the scroll path with `visual-review/scripts/record-motion.mjs`, read the contact sheet, and check against the choreography table: order, overlap, tempo, hand-overs. Trace in Chrome DevTools (Performance panel FPS track, long animation frames) on the calibrated mid-tier preset, then once on a real phone. Run the reduced-motion profile and confirm it reads as a finished design. API detail: the vendored `gsap-*` skills.
