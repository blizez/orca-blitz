# Setup Scheduler - Configurar Windows Task Scheduler
# Ejecuta este script UNA VEZ para configurar las tareas diarias

param(
    [string]$RepoPath = "C:\Users\Lux\orca\orca-blitz"
)

$ErrorActionPreference = "Stop"

# Funcion para escribir log
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

# === INICIO ===
Write-Log "=== Configurando Task Scheduler para orca-blitz ==="

# Verificar que estamos como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Log "ADVERTENCIA: Este script funciona mejor como Administrador."
    Write-Log "Algunas tareas pueden no crearse sin permisos de admin."
}

# 1. Crear tarea: Loop 1 - DeepWiki (1 PM diario)
Write-Log "Creando tarea: Loop 1 - DeepWiki (1 PM)..."
$scriptPath1 = Join-Path $RepoPath "scripts\loop-deepwiki.ps1"

$action1 = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$scriptPath1`"" `
    -WorkingDirectory $RepoPath

$trigger1 = New-ScheduledTaskTrigger `
    -Daily `
    -At "1:00PM"

$settings1 = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

try {
    Register-ScheduledTask `
        -TaskName "orca-blitz-deepwiki-update" `
        -Action $action1 `
        -Trigger $trigger1 `
        -Settings $settings1 `
        -Description "Actualiza documentacion tecnica (DeepWiki) diariamente a las 1 PM" `
        -Force
    Write-Log "Tarea creada: orca-blitz-deepwiki-update"
} catch {
    Write-Log "Error creando tarea 1: $($_.Exception.Message)"
}

# 2. Crear tarea: Loop 2 - Documentacion (5 PM diario)
Write-Log "Creando tarea: Loop 2 - Documentacion (5 PM)..."
$scriptPath2 = Join-Path $RepoPath "scripts\loop-documentacion.ps1"

$action2 = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$scriptPath2`"" `
    -WorkingDirectory $RepoPath

$trigger2 = New-ScheduledTaskTrigger `
    -Daily `
    -At "5:00PM"

$settings2 = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

try {
    Register-ScheduledTask `
        -TaskName "orca-blitz-doc-update" `
        -Action $action2 `
        -Trigger $trigger2 `
        -Settings $settings2 `
        -Description "Actualiza documentacion de usuarios (Documentacion) diariamente a las 5 PM" `
        -Force
    Write-Log "Tarea creada: orca-blitz-doc-update"
} catch {
    Write-Log "Error creando tarea 2: $($_.Exception.Message)"
}

# 3. Verificar tareas creadas
Write-Log ""
Write-Log "=== Verificando tareas ==="
$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "orca-blitz-*" }
foreach ($task in $tasks) {
    Write-Log "Tarea: $($task.TaskName)"
    Write-Log "  Estado: $($task.State)"
    Write-Log "  Proximo run: $(($task.Triggers | Select-Object -First 1).StartBoundary)"
    Write-Log ""
}

Write-Log "=== Configuracion completada ==="
Write-Log ""
Write-Log "Tareas configuradas:"
Write-Log "  1. orca-blitz-deepwiki-update  - Diario a las 1:00 PM"
Write-Log "  2. orca-blitz-doc-update       - Diario a las 5:00 PM"
Write-Log ""
Write-Log "Para ver las tareas: Get-ScheduledTask | Where-Object { `$_.TaskName -like 'orca-blitz-*' }"
Write-Log "Para eliminar una tarea: Unregister-ScheduledTask -TaskName 'nombre-tarea'"
Write-Log "Para ejecutar manualmente: Start-ScheduledTask -TaskName 'nombre-tarea'"
