# Design and build plan — sessions, tasks, models (template)

Copy to the project's `docs/design/PLAN.md` and fill it. It is the current plan: replaced when it
changes, never appended. The ordered steps are the Art Director's; the task split and the model
per task are the agent's proposal under the studio's rule for models:

> Thinking, design and creation: Fable. Code and execution: Opus. Lighter content writing and
> lighter work in other areas: Sonnet. Very small things: Haiku.

Rules that bind every session: one session, one unit of work; the brief prints the session's
kind and model; a stage ends only on the Art Director's written lock, quoted into `DECISIONS.md`;
one direction per presentation; nothing goes to the client or to a live server without the Art
Director's yes to the exact action. Method: the `studio` skill. Content: `docs/content/INDEX.md`.

Technical flow: the design steps S-4 to S-8 are a static site in clean code (HTML, CSS, JS,
Vite) rendered from `design/` in the browser. No local CMS, no server, no hosting or account
talk in a design session. The delivery format is made from the finished static site at the end
(S-9). Every session closes with a commit and push on the Art Director's yes: the repository is
the hand-over to the next session, machine or account.

Gate column: `AD` = the Art Director's written lock; `client` = the client's answer or approval,
sent by the Art Director; `—` = closes on evidence. Every task line is written as
"id — descriptive label", never a bare id.

Replace every `<...>`. Delete rows the project does not have (a one-page job has no service
template; a job with no previous site has no legacy marker).

## S-1 — Content map · Sonnet

Output: `docs/content/map/` with one file per page: areas separated by `---`, the raw text as it
is, each area marked have / ask / write / legacy. No rewriting anywhere. Skill: `content-map`.

| id — task | model | gate | done when |
|---|---|---|---|
| S-1.1 — Intake: the client's files copied to `docs/content/source/`, extracted to `text/`, counted, hashed for duplicates, indexed | Sonnet | — | `docs/content/INDEX.md` lists every file, its word count and what it lacks |
| S-1.1b — The `<n>` content-page map files cut verbatim from `docs/content/text/` (title, opening, body, closing) | Sonnet | — | `<n>` files exist; the index's verbatim check passes for each (every paragraph of the source appears once, in order); spot-check of three files by Haiku |
| S-1.2 — Global file: header, footer, the lead band, recurring blocks, legal pages, 404 | Sonnet | — | every global area listed with a marker |
| S-1.3 — Home, about and contact skeletons with the raw text that exists and markers where it does not | Sonnet | — | three files; every area marked |
| S-1.4 — Gaps table in `docs/content/map/INDEX.md`: every ask and write item, one row each | Sonnet | — | the table is the full list; nothing marked in a page file is missing from it |
| S-1.5 — Read the map and decide the judgement calls: what is ask and what is write, which areas the home needs at all | Fable | AD | the Art Director's yes to the map as the content baseline |

## S-2 — Completions from the client · Sonnet drafts, the Art Director sends

