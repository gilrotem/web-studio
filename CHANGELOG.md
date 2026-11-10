# Changelog

## 1.1.0 — 2026-11-10

- Host mode: in a project whose `CLAUDE.md` carries `Kernel: agency-harness`, the kit runs as
  the design practice. Birth lays down only design folders and files (no root `STATUS.md` or
  `DECISIONS.md`, `CLAUDE.md` untouched); the design state is `docs/design/STATE.md`;
  `/web-studio:lock` appends to the kernel's `DECISIONS.md` in the kernel's entry format;
  `/web-studio:close` updates the design state and leaves closing to the kernel; `/web-studio:stage`
  reads the next stage from the design state. Standalone projects behave as in 1.0.2.
- Two jobs with fixed locks: a site in four (the bar and the contract; the foundations, as one;
  the concept with the hero; the full site), a page in two (the concept; the page). A lock per
  foundation, WebGL and video open only when the contract's `Opened` line names them. The method,
  the plan template, the stage command and the build skills follow it.
- The redesign review (`redesign-review`): before a redesign's design, the live site read as a
  designer and as a visitor, from public pages only. A keep-list is an input read for its list of
  pages only; URLs and redirects are not design work.
- Design ends at the lock: birth, the contract and every design stage name no platform. The
  WordPress conversion (`wp-theme`) and the WordPress constraints of `landing-pages` (moved into
  `wp-theme`) form the adaptation group, a separate job after the last lock.
- One model rule, written once in the `studio` skill: Fable for the specification, the design
  direction and the judgment of finished work; Opus for everything defined, one builder per page;
  Sonnet for a short defined task; Haiku for mechanical file work; the jury's critic never runs
  in the session that built the piece. The lines that banned builders as subagents and allowed a
  builder's self-score are gone.
- Straight through: questions are asked once, at birth (the contract's questions and the slug
  alphabet moved there); no mid-stage pitch for a go, no sheet for a nod, no re-check between
  locks; the jury is the one check before a lock.
- Ported from the old studio folder, after a file-by-file comparison: the image toolkit's queue
  calls, metered cost, `material`/`vector`/`plate-edit`/`fill` routes, `batch.mjs`, `sheet.py`,
  protocol and maintenance documents; the `fal-guard` hook, shipped as the plugin's PreToolUse
  hook; the render harness's measured contrast check (`visual-verify/scripts/verify.mjs`); the
  Hebrew type and space packs with their canon (`system-packs`); the signature's line-heights
  aligned to the canon (display 1.0–1.25, reading 1.5–1.8). No client names, no machine paths.
- An enforced imagery cap: the toolkit reads `**Imagery budget:**` from
  `design/spec/contract.md` (`USD <n> per project`, `USD <n> per month`, or `none`) and refuses a
  run that would pass it, dry runs and the gate included; a batch is priced and refused whole.
  Every paid call is one line in `design/spend.jsonl`.
- Reproducible connections: `chrome-devtools-mcp@1.12.0` and `@playwright/mcp@0.0.84` pinned in
  `.mcp.json`; the macOS and Linux form documented; `web-design-guidelines` reads a dated snapshot
  of the guidelines instead of fetching them at run time.
- Selftests: `fal-image/selftest.mjs` (18 checks, no network), `visual-verify` (28 checks),
  `system-packs` (28 checks). `tools/vendor.ps1` also copies the hook and prints its settings block.

## 1.0.2 — 2026-11-10

- Published under the MIT licence (`LICENSE`).
- The four third-party skill packs were traced to their source repositories; their MIT notices
  are in `docs/licences/` and their sources in `docs/PROVENANCE.md`.

## 1.0.1 — 2026-11-10

- `video-production`: hands and silhouette are stated as the default for every film. A sharp
  face is an exception opened only by the project's lock plus the person's written agreement.
  Added the identity proof: the character sheet (stills) is checked for one consistent,
  recognisable person before any video money is spent on a face beat; if it fails after one
  corrected round, the film falls back to hands and silhouette.

## 1.0.0 — 2026-11-10

First packaging of the studio as its own plugin.

- 42 skills: the method (`studio`), project setup (`studio-birth`), specification (`content-map`,
  `site-architecture`), research (`studio-research`, `mobbin-research`, `craft-research`,
  `extraction-protocol`), design (`signature`, `foundations`, `hebrew-rtl-israel`,
  `studio-art-direction`, `motion-language`, `tweaks-bar`), media (`fal-image`, `asset-pipeline`,
  `video-production`, `webgl-atmosphere`, four `threejs-*`), build (`mode-site`, `mode-page`,
  `cinematic-build`, eight `gsap-*`, `animate`, `animation-performance`, `landing-pages`), review
  (`visual-verify`, `visual-review`, `jury`, `review-animations`, `web-design-guidelines`) and
  delivery (`wp-theme`).
- 11 commands: `birth`, `stage`, `lock`, `close`, `site`, `page`, `verify`, `inspire`,
  `screen-audit`, `pull-app`, `extract`.
- MCP servers declared by the plugin: Playwright, Chrome DevTools, Mobbin.
- The state-of-the-craft research of November 2026, carried in full.
- `tools/vendor.ps1` for projects that carry the kit in their own repository.
