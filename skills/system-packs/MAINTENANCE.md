# system-packs — state and next review

Built 2026-09-26 in the studio folder the kit grew from, out of the two systems
that held on shipped sites (an institutional site's type specification, a retail
site's composition and frozen tokens). Ported into the kit on 2026-11-10 (1.1.0)
with the packs renamed after their register, not their client. **Next review:
December 2026**, with fal-image and visual-verify.

## What exists

| File | What it is |
|---|---|
| `CANON.md` | The law: authority levels, grammar, floors, Hebrew technique, coupling, proximity. |
| `packs/<name>/pack.json` | A pack's source. `tokens.css` is always generated from it. |
| `pack.mjs` | Load, generate (fluid 360→1320, measures from Hebrew characters), check against the canon. |
| `cli.mjs` | `list check build use apply new proof compare drift swap`, run from the project root. |
| `specimen.html` | One Hebrew page written only against the grammar; every pack re-skins it. |
| `measure-fonts.mjs` + `fonts.json` | The Hebrew calibration table, measured in Chromium. |
| `selftest.mjs` | 28 checks: the real packs pass, nine kinds of broken pack fail, the generator is exact, the rhythm presets pass, and in Chromium `.sp-flow` / `.sp-display` behave as claimed. |

Rendering goes through `../visual-verify/scripts/` (Playwright from the project).

## What was measured, not assumed (2026-09-26/27)

**The calibration table (`fonts.json`)**: 41 face-weights of 15 Hebrew families,
Chromium canvas on the Google Fonts files. Checked against an independent table
from a shipped project: Hebrew letter height agrees within 0.005em (Assistant
400 0.557 vs 0.555, Frank Ruhl 500 0.600 vs 0.597), `ch` identical (Assistant
0.492), and the air `text-box-trim` leaves above Hebrew agrees within 0.02em.
Two findings:
- The browser trims to the font file's cap-height metric, not the H glyph. For
  Assistant the file says 0.75 while the H is 0.66, so the trim residue is
  measured by rendering, not derived.
- `ch` is not a Hebrew character: 1ch holds 1.15 Hebrew characters in
  Assistant, 1.18 in Heebo, 1.33 in Frank Ruhl, 1.35 in Rubik. Measures are
  written in Hebrew characters and converted per face.

**Contrast**: the generator's matrix reproduces the institutional site's
published matrix pair for pair (13.70, 7.94, 4.78, 4.90, 14.41, 8.35, 5.03, 5.16,
12.36, 7.16, 11.08, 6.42; navy 14.89).

**Proofs**: all four packs render the specimen with 0 contrast failures, no line
over 70 characters and no body under 16px, at 1440 and 390; `drift` finds 0
bypasses in the specimen. Rendering exposed one bug in the specimen itself (an
unisolated time range showing reversed); it led to the bidi check in
visual-verify, which now catches it.

**rem, not px**: at a 125% browser default the rem build takes body 17→21.25px;
a px build stayed at 17. **`.sp-flow`** in Chromium against a theme's
`.entry-content p { margin: 0 0 2em }` and a page builder's h2 rule: 24px
between paragraphs, 64px before h2, 24px after (proximity 64 ≥ 2×24), nested
flow 24px, 32px outside untouched. **`.sp-display`** with measured glyph-w 0.452
spans 84% of its region for a fill of 80%: a measuring tool, not a token.

**The tweaks-bar loop**: tested end to end in Chromium: `use` → page with the
bar → accent-deep set by eye → Export → `apply` → `pack.json` and `tokens.css`
carry it, and it survives a full rebuild.

## Deliberately open

- **The candidates are one designer's taste**, not yet the Art Director's and
  not yet a project's. They stay `candidate` until one ships.
- **`quiet-retail` completes roles** its shipped site did not have; they are
  listed in the pack's `derived` and are not proven.
- **Coupling is a default in the canon and the specimen**, not a token; a
  project's composition spec may tune it (L1).
- **`drift` reads CSS by pattern**, not by the cascade: it sees `<style>`
  blocks, local stylesheets and inline styles, not CSS built at runtime.
- **Tracking**: the institutional pack forbids letter-spacing on Hebrew
  entirely; the retail site shipped 0.06em labels. The canon allows ≤0.06em on
  labels as a recorded pack choice.

## The next round

1. `selftest.mjs` and `cli.mjs proof all`; `compare` and look.
2. Promote a candidate that shipped: set `status: proven`, record the project
   by its register, never its name.
3. Harvest any project that shipped well into a new pack.
4. Re-measure fonts if Google updated a family (`measure-fonts.mjs`).
