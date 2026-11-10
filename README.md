# web-studio

A web design studio for Claude Code. It takes a site from a partial client specification to a
launched, measured build, one stage at a time, each stage closed by the Art Director's written
lock. It is a Claude Code plugin: install it once and it dresses any project, or gives birth to
a new one.

It is the method, the skills, the tools and the research. It holds no project: no client, no
contract, no tokens, no decisions. Those are born inside each project from blank templates.

Hebrew and RTL first (the Israeli market is the measured case), usable for any language: the
language is a field in the contract.

## What it does, in order

| # | Stage | What comes out | Skills |
|---|---|---|---|
| 0a | Specification: content | the client's files copied, extracted and indexed; a map of every text page by page, each area marked have / ask / write / legacy; the gaps table; one message to the client | `content-map` |
| 1 | The bar and the contract | the contract; 5 to 8 shipped sites that set the level, a written line each; a measured category audit; a type proposal; a feasibility note per candidate effect | `studio-research`, `mobbin-research`, `craft-research` |
| 0b | Specification: architecture | pages, navigation, recurring blocks, template types and their order, slugs, the title pattern | `site-architecture` |
| 2 | Foundations | colour → surfaces → skeleton → spacing → typography → assets → design system, each measured, rendered and locked; `tokens.css` and `design-system.md` | `foundations`, `signature`, `hebrew-rtl-israel`, `tweaks-bar` |
| 3 | The concept world | the art-direction document, the motion spec, imagery, a video when the concept earns one | `studio-art-direction`, `motion-language`, `fal-image`, `asset-pipeline`, `webgl-atmosphere`, `video-production` |
| 4 | Build | the hero alone first; then scene by scene; then the other templates by inheritance; a static site in clean code | `mode-site`, `mode-page`, `cinematic-build`, `gsap-*`, `animate`, `animation-performance`, `threejs-*`, `landing-pages` |
| 5 | Review | renders, motion recordings, measurements, a jury score; the single weakest thing fixed, repeatedly | `visual-verify`, `visual-review`, `jury`, `review-animations`, `web-design-guidelines` |
| 6 | Conversion and launch | the delivery format made from the locked static site; staging; live steps one at a time | `wp-theme`, `landing-pages` |

The method itself (roles, the one-direction rule, the lock, how a session opens and closes, the
model per kind of work, the confirm-first list) is the `studio` skill. What was learned running
it on real work is `skills/studio/references/practices.md`.

## Install

The repository is private; the GitHub account behind the Claude Code session needs read access.

```
/plugin marketplace add gilrotem/web-studio
/plugin install web-studio@web-studio
```

To pin a project to a version, add the marketplace at a tag in the project's
`.claude/settings.json`:

```json
{
  "enabledPlugins": { "web-studio@web-studio": true },
  "extraKnownMarketplaces": {
    "web-studio": {
      "source": { "source": "github", "repo": "gilrotem/web-studio", "ref": "v1.0.0" },
      "autoUpdate": false
    }
  }
}
```

A project that must carry the skills inside its own repository (a machine or an account where
the plugin cannot be installed) is vendored instead, from a clone of this repository:

```powershell
powershell -ExecutionPolicy Bypass -File tools\vendor.ps1 -Target C:\path\to\project -WithMcp
```

Plugin and vendored installs are not combined in one project.

## Start a project

In the project's folder (an existing repository or an empty folder):

```
/web-studio:birth
```

It says what exists, asks the birth questions in one round, shows the list of files it will
create, and on a yes lays down the studio folders and blank templates, checks the toolchain and
the connections, and proposes a block for the project's `CLAUDE.md` (never edited without an
explicit yes). Then:

```
/web-studio:stage            run the next stage named in STATUS.md
/web-studio:lock <what>      record the Art Director's written lock in DECISIONS.md
/web-studio:close            close the session: evidence, STATUS.md, commit on a yes
```

## Commands

| Command | Does |
|---|---|
| `/web-studio:birth` | dress an existing repository or start a new project |
| `/web-studio:stage` | run the next stage, or the one named: one unit of work to one presentation |
| `/web-studio:lock` | record a written lock, verbatim, with what it covers and what it does not |
| `/web-studio:close` | close a session |
| `/web-studio:site` | SITE mode: a multi-page site from scratch |
| `/web-studio:page` | PAGE mode: one landing or marketing page from scratch |
| `/web-studio:verify` | render and review: the refine loop, or the fidelity gate |
| `/web-studio:inspire` | search Mobbin for UX patterns on a described concept |
| `/web-studio:screen-audit` | find the screens and flows we did not think of |
| `/web-studio:pull-app` | pull one app's screens from Mobbin with a manifest |
| `/web-studio:extract` | turn reference images into spec files (when a source must be reproduced) |

## Skills (42)

**Method and setup**
- `studio`: the method and router. References: `practices.md`, `plan-template.md`,
  `definition-of-done.md`, `truth-files.md`, `session-briefs.md`.
