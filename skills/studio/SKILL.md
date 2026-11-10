---
name: studio
description: The studio's method and router: the two jobs (a site, a page) and their fixed locks, straight through from birth to the last lock, the contract and its three gates, the written lock, host mode inside a kernel project, how a session opens and closes, the one model rule, where every file lives, and which skill each stage loads. Read it first in any design session, when the user says "studio", "stage", "שלב", "נעול", "איפה אנחנו", "what's next", or whenever it is unclear which skill a piece of design work belongs to.
---

# Studio — how design work runs

This skill routes. Taste lives in the `signature` skill and in the project's own
`design/art-direction.md`; nothing else legislates taste. How each stage is done lives in that
stage's skill. What is true for one project lives in that project's files, never here.

Depth, loaded only when needed:

- `${CLAUDE_SKILL_DIR}/references/practices.md`: what was learned running this method on real
  work. Read it before presenting anything to the Art Director for the first time.
- `${CLAUDE_SKILL_DIR}/references/plan-template.md`: the plan a project copies and fills (the
  stages, the task per stage, the model per task, the lock each stage ends on).
- `${CLAUDE_SKILL_DIR}/references/definition-of-done.md`: the checklist a page or site closes on.
- `${CLAUDE_SKILL_DIR}/references/truth-files.md`: the formats of the state file and the
  decision entry, in both modes.
- `${CLAUDE_SKILL_DIR}/references/session-briefs.md`: how a stage session is briefed and started.

## Roles

- **The Art Director** is the person who owns the result. They give the inspiration, the answers
  at birth and the locks. They are not asked to supply references, to pick between screen
  variants, or to answer questions the skills can answer.
- **The agent designs, builds and reviews**, one surface at a time, to the end. Which model does
  which part is the one rule below.
- **The client** is the business the site is for. The agent never contacts the client. Anything
  that goes to the client (a question, a draft, a link) is drafted by the agent and sent by the
  Art Director, on their yes to the exact text.

## Straight through

The Art Director's time is the scarce thing, so the flow is built to spend it only where it
decides something:

- **Questions are asked once, at birth**, in one round (`studio-birth`). A stage never re-asks
  what birth asked, and asks nothing new: what it cannot settle from the files goes to "Not
  settled" and comes to the next lock.
- **Between two locks the builder receives a locked specification and builds.** No mid-stage
  pitch for a go, no sheet shown for a nod, no second reviewer re-checking the builder's work.
- **One check before the Art Director sees a piece: the jury** (`jury` skill), run by a critic
  that did not build it. Then the lock.
- Anything unusual is an exception, handled in its own session, and does not become a rule.

## The one-direction rule

One direction, presented with everything the stage has: rendered, composed, with imagery. A
second direction only when the Art Director asks for it or the brief genuinely splits. Never
three, never five. The effort goes into one presentation, not into breadth.

## Design ends at the lock

The design flow has one product: the locked design, with its functionality, built as a working
site in clean code (HTML, CSS, JS, Vite) under `design/`. That is where it ends.

- **No platform enters a design session**: not at birth, not in the contract, not in any stage.
  The designers are not told where the result will run. No server, hosting or account talk.
- The code is written well because it is good code: one template per page type, one partial per
  recurring block, tokens as the single source, no runtime assumptions.
- **Adaptation is another job**, opened after the last lock with its own brief and its own price:
  to WordPress, a builder, a CMS, a store, or a way of working a client asks for. The method is
  chosen when that job is opened. The kit's adaptation group (`wp-theme`) serves it; no design
  stage loads it or refers to it. Deployment, staging and backups belong to that job.

Why: platform constraints pushed into a design session weigh on the context and pull the
thinking out of the design. Adaptation can always be done afterwards; a design made while
distracted cannot be repaired afterwards.

## Two jobs, fixed locks

The number of locks is the Art Director's time, so it is fixed and small. The contract names the
job at birth.

| Job | For | Locks |
|---|---|---|
| **Site** | a new site, or a redesign of a live one | four: (1) the bar and the contract; (2) the foundations, as one; (3) the concept with the hero; (4) the full site |
| **Page** | one page, or one area, added to an existing site | two: (1) the concept; (2) the page |

**Opened only when the contract asks** (its "Opened" line, set at birth or by a lock): a lock per
foundation instead of one foundations lock; WebGL; video. Without that line, the
`webgl-atmosphere`, `threejs-*` and `video-production` skills are not loaded and the foundations
are presented once, together.

### The site job, in order

