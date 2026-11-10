# Connections and toolchain

What the studio needs on a machine, what each thing is for, and what to do when it is missing.
Nothing here is a secret; keys live in the project's git-ignored env file and are never quoted in
a file or a message.

## MCP servers

The kit's plugin declares three servers in its own `.mcp.json`; a project that vendors the kit
declares the same three in its root `.mcp.json`.

| Server | What the studio uses it for | Sign-in |
|---|---|---|
| `playwright` (`@playwright/mcp`) | rendering pages and sheets, screenshots at 390 and 1440, capturing references and competitor sites | none |
| `chrome-devtools` (`chrome-devtools-mcp`) | reading a reference's computed CSS, performance traces on the mid-tier preset, Lighthouse, console and network | none |
| `mobbin` (`https://api.mobbin.com/mcp`) | UX patterns from shipped products (`mobbin-research`) | OAuth on a paid Mobbin plan: `/mcp` in an interactive Claude Code session, then start a new session so the tools load |

The server versions are pinned, so every machine runs the same tools: `chrome-devtools-mcp@1.12.0`
and `@playwright/mcp@0.0.84` (both checked on npm on 2026-11-10). Raising a pin is a kit change:
change both forms below, note it in `CHANGELOG.md`, tag.

Windows form (what the plugin ships in `.mcp.json`):

```json
{
  "mcpServers": {
    "chrome-devtools": { "command": "cmd", "args": ["/c", "npx", "-y", "chrome-devtools-mcp@1.12.0"] },
    "playwright":      { "command": "cmd", "args": ["/c", "npx", "-y", "@playwright/mcp@0.0.84"] },
    "mobbin":          { "type": "http", "url": "https://api.mobbin.com/mcp" }
  }
}
```

macOS and Linux form (`npx` runs directly, without `cmd /c`):

```json
{
  "mcpServers": {
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@1.12.0"] },
    "playwright":      { "command": "npx", "args": ["-y", "@playwright/mcp@0.0.84"] },
    "mobbin":          { "type": "http", "url": "https://api.mobbin.com/mcp" }
  }
}
```

On those systems, declare the servers in the project's own `.mcp.json` in this form and disable
the plugin's copies of the two `npx` servers in `/mcp`.

When a server is missing or not signed in: say which one and what it blocks, and carry on with
what does not need it. Mobbin missing blocks only the UX-pattern pulls; never work around it by
scraping.

The desktop app's own browser pane (or Claude in Chrome) can stand in for Playwright when
looking at a page; it cannot stand in for the scripted captures.

## Image and video generation: fal.ai

- The key is `FAL_AI_API_KEY` (or `FAL_KEY`) in the environment or in the project's
  `.env.local` / `.env`. The tools look in the directory they are run from and its parents.
  `.env.example` in the project shows the name with an empty value.
- The key belongs to the project (or to the Art Director's machine), never to the kit's
  repository.
- Spending is capped by the contract's `**Imagery budget:**` line (`USD <n> per project`,
  `USD <n> per month`, or `none`). The toolkit prices every run and refuses one that would pass
  the cap, dry runs included; every paid call is a line in `design/spend.jsonl`. Raising the cap
  is the Art Director's change to that line.
- The plugin's `fal-guard` hook refuses a direct fal call, or a fal caller written outside the
  toolkit, before it runs.
- Skills: `fal-image` (images: generate, edit, gate), `video-production` (video), and
  `asset-pipeline` (local optimisation, no key needed).

## Local toolchain

| Tool | Used by | Check | Install |
|---|---|---|---|
| Node 18+ (24 used) and npm | every `.mjs` script, Vite, the MCP servers | `node -v` | nodejs.org |
| Playwright with Chromium, resolvable from the project | `visual-review`, `jury`, captures | `npx playwright --version` in the project | `npm i -D playwright` then `npx playwright install chromium` |
| axe-core, resolvable from the project | `jury`, `visual-review` | `node -e "require.resolve('axe-core')"` in the project | `npm i -D axe-core` |
| sharp, resolvable from the project | `asset-pipeline` (images, frame sequences) | `node -e "require.resolve('sharp')"` | `npm i -D sharp` |
| ffmpeg on the PATH | `visual-review` motion contact sheets, `asset-pipeline` video | `ffmpeg -version` | ffmpeg.org, or `winget install Gyan.FFmpeg` |
| Python 3.10+ (3.12 used) | `foundations` and `content-map` scripts | `python --version` | python.org |
| numpy, Pillow, scikit-image | `foundations` scripts (`matte.py`, `contours.py`, `measure_render.py`) | `python -I -c "import numpy, PIL, skimage"` | `python -m pip install numpy pillow scikit-image` |
| git and the GitHub CLI | closing a session with a commit and push | `git --version`, `gh auth status` | git-scm.com, cli.github.com |

The scripts resolve Node packages from the **project**, not from the kit: run them from the
project root. The build's own packages (Vite, GSAP, Lenis) come with the `cinematic-build`
scaffold.

`check-toolchain.ps1` in this skill's `scripts/` reports all of the above in one table.

## The preview server

`.claude/launch.json` in the project carries one entry, `design-preview`, a static server on the
`design/` folder (Python's `http.server` on port 8090, bound to 127.0.0.1). Sheets and the
static build are opened through it in the browser pane. Once the Vite build exists, add its dev
server as a second entry.

## Installing the kit

As a plugin (the normal way), in the project or at user scope:

```
/plugin marketplace add gilrotem/web-studio
/plugin install web-studio@web-studio
```

Pinning a version: add the marketplace at a tag in the project's `.claude/settings.json`
(`extraKnownMarketplaces` with `"ref": "v1.1.0"`), so a project keeps the kit it was born on
until it is upgraded on purpose.

Vendored (when a project must carry the skills in its own repository): from a clone of the kit,
`tools\vendor.ps1 -Target <project path>` copies `skills/`, `commands/` and `hooks/` into the
project's `.claude/`, writes the kit version into `.claude/web-studio.version`, and prints the
`fal-guard` hook block for the project's `.claude/settings.json` (it never edits settings). Vendored and plugin
installs are not combined in one project: the same skill would load twice.
