---
name: content-map
description: Maps every text a site will carry, page by page, from the client's own files, before site architecture and before any design. Builds the content library (read-only source copies, plain-text extraction, intake index), the map files with one of four markers per area (have, ask, write, legacy), the gaps table, the single-document view, and drafts the one message to the client that closes the gaps. Use at the start of a site specification, when the client's texts arrive or arrive again, when answers from the client must be filed, when the user says "content map", "content", "what is missing", "מפת תוכן", "תכנים", "טקסטים", "מה חסר", "השלמות מהלקוח", or before any page is designed around text nobody checked against the client's files.
---

# Content map — every text, page by page, before anything is designed

Output of this skill: a content library under `docs/content/`, a map with one file per page, a
gaps table, one document the Art Director can read top to bottom, and one drafted message to
the client. Nothing here is designed and nothing is rewritten. Scripts live in
`${CLAUDE_SKILL_DIR}/scripts/`, templates in `${CLAUDE_SKILL_DIR}/references/`.

## 1. Where it sits and why

First step of a site specification. It runs before site architecture and before any design,
because both need to know what the site actually has to say:

- Architecture decides pages, order and blocks. It can only do that over a full list of what
  exists, what is missing, and who supplies each missing piece.
- Design is drawn around real strings. A hero designed for an invented line breaks when the
  real line arrives.
- The client is asked once. Everything only they can supply goes out in one message, early,
  while the rest of the work runs.

The stage ends on a gate: the Art Director's written yes to the map as the content baseline, given with lock 1 (the bar and the contract).

## 2. The content library

```
docs/content/
  source/            copies of the client's files, original names. Read-only. New deliveries are added, nothing is edited or renamed.
  text/              plain-text extraction of every .docx, one .md per file. Rebuilt by script, never hand-edited.
  INDEX.md           the library index: where the files came from, what each is, word counts, what each lacks.
  previous-site/     only when the client has an earlier site: the capture and its verbatim extraction.
  content-map.json   the config the scripts read: page list, marker vocabulary, labels.
  map/               the content map: one file per page, plus INDEX.md (the map index and the gaps table).
  CONTENT.md         the whole site's content as one document, built from the map.
  GAPS.md            the short "what is missing" page for the Art Director.
```

One home per thing: a text lives in its map area, a number lives in `INDEX.md` or the map
index, the client's originals live in `source/`. `CONTENT.md` and both indexes are built
views; edit the map files, then rebuild.

## 3. Intake

1. **Copy.** Copy the client's folder into `docs/content/source/` with the original file
   names. Do not touch the folder it came from. Write in `INDEX.md` where it came from, the
   date and the file count.
2. **Extract.** `python -I "${CLAUDE_SKILL_DIR}/scripts/docx_to_text.py" --root .` writes
   `text/<same name>.md` for every `.docx` and prints a table. It works before a config exists.
3. **Read the table.** It carries the intake checks:
   - **Word count per file** (whitespace tokens of the extracted text, without the list and
     heading marks). Take counts from this table only. A shell word count can read Hebrew as
     zero words, and a count made by another method will not match later checks.
   - **Headings.** Client files often carry no Word heading styles: headings are plain bold
     paragraphs. The script marks a heading (`### `) when a paragraph has a heading style, when
     every text run in it is bold and it does not end in a full stop, or when it follows a
     divider line. The table says how many headings came from each cause and how many files
     use real heading styles. When none do, say so in `INDEX.md`: the page outline is the
     studio's reading of the text, not something the files carry.
   - **Duplicate or wrong file.** The script hashes the extracted text. Two files with
     different names and the same hash mean one of them holds the wrong text (a typical
     accident: the client saved one text under two page names). File bytes can differ while
     the text is identical, so compare the text hash, never the bytes. The page whose text is
     missing becomes an "ask"; the wrong text is not copied into its map file.
   - **Flags.** Files with no text, unreadable files, zero-width characters removed.
