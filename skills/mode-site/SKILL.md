---
name: mode-site
description: SITE mode — a multi-page website built from scratch. Use when the contract declares Mode SITE, or when the user says /site, "אתר מלא", "multi-page site". The design language is born by building the heaviest page completely, to the premium bar; every other page inherits it.
---

# SITE — a multi-page site from scratch

**Rigidity: LOW while the language is being born, MEDIUM once it exists.**
**Thinking budget:** HIGH once, when the language is decided and the first
page is built. Standard for every page that inherits it.

Rewritten 2026-09-16. Step 2 previously ran the old specimen-and-options
loop; it now runs the rewritten `mode-page` loop on the heaviest page.

---

## The loop

### 1. Contract, gates, and IA
Fill `spec/contract.md`, pass the gates. Write the information architecture
into `spec/ia.md`: page slug, purpose, primary action, parent. If the source
material (a content tree, a sitemap) already states it, transcribe it; do not
block the build on a document that only restates the tree.

### 2. Birth the language: build the heaviest page completely
Usually home. Run the rewritten **`mode-page` loop, steps 2–8**, on that page:
autonomous reference intake, one language decided by the agent, the complete
page built by the main agent, eight-plus refine passes, the self-gate, one
presentation. That page is the language specimen **and** a finished page.

### 3. Freeze the language
Extract the approved page into `spec/tokens.*` plus a components layer: type
scale, color and surface roles, spacing, section patterns, buttons, cards,
lists, imagery treatment, motion timing. The only point where SITE creates
tokens; afterwards tokens change by decision, not by drift. Record in the
contract which page birthed the language.

### 4. Build the remaining pages by inheritance
Each page composes existing patterns. Something genuinely new is added to the
components layer first, then used. Each page still declares its own signature
element drawn from the shared language, and each page meets the premium bar
on its own; inheritance is not permission to ship a thinner page.

### 5. Cross-page pass
Navigation and active states, footer, transitions, section rhythm, breadcrumb
logic, 404 and empty states. Screenshot every page at 1440 and scan as a set.

### 6. Harden
Per page: responsive at 390 / 768 / 1440, RTL craft, reduced motion, focus
order, metadata, internal linking, image weight. Then the `signature` review
checklist on the set.

---

## What this mode refuses

- Designing page two from scratch, or per-page token drift.
- Presenting specimens, partial pages or "structure first" passes.
- Delegating design or build to subagents.
- A shared language so rigid that every page reads identically.
