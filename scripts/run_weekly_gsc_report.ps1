$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$logDir = Join-Path $repoRoot '.cache\gsc\logs'
$logPath = Join-Path $logDir "weekly-run-$timestamp.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

Set-Location $repoRoot

function Invoke-Step {
  param(
    [string]$Label,
    [string]$Command,
    [switch]$AllowFailure
  )

  Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Label"
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'

  try {
    cmd /c $Command 2>&1 | Tee-Object -FilePath $logPath -Append
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($LASTEXITCODE -ne 0) {
    if ($AllowFailure) {
      Write-Warning "Command failed but will not stop this run: $Command"
      return
    }

    throw "Command failed: $Command"
  }
}

"ChoiceGuide weekly GSC run started at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logPath -Encoding utf8

Invoke-Step -Label 'Generate detailed GSC report' -Command 'npm run gsc:report'
Invoke-Step -Label 'Generate weekly summary report' -Command 'npm run gsc:weekly'
Invoke-Step -Label 'Generate action summary' -Command 'npm run gsc:actions'
Invoke-Step -Label 'Send weekly email report' -Command 'npm run gsc:email' -AllowFailure

Write-Host "Weekly GSC run completed. Log: $logPath"
"Completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logPath -Append -Encoding utf8
