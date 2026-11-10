# Type and space — the kit's canon

Generalised on 2026-09-26 from the type specification of a shipped institutional
site (the system that held) and the composition spec of the first project built
on it (right the first time). A pack sets the **values**; this file sets the
**grammar** every pack speaks and the **laws** no pack overrides. `signature`
still owns taste; nothing here decides a look. **Scope: sites and
pages.** Dense product UI is outside the packs until a dense canon exists.

## 1. Authority — three levels

- **L0 · Laws.** Section 4 and the floors of section 3. No session, concept or
  older document overrides them. Only the Art Director, as a recorded decision.
- **L1 · Definitions.** The project's role table and coupling table (its pack,
  as tuned). Changed only by a recorded decision with before/after renders of
  the specimen. An area session may *request* a change, with render evidence.
- **L2 · Concept freedom.** Which role an element takes; composition, grid,
  axes; which step separates areas; overlaps, offsets and bleeds through a
  **named** token (`--hero-overlap`), never an anonymous number; a one-off
  display size above display-1 through a named token.

**Conflict rule.** A document that contradicts L0 or L1 is not silently
followed: say so, propose the edit, continue with L0 and L1.

**Order of work.** Start from the pack as provisional tokens. Build the hero
by eye, leaving the tokens where the concept needs to. Then tune the pack to
the hero, and freeze. The scale follows the concept, never the reverse.

## 2. The grammar — shared names, per-pack values

Every pack declares all of these. A skeleton written against these names can
be re-skinned by swapping the pack.

**Faces:** `--font-display`, `--font-text` (optionally `--font-voice` for a
bounded third voice, e.g. Frank Ruhl in a notice).

**Roles** — each is a bundle: `--fs-*` size, `--w-*` weight, `--lh-*`
line-height, `--ff-*` family. Read a role whole:
`font: var(--w-display-2) var(--fs-display-2)/var(--lh-display-2) var(--ff-display-2)`.

| role | use |
|---|---|
| display-1 | the page's one statement (hero H1) |
| display-2 | section openers |
| display-3 | block headings inside a section |
| title | small headings: a card, a FAQ question, a list item's head |
| subhead | a secondary sentence inside a designed area; full ink, never grey |
| lead | the paragraph under a display heading |
| body | running text |
| small | secondary text, notes, footer text |
| label | kickers, tags, form labels, metadata |

**Measures:** `--measure-body`, `--measure-lead` in `ch`, generated from the
measured characters-per-`ch` of the text face (section 5).

**Colour roles:** grounds `--ground` `--ground-2` `--tint` `--mid`, hairline
`--line`; text `--ink` `--ink-2` `--ink-3`; accent `--accent` (fills, rules,
marks) and `--accent-deep` (accent as small text); `--accent-tint`; action
`--action` / `--on-action`; dark band `--band` / `--on-band` / `--on-band-2`.

**Space:** `--s1` … `--s11`. s1–s4 fixed (4 8 12 16 in every pack so far);
s5–s11 fluid from a phone value at 360 to a desktop value at 1320. Micro
spacing does not shrink on a phone; macro spacing shrinks a lot.

**Grid:** `--content`, `--gutter`, `--gap`. **Shape:** `--r-sm` `--r` `--r-lg`.
**Motion:** `--ease`, `--t`, `--t-slow`.

## 3. Floors (L0)

- body ≥ 16px everywhere (signature); small ≥ 14px; label ≥ 12px.
- Contrast: text 4.5:1 on its ground; 3:1 only for 24px+, or 18.66px+ at 700+.
  Every pack carries its measured matrix and the pairs it allows.
- Display line-height 1.0–1.25; reading text (lead, body, small) 1.5–1.8.
- Consecutive display steps differ by ×1.2 or more. In Hebrew, contrast is
  built from size and weight; a one-step-at-a-time hierarchy reads flat, so
  skip steps on purpose.