| id — task | model | gate | done when |
|---|---|---|---|
| S-2.1 — One message to the client from the gaps table | Sonnet | AD (then client) | the Art Director approves the text and sends it himself; sent date in STATUS |
| S-2.2 — File the answers: new facts into `docs/content/`, map markers flipped from ask to have | Haiku | — | each answer has a home; INDEX.md and the map agree |
| S-2.3 — Texts marked write that are creative copy (hero line, section titles, intros, the quote) | Fable | AD, then client | drafts in the map, marked draft; the client approves through the Art Director |
| S-2.4 — Texts marked write that are microcopy and legal (form states, button labels, 404, privacy policy, accessibility statement from the skill's template) | Sonnet | AD | drafts in the map; the legal texts carry the market's required items |

S-2.1 runs as soon as S-1.4 exists. S-2.3 waits for S-6 (the direction decides the voice of the
hero line). S-2.4 can run any time after S-1.

## S-3 — The bar and the contract (Stage 1) · Fable

Skills: `studio-research`, `craft-research`, `mobbin-research` for UX patterns.

| id — task | model | gate | done when |
|---|---|---|---|
| S-3.1 — The contract's open questions asked in one round (the one action and its channel, the type budget, the tag of any site the client likes, the spec document) and `design/spec/contract.md` filled | Fable | AD (answers) | the contract has no unexplained `null` |
| S-3.2 — The category audit: 8 to 10 competitor sites captured and measured, tagged STRUCTURE | Sonnet measures, Fable reads | — | `design/research/audit-<category>.md` with the clichés to refuse and what the visitor expects |
| S-3.3 — The bar: 5 to 8 shipped sites that set the level, a written line each | Fable | — | `design/references/bar/README.md` with captures |
| S-3.4 — The type proposal from the allowed bench; the feasibility note per candidate effect | Fable | — | `design/research/type-pairings.md`, `design/research/feasibility.md` |
| S-3.5 — One sheet with all of it, shown once | Fable | AD | the Art Director's lock, quoted |

## S-4 — Site architecture · Fable

Skill: `site-architecture`. Waits for S-1.5 and S-3.5.

| id — task | model | gate | done when |
|---|---|---|---|
| S-4.1 — The page list and the navigation: how the content pages group, what sits in the header, what only in the footer | Fable | AD | one page, `design/spec/ia.md` |
| S-4.2 — The recurring blocks and where each repeats; the placement of the one action | Fable | AD | in `ia.md`; the action's placement matches the contract |
| S-4.3 — Page template types and the area order of each | Fable | AD | in `ia.md`; every page maps to a template |
| S-4.4 — URL slugs and the title pattern per template (the slug alphabet is a question for the Art Director) | Sonnet | AD | slug table in `ia.md` |

## S-5 — Foundations (Stage 2) · Fable, in this order, one presentation each

Skill: `foundations`. Each foundation is built on the one before and shown once, rendered; the
Art Director locks each in writing. Two foundations may share a session when the first locks
inside it.

| id — task | model | gate | done when |
|---|---|---|---|
| S-5.1 — Colour scheme: palette with roles, read from the logo, the client's words and the measured reference; contrast computed | Fable | AD | one rendered sheet; lock |
| S-5.2 — Surfaces and skins: grounds, cards, bands, overlays on media, dark and light sections, how sections join | Fable | AD | one rendered sheet; lock |
| S-5.3 — Skeleton: grid, axes, composition of the template types at 390 and 1440 | Fable | AD | renders of real compositions; lock |
| S-5.4 — Spacing scale and rhythm | Fable | AD | scale in tokens; one render; lock |
| S-5.5 — Typography: the pairing from the allowed bench, sizes, line-height, measure, display with a point of view | Fable | AD | type sheet at both widths; a real-phone pass; lock |
| S-5.6 — Font files: subset WOFF2, preload plan, size-adjust fallbacks | Sonnet | — | files under `design/spec/fonts/`, sizes recorded |
| S-5.7 — Design assets: icon set, the logo as SVG with its reverse rule, dividers, the graphic language of recurring diagrams | Fable | AD | sheet; lock |
| S-5.8 — Design system written: `design-system.md`, `tokens.css`, `components.md` with states (rest, hover, focus-visible, active, disabled, loading) | Fable writes, Sonnet formats | AD | files complete; every token used by the sheets exists |
| S-5.9 — Tweaks bar mounted on the sheets so S-5.1 to S-5.5 can be adjusted by eye | Sonnet | — | the bar edits the tokens live and exports CSS |

## S-6 — Pure creative: the concept world (Stage 3) · Fable

| id — task | model | gate | done when |
|---|---|---|---|
| S-6.1 — The Art Director describes the concept; the agent shapes one direction: concept sentence, storyboard, imagery, the remembered moment, voice | Fable | AD | `design/art-direction.md`; lock |
| S-6.2 — The hero rendered as the direction's pitch, desktop and mobile, with real imagery | Fable | AD | one composed render shown once; lock |
| S-6.3 — Imagery: prompts and selection within the budget, no placeholder boxes | Fable writes and selects, Sonnet runs the toolkit | AD | candidates under `design/references/moodboard/`, the chosen set in `design/spec/imagery.md` |
| S-6.4 — Motion spec: tempo, easing and duration tokens, choreography table per scene, reduced motion as a second design, the video's place if there is one | Fable | AD | `design/motion-spec.md`; lock |
| S-6.5 — Feasibility per signature effect: cost on a mid-range phone, fallback | Fable | — | in the motion spec |

## S-7 — Build (Stage 4) · Opus

Built as a static site in clean code under `design/`: Vite, CSS layers, tokens, GSAP; markup
written so the conversion in S-9 is mechanical (one template per page type, one partial per
recurring block, no runtime assumptions). Nothing touches any server.

| id — task | model | gate | done when |
|---|---|---|---|
| S-7.1 — Static scaffold: Vite, CSS layers, `tokens.css` as the single source, logical properties, page shells per template type, partials for the recurring blocks | Opus | — | empty shells render from `design/` with the tokens at 390 and 1440 |
| S-7.2 — The hero built alone to the end, desktop and mobile, motion included, shown once | Opus | AD | rendered at 390 and 1440; lock |
| S-7.3 — Home, scene by scene, each handed over continuously per the choreography table | Opus | AD | scroll recording matches the table |
| S-7.4 — The long-form content template built on the heaviest page (`<page, word count>`) | Opus | AD | one page complete at both widths |
| S-7.5 — The remaining `<n>` content pages poured into the template from the map | Sonnet | — | all pages render; every string matches the map |
| S-7.6 — About, contact, legal pages, 404 | Opus (contact), Sonnet (the rest) | — | all render; the contact page is the action's home |
| S-7.7 — The form as design: fields, the privacy notice, success and error states, focus and validation; delivery is wired in S-9 | Opus | AD | all states rendered and reviewed; no backend in this step |
| S-7.8 — Phone, messaging and navigation links; one phone number sourced from one place | Sonnet | — | links verified on a phone |
| S-7.9 — Asset pipeline: AVIF/WebP sets, posters, the video loop if there is one, the OG image | Sonnet | — | every image has dimensions and formats; hero media ≤ 1.5 MB |
| S-7.10 — Structured data, titles and meta per page | Sonnet | — | validates |
| S-7.11 — Judging each shown piece before it reaches the Art Director: render, read, name the single weakest thing | Fable | — | a `design/review/<date>/` note per piece |

## S-8 — Review (Stage 5) · Fable judges, Sonnet measures, Opus fixes

| id — task | model | gate | done when |
|---|---|---|---|
| S-8.1 — Measurements: screenshots at 390 and 1440, motion recordings, reduced-motion run, axe, keyboard walk, `rtl-lint` on an RTL site, Lighthouse mobile, DevTools trace on the mid-tier preset | Sonnet | — | evidence in `design/review/<date>/` |
| S-8.2 — Jury score across Design, Usability, Creativity, Content and the six developer areas; ranked fix list | Fable | — | `jury.md`; ≥ 7.0 overall and ≥ 6 per axis, or the list says why not |
| S-8.3 — Fix the single weakest thing, re-measure; repeat until the gate holds | Opus | — | gate held; evidence saved |
| S-8.4 — One pass on a real phone | Sonnet | — | note with device and findings |
| S-8.5 — Definition of done checked line by line | Haiku | AD | every line true with its evidence; the Art Director's lock on the site |

## S-9 — Conversion, hand-off and launch (Stage 6) · Opus, every live write confirm-first

The only step where servers exist. It starts after the Art Director's lock on the static site.

| id — task | model | gate | done when |
|---|---|---|---|
| S-9.0 — A delegation ruling for routine file writes on the staging copy (proposed to the Art Director, recorded in `DECISIONS.md`); staging created; everything else stays confirm-first | Opus proposes, the Art Director rules | AD | the ruling is recorded; staging answers 200 |
| S-9.1 — Conversion to the delivery format (for WordPress, the `wp-theme` skill) | Opus | — | every page renders on staging identical to the static site at 390 and 1440 (screenshot diff) |
| S-9.2 — The form's delivery, honeypot, test submissions | Opus | AD | a test submission arrives at every target (test addresses) |
| S-9.3 — Hand-off plan: the file list for `site/`, the order of live steps, rollback | Opus | AD | plan in `docs/`; approved |
| S-9.4 — Land the build in `site/`; move staging to the live address, one change and one read-back each | Opus | AD per action | live pages read 200 |
| S-9.5 — Client walk-through and training, if the client contract includes it | the Art Director | client | done date in STATUS |
| S-9.6 — Tracking and search-console verification | Sonnet | AD | tags fire on the live site |
| S-9.7 — Domain: point the real domain's records at the new site; the previous site retired | the Art Director with the client; Opus prepares the record list | AD per action | the real domain serves the new site |
| S-9.8 — Effect check 7 days after launch: tracking, form delivery, Core Web Vitals field data | Haiku | — | written to the project's facts |

## How every session closes

1. Evidence saved (renders, notes) under `design/review/<date>-<stage>/`; the rest deleted.
2. `STATUS.md` replaced; a lock, if given, quoted into `DECISIONS.md`.
3. Commit and push, in English, on the Art Director's yes.

## Order and parallel tracks

- S-1, S-2.1 and S-3 run in parallel. S-4 waits for S-1.5 and S-3.5.
- S-5 → S-6 → S-7 → S-8 → S-9 in strict order. S-2.4 (microcopy, legal) and S-5.6 (font files)
  run alongside whatever step is open. S-2.3 (creative copy) runs inside S-6.
- A video, if the concept earns one, joins at S-6.4; if it is not ready the hero is designed
  without it and the video is a later addition under the motion spec.

## Not settled

List here what the plan cannot decide yet: who rules on what, which facts are missing, what a
later step will settle. An executor that hits one of these stops and returns it.
