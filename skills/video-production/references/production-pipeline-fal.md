# Production pipeline on fal.ai

The execution document for a brand video. It is the companion of
`concept-and-script-template.md`: beat numbers, the metaphor table, the motif, the
accent rule and the face-visibility rule are all defined in the project's concept
document, and this pipeline turns them into generations.

Model names, endpoints and prices are as recorded in November 2026; verify against fal.ai before spending.

In a project, copy this file to `docs/video/04-production-pipeline.md` and fill
every slot. The filled file is the record of what was actually sent: fixed blocks,
per-beat prompts, the chosen model, seeds.

## How to read this file

- Text in `<ANGLE_BRACKETS>` is a slot. The slots are listed in section 3.
- Each prompt is given twice: first as a **pattern** with slots, which is the method;
  then as an **example fill**. The example is invented for illustration and is not a
  past project: *a hand bookbinder standing for a small contract-law practice*, the
  same example the concept template uses. Never send the example; write the
  project's own fill.
- Patterns are written with "they" and "their". Swap in the pronoun that matches the
  character before sending.
- **Kit note** marks a rule that comes from another skill in this kit and limits
  what the source method allows.

## Kit notes that apply before anything is generated

- **The lock comes first.** No call in this file runs before the Art Director's
  written lock on the concept and its cost cap. See the skill's gate.
- **Stills go through `fal-image`.** Stages A, B and C are image generations. The
  kit has one image caller and forbids a second one, forbids a silent fallback to
  another model, and logs every run to `runs.jsonl`. Its `cast` and `likeness` job
  rows are the ones this pipeline uses. The model table in section 2 is the source
  method's record of candidates, kept for the roles and the reasoning.
- **Three references per call.** `fal-image` caps a reference stack at three,
  because identity preservation falls off past that. The source method keeps a
  reference *set* of 6 to 8 character stills and 4 hand stills. Both hold: the set
  is the pool; each call passes at most three from it, chosen for the angle of the
  beat.
- **A generated person is never shown as real.** The kit's image rule says so. A
  film made with this pipeline shows either hands and silhouette only, or a declared
  stylised avatar of a person who agreed to it in writing. It is never presented as
  footage or as a photograph of that person. Record the provenance where the
  project's art direction keeps its imagery notes.
- **No text in any generation.** No lettering on documents, covers or spines. Text
  belongs to the page.

## 1. Pipeline overview

```
Reference stills of the person (2 or more) + logo
        |
        v
Stage A  Character sheet         identity-preserving image model, 10-14 stills, multiple angles
        |
        v
Stage B  Hand sheet              same model, hands only, 6-8 stills
        |
        v
Stage C  Keyframes per beat      image model with character + hand references, 3-5 variants per beat, pick 1
        |
        v
Stage D  Image-to-video          video model, 5-6 s per beat, 3-5 generations per beat, pick 1
        |
        v
Stage E  Conform + grade + loop  NLE or ffmpeg; LUT, grain, speed conform, seamless loop, exports
```

**Budget expectation:** roughly 40 to 60 image generations and 20 to 30 video
generations to land six usable clips. Plan for it. Put the two counts, multiplied by
the current per-call prices, into the cost estimate that goes with the pitch.

A film with no likeness skips Stage A's face stills and starts at the hand sheet;
everything else is unchanged.

## 2. Model selection on fal.ai

Model availability and names on fal change often; verify current endpoints before
running. The roles are stable:

