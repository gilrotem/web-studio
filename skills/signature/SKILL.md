---
name: signature
description: The Art Director's taste — the studio's binding visual identity and its premium bar. Consult it for every visual choice the project contract does not pin down: typography pairing, color roles, depth, imagery, motion, UI voice, and the quality gate every page must pass before it is shown. It overrides any bundled or runtime design skill it overlaps with.
---

# Signature — The Art Director's Rules

Rewritten 2026-09-16 after a client direction round. The previous version of
this file legislated restraint: few elements, remove an accessory, one bold
moment, a long blacklist of richness devices. Applied by a model, that taste
profile produced wireframes with a photograph behind them, and the Art Director
called the result what it was. Restraint is a choice a master makes on top of
richness; it is not a starting point. This version sets the bar the other way
round: **the page must look finished, rich and expensive at first render, and
only then may anything be taken away.**

---

## 1. The premium bar — what every page must reach before it is shown

A page is ready to be shown when the Art Director could mistake it for a
shipped page from a first-rank studio. Not "clean", not "correct", not
"structure first". Finished. Concretely:

1. **Every section is composed.** It has one dominant element, sits on the
   page's axes, and is connected to the section before it. Richness comes from
   type, imagery, scale and light, not from giving every element a surface. A
   section that is only text on a flat color is unfinished; so is a section that
   is a row of containers.
2. **Depth is expected, containers are budgeted.** Depth comes from scale
   contrast, an image that bleeds or sits behind text, one overlap where the
   content asks for it, light and shadow in the photography. Elevated panels
   and cards are the exception (section 4a sets the budget), never the default
   way to make a section feel finished.
3. **Imagery is plural.** A hero image alone is not imagery. Secondary images in
   bands, cards and lists, one photographic family (same grading, same crop
   logic), art-directed for the page. Generate with `fal-image` whatever the
   client does not have. Texture and material imagery count.
4. **Components are drawn.** Buttons, list rows, inputs, tags, dividers, and
   the few cards the budget allows: each has deliberate padding, radius, border,
   elevation, and a resting state that already looks finished, plus hover, focus
   and active states. Drawn does not mean boxed: a list row with a hairline and
   a numeral is a drawn component.
5. **Icons are welcome** when they are one consistent drawn set: one stroke
   weight, one size grid, one style. They carry meaning next to a label. What is
   out is a mismatched pile or emoji.
6. **The scroll is one continuous path.** Surfaces alternate (light, tinted,
   dark, image), section heights vary, and each section connects to the next
   (section 4a). A section never ends where its background color ends.
7. **Type does real work.** Large display sizes, a real scale (not 24 / 20 / 16),
   weight contrast that reads as two voices, numerals and labels set with care.
8. **Motion is present.** One orchestrated load timeline, a scroll response,
   considered hover states. See section 6.
9. **Nothing is a placeholder.** Real strings, real images, real states.

**Self-gate, mandatory before showing anything:** render the page, look at the
full screenshot, and answer in writing: "Which three shipped sites could this be
mistaken for?" If the honest answer includes "a template" or "a wireframe", it is
not ready. Keep going. Present once, when defensible.

**The written answer passes nothing on its own** (2026-09-18: a builder
grading alone passed a wireframe). The gate is visual: the render placed next
to the project's level references in one side-by-side sheet, shown to the Art
Director with the page. If the project has no level references in pictures,
collecting them comes before the first build.

---

## 2. Typography — and the hard Hebrew rule

### Serif in Hebrew

Hebrew serif faces (`Frank Ruhl Libre`, `Suez One`, `Noto Serif Hebrew`,
`Noto Rashi Hebrew`, `David Libre`, `Bellefair`, `Cardo`, `Bona Nova`,
`Tinos`) are used when the subject is heritage, institutional, legal,
dignified or nostalgic, or when the contract asks for it. Otherwise sans.

Two rules always bind:
1. Serif carries **display only**. Body is a non-serif face.
2. **Never serif and sans inside the same sentence or line.** Not for emphasis,
   not for a highlighted word. In Hebrew it reads as broken, not deliberate.