- A heading is distinguished from the text beside it by size ×1.5, or weight
  +200, or colour role; title over body leans on weight and on coupling.
- Every fluid size keeps a floor and a ceiling; ceiling ≤ 2.5 × floor.
- Sizes and spaces are in **rem**, never px: a visitor who raises the browser's
  default font size must get larger text (WCAG 1.4.4). Measured 2026-09-27: at
  125% the rem build takes body 17→21.25px; a px build stays at 17.
- Running text ≤ ~65 Hebrew characters per line (signature 2).

## 4. Technique (L0)

- `font-synthesis: none`. A weight that is not loaded must fail visibly.
- `em, i, cite { font-style: normal }`; `em` gets weight. Hebrew has no italic.
- Headings `text-wrap: balance`; reading text `text-wrap: pretty`;
  `hyphens: none`.
- **No letter-spacing on Hebrew running text.** A pack may track short labels
  up to 0.06em as a recorded choice (the quiet-retail pack does); never headings or sentences.
- Bidi: every phone number, date, email, URL and numeric range inside Hebrew
  is isolated (`<bdi dir="ltr">` or `unicode-bidi: isolate`).
- Real Hebrew punctuation: maqaf U+05BE, geresh U+05F3, gershayim U+05F4,
  `₪` after the number; a non-breaking space between a number and its unit.
- Light text on a dark band: headings drop one weight step (−100) inside the
  band only.
- `text-box-trim` is **off by default**. Hebrew letters sit below the Latin
  cap-height the browser trims to, so trimming leaves a per-font air gap above
  Hebrew (measured, `fonts.json` `trimAirTop`: Assistant 400 0.19em, Heebo
  400 0.125em, Noto Serif 0.07em). Turning it on needs a compensation token
  per role and a before/after render; never trim a heading that carries a
  background, border or padding.

## 5. Measure — why `ch` lies in Hebrew

`ch` is the width of "0", which is wider than an average Hebrew character.
Measured (`fonts.json` `perCh`, Hebrew characters per `ch`): Assistant 1.15,
Heebo 1.18, Noto Serif 1.19, Frank Ruhl 1.33, Rubik 1.35. So `60ch` is ~69
Hebrew characters in Assistant and ~80 in Rubik. The generator converts a
target in Hebrew characters into `ch` per pack; never write a raw `ch` measure.

## 6. Coupling — space after a role, inside an area (L1 default)

| from → to | space |
|---|---|
| label → display-2 / display-3 | s4 |
| display-1 → subhead / lead | s6 |
| display-2 → subhead / lead | s5 |
| display-3 → body | s3 |
| title → body | s3 |
| subhead → lead / body | s4 |
| lead → actions | s7 |
| body → body | s5 |
| anything → display-2 inside prose | s8 |
| anything → display-3 / title inside prose | s7 |
| figure → caption | s3 |
| list item → list item | s3 |

**Proximity law (L0):** the space before a heading group is at least twice the
space after it. Between areas: s8–s11, the concept's choice (L2).

**In a project**, running text (article, FAQ answers, legal) takes the opt-in
`.sp-flow` class (`build --classes`): it maps h2/h3/h4/p/li to roles and applies
this table as margins, with a doubled class (0,2,0) that beats a host theme
rule of one class plus one element. Designed areas do not use it; their coupling
is composed by hand from the same steps. `.sp-display` (a heading sized to its
region from the measured glyph width) is a measuring tool: find the size, then
freeze it as a step or a named token.

## 7. Optical equalisation when a face changes

Swapping a display face keeps the optical size by scaling each display size by
the ratio of measured Hebrew letter heights (`fonts.json` `hebrew`): David
Libre 500 (0.536) → Assistant 700 (0.576) gives ×0.93; a shipped project applied
×0.925 and kept its approved sizes. `cli.mjs swap "<font> <w>" "<font> <w>"` prints
the factor.