| Role | Candidate endpoints on fal (verify) | Notes |
|---|---|---|
| Identity-preserving image gen (Stage A, B, C) | `fal-ai/flux-pro/kontext` (and `kontext/max`), `fal-ai/flux-pulid`, `fal-ai/ideogram/character`, `fal-ai/omnigen-v2` | Kontext handles "same person, new scene" edits well; PuLID holds face identity strongly from one or two references; Ideogram Character is purpose-built for consistent characters. Test two, keep one. |
| Optional LoRA route | `fal-ai/flux-lora-fast-training` then `fal-ai/flux-lora` | Only worth it if the reference set grows to 10+ real photos. With two stills, skip. |
| Image-to-video (Stage D) | `fal-ai/kling-video/v2.x/pro/image-to-video`, `fal-ai/veo3/image-to-video` (or current Veo), `fal-ai/minimax/hailuo-02/pro/image-to-video`, `fal-ai/wan/v2.x/image-to-video` | Kling: best hand/object motion fidelity in close-ups. Veo: best light and texture realism. Hailuo: good cloth and slow motion. Wan: cheapest for iteration. Iterate on Wan, finalize on Kling or Veo. |
| Upscale / cleanup | `fal-ai/clarity-upscaler`, `fal-ai/topaz/upscale/video` (if present) | For 4K master or to clean soft generations. |
| Frame interpolation | `fal-ai/film` or local RIFE/ffmpeg minterpolate | For the 0.8-0.9x slowdown. |

**Rule: do not mix video models within the final edit unless the grade fully hides
it.** Pick one for all beats once tests are done.

Notes on this table:

- The `v2.x` and "or current Veo" spellings are the source's own. They are not exact
  endpoint ids. Look up the live id before the first call and write the exact string
  into the project's filled copy of this file.
- A newer record of the video model families (including later generations of the
  same families, a per-clip price table and a benchmark plan) is beside this file:
  `ai-motion-video-production-research.md`. Where the two disagree on
  which generation is current, neither is proof; the live fal.ai model page is.
- The working pattern holds whatever the names are: **iterate on the cheapest model
  that shows the motion, finalise on one premium model.**
- **Kit note.** For Stages A to C the kit's `fal-image` routing decides the model.
  Use this table's first row to understand the roles and to argue for a route
  change, not to call an endpoint directly.

## 3. Fixed prompt blocks

Reuse these verbatim so every generation shares the same anchors. Write each block
once for the project, then never edit it. "Byte-identical" is the standard: a
changed comma is a changed prompt.

### The slots

| Slot | What it holds | Comes from |
|---|---|---|
| `<CHARACTER>` | The fixed physical description plus wardrobe | Concept document, section 5 |
| `<SETTING>` | The one room, its furniture, its light | Concept document, section 6 |
| `<SURFACE>` | The work surface and its material, two or three words | Concept document, section 6 |
| `<PALETTE>` | The dominant palette as a phrase a model understands | Concept document, section 6 |
| `<ACCENT>` | The single accent colour, as a colour name | Concept document, section 6 |
| `<BRAND_DARK>`, `<SHADOW_TINT>` | Hex values for the overlay and the grade | Project tokens |
| `<OFF_PALETTE>` | The banned colour names | Concept document, section 6 |
| `<MOTIF>` | The brand shape, as plain geometry ("a smooth S-curve", "an open arc") | Concept document, section 4 |
| `<SLEEVES>` | What shows at the wrist, the same in every hand shot | Concept document, section 5 |
| `<WORN_PROP>` | A prop worn in the early beats only | Concept document, section 5 |
| `<SET_PIECE>` | The standing background object used in the fitting beat | Concept document, section 6 |
| `<TOOL_n>` | The craft tool of beat n | Metaphor table |
| `<OBJECT_n>` | The client object of beat n | Metaphor table |
| `<TEXT_SIDE>` | "Right" on a right-to-left page, "left" otherwise | Concept document, section 1 |

### CHARACTER

Pattern:

> `<age range, complexion, hair, facial hair if any, glasses if any, eye colour,
> expression, build>`. Wearing `<wardrobe>`, `<SLEEVES>`, no watch, no rings.

The first sentence is the physical description from the concept document, copied
word for word. The second is the wardrobe. "No watch, no rings" stays in every
project: jewellery is the first thing to flicker between takes.

Example fill:

> A woman in her early fifties, light olive complexion, silver-grey hair cut in a
> short bob, round tortoiseshell eyeglasses, grey-green eyes, calm half-smile, slim
> build. Wearing a charcoal linen work apron over a crisp white shirt, sleeves
> rolled to mid-forearm, no watch, no rings.

