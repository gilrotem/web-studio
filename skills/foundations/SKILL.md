---
name: foundations
description: Stage 2 of a site. Builds the design foundations one at a time, in a fixed order (colour, surfaces and skins, skeleton, spacing, typography, design assets, design system), each measured, rendered, presented once and locked in writing, and writes them into design/spec/tokens.css and design/spec/design-system.md. Includes measuring a reference from its CSS, computing contrast, the element-first route when a sheet is rejected, and tools for portraits, textures and render measurement. Use when the user says "foundations", "colour scheme", "palette", "surfaces", "grid", "spacing", "typography", "design system", "tokens", "סכמת צבעים", "משטחים", "טיפוגרפיה", "דיזיין סיסטם", or when Stage 1 is locked and no tokens exist.
---

# Foundations — one at a time, each to a lock

Input: the locked contract, the bar, the audit and the type proposal (Stage 1), and the locked
architecture (`design/spec/ia.md`). Output: `design/spec/tokens.css` and
`design/spec/design-system.md`, growing one section per lock, then `composition.md` and
`components.md`.

The creative concept comes after this stage on purpose. Foundations give the concept a settled,
harmonious ground to stand on, so the concept is built on tokens and not on improvisation.

Taste is `signature`. This skill is the order, the measuring and the gate.

## The order, and why it is fixed

colour → surfaces and skins → skeleton (grid, axes, composition) → spacing → typography →
design assets → design system.

Each foundation is built on the ones before it and is judged *in use*. Colour cannot be judged
without a surface to sit on; a grid cannot be judged without surfaces to place; spacing is the
grid's rhythm; type is set into that rhythm; icons and dividers are drawn at the type's weight;
the system is what all of it adds up to, with states. Reordering it makes each sheet ask the Art
Director to imagine the parts that do not exist yet.

One foundation per presentation. Two may share a session when the first locks inside it. A
foundation that is not reached yet is an empty, labelled section in `design-system.md`; nothing
is inferred into it ahead of its lock.

## What every foundation goes through

1. **Read what binds it.** The rulings in `DECISIONS.md` (quote them), the contract's
   Guardrails, the client's own words about look and feel (read with the Art Director in the
   stage, not interpreted alone), the bar's written lines.
2. **Measure.** The brand from its vector file. The reference the client likes from its DOM and
   CSS (below). Nothing by eye.
3. **Build it in use.** A rendered, composed sheet at 1440 and 390 with the real logo, the real
   strings from the content map, real imagery and the real typeface. Never swatches and boxes.
4. **Review it privately** (`visual-verify`, REFINE): render, name the single weakest thing, fix
   it at the root, render again. Then put it next to `design/references/bar/`.
5. **Present once**, with one closing question that names the scope and says what is not
   covered.
6. **On the written lock**: append the tokens under their own header in `tokens.css`, fill the
   section in `design-system.md` and mark it "locked D-nnn, date", quote the ruling into
   `DECISIONS.md`, save the sheet under `design/review/<date>-<foundation>/`.

Each section of `design-system.md` ends with "Not settled here": what this foundation showed but
did not decide.

## Measuring a reference

When the client or the Art Director names a site they like, its values are read, not guessed.
With Chrome DevTools MCP (`navigate_page`, `evaluate_script`, `get_css_styles`) or Playwright:

- **Colour:** the computed background of the page, of the tinted bands and of every dark
  surface; text colours; a gradient's stops and angle; the shadow's colour, offsets and blur.
  Convert to OKLCH (`scripts/colour.py oklch`) and note the lightness run of any gradient.
- **Shape:** radii of cards, tiles, fields and buttons; border use; where sections overlap.
- **Type:** families actually loaded (from `document.fonts` and the network), sizes, weights,
  line-heights of the display, the body and the UI.
- **One component worth matching, traced whole:** padding, gap, sizes, weight, radius, every
  transition's property, duration and easing, any pseudo-element that animates.
- **A hover, in time:** screenshots at 60, 150, 300, 500 and 900 ms after the pointer enters, so
  the curve is seen.

Save the captures under the review folder in a sub-folder named for the site. Write what was
measured into the foundation's section under "What was measured", labelled with the site and
"measured in the DOM". The reference is the floor, not the ceiling: its hygiene and its air are
matched; the level is the bar's.

Measure your own render the same way before claiming a difference:
`python -I ${CLAUDE_SKILL_DIR}/scripts/measure_render.py render.png` gives the dark share, the
flat share and the lightness range of a screenshot or of one boxed region of it.

## 1. Colour

