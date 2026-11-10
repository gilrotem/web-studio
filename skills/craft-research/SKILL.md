---
name: craft-research
description: The studio's state-of-the-craft research library, carried in full with sources: what award juries reward, the level of professional-services and Israeli sites, the front-end and WordPress execution stack, motion and material, how agent-run design reaches the bar, and Hebrew type, RTL and Israeli law. Use when a skill needs the evidence behind a rule, when a number, version or legal threshold must be checked, when the user says "research", "מחקר", "what is the bar", "מה הרף", "state of the craft", or when the research is old and has to be re-run.
---

# Craft research — the evidence behind the method

The other skills state rules. This one holds the evidence those rules came from, dated, with a
source link on every claim. Read the part you need; never load the whole library.

Current edition: `${CLAUDE_SKILL_DIR}/web-design-craft-bar-2026-11/` (research date 9 November
2026). Its `README.md` says what it is, how it was made and what profile it was run against.

## Which file answers which question

| Question | File |
|---|---|
| What is the bar, in one read? What should the studio pin and gate on? | `report.md` (the synthesis; its "Implications for the studio" section lists version pins, performance and motion gates, accessibility and legal gates, Hebrew and RTL rules, WordPress delivery rules and method rules; "What could not be verified" lists the holes) |
| What do award-tier sites look like, what do juries score, where do professional-services sites top out? | `notes/design_bar.md` |
| Which build stack, which versions, how is a hand-coded WordPress theme delivered, what does shared hosting with LiteSpeed need? | `notes/execution_stack.md` |
| How is motion built now: masked lines, scroll-driven CSS, view transitions, reduced motion as a design, material and texture, WebGL cost? | `notes/motion_material.md` |
| How do practitioners get top-tier design out of coding agents: the design package before code, the screenshot loop, review tooling, what fails? | `notes/ai_design_method.md` |
| Hebrew type (free and commercial), RTL craft, IS 5568 accessibility, the privacy law's Amendment 13, local contact conventions, structured data, the Israeli design bar? | `notes/hebrew_rtl_israel.md` |

Each note is organised by key question; under each: Takeaway, Cited Findings, Inferences, Gaps.
Cite a finding by its file and key question. Say "inference" when the note says inference.

## How to use it

- A stage skill points here for depth. Go to the one file and the one key question; quote the
  finding with its source link into the project file that needs it.
- When a rule in a skill and a finding here disagree, the finding is older than the rule or the
  rule is wrong. Check the date, then check the primary source, then fix whichever is stale.
- Numbers that drift (versions, Baseline status, prices, legal thresholds, award scores) are true
  as of the research date. If the date is more than a few months old and the number matters,
  verify it at the source before relying on it.

## Re-running the research

The research is evidence with a date on it. When it is stale, do not edit the old files: run it
again and add a new dated folder beside the old one.

1. Scope it to the same six questions (the table above), plus anything the last projects showed
   was missing. Keep the target profile explicit at the top of each note.
2. Run it as deep research: one note per question, gathered in parallel, each claim with a
   primary source fetched on the day, each key question with Takeaway, Cited Findings, Inferences
   and Gaps. Mark what could not be verified. Read real sites from their markup when a claim is
   about what sites actually ship.
3. Synthesise one report from the notes, ending with "Implications for the studio" and "What
   could not be verified".
4. Save as `${CLAUDE_SKILL_DIR}/web-design-craft-bar-<yyyy-mm>/` with the same layout and a
   `README.md`. Update "Current edition" above.
5. Walk the implications against the skills that carry pins and gates (`studio` version pins,
   `motion-language`, `hebrew-rtl-israel`, `wp-theme`, `cinematic-build`, `jury`) and update what
   changed, each with the date.

This is a change to the kit, so it happens in the kit's own repository, not from inside a client
project.
