---
description: Close a studio session — evidence saved, STATUS.md replaced, the lock quoted, commit and push on a yes
---
Follow the `studio` skill, "A session · Closing".

Notes: $ARGUMENTS

1. Evidence: keep the renders, sheets and notes that mattered under
   `design/review/<date>-<stage>/`; delete the rest (stray captures, `.playwright-mcp` output).
   Rounds that were rejected and taught something stay, and are named as evidence only.
2. Replace `STATUS.md` (current state only, under about 2,000 tokens): what is done and locked,
   each with its decision id and label; what the next session does and on which model; what the
   next session must carry from this one in the Art Director's own terms; what is open inside
   the last piece; the open questions.
3. If a lock was given and is not yet in `DECISIONS.md`, record it (`/lock`).
4. Anything found lacking in the kit goes under "For the kit" in `STATUS.md`. It is not patched
   here.
5. Show the list of changed files and a one-line commit message in English. Commit and push only
   on the Art Director's yes.
