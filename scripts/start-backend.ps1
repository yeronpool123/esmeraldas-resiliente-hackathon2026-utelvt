$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'

if (-not (Test-Path (Join-Path $projectRoot '.env'))) {
  throw 'No se encontró .env. Configura primero las variables locales.'
}

Push-Location $backendPath
try {
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  if ($LASTEXITCODE -ne 0) {
    throw "FastAPI terminó con código $LASTEXITCODE. Revisa los errores de conexión a PostgreSQL/PostGIS mostrados arriba."
  }
} finally {
  Pop-Location
}
