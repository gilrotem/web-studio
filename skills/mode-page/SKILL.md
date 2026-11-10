---
name: mode-page
description: PAGE mode — a landing or marketing page built from scratch. Use when the contract declares Mode PAGE, or when the user says /page, "landing page", "עמוד נחיתה", "marketing page". The generative mode: the agent designs and builds the complete page itself, to the studio's premium bar, and presents it once.
---

# PAGE — a page designed from scratch

**Rigidity: LOW.** This is design work. **Thinking budget: HIGH** at reference
intake, language decision and composition; standard for hardening.

Rewritten 2026-09-16. The previous loop (five parallel directions built by
subagents as hero-plus-one-band specimens, then cuts and variations) produced
partial, sketch-grade output presented as deliverables. The Art Director
rejected it outright. This loop replaces it.

---

## The loop

### 1. Contract and gates
Fill `spec/contract.md`. Check the studio's three gates (`studio` skill) before any code. A
`null` Signature does not block the build; the signature is declared by the
agent from the references and written into the contract when the page is
presented.

### 2. Reference intake — autonomous, never a question to the Art Director
Load `references/source/`. Then run the `mobbin-research` skill yourself:
derive the search angles from the contract (pattern, industry, register,
best-in-class products the agent itself names), pull screens and sections,
and study them for **how imagery is treated, how components are drawn, how
depth and rhythm are built**. Save the ones that set the level into
`references/source/mobbin/`. Do not ask the Art Director to supply sites or
pick from a shortlist unless they offer. The agent decides the level and is
accountable for it.

### 3. Decide the language — one direction
From the references and the contract, decide the typographic system, the
color and surface system, the imagery treatment, the depth model, the
component style and the signature element. Write it in ten lines at the top of
the page file as a comment. Then write the **core** before any section: a
one-page `spec/composition.md` (grid, named axes, spacing, type scale,
container budget, mobile patterns) and provisional tokens, enough that the
hero is not built on sand. No options round.

### 4. Build the complete page: hero first, alone
The hero is built first, on its own, to the end, desktop and mobile in the same
pass as two compositions, message-led with the photograph as a supporting asset
(signature 4a, rule 10), and presented once before any other section exists.
Then hero to footer, every section, in one language, by the main agent, each
section joined to the one before it (signature section 4a). **Never
delegate the build to subagents.** Never present a hero-plus-one-band
specimen, a "structure first" pass, or a partial page. Real strings from the
contract, real imagery generated with `fal-image` (3–4 candidates for the hero,
2–3 for each secondary image), tokens only, no magic numbers. Every section
meets the `signature` premium bar (section 1) as it is built, not later.

### 5. Refine loop — minimum eight passes
Run `visual-verify` in refine mode: render at 1440 and 390, look at the
whole, name the single weakest thing, fix it at the root, render again. Eight
passes minimum for the hero, more if the self-gate fails. Report passes in one
line each in the session log, not to the Art Director.

### 6. The gate
Before presenting: put the render next to the project's level references
(a side-by-side sheet of the render and `references/bar/`)
and run the `signature` review checklist. A written self-assessment does not
pass anything; the builder grading alone passed a wireframe on 2026-09-17. If
the render visibly belongs to a lower league than the references, keep
working. Present once, the rendered page with the sheet, not a description.

### 7. Tweaks bar (optional)
Mount the `tweaks-bar` when the Art Director wants to move type scale, accent,
spacing or motion by eye.

### 8. Harden
Responsive at 390 / 768 / 1440, RTL craft, `prefers-reduced-motion`, focus
states, image weight and LCP, metadata.

### Delivery
The contract's Delivery field decides the output format. When it is
a WordPress theme, the `wp-theme` skill governs the delivery; `landing-pages` holds the
conversion checklist.

---

## What this mode refuses

- Presenting anything below the premium bar, partial, or "structure first".
- Delegating design or build to subagents.
- Asking the Art Director to supply references, or to choose between screen
  variants, mid-build. The one steering point is before the build: the concept
  is pitched in chat and gets a go (owner, 2026-09-18). Image and icon
  candidates are shown for a pick; screens are not.
- Options rounds unless explicitly requested.
- Process talk in the presentation. The page speaks; the notes are in the log.
