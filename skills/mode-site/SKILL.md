---
name: mode-site
description: The build loop of the site job — a multi-page site, new or a redesign. The design language is born on the hero (lock 3: the concept with the hero), frozen into tokens, and every page inherits it (lock 4: the full site). Use when the contract's Job is `site`, or when the user says /site, "אתר מלא", "multi-page site".
---

# The site job — the build loop

**Rigidity: LOW while the language is being born, MEDIUM once it exists.**
**Thinking budget:** HIGH once, when the language is decided and the hero is built. Standard for
every page that inherits it.

The site job's stages and its four locks are in the `studio` skill. This skill is the build loop
of stages 3 and 4; who does each part is the one model rule there.

---

## Stage 3 — the concept with the hero (ends on lock 3)

### 1. Inputs, all locked
The contract, the bar, the architecture (`design/spec/ia.md`) from lock 1; the foundations
(`tokens.css` or `pack.json`, `design-system.md`, `composition.md`) from lock 2. If an input is
not locked, stop and say which.

### 2. The concept
`studio-art-direction` shapes one direction from the inspiration given at birth and the
references: the concept sentence, the storyboard, the imagery, the remembered moment, the voice.
`motion-language` writes the motion spec. Nothing is pitched for a go: the concept is shown with
the hero.

### 3. The hero, alone, to the end
Run the `mode-page` stage 1 steps 2 and 4 on the hero: autonomous reference intake, the hero
built alone, desktop and mobile as two compositions, real imagery under the cap, motion included,
the refine loop run privately. The hero is the language specimen **and** a finished piece.

### 4. The jury, then lock 3
The jury scores the hero (a critic that did not build it); its ranked fixes are made. Present
once: the concept document in short and the hero rendered at 390 and 1440, with a motion
recording. One closing question: "Is the concept with the hero locked?"

---

## Stage 4 — the full site (ends on lock 4)

### 5. Freeze the language
Extract the locked hero into the components layer: section patterns, buttons, cards, lists,
imagery treatment, motion timing, on top of the locked tokens. Afterwards tokens change by
decision, not by drift. Record in the contract that the hero birthed the language.

### 6. Build the remaining pages by inheritance
Each page composes existing patterns; something genuinely new is added to the components layer
first, then used. One builder builds a page whole; pages may go to separate builders, each with
the locked specification, never one page split across two. Each page declares its own signature
element drawn from the shared language and meets the premium bar on its own; inheritance is not
permission to ship a thinner page. Content pages are poured from the content map verbatim.

### 7. Cross-page pass and hardening
Navigation and active states, footer, transitions, section rhythm, 404 and empty states. Per
page: responsive at 390 / 768 / 1440, RTL craft, reduced motion, focus order, metadata, internal
linking, image weight. `scripts/verify.mjs shoot` (the `visual-verify` skill) on every page.

### 8. The jury, then lock 4
Measurements (`visual-review`), the jury on the whole site, the single weakest thing fixed until
the gate holds, the definition of done line by line. Present once. One closing question: "Is the
full site locked?" That lock ends the design; adaptation to where it will run is a separate job.

---

## What this job refuses

- Designing page two from scratch, or per-page token drift.
- Presenting specimens, partial pages or "structure first" passes.
- Splitting one page across builders, or re-checking a builder mid-way between locks.
- A shared language so rigid that every page reads identically.
- Any platform constraint inside the design.
