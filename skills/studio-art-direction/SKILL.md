---
name: studio-art-direction
description: The concept stage (site lock 3, page lock 1). Shapes the inspiration given at birth into one design direction and writes design/art-direction.md (type incl. Hebrew pairing, OKLCH color, imagery, grid, component personality, voice, banned patterns, the remembered moment). Use when the user says "concept", "direction", "art direction", "כיוון", "קונספט", or when references exist and no art-direction.md does.
---

# Art direction — from references to a contract

Input: the contract, `docs/design/studio-brief.md` (the inspiration the Art Director gave at
birth, if any), `design/references/`, and on a site the locked foundations. Output: one
direction and `design/art-direction.md`. The agent shapes the direction and writes the document;
the Art Director sees it once, with the hero (site lock 3) or the page's first view (page
lock 1), and locks it there.

## 1. The direction (one; a second only when the Art Director asks or the brief genuinely splits)
Half a page, all effort on this one:
- **Concept line**: one sentence that explains every later decision.
- **Scene list**: 5 to 8 scenes (not sections): what each shows, what moves, how it hands over to the next.
- **Type pairing**: Hebrew display + Hebrew text, with the Latin companion. Say why in one line.
- **Palette seed**: 4 to 6 OKLCH values: ground, ink, one accent, one material tone. Dark cinematic or warm paper, not both.
- **Material and atmosphere**: grain, glass, fabric, light; whether WebGL is earned (see `webgl-atmosphere`) or CSS and video carry it.
- **Motion reference**: one clip from `design/references/motion/` and the tempo word (languid, crisp, weighted).
- **The remembered moment**: the one scene people describe afterwards.
- **Risk**: the one thing that could make it generic or slow.
It is not pitched in chat for a go: it goes straight into the document and the hero, and is presented with them at the lock (`studio` skill, "Straight through"). No screens are built for options; parallel directions are not made. WebGL or video enter only if the contract's Opened line names them.

## 2. The art-direction document (`design/art-direction.md`)
Sections, in order, each decided (no "TBD"):
1. Concept and emotional register; what it is deliberately not.
2. Storyboard: scenes in order with purpose, dominant element, motion, hand-over.
3. Typography: families and roles, fluid scale (Utopia clamp values), weights, line-heights, Hebrew rules (no letter-spacing, body 16px+ and 5 to 10% larger than the Latin equivalent, serif for display only and never mixed with sans in one line), numerals.
4. Color: OKLCH tokens, neutrals tinted toward the brand hue (chroma 0.005 to 0.015), one accent per view, surface sequence across the scroll, contrast table.
5. Imagery: shot list for real photography (light, lens, distance, what is never in frame), one grading, crop logic; what may be generated (textures, atmospheres, icon set) and what may not (premises or people as if real).
6. Grid and space: columns, named axes, spacing scale, radius policy, container budget (fewer containers than scenes).
7. Material: grain, glass, shadows, light; the fallback when GPU is weak.
8. Components with personality: nav, footer (the second hero), cursor, preloader, buttons, the primary action, forms. Each with resting, hover, focus, active, loading states.
9. Voice: second person plural, short, specific, no superlatives, no exclamation marks.
10. Banned list for this project (start from the banned patterns below, add the competitor clichés from the audit).
11. The remembered moment, named.
Motion gets its own document (`motion-language` skill), referenced here.

## 3. Banned patterns (never)
Indigo-to-purple gradients; gradient text; Inter or Heebo-as-default with nothing else; glass cards everywhere; dark hero + gradient headline + gradient button; three equal feature cards with soft shadows; thin generic line icons or emoji as icons; "big number + small label" stat rows; tracked all-caps eyebrows; arrows on every link; fade-and-slide on every section; centered everything; uniform 16px radius; stock-looking AI people; weightless copy. Second-order tells now too: cream + terracotta by reflex, mono-everything, bento for its own sake, liquid glass on every card.

## 4. Where richness comes from (in Hebrew especially)
Hebrew has no caps, small caps or condensed heavy display, so typographic contrast is weight and size only. Everything else works harder: imagery with light, material, scale jumps, motion tempo, surface changes, the one WebGL or video scene. A Hebrew page designed as a pure type exercise is flat by construction.

## 5. Gate before the document is final
Answer in writing: which three shipped sites from `design/references/bar/` could this live next to? If the honest answer includes "a template", the direction is not ready.