Decide **roles**, not a list:

- The grounds: the page ground and at most one tint.
- The ink: body and heading text on light; a muted ink for secondary text.
- The brand colour that acts on light grounds (links, numerals, small marks).
- The family that carries dark surfaces: one hue in a few lightness steps reads as a system;
  several unrelated darks read as noise.
- Text on dark: the full, the secondary, the muted, and on which steps each is allowed.
- Status colours for forms only, on light and on dark.
- A hairline colour that is never text.

Rules that held up:

- The logo's colours are measured from the vector file and stay in the logo unchanged. The
  interface takes the ones that work and adds relatives (darker, lighter) for the roles the
  logo's own colours fail. A logo colour that fails contrast as text stays as decoration.
- Every text role on every ground it may sit on gets a computed ratio, in a table. Include the
  awkward cases: text at a hover's faded opacity (`over()` in `colour.py`), text crossing a
  texture line, text on the lightest point of a gradient.
- The table has "not allowed" rows. A forbidden pair is written down, with its ratio.
- Tokens are OKLCH with hex fallbacks measured to the same sRGB, hex first, OKLCH inside
  `@supports (color: oklch(0% 0 0))`. Every token carries a comment: its OKLCH value, its role,
  and its key ratio.
- Judge dark surfaces on a whole page, not on a swatch. A dark skin that looks rich at 300 px
  wide can be heavy at full width. Measure the dark share of the full-page render and compare
  the gradient's lightness run with the reference's.

Tools: `python -I ${CLAUDE_SKILL_DIR}/scripts/colour.py ratio|oklch|table` (standard library
only). `table` prints the Markdown contrast table from a colours file and a pairs file.

The colour sheet shows: the roles with their values and ratios, the brand as measured, the
reference as measured, real text set on every allowed ground at 390, and the primary button in
its states.

## 2. Surfaces and skins

Decide a short numbered set of surfaces (about five carries a whole site), each with what it is
and where it appears: for example the ground, the tint band, the white surface flat or lifted,
the gradient panel, the field. Then the cross-cutting rules:

- **Light.** One light per dark field, placed behind the dominant element, its position a pair
  of custom properties so each use can aim it. A second, weaker rise so no part of the field is
  flat. Check with the flat share.
- **Relief or texture.** One at most. A seamless vector tile used as a CSS mask, coloured by
  tokens, visible where the light falls. `scripts/contours.py` makes a contour-line tile; use the
  subject's own texture when it has one.
- **Photograph.** How a portrait or a product sits in a surface: cut out and standing in the
  field with the light passing behind it, or kept with its backdrop regraded to the palette.
  `scripts/matte.py cut` and `scripts/matte.py swap` do both for a studio portrait on a plain
  backdrop. Check every edge at full size on a light and on a deep ground. A real person's
  photograph is used only with the approval the project's rules ask for; generated people are
  never shown as real.
- **Radius.** A policy in three values at most (for example 0 for panels, cards and images, 2
  for fields, a full pill for buttons). A uniform mid radius everywhere is a banned pattern.
- **Elevation.** Flat plus two steps. Shadows tinted toward the dark hue, two layers each.
- **Edges.** Where hairlines are allowed (rows, fields, card footers) and that panels and cards
  never carry a frame.
- **Continuation.** How sections join: an overlap, a surface that straddles a section edge, a
  texture that starts early on the ground before a field. Measure the overlaps on the sheet and
  put them in tokens, with their mobile values.
- **The primary control's skin**, on light and on dark, with its hover as measured or designed.

The surfaces sheet shows each surface *in use* on real blocks of the site at both widths, not a
legend of rectangles. If text ever sits on a photograph, a scrim is defined here with its ratio;
if no surface puts text on a photograph, say so under "Not settled here".

## 3. Skeleton: grid, axes, composition

For each template type in `ia.md`, at 390 and 1440: the column grid and gutters, the named axes
that elements align to across sections, the container budget (fewer containers than scenes), the
dominant element of each viewport, where the action sits, and how the long-form template carries
its longest and its shortest page. Output: `design/spec/composition.md`. Presented as real
compositions with real content on the locked surfaces, never as wireframes.

## 4. Spacing

One scale and its rhythm: the steps, which steps separate sections, blocks, groups and lines,
and the mobile values. Rendered on the skeleton's compositions so the rhythm is seen across a
whole scroll. Output: spacing tokens and a section in `design-system.md`.

## 5. Typography

The pairing was proposed in Stage 1 from the bench the contract allows; it is locked here, with
the tokens, after a pass on a real phone.

