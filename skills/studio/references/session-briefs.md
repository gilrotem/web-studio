# Session briefs — how a stage session is started

A stage runs in its own session, started with a brief. The brief is short because the project's
files hold the state; it says which unit of work this is and what done looks like. A session that
plans (writes the plan, the briefs and the proposals) does not execute; a session that executes
runs one approved item.

## The shape of a brief

```
<project> — <stage or task, by its name in the plan>
Kind: execution · Model: <the model the plan names for this task>

Read first: STATUS.md, docs/design/PLAN.md (<the step>), DECISIONS.md (<the ids and labels that bind this step>).
Skills: studio, <the stage's skills>. Load nothing else until it is needed.

The unit of work: <one sentence>.
Inputs: <the files it reads>.
Produces: <the files it writes>, and one rendered sheet at design/review/<date>-<stage>/.
Done when: <the plan's done-when line>.
Gate: <the Art Director's written lock / closes on evidence>.
Out of scope: <what this session must not settle on the way>.
Carry from the last session: <the lines from STATUS.md "what the next session must carry">.
Close: evidence saved, STATUS.md replaced, the lock quoted into DECISIONS.md, commit and push on the Art Director's yes.
```

## Briefs for the usual sessions

**Content map (Stage 0a).** Skills: `studio`, `content-map`. Produces the library index, the map,
the gaps table and the draft of the one message to the client. Gate: the Art Director's yes to
the map as the content baseline. Out of scope: rewriting any text; contacting the client.

**The bar and the contract (Stage 1).** Skills: `studio`, `studio-research`, `craft-research`;
`mobbin-research` for UX patterns only. Before any research, ask the contract's open questions
in one round of closed questions (the one action and its channel; the type budget; the tag of
any site the client likes; where the client's spec is). Produces the filled contract, the bar,
the audit, the type proposal, the feasibility note and one sheet. Out of scope: any design.

**Site architecture (Stage 0b).** Skills: `studio`, `site-architecture`. Produces
`design/spec/ia.md` and one sitemap sheet. The slug alphabet is asked once, as a closed question.
Out of scope: colour, type, layout, copy.

**One foundation (Stage 2).** Skills: `studio`, `foundations`, `signature`; `hebrew-rtl-israel`
on a Hebrew site. One foundation per presentation, in the fixed order. Two foundations may share
a session when the first locks inside it. Out of scope: everything the foundation's lock does
not name.

**The concept world (Stage 3).** Skills: `studio`, `studio-art-direction`, `motion-language`,
`fal-image`; `webgl-atmosphere` or `video-production` only if the concept reaches for them. The
Art Director describes the concept first; the agent shapes one direction and pitches it in chat
before anything is built.

**Build (Stage 4).** Skills: `studio`, `mode-site` or `mode-page`, `cinematic-build`, the `gsap-*`
skills the scene needs. The hero alone first. Out of scope: any server.

**Review (Stage 5).** Skills: `studio`, `visual-review`, `jury`, `review-animations`. Measuring
and judging are split: a lighter model gathers the evidence, the strongest model scores and
ranks, a coding model fixes the single weakest thing.

**Conversion and launch (Stage 6).** Skills: `studio`, `wp-theme` when the delivery is WordPress.
The only stage where servers exist. Every live write is confirm-first, one change and one
read-back at a time.

## What a brief never does

- It never carries the state. If a fact is needed, it is in a project file and the brief points
  at it.
- It never widens the unit of work "while we're there".
- It never authorises a confirm-first action in advance. The yes is given in the executing
  session's own chat, per action.
