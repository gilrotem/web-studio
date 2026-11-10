---
name: studio-birth
description: Sets a project up to run under the studio, in one round of questions: dresses an existing repository or gives birth to a new one. Detects a kernel project (host mode: design folders and files only, no root truth files, CLAUDE.md untouched). Checks the toolchain and the connections (Playwright, Chrome DevTools and Mobbin MCP servers, the fal.ai key, Node, Python, ffmpeg), lays down the design folders and blank templates (contract, plan, design state, design system, tokens, the bar, the audit), and in a standalone project also the status and decisions files and a proposed CLAUDE.md block. Use when the user says "birth", "new project", "set up the studio", "dress this project", "לידה", "פרויקט חדש", "תלביש את הסטודיו", or when a design stage is asked for in a repository that has no design/spec/contract.md.
---

# Studio birth — dress a project, or start one

The kit holds the method. A project holds its own facts. Birth is the one moment the kit writes
files into a project; after it, the kit's skills only read and write the project's own files.
Birth is also the one moment the Art Director is asked questions (`studio` skill, "Straight
through"): everything a stage would otherwise ask is asked here, once.

Blank templates are in `${CLAUDE_SKILL_DIR}/scaffold/`. Connections and the toolchain are
explained in `${CLAUDE_SKILL_DIR}/references/connections.md`.

## Before writing anything

1. **Say what you see.** Is this a git repository? Does `design/spec/contract.md` exist? Is there
   a `CLAUDE.md`, a `STATUS.md`, a `DECISIONS.md`?
   **Host mode** applies when the project's `CLAUDE.md` has a line starting
   `Kernel: agency-harness`: the kernel governs the project and its truth files; the kit adds only
   design folders and files (`studio` skill, "Host mode"). Say which mode applies. A project
   with truth files of another harness and no kernel line is dressed without the kit's own
   `STATUS.md` and `DECISIONS.md` either; say so and treat it as host mode.
2. **Ask the birth questions in one round**, closed where possible, the recommended answer first,
   "not settled yet" always allowed. Nothing about a platform, hosting or delivery is asked.
   1. The project's slug and the name the site carries.
   2. The job: a new **site**; a **site redesign** (the live site's address); a **page** or an
      area added to an existing site (the host site's address).
   3. Language and direction (for example `he-IL`, RTL; or more than one language).
   4. Where the client's material is (a folder to copy from), and their own spec, if any.
   5. The one action the visitor takes and its channel (phone, WhatsApp, a form, a purchase),
      in the client's wording if it exists.
   6. The type budget: free fonts only (recommended) / one commercial face / open.
   7. Any site the client likes: its address, and whether the Art Director tags it TASTE or
      leaves it STRUCTURE (the default).
   8. The imagery cap: `USD <n> per project` / `USD <n> per month` / `none`. The image toolkit
      refuses any run past it.
   9. A concept or inspiration the Art Director already has (words, a picture, a site), or none
      yet.
   10. URL slugs: Latin (recommended) / the site's language.
   11. What is opened beyond the fixed locks: nothing (recommended) / a lock per foundation /
       WebGL / video.
   12. A redesign only: is there a keep-list (the pages that must keep their URL, written by the
       SEO side, not by the designers)? Its path, or none yet.
3. **Show the file list** birth will create, and wait for the Art Director's yes.

## What birth lays down

Copy from `${CLAUDE_SKILL_DIR}/scaffold/` into the project, skipping every file that already
exists (report each skip).

**Both modes:**

```
docs/design/PLAN.md                from the studio skill: references/plan-template.md (the job's part only)
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
design/build/                      empty, with .gitkeep
design/review/                     empty, with .gitkeep
```

**Host mode, in addition:** `docs/design/STATE.md` from `scaffold/docs/design/STATE.md`. Nothing
else: no `STATUS.md`, no `DECISIONS.md`, no `.claude/` file, no `.env.example`, no `.gitignore`
edit, and `CLAUDE.md` is neither edited nor proposed. The root-level lines the design work wants
(the `.gitignore` lines of `scaffold/gitignore`, the `design-preview` entry of
`scaffold/.claude/launch.json`, the key name in `scaffold/env.example`) are printed once as a
note for the kernel session to apply; birth does not write them.

**Standalone, in addition:**

```
STATUS.md                          from scaffold/STATUS.md
DECISIONS.md                       from scaffold/DECISIONS.md
.claude/launch.json                from scaffold/.claude/launch.json (merge a "design-preview" entry if the file exists)
.env.example                       from scaffold/env.example
.gitignore                         append the lines of scaffold/gitignore that are missing
```

Then fill what the birth answers decide: the slug and name in the headings; in the contract the
Job, Redesign, Language, Type budget, Imagery budget, Opened and Keep-list lines, the one action,
the liked site in Reference with its tag, the slug alphabet; the inspiration in the studio
brief; the date. Everything else stays `null` or `<...>`. Never invent a value to make a
template look complete.

Not laid down at birth: `design/spec/ia.md` (the `site-architecture` skill writes it in stage 1),
`design/art-direction.md` and `design/motion-spec.md` (the concept stage),
`design/spec/composition.md` and `components.md` (foundations), the content index and map (the
`content-map` skill), `design/research/redesign-review.md` (`redesign-review`).

## The client's material

If the Art Director pointed at a folder: copy it into `docs/content/source/` with the original
file names, leave the original untouched, and stop there. Extraction, counting and the index are
the `content-map` skill's first step, in its own session. The copy in `source/` is read-only
from then on. A real person's photograph is copied like any file, and is not used on the site
without the approval the project's rules ask for.

## CLAUDE.md

Host mode: not touched and not proposed; the kernel owns it.

Standalone: birth never edits a `CLAUDE.md` on its own. It proposes: show the block in
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
missing, never the value), which MCP servers the project or the plugin declares, the mode, and
the design state file. What each one is for and how to install it is in
`references/connections.md`. Installing packages into the project (`npm i -D ...`) is proposed
with the exact command and run on a yes.

## Close

- **Host mode:** fill `docs/design/STATE.md`: born on this date, on which kit version, the job,
  the birth questions with their options and the answers verbatim (they are the record until the
  lock 1 entry quotes them), and the next stage (stage R for a redesign, else stage 1). Nothing
  is committed here; the kernel's close does that.
- **Standalone:** the first `STATUS.md` (born on this date, on which kit version, the job, what
  exists, the next stage); the first entries in `DECISIONS.md`: each birth answer that is a
  ruling, verbatim, with the question and its options. On a new project: `git init`, a first
  commit on the Art Director's yes. Creating a remote repository and pushing are separate
  confirm-first actions.

## Rules

- Never overwrite. A file that exists is skipped and reported.
- No value is invented. `null` and `<...>` are honest; a plausible guess is not.
- Nothing from another project enters: no copied contract, no copied tokens, no copied
  decisions. A new project starts from blank templates only.
- The kit is not copied into the project. If the project must carry the skills inside its own
  repository (to work where the plugin cannot be installed), that is the vendoring script in the
  kit's repository (`tools/vendor.ps1`), run deliberately and recorded in the design state with
  the kit version it took.