### Where contrast comes from in Hebrew

Hebrew has no uppercase, no small caps, no condensed heavy display, no
high-contrast serif. Typographic contrast is built from **weight and size**,
and everything else on the page (imagery, color, depth, composition, motion,
texture) does proportionally more work than in a Latin design. A Hebrew page
designed as a pure typographic exercise is flat by construction.

### The working bench (Google Fonts, Hebrew subset)

Display / heavy: `Heebo` 800–900 · `Secular One` 400 · `Miriam Libre` 700 ·
`Rubik` 800–900 · `Assistant` 800 · `Noto Sans Hebrew` 900 · `Karantina` 700.
Body / text: `Assistant` 200–800 · `Heebo` 100–900 · `Noto Sans Hebrew` 100–900 ·
`IBM Plex Sans Hebrew` 100–700 · `Rubik` 300–900 · `Alef` 400/700.

Rules: two families maximum, or one across an extreme weight range; display
tight (line-height 1.0–1.15); body loose (1.6–1.75) and never wider than ~65
Hebrew characters; body never under 16px. No letter-spacing on Hebrew running
text. Never Inter, Poppins or Montserrat for display.

**RTL craft, always:** logical properties (`margin-inline`, `padding-inline`,
`inset-inline`); mirror icons that encode direction (arrows, chevrons), never
ones that do not (logos, clocks, checkmarks); numbers and Latin runs stay LTR
inside Hebrew text.

---

## 3. Color

1. **A neutral base and a working accent system.** The base is warm or cool
   neutrals with real tonal range (at least four steps: ground, tint, mid,
   deep). The accent is used with intent: fills, rules, marks, highlights. An
   accent that appears only once per screen reads as timid, not refined; an
   accent on everything reads as noise. Aim between.
2. **Contrast is a hard gate.** Body text ≥ 4.5:1, large display ≥ 3:1. A brand
   color failing its assigned text role gets a darker relative for text; the
   original stays as surface, fill, rule or mark.
3. **Gradients do work or stay out.** Photographic scrims, depth cues, a tinted
   surface transition: yes. Gradient text and purple-to-blue washes on dark: no.
4. **Dark surfaces are part of the palette**, not only the footer. A dark band
   mid-page is one of the cheapest ways to give a scroll tempo.

---

## 4. Space and rhythm

1. **One spacing scale, no magic numbers.**
2. **Air belongs around finished things.** Generous space reads as luxury only
   when what it surrounds is rich; big padding around thin content reads as
   unfinished. Fill first, then open up.
3. **Section rhythm varies deliberately**: heights, surfaces, alignment
   (centered, asymmetric, full-bleed) change across the scroll.

---

## 4a. Composition — the layer that holds a page together

Added 2026-09-17 after a client home-page review. That page had the right brand
language and still read as six slides stacked: every element in its own box,
each section on its own alignment, mobile as the desktop stacked. The rules
above said nothing about composition, so the agent boxed everything. This
section makes composition explicit. It exists to prevent generic, boxed
design; it must never become a checklist of effects. Overlap because the
content asks for it, not because it is listed here. Sometimes the right element
is simple and quiet.

1. **One grid, repeated.** Twelve columns at the project's content width, with
   four to six named vertical axes. Every headline, every image edge and every
   block start snaps to an axis, in every section, however different the
   compositions are. The skeleton stays the same skeleton.
2. **Container budget.** At most one meaningful card or panel per section, and
   on a whole page fewer containers than sections. Before any element gets a
   surface, border, radius or shadow, ask whether it needs one. Usually it does
   not: a hairline, a numeral, a label or plain scale does the job.
3. **One dominant element per section.** Not four of equal weight. The eye must
   know where the section's center of gravity is before it reads anything.
4. **Sections connect.** Every section joins the one before it through an
   overlap, a continuation (an axis, a line, a shadow, an image edge), or a
   background that starts early. Hard cuts between colors are a defect unless
   they are the one deliberate moment of the page.
