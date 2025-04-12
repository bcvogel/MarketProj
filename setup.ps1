Write-Host "Starting Stock Trading App Setup..." -ForegroundColor Green

# Step 1: Build and Start Containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Step 2: Wait for PostgreSQL to be Ready
Write-Host "Waiting for PostgreSQL to start..."
Start-Sleep -Seconds 10  # Adjust based on system speed

# Step 3: Get Backend Container ID
$backendContainer = docker ps --filter "name=backend" --format "{{.ID}}"

# Step 4: Initialize the Database
if ($backendContainer) {
    Write-Host "Initializing the database with sample data..." -ForegroundColor Yellow
    docker exec -it $backendContainer python init_db.py
} else {
    Write-Host "Error: Backend container not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Verify Running Services
Write-Host "Checking running services..." -ForegroundColor Cyan
docker ps

Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "Backend is running at: http://localhost:8000"
Write-Host "Frontend is running at: http://localhost:3000"