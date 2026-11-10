---
name: video-production
description: Plans and produces a silent, looping brand video for a site, from the client profile through one pitched concept (craft metaphor, character bible, visual motif, beat-by-beat script) to a character sheet, keyframes, image-to-video clips on fal.ai, assembly, export and integration into the page as a muted loop with a poster. Use when a site may need a hero or section video, when a concept or script for one is being written, when clips are about to be generated, or when the user says "video", "brand video", "hero video", "loop", "סרטון", "וידאו", "סרטון תדמית", "סרטון רקע".
---

# Video production: one concept, six beats, a silent loop

A brand video is the most expensive asset a site can carry: in generation money, in
bytes and in attention. This skill decides whether a site earns one, then runs the
stages in order. The depth is in `references/`; this file is the order, the rules
and the gate.

Neighbours: `asset-pipeline` (encoding, posters), `fal-image` (every still),
`motion-language` (motion on the page around the video).

## 1. When a site earns a video

It earns one when all of these hold:

- There is a picture of the client's work that is **true**, not flattering: a
  metaphor or a process that claims exactly what the service does (the through-line
  in the profile). No true picture, no video.
- That picture reads **in any five seconds, without sound, from any starting
  point**. A visitor lands mid-loop and may leave quickly.
- The video is the page's one remembered moment, and it sits *behind* the headline
  without fighting it.
- The Art Director has set a cost cap for it, and the page's performance budget can
  absorb it.

It does not earn one when:

- A still, a CSS or GSAP sequence, or a shader carries the idea. Use those.
- The message needs exact text, numbers, logos, interface or geometry. A video
  model cannot hold them. That is code-driven motion or 3D, not generated video
  (see `references/ai-motion-video-production-research.md`, sections 9, 10 and 13).
- The video would be the only carrier of information. Everything it says must also
  be on the page as text.
- A person would appear and has not agreed in writing to a generated likeness. Then
  it is hands and silhouette only, or nothing.

## 2. The stages, in order

| # | Stage | Produces | Filed at |
|---|---|---|---|
| 1 | Brand and client profile | The brief: identity, services in tiers, the through-line, positioning, audiences, tone, visual identity and its one reusable motif, current site and its gaps | `docs/video/01-brand-and-client-profile.md` (and `02-site-content-extraction.md` when a site exists) |
| 2 | Concept and metaphor | Format constraints, the fusion, the thesis line, "why this is true", the metaphor table (craft stage, gesture, client object, meaning) | `docs/video/03-brand-video-concept-and-script.md`, sections 1 to 3 |
| 3 | Character bible and visual motif | Fixed physical description, wardrobe, face-visibility rule, hands; the room, light, palette, one accent per beat; the motif as a physical object in every beat | same file, sections 4 to 6 |
| 4 | Beat-by-beat script | Per beat: shot, motion, camera, face, client object, motif, accent, meaning; loop return; end card; edit rules; deliverables; what to avoid | same file, sections 7 to 11 |
| 5 | Character sheet (and hand sheet) | 10 to 14 stills, keep 6 to 8; 6 to 8 hand stills, keep 4 | `design/assets/video/character/`, `design/assets/video/hands/` |
| 6 | Keyframes | The first frame of every beat, 3 to 5 variants, one chosen | `design/assets/video/keyframes/beat-<n>/` |
| 7 | Image-to-video | One gesture per clip, 5 to 6 s, 3 to 5 takes, one chosen | `design/assets/video/clips/beat-<n>/` |
| 8 | Assembly and export | Conform, trim, grade, grain, loop; web master, poster, social cuts, beat clips, stills | `design/assets/video/master/` |
| 9 | Integration into the page | The muted loop on the page, under section 5's rules | the site's code and its public assets |

Also in `docs/video/`: `04-production-pipeline.md` (the filled prompts, chosen
model, seeds), `05-concept-vocabulary-and-references.md` and `00-README.md` (the
index). Documents live in `docs/video/`; everything generated lives under
`design/assets/video/`, with the run log beside it. Stages 1 to 4 cost nothing but
thought; 5 to 7 cost money and never run before the gate.

## 3. The gate with the Art Director

- **One concept, pitched once.** In chat: working title, thesis line, the concept in
  three short paragraphs, the metaphor table, the motif per beat, the character and
  the room in two lines each, and a cost estimate. No generated images accompany the
  pitch. No parallel concepts are made.
