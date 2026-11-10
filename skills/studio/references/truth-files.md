# Truth files — the design state and the decision entry

Two things carry a design between sessions: the **design state** (where the design stands, what
its next stage is) and the **decision entries** (the Art Director's locks, verbatim).

- **Standalone** (no kernel): the kit's own `STATUS.md` and `DECISIONS.md` at the project root,
  in the formats below.
- **Host mode** (the project's `CLAUDE.md` has a line starting `Kernel: agency-harness`): the
  root `STATUS.md` and `DECISIONS.md` are the kernel's and the kit creates neither. The design
  state is `docs/design/STATE.md` (the template is in the `studio-birth` scaffold). A lock is an
  entry in the kernel's `DECISIONS.md`, in the kernel's format as that file's header shows it:

  ```markdown
  ## D-nnn — label
  <date> · Origin (<owner> / agent, which session) · Status (standing / superseded by D-mmm)
  Ruling: <verbatim>
  Means: <which design lock this is; what it locks, by file and section; what it does not lock; the next stage>
  Reopen if: <the condition under which this comes back>
  Source: <the sheet's path; the session and date>
  ```

  The id is the next free one in that file; the origin carries the question and the sheet, as
  below. Closing the session (status, ledger, commit) is the kernel's close.

One home per fact. Current state replaces; history appends. A number in a file says where it
came from. An id is always written with its label.

## STATUS.md — current state, replaced at every close

Short (aim under about 2,000 tokens): it is read whole at the start of every session.

```markdown
# <project> — status

Last updated <date> (<which session>). Current state only; replace, don't append.

## Where we are
- What exists and what is locked, one bullet per stage, each with its decision id and label
  and the path of the file or sheet it covers.
- What is live and what is not.

## What the next session does
1. The next unit of work, by its name in the plan, with the model it runs on.
2. What the next session must carry from this one: the Art Director's standards and words that
   are not yet in a spec file, the reading of his remarks (what a word of taste turned out to
   mean), what was rejected on the way and is kept as evidence only.
3. What is open inside the last piece ("Not settled here").

## Open questions for the Art Director
- One line each, with what the answer unblocks.

## Facts to carry
- Paths, names and constraints a new session cannot derive from the code.
```

## DECISIONS.md — rulings, append-only

One entry per ruling. The ruling is the Art Director's words, verbatim, in the language he wrote
them. The session writes the rest. An entry is never edited; a change is a new entry that
supersedes it, and the old one gets a status line. An agent's conclusion is recorded with origin
`agent` and stays that way until the Art Director confirms it. Silence is not approval.

```markdown
## D-nnn — label
<date> · Origin: <the Art Director / agent>, <which session>, <to which question, on which sheet> · Status: standing | superseded by D-mmm
Ruling: "<verbatim>"
Means: <what the work does with it; what it locks, by file and section; what it does not lock>
Reopen if: <the condition under which this comes back to the Art Director>
Source: <session and date; the path of the sheet or file>
```

Notes on writing a good entry:

- **Origin carries the question.** "To the question 'Is the colour scheme locked?' on the
  rendered sheet `design/review/<date>-colour/sheet.png` (rev. 2)". When the answer was a button,
  list the options it was chosen from.
- **Means is specific.** Name the files and sections that are now locked, the values that
  matter, and the next step. Say what is *not* locked by this ruling.
- **Reopen-if is honest.** The real conditions: a real-phone pass that fails, a client fact that
  changes the intent, a later foundation that needs something this one does not give.
- **A reopening** is an entry of its own: what was measured, which named part is reopened, what
  stands, and what the next sheet is.
- **A long ruling is quoted whole.** Do not trim the Art Director's sentences to the "relevant"
  part; the part that looked irrelevant is often the instruction for the next stage.

## Quoting rulings elsewhere

A spec file that depends on a ruling quotes it verbatim with its id and label
("D-nnn — the type rule: '...'"), never a paraphrase. The contract has a section "Rulings this
contract stands on" for exactly this.
