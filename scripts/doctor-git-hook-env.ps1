Param(
  [switch]$VerboseOutput
)

$ErrorActionPreference = 'Stop'

function Write-Section {
  Param([string]$Title)
  Write-Host ""
  Write-Host "== $Title =="
}

function Test-ExternalCommand {
  Param(
    [string]$Name,
    [scriptblock]$Command
  )

  try {
    $output = (& $Command 2>&1 | Out-String).Trim()
    return @{
      Name = $Name
      Ok = $true
      Output = $output
    }
  } catch {
    $output = ($_ | Out-String).Trim()
    return @{
      Name = $Name
      Ok = $false
      Output = $output
    }
  }
}

Write-Host "Git Hook Environment Doctor (Windows)"

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
  Write-Host "ERROR: git command not found in PATH."
  exit 2
}

$gitPath = $gitCmd.Source
$gitVersion = (& $gitPath --version 2>&1 | Out-String).Trim()
$hooksPath = (& $gitPath config --get core.hooksPath 2>$null | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($hooksPath)) {
  $hooksPath = "(not set)"
}

$gitRoot = Split-Path (Split-Path $gitPath -Parent) -Parent
$shPath = Join-Path $gitRoot "bin\\sh.exe"
$envPath = Join-Path $gitRoot "usr\\bin\\env.exe"

Write-Section "Git Basic"
Write-Host "git path    : $gitPath"
Write-Host "git version : $gitVersion"
Write-Host "hooksPath   : $hooksPath"
Write-Host "git root    : $gitRoot"

if (-not (Test-Path $shPath)) {
  Write-Host "ERROR: missing sh.exe at $shPath"
  exit 2
}

if (-not (Test-Path $envPath)) {
  Write-Host "ERROR: missing env.exe at $envPath"
  exit 2
}

Write-Section "MSYS Runtime Checks"
$shResult = Test-ExternalCommand "sh" { & $shPath -lc "echo sh_ok" }
$envResult = Test-ExternalCommand "env" { & $envPath $shPath -lc "echo env_ok" }

Write-Host ("sh check  : " + ($(if ($shResult.Ok) { "PASS" } else { "FAIL" })))
Write-Host ("env check : " + ($(if ($envResult.Ok) { "PASS" } else { "FAIL" })))

if ($VerboseOutput -or -not $shResult.Ok) {
  Write-Host ""
  Write-Host "[sh output]"
  Write-Host $shResult.Output
}

if ($VerboseOutput -or -not $envResult.Ok) {
  Write-Host ""
  Write-Host "[env output]"
  Write-Host $envResult.Output
}

$hasProgramFilesGit = Test-Path "C:\\Program Files\\Git\\cmd\\git.exe"
Write-Section "Alternative Git Install"
Write-Host ("C:\\Program Files\\Git present: " + ($(if ($hasProgramFilesGit) { "YES" } else { "NO" })))

Write-Section "Diagnosis"
if ($shResult.Ok -and $envResult.Ok) {
  Write-Host "MSYS runtime works. Husky hooks should be executable."
  exit 0
}

Write-Host "Detected MSYS permission/runtime failure."
Write-Host "This commonly breaks husky pre-commit with Win32 error 5."
Write-Host ""
Write-Host "Recommended actions:"
Write-Host "1) Ensure terminal and IDE use same privilege (all non-admin or all admin)."
Write-Host "2) Reinstall Git for Windows to C:\\Program Files\\Git and update PATH."
Write-Host "3) Add Git binaries to security software allowlist:"
Write-Host "   - Git\\usr\\bin\\env.exe"
Write-Host "   - Git\\usr\\bin\\bash.exe"
Write-Host "   - Git\\usr\\bin\\msys-2.0.dll"
Write-Host "4) Restart terminal/IDE and rerun this doctor script."

exit 1
