---
name: studio
description: The studio's method and router: roles, the one-direction rule, the stages from specification to launch, the contract and its three gates, the written lock, how a session opens and closes, the model per kind of work, where every file lives, and which skill each stage loads. Read it first in any design session, when the user says "studio", "stage", "שלב", "נעול", "איפה אנחנו", "what's next", or whenever it is unclear which skill a piece of design work belongs to.
---

# Studio — how design work runs

This skill routes. Taste lives in the `signature` skill and in the project's own
`design/art-direction.md`; nothing else legislates taste. How each stage is done lives in that
stage's skill. What is true for one project lives in that project's files, never here.

Depth, loaded only when needed:

- `${CLAUDE_SKILL_DIR}/references/practices.md`: what was learned running this method on real
  work. Read it before presenting anything to the Art Director for the first time.
- `${CLAUDE_SKILL_DIR}/references/plan-template.md`: the session-by-session plan a project copies
  and fills (tasks, model per task, gate per task, done-when).
- `${CLAUDE_SKILL_DIR}/references/definition-of-done.md`: the checklist a scene, page or site
  closes on.
- `${CLAUDE_SKILL_DIR}/references/truth-files.md`: the formats of `STATUS.md` and `DECISIONS.md`.
- `${CLAUDE_SKILL_DIR}/references/session-briefs.md`: how a stage session is briefed and started.

## Roles

- **The Art Director** is the person who owns the result. He gives the inspiration, the concept
  and the lock. He is not asked to supply references, to pick between screen variants, or to
  answer questions the skills can answer. One steering point per stage: the direction is pitched
  once, he locks it in writing.
- **The agent designs, builds and reviews**, one surface at a time, to the end. Research may fan
  out to sub-agents; design and build never do.
- **The client** is the business the site is for. The agent never contacts the client. Anything
  that goes to the client (a question, a draft, a link) is drafted by the agent and sent by the
  Art Director, on his yes to the exact text.

## The one-direction rule

One direction, presented with everything the stage has: rendered, composed, with imagery. A
second direction only when the Art Director asks for it or the brief genuinely splits. Never
three, never five. The Art Director describes a concept or shows an inspiration; the agent shapes
it into the direction, presents it, and he approves or redirects. The effort goes into one
presentation, not into breadth.

## The working mode: clean static code, no servers

Every design stage runs as a static site in clean code (HTML, CSS, JS, Vite) rendered from
`design/` in the browser. No local CMS, no server, no hosting or account talk in a design
session. Backend concerns are named once, in the contract, so the markup is ready for them
(one template per page type, one partial per recurring block, no runtime assumptions), and then
they stay out of the way until the last stage. The delivery format (a WordPress theme, a static
deploy, another stack) is made from the finished, locked static site at the end.

Why: servers, flows and accounts weigh on the context and pull the session out of the design.
The conversion can always be done afterwards; a design made while distracted cannot be repaired
afterwards.

## Stages, in order

Each stage ends on the Art Director's written lock, quoted verbatim into `DECISIONS.md`. Silence
or "looks fine" is not a lock. One stage per session; a stage with several foundations may take
several sessions, one lock each.

