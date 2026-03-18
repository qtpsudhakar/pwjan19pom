[CmdletBinding()]
param(
    [string]$ImageTag = "v1.58.2-noble",
    [string]$TestArgs = ""
)

$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot ".."))
$image = "mcr.microsoft.com/playwright:$ImageTag"

Write-Host "Using Docker image: $image"
Write-Host "Workspace mount: $($workspace.Path) -> /work"

# --init and --ipc=host follow Playwright's recommended Docker configuration.
docker run --rm --init --ipc=host `
  -e CI=1 `
  -e PW_HEADLESS=true `
  -v "$($workspace.Path):/work" `
  -w /work `
  $image `
  /bin/bash -lc "npm ci && npx playwright test $TestArgs"