4. **Read every text once** and note, per file, what a page built from it would still lack:
   no contact channel behind a call to action, credentials claimed but never stated ("many
   years of experience" with no number), an offer or promise that needs the client's yes
   before it goes live, a text far shorter or longer than its siblings.
5. **List the rest.** Images, logo files, PDFs: what each is, pixel size, files that are
   byte-identical copies of each other, and for every photo of a person whether the client
   approved it for the site.
6. **Write `docs/content/INDEX.md`** from `references/content-index-template.md`. It ends with
   "Missing across the whole library": contact facts, credentials, proof, pages with no text,
   images, legal pages.

**A second delivery of the same material.**
`python -I "${CLAUDE_SKILL_DIR}/scripts/docx_to_text.py" --root . --compare "<new folder>"`
writes nothing and says per file: same text, text differs, or new. Copy only what is new or
changed, and log the delivery in `INDEX.md`.

## 4. A previous site, when there is one

If the client has an earlier site (live, unfinished, or one they dislike), capture it as
evidence in `docs/content/previous-site/`:

- The capture: full-page screenshots or saved pages, as received or as taken, with the date.
- `extraction.md`: every visible string, page by page, transcribed verbatim. Mark what a
  screenshot cuts off as `[cut]` and what cannot be read for sure as `[uncertain]`. Check at
  least two captures against the extraction by hand and write which ones.
- `README.md`: who captured it and when, what the site is and what happens to it, the result
  of the hand check, the facts it adds that the client's files lack, and how to read it.

How to read it: it is evidence of the client's own earlier words, not a design reference, and
its section structure is not reused. A string is taken from it only where the client's files
lack it, word for word, and the area gets the "legacy" marker so the client confirms it. A
fact known only from it (a phone number, an address) also gets an `Unconfirmed:` line. A
string in the wrong language for the new site, or an empty claim, is not carried: the area is
marked "write" and the `Missing:` line says why the old string was refused. The same goes for
text the studio can fetch itself from a place the client already published it (a public
review profile): fetch it, keep the capture here, mark it "legacy".

## 5. The config

Copy `scripts/content-map.example.json` to `docs/content/content-map.json` and fill it:

- `pages`: one entry per map file, in reading order: `number`, `slug` (the file is
  `<number>-<slug>.md`), `title` (the page's name as the reader knows it), `source` (the stem
  of its file in `text/`, a list of stems, or `null`), optional `group` (pages that share one
  are printed under one heading in `CONTENT.md`). Number in bands so pages can be added:
  `00` global, `01`-`09` the fixed pages, `10` and up the repeating kind (services, projects).
- `markers`: `"he"`, `"en"`, or an object with four words of your own.
- `confirm_phrases` (optional): wordings in the client's texts that promise something.
- `area_labels`, `labels_file`, `doc` (optional): how `CONTENT.md` names things (section 11).

All paths are relative to the project root and must stay under `docs/content/`. The scripts
refuse anything else.

## 6. The map file format, exactly

One file per page in `docs/content/map/`. Blank template: `references/map-page-template.md`.

```
# <page title>

Source: <the file or files the text was cut from>

---

## <area name> · <marker>

<the raw text, one paragraph per line, a blank line between paragraphs>

### <a sub-heading of the client's own>

- <a list item of the client's own>

---

## <area name> · <marker>

Missing: <what exactly is missing>
```

- Line 1 is `# ` and the page title. A `Source:` line follows. Everything before the first
  `---` is the file's header.
- A line that is exactly `---` separates areas. It is used for nothing else in a map file.
- Every area opens with `## <area name> · <marker>`. The separator is space, middle dot
  (U+00B7), space. The marker is the last part; the name before it may contain middle dots
  of its own (`Footer · contact block · <marker>`). Names are unique within a file.
- Area names are English and describe the job of the text, not its look: `Hero · headline`,
  `Opening`, `Closing CTA`, `Form · success and error states`.
- The body is the client's text as it is: one paragraph per line, `### ` for the client's
  own sub-headings, `- ` for list items. Nothing is retyped: cut it from `text/` or from the
  previous-site extraction.
- Remark lines belong to the map, not to the site. They start with `Missing:`,
  `Unconfirmed:`, `Draft:` or `Note:`, are written in English, and run to the next blank
  line. The scripts keep them out of `CONTENT.md`.

A short example (a made-up accounting office, Hebrew vocabulary):

```
# הנהלת חשבונות לעסקים קטנים

Source: `docs/content/text/הנהלת חשבונות.md`

---

## Page title · יש

הנהלת חשבונות לעסקים קטנים

---

## Opening · יש

### סדר בספרים, שקט בראש

אנחנו מלווים עסקים קטנים בניהול הספרים השוטף.

---

## Customer quotes · לבקש

Missing: two or three customer quotes with a name and a business each. Not in any file.

---

## Form · success and error states · לכתוב

Missing: the success message, the error message and the field validation messages.

---

## Lead band (global) · אתר ישן

→ `00-global.md`, area "Lead band"
```

## 7. The four markers

Every area carries exactly one.

| Role | Hebrew word | English word | Meaning | What the area holds |
|---|---|---|---|---|
| have | `יש` | `have` | The client's text exists | The text, verbatim |
| ask | `לבקש` | `ask` | Only the client can supply it | A `Missing:` line |
| write | `לכתוב` | `write` | The studio drafts it, for approval | A `Missing:` line; later the draft and a `Draft:` line |
| legacy | `אתר ישן` | `legacy` | From the client's previous site, verbatim, only where the client's files lack it; the client confirms it | The text, verbatim |

The Hebrew words are the default vocabulary for Hebrew projects (`"markers": "he"`). Use the
English set for other languages (`"markers": "en"`), or give four words of your own. One
vocabulary per project: the scripts read the config's set and report a heading that uses
another.

Choosing: a fact about the business, a text in the client's own voice, a photo of a real
person, a testimonial, a price, a promise: never "write". Navigation labels, button labels,
section titles, form states, a 404 page, legal pages from a template, the hero line: "write".
If in doubt it is "ask": a wrong "write" puts invented words in the client's mouth.

## 8. Pointer areas for global blocks

Blocks that repeat across pages (header, footer, a lead band, a process block) live once, in
`00-global.md`. A page that shows such a block gets a pointer area instead of a copy:

```
## Lead band (global) · אתר ישן

→ `00-global.md`, area "Lead band"
```

The name ends in `(global)`, the body is that one line, and the pointer carries the marker of
the block it points to. Pointers are counted apart in the totals and never appear in the gaps
table or in `CONTENT.md`. When the block's marker changes, its pointers change with it; the
index script reports a pointer that disagrees with its block or leads nowhere.

## 9. The `Missing:` line and the other remarks

- `Missing:` is required in every "ask" and "write" area. One line, exact: what is missing,
  where it would come from, and why what exists is not used. "Missing: the email address (it
  also receives the form). Not in any file." A "have" or "legacy" area never has one.
