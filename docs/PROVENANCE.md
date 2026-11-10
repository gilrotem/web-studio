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

## Third-party packs carried as they were

| Pack | Skills | What the files record |
|---|---|---|
| GSAP | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react`, `gsap-frameworks` | "Official GSAP skill"; `license: MIT` in each frontmatter |
| Web Interface Guidelines | `web-design-guidelines` | `metadata.author: vercel`, version 1.0.0; no licence line |
| Animation craft | `animate`, `animation-performance`, `review-animations` | credit Emil Kowalski's animation and design-engineering philosophy in their text; no licence line |
| three.js | `threejs-shaders`, `threejs-postprocessing`, `threejs-performance`, `threejs-asset-pipeline` | no author or licence line |

The packs without a licence line were not traced to their source repositories during packaging.
That is fine for a private kit and is the open item before this repository could be made public.

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
