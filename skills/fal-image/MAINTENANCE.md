# fal-image — state and next review

The durable record of the image pipeline: what is built, what was **measured**
rather than assumed, what is deliberately left open, and what the next review
should re-check. **Next review: around December 2026.**

## What exists

| File | What it is |
|---|---|
| `fal.mjs` | The core: endpoints, request shapes, billing geometry, credentials, the cap, the two ledgers, the queue call. Nothing else talks to fal. |
| `routes.mjs` | The job classes, as data. `--routes` prints them with reasons. |
| `generate.mjs` / `edit.mjs` | The two entry points. |
| `batch.mjs` | Runs a whole round from `prompts.json`; prices it whole against the cap first; spawns the two tools, never re-implements them. |
| `gate.mjs` | The optional pre-filter. A cheap vision model names defects; this file decides the verdict. |
| `sheet.py` | Contact sheet and downscaled review copies. Local, free. |
| `selftest.mjs` | The cap parser, the spend ledger and every refusal path, against a throwaway project, with no network. |
| `PROTOCOL.md` | The generation law: flow, prompt grammar, sizes, cost discipline. |
| `../../hooks/fal-guard.mjs` | Enforcement, shipped as the plugin's PreToolUse hook. Refuses a direct fal call outside this directory. |

## What was measured, not assumed

All from fal's own `x-fal-billable-units` response header, 2026-09-20/21. A
normal model key is enough; no admin key is needed.

- **The price step is at 2,359,296 px and the threshold is inclusive.**
  2048x1152 bills 1 unit. 2048x1160 bills 2. Eight pixels of height double it.
- **There is no third tier.** 2816x1584 and even 3072x3072 still bill 2 units.
- **The documented 2048x2048 ceiling is not enforced**: Pro accepted 9.4 MP.
- **Lite bills a flat 1 unit at any size**, including 9.4 MP, where Pro bills 2.
- **The edit fix is worth exactly 50%.** The same edit of the same 2048x1152
  source billed 2 units with no `image_size` and 1 unit with it pinned.
- **Seedream never returns a seed.** A frame generated without an explicit seed
  is unreproducible, so `generate.mjs` mints one and logs it.
- **Review cost**: the API shrinks anything whose longest side exceeds ~1568 px
  before billing, so 2048x1152 arrives as ~1568x882. Dropping to 1024 saves
  about 2x, not 4x. On 50 real files: 67k tokens against 115k.
- **A 50-cell contact sheet costs ~1,550 tokens but each cell arrives ~145 px.**
  Triage only. Fine detail is judged from `_review/` at 1024.

## Rulings that came out of testing

- **Gate batching stays at 4.** `--batch 4` lost no detection, while `--batch 1`
  produced a false positive (it invented readable text on a blank panel the
  prompt mentioned). Batch 4 is also 3x cheaper.
- **Lettering flags, it does not fail.** Fatal defects are anatomy, missing
  subject, wrong count and artefact. Lettering, brand marks and an occupied zone
  are removed by one edit pass.
- **The model detects, the code decides.** Asking the vision model for the
  verdict gave three different answers on three runs of the same images.
- **Standing gate rules are per project.** A stylised world bans lettering
  outright; a photoreal car carries a plate. Tune `design/gate.config.json` after
  a first `--dry` run on a round already judged by eye, never up front.
- **FLUX 1.1 pro ultra was retired as the default**: 892 Elo against Seedream 5
  Pro's 1078 at about the same price. It stays as `material`, for photography a
  project's own bake-off chose it for.
- **Stay on fal and Seedream 5 Pro; cut the candidate pile, not the price.** A
  reseller's lower price (2026-09) was a promotion covering only 1K/1.5K output;
  at 2K the hosts cost the same.

## Ported into the kit (1.1.0, 2026-11-10)

From the studio folder this toolkit was born in: the queue call, the measured
cost from fal's meter, the `material`, `vector`, `plate-edit` and `fill` routes,
`batch.mjs`, `sheet.py`, the per-project gate config, this file and the
protocol. Added in the kit: the key looked up from the project (not from a fixed
path), the enforced cap read from the contract, the project spend ledger, and
the selftest. The research reports behind the model choices stayed in the old
studio folder; their conclusions are the rulings above.

## Deliberately open

- **birefnet's rate cannot be measured**: its responses carry no billable-units
  header. It is the one price still taken on trust.
- **The guard is not airtight, by construction.** It refuses writing a fal
  caller, ad-hoc `curl` / `node -e` / `python -c` calls, and executing a script
  that contains a fal endpoint when it can resolve that script's path. A caller
  that builds the URL from pieces at runtime would pass. The ledger is the
  backstop: images with no `runs.jsonl` beside them went around it.
- **There is no video route.** Video generation through fal would be refused by
  the guard; a video route (with its cap check) is a kit change still to make.
- **The cap trusts the ledger.** Deleting `design/spend.jsonl` resets the count;
  the file is committed with the project, so git keeps the history.

## The next round, around December 2026

1. **Re-check the prices.** `MODELS` in `fal.mjs` carries rates read on
   2026-09-21. Re-read them, update, and re-run the boundary probe (2048x1152
   and 2048x1160) through the toolkit, never as a `node -e` one-liner.
2. **Re-check the model landscape.** Is anything now clearly better than
   Seedream 5 Pro for stylised 3D with a recurring cast, and for photoreal
   editorial, at comparable cost? Switching family re-derives every anchor, so
   the bar is high.
3. **Audit the ledgers.** Sum `design/spend.jsonl` per project and per model.
4. **Check for bypasses**: new images with no `runs.jsonl` beside them.
5. **Tune the gate** where a project has run rounds on the defaults.
