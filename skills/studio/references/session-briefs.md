# Session briefs — how a stage session is started

A stage runs in its own session, started with a brief. The brief is short because the project's
files hold the state; it says which stage this is, which lock it ends on, and what done looks
like. A session that plans (writes the plan, the briefs and the proposals) does not build; a
session that builds runs one approved item from a locked specification and asks nothing.

## The shape of a brief

```
<project> — <stage or task, by its name in the plan>
Kind: execution · Model: <the model the plan names, under the one model rule in the studio skill>

Read first: the design state (docs/design/STATE.md in a kernel project, else STATUS.md),
docs/design/PLAN.md (<the stage>), the decision entries that bind it (<ids and labels>).
Skills: studio, <the stage's skills>. Load nothing else until it is needed.

The unit of work: <one sentence>.
Inputs (locked): <the files it reads>.
Produces: <the files it writes>, and one rendered sheet at design/review/<date>-<stage>/.
Ends on: <the lock, by its name> | <closes on evidence, for a task inside a stage>.
Out of scope: <what this session must not settle on the way>.
Carry from the last session: <the lines from the design state "what the next session must carry">.
Close: /web-studio:close (in a kernel project, then the kernel's close).
```

## Briefs for the usual sessions

**Redesign review (stage R, a redesign only).** Skills: `studio`, `redesign-review`. Public pages
only; a keep-list, when it exists, is read for its list of pages. Out of scope: URLs, redirects,
search data, any design.

**The brief (stage 1, site lock 1).** Skills: `studio`, `content-map`, `studio-research`,
`craft-research`, `site-architecture`; `mobbin-research` for UX patterns only. The contract's
questions were answered at birth; nothing is asked again. Produces the content map and gaps,
the filled contract, the bar, the audit, the type proposal, the feasibility note, the
architecture and one sheet. Out of scope: any visual design; contacting the client.

**Foundations (stage 2, site lock 2).** Skills: `studio`, `foundations`, `system-packs`,
`signature`; `hebrew-rtl-israel` on a Hebrew site. All seven foundations in the fixed order,
presented together once. Out of scope: the concept, the hero, motion.

**The concept and the hero (stage 3, site lock 3).** Skills: `studio`, `studio-art-direction`,
`motion-language`, `fal-image`, `mode-site`, `cinematic-build`; `webgl-atmosphere` or
`video-production` only if the contract opens them. The direction is shaped from the birth
inspiration and goes straight into the document and the hero; nothing is pitched for a go. The
jury before the presentation.

**The full site (stage 4, site lock 4).** Skills: `studio`, `mode-site`, `cinematic-build`, the
`gsap-*` skills the scenes need, `visual-verify`, `visual-review`, `jury`. Measuring, judging and
fixing are split: Sonnet gathers the evidence, a Fable critic that did not build the site scores
and ranks, Opus fixes the single weakest thing. Out of scope: any platform.

**The page job (page locks 1 and 2).** Skills: `studio`, `mode-page`; the stage table in the
`studio` skill names the rest.

## What a brief never does

- It never carries the state. If a fact is needed, it is in a project file and the brief points
  at it.
- It never widens the unit of work "while we're there".
- It never authorises a confirm-first action in advance. The yes is given in the executing
  session's own chat, per action.
