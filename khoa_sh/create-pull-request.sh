#!/bin/bash

# KV Together - Create Pull Request Script
# Author: Vũ Đăng Khoa
# Date: June 16, 2025

echo "KV Together - Creating Pull Request from khoa-dev to main"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the KV_Together root directory${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "khoa-dev" ]; then
    echo -e "${YELLOW}Warning: Current branch is $CURRENT_BRANCH, not khoa-dev${NC}"
    echo -e "${BLUE}Switching to khoa-dev branch...${NC}"
    git checkout khoa-dev
fi

# Check if we have commits to push
COMMITS_AHEAD=$(git rev-list --count origin/main..khoa-dev 2>/dev/null || echo "0")
if [ "$COMMITS_AHEAD" = "0" ]; then
    echo -e "${RED}No commits ahead of main branch${NC}"
    exit 1
fi

echo -e "${GREEN}Found $COMMITS_AHEAD commits ahead of main${NC}"

# Display recent commits
echo -e "\n${BLUE}Recent commits:${NC}"
git log --oneline -10 --color=always

# Generate pull request URL
REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
if [[ $REPO_URL == https://github.com/* ]]; then
    REPO_PATH=$(echo $REPO_URL | sed 's|https://github.com/||')
elif [[ $REPO_URL == git@github.com:* ]]; then
    REPO_PATH=$(echo $REPO_URL | sed 's|git@github.com:||' | sed 's/\.git$//')
fi

PR_URL="https://github.com/${REPO_PATH}/compare/main...khoa-dev"

echo -e "\n${GREEN}Pull Request Summary:${NC}"
echo "============================================"
echo "Source Branch: khoa-dev"
echo "Target Branch: main" 
echo "Commits: $COMMITS_AHEAD"
echo "Repository: $REPO_PATH"
echo ""

# Pull Request Template Content
PR_TITLE="KV Together - Major System Enhancement v3.0.1"
PR_BODY="## Summary
This PR implements a comprehensive update for KV Together system with major backend and frontend enhancements, upgrading from v1.0 to v3.0.1.

## Change Type
- [x] New Feature
- [x] Bug Fix  
- [x] Documentation Update
- [x] UI/UX Improvement
- [x] Performance Optimization
- [x] Configuration & Infrastructure

## Key Changes

### Backend (v1.1.0 → v1.5.0)
- Enhanced Controllers: Campaign, Donation, Stats, Activity, News
- New Models: Activity, News, Testimonial with full CRUD
- Database: 6 new migrations, 8 comprehensive seeders
- API: New endpoints, automation commands, security policies
- Notifications: Campaign completion system

### Frontend (v2.1.0 → v3.0.1)  
- Core Components: Header, Footer, Navigation system
- Pages: Enhanced admin dashboard, campaign/activity pages
- UI/UX: 15+ new components, responsive design
- Configuration: Optimized Next.js, Tailwind, API layer
- Assets: Comprehensive image assets and sample data

## Technical Summary
- **80+ files changed**
- **8,000+ lines of code**
- **Full responsive design**
- **SEO optimized**
- **Production ready**

## Testing Status
- [x] Backend API endpoints tested
- [x] Frontend components verified  
- [x] Database migrations tested
- [x] Responsive design validated
- [x] Admin dashboard functional

## Deployment Status
All features implemented and tested. Ready for staging deployment.

---
**Developer**: Vũ Đăng Khoa | **Version**: v3.0.1 | **Date**: June 16, 2025"

echo -e "${BLUE}Pull Request Details:${NC}"
echo "Title: $PR_TITLE"
echo ""
echo -e "${YELLOW}Open this URL to create the Pull Request:${NC}"
echo "$PR_URL"
echo ""

# Option to open browser
read -p "Do you want to open the Pull Request URL in your browser? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open >/dev/null 2>&1; then
        echo -e "${GREEN}Opening Pull Request in browser...${NC}"
        open "$PR_URL"
    elif command -v xdg-open >/dev/null 2>&1; then
        echo -e "${GREEN}Opening Pull Request in browser...${NC}"
        xdg-open "$PR_URL"
    else
        echo -e "${YELLOW}Could not detect browser opener. Please open the URL manually.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Instructions:${NC}"
echo "1. Open the URL above in your browser"
echo "2. Copy and paste the title: $PR_TITLE"
echo "3. Use the description from PULL_REQUEST_TEMPLATE.md"
echo "4. Add appropriate labels (enhancement, feature, etc.)"
echo "5. Assign reviewers"
echo "6. Create the Pull Request"
echo ""
echo -e "${BLUE}Full PR template available in: PULL_REQUEST_TEMPLATE.md${NC}"
echo ""
echo -e "${GREEN}Pull Request preparation completed!${NC}"
