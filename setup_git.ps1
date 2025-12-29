# Setup Git Repository
$ErrorActionPreference = "Stop"

# This script should be run from the project root directory
$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
    # If run directly, use current directory
    $projectRoot = Get-Location
}

Write-Host "Setting up git in: $projectRoot"
Set-Location $projectRoot

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..."
    git init
} else {
    Write-Host "Git repository already initialized"
}

# Add remote if it doesn't exist
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "Adding remote origin..."
    git remote add origin https://github.com/sylergy-zubair/Maktaba-al-Basirah.git
} else {
    Write-Host "Remote already configured: $remoteExists"
}

# Show status
Write-Host "`nGit status:"
git status --short | Select-Object -First 20

Write-Host "`nRemote configuration:"
git remote -v

Write-Host "`nDone! Next steps:"
Write-Host "1. git add ."
Write-Host "2. git commit -m 'Initial commit'"
Write-Host "3. git push -u origin master"

