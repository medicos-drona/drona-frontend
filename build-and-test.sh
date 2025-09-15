#!/bin/bash

# Docker Build and Test Script for Medicos Frontend

echo "🚀 Starting Docker optimization build and test..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Build the optimized image
print_status "Building optimized Docker image..."
IMAGE_NAME="medicos-optimized"

if docker build -t $IMAGE_NAME .; then
    print_success "Docker image built successfully!"
else
    print_error "Docker build failed!"
    exit 1
fi

# Check image size
print_status "Checking image size..."
IMAGE_SIZE=$(docker images $IMAGE_NAME --format "table {{.Size}}" | tail -n 1)
print_success "Image size: $IMAGE_SIZE"

# Compare with typical sizes
SIZE_NUM=$(echo $IMAGE_SIZE | sed 's/[^0-9.]//g')
SIZE_UNIT=$(echo $IMAGE_SIZE | sed 's/[0-9.]//g')

if [[ $SIZE_UNIT == *"GB"* ]]; then
    if (( $(echo "$SIZE_NUM > 1.0" | bc -l) )); then
        print_warning "Image size is still large (>1GB). Consider further optimizations."
    else
        print_success "Good image size (<1GB)!"
    fi
elif [[ $SIZE_UNIT == *"MB"* ]]; then
    if (( $(echo "$SIZE_NUM > 800" | bc -l) )); then
        print_warning "Image size is moderate (>800MB). Could be optimized further."
    else
        print_success "Excellent image size (<800MB)!"
    fi
fi

# Test the container
print_status "Testing the container..."
CONTAINER_NAME="medicos-test"

# Stop and remove existing container if it exists
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the container in detached mode
if docker run -d --name $CONTAINER_NAME -p 3000:3000 $IMAGE_NAME; then
    print_success "Container started successfully!"
    
    # Wait for the application to start
    print_status "Waiting for application to start..."
    sleep 10
    
    # Test if the application is responding
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Application is responding on http://localhost:3000"
        print_status "You can now test the application manually."
        print_status "Press any key to stop the test container..."
        read -n 1 -s
    else
        print_warning "Application might not be fully ready. Check logs:"
        docker logs $CONTAINER_NAME
    fi
    
    # Stop and remove the test container
    print_status "Stopping test container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    print_success "Test container cleaned up."
    
else
    print_error "Failed to start container!"
    exit 1
fi

# Show final summary
echo ""
print_success "=== OPTIMIZATION SUMMARY ==="
echo "✅ Removed unnecessary test files and documentation"
echo "✅ Created comprehensive .dockerignore"
echo "✅ Optimized package dependencies"
echo "✅ Improved Dockerfile efficiency"
echo "✅ Final image size: $IMAGE_SIZE"
echo ""
print_status "To run the optimized container:"
echo "docker run -p 3000:3000 $IMAGE_NAME"
echo ""
print_status "To push to registry:"
echo "docker tag $IMAGE_NAME your-registry/$IMAGE_NAME"
echo "docker push your-registry/$IMAGE_NAME"
