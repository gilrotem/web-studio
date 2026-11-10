# Provenance

Where each part of the kit came from, as far as the files themselves record it. Packaged on
2026-11-10 out of a working project in which the studio had been vendored and extended; every
project-specific fact was removed and the client's material was left behind.

## Written for this kit (2026-11-10)

From the method and the practice of that project, generalised:

- `skills/studio/` and its references (the method, the practices, the plan template, the
  definition of done, the truth-file formats, the session briefs).
- `skills/studio-birth/` with its scaffold, connections guide and toolchain check.
- `skills/site-architecture/`, `skills/foundations/` (its `colour.py`, `matte.py` and
  `contours.py` are ported from the scripts that made a locked hero and its colour sheet;
  `measure_render.py` is new).
- `skills/content-map/` (the method documented from the project's content stage; the scripts are
  rewritten as config-driven tools from the project's two hard-coded ones).
- `skills/video-production/` (from a brand-video pack: its structure became templates, its
  fal.ai pipeline was carried with the subject replaced by slots and one invented, labelled
  example; the Hebrew research document is carried unchanged).
- `skills/craft-research/SKILL.md` (the index; the research itself is listed below).
- `commands/birth.md`, `stage.md`, `lock.md`, `close.md`, `screen-audit.md`, `pull-app.md`.
- `tools/vendor.ps1`.

## Carried from the studio's earlier kits

- From `gilrotem/design-studio-kit` (MIT, © 2026 Gil Rotem; notice in
  `docs/licences/design-studio-kit-MIT.txt`): `signature`, `mode-site`, `mode-page`,
  `visual-verify`, `landing-pages`, `extraction-protocol`, `mobbin-research`, `tweaks-bar`, and
  the commands `site`, `page`, `verify`, `inspire`, `extract`.
- From the November 2026 studio: `studio-research`, `studio-art-direction`, `motion-language`,
  `cinematic-build`, `visual-review`, `hebrew-rtl-israel`, `jury`, `fal-image`, `asset-pipeline`,
  `webgl-atmosphere`.
- `wp-theme` was written on 2026-11-09 from the state-of-the-craft research.

Edits made while packaging: the owner's name became "the Art Director"; "silo" and "kernel"
wording became the project and the `studio` skill; paths to a research folder became the
`craft-research` skill; `fal-image` now finds its key in the project it is run from (the
directory and its parents) instead of three levels above its own file, and gained a "Money"
section; `wp-theme` gained the conversion order and a generalised hosting section; the
regulated-profession lines in `hebrew-rtl-israel` were widened from one profession to any.

## Ported from the old studio folder (1.1.0, 2026-11-10)

From the studio folder the kit grew out of, compared file by file first, and taken only where
the old version had what the kit had lost. Client names were replaced by what the client was
(an institutional site, a retail site), and no machine path was carried.

- `skills/fal-image/`: the queue-based core with fal's metered cost, the `material`, `vector`,
  `plate-edit` and `fill` routes, `batch.mjs`, `sheet.py`, the per-project gate config,
  `PROTOCOL.md` and `MAINTENANCE.md`. New in the kit: the key found from the project, the
  enforced imagery cap, the spend ledger, `selftest.mjs`.
- `hooks/fal-guard.mjs`, shipped as the plugin's PreToolUse hook (`hooks/hooks.json`).
- `skills/visual-verify/scripts/`: the render harness's settle, identity and evidence checks and
  its measured audit (contrast computed and sampled from pixels, body size, line length,
  gradient text, RTL ranges), with its 28-check selftest and fixture. The sheet, pass ledger and
  extract commands were not ported.
- `skills/system-packs/`: the canon, four packs (two renamed after their register), the
  generator and checker, the CLI, the measured Hebrew font table, the specimen and the selftest.
  The archived rhythm session and the generated proofs were not carried.
- `skills/signature/`: the canon's line-height numbers (display 1.0–1.25, reading 1.5–1.8).

## Written for 1.1.0

- `skills/redesign-review/` and the scaffold's `docs/design/STATE.md` (host mode).
- `skills/web-design-guidelines/references/guidelines-2026-11-10.md`: a dated snapshot of
  `command.md` from vercel-labs/web-interface-guidelines (MIT), in place of a run-time fetch.

## Third-party packs carried as they were

Each was traced to its source repository on 2026-11-10 (the skill folders were found there by
name) and its licence read from that repository. The notices are in `docs/licences/`.

| Pack | Skills | Source | Licence |
|---|---|---|---|
| GSAP | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react`, `gsap-frameworks` | https://github.com/greensock/gsap-skills | MIT, © 2026 GreenSock (`gsap-skills-MIT.txt`) |
| three.js | `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`, `threejs-asset-pipeline` | https://github.com/CloudAI-X/threejs-skills | MIT, © 2026 CloudAI-X (`threejs-skills-MIT.txt`) |
| Animation craft | `animate`, `animation-performance`, `review-animations` | https://github.com/emilkowalski/skill | MIT, © 2026 Emil Kowalski (`emilkowalski-skill-MIT.txt`) |
| Web Interface Guidelines | `web-design-guidelines` | https://github.com/vercel-labs/agent-skills | MIT per that repository's README (it ships no licence file). The guidelines are carried as a dated snapshot of https://github.com/vercel-labs/web-interface-guidelines, MIT, © 2025 Vercel Labs (`vercel-web-interface-guidelines-MIT.txt`) |

These skills are here as they were carried into the project the kit was packaged from. They were
not diffed against the current upstream, so they may be older than the source; for the latest
version install from the source repositories.

## The research

`skills/craft-research/web-design-craft-bar-2026-11/`: one report and five notes, researched on
2026-11-09, carried in full (1,309 lines). Wording that referred to the commissioning engagement
was generalised in 34 lines; no source, number, date or finding was removed. Its real-estate
appraiser passages are kept and labelled as the worked example of a regulated profession. Its
reads of real public websites are research evidence and keep their URLs.

`skills/video-production/references/ai-motion-video-production-research.md`: a Hebrew research
document on an AI motion-video production system, carried byte for byte.

## Left out on purpose

- Everything of the project the kit was packaged from: its contract, tokens, decisions,
  architecture, content, client files, reference captures, review sheets and video concept.
- From the earlier kits: the PORT, REDESIGN and SYSTEM mode skills, `wide-gen` (options rounds),
  `studio-roles` (another project's role split), `ship` (static deploy), and the second taste
  systems `impeccable`, `ui-designer` and `frontend-design`. `signature` is the one taste.
- The agency harness (session brief, board, roles, live-write guards). This kit stands without
  it and carries its own minimal truth-file formats; a project that runs under that harness
  keeps the harness's formats.
