# Video: index

What the kit holds on brand video, and where a project files its own.

## In the kit

| File | What it is | Language |
|---|---|---|
| `skills/video-production/SKILL.md` | The skill: when a site earns a video, the nine stages in order, what each produces and where it is filed, the gate with the Art Director, the money and consistency rules, the web-integration rules | English |
| `skills/video-production/references/brand-and-client-profile-template.md` | Stage 1. A fill-in template for the client profile: identity, services in tiers and the through-line, positioning, audiences, tone of voice, visual identity, current site structure, gaps, conversion labels | English |
| `skills/video-production/references/concept-and-script-template.md` | Stages 2 to 4. A fill-in template for the concept and the script: format and constraints, the concept, the metaphor table, the visual motif, the character bible, setting and palette, the beat-by-beat script with a shot-design vocabulary, loop return, end card, edit rules, deliverables, what to avoid, and the pitch | English |
| `skills/video-production/references/production-pipeline-fal.md` | Stages 5 to 9. Model roles on fal.ai, fixed prompt blocks, character and hand sheets, keyframe and image-to-video prompt patterns per beat with a labelled example, negative prompts, consistency rules, conform, grade, loop, export commands, page markup, size budgets, QA checklist | English |
| `skills/video-production/references/vocabulary-and-references.md` | The web-motion genre's terminology, neighbouring industries to borrow from, how to choose a craft metaphor for a professional-services brand, real references, where to look, ready search strings | English, with a few examples of on-screen Hebrew |
| `skills/video-production/references/ai-motion-video-production-research.md` | Research on an AI motion-video production system: the terms of the field, model families, quality rankings and per-clip prices as recorded, API providers and routing, code-driven motion tools, which technology fits which kind of clip, a seven-layer architecture, a ten-step working method, ten cost rules, a benchmark plan, risks | Hebrew |

## How they fit together

The skill gives the order and the rules. The two templates are filled first and cost
nothing. The pipeline is used only after the Art Director's written lock on the
concept. The vocabulary file is for the reference hunt before the concept. The
research document is the wider background: which model family for which job, what
generation costs, and when not to use generated video at all.

The research document and the pipeline's model table were recorded at different
moments and name different generations of the same model families. Neither is proof
of what is current. Model names, endpoints and prices are as recorded in November
2026; verify against fal.ai before spending.

## In a project

| File or folder | Written from |
|---|---|
| `docs/video/00-README.md` | The pack's index and a short fact block (described at the top of the profile template) |
| `docs/video/01-brand-and-client-profile.md` | `brand-and-client-profile-template.md` |
| `docs/video/02-site-content-extraction.md` | Verbatim text of the client's current site, when one exists |
| `docs/video/03-brand-video-concept-and-script.md` | `concept-and-script-template.md` |
| `docs/video/04-production-pipeline.md` | `production-pipeline-fal.md`, with every slot filled |
| `docs/video/05-concept-vocabulary-and-references.md` | The project's own notes from `vocabulary-and-references.md` |
| `design/assets/video/` | Everything generated: `character/`, `hands/`, `keyframes/beat-<n>/`, `clips/beat-<n>/`, `master/`, and the run log |
