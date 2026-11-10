---
description: Close a design session — evidence saved and the design state replaced; in a kernel project the kernel's close does the rest, standalone the kit writes STATUS.md and commits on a yes
---
Follow the `studio` skill, "A session · Closing" and "Host mode".

Notes: $ARGUMENTS

1. Evidence: keep the renders, sheets, juries and notes that mattered under
   `design/review/<date>-<stage>/`; delete the rest (stray captures, `.playwright-mcp` output,
   verify runs that taught nothing). Rejected rounds that taught something stay, named as
   evidence only.
2. If a lock was given and is not yet recorded, record it (`/web-studio:lock`).
3. **Kernel project** (its `CLAUDE.md` has a line starting `Kernel: agency-harness`): replace
   `docs/design/STATE.md` (current state only): the locks with their decision ids and labels, the
   next stage and its model, what the next session must carry in the Art Director's own terms,
   what is open inside the last piece, anything lacking in the kit under "For the kit". Then stop:
   `STATUS.md`, the ledger and the commit are the kernel's close (`/close`). Say so in one line.
4. **Standalone:** replace `STATUS.md` (current state only, under about 2,000 tokens) with the
   same content; anything lacking in the kit goes under "For the kit". Show the list of changed
   files and a one-line commit message in English. Commit and push only on the Art Director's yes.