- `Unconfirmed:` marks a fact inside an area that is known from one weak source only.
- `Draft:` marks a "write" area that now holds the studio's draft, with the date. The marker
  stays "write" until the draft is approved.
- `Note:` is anything else the next reader needs: where a text was found, why an area exists.

## 10. Building the map

Work in this order. Each step closes on evidence, not on a feeling.

1. **Pages that have a file of their own** (one service, one text file). Cut the text into
   areas: `Page title`, `Opening`, `Body`, a `Process (work steps)` area where the text has
   one, `Closing CTA`, then the pointers. Cuts that have worked: the opening runs from after
   the title to the first heading after the sub-title; the closing starts at the last heading
   that asks a question near the end; a process area runs from a heading that names the work
   process to the next heading. A numbered method inside the text is not the work process and
   stays in the body. For long texts cut with a throwaway script in the scratchpad that
   slices `text/<file>.md` at paragraph numbers. Do not retype and do not paste through a
   model's memory. Done when the verbatim check says `ok` for every such page.
2. **The global file** (`00-global.md`). List every area a site of this kind carries and mark
   each: header (logo line, navigation, action button), floating contact button, lead band,
   process block, footer (page links, contact block, legal links and copyright line), privacy
   policy, accessibility statement and its contact person, 404 page. Done when every global
   area is listed with a marker.
3. **Pages with no file of their own** (home, about, contact). Write the skeleton: every area
   the page may need, with the raw text where it exists and a marker where it does not. Home:
   hero headline, sub-line and button, positioning, the office or founder block, services
   grid, testimonials, pointers. Contact: heading and intro, each contact fact as its own
   area (phone, email, address, hours), form labels, the privacy notice at the form, success
   and error states. Whether an area survives is decided in the judgement pass, not here.
4. **A page whose file is the wrong text.** Title from the file name ("have"), the whole body
   one "ask" area that says which file holds what, `source: null` in the config.
5. **Index.** `python -I "${CLAUDE_SKILL_DIR}/scripts/build_map_index.py" --root .` writes
   `map/INDEX.md`. Fix every line under "Problems" and rebuild until it is gone. `--check`
   reports without writing; `--strict` exits 2 while problems remain.