| # | Stage | Produces | Skills |
|---|---|---|---|
| 0a | Specification: content | `docs/content/` (the client's files as received, a plain-text extraction, the index), `docs/content/map/` (every text page by page, each area marked have / ask / write / legacy), the gaps table, one message to the client | `content-map` |
| 1 | References and the bar; the contract | `design/spec/contract.md` filled; `design/references/bar/` (5 to 8 shipped sites that set the level, one written line each); the category audit tagged STRUCTURE; a type proposal; a feasibility note per candidate effect; one sheet | `studio-research`, `mobbin-research` (UX patterns only), `craft-research` |
| 0b | Specification: architecture | `design/spec/ia.md`: pages, navigation, recurring blocks, template types and their area order, slugs and the title pattern; one sitemap sheet | `site-architecture` |
| 2 | Foundations, in this order: colour → surfaces and skins → skeleton (grid, axes, composition) → spacing → typography → design assets → design system | `design/spec/tokens.css`, `design/spec/design-system.md`, `design/spec/composition.md`, `design/spec/components.md` | `foundations`, `signature`, `hebrew-rtl-israel`, `tweaks-bar` |
| 3 | Pure creative: the concept world | `design/art-direction.md` (concept, storyboard, imagery, the remembered moment), `design/motion-spec.md`; imagery; a video when the concept earns one | `studio-art-direction`, `motion-language`, `fal-image`, `asset-pipeline`, `webgl-atmosphere`, `video-production` |
| 4 | Build | the hero alone first, shown once; then scene by scene; then the remaining templates and pages by inheritance | `mode-site`, `mode-page`, `cinematic-build`, `gsap-*`, `animate`, `animation-performance`, `threejs-*`, `landing-pages` |
| 5 | Review | renders at 390 and 1440, motion recordings, measurements, the jury score; the single weakest thing fixed, repeatedly | `visual-verify`, `visual-review`, `jury`, `review-animations`, `web-design-guidelines` |
| 6 | Conversion, hand-off, launch | the delivery format made from the locked static site; staging; the hand-off plan; the live steps one at a time | `wp-theme` (WordPress delivery), `landing-pages` (WordPress-safe single pages) |

Order notes:

- 0a and 1 can run in parallel. 0b waits for the content baseline (the Art Director's yes to the
  map) and for the Stage 1 lock, because the architecture reads both the map's area names and
  the audit's "what the visitor expects to find".
- Stage 2 before Stage 3 is deliberate: the creative conversation happens on top of a settled,
  harmonious foundation, so a concept world is built on tokens and not on improvisation.
- 2 → 3 → 4 → 5 → 6 in strict order. Microcopy and legal texts, and font files, run alongside
  whatever stage is open. Creative copy (the hero line, section titles) waits for Stage 3, since
  the direction decides the voice.
- When the Art Director rejects a foundation sheet, do not produce another sheet of the same
  kind. Build one real element alone, to the end, and derive the foundation from it
  (`foundations` skill, "The element-first route").

The session-level plan, with tasks, the model per task and the gate per task, is the project's
`docs/design/PLAN.md`, made from `references/plan-template.md`.

## Modes

The contract declares one mode. This kit carries the two generative modes: **SITE** (a multi-page
site from scratch, `mode-site`) and **PAGE** (one landing or marketing page from scratch,
`mode-page`). Some carried skills also name PORT, REDESIGN and SYSTEM, modes of the wider kit
lineage. PORT (reproduce a source exactly) is served here by `extraction-protocol` plus the
FIDELITY mode of `visual-verify`. REDESIGN and SYSTEM have no mode skill in this kit; do not
improvise one, ask the Art Director.

## The contract and the three gates

`design/spec/contract.md` is the whole design brief: Mode, Delivery, Language, Type budget,
Imagery budget, the rulings it stands on, Aesthetic, Reference (each source tagged TASTE or
STRUCTURE), Intent (what, who, the one action, recurring components, where it lives), Brand
assets, Guardrails, Signature, Tokens, Not settled. `null` means not specified; it is never
filled by invention. Content strings are the client's, verbatim. The studio brief
(`docs/design/studio-brief.md`) and the client's own spec feed it.

1. **Reference tier.** TASTE only for genuinely excellent work. A competitor is STRUCTURE. A
   site the client likes is STRUCTURE until the Art Director tags it TASTE. The level is set by
   `design/references/bar/`, never by a competitor or a liked site.
2. **Contrast and reduced motion are design.** Body 4.5:1, large text and UI 3:1, including over
   media. The reduced-motion version is a complete design, not a switch-off.
3. **One remembered moment.** No page ships without the element it is remembered by.

## The lock

A stage, or one foundation inside a stage, ends only when all of this is true:

1. One rendered sheet (or one live page) was shown, once, for that exact scope.
2. The agent asked one closing question that names the scope ("Is the colour scheme locked?"),
   and said in the same message what the lock does **not** cover.
3. The Art Director answered in writing. His words are quoted verbatim.
4. The ruling is appended to `DECISIONS.md` in the format in `references/truth-files.md`:
   id and label, date, origin, the ruling verbatim, what it means for the work, the condition
   under which it comes back, the source (the sheet's path).
5. The spec files the lock covers are marked locked with that id.

A lock can be reopened. Reopening is a new entry that supersedes the old one for a named part;
the old entry is never edited. Between a reopening and the new lock, locked files are not
edited: the new work lives in `design/review/` until it is locked. Before asking to reopen,
measure (`references/practices.md`, "Measure before you ask").

## A session

One session, one unit of work. A new session is the cheap default.

**Opening.** Read `STATUS.md` (where things stand and what this session does), the relevant
part of `docs/design/PLAN.md`, and the rulings in `DECISIONS.md` that bind this stage. Quote a
ruling, never paraphrase it. Load only the skills this stage needs.

**Working.** Render, record, measure. Nothing is judged by reading code. Present rendered work,
not descriptions. Process notes go to `design/review/<date>-<stage>/`, not to the Art Director.

**Closing.**

1. Evidence saved under `design/review/<date>-<stage>/` (the renders and notes that mattered);
   the rest deleted. Rejected rounds that taught something are kept and marked as evidence only.
2. `STATUS.md` replaced (current state only, never appended): what is done and locked, what the
   next session does, and what the next session must carry from this one in the Art Director's
   own terms.
3. A lock, if given, quoted into `DECISIONS.md`.
4. Commit and push, in English, on the Art Director's yes. The repository is the hand-over: the
   next session, machine or account starts from `STATUS.md` and the plan, with nothing else
   carried.

## Which model for which work

The studio's rule: thinking, design and creation run on the strongest model (Fable). Code and
execution run on Opus. Lighter content writing and lighter work in other areas run on Sonnet.
Very small things run on Haiku. The plan names a model per task; a session's brief prints its
model. Judging a piece before it reaches the Art Director is design work and takes the strongest
model, even when a lighter model built the piece.

## Where things live (in a project)

```
design/
  spec/            contract.md, ia.md, design-system.md, tokens.css, composition.md,
                   components.md, imagery.md, pages/<slug>.md, fonts/
  references/      bar/ (the level), moodboard/, motion/, source/ (Mobbin pulls)
  research/        audit-<category>.md (+ audit/ captures), type-pairings.md, feasibility.md
  art-direction.md motion-spec.md
  review/<date>-<stage>/   the sheets, renders and juries that mattered; the rest is deleted
docs/content/      source/ (the client's files, read-only), text/, INDEX.md, map/, CONTENT.md,
                   GAPS.md, previous-site/ when one exists
docs/design/       PLAN.md, studio-brief.md, the client's spec verbatim
docs/video/        the video documents, when the concept earns a video
site/              the delivered build (hand-off)
STATUS.md  DECISIONS.md
```

Carried skills that say `spec/...` or `references/...` mean `design/spec/...` and
`design/references/...`: the project repository is the studio root and `design/` is its one
studio folder.

## The bar, in numbers (Awwwards, November 2026)

Site of the Day sits at a jury overall of 7.2 to 7.7 (Design 40, Usability 30, Creativity 20,
Content 10). Honorable Mention starts at 6.5. The Developer Award needs over 7 in Semantics/SEO,
Animations/Transitions, Accessibility, WPO, Responsive and Markup. On 2026 winners the motion
sub-score is always the highest and Accessibility the lowest (6.6 to 7.0). The studio's gate is
7.0 overall and 6 on every axis, with accessibility built natively (WCAG 2.2 AA; IS 5568 in
Israel). The typical top tier of local professional-services sites (a page builder, overlay
widgets, carousels, no motion language) sits below that gate, which is why a liked local site is
STRUCTURE and never the level. Full evidence: the `craft-research` skill.

## Version pins (as of 2026-11-09; re-check when the research is re-run)

| Tool | Pin | Why |
|---|---|---|
| GSAP | 3.15.1+ | fixes RTL line breaks in SplitText; all plugins free |
| Lenis | 1.3.27+ | `autoRaf: false`, honours reduced motion by default |
| Three.js | r187 (WebGPURenderer + TSL, WebGL2 fallback) | measure both paths; only when a scene earns it |
| Vite | 8.x | ESM build; the theme's script modules |
| WordPress | 7.1.x, PHP 8.3 | hybrid theme, `wp_enqueue_script_module()`, speculative loading constants |
| Playwright / axe-core / Lighthouse | 1.65 / 4.14 / 13.6 | the review loop; Lighthouse 13 shifted lab scores, field data unchanged |
| Chrome DevTools MCP | 1.12+ | traces on the calibrated mid-tier preset |
| CSS | scroll-driven animations and same-document view transitions inside `@supports`; cross-document transitions degrade to a cut (no Firefox) | Baseline status, November 2026 |
| Core Web Vitals | LCP 2.5 s, INP 200 ms, CLS 0.1 at p75 | unchanged in 2026 |

## Rules of engagement

- Nothing is judged by reading code. Render, record, measure. Once per scene on a real phone.
- A grey-box sheet, a wireframe presented as a deliverable, a "structure first" pass and a whole
  page built ahead of unlocked foundations are all refused. What is shown is finished for its
  scope.
- The hero is built alone, to the end, desktop and mobile, and shown once.
- A reference is measured from its DOM and CSS, never judged by eye. One version, as precise as
  possible. The reference is the floor, not the ceiling.
- Text reveals split by lines only. Reduced motion is a second complete design. Autoplay over
  5 seconds has a visible pause control.
- Tokens only; logical CSS properties only; content strings verbatim; `<bdi>` around numbers,
  phones and runs in the other script.
- Minimum context: a skill is loaded when its stage needs it, not before. No skill carries a
  project's history; no project file carries the method.
- A spec ends with "Not settled". An executor that hits an unsettled item stops and returns it;
  it does not decide.
- A number in a file says where it was measured. "Measured" means read from the DOM, the file
  or the render; "inferred" is marked as the agent's reading.
- Files, specs, code and commits in English; the site's language only in verbatim quotes,
  titles, keywords and site copy. Commit only when the Art Director says so.

## Confirm first

Nothing below happens without the Art Director's yes to the exact action, in the session, in
writing. A project's own rules may add to this list; they never shorten it.

- Any write to a live site, its database or its server; deploys, DNS, SSL, redirects, caching.
- Anything sent to the client or shown in the client's name.
- Any spend above the imagery or video budget written in the contract.
- Using a picture of a real person the client has not approved for the site.
- Deleting content, media or data anywhere.
- Choosing or moving to the real domain.
- Editing a project's `CLAUDE.md`.

## Skill map

| Need | Skill |
|---|---|
| Start a project or dress an existing one | `studio-birth` |
| Map the client's content, find the gaps, draft the one message | `content-map` |
| The level, the audit, the references, the feasibility note | `studio-research` |
| UX patterns from shipped products | `mobbin-research`, `/inspire`, `/screen-audit`, `/pull-app` |
| The state of the craft, with sources | `craft-research` |
| Pages, navigation, templates, slugs | `site-architecture` |
| Colour, surfaces, skeleton, spacing, type, assets, system | `foundations` |
| Taste and the premium bar | `signature` |
| Hebrew, RTL, Israeli law and conventions | `hebrew-rtl-israel` |
| The concept and its document | `studio-art-direction` |
| The motion spec and the engine per scene | `motion-language` |
| Images: generate, edit, gate | `fal-image` |
| Images, video loops, fonts, SVG, OG: produce and optimise | `asset-pipeline` |
| A brand video | `video-production` |
| WebGL, shaders, 3D | `webgl-atmosphere`, `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`, `threejs-asset-pipeline` |
| The build | `mode-site`, `mode-page`, `cinematic-build` |
| GSAP | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react`, `gsap-frameworks` |
| One animation, from the decision to the code | `animate`, `animation-performance` |
| Tuning tokens by eye | `tweaks-bar` |
| Review | `visual-verify` (`/verify`), `visual-review`, `review-animations`, `jury`, `web-design-guidelines` |
| Reproducing a source exactly | `extraction-protocol` (`/extract`), `visual-verify` in FIDELITY mode |
| Delivery | `wp-theme`, `landing-pages` |