### SETTING

Pattern:

> A quiet workroom that is both `<the craft's workroom>` and `<the client's
> office>`: `<SURFACE, large>`, `<storage furniture behind>`, `<SET_PIECE>` in the
> background, `<one or two objects of the client's profession>`, `<a lamp, switched
> off>`, soft cold daylight from a window at frame left, warm fill from
> `<the surface material>`.

Example fill:

> A quiet workroom that is both a bookbinder's bench room and a lawyer's study: a
> long pale beech workbench, a wall of shallow paper drawers behind, a wooden
> nipping press in the background, shelves of plain cloth-bound volumes, a brass
> desk lamp switched off, soft cold daylight from a window at frame left, warm fill
> from the wood.

### STYLE

Pattern:

> Cinematic still, 50mm lens, shallow depth of field, soft natural light, low
> contrast, `<PALETTE>`, fine film grain, photorealistic, editorial, no text, no
> logos, no watermarks.

Example fill:

> Cinematic still, 50mm lens, shallow depth of field, soft natural light, low
> contrast, desaturated charcoal and warm paper-white palette with pale beech, fine
> film grain, photorealistic, editorial, no text, no logos, no watermarks.

### NEGATIVE (image)

Pattern:

> cartoon, illustration, anime, oversaturated, neon, harsh flash, `<OFF_PALETTE>`,
> jewellery, watch, computer screen, laptop, phone, calculator, banknotes,
> handshake, extra fingers, deformed hands, blurry face, duplicate person, text,
> caption, watermark, logo

The list has four families. Keep all four: rendering style (cartoon to harsh
flash), off-palette colours, the anachronisms and category clichés from the concept
document's "what to avoid" list (jewellery to handshake), and generation faults
(extra fingers to logo). In the source method the off-palette terms were three
colour names; a typical fill is "red, yellow, green".

### NEGATIVE (video)

> fast motion, camera shake, zoom, morphing, flicker, face changing, extra limbs,
> text, subtitles, watermark, jump cut, lens flare

This one has no slots. Send it with every video call.

## 4. Stage A: character sheet

**Inputs:** the reference stills of the person. **Goal:** 10 to 14 consistent stills
of the character in the SETTING, in wardrobe, from varied angles.

**This stage is the identity proof** (`SKILL.md`, section 3). It runs with a face
only when the project's lock opens the face and the person's written agreement is
on file; otherwise skip to the hand sheet. Lay the kept stills side by side: one
face shape, hairline, eyes, age and skin across all of them, and recognisably the
real person. If that fails after one corrected round, the film is hands and
silhouette, every face beat is rewritten as a hands beat, and no image-to-video
call is made for a face. Write the result (passed or fell back, with the date) in
the run log before Stage C (keyframes), and never start Stage D (image-to-video)
for a face beat without it.

Each prompt = CHARACTER + SETTING + STYLE + one line below.

1. "Frontal medium close-up, looking directly at camera, calm half-smile, hands
   resting on the `<SURFACE>`."
2. "Three-quarter view from the right, looking down at the `<SURFACE>`."
3. "Three-quarter view from the left, looking down at the `<SURFACE>`."
4. "Profile from the right, bent over the `<SURFACE>`."
5. "Seen from behind over their right shoulder, hands on the `<SURFACE>`, face not
   visible."
6. "Medium shot standing beside `<SET_PIECE>`, looking at it."
7. "Close-up of face in soft focus, glasses catching window light, looking down."
   (Drop "glasses catching window light" for a character without glasses and name
   another feature that catches the light.)
8. "Medium close-up with `<WORN_PROP>`, looking at camera."
9. "Medium close-up with `<WORN_PROP>`, looking down."
10. "Low angle from `<SURFACE>` height, face partly cropped, chest and hands in
    frame."

