# Reports the studio's toolchain and connections for the project in the current directory.
# Read-only: it installs nothing and prints no secret (a key is reported as present or missing).
#   powershell -ExecutionPolicy Bypass -File check-toolchain.ps1 [-Project <path>]
param([string]$Project = (Get-Location).Path)

$rows = New-Object System.Collections.Generic.List[object]
function Add-Row($name, $ok, $detail, $fix) {
  $rows.Add([pscustomobject]@{ Item = $name; State = $(if ($ok) { 'present' } else { 'MISSING' }); Detail = $detail; Fix = $(if ($ok) { '' } else { $fix }) })
}
function Try-Run($exe, $argList) {
  try {
    $cmd = Get-Command $exe -ErrorAction Stop
    $out = & $cmd.Source @argList 2>$null | Select-Object -First 1
    if ($LASTEXITCODE -ne 0 -and -not $out) { return $null }
    return "$out"
  } catch { return $null }
}

Push-Location $Project
try {
  $v = Try-Run 'node' @('-v');            Add-Row 'Node' ([bool]$v) $v 'install Node 18+ from nodejs.org'
  $v = Try-Run 'npm' @('-v');             Add-Row 'npm' ([bool]$v) $v 'comes with Node'
  $v = Try-Run 'python' @('--version');   Add-Row 'Python' ([bool]$v) $v 'install Python 3.10+ from python.org'
  $v = Try-Run 'python' @('-I', '-c', "import numpy, PIL, skimage; print('numpy', numpy.__version__, 'Pillow', PIL.__version__, 'scikit-image', skimage.__version__)")
  Add-Row 'Python imaging (numpy, Pillow, scikit-image)' ([bool]$v) $v 'python -m pip install numpy pillow scikit-image'
  $v = Try-Run 'ffmpeg' @('-version');    Add-Row 'ffmpeg' ([bool]$v) $(if ($v) { ($v -split ' ')[0..2] -join ' ' }) 'install ffmpeg and put it on the PATH'
  $v = Try-Run 'git' @('--version');      Add-Row 'git' ([bool]$v) $v 'install git'
  $v = Try-Run 'gh' @('--version');       Add-Row 'GitHub CLI' ([bool]$v) $v 'install gh from cli.github.com (needed only to create or push a repository)'

  foreach ($pkg in 'playwright', 'axe-core', 'sharp') {
    $v = Try-Run 'node' @('-e', "try{console.log(require('$pkg/package.json').version)}catch(e){process.exit(1)}")
    Add-Row "npm package '$pkg' (resolved from the project)" ([bool]$v) $v "npm i -D $pkg   (run in the project)"
  }

  $keyState = $false; $keyWhere = ''
  foreach ($n in 'FAL_AI_API_KEY', 'FAL_KEY') { if ([Environment]::GetEnvironmentVariable($n)) { $keyState = $true; $keyWhere = "environment ($n)" } }
  if (-not $keyState) {
    $dir = (Get-Location).Path
    while ($dir -and -not $keyState) {
      foreach ($f in '.env.local', '.env') {
        $p = Join-Path $dir $f
        if ((Test-Path $p) -and (Select-String -Path $p -Pattern '^\s*(FAL_AI_API_KEY|FAL_KEY)\s*=\s*\S' -Quiet)) { $keyState = $true; $keyWhere = "$f in $dir" }
      }
      $parent = Split-Path $dir -Parent
      if ($parent -eq $dir) { break }
      $dir = $parent
    }
  }
  Add-Row 'fal.ai key' $keyState $keyWhere 'put FAL_KEY=... in the project''s git-ignored .env.local (only needed for image and video generation)'

  $mcp = @()
  if (Test-Path '.mcp.json') { try { $mcp = (Get-Content '.mcp.json' -Raw | ConvertFrom-Json).mcpServers.PSObject.Properties.Name } catch {} }
  foreach ($s in 'playwright', 'chrome-devtools', 'mobbin') {
    $inProject = $mcp -contains $s
    Add-Row "MCP server '$s'" $true $(if ($inProject) { 'declared in the project .mcp.json' } else { 'not in the project .mcp.json (fine when the web-studio plugin supplies it; check /mcp)' }) ''
  }

  $hostMode = (Test-Path 'CLAUDE.md') -and (Select-String -Path 'CLAUDE.md' -Pattern '^Kernel: agency-harness' -Quiet)
  Add-Row 'Mode' $true $(if ($hostMode) { 'host mode: a kernel project (truth files are the kernel''s)' } else { 'standalone' }) ''
  Add-Row 'design/spec/contract.md' (Test-Path 'design/spec/contract.md') '' 'run the studio-birth skill'
  if ($hostMode) {
    Add-Row 'docs/design/STATE.md (the design state)' (Test-Path 'docs/design/STATE.md') '' 'run the studio-birth skill'
  } else {
    Add-Row 'STATUS.md' (Test-Path 'STATUS.md') '' 'run the studio-birth skill'
    Add-Row 'DECISIONS.md' (Test-Path 'DECISIONS.md') '' 'run the studio-birth skill'
  }
  if (Test-Path 'design/spec/contract.md') {
    $cap = Select-String -Path 'design/spec/contract.md' -Pattern '^\*\*Imagery budget:\*\*\s*(.*)$' | Select-Object -First 1
    $capSet = $cap -and ($cap.Matches[0].Groups[1].Value -replace '`', '' -replace '\(.*$', '').Trim() -notmatch '^(null)?$'
    Add-Row 'Imagery cap (contract line)' $capSet $(if ($cap) { ($cap.Matches[0].Groups[1].Value -replace '\(.*$', '').Trim() }) 'set "**Imagery budget:** USD <n> per project" (or per month, or none) in the contract; the image toolkit refuses paid runs without it'
  }
} finally { Pop-Location }

"Studio toolchain check: $Project"
$rows | Format-Table -AutoSize -Wrap | Out-String -Width 200
$missing = @($rows | Where-Object { $_.State -eq 'MISSING' })
"{0} present, {1} missing" -f ($rows.Count - $missing.Count), $missing.Count
"Mobbin needs an OAuth sign-in through /mcp; this script cannot see whether it is signed in."