What the index holds: the page list with area counts per marker; totals with and without
pointers; the gaps table; what waits for the client's confirmation (every "legacy" area,
every `Unconfirmed:` line, every `confirm_phrases` hit); the verbatim check.

**The gaps table** has one row for every "ask" and "write" area: number, page, area, marker,
and the area's `Missing:` line. It is the full list and the only list: nothing marked in a
page file is absent from it, and nothing is in it that is not marked in a page file. It is
rebuilt on every run, so a closed gap leaves the table; record the closing under `## Notes`.

**The verbatim check** compares, for every page that names a `source`, the paragraphs of the
text file with the paragraphs in the page's areas: each source paragraph must appear once, in
the source's order. It reports words and paragraphs, source against found.

**Hand-written sections survive.** Everything from the first `## Spot-checks` or `## Notes`
heading to the end of `map/INDEX.md` is kept on every rebuild. Write nothing by hand above
that line.

## 11. The single document and the short page

`python -I "${CLAUDE_SKILL_DIR}/scripts/build_content_doc.py" --root .` writes
`docs/content/CONTENT.md`: every page in order, every area with its text, and a plain
"missing" line wherever a text or a fact is missing, saying who supplies it. A two-table
summary opens it: needed from the client, to be written by the studio. It is the version a
person reads; with the Art Director's yes it can be shown to the client.

It is written in the site's language, so give it the words:

- `area_labels` in the config (or `areas` in a labels file) turn the English area names into
  headings the reader knows.
- `missing` in the labels file gives a reader's wording for a `Missing:` line, per page file
  and area. Without one, the map's English line is printed as it is.
- `doc` in the config holds the document's own strings: title, intro, the two "missing"
  leads, the summary headings. The defaults are English.

`docs/content/GAPS.md` is hand-written, in the Art Director's language, one screen long: per
page, one line of what exists and a list of what is missing, each with who supplies it. It is
written after the judgement pass and updated whenever answers are filed.

## 12. Spot-checks

The script proves every paragraph is present and in order. It cannot see a bad cut. Read
three built files against their text files by hand: the shortest, the longest, and one with a
process area or an odd structure. Check where each area starts and ends and that every `###`
is a real heading. Record under `## Spot-checks` in `map/INDEX.md`: the file, what was read,
words and paragraphs source against built, the result. Write which files were not read by
hand.

## 13. The judgement pass and its gate

The skeletons mark by rule. The judgement pass reads the whole map and decides:

1. **Is each "ask" really the client's?** If the studio can get it without the client (it is
   already in another file, or published by the client somewhere public), it is not an ask.
2. **Is each "write" really the studio's?** Facts, credentials, prices, promises and
   testimonials are never written. Move them to "ask".
3. **Does the library already hold it?** Search `text/` before a "write" stays open. A
   closing line in a profile text can be the pull quote. Then the area becomes "have", with a
   `Note:` saying where the line came from.
4. **Is each "legacy" string worth carrying?** Only what the files lack, and only real
   content. An empty claim is dropped and the area becomes "write".
5. **Which areas does the home page need at all?** The skeleton lists candidates. Remove the
   ones with neither text nor reason. Leave layout and order to architecture, and say so in
   a `Note:` where an area's existence is still open.
6. **Offers and claims in the client's own texts** are not edited. List their wording in
   `confirm_phrases` so they reach the confirmation list.

Write each call as one line with its reason under `## Notes` in `map/INDEX.md`, edit the
markers in the page files, rebuild the index and `CONTENT.md`, and write `GAPS.md`.

**Gate.** Present the map to the Art Director: the totals, the gaps table, the calls made.
The Art Director's written yes to the map as the content baseline is given with lock 1 (the bar and the contract). Quote
that yes where the project keeps its decisions. Silence is not a yes. Until it is given,
architecture does not build on the map and nothing goes to the client.

## 14. The one message to the client

One message, not a drip of questions. Build it from the gaps table after the gate:

- Every "ask" row, in the client's language and in plain words. No marker words, no file
  names, no area names.
- The confirmation list: facts known only from the previous site, offers and promises found
  in their texts. Each is a yes or no.
- A wrong or duplicated file is named precisely: which file name holds which text, and which
  text is needed.
