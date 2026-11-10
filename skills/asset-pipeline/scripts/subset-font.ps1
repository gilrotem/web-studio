param(
  [Parameter(Mandatory)][string]$In,
  [Parameter(Mandatory)][string]$Out,
  [string]$Unicodes = "U+0590-05FF,U+FB1D-FB4F,U+0020-007E,U+00A0,U+20AA,U+2013,U+2014,U+2026,U+00AB,U+00BB,U+201C,U+201D"
)
# Hebrew + Basic Latin + shekel + punctuation subset to WOFF2, keeping all layout features and variable axes.
pyftsubset $In --unicodes="$Unicodes" --layout-features='*' --flavor=woff2 --output-file=$Out --no-hinting --desubroutinize
if ($LASTEXITCODE -eq 0) { Get-Item $Out | Select-Object Name, @{n='KB';e={[math]::Round($_.Length/1KB,1)}} }
