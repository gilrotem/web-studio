---
name: system-packs
description: The kit's Hebrew type-and-space packs — type roles, spacing, colour roles and measured contrast as one tested bundle — and the canon every pack obeys (floors, Hebrew technique, measures in Hebrew characters, coupling, the proximity law). Use in the foundations stage when a project's type and space start from a pack, when choosing Hebrew fonts or line-heights, when a page drifts off its scale, or when the user says "design system", "דזיין סיסטם", "טיפוגרפיה", "מרווחים", "tokens".
---

# System packs — Hebrew type and space, proven

A pack is a complete type-and-space system: faces, nine roles (size, weight,
line-height and family each), measures in real Hebrew characters, eleven spacing
steps, colour roles with the contrast of every allowed pair measured, grid,
shape and motion. Every pack speaks the same grammar (`CANON.md`), so a page
built against the names can be re-skinned by swapping the pack.

`CANON.md` is the law: three authority levels (L0 laws, L1 definitions, L2
concept freedom), floors, Hebrew technique, coupling and the proximity law. Read
it before tuning anything. `signature` still owns taste; its typography numbers
are the canon's.

## The packs

```bash
node ${CLAUDE_SKILL_DIR}/cli.mjs list
```

| pack | status | for |
|---|---|---|
| `institutional` | proven | institutional, humane: one family in two voices, cream, charcoal, gold, navy |
| `quiet-retail` | proven | quiet luxury retail: Assistant 300 to 600, black on white, no containers |
| `editorial` | candidate | professional services: Noto Serif Hebrew statements, Assistant text, paper and oxblood |
| `bold` | candidate | service trades: Heebo 800 to 400, white, green, a yellow fill |

**Proven** means a shipped project stands behind the values; `quiet-retail`
lists the roles it had to complete (`derived`). **Candidate** means it passes
the canon and renders clean, and becomes proven only when a project ships on it.

## Use in a project (the foundations stage)

Run from the project root:

```bash
node ${CLAUDE_SKILL_DIR}/cli.mjs use editorial      # design/spec/pack.json + tokens.css + type-and-space.md
node ${CLAUDE_SKILL_DIR}/cli.mjs check              # the project's pack against the canon
node ${CLAUDE_SKILL_DIR}/cli.mjs build design/spec/pack.json --out design/spec/tokens.css
node ${CLAUDE_SKILL_DIR}/cli.mjs build design/spec/pack.json --classes --out design/spec/tokens.css   # + .sp-flow, .sp-display
node ${CLAUDE_SKILL_DIR}/cli.mjs drift design/build/index.html   # values in a page that bypass the tokens
node ${CLAUDE_SKILL_DIR}/cli.mjs apply export.css   # a tweaks-bar Export back into the pack, rebuilt
node ${CLAUDE_SKILL_DIR}/cli.mjs proof              # the project's pack on the specimen, measured
node ${CLAUDE_SKILL_DIR}/cli.mjs swap "David Libre 500" "Assistant 700"   # the optical-size factor
```

- When a project starts from a pack, **`design/spec/pack.json` is the one source**
  and `tokens.css` is generated from it: edit the pack, never `tokens.css`. `use`
  replaces only the blank `tokens.css` birth lays down; real tokens are not
  overwritten without `--force`.
- The order matters (CANON 1): the pack is provisional, the hero is decided by
  eye, the pack is tuned to the hero, then frozen with the foundations lock.
- A composition move outside the scale is legal as a **named** token
  (`--hero-overlap`); an anonymous number is drift.
- `proof` and `measure-fonts.mjs` render in Chromium through the
  `visual-verify` harness: Playwright resolved from the project.

## Proving a pack, and adding one (kit development)

From a clone of the kit (outputs go to `_proof/`, git-ignored):

```bash
node skills/system-packs/cli.mjs proof all     # the specimen in every pack, measured
node skills/system-packs/cli.mjs compare       # _proof/sheets/: fold, desktop, phone side by side
node skills/system-packs/selftest.mjs          # the checker catches what it must (28 checks)
node skills/system-packs/cli.mjs new <name> --display "Heebo 800" --text Heebo --body 17,19 --ratio 1.2,1.25 --density 1 --measure 60 --colors bold
```

`new` is a starting point for the eye, never a finished pack. A new pack enters
as `candidate`, must pass `check`, must render clean in `proof` (no contrast
failure, no bypass in `drift`), and is shown to the Art Director on the
`compare` sheet. A project that ships well is harvested back as a pack, without
its name. A font not in `fonts.json` is measured first:
`node skills/system-packs/measure-fonts.mjs "Family:400,700"`.