| Stage | Produces | Ends on | Skills |
|---|---|---|---|
| R — Redesign review (a redesign only) | `design/research/redesign-review.md`: the live site read as a designer and as a visitor, from public pages | feeds lock 1 | `redesign-review` |
| 1 — The brief | the content map and its gaps (`docs/content/`); the contract filled; the bar (5 to 8 shipped sites, a line each); the measured category audit; the type proposal; the feasibility note; the architecture (`design/spec/ia.md`); one sheet | **Lock 1: the bar and the contract** (the content baseline and the architecture with it) | `content-map`, `studio-research`, `mobbin-research` (UX patterns only), `craft-research`, `site-architecture` |
| 2 — Foundations | colour, surfaces, skeleton, spacing, typography, design assets and the design system, built in that order and presented once, in use; `tokens.css` (or `pack.json`), `design-system.md`, `composition.md`, `components.md` | **Lock 2: the foundations** | `foundations`, `system-packs`, `signature`, `hebrew-rtl-israel`, `tweaks-bar` |
| 3 — The concept and the hero | `design/art-direction.md`, `design/motion-spec.md`, the hero's imagery, and the hero built alone to the end at 390 and 1440, motion included; the jury | **Lock 3: the concept with the hero** | `studio-art-direction`, `motion-language`, `fal-image`, `asset-pipeline`, `mode-site`, `cinematic-build`, `gsap-*`, `animate`; `jury` |
| 4 — The full site | every page by inheritance from the hero; measurements; the jury; the single weakest thing fixed until the gate holds; the definition of done | **Lock 4: the full site** (the design is done) | `mode-site`, `cinematic-build`, `gsap-*`, `animate`, `animation-performance`, `asset-pipeline`, `visual-verify`, `visual-review`, `review-animations`, `web-design-guidelines`, `jury` |

Order notes:

- Stage R runs before stage 1 and only reads public pages. The list of URLs that must survive and
  the redirect map are not design work: when a keep-list file exists, the review reads only its
  list of pages (`redesign-review`).
- The content map and the bar run side by side inside stage 1; the architecture is written after
  both, because it reads the map's area names and the audit's "what the visitor expects".
- Foundations before the concept is deliberate: the creative conversation happens on a settled
  ground, so a concept is built on tokens and not on improvisation.
- Microcopy, legal texts and font files run alongside whatever stage is open. Creative copy (the
  hero line, section titles) is written in stage 3, since the direction decides the voice.

### The page job, in order

| Stage | Produces | Ends on | Skills |
|---|---|---|---|
| 1 — The concept | the host site's system read and measured (what the page must sit beside); one direction; the page's first view built and rendered at 390 and 1440; the jury | **Lock 1: the concept** | `mode-page`, `signature`, `studio-art-direction`, `fal-image`, `visual-verify`; `jury` |
| 2 — The page | the whole page built from the locked concept; measurements; the jury; the definition of done | **Lock 2: the page** | `mode-page`, `cinematic-build`, `gsap-*`, `animate`, `asset-pipeline`, `visual-verify`, `jury` |

The session-level plan, with tasks and the model per task, is the project's
`docs/design/PLAN.md`, made from `references/plan-template.md`.

## The contract and the three gates

`design/spec/contract.md` is the whole design brief: Job, Redesign, Language, Type budget,
Imagery budget (the cap the image toolkit enforces), Opened, Keep-list, the rulings it stands on,
Aesthetic, Reference (each source tagged TASTE or STRUCTURE), Intent (what, who, the one action,
recurring components), Brand assets, Guardrails, Signature, Tokens, Not settled. `null` means not
specified; it is never filled by invention. Content strings are the client's, verbatim. It names
no platform.

1. **Reference tier.** TASTE only for genuinely excellent work. A competitor is STRUCTURE. A
   site the client likes is STRUCTURE until the Art Director tags it TASTE. The level is set by
   `design/references/bar/`, never by a competitor or a liked site.
2. **Contrast and reduced motion are design.** Body 4.5:1, large text and UI 3:1, including over
   media. The reduced-motion version is a complete design, not a switch-off.
3. **One remembered moment.** No page ships without the element it is remembered by.

## The lock

A stage ends only when all of this is true:

1. The jury has scored the piece, where the piece is rendered (site locks 3 and 4, both page
   locks), and its ranked fixes were made or are named.
