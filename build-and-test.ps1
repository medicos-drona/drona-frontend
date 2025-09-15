# Docker Build and Test Script for Medicos Frontend (PowerShell)

Write-Host "🚀 Starting Docker optimization build and test..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Status "Docker is running ✓"
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Build the optimized image
Write-Status "Building optimized Docker image..."
$ImageName = "medicos-optimized"

try {
    docker build -t $ImageName .
    Write-Success "Docker image built successfully!"
} catch {
    Write-Error "Docker build failed!"
    exit 1
}

# Check image size
Write-Status "Checking image size..."
$ImageSize = docker images $ImageName --format "{{.Size}}" | Select-Object -First 1
Write-Success "Image size: $ImageSize"

# Parse size for comparison
if ($ImageSize -match "(\d+\.?\d*)(GB|MB)") {
    $SizeNum = [double]$matches[1]
    $SizeUnit = $matches[2]
    
    if ($SizeUnit -eq "GB") {
        if ($SizeNum -gt 1.0) {
            Write-Warning "Image size is still large (>1GB). Consider further optimizations."
        } else {
            Write-Success "Good image size (<1GB)!"
        }
    } elseif ($SizeUnit -eq "MB") {
        if ($SizeNum -gt 800) {
            Write-Warning "Image size is moderate (>800MB). Could be optimized further."
        } else {
            Write-Success "Excellent image size (<800MB)!"
        }
    }
}

# Test the container
Write-Status "Testing the container..."
$ContainerName = "medicos-test"

# Stop and remove existing container if it exists
try {
    docker stop $ContainerName 2>$null
    docker rm $ContainerName 2>$null
} catch {
    # Container doesn't exist, continue
}

# Run the container in detached mode
try {
    docker run -d --name $ContainerName -p 3000:3000 $ImageName
    Write-Success "Container started successfully!"
    
    # Wait for the application to start
    Write-Status "Waiting for application to start..."
    Start-Sleep -Seconds 10
    
    # Test if the application is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
        Write-Success "Application is responding on http://localhost:3000"
        Write-Status "You can now test the application manually."
        Write-Status "Press any key to stop the test container..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } catch {
        Write-Warning "Application might not be fully ready. Check logs:"
        docker logs $ContainerName
    }
    
    # Stop and remove the test container
    Write-Status "Stopping test container..."
    docker stop $ContainerName
    docker rm $ContainerName
    Write-Success "Test container cleaned up."
    
} catch {
    Write-Error "Failed to start container!"
    exit 1
}

# Show final summary
Write-Host ""
Write-Success "=== OPTIMIZATION SUMMARY ==="
Write-Host "✅ Removed unnecessary test files and documentation"
Write-Host "✅ Created comprehensive .dockerignore"
Write-Host "✅ Optimized package dependencies"
Write-Host "✅ Improved Dockerfile efficiency"
Write-Host "✅ Final image size: $ImageSize"
Write-Host ""
Write-Status "To run the optimized container:"
Write-Host "docker run -p 3000:3000 $ImageName"
Write-Host ""
Write-Status "To push to registry:"
Write-Host "docker tag $ImageName your-registry/$ImageName"
Write-Host "docker push your-registry/$ImageName"
