---
name: mode-page
description: The page job — one page or one area designed and built from scratch, added to an existing site, in two locks (the concept; the page). Use when the contract's Job is `page`, or when the user says /page, "landing page", "עמוד נחיתה", "marketing page". The agent designs the concept and its first view, then one builder builds the complete page to the studio's premium bar, each presented once after the jury.
---

# The page job — a page designed from scratch

**Rigidity: LOW.** This is design work. **Thinking budget: HIGH** at reference intake, the
language decision and composition; standard for the build once the concept is locked.

Rewritten 2026-09-16 and aligned to the two locks on 2026-11-10. The loop that built five
parallel directions as hero-plus-one-band specimens produced partial, sketch-grade output and
was rejected outright; this loop replaces it. Who does each part is the one model rule in the
`studio` skill.

---

## Stage 1 — the concept (ends on lock 1)

### 1. Contract and gates
The contract was filled at birth (`design/spec/contract.md`): the one action, the audience, the
type budget, the imagery cap, the inspiration if one was given. Nothing is asked again. Check the
studio's three gates (`studio` skill) before any code. A `null` Signature does not block: the
signature is declared from the references and shown with lock 1.

### 2. Reference intake — autonomous
Load `design/references/source/`. Run the `mobbin-research` skill yourself: derive the search
angles from the contract (pattern, industry, register, best-in-class products you name), pull
screens and sections, and study how imagery is treated, how components are drawn, how depth and
rhythm are built. Save the ones that set the level into `design/references/source/mobbin/`. The
agent decides the level and is accountable for it.

### 3. Read the host site, then decide the language — one direction
The page sits beside an existing site. Measure what it must sit beside: its type, colours, spacing
and section rhythm, read from the DOM (`visual-verify` scripts, Chrome DevTools), and the
contrast of what it uses. Then decide the typographic system, the colour and surface system, the
imagery treatment, the depth model, the component style and the signature element: what is
taken from the host site, and where the page departs from it, said in one line each. Write the
**core** before any section: a one-page `design/spec/composition.md` (grid, named axes, spacing,
type scale, container budget, mobile patterns) and provisional tokens (a `system-packs` pack is
a valid start). No options round.

### 4. The first view, alone, to the end
The hero (the page's first view) is built first, on its own, to the end, desktop and mobile in
the same pass as two compositions, message-led with the photograph as a supporting asset
(signature 4a, rule 10). Real strings, real imagery (`fal-image`, under the contract's cap: 3–4
candidates for the hero), tokens only. Run the refine loop privately (`visual-verify`, REFINE),
put the render next to the level references, run the `signature` review checklist.

### 5. The jury, then lock 1
The jury scores the first view (a critic that did not build it). Make its ranked fixes, then
present the concept once: the direction in ten lines and the first view rendered at 390 and
1440. One closing question: "Is the concept locked?", with what it does not cover (the rest of
the page, motion beyond the first view, the form's states).

---

## Stage 2 — the page (ends on lock 2)

### 6. Build the complete page
From the locked concept, one builder builds the page whole, hero to footer, every section in one
language, each joined to the one before it (signature section 4a). It receives the locked
concept and the contract and asks nothing; what the files cannot settle goes to "Not settled".
Never a hero-plus-one-band specimen, a "structure first" pass, or a partial page. Every section
meets the `signature` premium bar as it is built, not later. Real imagery generated with
`fal-image` (2–3 candidates for each secondary image).

### 7. Refine and harden
The refine loop, privately: render at 1440 and 390, name the single weakest thing, fix it at the
root, render again; eight passes for the hero is normal. Then harden: responsive at 390 / 768 /
1440, RTL craft, `prefers-reduced-motion` as a second design, focus states, image weight and LCP,
metadata. `scripts/verify.mjs shoot` (the `visual-verify` skill) measures contrast and type.
Mount the `tweaks-bar` only if the Art Director asked to move values by eye.

### 8. The jury, then lock 2
The jury scores the page; the single weakest thing is fixed until the gate holds or the fix list
says why not. The definition of done is checked line by line. Present once, the rendered page with
the side-by-side sheet against the level references. One closing question: "Is the page
locked?" That lock is the end of the design: adapting the page to where it will run is a separate
job (`studio` skill, "Design ends at the lock").

---

## What this job refuses

- Presenting anything below the premium bar, partial, or "structure first".
- Splitting the page across builders, or a second agent re-checking the builder mid-way.
- Asking the Art Director to supply references, to choose between screen variants, or anything
  birth already asked. Image candidates are chosen by the agent against the imagery spec; the
  Art Director sees the chosen imagery at the lock.
- Options rounds unless explicitly requested.
- Any platform constraint inside the design.
- Process talk in the presentation. The page speaks; the notes are in `design/review/`.
