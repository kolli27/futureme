#!/bin/bash

echo "🐳 Testing FutureSync with Docker..."

# Build the Docker image
echo "Building Docker image..."
docker build -t futureme-test . || {
    echo "❌ Docker build failed"
    exit 1
}

# Run the container
echo "Starting container..."
docker run -d \
    --name futureme-test \
    -p 3001:3000 \
    -e OPENAI_API_KEY="$OPENAI_API_KEY" \
    futureme-test || {
    echo "❌ Container start failed"
    exit 1
}

# Wait for container to be ready
echo "Waiting for container to start..."
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
curl -f http://localhost:3001/api/health && {
    echo "✅ Health check passed"
} || {
    echo "❌ Health check failed"
}

# Show container logs
echo "📋 Container logs:"
docker logs futureme-test

echo "🌐 App should be available at: http://localhost:3001"
echo "🛑 To stop: docker stop futureme-test && docker rm futureme-test"