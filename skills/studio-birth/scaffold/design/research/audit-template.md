# Category audit — <category> sites (STRUCTURE only)

> Rename to `audit-<category>.md` when filled.

Stage 1, <date>. <Eight to ten> competitor sites <plus any site the client named>, captured
headless with Playwright at 1440×900 and 390×844, one scroll pass, then measured in the DOM
(fonts loaded, platform markers, overlay widgets, carousel and motion libraries, phone and
messaging links, fixed elements, heading languages). Captures and the raw measurements are in
`design/research/audit/` (`<slug>-1440-hero.png`, `-1440-full.png`, `-390-hero.png`,
`audit.json`). Everything here is tagged **STRUCTURE**: it tells the design what the category
does, so the design can refuse it deliberately, and what the visitor expects to find. Nothing
here sets the level; the level is `design/references/bar/`.

"Measured" below means read from the DOM or the capture; "inferred" is the agent's reading.

## The sites, one line each

| # | Site | Where | Platform (measured) | Display / body type (measured) | Hero | Contact | Overlay | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | |

Mark the category's ceiling: the one site that does it well, and why.

<If the client named a site they like: one paragraph on it, for structure, measured the same
way, with its tag from the contract.>

## What every one of them does (the clichés to refuse deliberately)

Measured across the sites unless marked inferred. Number them, with the count ("8 of 10").

1. **<the cliché>** (<count>): <what it looks like here, and what of the subject's own world it leaves out>.

## What the visitor expects to find (structure worth keeping)

<What the category has taught its visitors to look for and where: the contact pattern, the
proof, the list of services, the process. This feeds `design/spec/ia.md`.>

## What this means for the design

<Three to five lines: where the distinction will come from, given what the category does.>
