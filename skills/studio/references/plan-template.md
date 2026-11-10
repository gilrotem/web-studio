# Design plan — stages, tasks, models (template)

Copy to the project's `docs/design/PLAN.md`, keep the part for the project's job (site or page),
and fill it. It is the current plan: replaced when it changes, never appended. The stages and
their locks are fixed by the job (`studio` skill, "Two jobs, fixed locks"); the task split is
the agent's, and the model per task follows the one model rule in the `studio` skill.

Rules that bind every session: one session, one stage or one task; the brief prints the
session's kind and model; questions were asked once, at birth, and are not asked again; between
two locks the builder receives a locked specification and builds; the one check before the Art
Director sees a piece is the jury, by a critic that did not build it; a stage ends only on the
Art Director's written lock, recorded with `/web-studio:lock`; one direction per presentation.
The design is a working site in clean code under `design/build/`; no platform enters it.

The lock column is the only place the Art Director is stopped for. Every task line is written as
"id — descriptive label", never a bare id. Replace every `<...>`. Delete rows the project does
not have (no previous site, no form, a one-language site).

---

# The site job — four locks

## S-R — Redesign review · Fable (a redesign only)

Skill: `redesign-review`. Public pages only; the keep-list, when it exists, is read for its list
of pages and nothing else.

| id — task | model | done when |
|---|---|---|
| S-R.1 — Capture the live site's pages at 390 and 1440 (the keep-list's pages first), measured | Sonnet | captures and `run.json` per page under `design/research/redesign/` |
| S-R.2 — Read it as a designer and as a visitor: what it says, who it speaks to, what works, what fails, what must survive in the new design | Fable | `design/research/redesign-review.md` complete |

## S-1 — The brief · Fable, ends on Lock 1: the bar and the contract

Skills: `content-map`, `studio-research`, `craft-research`, `mobbin-research` (UX patterns only),
`site-architecture`.

| id — task | model | done when |
|---|---|---|
| S-1.1 — Intake: the client's files copied, extracted, counted, hashed, indexed | Sonnet | `docs/content/INDEX.md` lists every file, its word count and what it lacks |
| S-1.2 — The `<n>` content-page map files cut verbatim; the global file; home, about, contact skeletons | Opus (long) or Sonnet (a few pages) | every area marked have / ask / write / legacy; the verbatim check passes |
| S-1.3 — The gaps table and the one message to the client, drafted | Sonnet | `docs/content/map/INDEX.md`; the draft beside it |
| S-1.4 — The contract filled from the birth answers, the studio brief and the client's spec | Fable | no unexplained `null` |
| S-1.5 — The category audit: 8 to 10 sites captured and measured, tagged STRUCTURE | Sonnet measures, Fable reads | `design/research/audit-<category>.md` |
| S-1.6 — The bar: 5 to 8 shipped sites that set the level, a written line each | Fable | `design/references/bar/README.md` with captures |
| S-1.7 — The type proposal; the feasibility note per candidate effect | Fable | `type-pairings.md`, `feasibility.md` |
| S-1.8 — The architecture: pages, navigation, recurring blocks, templates and their area order, slugs (alphabet from birth), the title pattern | Fable | `design/spec/ia.md` |
| S-1.9 — One sheet with all of it (and the redesign review on a redesign), shown once | Fable | **Lock 1**, recorded; the map is the content baseline; the client message goes on the Art Director's yes to its text |

## S-2 — Foundations · Fable designs, Opus builds the sheets, ends on Lock 2

Skills: `foundations`, `system-packs`, `signature`, `hebrew-rtl-israel`. Built in this order, each
on the ones before, presented together once (one lock per foundation only if the contract opens
it).

| id — task | model | done when |
|---|---|---|
| S-2.1 — Colour: roles read from the logo's vector, the client's words and the measured reference; contrast computed | Fable | section and tokens written; contrast table complete |
| S-2.2 — Surfaces and skins | Fable | section and tokens written |
| S-2.3 — Skeleton: grid, axes, composition of the template types at 390 and 1440 | Fable | `composition.md` |
| S-2.4 — Spacing scale and rhythm | Fable | tokens written |
| S-2.5 — Typography: the pairing, roles, sizes, line-heights, measures (a `system-packs` pack as the start, if it fits) | Fable | type sheet at both widths; a real-phone pass |
| S-2.6 — Font files: subset WOFF2, preload plan, size-adjust fallbacks | Sonnet | files under `design/spec/fonts/`, sizes recorded |
| S-2.7 — Design assets: icon set, the logo as SVG with its reverse rule, dividers | Fable | sheet |
| S-2.8 — The design system: `design-system.md`, `tokens.css` (or the pack), `components.md` with every state | Fable writes, Sonnet formats | every token used by the sheets exists |
| S-2.9 — The foundations sheet set built in use, at 1440 and 390, shown once | Opus builds, Fable judges | **Lock 2**, recorded |

## S-3 — The concept and the hero · Fable directs, Opus builds, ends on Lock 3

Skills: `studio-art-direction`, `motion-language`, `fal-image`, `asset-pipeline`, `mode-site`,
`cinematic-build`, the `gsap-*` skills the hero needs, `animate`; `jury`.