The ten lines cover exactly the angles the script uses: the frontal look (opening
and handover), both three-quarters and the profile (working beats), from behind (the
decisive beat), beside the set piece (the fitting), soft face (any beat where the
face sits at the frame edge), with and without the worn prop, and the low table
angle. If the script uses an angle that is not here, add a line for it; do not hope
the video model will invent it.

Example fill for lines 6, 8 and 9: "standing beside a wooden nipping press, looking
at the press"; "with a linen measuring strip draped over one shoulder, looking at
camera"; the same, "looking down".

**Selection.** Keep only stills where the stable features match each other *and*
the real photos: hair shape and hairline, glasses frame, facial hair shape if any,
skin tone. Discard anything with a different nose or different eye spacing; those
two do not survive into video. Keep the best 6 to 8 as the reference set for Stages
C and D.

## 5. Stage B: hand sheet

Each prompt = CHARACTER + STYLE + one line below; crop to hands.

1. "Close-up of their hands resting on the `<SURFACE>`, `<SLEEVES>` visible."
2. "Close-up of their right hand holding `<TOOL of the marking beat>`."
3. "Close-up of both hands holding `<TOOL of the decisive beat>`."
4. "Close-up of their hands `<the gesture of the first working beat, with its
   tool>`."
5. "Close-up of their hand `<the small precise gesture of the fitting beat>`."
6. "Close-up of their hands holding `<the finishing tool>` with `<ACCENT>`
   `<thread, cord or ribbon>`."

One line per tool grip the script contains, plus the resting hands. The sleeve
detail is in the first line on purpose: cuffs and sleeves are how the viewer knows
the hands in a top-down beat belong to the person in the opening beat.

Example fill: "resting on the beech workbench, white shirt sleeves rolled to
mid-forearm visible"; "holding a slim steel awl"; "holding a wooden press handle";
"drawing a pale bone folder along a fold of paper"; "holding a small steel set
square against a book spine"; "holding a curved needle with deep green linen
thread".

Keep 4 consistent hand stills as references.

## 6. Stage C: keyframes per beat

For each beat generate the **first frame of the clip** as a still, using the
character and hand references. 3 to 5 variants, choose one. The chosen keyframe is
what the video model animates, so three things must be right here and cannot be
fixed later: the composition, the safe area (action away from the text side,
`<TEXT_SIDE>` third clear) and the accent object.

Face-visible beats send CHARACTER + SETTING + STYLE. Hands-only beats send SETTING +
STYLE and describe the hands and sleeves inside the beat line, so the model is not
tempted to put a face in frame.

Choose client objects that are drawings, grids, bindings, seals or models rather
than pages of readable text. Lettering comes out mangled, and "no text" in the STYLE
block fights a prompt that asks for a document full of words.

### Beat 1 keyframe (the meeting; face visible)

Pattern: CHARACTER + SETTING + STYLE +

> Medium close-up at eye level, slight low angle. They are bent over the
> `<SURFACE>`, both hands resting on `<OBJECT_1, closed>`. `<the motif object>` lies
> beside it in `<MOTIF>`. `<WORN_PROP, if any>`. They have just raised their eyes to
> the camera, calm half-smile, face sharp and in focus. `<TEXT_SIDE>` third of frame
> is quiet background.

Example fill:

> Medium close-up at eye level, slight low angle. She is bent over the beech
> workbench, both hands resting on a closed charcoal portfolio. A coil of deep green
> linen thread lies beside the portfolio in a smooth open arc. A linen measuring
> strip is draped over one shoulder. She has just raised her eyes to the camera,
> calm half-smile, face sharp and in focus. Right third of frame is quiet
> background.

### Beat 2 keyframe (the first working gesture; hands only)

Pattern: SETTING + STYLE +

> High-angle 45-degree view of the `<SURFACE>`. `<OBJECT_2>` lies flat on the
> surface, `<a second document>` half-tucked beneath it. Two hands with `<SLEEVES>`:
> the left `<pins or steadies the object>`, the right `<holds TOOL_2 at the start of
> its stroke along a line of the object>`. `<the accent detail of this beat>` is
> `<ACCENT>`. No face in frame.

Example fill:

> High-angle 45-degree view of the beech workbench. A large cream sheet ruled with
> fine grey lines lies flat on the bench, a second sheet half-tucked beneath it. Two
> hands with white shirt sleeves rolled to mid-forearm: the left palm holds the
> sheet square, the right hand holds a pale bone folder at the start of the fold.
> The far edge of the sheet lifts in a gentle open arc. A spool of deep green thread
> sits at the edge of the bench. No face in frame.

### Beat 3 keyframe (the mark; close-up, face edge only)

Pattern: SETTING + STYLE +

> Close-up slightly above the `<SURFACE>`. `<OBJECT_3>` lies on `<a ground material,
> in ACCENT if this is the accent of the beat>`. A right hand holds `<TOOL_3>`
> against it, beginning `<a clean line in MOTIF>`. `<a faint trace: dust, a
> shaving, an impression>`. The top of frame shows the soft out-of-focus edge of
> `<one or two stable features: the jawline, the lower rim of the glasses>`. No eyes
> in frame.

Example fill:

> Close-up slightly above the beech workbench. A folded section of cream pages lies
> in a small wooden cradle lined with deep green felt. A right hand holds a slim
> steel awl against the fold, beginning to pierce at a faint pencil mark. A narrow
> paper template strip curls off the bench in an open arc. The top of frame shows
> the soft out-of-focus line of a jaw and the lower rim of round tortoiseshell
> glasses. No eyes in frame.

### Beat 4 keyframe (the decisive gesture; low angle)

Pattern: SETTING + STYLE +

> Low angle along the `<SURFACE>`, very shallow depth of field. `<TOOL_4>` held in
> hands with `<SLEEVES>`, `<the tool caught mid-action>`, working into `<OBJECT_4>`.
> `<the guide line from beat 3>` is visible ahead of the tool, curving in
> `<MOTIF>`. Background soft: `<the wardrobe, two words>` of the figure seen from
> three-quarter behind, face not visible.

Example fill:

> Low angle along the beech workbench surface, very shallow depth of field. A curved
> needle held in hands with white shirt sleeves rolled to mid-forearm, drawn halfway
> through the spine of a stack of folded cream sections. Deep green linen thread
> makes an open arc between two stitches. Background soft: the charcoal apron and
> white shirt of the woman seen from three-quarter behind, face not visible.

### Beat 5 keyframe (the fitting; medium shot, face soft)

Pattern: SETTING + STYLE +

> Medium shot. `<SET_PIECE>` stands on the `<SURFACE>`. `<OBJECT_5, held, wrapped or
> mounted on it the way the craft's work in progress would be>`. Hands `<the small
> precise gesture>`; `<the ACCENT element>` curves across it in `<MOTIF>`. The
> figure stands behind the set piece, head bowed to the work, face in soft focus,
> `<one stable feature catching window light>`.

Example fill:

> Medium shot. A wooden nipping press stands on the beech workbench with a sewn
> block of cream pages clamped in it. One hand rests on the press handle, the other
> holds a small steel set square against the spine; a deep green ribbon marker hangs
> from the block in an open arc. The woman stands behind the press, head bowed to
> the work, face in soft focus, round glasses catching window light.

### Beat 6A keyframe (the finish; close-up, hands only)

Pattern: SETTING + STYLE +

> Close-up on the `<SURFACE>`. `<OBJECT_6, the finished document, in BRAND DARK>`
> lies flat, `<the finishing tool completing its last pass, with ACCENT thread, cord
> or ribbon>`, and `<a second finishing tool>` resting beside it. Hands with
> `<SLEEVES>`. No face in frame.

Example fill:

> Close-up on the beech workbench. A volume bound in charcoal cloth lies flat, a
> pale bone folder pressing along the spine joint, a deep green ribbon marker
> emerging from the foot of the spine, and a small brass weight resting beside it.
> Hands with white shirt sleeves rolled to mid-forearm. No face in frame.

### Beat 6B keyframe (the handover; face visible)

Pattern: CHARACTER + SETTING + STYLE +

> Medium shot at eye level. They stand behind the `<SURFACE>` holding `<OBJECT_6,
> finished and closed>`, `<the ACCENT element>` across it in `<MOTIF>`, extending it
> toward the camera with both hands. They look directly at the camera, calm
> half-smile, face sharp and in focus. No `<WORN_PROP>`.

Example fill:

> Medium shot at eye level. She stands behind the beech workbench holding a closed
> volume bound in charcoal cloth, a single deep green ribbon marker laid across the
> cover in a smooth open arc, extending it toward the camera with both hands. She
> looks directly at the camera, calm half-smile, face sharp and in focus. No
> measuring strip on her shoulder.

**The loop pair.** Beat 1 and beat 6B are written as a pair: the same shot size, the
same eye level, the same expression, the same side of the frame left quiet. Generate
them one after the other and lay them on top of each other at 50 percent opacity
before accepting either.

## 7. Stage D: image-to-video prompts

One gesture per clip. Request 5 to 6 seconds. Motion prompts are short; the keyframe
carries the look. Attach NEGATIVE (video).

Every motion prompt has the same four parts: the one movement and its extent; what
stays still; the camera; and, for the face-visible beats, the expression held at the
end.

| Beat | Motion prompt pattern |
|---|---|
| 1 | "They slowly raise their head and eyes to meet the camera, a calm half-smile forms. Hands stay still. Camera very slowly pushes in. Soft natural light, no other movement." |
| 2 | "The right hand slowly `<draws TOOL_2 along the line of OBJECT_2>` until `<the stroke is complete>`, then `<the end of the material settles in MOTIF>`. The left hand stays pinned. Camera static." |
| 3 | "`<TOOL_3>` makes one slow continuous `<line or mark>` across `<OBJECT_3>`, `<the trace>` lifting faintly. The hand moves steadily `<direction>`. Camera static or drifts very slowly sideways following the hand." |
| 4 | "`<TOOL_4>` `<acts>` in two slow deliberate `<bites, pulls or passes>` through `<OBJECT_4>` along the guide line, `<the changed material parting or tightening in a gentle curve>`. Camera static, very shallow focus." |
| 5 | "The hands `<three small actions, in order>`. The figure's head stays bowed. Camera static or a very slow quarter orbit." |
| 6A | "`<the finishing tool>` completes one slow `<stitch or pass>` and `<the ACCENT thread or ribbon is drawn taut or settles>`; `<the second tool>` glides once along `<the seam or edge>`. Camera static." |
| 6B | "They `<close or fold OBJECT_6>` once, `<place the ACCENT element>`, extend it toward the camera with both hands, then raise their eyes to the lens and hold a calm half-smile. Camera static." |

Example fills:

| Beat | Motion prompt |
|---|---|
| 1 | "She slowly raises her head and eyes to meet the camera, a calm half-smile forms. Hands stay still. Camera very slowly pushes in. Soft natural light, no other movement." |
| 2 | "The right hand slowly draws the bone folder along the fold in one continuous stroke until it reaches the edge, then the far edge of the sheet lifts and settles in a gentle arc. The left hand stays still. Camera static." |
| 3 | "The awl presses slowly through the fold at the pencil mark and withdraws, a faint paper fibre lifting. The hand moves steadily downward. Camera static or drifts very slowly sideways following the hand." |
| 4 | "The needle is drawn through the spine in two slow deliberate pulls, the green thread tightening in a gentle curve. Camera static, very shallow focus." |
| 5 | "The hands turn the press handle a quarter turn, hold the square against the spine, and steady the hanging ribbon. The woman's head stays bowed. Camera static or a very slow quarter orbit." |
| 6A | "The bone folder completes one slow pass along the spine joint and the green ribbon settles; the hand lifts away once. Camera static." |
| 6B | "She closes the volume once, lays the green ribbon across the cover, extends it toward the camera with both hands, then raises her eyes to the lens and holds a calm half-smile. Camera static." |

Generate 3 to 5 takes per beat. **Reject any take where:**

- the face changes between the first and the last frame,
- fingers multiply,
- text appears,
- the accent object changes colour.

These four are objective and can be checked frame by frame. Do not keep a take with
one of them because the motion is beautiful; the fault will be the only thing a
viewer sees on the tenth loop.

## 8. Consistency rules

- Always pass references from the same 6 to 8 character stills and 4 hand stills.
  Never swap the set mid-project. (**Kit note:** at most three per call.)
- Keep every fixed prompt block byte-identical across calls.
- Fix the seed per beat once a good composition is found, then vary only the motion
  prompt.
- Keep the room identical: same work surface, same window side, same furniture
  behind. If a generation moves the window, discard it.
- Generate all keyframes before generating any video. Lay the keyframes side by side
  and check palette, light direction and work-surface height before spending on
  video.
- Face-visible beats (1 and 6B) get the most takes. Face-hidden beats are forgiving.
- One accent object per frame. If a keyframe shows the accent colour on two things,
  it is rejected at Stage C, not corrected in the grade.
- One video model for all beats (section 2).

## 9. Stage E: conform, grade, loop

1. Bring all clips to one frame rate (24 or 25 fps). If a clip is too fast, slow to
   0.8-0.9x with optical flow (`ffmpeg -filter:v "minterpolate=fps=24:mi_mode=mci"`
   after `setpts`), or use `fal-ai/film`. Worked form for a 0.83x slowdown:
   `-filter:v "setpts=1.2*PTS,minterpolate=fps=24:mi_mode=mci"`.
2. Trim each clip on gesture completion. Target durations come from the concept
   document, section 7.
3. Order: 1 -> 2 -> 3 -> 4 -> 5 -> 6A -> 6B -> (dissolve) -> 1.
4. Loop point: a 12 to 18 frame cross-dissolve from the held final frame of 6B to
   the first frame of 1. Both are the same framing and expression by design.
5. Grade: one LUT across all clips. Shadows toward `<SHADOW_TINT>`, midtones
   neutral, skin protected, global saturation minus 20 to 30 percent, the accent
   (`<ACCENT>` hex) kept full.
6. Grain: uniform fine grain over the whole timeline.
7. Export per the concept document, section 10. For the web master:
   `ffmpeg -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart -an`
   and a VP9 WebM twin (`-c:v libvpx-vp9 -b:v 0 -crf 32 -an`). Confirm the file is
   actually muted (`-an`): check that the output has no audio stream, not that the
   flag was typed.
8. Poster frame: export frame 0 of beat 1 as a still, then make its web formats.

**Kit note.** `asset-pipeline` has the kit's general loop encode (CRF 23 for H.264,
CRF 30 with `-row-mt 1` for VP9) and the poster and responsive-image scripts. The
values in step 7 are the source method's for this master. Use one set per project
and write which in the filled copy. Per-breakpoint encodes and the poster go through
`asset-pipeline`.

## 10. Web implementation notes

The source method's markup, as recorded:

```html
<video autoplay muted loop playsinline poster="/video/brand-poster.webp" preload="metadata">
  <source src="/video/brand.webm" type="video/webm">
  <source src="/video/brand.mp4" type="video/mp4">
