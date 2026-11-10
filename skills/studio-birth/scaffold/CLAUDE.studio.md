<!-- A block for the project's CLAUDE.md. Birth proposes it; it is added only on the Art
     Director's explicit yes. Fill the <...>; delete lines that do not apply. It holds this
     project's facts and rules. It holds no method: how a stage is done comes from the
     web-studio kit and changes only there. -->

## Design studio

Read first: `STATUS.md` (where we are, what this session does). Rulings are in `DECISIONS.md`; a
ruling is quoted, never paraphrased. The plan is `docs/design/PLAN.md`. Method: the `studio`
skill of the web-studio kit (<installed as a plugin at version ... | vendored under
`.claude/skills/`, version in `.claude/web-studio.version`>).

- What it is: <one line: whose site, what kind, the name the site carries>.
- Job <site | site redesign | page>; language <...>; imagery cap <...>.
- The Art Director is <name>. They give the answers at birth and the locks; they are not asked to supply
  references or to choose between screen variants.
- Chat language: <...>. Files, specs, code and commits in English; the site's language only in
  verbatim quotes, titles, keywords and site copy.
- The client's material is in `docs/content/source/` and is read-only.
- Secrets live in `.env.local` and `.secrets/`, git-ignored, never quoted in a file or a message.
- Imagery budget: <the cap>.

### Confirm first

Nothing below happens without the Art Director's yes to the exact action, in this session, in
writing: any write to a live site, its database or its server; deploys, DNS, redirects, caching;
anything sent to the client or shown in the client's name; raising the imagery cap;
using a picture of a real person the client has not approved; deleting content or data; choosing
or moving to the real domain.

### Rules

- One session, one unit of work. A stage ends only on the Art Director's written lock, quoted
  into `DECISIONS.md`.
- One direction per presentation. Rendered work, not descriptions.
- Design ends at the lock: the design is a working site in clean code under `design/`; no platform, server or account enters a design session. Adaptation is a separate job after the last lock.
- A lack found in the kit is written to `STATUS.md` under "For the kit" and fixed in the kit's
  own repository, never patched inside this project.
- Commit and push only when the Art Director says so.
