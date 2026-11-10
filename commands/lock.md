---
description: Record the Art Director's written lock, verbatim — in the project's DECISIONS.md, or in a kernel project in the kernel's DECISIONS.md in its own entry format
---
Follow the `studio` skill, "The lock" and "Host mode", and its `references/truth-files.md`.

What was locked: $ARGUMENTS

Only when the Art Director has answered in writing in this session; silence or "looks fine" is
not a lock, and this command never invents one.

1. **Find where it goes.** A kernel project (its `CLAUDE.md` has a line starting
   `Kernel: agency-harness`): the kernel's `DECISIONS.md`, in the kernel's entry format as that
   file's header shows it, with the kernel's word for the owner in the origin. Otherwise: the
   project's `DECISIONS.md`. Never create a second decisions file.
2. **Append one entry**: the next free id in that file and a label; the date; the origin (the
   owner, this session, to which question, on which sheet and revision; the options if it was a
   button); the ruling verbatim and whole; what it means (which of the job's fixed locks this is,
   the files and sections now locked, the values that matter, what is NOT locked by it, the next
   stage); the reopen condition; the source (the sheet's path). Lock 1 also quotes the birth
   answers it stands on.
3. If it supersedes or reopens an earlier entry, add a status line to that entry; change nothing
   else in it.
4. Mark the spec sections the lock covers ("locked D-nnn, date") and only now write their tokens.
5. Move the design state: the lock's row and the next stage in `docs/design/STATE.md` (kernel
   project) or in `STATUS.md` (standalone, at close).
6. Report the entry back in three lines. Do not commit; closing the session is `/web-studio:close`
   (and in a kernel project, the kernel's close).