</video>
```

- `muted` and `playsinline` are required for mobile autoplay.
- Respect `prefers-reduced-motion`: swap to the poster image.
- Overlay a gradient in `<BRAND_DARK>` at 60 to 75 percent on the `<TEXT_SIDE>`
  third, where the page text sits.
- Serve the individual beat clips on inner pages at reduced resolution (960 px wide
  is enough for a section background).

### What the kit adds to that markup

The recorded markup starts the video for everyone, including visitors who asked for
reduced motion, and gives no way to pause a loop that runs for more than five
seconds. The kit's rules close both gaps:

1. **The poster is a real image and is the LCP candidate.** It is identical to
   frame 0 of the loop, it is in the HTML, it is painted in its final place before
   any script runs, it has no fade-in, it carries `fetchpriority="high"`, and it
   stays under 100 KB.
2. **The video has no `autoplay` attribute and no source in the HTML.** A script
   attaches the source after the page's `load` event, and only when the visitor has
   not asked for reduced motion.
3. **A visible pause control** appears as soon as the video plays, because the loop
   runs longer than five seconds.
4. **The scrim is measured, not assumed.** Text over the moving part needs a scrim
   under which the text holds 4.5:1 against the brightest frame of the loop. The
   60 to 75 percent figure above is a starting point; the contrast measurement is
   the test. Text that sits in the quiet `<TEXT_SIDE>` third still gets measured.

A pattern for it (written for this document; not run in a browser here, so test it
in the project before it ships):

```html
<div class="brand-loop" data-loop
     data-small="/video/brand-720" data-large="/video/brand-1080">
  <img src="/video/brand-poster.webp" width="1920" height="1080" alt=""
       fetchpriority="high" decoding="async">
  <video muted loop playsinline preload="none" aria-hidden="true"></video>
  <button type="button" hidden data-label-pause="Pause the video"
          data-label-play="Play the video">Pause the video</button>
