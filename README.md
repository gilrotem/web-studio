# web-studio

A web design studio for Claude Code. It takes a site, or one page added to a site, from one
round of questions to a locked design built as a working site in clean code, in a small fixed
number of the Art Director's written locks. It is a Claude Code plugin: install it once and it
dresses any project, gives birth to a new one, or runs as the design practice inside a project
governed by the agency-harness kernel.

It is the method, the skills, the tools and the research. It holds no project: no client, no
contract, no tokens, no decisions. Those are born inside each project from blank templates.

Hebrew and RTL first (the Israeli market is the measured case), usable for any language: the
language is a field in the contract.

## How it runs

Questions are asked once, at birth. Between two locks the builder receives a locked
specification and builds. One check before the Art Director sees a piece: the jury, by a critic
that did not build it. Then the lock. No platform enters a design session: the design ends at
the last lock, and adapting it to where it will run is a separate job.

**A site** (new, or a redesign of a live one): four locks.

| Stage | What comes out | Ends on |
|---|---|---|
| R — Redesign review (a redesign only) | the live site read as a designer and as a visitor, from public pages; a keep-list, when one exists, read for its pages only | feeds lock 1 |
| 1 — The brief | the content map and its gaps; the contract; the bar (5 to 8 shipped sites); a measured category audit; the type proposal; the feasibility note; the architecture | **lock 1: the bar and the contract** |
| 2 — Foundations | colour → surfaces → skeleton → spacing → typography → assets → design system, built in order and shown together | **lock 2: the foundations** |
| 3 — The concept and the hero | the art direction, the motion spec, the hero's imagery under the cap, the hero built alone to the end; the jury | **lock 3: the concept with the hero** |
| 4 — The full site | every page by inheritance; measurements; the jury; the weakest thing fixed until the gate holds | **lock 4: the full site** |

**A page** (one page or area added to an existing site): two locks: the concept (with the first
view built and judged), and the page.

A lock per foundation, WebGL and video open only when the contract asks for them. Who does what,
on which model, is one rule in the `studio` skill: Fable for the specification, the direction
and the judgment of finished work; Opus for everything defined (one builder builds a page whole);
Sonnet for a short defined task; Haiku for mechanical file work; the jury's critic never runs in
the session that built the piece.

## Install

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
      "source": { "source": "github", "repo": "gilrotem/web-studio", "ref": "v1.1.0" },
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

It says what exists and which mode applies, asks the birth questions in one round, shows the
list of files it will create, and on a yes lays them down and checks the toolchain and the
connections.

- **Standalone:** the design folders and templates, plus the kit's own `STATUS.md` and
  `DECISIONS.md`, and a proposed block for the project's `CLAUDE.md` (never edited without an
  explicit yes).
- **Host mode**, in a project whose `CLAUDE.md` carries `Kernel: agency-harness`: the design
  folders and files only. The design state lives in `docs/design/STATE.md`; locks are entries in
  the kernel's `DECISIONS.md` in the kernel's format; the kernel's close ends the session.

Then:

```
/web-studio:stage            run the next stage named in the design state
/web-studio:lock <what>      record the Art Director's written lock, verbatim
/web-studio:close            close a design session (in host mode, before the kernel's close)
```

## Commands

| Command | Does |
|---|---|
| `/web-studio:birth` | set a project up: standalone, or the design folders of a kernel project |
| `/web-studio:stage` | run the next stage, or the one named, straight through to its lock |
| `/web-studio:lock` | record a written lock, verbatim, with what it covers and what it does not |
| `/web-studio:close` | close a design session |
| `/web-studio:site` | the site job: a new site or a redesign, four locks |
| `/web-studio:page` | the page job: one page or area added to a site, two locks |
| `/web-studio:verify` | render and measure: the refine loop, or the fidelity gate |
| `/web-studio:inspire` | search Mobbin for UX patterns on a described concept |
| `/web-studio:screen-audit` | find the screens and flows we did not think of |
| `/web-studio:pull-app` | pull one app's screens from Mobbin with a manifest |
| `/web-studio:extract` | turn reference images into spec files (when a source must be reproduced) |

## Skills (44)

**Method and setup**
- `studio`: the method and router: the two jobs and their locks, straight through, host mode,
  the one model rule. References: `practices.md`, `plan-template.md`, `definition-of-done.md`,
  `truth-files.md`, `session-briefs.md`.
- `studio-birth`: sets a project up in one round of questions. Carries the scaffold (contract,
  studio brief, client spec, the design state for host mode, status and decisions for
  standalone, design system, tokens, the bar, the audit, feasibility, type proposal, launch
  config, env example), the connections guide and `check-toolchain.ps1`.

**Specification**
- `redesign-review`: a live site read before its redesign, from public pages.
- `content-map`: the content library, the map, the gaps, the one client message. Scripts:
  `docx_to_text.py`, `build_map_index.py`, `build_content_doc.py`, config-driven.
- `site-architecture`: `ia.md` and the sitemap sheet. Reference: `ia-template.md`.

