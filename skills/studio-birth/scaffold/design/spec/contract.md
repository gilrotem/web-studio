# Contract — <project>

> The whole design brief for the studio. `null` = NOT SPECIFIED; never invent a value for it.
> Content strings are the client's, verbatim. Rulings are quoted from `DECISIONS.md` with their
> id and label, never paraphrased.
> Filled <date> (<which session>) from `docs/design/studio-brief.md`, the client's spec
> `docs/design/client-spec.md` and the Art Director's answers in that session.

**Mode:** `null` (`SITE` | `PAGE`)
**Delivery:** `null` (for example: a WordPress hybrid theme in clean code, no page builder, handed into `site/`; or a static deploy). Stages 2 to 5 are designed and built as a static site inside `design/`; the delivery format is made from the locked static site at the end.
**Language:** `null` (for example `he-IL (RTL)`, one language)
**Type budget:** `null` (free fonts only | one commercial face | open)
**Type rule:** `null` (any ruling that narrows the choice, quoted)
**Imagery budget:** `null` (the cap for generated imagery, per month or per project; `none` if nothing may be generated)
**Spec document:** `docs/design/client-spec.md` (the client's own specification, verbatim). The creative gaps it leaves are the studio's to shape into one direction for the Art Director's lock.

---

## Rulings this contract stands on (verbatim from `DECISIONS.md`)

- D-nnn — <label>: "<verbatim>"

## Aesthetic
`null` (decided in Stage 2 and Stage 3, locked by the Art Director). The client's words that the later stages read, not interpret here (client spec, verbatim):

- "<the client's sentence about look, feel, motion or colour>"

## Reference
| # | Source | Tag | What we take from it |
|---|---|---|---|
| 1 | <URL> | `STRUCTURE` or `TASTE` (who tagged it, when) | <what is taken, and what is not> |

Gate 1: TASTE only for genuinely excellent work. A competitor is STRUCTURE. A site the client
likes is STRUCTURE until the Art Director tags it TASTE. The level is set by
`design/references/bar/`, never by a source in this table.

## Intent
- **What:** `null` (the site in one line: whose it is and which pages it has)
- **Who:** `null` in the owner's words. Agent reading, marked as such: <audience, their moment of need, their device>
- **The one action:** `null` (what the visitor does, the client's wording quoted; the primary channel; the secondary channels; where it repeats)
- **A recurring component:** `null` (anything the client asks for on every page, quoted, with its source text)
- **Where it lives:** `null` (platform and host; the temporary address; the real domain)

## Brand assets
- Logo: `null` (files; final or not, by ruling; colours measured from the vector file, or "approximate until measured")
- Photographs: `null` (what exists; what is approved for the site; what is not used without approval)
- Video: `null`
- Proof (reviews, credentials, numbers): `null` (verbatim only, after the client confirms)
- Imagery that does not exist: made here under the imagery budget, texture and material first; never generated people shown as real.

## Guardrails
- Language: <for example: one language; no display word in another script on a page>
- One phone number across the site; every form carries the market's privacy notice beside the submit control and a link to the privacy policy.
- Accessibility to WCAG 2.2 AA natively (and the market's standard, for example IS 5568); no overlay widget as a substitute; the accessibility statement reachable from every page.
- Contrast is design: body 4.5:1, large and UI 3:1, including over media. Brand colours that fail a text role get a darker relative.
- Reduced motion is a complete second design; autoplay over 5 s has a visible pause control.
- Text reveals split by lines only, never characters; logical CSS properties only; `<bdi>` around numbers, phones and runs in the other script.
- Performance: LCP 2.5 s, INP 200 ms, CLS 0.1 at p75; JS under 150 KB gz; 60 fps at the calibrated mid-tier mobile preset.
- The category's clichés listed in `design/research/audit-<category>.md` are refused deliberately.
- <project-specific guardrails, each with its ruling>

## Signature
`null` (declared in Stage 3, confirmed by the Art Director in one line before the language-birth build). Candidates and their cost are in `design/research/feasibility.md`.

## Tokens
Source: `design/spec/tokens.css`, born in Stage 2; the delivery's presets are generated from it.

## Stage 1 outputs
- `design/research/audit-<category>.md`: the category audit, STRUCTURE only.
- `design/references/bar/README.md` and its captures: the level.
- `design/research/type-pairings.md`: the type proposal.
- `design/research/feasibility.md`: one paragraph per candidate signature effect.
- `design/review/<date>-stage1/sheet.png`: the sheet shown to the Art Director.

## Not settled
- Everything marked `null` above.
- The client's: <what only the client can supply>.