2. One rendered sheet (or one live page) was shown, once, for that exact scope.
3. The agent asked one closing question that names the scope ("Is the bar and the contract
   locked?"), and said in the same message what the lock does **not** cover.
4. The Art Director answered in writing. Their words are quoted verbatim.
5. The ruling is appended as a decision entry (`/web-studio:lock`): to the project's
   `DECISIONS.md`, or in host mode to the kernel's `DECISIONS.md` in the kernel's entry format.
6. The spec files the lock covers are marked locked with that id, and the design state moves to
   the next stage.

A lock can be reopened. Reopening is a new entry that supersedes the old one for a named part;
the old entry is never edited. Between a reopening and the new lock, locked files are not
edited: the new work lives in `design/review/` until it is locked. Before asking to reopen,
measure (`references/practices.md`, "Measure before you ask").

## Host mode: inside a kernel project

A project whose `CLAUDE.md` carries a line starting `Kernel: agency-harness` is governed by the
kernel. There the kit runs as a practice, not as a second harness:

| | Standalone (no kernel line) | Host mode (kernel line) |
|---|---|---|
| Truth files | the kit's `STATUS.md` and `DECISIONS.md` at the root | the kernel's; the kit creates neither and never edits `CLAUDE.md` |
| The design state | `STATUS.md` | `docs/design/STATE.md` (stage, locks, next stage, what to carry) |
| Birth | design folders, files, root truth files, a proposed `CLAUDE.md` block | design folders and files only (`design/`, `docs/design/`, `docs/content/`) |
| `/web-studio:lock` | appends to `DECISIONS.md` | appends to the kernel's `DECISIONS.md` in the kernel's entry format, and updates `STATE.md` |
| `/web-studio:stage` | next stage from `STATUS.md` | next stage from `docs/design/STATE.md` |
| `/web-studio:close` | evidence, `STATUS.md`, commit on a yes | evidence and `STATE.md` only; closing the session (status, ledger, commit) is the kernel's close |

The design flow, the jobs, the locks and the skills are the same in both modes. Where the kernel
names the owner differently (by name, as the approver), the kit writes the kernel's word.

## A session

One session, one unit of work. A new session is the cheap default.

**Opening.** Read the design state (`STATUS.md`, or `docs/design/STATE.md` in host mode), the
relevant part of `docs/design/PLAN.md`, and the rulings that bind this stage. Quote a ruling,
never paraphrase it. Load only the skills this stage needs.

**Working.** Render, record, measure. Nothing is judged by reading code. Process notes go to
`design/review/<date>-<stage>/`, not to the Art Director.

**Closing** (`/web-studio:close`). Evidence saved under `design/review/<date>-<stage>/` (the
renders and notes that mattered), the rest deleted; the design state replaced, never appended; a
lock, if given, recorded. Standalone: commit on the Art Director's yes. Host mode: the kernel's
close does the rest.

## Who does what, on which model

This is the one rule; every other file refers here.

- **Fable**: the specification, the design direction, and the judgment of finished work.
- **Opus**: everything defined: code, builds, long runs. One builder builds a page whole.
- **Sonnet**: a defined task that is short.
- **Haiku**: mechanical file work.
- **The jury's critic never runs in the session that built the piece.**

The plan names a model per task under this rule; a session's brief prints its model. A builder
may be a separate session or a subagent started with the locked specification; a page is never
split across builders.

## Where things live (in a project)

```
design/
  spec/            contract.md, ia.md, design-system.md, tokens.css (or pack.json → tokens.css),
                   composition.md, components.md, imagery.md, pages/<slug>.md, fonts/
  references/      bar/ (the level), moodboard/ (image rounds), motion/, source/ (Mobbin pulls)
  research/        redesign-review.md, audit-<category>.md (+ audit/ captures), type-pairings.md,
                   feasibility.md
  art-direction.md motion-spec.md
  build/           the working site, in clean code
  review/<date>-<stage>/   the sheets, renders and juries that mattered; the rest is deleted
  spend.jsonl      the image toolkit's spend ledger (one line per paid call)
docs/content/      source/ (the client's files, read-only), text/, INDEX.md, map/, CONTENT.md,
                   GAPS.md, previous-site/ when one exists
docs/design/       PLAN.md, definition-of-done.md, studio-brief.md, the client's spec verbatim;
                   STATE.md in host mode
docs/video/        the video documents, when the contract opens video
STATUS.md  DECISIONS.md      standalone only; in host mode they are the kernel's
```

Carried skills that say `spec/...` or `references/...` mean `design/spec/...` and
`design/references/...`.

## The bar, in numbers (Awwwards, November 2026)

Site of the Day sits at a jury overall of 7.2 to 7.7 (Design 40, Usability 30, Creativity 20,
Content 10). Honorable Mention starts at 6.5. The Developer Award needs over 7 in Semantics/SEO,
Animations/Transitions, Accessibility, WPO, Responsive and Markup. On 2026 winners the motion
sub-score is always the highest and Accessibility the lowest (6.6 to 7.0). The studio's gate is
7.0 overall and 6 on every axis on the jury's Awwwards-style scale, with accessibility built
natively (WCAG 2.2 AA; IS 5568 in Israel). The typical top tier of local professional-services
sites sits below that gate, which is why a liked local site is STRUCTURE and never the level.
Full evidence: the `craft-research` skill.

## Version pins (as of 2026-11-09; re-check when the research is re-run)

| Tool | Pin | Why |
|---|---|---|
| GSAP | 3.15.1+ | fixes RTL line breaks in SplitText; all plugins free |
| Lenis | 1.3.27+ | `autoRaf: false`, honours reduced motion by default |
| Three.js | r187 (WebGPURenderer + TSL, WebGL2 fallback) | measure both paths; only when the contract opens WebGL |
| Vite | 8.x | ESM build |
| Playwright / axe-core / Lighthouse | 1.65 / 4.14 / 13.6 | the review loop; Lighthouse 13 shifted lab scores, field data unchanged |
| Chrome DevTools MCP | 1.12.0 (pinned in `.mcp.json`) | traces on the calibrated mid-tier preset |
| CSS | scroll-driven animations and same-document view transitions inside `@supports`; cross-document transitions degrade to a cut (no Firefox) | Baseline status, November 2026 |
| Core Web Vitals | LCP 2.5 s, INP 200 ms, CLS 0.1 at p75 | unchanged in 2026 |

## Rules of engagement

- Nothing is judged by reading code. Render, record, measure. Once per scene on a real phone.
- A grey-box sheet, a wireframe presented as a deliverable, a "structure first" pass and a whole
  page built ahead of locked foundations are all refused. What is shown is finished for its
  scope.
- The hero is built alone, to the end, desktop and mobile, and shown with lock 3.
- A reference is measured from its DOM and CSS, never judged by eye. One version, as precise as
  possible. The reference is the floor, not the ceiling.
- Text reveals split by lines only. Reduced motion is a second complete design. Autoplay over
  5 seconds has a visible pause control.
- Tokens only; logical CSS properties only; content strings verbatim; `<bdi>` around numbers,
  phones and runs in the other script.
- Minimum context: a skill is loaded when its stage needs it, not before. No skill carries a
  project's history; no project file carries the method.
- A spec ends with "Not settled". A builder that hits an unsettled item stops and returns it; it
  does not decide.
- A number in a file says where it was measured. "Measured" means read from the DOM, the file
  or the render; "inferred" is marked as the agent's reading.
- Files, specs, code and commits in English; the site's language only in verbatim quotes,
  titles, keywords and site copy. Commit only when the Art Director says so.

## Confirm first

Nothing below happens without the Art Director's yes to the exact action, in the session, in
writing. A project's own rules may add to this list; they never shorten it.

- Any write to a live site, its database or its server.
- Anything sent to the client or shown in the client's name.
- Raising the imagery cap (the contract line; the toolkit refuses a run past it).
- Using a picture of a real person the client has not approved for the site.
- Deleting content, media or data anywhere.
- Editing a project's `CLAUDE.md`.

## Skill map

| Need | Skill |
|---|---|
| Start a project or dress an existing one | `studio-birth` |
| Read a live site before its redesign | `redesign-review` |
| Map the client's content, find the gaps, draft the one message | `content-map` |
| The level, the audit, the references, the feasibility note | `studio-research` |
| UX patterns from shipped products | `mobbin-research`, `/inspire`, `/screen-audit`, `/pull-app` |
| The state of the craft, with sources | `craft-research` |
| Pages, navigation, templates, slugs | `site-architecture` |
| Colour, surfaces, skeleton, spacing, type, assets, system | `foundations` |
| Hebrew type and space packs, the canon | `system-packs` |
| Taste and the premium bar | `signature` |
| Hebrew, RTL, Israeli law and conventions | `hebrew-rtl-israel` |
| The concept and its document | `studio-art-direction` |
| The motion spec and the engine per scene | `motion-language` |
| Images: generate, edit, gate, under the cap | `fal-image` |
| Images, video loops, fonts, SVG, OG: produce and optimise | `asset-pipeline` |
| A brand video (only when the contract opens video) | `video-production` |
| WebGL, shaders, 3D (only when the contract opens WebGL) | `webgl-atmosphere`, `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`, `threejs-asset-pipeline` |
| The build | `mode-site`, `mode-page`, `cinematic-build`, `landing-pages` (a page's craft floor) |
| GSAP | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react`, `gsap-frameworks` |
| One animation, from the decision to the code | `animate`, `animation-performance` |
| Tuning tokens by eye | `tweaks-bar` |
| Review and the one check before a lock | `visual-verify` (`/verify`), `visual-review`, `review-animations`, `web-design-guidelines`, `jury` |
| Reproducing a source exactly | `extraction-protocol` (`/extract`), `visual-verify` in FIDELITY mode |

After the last lock, outside the design flow: adaptation (`wp-theme`), opened as its own job.