**Research**
- `studio-research`: the brief's research: the audit, the reference hunt, the feasibility note.
- `mobbin-research`: three sanctioned ways to use Mobbin as a reference library.
- `craft-research`: the state-of-the-craft research (November 2026), in full with sources.
- `extraction-protocol`: reference images into machine-readable spec files.

**Design**
- `signature`: the Art Director's taste and the premium bar.
- `foundations`: the foundations in order, to one lock. Scripts: `colour.py`, `measure_render.py`,
  `matte.py`, `contours.py`.
- `system-packs`: Hebrew type-and-space packs under one canon, a generator, a checker, a drift
  scan and a measured font table. Four packs; a selftest.
- `hebrew-rtl-israel`: Hebrew and RTL craft; Israeli accessibility and privacy law. Script:
  `rtl-lint.mjs`. Reference: an accessibility statement template in Hebrew.
- `studio-art-direction`: one direction; the art-direction document; banned patterns.
- `motion-language`: the motion spec and the engine per scene.
- `tweaks-bar`: a live panel that edits tokens by eye and exports CSS.

**Media**
- `fal-image`: the one image toolkit on fal.ai: `generate`, `edit`, `batch`, `gate`, `sheet.py`,
  job routing, tier-aware sizing, fal's queue and metered cost, an enforced imagery cap read from
  the contract, a spend ledger, a selftest. The plugin's `fal-guard` hook refuses direct calls.
- `asset-pipeline`: responsive images, video loops and posters, frame sequences, SVG, font
  subsets, OG images.
- `video-production`: a silent looping brand video, when the contract opens video.
- `webgl-atmosphere`, `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`,
  `threejs-asset-pipeline`: when the contract opens WebGL.

**Build**
- `mode-site`, `mode-page`: the build loops of the two jobs.
- `cinematic-build`: the scaffold (Vite, CSS layers, tokens, GSAP, Lenis), RTL first.
- `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`,
  `gsap-performance`, `gsap-react`, `gsap-frameworks`.
- `animate`, `animation-performance`.
- `landing-pages`: the craft floor of a landing or marketing page.

**Review**
- `visual-verify`: the screenshot loop, REFINE and FIDELITY; `scripts/verify.mjs shoot`
  measures contrast (sampled from pixels over media), type size, line length and RTL ranges.
- `visual-review`: render, record motion, measure, critique. Scripts: `capture.mjs`,
  `record-motion.mjs`.
- `jury`: an Awwwards-style score from evidence, by a critic that did not build the piece.
- `review-animations`, `web-design-guidelines` (a dated snapshot of the guidelines).

**Adaptation (after the last lock, a separate job; no design stage loads it)**
- `wp-theme`: a hand-coded WordPress hybrid theme, or a single page into a WordPress site, made
  from the locked design.

## Connections

Three MCP servers come with the plugin (`.mcp.json`, Windows form, versions pinned):
Chrome DevTools (`chrome-devtools-mcp@1.12.0`), Playwright (`@playwright/mcp@0.0.84`) and
Mobbin (an OAuth sign-in through `/mcp`). The macOS and Linux form is in
`skills/studio-birth/references/connections.md`. Image generation uses a fal.ai key that lives in
each project's git-ignored `.env.local`, never here, and spends under the cap written in the
project's contract. The local toolchain is Node, Python with numpy, Pillow and scikit-image,
ffmpeg, and Playwright, axe-core and sharp installed in the project.

## Repository layout

```
.claude-plugin/   plugin.json, marketplace.json
.mcp.json         the MCP servers the plugin declares, pinned
hooks/            hooks.json and fal-guard.mjs (the plugin's PreToolUse hook)
skills/           44 skills (each a folder with SKILL.md, plus scripts/, references/, scaffold/)
commands/         11 slash commands
tools/vendor.ps1  copy the kit into a project's own .claude/
docs/             PROVENANCE.md (where each part came from, licences), licences/
CHANGELOG.md
```

## Changing the kit

The kit changes only here, in its own repository, and ships as a tag. A project never patches
the kit from inside: a lack found in a project is written in that project's design state under
"For the kit" and fixed here. Bump the version in `.claude-plugin/plugin.json` and
`marketplace.json`, add a line to `CHANGELOG.md`, tag. The selftests to run after a change:

```
node skills/fal-image/selftest.mjs                  # the image toolkit and its cap, no network
node skills/visual-verify/scripts/verify.mjs selftest   # the render harness (Playwright resolvable)
node skills/system-packs/selftest.mjs               # the packs and the canon (Playwright resolvable)
```

Before anything is committed here, check it carries no project: no client name, no contract
value, no decision id, no path from someone's machine.

## Provenance and licence

MIT, © 2026 Gil Rotem (`LICENSE`). Use it, change it, build your own studio on it.

Four skill packs here were written by others and are carried under their own MIT licences: the
GSAP skills (GreenSock), the three.js skills (CloudAI-X), `animate`, `animation-performance` and
`review-animations` (Emil Kowalski), and `web-design-guidelines` (Vercel Labs). Their sources are
in `docs/PROVENANCE.md` and their notices in `docs/licences/`. If you want those packs at their
latest version, install them from their own repositories.

The research under `skills/craft-research/` is dated evidence (November 2026) with a source link
on every claim; it describes real public websites as they were read on that date.
