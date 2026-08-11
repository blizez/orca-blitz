# Loop 2: Documentacion - Actualizacion para Usuarios
# Se ejecuta diario a las 5 PM
# Revisa commits recientes y actualiza la documentacion de usuarios

param(
    [string]$RepoPath = "C:\Users\Lux\orca\orca-blitz",
    [string]$DocPath = "C:\Users\Lux\orca\orca-blitz\Documentacion",
    [int]$HoursToLookBack = 25  # Mirar ultimas 25 horas para cubrir el dia
)

$ErrorActionPreference = "Continue"

# Funcion para escribir log
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

# Funcion para obtener commits recientes
function Get-RecentCommits {
    param([string]$Path, [int]$Hours)
    $since = (Get-Date).AddHours(-$Hours).ToString("yyyy-MM-ddTHH:mm:ss")
    Set-Location $Path
    $commits = git log --since=$since --oneline --no-merges 2>$null
    return $commits
}

# Funcion para obtener archivos cambiados
function Get-ChangedFiles {
    param([string]$Path, [int]$Hours)
    $since = (Get-Date).AddHours(-$Hours).ToString("yyyy-MM-ddTHH:mm:ss")
    Set-Location $Path
    $files = git log --since=$since --name-only --pretty=format:"" --no-merges 2>$null | Where-Object { $_ -ne "" }
    return $files
}

# Funcion para analizar cambios de usuario
function Analyze-UserChanges {
    param([string[]]$ChangedFiles)
    
    $analysis = @{
        HasNewFeatures = $false
        HasUIChanges = $false
        HasSettingsChanges = $false
        HasSidebarChanges = $false
        HasNewPages = $false
        HasBugFixes = $false
        Summary = ""
        UserFacingChanges = @()
    }
    
    foreach ($file in $ChangedFiles) {
        if ($file -match "components/layout/") {
            $analysis.HasUIChanges = $true
            $analysis.HasSidebarChanges = $true
            $analysis.UserFacingChanges += "Cambios en la interfaz principal"
        }
        elseif ($file -match "components/settings/") {
            $analysis.HasSettingsChanges = $true
            $analysis.UserFacingChanges += "Cambios en ajustes"
        }
        elseif ($file -match "components/home/") {
            $analysis.HasNewPages = $true
            $analysis.UserFacingChanges += "Cambios en pantalla principal"
        }
        elseif ($file -match "components/(crm|automation|chat)/") {
            $analysis.HasNewFeatures = $true
            $analysis.UserFacingChanges += "Nuevas funcionalidades"
        }
        elseif ($file -match "\.tsx$") {
            $analysis.HasUIChanges = $true
            $analysis.UserFacingChanges += "Cambios en interfaz"
        }
    }
    
    # Eliminar duplicados
    $analysis.UserFacingChanges = $analysis.UserFacingChanges | Select-Object -Unique
    
    return $analysis
}

# === INICIO ===
Write-Log "=== Loop 2: Documentacion - Actualizacion para Usuarios ==="
Write-Log "Repositorio: $RepoPath"

# 1. Pull ultimos cambios
Write-Log "Pulling ultimos cambios..."
Set-Location $RepoPath
git pull origin main 2>$null | Out-Null

# 2. Obtener commits recientes
Write-Log "Buscando commits de las ultimas $HoursToLookBack horas..."
$commits = Get-RecentCommits -Path $RepoPath -Hours $HoursToLookBack

if (-not $commits -or $commits.Count -eq 0) {
    Write-Log "No hay commits nuevos. Saliendo."
    exit 0
}

Write-Log "Encontrados $($commits.Count) commits"

# 3. Obtener archivos cambiados
$changedFiles = Get-ChangedFiles -Path $RepoPath -Hours $HoursToLookBack
Write-Log "Archivos cambiados: $($changedFiles.Count)"

# 4. Analizar cambios
$analysis = Analyze-UserChanges -ChangedFiles $changedFiles

# 5. Generar reporte
$report = @"
# Reporte de Cambios para Usuarios
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Commits analizados:** $($commits.Count)

## Commits Recientes
$($commits | ForEach-Object { "- $_" } | Out-String)

## Cambios para Usuarios
$($analysis.UserFacingChanges | ForEach-Object { "- $_" } | Out-String)

## Detalles
- Nuevas funcionalidades: $($analysis.HasNewFeatures)
- Cambios en interfaz: $($analysis.HasUIChanges)
- Cambios en ajustes: $($analysis.HasSettingsChanges)
- Cambios en sidebar: $($analysis.HasSidebarChanges)
- Nuevas paginas: $($analysis.HasNewPages)

## Accion Requerida
Revisar los cambios y actualizar la documentacion de usuarios en Documentacion segun las funcionalidades nuevas o modificadas.
"@

# 6. Guardar reporte
$reportPath = Join-Path $DocPath "reporte-cambios.md"
$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Log "Reporte guardado en: $reportPath"

# 7. Actualizar README de Documentacion con timestamp
$readmePath = Join-Path $DocPath "README.md"
$readme = Get-Content $readmePath -Raw
$lastUpdated = "Ultima actualizacion: $(Get-Date -Format "yyyy-MM-dd HH:mm")"
if ($readme -match "Ultima actualizacion:.*") {
    $readme = $readme -replace "Ultima actualizacion:.*", $lastUpdated
} else {
    $readme = "$lastUpdated`n`n$readme"
}
$readme | Out-File -FilePath $readmePath -Encoding UTF8

Write-Log "=== Loop 2 completado ==="
