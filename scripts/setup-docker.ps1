param(
  [switch]$RebuildLabs
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dbComposeFile = Join-Path $repoRoot 'backend\src\config\docker-compose.yml'
$dbProjectDir = Split-Path -Parent $dbComposeFile
$labNetwork = 'diploma_network'

$baseImages = @(
  'mysql:8.0',
  'node:18-alpine',
  'php:8.2-apache'
)

$labs = @(
  @{ Tag = 'sqli-auth-bypass'; Context = 'labs\src\SQL-INJECTION\sqli-auth-bypass'; Dockerfile = 'labs\src\SQL-INJECTION\sqli-auth-bypass\dockerfile' },
  @{ Tag = 'sqli-blind'; Context = 'labs\src\SQL-INJECTION\sqli-blind'; Dockerfile = 'labs\src\SQL-INJECTION\sqli-blind\dockerfile' },
  @{ Tag = 'sqli-union'; Context = 'labs\src\SQL-INJECTION\union-select'; Dockerfile = 'labs\src\SQL-INJECTION\union-select\dockerfile' },
  @{ Tag = 'hidden-data'; Context = 'labs\src\SQL-INJECTION\hidden-data'; Dockerfile = 'labs\src\SQL-INJECTION\hidden-data\dockerfile' },
  @{ Tag = 'union-2'; Context = 'labs\src\SQL-INJECTION\union-select-2'; Dockerfile = 'labs\src\SQL-INJECTION\union-select-2\dockerfile' },
  @{ Tag = 'rce-simple'; Context = 'labs\src\RCE\command-injection-simple'; Dockerfile = 'labs\src\RCE\command-injection-simple\dockerfile' },
  @{ Tag = 'rce-redirection'; Context = 'labs\src\RCE\rce-output-redirection'; Dockerfile = 'labs\src\RCE\rce-output-redirection\Dockerfile' },
  @{ Tag = 'rce-time-delays'; Context = 'labs\src\RCE\rce-time-delays'; Dockerfile = 'labs\src\RCE\rce-time-delays\Dockerfile' },
  @{ Tag = 'path-traversal-simple'; Context = 'labs\src\path\path-traversal-simple'; Dockerfile = 'labs\src\path\path-traversal-simple\dockerfile' },
  @{ Tag = 'path-traversal-absolute'; Context = 'labs\src\path\path-traversal-absolute'; Dockerfile = 'labs\src\path\path-traversal-absolute\dockerfile' },
  @{ Tag = 'path-traversal-bypass'; Context = 'labs\src\path\path-traversal-bypass'; Dockerfile = 'labs\src\path\path-traversal-bypass\dockerfile' },
  @{ Tag = 'ssti-simple'; Context = 'labs\src\ssti\ssti-simple'; Dockerfile = 'labs\src\ssti\ssti-simple\dockerfile' },
  @{ Tag = 'ssti-read'; Context = 'labs\src\ssti\ssti-bypass'; Dockerfile = 'labs\src\ssti\ssti-bypass\dockerfile' },
  @{ Tag = 'ssti-rce'; Context = 'labs\src\ssti\ssti-rce'; Dockerfile = 'labs\src\ssti\ssti-rce\dockerfile' }
)

function Assert-Success([string]$Message) {
  if ($LASTEXITCODE -ne 0) {
    throw $Message
  }
}

function Test-DockerImage([string]$ImageName) {
  cmd /c "docker image inspect $ImageName >nul 2>nul"
  return $LASTEXITCODE -eq 0
}

function Ensure-DockerDaemon() {
  Write-Host '[+] Checking Docker daemon...'
  cmd /c "docker version >nul 2>nul"
  Assert-Success 'Docker daemon is not available. Start Docker Desktop and rerun this script.'
}

function Ensure-RemoteImage([string]$ImageName) {
  if (Test-DockerImage $ImageName) {
    Write-Host "[ok] Base image '$ImageName' is already present."
    return
  }

  Write-Host "[+] Pulling base image '$ImageName'..."
  docker pull $ImageName
  Assert-Success "Failed to pull base image '$ImageName'."
}

function Ensure-DockerNetwork([string]$NetworkName) {
  cmd /c "docker network inspect $NetworkName >nul 2>nul"
  if ($LASTEXITCODE -eq 0) {
    Write-Host "[ok] Docker network '$NetworkName' already exists."
    return
  }

  Write-Host "[+] Creating Docker network '$NetworkName'..."
  docker network create $NetworkName > $null
  Assert-Success "Failed to create Docker network '$NetworkName'."
}

function Ensure-DatabaseService() {
  Write-Host '[+] Starting MySQL service from backend compose...'
  docker compose -f $dbComposeFile --project-directory $dbProjectDir up -d --pull missing db
  Assert-Success 'Failed to start the MySQL service.'
}

function Ensure-LabImage([hashtable]$Lab) {
  $tag = $Lab.Tag
  if (-not $RebuildLabs -and (Test-DockerImage $tag)) {
    Write-Host "[ok] Lab image '$tag' already exists."
    return
  }

  $contextPath = Join-Path $repoRoot $Lab.Context
  $dockerfilePath = Join-Path $repoRoot $Lab.Dockerfile

  Write-Host "[+] Building lab image '$tag'..."
  docker build -t $tag -f $dockerfilePath $contextPath
  Assert-Success "Failed to build lab image '$tag'."
}

Ensure-DockerDaemon

foreach ($image in $baseImages) {
  Ensure-RemoteImage $image
}

Ensure-DockerNetwork $labNetwork
Ensure-DatabaseService

foreach ($lab in $labs) {
  Ensure-LabImage $lab
}

Write-Host ''
Write-Host '[done] Docker setup finished.'
Write-Host '[next] Start backend:  cd backend; node index.js'
Write-Host '[next] Start frontend: cd frontend; npm run dev'
