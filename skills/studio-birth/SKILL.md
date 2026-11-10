---
name: studio-birth
description: Sets a project up to run under the studio: either dresses an existing repository or gives birth to a new one. Checks the toolchain and the connections (Playwright, Chrome DevTools and Mobbin MCP servers, the fal.ai key, Node, Python, ffmpeg), lays down the studio folders and the blank templates (contract, studio brief, plan, status, decisions, design system, tokens, the bar, the audit), and proposes the block for the project's CLAUDE.md. Use when the user says "birth", "new project", "set up the studio", "dress this project", "לידה", "פרויקט חדש", "תלביש את הסטודיו", or when a design stage is asked for in a repository that has no design/spec/contract.md.
---

# Studio birth — dress a project, or start one

The kit holds the method. A project holds its own facts. Birth is the one moment the kit writes
files into a project; after it, the kit's skills only read and write the project's own files.

Two cases, one procedure:

- **Dress** an existing repository: add what is missing, never overwrite what exists.
- **Birth** a new project: an empty folder becomes a repository with the studio laid out.

Blank templates are in `${CLAUDE_SKILL_DIR}/scaffold/`. Connections and the toolchain are
explained in `${CLAUDE_SKILL_DIR}/references/connections.md`.

## Before writing anything

1. **Say what you see.** Is this a git repository? Does `design/spec/contract.md` exist? Is there
   a `CLAUDE.md`, a `STATUS.md`, a `DECISIONS.md`, a harness of the project's own? List what
   exists and what birth would add. If the project already has truth files in another format,
   they win: do not add a second `STATUS.md` beside them.
2. **Ask the birth questions in one round**, closed where possible, "not settled yet" always
   allowed:
   - The project's slug and the name the site carries.
   - Mode: SITE or PAGE.
   - Delivery: a WordPress theme, a static deploy, something else, or not settled.
   - Language and direction (for example `he-IL`, RTL; or more than one language).
   - Where the client's material is (a folder to copy from), and whether a previous site exists.
   - The imagery budget (a monthly or per-project cap for fal.ai), or none.
   Do not ask for anything the stages ask later (the one action, the type budget, references).
3. **Show the file list** birth will create, and wait for the Art Director's yes.

## What birth lays down

Copy from `${CLAUDE_SKILL_DIR}/scaffold/` into the project root, skipping every file that
already exists (report each skip):

```
STATUS.md                          from scaffold/STATUS.md
DECISIONS.md                       from scaffold/DECISIONS.md
docs/design/PLAN.md                from the studio skill: references/plan-template.md
docs/design/definition-of-done.md  from the studio skill: references/definition-of-done.md
docs/design/studio-brief.md        from scaffold/docs/design/studio-brief.md
docs/design/client-spec.md         from scaffold/docs/design/client-spec.md
docs/content/source/  text/  map/  empty, with .gitkeep
design/spec/contract.md            from scaffold/design/spec/contract.md
design/spec/design-system.md       from scaffold/design/spec/design-system.md
design/spec/tokens.css             from scaffold/design/spec/tokens.css
design/spec/pages/                 empty, with .gitkeep
design/references/bar/README.md    from scaffold/design/references/bar/README.md
design/references/moodboard/  motion/  source/   empty, with .gitkeep
design/research/audit-template.md  from scaffold/design/research/
design/research/feasibility.md     from scaffold/design/research/
design/research/type-pairings.md   from scaffold/design/research/
design/review/                     empty, with .gitkeep
.claude/launch.json                from scaffold/.claude/launch.json (merge a "design-preview" entry if the file exists)
.env.example                       from scaffold/env.example
.gitignore                         append the lines of scaffold/gitignore that are missing
```

Then fill what the birth answers decide: the slug and name in the headings, Mode, Delivery,
Language and the imagery budget in the contract, the date. Everything else stays `null` or
`<...>`. Never invent a value to make a template look complete.

Not laid down at birth: `design/spec/ia.md` (the `site-architecture` skill writes it from its
own template at its stage), `design/art-direction.md` and `design/motion-spec.md` (Stage 3),
`design/spec/composition.md` and `components.md` (Stage 2), the content index and map (the
`content-map` skill).

## The client's material

If the Art Director pointed at a folder: copy it into `docs/content/source/` with the original
file names, leave the original untouched, and stop there. Extraction, counting and the index are
the `content-map` skill's first step, in its own session. The copy in `source/` is read-only
from then on. A real person's photograph is copied like any file, and is not used on the site
without the approval the project's rules ask for.

## CLAUDE.md

Birth never edits a `CLAUDE.md` on its own. It proposes: show the block in
`${CLAUDE_SKILL_DIR}/scaffold/CLAUDE.studio.md` filled with this project's facts, say which file
it would go into and where, and wait for an explicit yes. On a new project with no `CLAUDE.md`,
the same rule holds: show the file, then create it on a yes.

## Connections and toolchain

Run the check and report it as a table (present / missing / needs sign-in), fixing nothing
silently:

```powershell
powershell -ExecutionPolicy Bypass -File ${CLAUDE_SKILL_DIR}/scripts/check-toolchain.ps1
```

It checks Node, npm, Python and its imaging packages, ffmpeg, git, whether Playwright and
axe-core resolve from the project, whether a fal.ai key is present (it prints present or
missing, never the value), and which MCP servers the project or the plugin declares. What each
one is for, how to install it and what to do when one is missing is in
`references/connections.md`. Installing packages into the project (`npm i -D ...`) is proposed
with the exact command and run on a yes.

## Close

1. The first `STATUS.md`: born on this date, on which kit version, what exists, what the next
   session does (normally the content map and Stage 1 in parallel).
2. The first entries in `DECISIONS.md`: each birth answer that is a ruling, verbatim, with the
   question and its options.
3. On a new project: `git init`, a first commit on the Art Director's yes. Creating a remote
   repository and pushing are separate confirm-first actions.

## Rules

- Never overwrite. A file that exists is skipped and reported.
- No value is invented. `null` and `<...>` are honest; a plausible guess is not.
- Nothing from another project enters: no copied contract, no copied tokens, no copied
  decisions. A new project starts from blank templates only.
- The kit is not copied into the project. If the project must carry the skills inside its own
  repository (to work where the plugin cannot be installed), that is the vendoring script in the
  kit's repository (`tools/vendor.ps1`), run deliberately and recorded in `STATUS.md` with the
  kit version it took.
