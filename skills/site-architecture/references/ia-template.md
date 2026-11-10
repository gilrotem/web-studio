# Site architecture (IA) — <project>

Session <step in the plan>, <date>. One direction, presented once to the Art Director
(`design/review/<date>-ia/sitemap.png`). Status: **<draft | locked by the Art Director <date> (D-nnn — label: "<verbatim>")>**

Inputs: the content map (`docs/content/map/`, one file per page, area names reused here
verbatim), the contract (`design/spec/contract.md`), the client's spec (`docs/design/<file>`),
the audit's "What the visitor expects to find" (`design/research/audit-<category>.md`,
STRUCTURE). Rulings that bind this page, verbatim from `DECISIONS.md`:
D-nnn — <label>: "<verbatim>" · D-nnn — <label>: "<verbatim>"

This page decides structure only: what pages exist, how they connect, which blocks repeat, what
each template holds and in what order, the slugs and the title pattern. No colour, type, layout
or copy; those are Stage 2 and later. Menu labels are not written here; the page names from the
map stand in for them.

---

## 1. The page list

<n> pages. Every one maps to a map file and a template (section 4).

| # | Page | Map file | Template |
|---|---|---|---|
| 1 | Home | `01-home.md` | home |
| 2 | <About> | `02-about.md` | about |
| 3 | <content page> | `10-<slug>.md` | content |
| … | | | |
| n | 404 | `00-global.md` "404 page" | 404 |

Not pages: <no blog, no gallery, no second language, …>, each with its ruling or reason.

## 2. Navigation

### 2.1 Header (every page)

In reading order: the logo line, then <n> items, then the action.

| Position | Item | Target |
|---|---|---|
| logo | <brand line> | home |
| 1 | <item> | page <#> |
| … | | |
| action | the one action (contract, "Intent") | <channel and link form>; <what is shown beside it on desktop> |

<n> items and one button. <Why each item earns its place.> On mobile: <what collapses, what
stays visible>. Floating elements: <one, on mobile only, or none>.

### 2.2 The content pages: grouping and order

<n> groups, by the reader's situation. Within a group, the most common case first. This order is
the order everywhere the list appears: the header menu, the index page, the home grid, the
footer.

| Group | Pages |
|---|---|
| A — <working name> | <#> <page> · <#> <page> |
| B — <working name> | … |

Why this and not the first draft: <group sizes, which cases lead, what moved>.

### 2.3 Footer (every page)

| Column | Content | Map area |
|---|---|---|
| 1 | | |
| … | | |
| bottom line | | |

Only in the footer: <legal pages, address, hours>.

## 3. Recurring blocks

| Block | Map area | Where it repeats | Position on the page |
|---|---|---|---|
| **Header** | "Header · …" | every page | top |
| **<block>** | `00-global.md` "<area>" | <every page except …, and why> | <position; full form on …, compact form on …> |
| **Lead band** (the action) | `00-global.md` "Lead band" | <every page except …> | <position> |
| **Footer** | "Footer · …" | every page | bottom |

The action's placement, against the contract: <primary channel where; secondary channels where;
forms where; the privacy notice beside every submit control>. One phone number, one source.

## 4. Template types

<n> templates. Areas are named as in the map files; order is top to bottom. Header and footer
are implied on every template.

### 4.1 home — `01-home.md`

1. <area>
2. <area>
…

Order rationale: <what the reader sees, finds, meets, is shown, does>.

### 4.2 content — <n> pages

1. Page title (the client's title, verbatim, as the H1)
2. Opening
3. Body (the client's own headings kept as H2s; the long form runs <min> to <max> words)
4. Closing
5. <shared blocks, in order>

<Where this order differs from the home's, and why. Which length-dependent features apply to
which pages.>

### 4.3 <index> · 4.4 about · 4.5 contact · 4.6 legal · 4.7 404

<areas in order; which shared blocks are absent and why>

## 5. Slugs and titles

Slug alphabet: **<Latin | the site's script>**. The Art Director's answer, <date>, to the
question "<question as asked>": "<verbatim>". <The reasons given with the recommendation.>

Structure: <content pages under one parent; the rest at the root; trailing-slash rule>.

| # | Page | Slug |
|---|---|---|
| 1 | Home | `/` |
| … | | |

Title pattern (the `<title>`; the H1 is the page title alone):

| Template | Pattern |
|---|---|
| home | `<brand> · <tagline>` |
| content | `<page title, before its first dash> · <brand>` |
| others | `<page title> · <brand>` |

## Not settled

- <labels the studio writes later>
- <texts pending from the client>
- <decisions a later stage makes>
