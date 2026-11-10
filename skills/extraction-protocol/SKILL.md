---
name: extraction-protocol
description: Converts visual design references (Mobbin MCP screens, screenshots, video frames) into complete machine-readable spec files. MANDATORY in PORT mode, where a source must be reproduced exactly; optional elsewhere. Use when the user says "extract", "analyze this design", "make a spec from this", or pulls screens via Mobbin MCP. Never reproduce a design from a raw screenshot by eye.
---

# Extraction Protocol — Reference → Spec

## Why this exists
A screenshot is flat. Reproducing from it directly forces the model to make
hundreds of silent decisions, and those decisions drift. Extraction converts a
reproduction task into a transcription task: every decision is made once,
explicitly, in a spec file.

## When this runs — read this first
Extraction turns design into transcription. That is exactly right when the job
IS transcription, and exactly wrong when the job is to design something new.

- **PORT — mandatory.** The source is the specification; approximation is the
  failure mode this prevents.
- **REDESIGN — partial.** Run it at PATTERN level on inspiration references.
  Never 1:1 against another product.
- **PAGE / SITE / SYSTEM — optional, and usually skipped.** A reference here is
  a taste anchor, not a thing to reproduce. Extracting it converts a generative
  job into a transcription job and flattens the result. V1 ran extraction on
  everything; that was a central cause of its output being correct and lifeless.

## The Two-Pass System

### PASS 0 — Check for an existing brand (before anything)
If the contract's Tokens block points to an existing `brand/tokens.css` (or
equivalent SSOT): DO NOT extract a design system from the references. Import the
brand tokens into `spec/design-system.json` (same schema,
`meta.source = "brand SSOT"`), and run only PASS 2 — the references feed
STRUCTURE, the brand feeds SKIN. Any reference value that conflicts with a brand
token is recorded in the section spec's `deviations` array, and is legal only if
the contract's Guardrails or Aesthetic block covers it.

### PASS 1 — Design System (once per project, NEW brands only)
Input: ALL reference images at once (full page screenshot or every section).
Output: `spec/design-system.json`

Run this prompt:

```
Analyze these design reference image(s) and extract the complete design system
as JSON. Extract ONLY what is visually verifiable. Rules:

1. Any property not visible or not determinable = null. NEVER invent or assume.
2. Hex colors are best visual estimates — mark the file meta as "estimated".
3. Use semantic token names (canvas, surface, ink, accent-*), not color names.
4. Typography: for each text role (display, heading, body, caption, label...)
   give family classification (e.g. "grotesque sans", "high-contrast serif"),
   weight, size_px, line_height, letter_spacing, case.
5. Derive the spacing scale from repeated gaps/paddings you can measure.
6. Include: color, typography, spacing, radii, borders, shadows, layout
   (max_width, grid, breakpoints if visible), iconography style, motion
   (null unless video/animation was provided).

Output valid JSON only. No commentary.
```

### PASS 2 — Section Specs (once per section)
Input: ONE section image + the already-extracted design-system.json.
Output: `spec/sections/NN-name.json`

Run this prompt:

```
Here is the project design system: [design-system.json]
Analyze this section image and extract a complete section spec as JSON. Rules:

1. Reference design-system tokens BY NAME wherever the value matches a token.
   Only write raw values where the section deviates from the system — and flag
   each deviation in a "deviations" array.
2. Extract the full component anatomy: every element, its structure, exact
   paddings, alignment, and nesting. Name repeated structures as components.
3. Content inventory: every text string VERBATIM. Every image: subject,
   aspect ratio, treatment. Every icon: description.
4. Capture layout logic, not just values: grids, column counts, alignment
   rules, and any PATTERN in how variants rotate or repeat (color rotation,
   alternating layouts, size rhythms). Patterns are what separate 1:1 from
   "almost".
5. States and behavior (hover, scroll, responsive) = null unless shown.
6. Anything not visible = null. NEVER invent.

Output valid JSON only. No commentary.
```

## Sources of references
- **Mobbin MCP** (preferred): search screens/flows directly, then run Pass 1/2
  on the returned images. MCP screens arrive as flat screenshots — extraction
  is still mandatory.
- Uploaded screenshots in `references/source/`.
- Video walkthroughs: extract frames per section first
  (`ffmpeg -i ref.mp4 -vf fps=1 references/source/frame_%03d.png`), and use the
  motion of the video to fill the `motion` fields that static images leave null.

## Model-agnostic note
These two prompts are the asset, not the model. They can be pasted into any
frontier chat model for A/B quality checks — but the default is running them
here in Claude Code, which removes a tool-hop from the pipeline.

## Output conventions
- `spec/design-system.json` — one per project.
- `spec/sections/01-hero.json`, `02-features.json`... — numbered in page order.
- After extraction, list every null field to the Art Director in one compact
  block, so gaps are decided by a human, not improvised by a model.
