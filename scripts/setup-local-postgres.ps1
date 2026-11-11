$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
$psqlPath = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
$hostName = '127.0.0.1'
$port = 5432

if (-not (Test-Path $envPath)) {
  throw 'No se encontró .env. Créalo copiando .env.example y configura las variables requeridas.'
}
if (-not (Test-Path $psqlPath)) {
  $psqlCommand = Get-Command psql -ErrorAction SilentlyContinue
  if ($null -eq $psqlCommand) {
    throw 'No se encontró psql. Instala el cliente de PostgreSQL 18 o agrega su carpeta bin al PATH.'
  }
  $psqlPath = $psqlCommand.Source
}

$settings = @{}
Get-Content $envPath | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $settings[$matches[1].Trim()] = $matches[2].Trim()
  }
}

foreach ($key in @('POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD')) {
  if ([string]::IsNullOrWhiteSpace($settings[$key])) {
    throw "Falta configurar $key en .env."
  }
}

$databaseName = $settings['POSTGRES_DB']
$appUser = $settings['POSTGRES_USER']
$appPassword = $settings['POSTGRES_PASSWORD']
foreach ($identifier in @($databaseName, $appUser)) {
  if ($identifier -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') {
    throw 'POSTGRES_DB y POSTGRES_USER deben ser identificadores SQL simples.'
  }
}
if ($appPassword -match 'CAMBIAR|REEMPLAZAR') {
  throw 'Configura POSTGRES_PASSWORD en .env antes de continuar.'
}

$adminUser = Read-Host 'Usuario administrador de PostgreSQL (normalmente postgres)'
$adminPassword = Read-Host 'Contraseña de ese usuario (no se mostrará)' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
try {
  $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}

function Invoke-Psql {
  param(
    [string]$Database,
    [string]$UserName,
    [string[]]$Arguments
  )

  if ([string]::IsNullOrWhiteSpace($UserName)) {
    $UserName = $adminUser
  }
  & $psqlPath -w -h $hostName -p $port -U $UserName -d $Database -v ON_ERROR_STOP=1 @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "psql terminó con código $LASTEXITCODE al conectar con la base '$Database'."
  }
}

try {
  $availablePostgis = (Invoke-Psql -Database 'postgres' -Arguments @('-Atc', "SELECT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'postgis')")) -join ''
  if ($availablePostgis.Trim() -ne 't') {
    throw 'PostGIS no está instalado para PostgreSQL 18. Instálalo con Stack Builder y vuelve a ejecutar este script.'
  }

  $escapedAppPassword = $appPassword.Replace("'", "''")
  $roleExists = (Invoke-Psql -Database 'postgres' -Arguments @('-Atc', "SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$appUser')")) -join ''
  if ($roleExists.Trim() -eq 't') {
    Invoke-Psql -Database 'postgres' -Arguments @('-c', "ALTER ROLE `"$appUser`" WITH LOGIN PASSWORD '$escapedAppPassword'")
  } else {
    Invoke-Psql -Database 'postgres' -Arguments @('-c', "CREATE ROLE `"$appUser`" WITH LOGIN PASSWORD '$escapedAppPassword'")
  }

  $databaseExists = (Invoke-Psql -Database 'postgres' -Arguments @('-Atc', "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$databaseName')")) -join ''
  if ($databaseExists.Trim() -ne 't') {
    Invoke-Psql -Database 'postgres' -Arguments @('-c', "CREATE DATABASE `"$databaseName`" OWNER `"$appUser`"")
  }

  Invoke-Psql -Database $databaseName -Arguments @('-c', 'CREATE EXTENSION IF NOT EXISTS postgis')

  $env:PGPASSWORD = $appPassword
  foreach ($scriptName in @('01_schema_postgis.sql', '02_seed_escenario_06am.sql')) {
    $sqlPath = Join-Path $projectRoot "database\$scriptName"
    Invoke-Psql -Database $databaseName -UserName $appUser -Arguments @('-f', $sqlPath)
  }

  $databaseUrl = "postgresql+asyncpg://$([Uri]::EscapeDataString($appUser)):$([Uri]::EscapeDataString($appPassword))@$hostName`:$port/$databaseName"
  $envLines = Get-Content $envPath
  $urlLineFound = $false
  $apiUrlFound = $false
  $updatedLines = foreach ($line in $envLines) {
    if ($line -match '^DATABASE_URL=') {
      $urlLineFound = $true
      "DATABASE_URL=$databaseUrl"
    } elseif ($line -match '^VITE_API_URL=') {
      $apiUrlFound = $true
      'VITE_API_URL=http://127.0.0.1:8000'
    } else {
      $line
    }
  }
  if (-not $urlLineFound) {
    $updatedLines += "DATABASE_URL=$databaseUrl"
  }
  if (-not $apiUrlFound) {
    $updatedLines += 'VITE_API_URL=http://127.0.0.1:8000'
  }
  [System.IO.File]::WriteAllLines(
    $envPath,
    [string[]]$updatedLines,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Output 'Base de datos y esquema listos. El backend creará/actualizará las cuentas institucionales al iniciar.'
} finally {
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
