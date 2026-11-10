# Practices — what running the method taught

Field notes from real work under this method, written as rules with their reason. They are not
taste (taste is `signature`) and not procedure (procedure is each stage's skill). They are the
things that went wrong once and the move that fixed them. Read them before the first
presentation of a project; re-read the relevant part when a sheet comes back rejected.

## 1. Presenting

**A grey-box sheet is rejected on sight.** A foundation is presented rendered and composed, with
the real strings, the real logo, real imagery and the real typeface, at 1440 and 390. A sheet of
swatches, boxes and labels reads as unfinished work however correct its numbers are. The Art
Director presents this work onward to other people and judges it at the level of the finished
thing.

**A whole page built ahead of unlocked foundations is rejected too.** It asks him to judge
colour, surface, grid, spacing, type and composition at once, and nothing in it is settled, so
every remark touches everything.

**What works: one element built alone, to the end, then derived from.** When a foundation sheet
does not land, stop making sheets. Build one real element (the hero is the usual one) completely:
both widths, real content, real imagery, states. When it stands, derive the foundation from it
(the colours it actually uses, the surfaces it implies, the overlaps it measures) and bring that
back as one sheet for one lock. The derived sheet then shows the scheme *in use*, which is what
was missing from the abstract one.

**One sheet, shown once.** A sheet that is shown, patched and shown again three times has trained
the Art Director to expect drafts. Run the review loop privately until the sheet is ready, then
show it. A revision after his correction is a new revision of the sheet, named as such
("rev. 2"), and the lock names the revision.

**The closing question names the scope and what is left out.** "Is the colour scheme locked?"
together with "Not locked by this: the headline text, type sizes, the grid, motion." Without the
second sentence a lock is later read as covering things it never showed.

**Questions are closed and few.** One question at a time, with answer options, the recommended
one first, and "not settled yet" always available. The answer is quoted verbatim, including the
option list it was chosen from, so a later session can see what was *not* chosen.

**Process stays out of the presentation.** The page or the sheet speaks. Pass counts, what was
tried and what was reverted go to `design/review/`, not into the message.

## 2. Reading the Art Director's words

Words of taste point at something measurable. Find what, and measure it, before changing
anything.

| He says | It turned out to mean | What to measure |
|---|---|---|
| "crowded", "too busy" | the count of interface elements in the view | elements per viewport: nav items, buttons, labels, badges, floating controls |
| "too clean", "a block of colour" | a flat field: a large area of one unmodulated colour | the share of the area within a small tolerance of one colour |
| "too dark", "heavy" | the lightness of the dark surfaces and how much of the page they cover | the L values of the gradient ends, and the dark share of the full-page render |
| "not premium to the end" | the composition is right and the finish is not: edges, light, joins | the cut-out edges at full size, the joins between sections, the hover states |
| "doesn't sit right" | usually the relation between two elements, not either one | where the headline, the subject and the light fall relative to each other |

Two things follow. First, do not answer "crowded" by changing the background, or "too clean" by
adding elements: the two complaints have opposite cures and are easy to swap. Second, write the
reading into `STATUS.md` when the session closes, in his terms, so the next session does not
relearn it.

## 3. Measuring

**Measure the reference from its CSS, never by eye.** When the client or the Art Director likes a
site, open it and read the values from the DOM and the stylesheets: the colours of ground, tint,
text and dark surfaces; the gradient's stops and angle; the shadow; the radii; the button's
padding, gap, type and transitions. A component worth matching is traced exactly: for a pill
button that meant padding 8/28, gap 16, a 30 px disc, 500 weight at 20/24, radius 1000, a 50 px
sheen at -30 degrees crossing in .5 s while the pill fades in .3 s. A hover is captured at timed
intervals (60, 150, 300, 500, 900 ms) so its curve is seen, not guessed. Chrome DevTools MCP
(`get_css_styles`, `evaluate_script`) or Playwright does this in minutes.

**One version, as precise as possible.** Precision is the deliverable. Two approximate versions
are worth less than one exact one.

**The reference is the floor, not the ceiling.** Matching its hygiene and its air is where the
work starts. The level is the bar (`design/references/bar/`).

**Measure the brand from the vector file.** Logo colours are read from the PDF or SVG fills, not
sampled from a PNG. The logo's colours stay in the logo unchanged; the interface gets its own
roles, some of which are the logo's colours and some of which are darker or lighter relatives
that pass contrast.

**Measure before you ask.** Before asking to reopen a lock or to change direction, put numbers
next to the feeling. In one colour round the rejected dark skin ran L 39 to 21.5 where the liked
reference ran L 44 to 34, and about a third of the rendered page was dark. That made the
correction a decision ("lighter, toward the blue") instead of another round of guessing. In the
surface round, the flat share of one colour in the hero fell from 34% to 9% at 390 and from 38%
to 14% at 1440 once the field got a second, weaker light; the number is what showed the fix had
worked.

**Contrast is computed, not eyeballed.** Every text role on every ground it may sit on gets a
ratio computed from the hex values, in a table in `design-system.md`. The table has "not
allowed" rows: combinations that fail are written down as forbidden, so a later session does not
rediscover them. A colour that fails as text can stay as decoration, and is labelled
"decoration only".

## 4. Locks and reopening

**A lock is narrow.** It covers what the sheet showed. Icons, hover states as a system,
responsiveness beyond the widths shown, scroll effects and transitions each keep their own step;
none of them is settled by the way they happened to look on a colour sheet.

**A lock can be wrong, and saying so is cheaper than building on it.** A scheme that looked right
on a swatch sheet can fail on a whole page. Say it plainly, measure, ask one question to reopen
the named part, and keep the rest standing. The reopening is a new decision entry; the old one
gets a status line and is otherwise untouched.

**Locked files are not edited between a reopening and the new lock.** The new work lives in the
review folder. The tokens change only when the new lock is quoted.

**Rejected rounds are kept as evidence, labelled.** `STATUS.md` lists them as "rejected on the
way, kept as evidence only" so nobody mistakes them for the current state.

## 5. Foundations

**Colour roles, not colour lists.** A scheme is: the grounds, the ink, the brand colour that
acts, the family that carries dark surfaces, the text colours on dark, the status colours for
forms, and for each one where it may and may not be used. "One hue in four steps carries every
dark surface" is a scheme; twelve swatches are not.

**Surfaces are decided as a short numbered set** (five was enough for a whole site): the ground,
the tint band, the white surface flat or lifted, the gradient panel, the field. Each has a rule
for where it appears. Then the cross-cutting rules: light, relief or texture, the photograph's
treatment, radius, elevation, edges, and how sections join.

**Sections join by continuation, never by a line.** An overlap, a surface that straddles a
section edge, a texture that starts early. The measured overlaps go into tokens.

**One light per dark field**, placed behind the dominant element, with a weaker second rise so no
part of the field is flat. One texture at most, and it is a seamless vector tile coloured through
a mask, not a raster overlay.

**A portrait is cut out and stands in the surface.** The light and the texture pass behind it.
Edges are checked at full size on a light ground and on a deep ground before use. Where the
photograph keeps its backdrop, the backdrop is regraded to the palette. Scripts for both are in
the `foundations` skill.

**Type under constraints is a role question.** When the budget is free fonts and the script is
Hebrew, the choice is made by what the type must serve: long-form reading, a short repeated
action, hierarchy from one family. A variable family with two axes (weight and width) gives
hierarchy without a pairing seam and keeps adjustment in the tokens. Serif display is the
`signature` default for dignified subjects, and the Art Director may rule it out for a project;
then the rule is "no serif anywhere" and the direction is redone, not defended.

**Keep the type question short.** It is one decision. The context is better spent on the build
stages: the look of each area, scroll smoothness, the small details of every element.

## 6. Specification

**The client's files are evidence, not truth.** Hash the extracted text of every file: a file
with the wrong content under the right name (the same text as another file) is found in seconds
that way and in days otherwise. Count words: the template has to carry the longest page, and the
shortest page shows what the template looks like nearly empty.

**Nothing is rewritten in the map.** The map cuts from sources. The moment the agent "improves" a
sentence the client can no longer recognise their own text and the map stops being a baseline.

**Ask the client once.** One message, built from the gaps table, sent by the Art Director. Then
what comes back is final: nothing more is asked, no certificate or proof is requested, and the
facts are used only where the page needs them, never pasted as a list. Facts the owner states
are the owner's; the agent does not police them or attach warnings to them.

**The studio writes the furniture without asking.** Menu labels, footer, copyright line, 404,
form microcopy and the generic legal pages (privacy policy, accessibility statement with the
name, phone and email) are the studio's to write. Only genuine content gaps go to the client.

**The previous site is evidence, not a source.** It shows the client's direction and holds
content their files may lack. Its structure is not reused, and its content is taken only where
the client's own files have nothing, marked as such, for the client's confirmation.

**Slugs: Latin unless there is a reason.** Where the primary channel is a messaging app, a
non-Latin slug pasted into a message becomes a percent-encoded string of a hundred characters or
more that looks broken. Latin slugs stay short and copyable; search engines rank both alphabets
alike for the local-language query, and the title and H1 carry the keywords. The slug of a page
is its map file's name, so a page, its map file and its URL carry one name.

**Group pages by the reader's situation, not by the provider's method.** And keep one order
everywhere the list appears: the header, the index page, the home grid, the footer.

## 7. Research

**The audit is measured.** Competitor sites are captured headless at both widths and then read
from the DOM: platform, fonts and sizes, overlay widgets, carousels, motion libraries, phone and
messaging links, fixed elements, the languages of the headings. The audit file separates
"measured" from "inferred". Its two outputs are a list of what every site in the category does
(to be refused deliberately) and a list of what the visitor expects to find (which feeds the
architecture). It names the category's ceiling, the one site that does it well, so the design
knows the local best and still does not take it as the level.

**The bar is a written line per site.** "What it does that we must match", plus what is
deliberately not matched. A reference enters the work as that line, never as a raw image. A site
that blocks headless capture is carried as its line only.

**Feasibility before desire.** One paragraph per candidate effect: what it is, the technique, the
cost on a mid-range phone, the verdict (trivial / a day / needs WebGL / skip), and the fallback
that ships as a complete design under reduced motion. An effect that depends on facts the client
has not confirmed (counting figures, for example) is refused until the facts exist.

## 8. Sessions and context

**One session, one unit of work.** A stage, or one foundation. The session that plans does not
execute; the session that executes is started with a brief and runs one approved item.

**The repository is the hand-over.** Another machine or another account must be able to continue
from `STATUS.md`, the plan and the decisions alone. That is why every session closes with a
commit and push on the Art Director's yes, and why `STATUS.md` says what the next session must
carry in his own terms.

**`STATUS.md` stays short.** Current state only. History is in `DECISIONS.md` and in git. A status
file that grows past a couple of thousand tokens stops being read.

**Servers stay out of design sessions.** No hosting, no accounts, no deploy talk until the
static site is locked.

**No compromise items keep their own step.** Custom icons, hover states, responsiveness, scroll
effects and transitions are each a named task with its own presentation. They are never settled
"on the way" inside another stage, and they are never dropped for time.
