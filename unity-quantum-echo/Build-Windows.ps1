<#
.SYNOPSIS
    Automated Windows Standalone x64 Build Script for Quantum Echo: The City That Forgot.

.DESCRIPTION
    Locates the installed Unity Editor on Windows, runs project setup, executes quantum tests,
    and builds the Windows standalone player to Builds/Windows/QuantumEcho.exe.
#>

param(
    [string]$UnityPath = "",
    [string]$ProjectPath = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " QUANTUM ECHO: THE CITY THAT FORGOT - WINDOWS BUILD HELPER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Locate Unity Editor if not specified
if ([string]::IsNullOrWhiteSpace($UnityPath)) {
    $searchPaths = @(
        "C:\Program Files\Unity\Hub\Editor\*\Editor\Unity.exe",
        "C:\Program Files\Unity*\Editor\Unity.exe",
        "${env:ProgramFiles}\Unity\Hub\Editor\*\Editor\Unity.exe",
        "${env:LOCALAPPDATA}\Programs\Unity\Hub\Editor\*\Editor\Unity.exe"
    )

    foreach ($pattern in $searchPaths) {
        $matches = Get-Item $pattern -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
        if ($matches) {
            $UnityPath = $matches[0].FullName
            break
        }
    }
}

if (-not (Test-Path $UnityPath)) {
    Write-Warning "Unity Editor executable not found automatically."
    Write-Host "Please pass your Unity.exe path using: .\Build-Windows.ps1 -UnityPath 'C:\Path\To\Unity.exe'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using Unity Editor at: $UnityPath" -ForegroundColor Green
Write-Host "Target Project: $ProjectPath" -ForegroundColor Green

$logPath = Join-Path $ProjectPath "build_log.txt"
$buildOutDir = Join-Path $ProjectPath "Builds\Windows"

if (-not (Test-Path $buildOutDir)) {
    New-Item -ItemType Directory -Path $buildOutDir -Force | Out-Null
}

Write-Host "`n[1/2] Executing Automated Setup & Verification..." -ForegroundColor Yellow
$setupArgs = @(
    "-batchmode",
    "-quit",
    "-projectPath", "`"$ProjectPath`"",
    "-executeMethod", "QuantumEcho.Editor.WindowsBuildScript.PerformWindowsBuild",
    "-logFile", "`"$logPath`""
)

$proc = Start-Process -FilePath $UnityPath -ArgumentList $setupArgs -Wait -PassThru -NoNewWindow

if ($proc.ExitCode -eq 0) {
    Write-Host "`n[2/2] Build Successful!" -ForegroundColor Green
    Write-Host "Output located at: $(Join-Path $buildOutDir 'QuantumEcho.exe')" -ForegroundColor Green
} else {
    Write-Host "`nBuild encountered an error (Exit Code $($proc.ExitCode))." -ForegroundColor Red
    Write-Host "Check build_log.txt for details: $logPath" -ForegroundColor Red
}

exit $proc.ExitCode
