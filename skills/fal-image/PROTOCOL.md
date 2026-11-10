# The generation protocol — read before the first prompt of a round

Written 2026-09-01 after phase sessions burned fal credit re-rolling from zero,
and generalised for every project on 2026-09-20. It is the one document a
session reads before generating any image. A project's own imagery spec
(`design/spec/imagery.md`) and its art-direction document are the parent laws;
where they are stricter or looser, the project wins — that is what
`design/gate.config.json` is for.

## The flow (in order; skipping a step is the failure mode)

1. **The imagery spec before generation.** No prompt is written until the
   project has a spec declaring: palette territory (exact hex), cast and its
   register, props, composition laws, lettering rules, the signature. A new
   world: write the spec first, then generate.
2. **Batch small, distinct, purposeful.** Per subject: n=2-3 candidates, one
   prompt, one purpose ("hero plate", "tier icon", "banner for a 56%-text
   band"). Never spray n=6 hoping something sticks, never re-run the same prompt
   "for more options".
3. **The Art Director curates in rounds.** Candidates are shown for a pick; the
   picks, rejects and rulings are written into the imagery spec the same day and
   bind every later image of that world.
4. **Record the round.** Each round gets a folder
   `design/references/moodboard/<round>-<purpose>/` with a `prompts.md`: the
   verbatim prompt, sizes, n, the winner and why, the alternates kept. The next
   session continues a line by opening the last round's `prompts.md`, never from
   zero. `batch.mjs` takes the same round as a `prompts.json`.
5. **Evolve with the edit pipeline, don't re-roll.** An approved image is frozen
   creative capital. Change one thing (a defect, a colour, a face on a coin)
   with `edit.mjs`: the prompt names only the change, then "Keep everything else
   exactly the same", then lists what must stay. Full regeneration only when the
   composition itself is wrong.

## The prompt grammar (Seedream 5 Pro)

Build every prompt from these blocks, in this order:

1. **Format and purpose**: "Ultra-wide banner composition for a website strip",
   "Vertical mobile banner composition", "background plate". Naming the format
   makes the model compose for the crop.
2. **Composition zones, explicit and directional**: where things live and where
   emptiness lives ("on the LEFT third ...; the CENTER and RIGHT two thirds are
   empty, reserved for text"). RTL pages mirror LTR references: subject left,
   text zone right.
3. **Subject and register**: the cast with its emotional law spelled out. The
   register adjectives are the consistency mechanism between rounds.
4. **Light as depth**: name the light story ("warm light glows upward", "rays
   stream down", "fading nearly black at the very top"). Depth by light and
   shadow, not detail noise.
5. **The style lock**: the same closing pair of phrases on every prompt of a
   world, verbatim. Paraphrasing it breaks the run.
6. **Negatives**: "no text, no logos, no characters" (drop the last when a cast
   is wanted). Brand marks never inside imagery: branding lives in the DOM.

Never ask for text in the image: models mangle Latin and cannot write Hebrew.
When people are the subject, describe specific real people doing the actual
work, never "smiling professionals".

## Sizes

Seedream 5 Pro bills 1 unit up to and including **2,359,296 px** of area
(1536x1536 worth) and 2 units above it, with no third tier. The working set sits
under the line; the generator caps anything larger automatically.

- Wide band or banner plate: **2048x736** (2.8:1), 1.51 MP
- Hero or scene, the default wide frame: **2048x1152**, 2.36 MP, exactly on the line
- Section background plate: **1760x1320** (4:3), 2.32 MP
- Call-to-action panel plate: **1920x1200** (16:10), 2.30 MP
- Mobile portrait plate: **1024x1440**, 1.47 MP
- Sprites on black (screen blend): **1024x1024**
- More width than 2048: generate at 2048x1152 and use a precision upscale.

Plates and backgrounds with no cast go to `--job plate` (Seedream Lite, $0.035
flat). Lite ignores small requested sizes and returns a large frame (a 1024x576
request came back 3416x1920, still $0.035), so resize locally.

## Cost discipline

- **The cap is enforced.** Every run is priced and checked against the
  contract's imagery budget before anything is sent; past the cap is refused.
- **Edit before re-roll.** Approved image plus one wrong detail = `edit.mjs`.
- **Edits are capped to 1 unit.** `--raw` keeps the source size at double price,
  only when the extra pixels are needed. Plate edits use `--job plate-edit`.
- **Candidates: 2-3 per prompt, 3-4 for a hero, never more than 4.**
- **Cap reference stacks at three.** Identity preservation collapses past that.
- **The gate is optional**: $0.01 per call, after the images are paid for.
- **Every paid call is on the ledger**: `design/spend.jsonl` for the money,
  `runs.jsonl` beside the output for the round. New images with no `runs.jsonl`
  beside them means something went around the toolkit.
- fal's rate limit is 10 concurrent. A rejected submit (429) is retried by the
  tool; one missing candidate is not a reason to re-run a round.