</div>
```

```js
const root = document.querySelector('[data-loop]');
const video = root.querySelector('video');
const button = root.querySelector('button');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function start() {
  if (reduced.matches || video.src) return;            // poster only, for good
  const base = innerWidth < 768 ? root.dataset.small : root.dataset.large;
  const webm = video.canPlayType('video/webm; codecs="vp9"');
  video.src = base + (webm ? '.webm' : '.mp4');
  video.play().then(() => { button.hidden = false; }).catch(() => {});
}

button.addEventListener('click', () => {
  const resume = video.paused;
  if (resume) video.play(); else video.pause();
  button.textContent = resume ? button.dataset.labelPause : button.dataset.labelPlay;
});

if (document.readyState === 'complete') start();
else addEventListener('load', start, { once: true });
```

The video element sits exactly over the poster image (same box, `object-fit: cover`
on both), so the first decoded frame replaces the poster with no visible change.
The button labels are written in the site's language.

### Size budget per breakpoint

| Where | Encode | Budget |
|---|---|---|
| Wide screens, hero | 1920x1080, MP4 and WebM | under 8 MB for the full 32 to 40 s loop (the source method's figure) |
| Section backgrounds, inner pages | 960 px wide, one beat clip | kit starting point: under 1.5 MB per clip |
| Phones (under 768 px) | 720 px wide, or the poster alone | kit starting point: under 3 MB for the full loop |
| Poster | the project's responsive image widths | under 100 KB at the width that is the LCP |

Only the first row and the 960 px width come from the source method. The other
figures are starting points set by this kit and have not been measured on a real
project; tune them and write the project's own numbers in its contract.

## 11. QA checklist before delivery

- [ ] Every beat reads as `<the craft idea>` and `<the client's subject>` in
      isolation.
- [ ] Face recognisable as the consenting person in the face-visible beats; no face
      drift within those clips. (Or: no identifiable face anywhere, by design.)
- [ ] Hands consistent across all beats.
- [ ] The motif present once per beat.
- [ ] One accent object per frame, nothing in the off-palette colours.
- [ ] `<TEXT_SIDE>` third clear for overlaid text in the 16:9 master.
- [ ] Loop point invisible at normal playback.
- [ ] File muted (no audio stream); plays inline on iOS Safari and Android Chrome.
- [ ] Reduced-motion: the video never starts; the poster reads as a finished frame.
- [ ] Pause control visible and working.
- [ ] Text over the video holds 4.5:1 against the brightest frame under it.
- [ ] Poster equals frame 0 and is under its byte budget; the page's LCP element is
      the poster.
- [ ] Each breakpoint's file is inside its budget.
- [ ] The person has approved the use of their likeness in a generated avatar, in
      writing.
- [ ] Every generation is in the run log with its cost; cost per approved clip is
      written in the session note.