- Roles: display, subhead, body, UI, numerals. For each: family, weight (and width where the
  family has the axis), size as a fluid clamp, line-height, measure.
- The script's rules. For Hebrew (`hebrew-rtl-israel`): no letter-spacing, body 17 to 19 px at
  1.65 to 1.7, measure 55 to 65 characters, `text-wrap: balance` on headings, tabular figures,
  `<bdi>` around digits and Latin runs.
- Hierarchy from scale, weight and width, since most competitors set one sans at two weights
  with no scale. A variable family with two axes gives hierarchy inside one family, with no
  pairing seam and one subset to preload.
- The contract's type rule is quoted, not reargued. If the Art Director ruled a class of faces
  out (for example "no serif anywhere"), the `signature` default for that class does not apply
  to this project.
- Font files are a separate, lighter task: variable WOFF2 subsets per script via
  `unicode-range`, the main script's subset preloaded, `size-adjust` and ascent/descent
  overrides on the fallback stack so the swap does not shift layout (`asset-pipeline`).

The type sheet sets the client's real strings at both widths: the longest heading, the shortest,
a long paragraph, a list, figures, the action.

## 6. Design assets

The icon set (drawn for this site at the type's weight, never a generic line set), the logo as
SVG with its usage rules (the reverse for dark surfaces is a usage rule; the logo itself does not
change), dividers, and the graphic language of any recurring diagram (a process flow, a
timeline). Custom icons are a no-compromise item: they get their own sheet and their own lock.

## 7. Design system

`design/spec/components.md`: every component with its states (rest, hover, focus-visible,
active, disabled, loading), its tokens and its mobile form. Hover states are designed as a
system here, not inherited from how one button happened to look on the colour sheet. Then mount
the `tweaks-bar` on the sheets so the Art Director can move the scale, the accent, the spacing
and the motion by eye and export the result.

Done when every token the sheets use exists in `tokens.css`, every section of `design-system.md`
is locked or explicitly empty, and nothing in a sheet uses a raw value.

## The element-first route

Use it when a foundation sheet comes back rejected, or when a lock made on a sheet fails on a
whole page.

1. Do not make another sheet of the same kind, and do not build a whole page.
2. Measure what the remark points at (`studio` skill, `references/practices.md`, "Reading the Art
   Director's words"), and if a lock is involved, ask one question to reopen its named part.
3. Build **one real element alone, to the end**: usually the hero, at 1440 and 390, with the real
   content, the real photograph, the real logo and its states. Keep it as a live HTML file as
   well as renders, so it can be opened.
4. Present that element alone. Ask whether it stands as the basis for the foundation. This is
   not yet the foundation's lock.
5. When it stands, derive the foundation from it: the colours it actually uses, the surfaces it
   implies, the overlaps and positions it measures. Bring that back as one sheet, showing the
   scheme in use on other blocks of the site, for one lock.
6. Edit `tokens.css` only then.

What this route protects: the Art Director judges a finished thing, and the abstract scheme is
read off something that already works.

## Files this stage writes

- `design/spec/tokens.css`: one header per foundation, each naming the decision that locked it.
  Components use roles, never raw values.
- `design/spec/design-system.md`: one numbered section per foundation: "How it got here" when a
  lock was reopened, "What was measured", the scheme or the set, the rules, the contrast table,
  "Not settled here".
- `design/spec/composition.md`, `design/spec/components.md`.
- `design/review/<date>-<foundation>/`: the sheet (HTML and PNG), a standalone HTML of any live
  element, the measured reference captures, and the build script if a script built the sheet.

A sheet built by a small script (reading the strings from the content map, computing the ratios
it prints) stays reproducible: the script is kept beside the sheet. Scripts in a review folder
are evidence, not tools; anything reusable belongs in this skill's `scripts/`.

## Tools in `${CLAUDE_SKILL_DIR}/scripts/`

| Script | Does | Needs |
|---|---|---|
| `colour.py` | hex to OKLCH, one contrast ratio, a contrast table, a colour at an opacity over another | Python standard library |
| `measure_render.py` | dark share, flat share and lightness range of a render or a region | numpy, Pillow |
| `matte.py` | cut out a studio portrait to RGBA, or swap its backdrop for palette colours | numpy, Pillow, scikit-image |
| `contours.py` | a seamless contour-line SVG tile for use as a mask | numpy, scikit-image |

Run them with `python -I`. `matte.py` and `contours.py` were ported from the scripts that made a
locked hero; `measure_render.py` was written for the kit to make the practice of measuring a
render repeatable, and has been run only on test images so far.
