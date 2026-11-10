---
name: site-architecture
description: The site architecture stage. Decides structure only: which pages exist, how they connect, how the content pages group, what sits in the header and what only in the footer, which blocks repeat and where, what each page template holds and in what order, the URL slugs and the title pattern, and writes design/spec/ia.md with one rendered sitemap sheet for one lock. Use when the user says "architecture", "IA", "sitemap", "navigation", "page templates", "slugs", "ארכיטקטורה", "מבנה האתר", "תפריט", "מפת אתר", or when the content map is the baseline and Stage 1 is locked.
---

# Site architecture — structure before any aesthetics

Input: the content map (`docs/content/map/`, one file per page; its area names are reused here
verbatim), the contract (`design/spec/contract.md`), the client's spec, and the audit's "what
the visitor expects to find". Output: `design/spec/ia.md` and one sitemap sheet, locked by the
Art Director.

This document decides structure only. No colour, type, layout or copy: those are the later
stages. Menu labels are not written here; the page names from the map stand in for them until
the labels are written.

If the source material already states the architecture (a content tree, a short sitemap),
transcribe it and move on; do not block the build on a document that only restates the tree.
On a site with a dozen or more content pages, the grouping, the recurring blocks and the
template order are real decisions and get this stage.

## The document (`design/spec/ia.md`), section by section

A filled skeleton is in `${CLAUDE_SKILL_DIR}/references/ia-template.md`.

**Header.** Which session wrote it, the sheet it was presented on, its status and the lock. The
inputs. The rulings that bind the page, quoted verbatim with their ids and labels. One paragraph
saying what the page decides and what it does not.

**1. The page list.** A table: number, page, map file, template. Every page maps to a map file
and to a template. Then "Not pages": what was considered and is deliberately absent (no blog, no
gallery, no second language) with the ruling or reason for each. A page that exists only to give
a navigation item a landing place, or a group of pages a parent URL, says so.

**2. Navigation.**
- *Header*, in reading order: the logo line, the items, the action. Few items and one action.
  A table: position, item, target. What collapses on mobile and what stays visible (the action
  stays visible at every width). At most one floating element on the site, and only on mobile;
  the pile of floating buttons common in most categories is refused.
- *Grouping of the content pages.* Group by the reader's situation, not by the provider's
  method. Within a group, the most common case first. Say why this grouping and not the first
  draft (group sizes, which cases lead). The group names here are working names. **One order
  everywhere** the list appears: header menu, index page, home grid, footer.
- *Footer.* Columns and content, each mapped to its map area. What appears only in the footer
  (legal pages, the address, the hours). The accessibility statement is reachable from every
  page.

**3. Recurring blocks.** A table: block, map area, where it repeats, position on the page. Each
block is one partial in the build with one source of truth for its text. For each: on which
templates it appears, on which it does not and why, and whether it has a full and a compact
form (a block that repeats on long pages needs a compact form, or a long article ends with a
second article). Then the action's placement against the contract: where the primary channel is
the control, where the secondary channels appear, where forms appear and that the privacy notice
sits beside every submit control. One phone number, one source, site-wide.

**4. Template types.** One sub-section per template (home, the long-form content page, an index
page, about, contact, legal, 404). For each: the areas in order, top to bottom, named as in the
map files, then the **order rationale** in two or three sentences: what the reader sees, then
finds, then meets, then is shown, then does. Note where a template reverses another's order and
why (on a content page whose text ends on a question to the reader, the action follows the text
directly and the process block closes the page; on the home page the order is the reverse).
Template features that depend on length (a table of contents) name the pages they are for. The
contact page has no lead band: the page is the action. Legal pages and the 404 are furniture: no
selling blocks. The 404 still lands the reader somewhere useful.

**5. Slugs and titles.**
- The slug alphabet is a question for the Art Director, asked once as a closed question with a
  recommendation. The default recommendation is Latin: a non-Latin slug pasted into a messaging
  app or an email becomes a long percent-encoded string that breaks across lines; Latin slugs
  stay short, readable and copyable; search engines rank both alphabets alike for the
  local-language query, and the title and H1 carry the keywords; the redirect table at a domain
  move is cleaner in ASCII.
- Structure: content pages under one parent path; the rest at the root; one trailing-slash rule;
  no date, category or id in any URL.
- The slug table. A content page's slug is its map file's name without the number prefix, so a
  page, its map file and its URL carry one name.
- The title pattern per template, with the length rule (keep `<title>` under about 60
  characters; a subtitle after a dash stays in the H1 and out of the `<title>`). The brand name
  as the contract states it.

**Not settled.** What later stages decide (labels, the form of the compact block, whether a
feature shows on short pages), and what waits for the client.

## The sheet

One rendered sitemap at desktop width, built as HTML and captured to
`design/review/<date>-ia/sitemap.png`: the pages as a tree with their groups, the header and the
footer as they will be populated, the recurring blocks as a matrix of block by template, and the
template orders as columns. It uses the real page names. It is a diagram, so it is the one sheet
in the studio that is allowed to be schematic; it still has to be clean, set in a real typeface
and readable at a glance.

Present it once. Ask the slug question before the closing question, in the same session, then:
"Is the architecture locked?" Quote the lock into `DECISIONS.md`; the entry's "Means" restates
the structure in one paragraph (page count, header items and the action, the groups and their
order, where each recurring block appears, the templates, the slug alphabet and the title
pattern), because later sessions read the decision, not the sheet.

## Rules

- Area names come from the map and are never renamed here.
- Every claim about what the client wants is a quote from the client's spec or a ruling.
- Nothing the audit lists as a category cliché enters the structure by default (carousels for
  testimonials, an icon grid as the whole architecture, several phone numbers).
- A page with pending text still exists in the structure and is built from its title and the
  shared blocks.
- Reopen conditions are real: a pending text that does not fit its template, or a skeleton
  decision in Stage 2 that needs a different block order.
