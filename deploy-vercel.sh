#!/bin/bash

# 🚀 Deploy to Vercel

echo "🚀 Starting Vercel Deployment"
echo "=============================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
echo "Checking Vercel login..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please login to Vercel:"
    vercel login
fi

# Run linting
echo "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed! Fix errors before deploying."
    exit 1
fi

# Run build locally first
echo "Running production build..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed! Fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo ""
echo "All checks passed!"
echo "Deploying to Vercel..."
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "Deployment complete!"
    echo ""
    echo "Don't forget to:"
    echo "  1. Set environment variables in Vercel Dashboard"
    echo "  2. Configure custom domain if needed"
    echo "  3. Enable analytics and monitoring"
else
    echo "Deployment failed"
    exit 1
fi