- One closing line saying which short texts the studio will write and send for approval. No
  "write" row is asked of the client.
- Numbered, grouped (details, texts and files, to confirm), each item answerable in one line.

Start from `references/client-gaps-message-template.md`. Save the draft as
`docs/content/client-message-<date>.md`. The Art Director approves the text and sends it
himself, through his own channel. The agent never sends it and never contacts the client.
Record the date it was sent under `## Notes`.

## 15. Filing the answers

Each answer gets a home, and the map says so.

1. Save the answer as it came: the client's message verbatim in
   `docs/content/source/answers/<date>.md`, files under their original names in `source/`.
2. For each answer, put the text in its area word for word, change the marker from "ask" to
   "have" and delete the `Missing:` line. A suspected typo is not fixed: leave it and add a
   `Note:`.
3. A confirmation turns "legacy" into "have" and removes the `Unconfirmed:` line. A refusal
   removes the old text; the area becomes "ask" or "write" with a `Missing:` line that says
   the client refused it.
4. A fact that shows in several areas (a phone number in the footer and on the contact page)
   is filed in every one of them in the same pass. Pointers follow their block.
5. A new `.docx`: copy it to `source/`, run `docx_to_text.py`, read the duplicates list
   again, name it as the page's `source` in the config, cut it into areas.
6. A partial answer keeps its row: rewrite the `Missing:` line to what is still missing.
7. Rebuild the map index and `CONTENT.md`; update `docs/content/INDEX.md` and `GAPS.md`.

Done when each answer has a home, the page files and both indexes agree, and the index has no
"Problems" section.

## 16. Drafting the "write" items

Two groups, at two different times.

| Group | What | When | Approval |
|---|---|---|---|
| Creative copy | Hero headline and sub-line, section titles, intro lines, a pull quote the library does not hold | After the design direction is locked: the direction decides the voice | The Art Director, then the client through the Art Director |
| Microcopy and legal | Navigation, footer and button labels, form labels and states (success, error, validation), 404 page, the privacy notice at the form, privacy policy, accessibility statement | Any time after the map is the baseline | The Art Director |

- A draft goes into its map area under the same heading. The marker stays "write", the
  `Missing:` line is replaced by `Draft: <date>`. On approval the marker becomes "have" and
  the `Draft:` line goes.
- Options are shown to the Art Director outside the map. Only the chosen line enters it.
- Legal pages start from the kit's templates (for Israel see `hebrew-rtl-israel`: the
  accessibility statement and the privacy notice at forms). The client's facts inside them
  (the business's legal name, the accessibility contact person) are "ask" items, never drafted.
- A draft never replaces a client's text. If the client's text exists, the area is "have".

## 17. Which model for which task

The one model rule in the `studio` skill applies. The tasks, classified:

- **Sonnet**: intake, extraction, cutting the page files, the global file, skeletons, the index, drafting the client message, microcopy and legal drafts. A long cut across many pages goes to Opus.
- **Fable**: the judgement pass and creative copy.
- **Haiku**: hand spot-checks, filing answers and changing markers.

## 18. Rules

- Verbatim only. The client's strings are never paraphrased, improved, corrected, shortened
  or translated. The only changes the tools make: zero-width characters removed, divider lines
  dropped, heading and list marks added.
- `docs/content/source/` is never edited. Files are added, never changed, renamed or deleted.
- `text/`, both `INDEX.md` rebuilt parts and `CONTENT.md` are built. Fix the source of a
  wrong line, then rebuild.
- Every area has one marker. Every "ask" and "write" has a `Missing:` line. Every gap is a
  row in the gaps table.
- Nothing from a previous site enters without the "legacy" marker, and nothing "legacy" goes
  live without the client's confirmation.
- A wrong file's text is never used to fill the page it was named for.
- The agent never contacts the client and never sends anything in the Art Director's name.
  It drafts; the Art Director sends.
- No design, no layout and no page order is decided here.
- Numbers quoted anywhere come from the scripts' tables, with the date.

## 19. Done when

- `docs/content/INDEX.md` lists every file with its word count and what it lacks.
- `map/` has one file per page of the config, every area marked, no "Problems" in the index.
- The verbatim check is `ok` for every page with a source; three files were read by hand.
- The Art Director gave a written yes to the map as the content baseline, with lock 1 (the bar and the contract).
- The message to the client is drafted and saved; its send date is recorded once it is sent.
