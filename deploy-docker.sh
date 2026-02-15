#!/bin/bash

# 🐳 Deploy with Docker

echo "🐳 Building Docker Image"
echo "========================"

# Check if .env file exists
if [ ! -f ".env.local" ]; then
    echo "Error: .env.local not found!"
    echo "Please create .env.local with your environment variables"
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker-compose build

if [ $? -eq 0 ]; then
    echo ""
    echo "Build complete!"
    echo ""
    echo "To start the application, run:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f app"
    echo ""
    echo "To stop:"
    echo "  docker-compose down"
else
    echo "Build failed!"
    exit 1
fi