- **A written lock before any generation money is spent.** The Art Director's lock
  is recorded in the project with the cost cap and the page's loop length. Until
  then, no call to an image or video model for this video.
- **The likeness line.** If a real person appears, their written agreement to a
  generated likeness is on file before the character sheet. The lock says whether
  the face is shown or the film is hands and silhouette.
- **Above the cap is a new question.** A spend past the cap is asked before the run,
  never reported after it.
- The beat script (stage 4) is written in full after the lock. A change to the
  metaphor table after the lock is a new pitch.

## 4. Money and consistency rules

Money:

1. **Estimate before spending.** Expect 40 to 60 image generations and 20 to 30
   video generations to land six usable clips. Multiply by current prices and show
   the number with the pitch.
2. **All keyframes before any video.** Lay them side by side; check palette, light
   direction and table height. A wrong keyframe costs cents; a wrong clip costs
   more, several times over.
3. **Draft cheap, finish on one premium model.** Iterate on the cheapest model that
   shows the motion. Finalise every beat on the same model.
4. **Never pay a video model for text, logos, numbers or interface.** Those are the
   page's DOM, or the edit, or code.
5. **Retries are counted.** 3 to 5 takes per beat. No automatic retry loop without
   a cap.
6. **Log every attempt with its cost.** Stills are logged by `fal-image` in
   `runs.jsonl`; log video calls in the same shape. Report **cost per approved
   clip** (total generation cost divided by approved clips), not price per call.
7. **Stills go through `fal-image`**: its one caller, its routing, no silent switch
   to another model.

Consistency:

1. Fixed prompt blocks (character, setting, style, negatives) are byte-identical in
   every call.
2. One reference set for the whole project; at most three references per call.
3. One room. A generation that moves the window is discarded.
4. One seed per beat once the composition is right; then only the motion prompt
   varies.
5. Sharp face in the first and last beats only. Hands carry the rest. Identity
   drift is the largest quality risk.
6. One accent object per frame; the motif once per beat; one gesture per clip.
7. One video model in the final edit, one LUT, one grain.
8. Reject on objective faults: a face that changes within the clip, extra fingers,
   any text, an accent that changes colour.

## 5. Web-integration rules

1. **Muted loop.** `muted loop playsinline`; the file has no audio stream; nothing
   depends on sound.
2. **The poster equals frame 1 and is the LCP candidate.** A real image in the HTML,
   painted in its final place before any script, no fade-in, under 100 KB. The video
   source is attached after load.
3. **A visible pause control when the loop runs over 5 seconds.** That is every
   brand loop.
4. **It never starts under reduced motion.** No `autoplay` attribute that would run
   for those visitors; the poster stands as a finished frame.
5. **No text over the moving part without a scrim that holds 4.5:1**, measured
   against the brightest frame under the text. Prefer the quiet text-side third the
   script reserves (the right third on a right-to-left page).
6. **A size budget per breakpoint.** Wide: 1920x1080, under 8 MB for the full loop.
   Section backgrounds: 960 px wide. Phones: a 720 px encode or the poster alone.
   Starting numbers and their status are in the pipeline reference, section 10; the
   project's contract holds its own.
7. **Loop length on the page.** `asset-pipeline` sends loops over 30 seconds to
   streaming. A 32 to 40 second film either goes on the page as a shorter cut or
   follows that rule. The lock says which.

Verify on the rendered page, not on the markup: the LCP element is the poster, the
video does not start with reduced motion emulated, the pause control works, the
contrast is measured, each file is inside its budget.

## 6. References

- `references/brand-and-client-profile-template.md`: stage 1, section by section.
- `references/concept-and-script-template.md`: stages 2 to 4, with the timing
  logic, shot-design vocabulary, loop logic, end card and edit rules.
- `references/production-pipeline-fal.md`: stages 5 to 9: model roles, fixed prompt
  blocks, character and hand sheets, keyframe and motion prompts per beat,
  negatives, consistency rules, conform, grade, loop, export, markup, QA checklist.
- `references/vocabulary-and-references.md`: the genre's terms, neighbouring
  industries, choosing a craft metaphor, real references, search strings.
- `references/ai-motion-video-production-research.md` (in Hebrew, carried in full): model
  families, prices as recorded, provider routing, code-driven motion versus
  generated video, cost rules, a benchmark plan.

Model names, endpoints and prices in the references are a record from November
2026. Check them against fal.ai before spending.
