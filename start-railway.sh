#!/bin/bash

# Railway Start Script
# This script ensures the app starts correctly on Railway

echo "🚀 Starting Legal RAG Application"
echo "=================================="

# Railway sets the PORT environment variable
# Default to 3000 if not set
PORT=${PORT:-3000}

echo "Port: $PORT"
echo "Node Environment: $NODE_ENV"

# Check if standalone build exists
if [ -f ".next/standalone/server.js" ]; then
    echo "✓ Found standalone build"
    echo "Starting server..."
    node .next/standalone/server.js
else
    echo "✗ Standalone build not found at .next/standalone/server.js"
    echo "Falling back to npm start..."
    npm start
fi
