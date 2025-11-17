Write-Host "`n======== Stock Trading App Setup ========" -ForegroundColor Cyan

Write-Host "`n[0] Stopping old containers..." -ForegroundColor Magenta
docker-compose down

# Step 1: Build and Start Containers
Write-Host "`n[1] Building and starting Docker containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Step 2: Wait for PostgreSQL to be Ready
Write-Host "`n[2] Waiting for PostgreSQL to initialize..."
Start-Sleep -Seconds 10  # Increase if your DB is slow to boot

# Step 3: Get Backend and DB Container IDs
$backendContainer = docker ps --filter "name=marketproj-backend" --format "{{.ID}}" | Select-Object -First 1
$dbContainer = docker ps --filter "name=marketproj-db" --format "{{.ID}}" | Select-Object -First 1

# Step 4: Initialize the Database with sample data only if needed
if ($backendContainer -and $dbContainer) {
    Write-Host "`n[3] Checking if users already exist in the database..." -ForegroundColor Yellow

    # Run the COUNT(*) inside the DB container; send stderr to null so we only capture stdout
    $userCountRaw = docker exec -i $dbContainer psql -U admin -d stock_db -t -c "SELECT COUNT(*) FROM users;" 2>$null

    # Normalize to a single string and trim whitespace/newlines
    $userCount = ($userCountRaw | Out-String).Trim()

    # If the command failed (no table yet) or returned nothing, treat as 0 users
    if ($LASTEXITCODE -ne 0 -or -not $userCount) {
        $userCount = "0"
    }

    if ($userCount -eq "0") {
        Write-Host "No users found. Initializing the database with sample data..." -ForegroundColor Green
        docker exec -it $backendContainer python init_db.py
    }
    else {
        Write-Host "Users already exist. Skipping sample data initialization." -ForegroundColor Cyan
    }
}
else {
    Write-Host "Error: Backend or DB container not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Reset frontend localStorage (optional)
$frontendPath = ".\frontend\src\index.js"
if (Test-Path $frontendPath) {
    Write-Host "`n[4] Resetting frontend localStorage script..." -ForegroundColor Yellow
    $indexContent = Get-Content $frontendPath
    if (-not ($indexContent -match "localStorage.clear")) {
        Add-Content -Path $frontendPath -Value "`nlocalStorage.clear(); // Auto-clear on app start"
        Write-Host "localStorage.clear() added to index.js" -ForegroundColor Green
    }
    else {
        Write-Host "localStorage.clear() already present." -ForegroundColor Cyan
    }
}

# Step 6: Show running services
Write-Host "`n[5] Showing running services..." -ForegroundColor Cyan
docker ps

Write-Host "`n======== Setup Complete! ========" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:8000"

