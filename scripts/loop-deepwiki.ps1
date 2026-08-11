# Loop 1: DeepWiki - Actualizacion Tecnica
# Se ejecuta diario a las 1 PM
# Revisa commits recientes y actualiza la documentacion tecnica

param(
    [string]$RepoPath = "C:\Users\Lux\orca\orca-blitz",
    [string]$DeepWikiPath = "C:\Users\Lux\orca\orca-blitz\DeepWiki",
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

# Funcion para obtener diff de un commit
function Get-CommitDiff {
    param([string]$Path, [string]$CommitHash)
    Set-Location $Path
    $diff = git show $CommitHash --stat 2>$null
    return $diff
}

# Funcion para analizar cambios tecnicos
function Analyze-TechnicalChanges {
    param([string[]]$ChangedFiles)
    
    $analysis = @{
        HasCodeChanges = $false
        HasConfigChanges = $false
        HasUICChanges = $false
        HasMainProcessChanges = $false
        HasPreloadChanges = $false
        HasRendererChanges = $false
        HasUIPackageChanges = $false
        NewFiles = @()
        ModifiedFiles = @()
        Summary = ""
    }
    
    foreach ($file in $ChangedFiles) {
        if ($file -match "^apps/desktop/src/main/") {
            $analysis.HasMainProcessChanges = $true
            $analysis.HasCodeChanges = $true
        }
        elseif ($file -match "^apps/desktop/src/preload/") {
            $analysis.HasPreloadChanges = $true
            $analysis.HasCodeChanges = $true
        }
        elseif ($file -match "^apps/desktop/src/renderer/") {
            $analysis.HasRendererChanges = $true
            $analysis.HasCodeChanges = $true
            $analysis.HasUICChanges = $true
        }
        elseif ($file -match "^packages/ui/") {
            $analysis.HasUIPackageChanges = $true
            $analysis.HasCodeChanges = $true
        }
        elseif ($file -match "\.(json|yaml|yml|toml)$") {
            $analysis.HasConfigChanges = $true
        }
    }
    
    return $analysis
}

# === INICIO ===
Write-Log "=== Loop 1: DeepWiki - Actualizacion Tecnica ==="
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
$analysis = Analyze-TechnicalChanges -ChangedFiles $changedFiles

# 5. Generar reporte
$report = @"
# Reporte de Cambios Tecnicos
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Commits analizados:** $($commits.Count)

## Commits Recientes
$($commits | ForEach-Object { "- $_" } | Out-String)

## Archivos Modificados
$($changedFiles | ForEach-Object { "- $_" } | Out-String)

## Analisis
- Cambios en Main Process: $($analysis.HasMainProcessChanges)
- Cambios en Preload: $($analysis.HasPreloadChanges)
- Cambios en Renderer: $($analysis.HasRendererChanges)
- Cambios en UI Package: $($analysis.HasUIPackageChanges)
- Cambios en Config: $($analysis.HasConfigChanges)

## Accion Requerida
Revisar los commits y actualizar la documentacion tecnica en DeepWiki segun los cambios detectados.
"@

# 6. Guardar reporte
$reportPath = Join-Path $DeepWikiPath "reporte-cambios.md"
$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Log "Reporte guardado en: $reportPath"

# 7. Actualizar README de DeepWiki con timestamp
$readmePath = Join-Path $DeepWikiPath "README.md"
$readme = Get-Content $readmePath -Raw
$lastUpdated = "Ultima actualizacion: $(Get-Date -Format "yyyy-MM-dd HH:mm")"
if ($readme -match "Ultima actualizacion:.*") {
    $readme = $readme -replace "Ultima actualizacion:.*", $lastUpdated
} else {
    $readme = "$lastUpdated`n`n$readme"
}
$readme | Out-File -FilePath $readmePath -Encoding UTF8

Write-Log "=== Loop 1 completado ==="