5. **Images are compositional elements.** They bleed, crop, sit behind text and
   leave negative space. An image inside a rounded rectangle inside a column is
   the last resort, not the pattern.
6. **Quiet but not static.** The eye moves along the page through scale, light,
   lines and spacing, without animation doing the work. Tension between
   elements (an offset, an asymmetry, a scale jump) is part of harmony.
7. **Desktop and mobile are two compositions.** Mobile is designed in the same
   pass as desktop, from a small set of patterns (an editorial hero with the
   image and the content overlapping as one body; a journey as a vertical
   sequence, not cards; a story section of image, text and action with an
   intended overlap). A media query that stacks the desktop is not a mobile
   design and fails the self-gate on its own.
8. **No layout coupling across breakpoints.** No element whose position depends
   on another element's geometry (a headline aligned to a curve, a shape that
   must meet a photo edge at every width). Concepts that need that live inside
   the imagery or on the grid, not in CSS architecture.
9. **The core before the hero, the hero before the page.** A one-page
   composition spec (grid, axes, spacing, type scale, container budget, mobile
   patterns) and provisional tokens exist before any section is built. The hero
   is built alone, to the end, on both compositions, and presented once. Then
   the page grows one section at a time, each joined to the one before.
10. **The hero is message-led and action-led.** Photography is a supporting
   compositional asset, never the full background behind the primary
   information unless the specific page genuinely calls for it. The
   information field (headline, explanation, action) sits on its own quiet
   ground; the visual field is a photograph that takes part of the
   composition, bleeds, is cut architecturally, enters the content area a
   little, or passes its light and shadow into the quiet field. Not a split
   screen of text beside an image in a rectangle, and not a card over a photo.
   (Owner, 2026-09-17, after a client hero.)

## 5. Imagery

1. **Real, large, of the subject's own world**, and plural across the page.
2. **Generate what does not exist** with the `fal-image` skill: hero, section
   imagery, texture, material, atmosphere. "No assets" is never a reason for a
   page without imagery. Only fabricated evidence is forbidden: fake client
   work, fake screenshots, fake logos, fake people presented as real customers.
3. **One treatment across the page**: one grading, one crop logic, one
   aspect-ratio family.
4. **Images are composed into the layout**, not dropped in: masked, overlapped,
   bled, framed, captioned. A rectangle in a column is the minimum, not the aim.

---

## 6. Motion

Every page ships all three: **interaction states** on every interactive
element; **one scroll response** (parallax, pin, reveal against scroll); **one
orchestrated load timeline** with stagger. 150–400ms ease-out for interface
transitions, no bounce. `prefers-reduced-motion` is honoured and the reduced
state is a complete design.

---

## 7. UI voice

Second person plural ("אתם"). Short sentences, zero superlatives. Buttons
state the outcome. Say the specific thing. No exclamation marks, no urgency
devices, no em-dashes in visible Hebrew text.

---

## 8. Still never

- Gradient text; purple-to-blue gradients on dark; mesh gradients as a page background.
- Emoji as icons; mismatched icon sets.
- Body copy under 16px; line length past ~70 characters.
- Lorem, placeholder boxes, "your headline here".
- Independent scroll-trigger animations on every section (one timeline, not many).
- Shipping anything that failed the self-gate in section 1.

---

## 9. Review checklist — run on the screenshot before calling anything done

1. Would a first-rank studio ship this as is? If not, what is the single
   biggest reason, and is it fixed at the root?
2. Can you draw four to six vertical lines through the screenshot and find that
   every section's headlines and image edges sit on them?
3. Count the containers. Is there at most one meaningful card per section, and
   does each section have one dominant element? Does every section connect to
   the one before it, and is the mobile render a composition of its own rather
   than the desktop stacked?
4. Is imagery plural and treated as one family?
5. Does the type read as two voices at real display sizes?
6. Does the scroll have tempo (surfaces, heights, alignment vary)?
7. Every text color passes its contrast threshold; the RTL craft rules hold.
8. Motion: one timeline, one scroll response, hover states everywhere.
9. Does the page use the subject's own world rather than web clichés about it?
