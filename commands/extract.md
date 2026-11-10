---
description: Convert reference images (Mobbin MCP / screenshots / video frames) into spec files
---
Follow the extraction-protocol skill exactly.

Target: $ARGUMENTS (a Mobbin search query, a path under references/source/, or "all").

1. If given a Mobbin query — search via Mobbin MCP, show the Art Director the candidate screens, and wait for selection before extracting.
2. Run PASS 1 on all selected references → spec/design-system.json.
3. Run PASS 2 per section → spec/sections/NN-name.json.
4. Finish with one compact block listing every null field for the Art Director to decide.
Do not write any component code in this session. Note: extraction is mandatory in PORT mode, partial (pattern-level) in REDESIGN, and usually skipped in PAGE/SITE/SYSTEM — confirm the mode before running.
