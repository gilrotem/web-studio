---
name: fal-image
description: Generate and edit real imagery with fal.ai through the studio's shared toolkit, with job-class routing, tier-aware sizing and a pre-filter gate. Use when a page needs an image that does not exist yet, when an approved image needs one thing changed, when the user says "hero image", "תמונת hero", "generate an image", "edit the image", or when a build is about to fall back on a placeholder box.
---

# fal-image — the studio's one image pipeline

Every project calls this toolkit. Nothing talks to fal directly any more, because
the same three defects had been copy-pasted into a dozen scripts: a 404 endpoint
spelling, a fallback that silently swapped the model, and a missing `image_size`
that let the edit endpoint upscale approved frames into fal's double-price tier.

`signature` says imagery must be real, large, and of the actual subject. This is
how that stays affordable while the volume grows.

## Run it

Needs Node 18+ and a fal.ai key in `FAL_AI_API_KEY` (or `FAL_KEY`), set in the
environment or in the project's `.env.local` / `.env` (git-ignored; the tools
look in the directory they are run from and in its parents). The key belongs to
the project, never to the kit, and is never quoted in a file or a message. See
the project's `.env.example`.

Run the tools from the project root, so the key file is found and the output
paths are the project's:

```bash
node ${CLAUDE_SKILL_DIR}/generate.mjs --routes                      # the wall chart
node ${CLAUDE_SKILL_DIR}/generate.mjs --prompt "..." --job candidate --n 3 --out design/references/moodboard/<round>
node ${CLAUDE_SKILL_DIR}/edit.mjs --image PATH --prompt "..." --out DIR --tag name
node ${CLAUDE_SKILL_DIR}/gate.mjs --in DIR --spec design/spec/imagery.md
```

The implementation is here and is shared by every project. Never copy these
files into a project, never add a project-specific fork, and never write a new
fal caller.

## Money

Imagery is spent under a cap the Art Director sets per project or per month; it
is written in the contract's "Imagery budget" line. Each run prints its cost
estimate and appends it to `runs.jsonl`; add the round's total to the session
note. A spend above the cap is a confirm-first action: ask before the run, not
after.

## Route by job, not by vendor

One model family, one host. What changes per job is the **resolution and the
discipline**, because those are the two dials that move money without touching
the look. `--job` picks the row; `--routes` prints the table with its reasons.

| `--job` | Model | Size behaviour |
|---|---|---|
| `candidate` *(default)* | seedream-pro | capped to the lower tier |
| `final` | seedream-pro | capped to the lower tier |
| `photoreal` | seedream-pro | capped to the lower tier |
| `edit` | seedream-pro-edit | matches the source image |
| `cast` | seedream-pro-edit | matches the source, max 3 references |
| `plate` | seedream-lite | flat billing, any size |
| `oversize` | seedream-lite | flat billing, up to 3072x3072 |
| `likeness` | seedream-pro | capped, and never leaves fal |
| `cutout` | birefnet | matte only, composite locally |

## The three rules that cost real money

1. **2,359,296 pixels.** fal bills Seedream 5 Pro by total area, and the price
   doubles above 1536x1536 worth of it. `2048x1152` is exactly that number, so
   it is the default wide frame: full 2048 width at the lower rate. The tools
   cap to it automatically; `--raw` overrides when you mean it.
2. **An edit inherits its source's size.** Left alone the endpoint returns a
   2K-class frame, which resamples an approved image and bills it double. An
   approved image is frozen creative capital and does not get resampled on the
   way through. `--size 2k` hands the choice back to fal deliberately.
3. **Never fall back to another model.** A silent downgrade is a quality
   regression dressed as resilience. The core retries the same endpoint and
   then fails loudly.

Retired: **FLUX 1.1 pro ultra**. It scores 892 Elo against Seedream 5 Pro's
1078 and costs about the same. There is no job it is the right answer to.

## The gate

`gate.mjs` runs between the generation loop and the folder you open. It judges
**objective, checkable facts only** — required element missing, count wrong,
broken anatomy, forbidden lettering, a reserved empty zone that is occupied —
and returns pass, flag or fail with one line of reason.

It never ranks aesthetics, never picks a winner, and never deletes. Failures
move to `rejects/`, questionable ones to `flagged/`. Vision models agree with
human reviewers about 86% of the time, which is enough to sort a pile and
nowhere near enough to make a call. It is tuned for recall on obvious misses, so
it will sometimes pass something weak — that is correct. Check `rejects/` weekly;
if it killed something good, loosen the checks.

Run it with `--dry` first on a folder you have already judged yourself. That is
how you calibrate it against your own verdicts before trusting it.

## Prompt craft — where results are actually won

1. **Name the photographic or rendered reality, not the concept.** You are
   directing an image, not describing a mood.
2. **State composition zones explicitly.** Say where things live and where
   emptiness lives. RTL pages mirror the reference: subject left, text zone right.
3. **Never ask for text in the image.** Models mangle Latin lettering and cannot
   produce correct Hebrew. Text goes in the DOM, always, which is also better for
   RTL, accessibility and SEO. The gate will catch this, but do not make it work.
4. **State exclusions**: "no people, no text, no watermark" unless people are the
   subject. When people ARE the subject, describe specific real people doing the
   actual work, never "smiling professionals".
5. **Keep the style lock verbatim** across a world. The closing style pair is the
   consistency mechanism between rounds; paraphrasing it breaks the run.
6. **Cap reference stacks at three.** Identity preservation is measured
   collapsing past that point. More references stop helping and start drifting.

## Where it fits

- **PAGE** step 7, after the direction is chosen. The image serves the design
  language, so it cannot precede it.
- **SITE** during step 2, on the page that births the language.
- **SYSTEM** rarely. Product UIs need real data, not imagery.
- **PORT** never. A port reproduces its source, including its images.

## Rules

- Generated images live under the project's `design/` (candidates in
  `design/references/moodboard/<round>/`, the chosen set where
  `design/spec/imagery.md` says), never at the repository root.
- Never generated people shown as real. A person on the site is a real
  photograph, edited at most (a backdrop swap, a cut-out: `foundations` skill,
  "Photograph"), and only with the approval the project's rules ask for.
- `generate.mjs` and `edit.mjs` append a `runs.jsonl` beside the output with the
  prompt, seed, model, size, tier and cost estimate. A hosted API returns plain
  JPEG with no embedded metadata, so if the script does not record it, nothing
  does. That ledger is what lets a later session re-cut a frame without
  re-deriving the art direction.
- Keep the winner, keep the round record, and let `rejects/` hold the rest.
