---
name: visual-verify
description: The screenshot loop — the only trustworthy way to review visual work. Runs in two modes: REFINE (a taste loop that makes generative work better) and FIDELITY (a pass/fail gate that proves a port matches its source). Use whenever the user says "verify", "compare", "check the section", "תבדוק", or after any visual work. Code is never trusted by reading it, only by rendering it.
---

# Visual Verify — Render, Look, Decide

Code that reads correctly routinely renders wrong. The only trustworthy review
is a rendered screenshot. This skill has **two modes, and using the wrong one is
itself a defect.**

| Mode | Used by | Question it asks | Ends when |
|---|---|---|---|
| **REFINE** | every design job: a site, a redesign, a page | "What is the weakest thing here?" | The builder would hand it to the jury |
| **FIDELITY** | reproducing a source exactly | "Does this match the source?" | The deviation table is clean |

V1 had only the second one, and applied it to generative work. A pass/fail gate
cannot make a page better — it can only confirm a page is not wrong. That is why
V1's output was correct and flat.

## Setup

Playwright (MCP or `npx playwright install chromium`) and a running server —
`npm run dev` for component builds, `npx serve <slug>/` for a page folder. The
loop is identical for both.

**Scroll the whole page before capturing. Always.** Anything revealed by an
IntersectionObserver starts at `opacity: 0`, and a static full-page screenshot
never fires the observer — so the capture comes back with everything below the
fold missing, and the page looks broken when it is fine. Scroll to the bottom in
steps, return to the top, confirm nothing is still at zero opacity, then shoot.
A screenshot taken without this is not evidence; it is a false report.

**Confirm the page identity and the viewport width in the capture itself** —
title and `innerWidth` — before trusting it. A shared browser can be navigated
or resized by another agent between your navigate and your screenshot.

## The measured check — `scripts/verify.mjs shoot`

One command does all of the above and measures what the eye misses. Run it from
the project root (Playwright resolved from the project):

```bash
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs shoot design/build/index.html            # 1440 + 390, settled, audited
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs shoot <page> --reduced                     # + reduced-motion captures
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs selftest                                   # 28 checks against a known page
```

- **Settled capture**: fonts, a stepped scroll so every observer fires, lazy
  images, an instant return to the top; captured full page at `scrollY = 0`.
- **Evidence or not**: exit 3 (`evidence: suspect`) when a stylesheet, font,
  image or script failed to load, the page threw, or content is still invisible
  after the scroll (`--allow-hidden "<why>"` for a carousel or tabs).
- **Measured contrast**, WCAG AA on the rendered page: 4.5:1 body, 3:1 large
  (24px+, or 18.66px+ at 700+). Flat colours are computed through alpha and
  opacity. Text over a photograph, gradient, SVG or video is **measured from the
  pixels** under its lines (text hidden, 10th percentile of per-pixel
  contrast), and gradient-filled text by diffing pixels with and without it.
  What cannot be sampled is reported UNVERIFIABLE and is never a pass. Results
  within ~0.1 of a threshold are a judgement call.
- Also caught: body under 16px, lines over 70 characters (`60ch` is ~74 Hebrew
  characters, not 60), gradient text, and a numeric range joined by a dash in
  RTL text without LTR isolation (it renders reversed). Exit 2 on any failure.

Output: `design/review/verify/<stamp>-<tag>/` (captures and `run.json`), one line
per run in `design/review/verify/runs.jsonl`. Keep the runs that mattered with
the stage's evidence; delete the rest. Not modelled: text-shadow and stroke,
blend modes, filters, opacity on an ancestor above the background's provider.

---

## REFINE mode — the taste loop

The purpose is improvement, not approval. It is the builder's own loop between
two locks, run privately: it ends when the builder would put the piece in front
of the jury, not when a checklist clears. The Art Director sees the piece only
after the jury, at the lock.

1. **Render** the page or section at 1440. Full page, not a viewport crop.
2. **Look before reading.** Take in the screenshot as a whole first. First
   impression is data: does it look expensive, considered, alive — or flat?
3. **Name the single weakest thing.** One. Not a list of eleven small
   deviations. The weakest thing is usually one of: the type contrast is not
   actually extreme, the boldness is spread instead of spent, the imagery is
   weak or absent, or the section rhythm is uniform.
4. **Fix that one thing** — properly, at its root, not with a patch.
5. **Render again and compare** to the previous shot. If it did not visibly
   improve, revert and try a different move rather than stacking changes.
6. **Repeat.** Three to six passes is normal for a hero. Report each pass in one
   line: what was weakest, what changed, whether it improved.

Every few passes, run the `signature` review checklist — especially "is the
declared signature actually there, and is it the only bold thing?"

**Do not grind:** after three passes on the same weakness with no improvement,
stop and hand the piece to the jury with the shots side by side and your
reading of why it is stuck. The jury's ranked fix list decides the next move.

---

## FIDELITY mode — the blocking gate

Used when a source must be reproduced exactly, where the source is the specification.

1. Screenshot the build at 1440. When the batch is done, also at 390.
2. Open the source reference for the same section, side by side.
3. Compare in this order and write a deviation table:
   - **Layout** — grid, column counts, alignment, element order.
   - **Spacing** — section padding, gaps, internal padding. Rhythm, not px-perfection.
   - **Color** — every surface and text color against the source; sample pixels
     where uncertain.
   - **Typography** — size, weight, line-height, letter-spacing, casing.
   - **Patterns** — rotations and alternations implemented across ALL instances.
     Check every card, not the first one.
   - **Details** — borders, radii, icon sizes, image aspect ratios.
4. Legal deviations are only those written in the contract's Guardrails block.
   Everything else is a defect: fix, re-screenshot, repeat.
5. After three failed iterations on the same defect, stop and show the Art
   Director the side-by-side with the deviation table. Never grind silently.

**Pass criteria:** the deviation table contains only contract-approved
deviations, at both 1440 and 390, and the `signature` checklist raises no
blacklist hits.

**Report format — keep it this short:**
```
SECTION: 03-menu | MODE: fidelity | ITERATION: 2 | RESULT: PASS/FAIL
Deviations: [none | list]
Contract-approved: [list]
Next: [proceed to X / fixing Y]
```

---

## Both modes

- Always check RTL rendering separately. A layout that is correct in LTR can be
  broken in Hebrew, and the code gives no hint of it.
- Screenshots are evidence. Keep the ones that mattered; delete the rest — do
  not let a `.playwright-mcp` graveyard accumulate in the project. The ones
  that mattered live in `design/review/<date>-<stage>/`.
