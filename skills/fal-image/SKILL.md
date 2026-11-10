---
name: fal-image
description: Generate and edit real imagery with fal.ai through the kit's one toolkit — job-class routing, tier-aware sizing, fal's queue, an enforced imagery cap read from the contract, a spend ledger, batch rounds and an optional pre-filter gate. Use when a page needs an image that does not exist yet, when an approved image needs one thing changed, when the user says "hero image", "תמונת hero", "generate an image", "edit the image", or when a build is about to fall back on a placeholder box.
---

# fal-image — the kit's one image pipeline

Every project calls this toolkit and nothing else talks to fal: the plugin's
`fal-guard` hook refuses a direct call, or a fal caller written outside this
folder, before it runs. The generation law (flow, prompt grammar, sizes) is
`PROTOCOL.md` beside this file; read it before the first prompt of a round.

## Run it

Needs Node 18+ and a fal.ai key in `FAL_AI_API_KEY` (or `FAL_KEY`), set in the
environment or in the project's git-ignored `.env.local` / `.env` (the tools look
in the directory they are run from and its parents). The key belongs to the
project, never to the kit, and is never quoted in a file or a message.

Run from the project root, so the key, the contract and the ledger are found:

```bash
node ${CLAUDE_SKILL_DIR}/generate.mjs --routes                          # the job table
node ${CLAUDE_SKILL_DIR}/generate.mjs --prompt "..." --job candidate --n 3 --out design/references/moodboard/<round> --tag hero
node ${CLAUDE_SKILL_DIR}/edit.mjs --image PATH --prompt "..." --out DIR --tag fix
node ${CLAUDE_SKILL_DIR}/batch.mjs --file design/references/moodboard/<round>/prompts.json
node ${CLAUDE_SKILL_DIR}/gate.mjs --in DIR --spec design/spec/imagery.md     # optional
python ${CLAUDE_SKILL_DIR}/sheet.py --in DIR                                 # contact sheet + review copies, free
node ${CLAUDE_SKILL_DIR}/selftest.mjs                                         # the toolkit checking itself, no network
```

Add `--dry` to generate, edit or batch to see the size, the price and the cap
check without spending. Logic lives here; nobody writes a new fal caller, and a
project never forks these files. A need the table does not cover is a new row in
`routes.mjs`, made in the kit's repository.

## Money: the cap and the ledger

- **The cap** is one line in the project's `design/spec/contract.md`:
  `**Imagery budget:** USD <n> per project`, `USD <n> per month`, or `none`. It
  is set at birth. `null` or a missing line means no cap, and no paid run.
- **Every paid run is checked before anything is sent**, dry runs included: the
  estimate plus what `design/spend.jsonl` already holds (this month, for a
  monthly cap) must stay inside the cap, or the run is refused with exit 2. A
  batch is priced whole first and refused whole. The gate's vision calls count.
- **Raising the cap is the Art Director's call**, made by changing the contract
  line; then the run goes. There is no override flag.
- **Two ledgers, two jobs.** `design/spend.jsonl` is the project's money ledger:
  one line per paid call (tool, job, model, `usd` from fal's meter when it sends
  one, `usd_source`, request id, output path). `runs.jsonl` beside the output is
  the round record: prompt, seed, size and charge of every frame, which is what
  lets a later session re-cut a frame without re-deriving the direction.

## Jobs

Seedream 5 Pro is the default family. Every other row exists because a project
proved a need the default cannot meet. `--routes` prints the reasons.

| `--job` | Tool | Model | Price (fal pricing API, 2026-09-21) |
|---|---|---|---|
| `candidate` *(default)* / `final` / `photoreal` / `likeness` | generate | Seedream 5 Pro | $0.0675, capped to 1 unit |
| `plate` | generate | Seedream 5 Lite | $0.035 flat, any size |
| `material` | generate | FLUX 1.1 ultra | $0.06 flat (photography a project's bake-off chose) |
| `vector` | generate | Recraft V3 | $0.08 per SVG (vector styles bill 2 units) |
| `edit` *(default)* / `cast` | edit | Seedream 5 Pro edit | $0.0675, source size capped to 1 unit |
| `plate-edit` | edit | Seedream 5 Lite edit | $0.035 flat |
| `fill` | edit | FLUX fill + `--mask` | $0.05 per megapixel |
| `cutout` | edit | BiRefNet | ~$0.001 |

## The rules that hold the money

1. **The 1-unit line: 2,359,296 pixels.** Seedream Pro bills 1 unit at or under
   1536x1536 worth of area and 2 above it. `2048x1152` sits exactly on the line
   and is the default frame. Generation caps to it; `--raw` overrides.
2. **Edits are capped too.** An edit follows its source's size, shrunk under the
   line. Left alone fal returns a 2K frame at double price. `--raw` keeps the
   full source size when that is really wanted.
3. **Plates and backgrounds go to Lite**, for generation and for edits.
4. **Fewer, better candidates.** 2-3 per prompt, 3-4 for a hero, never more than
   4 (the tool refuses). A failed round means the prompt or the spec is wrong.
5. **Edit before re-roll.** An approved frame plus one wrong detail is an edit.
6. **One job is paid for once.** Calls go through fal's queue: a slow job is
   waited on, never resubmitted, and only a submit that fal rejected (429/5xx)
   is retried. The model is never silently swapped for another.

## The gate (optional)

`gate.mjs` sorts a folder before you look at it. It costs $0.01 per call, judges
up to 4 images per call, and runs after the images are paid for, so it saves
review time, never fal spend; `--dry` moves nothing but still calls (and pays).
The vision model only names each image's worst objective defect from a closed
list; the code decides: anatomy, missing subject, wrong count and artefact fail,
the rest flag, because one edit removes them. It never judges taste, never picks
a winner, never deletes: fails move to `rejects/`, flags to `flagged/`, and
`gate.jsonl` records every call. Standing rules (`lettering`, `brand`,
`anatomy`) can be overridden per project in `design/gate.config.json`; tune them
only after a run on a round already judged by eye.

## Where it fits

- The concept stage (the hero's imagery) and the build, once the direction is
  set: the image serves the design language, so it cannot precede it. A source
  that must be reproduced keeps its own images.
- Generated images live under `design/` (candidates in
  `design/references/moodboard/<round>/`, the chosen set where
  `design/spec/imagery.md` says), never at the repository root. Keep the winner,
  the round's `prompts.md` and its `runs.jsonl`; `rejects/` holds the rest.
- Never generated people shown as real. A person on the site is a real
  photograph, edited at most (a backdrop swap, a cut-out: `foundations` skill),
  and only with the approval the project's rules ask for.

## Before changing anything here

Read `MAINTENANCE.md`: what was measured rather than assumed (billing geometry,
review cost, gate behaviour), which rulings came out of testing, what is left
open, and the checklist for the next review. Run `selftest.mjs` after any change.
