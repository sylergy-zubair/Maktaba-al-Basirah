# Initialize git repository
$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

Write-Host "Initializing git in: $scriptDir"

# Change to project directory
Set-Location $scriptDir

# Initialize git
git init

# Add remote
git remote add origin https://github.com/sylergy-zubair/Maktaba-al-Basirah.git

# Check status
Write-Host "`nGit initialized successfully!"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Remote configured:"
git remote -v

