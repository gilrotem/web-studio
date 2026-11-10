# Copies the kit into a project's own repository, for a project that must carry its skills with it
# (a machine or an account where the plugin cannot be installed).
#
#   powershell -ExecutionPolicy Bypass -File tools\vendor.ps1 -Target C:\path\to\project [-Force] [-WithMcp]
#
# Copies skills\ -> <project>\.claude\skills\, commands\ -> <project>\.claude\commands\ and
# hooks\ -> <project>\.claude\hooks\, and writes the kit version and commit into
# <project>\.claude\web-studio.version. It prints the fal-guard hook block for the project's
# .claude\settings.json; adding it there is the project's own step.
# Without -Force it refuses to replace a skill or command that already exists in the project and
# lists the collisions. With -WithMcp it also writes the three MCP servers into the project's
# .mcp.json when the project has none (it never edits an existing .mcp.json).
#
# Do not vendor into a project that also has the web-studio plugin enabled: every skill would
# load twice. This script does not touch the project's CLAUDE.md, settings or git.
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [switch]$Force,
  [switch]$WithMcp
)

$ErrorActionPreference = 'Stop'
$kit = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path $Target)) { throw "Target does not exist: $Target" }
$Target = (Resolve-Path $Target).Path
$claude = Join-Path $Target '.claude'

$plan = @(
  @{ From = Join-Path $kit 'skills';   To = Join-Path $claude 'skills';   Kind = 'dir'  },
  @{ From = Join-Path $kit 'commands'; To = Join-Path $claude 'commands'; Kind = 'file' },
  @{ From = Join-Path $kit 'hooks';    To = Join-Path $claude 'hooks';    Kind = 'file' }
)

$collisions = @()
foreach ($p in $plan) {
  foreach ($item in Get-ChildItem $p.From) {
    $dest = Join-Path $p.To $item.Name
    if (Test-Path $dest) { $collisions += $dest }
  }
}
if ($collisions.Count -gt 0 -and -not $Force) {
  "These already exist in the project. Nothing was copied. Re-run with -Force to replace them:"
  $collisions | ForEach-Object { "  $_" }
  exit 1
}

foreach ($p in $plan) {
  New-Item -ItemType Directory -Force -Path $p.To | Out-Null
  foreach ($item in Get-ChildItem $p.From) {
    $dest = Join-Path $p.To $item.Name
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $item.FullName $dest -Recurse -Force
  }
}
Get-ChildItem $claude -Recurse -Directory -Filter '__pycache__' | Remove-Item -Recurse -Force

$version = (Get-Content (Join-Path $kit '.claude-plugin\plugin.json') -Raw | ConvertFrom-Json).version
$commit = ''
try { $commit = (& git -C $kit rev-parse --short HEAD 2>$null) } catch {}
$stamp = "web-studio $version" + $(if ($commit) { " ($commit)" } else { '' }) + ", vendored $(Get-Date -Format 'yyyy-MM-dd')"
[System.IO.File]::WriteAllText((Join-Path $claude 'web-studio.version'), $stamp + "`n", (New-Object System.Text.UTF8Encoding $false))

if ($WithMcp) {
  $mcp = Join-Path $Target '.mcp.json'
  if (Test-Path $mcp) { "Kept the project's existing .mcp.json; compare it with the kit's by hand." }
  else { Copy-Item (Join-Path $kit '.mcp.json') $mcp; "Wrote .mcp.json (Playwright, Chrome DevTools, Mobbin)." }
}

$skills = (Get-ChildItem (Join-Path $claude 'skills') -Directory).Count
$commands = (Get-ChildItem (Join-Path $claude 'commands') -File).Count
"Vendored $stamp into $claude : $skills skills, $commands commands, the fal-guard hook."
""
"The fal-guard hook is active only once the project's .claude\settings.json carries this block (merge it under ""hooks""; this script does not edit settings):"
'  "PreToolUse": [ { "matcher": "Bash|Write|Edit|MultiEdit",'
'    "hooks": [ { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/fal-guard.mjs\"", "timeout": 10 } ] } ]'
""
"Next: in the project, run the studio-birth skill (it lays down the templates and checks the toolchain), and record the kit version in the design state."
