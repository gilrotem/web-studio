---
name: studio-research
description: Stage 1 of a site. Writes the brief, audits competitors, hunts references across Awwwards, Siteinspire, Minimal Gallery, httpster, recent.design, Savee, Fonts In Use and Mobbin, and files them under design/references with a reason each. Use when starting a site, when the user says "brief", "research", "references", "inspiration", "השראה", or before any art direction exists.
---

# Studio research — brief, audit, reference hunt

Output of this skill: `design/brief.md`, `design/references/{bar,moodboard,motion}/README.md`,
and a short feasibility note. Nothing visual is designed here. Never ask the Art Director to supply sites.

## 1. Brief (`design/brief.md`)
Fill, in English, one page:
- Business and the one-sentence promise (what the visitor should feel, then do).
- Audience, their moment of need, device reality.
- The one primary action and the secondary one.
- Tone: 3 to 5 adjectives, each with "but not ..." ("warm but not cute").
- Mandatory content, real strings in Hebrew, verbatim. No lorem.
- Constraints: language and direction, performance budget (LCP 2.5 s, INP 200 ms, CLS 0.1 at p75; JS under 150 KB gz), accessibility floor (WCAG 2.2 AA, IS 5568 statement), hosting, deadline.
- Anti-references: 2 to 3 things it must not look like.

## 2. Competitor and category audit
Open 8 to 10 local competitor sites in the browser pane. Record in `design/research/audit-<slug>.md`: what every one of them does, so the design can refuse it deliberately. Tag them STRUCTURE only. They never set the level.

## 3. The level, in numbers (Awwwards, Nov 2026)
Site of the Day sits at a jury overall of 7.2 to 7.7 (Design 40, Usability 30, Creativity 20, Content 10); Honorable Mention from 6.5; the Developer Award needs over 7 in all six areas (Semantics/SEO, Animations/Transitions, Accessibility, WPO, Responsive, Markup). On 2026 winners Animations/Transitions is always the top sub-score and Accessibility the lowest (6.6–7.0): a site that scores both is above the field. Our gate: 7.0 overall and 6 on every axis (`jury`).

## 4. Reference hunt, in this order
Use the built-in browser (`get_page_text`, screenshots) and WebSearch.
1. **Level** (taste, 5 to 8 sites): Awwwards (SOTD and SOTM, filter by tag, colour, country), Siteinspire, Minimal Gallery, httpster, recent.design (where Godly now redirects). Each goes in `design/references/bar/` as a screenshot plus a line: what it does that we must match (type scale, scroll tempo, material, transition logic). A reference enters the work as that written line, never as a raw image.
2. **Technique** (how an effect is built): Codrops demos (tympanus.net/codrops/demos), GSAP showcase and Demo Hub, Three.js examples. Link each to the effect it unlocks and a feasibility verdict: trivial / a day / needs WebGL / skip.
3. **Mood** (atmosphere, texture, photography, colour): Savee, Cosmos, Are.na, Behance case studies. 10 to 20 stills into `design/references/moodboard/` with one line each.
4. **Motion** (feel): award sites screen-recorded with the Playwright video script in `visual-review`, Vimeo Staff Picks, Rive and Jitter showcases. 3 to 5 clips or links with timestamps into `design/references/motion/README.md`.
5. **Type**: Fonts In Use for what the level sites set (2026 pattern: a serif with character for display, a neutral grotesk for text); the Hebrew bench in `hebrew-rtl-israel`. List 3 pairings.
6. **UX patterns only**: Mobbin MCP (`search_screens`, `search_sections`, `search_flows`) for booking, pricing, contact and form patterns. Decompose each pull into layout, spacing, components and states before it is used. Never for art direction.

## 5. Feasibility note
One paragraph per candidate signature effect: what it is, the technique reference, the cost on a mid-range phone, the fallback. This feeds the direction in `studio-art-direction`.

## Rules
- Every saved reference has a reason. A folder of screenshots without reasons is not research.
- Keep research under 90 minutes of work. Breadth is not the deliverable; a decided level is.
- Depth on the current state of the craft: the `craft-research` skill (the full report and its five notes).
- How the level and the audit are captured and presented, and what a Stage 1 lock covers: the `studio` skill, "Stage 1".
