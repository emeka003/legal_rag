#!/bin/bash

# 🚂 Railway CLI Deployment Script

echo "🚂 Railway CLI Deployment"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if logged in
echo -e "${YELLOW}Checking Railway login...${NC}"
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

echo ""
echo -e "${GREEN}✅ Authenticated with Railway${NC}"
echo ""

# Check if project is linked
if [ ! -f ".railway/config.json" ]; then
    echo -e "${YELLOW}Project not linked to Railway.${NC}"
    echo ""
    echo "Options:"
    echo "  1. Link to existing project"
    echo "  2. Create new project"
    echo ""
    read -p "Choose (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "Select your project from the list:"
        railway link
    else
        echo ""
        echo "Creating new Railway project..."
        railway init
    fi
fi

echo ""
echo -e "${YELLOW}Current project:${NC}"
railway status
echo ""

# Check environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"
railway variables

echo ""
read -p "Do you want to add/update environment variables? (y/N): " add_vars
if [[ $add_vars =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter your environment variables:"
    echo "(Leave empty to skip)"
    echo ""
    
    read -p "SUPABASE_URL: " supabase_url
    read -p "SUPABASE_SERVICE_ROLE_KEY: " supabase_key
    read -p "GEMINI_API_KEY: " gemini_key
    read -p "AUTH_SECRET (min 32 chars): " auth_secret
    
    if [ ! -z "$supabase_url" ]; then
        railway variables set SUPABASE_URL="$supabase_url"
    fi
    if [ ! -z "$supabase_key" ]; then
        railway variables set SUPABASE_SERVICE_ROLE_KEY="$supabase_key"
    fi
    if [ ! -z "$gemini_key" ]; then
        railway variables set GEMINI_API_KEY="$gemini_key"
    fi
    if [ ! -z "$auth_secret" ]; then
        railway variables set AUTH_SECRET="$auth_secret"
    fi
fi

echo ""
echo -e "${YELLOW}Deploying to Railway...${NC}"
echo ""

# Deploy
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    
    # Get the domain
    domain=$(railway domain 2>/dev/null)
    if [ ! -z "$domain" ]; then
        echo -e "${GREEN}Your app is live at: https://${domain}${NC}"
        echo ""
        echo "Healthcheck: https://${domain}/api/health"
    fi
    
    echo ""
    echo "View logs: railway logs"
    echo "Open dashboard: railway open"
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "Check logs: railway logs"
    exit 1
fi
