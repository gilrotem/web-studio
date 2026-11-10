---
name: visual-review
description: The render-record-measure-critique loop. Screenshots at 390 and 1440 (light, dark, RTL), records the scroll path to a contact sheet to judge motion timing, traces performance at 4x CPU, runs axe, applies the critique checklist and an Awwwards-style jury score, then fixes the single weakest thing. Use after any visual work, when the user says "review", "verify", "check", "תבדוק", "ביקורת", or before anything is shown as done.
---

# Visual review — nothing is judged by reading code

Two modes. REFINE improves generative work until the Art Director stops it. GATE is pass/fail before "done".

## 1. Render (both modes)
Built-in browser pane (`preview_start` name `dev`) or `node ${CLAUDE_SKILL_DIR}/scripts/capture.mjs <url> <out-dir>`:
- Scroll the whole page to the bottom in steps and back to the top before capturing, so nothing is still at opacity 0. Confirm `document.title` and `innerWidth` in the capture.
- 390x844 and 1440x900; light and dark (`resize_window` colorScheme); `dir="rtl"` present on `html`.
- Zero console errors (`read_console_messages`), no failed requests.
Keep the shots that mattered in `design/review/<date>/`; delete the rest.

## 2. Record motion
`node ${CLAUDE_SKILL_DIR}/scripts/record-motion.mjs <url> <out-dir> [--width 1440] [--seconds 12]` scrolls the page over N seconds under Playwright video, extracts 12 fps frames with ffmpeg and tiles them into one contact sheet PNG. Read the sheet against `design/motion-spec.md`: order, overlap, tempo, hand-overs, anything that pops or cuts. Repeat with `--reduced` to check the reduced-motion design is complete.

## 3. Measure
- Chrome DevTools MCP (1.12+): `emulate` (calibrated mid-tier preset or 4x CPU, Slow 4G, mobile viewport) -> `performance_start_trace` with reload -> `performance_analyze_insight`. LCP 2.5 s, INP 200 ms, CLS 0.1 at p75, no long task over 200 ms during scroll. Once per scene on a real phone: CPU throttling ignores GPU cost.
- `npx unlighthouse-ci --site <url> --budget 90` on a built preview; `@axe-core/playwright` with tags wcag2a, wcag2aa, wcag21aa: zero violations.
- Bundle: JS under 150 KB gz, hero media under 1.5 MB, fonts subset.

## 4. Critique (REFINE)
Look at the whole screenshot before reading anything. First impression is data: expensive, considered, alive, or flat?
Then the checklist, each answered in one line:
1. Concept: can the idea be said in one sentence, and does the hero prove it in 3 seconds?
2. Hierarchy: squint test; one dominant element per viewport; type scale with 3+ clearly distinct steps.
3. Rhythm: one spacing scale; surfaces, heights and alignment vary across the scroll; scenes connect, no hard cuts.
4. Type: display face has a point of view; body 16px+; no letter-spacing on Hebrew; serif never mixed with sans in a line.
5. Color: one accent per view; tinted neutrals; contrast passes including over media.
6. Imagery and material: one treatment; plural, composed into the layout; grain and light consistent.
7. Motion: every animation explains something; enters ease-out; exits faster; 60 fps; reduced-motion complete.
8. Banned-list audit against `design/art-direction.md`.
9. Details: nav, footer, cursor, preloader, states, focus rings, RTL mirroring right.
10. Which three sites in `design/references/bar/` could this sit next to? Put the render beside them in one side-by-side sheet. If the answer includes "a template", keep working.
Name the **single weakest thing**. Fix it at the root. Render again and compare. If it did not visibly improve, revert and try a different move. Three to six passes per scene is normal. When the session that built the scene also reviews it, hand the critique to a reviewer in a fresh context (a sub-agent given only the screenshots and the checklist). After three passes stuck on the same weakness, stop and show the Art Director the side-by-side with your reading.

## 5. Jury score (GATE)
Score like Awwwards: Design 40, Usability 30, Creativity 20, Content 10, each out of 10, weighted. Under 7.0 overall or under 6 on any axis does not ship. Write the score and the one-line reason per axis into `design/review/<date>/jury.md`.

## 6. Report format
```
SCENE: hero | MODE: refine | PASS: 3 | weakest: type scale too timid | change: step-4 display, mask reveal | improved: yes
```
