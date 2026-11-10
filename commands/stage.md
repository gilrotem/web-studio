---
description: Run the next design stage (or the one named) — one stage, built straight through from its locked inputs to one presentation and the lock
---
Follow the `studio` skill.

Stage or task: $ARGUMENTS (empty = the next stage named in the design state)

1. Read the design state: `docs/design/STATE.md` in a kernel project (its `CLAUDE.md` has a line
   starting `Kernel: agency-harness`), otherwise `STATUS.md`. Then the stage in
   `docs/design/PLAN.md` and the rulings that bind it. Say in two lines which stage this is,
   which lock it ends on, which model the plan names for it, and what done looks like. If the
   session's model does not match the plan (the one model rule in the `studio` skill), say so
   before starting.
2. Check the stage's inputs are locked. If one is not, stop and say which.
3. Load only this stage's skills (the `studio` skill's stage tables name them).
4. Build straight through: ask the Art Director nothing (birth asked); what the files cannot
   settle goes to "Not settled" for the lock. Review privately, then the jury (a critic that did
   not build the piece) where the piece is rendered.
5. Present once, with one closing question that names the lock's scope and says what it does not
   cover. Do not settle anything outside the stage on the way.
