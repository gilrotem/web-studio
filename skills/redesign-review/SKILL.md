---
name: redesign-review
description: Stage R of a site redesign, before any design — the live site read as a designer and as a visitor, from its public pages only: what it says, who it speaks to, what works, what fails, and what the new design must keep. Takes the keep-list (the pages that must keep their URL, written outside the design sessions) as an input when it exists, and reads only its list of pages. Use when the contract says Redesign yes and no design/research/redesign-review.md exists, or when the user says "redesign review", "סקירת האתר הקיים", "what does the current site do".
---

# Redesign review — read the live site before redesigning it

A redesign keeps what the live site earned and drops what fails. This stage reads the site the
way the Art Director and the visitor meet it, so the new design starts from what is true about
the old one, not from memory or from the client's description. It is one stage, before stage 1,
and it feeds lock 1 (the bar and the contract); it has no lock of its own.

## What it reads, and what it does not

- **Public pages only**, as any visitor sees them: no admin, no analytics, no Search Console, no
  accounts, no form submissions.
- **The keep-list, when it exists** (the contract's `Keep-list:` line names the file). It is
  written by the SEO side, outside the design sessions, together with the redirect map. This
  stage reads **only its list of pages** (address and title) and reviews those pages first. It
  does not read, write or judge URLs, redirects, rankings or traffic: those are not design work.
  Without a keep-list, review the home page, the pages the main navigation reaches, and one page
  of each template the site has.
- No platform talk: what the site runs on is not a design question.

## Steps

1. **Capture**, at 390 and 1440, every page in scope (`visual-verify`:
   `scripts/verify.mjs shoot <url> --tag <page>`, run from the project root). It records each
   page's identity, contrast, type size, line length and hidden content. Captures go under
   `design/research/redesign/`; keep `run.json`, drop recordings that taught nothing.
2. **Read it as a designer**: the type system and its hierarchy (measured, not guessed), the
   colour roles and where contrast fails, the grid and section rhythm, imagery and its
   treatment, components and their states, motion, the mobile composition. Name the pattern
   behind each finding, not every instance.
3. **Read it as a visitor**: arriving on each page, what it says in the first screen, who it
   speaks to, what it asks the visitor to do and whether the one action is findable, where the
   visitor would hesitate or leave, what earns trust.
4. **Write `design/research/redesign-review.md`** in the shape below. Every claim cites a capture
   or a measured field. Measured and inferred are marked.

## The file

```markdown
# Redesign review — <site> (<date>, public pages only)

Pages reviewed: <n>, from <the keep-list at <path> | the navigation and one page per template>.

## What it says, and to whom
<the site's message in two lines, as a visitor reads it; the audience it actually speaks to>

## What works — keep it
- <finding · capture · why it works>

## What fails — do not carry it over
- <finding · capture · measured value where there is one>

## The visitor's path
<first screen, the one action, where it is found, where the path breaks>

## Pages the new design must carry
| Page | From the keep-list | Its job for the visitor | Note for the architecture |
|---|---|---|---|

## Not settled
- <what only the client or the Art Director can say>
```

## Model and hand-over

The captures are a short defined task (Sonnet); the reading and the file are judgment (Fable),
per the one model rule in the `studio` skill. The file is shown with lock 1; the architecture in
stage 1 reads its last table, and the bar and the concept read "What works" and "What fails".