- `studio-birth`: sets a project up. Carries the scaffold (contract, studio brief, client spec,
  status, decisions, design system, tokens, the bar, the audit, feasibility, type proposal,
  launch config, env example), the connections guide and `check-toolchain.ps1`.

**Specification**
- `content-map`: the content library, the map, the gaps, the one client message. Scripts:
  `docx_to_text.py`, `build_map_index.py`, `build_content_doc.py`, config-driven.
- `site-architecture`: `ia.md` and the sitemap sheet. Reference: `ia-template.md`.

**Research**
- `studio-research`: Stage 1: the brief, the audit, the reference hunt, the feasibility note.
- `mobbin-research`: three sanctioned ways to use Mobbin as a reference library.
- `craft-research`: the state-of-the-craft research (November 2026), in full with sources: one
  report and five notes (the design bar, the execution stack, motion and material, agent design
  method, Hebrew/RTL/Israel), and how to re-run it.
- `extraction-protocol`: reference images into machine-readable spec files.

**Design**
- `signature`: the Art Director's taste and the premium bar.
- `foundations`: Stage 2, one foundation per lock, the element-first route. Scripts: `colour.py`
  (OKLCH and contrast), `measure_render.py` (dark share, flat share), `matte.py` (portrait
  cut-out and backdrop swap), `contours.py` (a seamless contour tile).
- `hebrew-rtl-israel`: Hebrew and RTL craft; Israeli accessibility and privacy law; conventions.
  Script: `rtl-lint.mjs`. Reference: an accessibility statement template in Hebrew.
- `studio-art-direction`: one direction, pitched; the art-direction document; banned patterns.
- `motion-language`: the motion spec and the engine per scene.
- `tweaks-bar`: a live panel that edits tokens by eye and exports CSS.

**Media**
- `fal-image`: the one image pipeline on fal.ai: `generate.mjs`, `edit.mjs`, `gate.mjs`, job
  routing, tier-aware sizing, a run ledger.
- `asset-pipeline`: responsive images, video loops and posters, frame sequences, SVG, font
  subsets, OG images.
- `video-production`: a silent looping brand video from the client profile to the page:
  templates for the profile and for the concept and script, the fal.ai production pipeline, the
  genre's vocabulary and references, and a research document on AI motion-video production.
- `webgl-atmosphere`, `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`,
  `threejs-asset-pipeline`: when a scene earns WebGL, and how.

**Build**
- `mode-site`, `mode-page`: the two generative modes.
- `cinematic-build`: the scaffold (Vite, CSS layers, tokens, GSAP, Lenis), RTL first.
- `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`,
  `gsap-performance`, `gsap-react`, `gsap-frameworks`.
- `animate`, `animation-performance`.
- `landing-pages`: WordPress-safe single pages.

**Review**
- `visual-verify`: the screenshot loop, REFINE and FIDELITY.
- `visual-review`: render, record motion, measure, critique. Scripts: `capture.mjs`,
  `record-motion.mjs`.
- `jury`: an Awwwards-style score from evidence. Scripts: `shoot.mjs`, `audit.mjs`.
- `review-animations`, `web-design-guidelines`.

**Delivery**
- `wp-theme`: a hand-coded WordPress hybrid theme made from the locked static site.

## Connections

Three MCP servers come with the plugin (`.mcp.json`, Windows form): Playwright, Chrome DevTools
and Mobbin (Mobbin needs an OAuth sign-in through `/mcp`). Image and video generation use a
fal.ai key that lives in each project's git-ignored `.env.local`, never here. The local toolchain
is Node, Python with numpy, Pillow and scikit-image, ffmpeg, and Playwright, axe-core and sharp
installed in the project. All of it, with install commands and the macOS/Linux form of the MCP
config, is in `skills/studio-birth/references/connections.md`.

## Repository layout

```
.claude-plugin/   plugin.json, marketplace.json
.mcp.json         the MCP servers the plugin declares
skills/           42 skills (each a folder with SKILL.md, plus scripts/, references/, scaffold/)
commands/         11 slash commands
tools/vendor.ps1  copy the kit into a project's own .claude/
docs/             PROVENANCE.md (where each part came from, licences), licences/
CHANGELOG.md
```

## Changing the kit

The kit changes only here, in its own repository, and ships as a tag. A project never patches
the kit from inside: a lack found in a project is written in that project's `STATUS.md` under
"For the kit" and fixed here. Bump the version in `.claude-plugin/plugin.json` and
`marketplace.json`, add a line to `CHANGELOG.md`, tag.

Before anything is committed here, check it carries no project: no client name, no contract
value, no decision id, no path from someone's machine.

## Provenance and licence

Where each skill came from, and the licences of the parts that were not written here, is in
`docs/PROVENANCE.md`. The repository is private; several carried packs have no licence recorded
in their files, so it is not to be made public before that is checked.