| id — task | model | done when |
|---|---|---|
| S-3.1 — The direction from the birth inspiration and the references: concept sentence, storyboard, imagery, the remembered moment, voice | Fable | `design/art-direction.md` |
| S-3.2 — The motion spec: tempo, easing and duration tokens, choreography per scene, reduced motion as a second design | Fable | `design/motion-spec.md` |
| S-3.3 — Imagery for the hero: prompts and selection under the contract's cap | Fable writes and selects, Sonnet runs the toolkit | the chosen set in `design/spec/imagery.md`; every run in `design/spend.jsonl` |
| S-3.4 — Creative copy for the hero (the line, the sub-line) | Fable | in the map, marked draft |
| S-3.5 — The static scaffold (Vite, CSS layers, tokens as the one source, page shells per template, partials) and the hero built alone to the end at 390 and 1440, motion included | Opus | the hero renders; the refine loop run privately |
| S-3.6 — The jury on the hero (a critic in another session) and its fixes | Fable judges, Opus fixes | scorecard in `design/review/<date>-hero/` |
| S-3.7 — The concept with the hero, shown once | Fable | **Lock 3**, recorded |

## S-4 — The full site · Opus builds, Fable judges, ends on Lock 4

Skills: `mode-site`, `cinematic-build`, `gsap-*`, `animate`, `animation-performance`,
`asset-pipeline`, `visual-verify`, `visual-review`, `review-animations`, `web-design-guidelines`,
`jury`.

| id — task | model | done when |
|---|---|---|
| S-4.1 — The components layer frozen from the locked hero | Opus | `components.md` and tokens updated |
| S-4.2 — Home, scene by scene, per the choreography table | Opus | scroll recording matches the table |
| S-4.3 — The long-form template on the heaviest page (`<page, word count>`) | Opus | one page complete at both widths |
| S-4.4 — The remaining `<n>` content pages poured from the map | Sonnet | every page renders; every string matches the map |
| S-4.5 — About, contact, legal pages, 404; the form as design with every state | Opus | all render; the contact page is the action's home |
| S-4.6 — Microcopy and legal texts (form states, labels, privacy, accessibility statement) | Sonnet | drafts in the map; the market's required items present |
| S-4.7 — Asset pipeline: AVIF/WebP sets, posters, the OG image | Sonnet | every image has dimensions and formats; hero media ≤ 1.5 MB |
| S-4.8 — Structured data, titles and meta per page | Sonnet | validates |
| S-4.9 — Measurements: `verify.mjs shoot` on every page, motion recordings, reduced motion, axe, keyboard walk, `rtl-lint`, Lighthouse mobile, a DevTools trace | Sonnet | evidence in `design/review/<date>-site/` |
| S-4.10 — The jury on the site (a critic in another session); the single weakest thing fixed, repeatedly | Fable judges, Opus fixes | ≥ 7.0 overall and ≥ 6 per axis, or the list says why not |
| S-4.11 — One pass on a real phone; the definition of done line by line | Sonnet, then Haiku for the checklist | every line true with its evidence |
| S-4.12 — The full site, shown once | Fable | **Lock 4**, recorded. The design is done |

---

# The page job — two locks

## P-1 — The concept · Fable directs, Opus builds, ends on Lock 1

Skills: `mode-page`, `signature`, `studio-art-direction`, `fal-image`, `visual-verify`; `jury`.

| id — task | model | done when |
|---|---|---|
| P-1.1 — The host site's system read and measured: type, colour, spacing, rhythm, contrast | Sonnet measures, Fable reads | a note in `design/research/` |
| P-1.2 — Reference intake and the one direction; the core (`composition.md`, provisional tokens) | Fable | the direction in ten lines; the core written |
| P-1.3 — The first view built alone to the end at 390 and 1440, real imagery under the cap | Opus | the refine loop run privately |
| P-1.4 — The jury on the first view and its fixes | Fable judges, Opus fixes | scorecard saved |
| P-1.5 — The concept with the first view, shown once | Fable | **Lock 1**, recorded |

## P-2 — The page · Opus builds, Fable judges, ends on Lock 2

Skills: `mode-page`, `landing-pages` (the craft floor), `cinematic-build`, `gsap-*`, `animate`,
`asset-pipeline`, `visual-verify`, `jury`.

| id — task | model | done when |
|---|---|---|
| P-2.1 — The whole page built by one builder from the locked concept | Opus | every section renders at 390, 768, 1440 |
| P-2.2 — Hardening: RTL, reduced motion, focus, image weight, metadata; `verify.mjs shoot` clean | Opus | evidence saved |
| P-2.3 — The jury and the fixes; the definition of done | Fable judges, Opus fixes, Haiku checks the list | gate held or the list says why |
| P-2.4 — The page, shown once | Fable | **Lock 2**, recorded. The design is done |

---

## How every session closes

`/web-studio:close`: evidence saved under `design/review/<date>-<stage>/`, the rest deleted; the
design state replaced (`STATUS.md`, or `docs/design/STATE.md` in a kernel project, where the
kernel's close then commits). Standalone: commit on the Art Director's yes.

## After the last lock

Adaptation to where the site will run is a separate job with its own brief, opened after the
last lock. It is not planned here.

## Not settled

List here what the plan cannot decide yet: who rules on what, which facts are missing, what a
later lock will settle. A builder that hits one of these stops and returns it.
