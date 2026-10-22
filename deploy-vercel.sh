#!/bin/bash

# 🚀 CPA Lead Dashboard - Vercel Deployment Script
# Script untuk upload ke GitHub repository baru untuk Vercel version

echo "🚀 Starting Vercel deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run this from the project root."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📂 Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    git status --short
    exit 1
fi

echo "✅ Git repository is clean"

# Repository information
REPO_NAME="cpa-lead-dashboard-vercel"
REPO_DESCRIPTION="CPA Lead Dashboard with Vercel-compatible real-time features using Server-Sent Events (SSE)"
GITHUB_USER="robingladys"

echo "📦 Repository Information:"
echo "   Name: $REPO_NAME"
echo "   Description: $REPO_DESCRIPTION"
echo "   User: $GITHUB_USER"
echo ""

# Create GitHub repository using curl
echo "🌐 Creating GitHub repository..."

# Get GitHub token from environment or ask user
if [ -z "$GITHUB_TOKEN" ]; then
    echo "🔑 Please enter your GitHub token:"
    read -s GITHUB_TOKEN
fi

# Create repository
CREATE_REPO_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{
        \"name\": \"$REPO_NAME\",
        \"description\": \"$REPO_DESCRIPTION\",
        \"private\": false,
        \"has_issues\": true,
        \"has_projects\": true,
        \"has_wiki\": true
    }")

# Check if repository was created successfully
if echo "$CREATE_REPO_RESPONSE" | grep -q '"html_url"'; then
    REPO_URL=$(echo "$CREATE_REPO_RESPONSE" | grep -o '"html_url": "[^"]*' | cut -d'"' -f4)
    echo "✅ Repository created successfully: $REPO_URL"
else
    echo "❌ Failed to create repository"
    echo "$CREATE_REPO_RESPONSE"
    exit 1
fi

# Add remote and push
echo "📤 Adding remote and pushing to GitHub..."

git remote add vercel-origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git push -u vercel-origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Create release
echo "🏷️  Creating release..."

RELEASE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$GITHUB_USER/$REPO_NAME/releases \
    -d "{
        \"tag_name\": \"v1.0.0-vercel\",
        \"target_commitish\": \"$CURRENT_BRANCH\",
        \"name\": \"CPA Lead Dashboard - Vercel Version v1.0.0\",
        \"body\": \"🚀 CPA Lead Dashboard with Vercel-compatible real-time features\\n\\n## Features\\n- ✅ Server-Sent Events (SSE) for real-time updates\\n- ✅ Vercel deployment ready\\n- ✅ PostgreSQL schema included\\n- ✅ Comprehensive documentation\\n- ✅ Mobile responsive design\\n- ✅ Toast notifications\\n- ✅ Sound alerts\\n\\n## Quick Start\\n1. Fork this repository\\n2. Import to Vercel\\n3. Set DATABASE_URL (Vercel Postgres)\\n4. Deploy and enjoy!\\n\\n## Postback URLs\\n- Imonetizeit: \\`/api/postback/imonetizeit\\`\\n- Trafee: \\`/api/postback/trafee\\`\\n- Clickdealer: \\`/api/postback/clickdealer\\`\\n\\n🤖 Generated with [Claude Code](https://claude.ai/code)\",
        \"draft\": false,
        \"prerelease\": false
    }")

if echo "$RELEASE_RESPONSE" | grep -q '"html_url"'; then
    RELEASE_URL=$(echo "$RELEASE_RESPONSE" | grep -o '"html_url": "[^"]*' | cut -d'"' -f4)
    echo "✅ Release created successfully: $RELEASE_URL"
else
    echo "⚠️  Failed to create release (but repository is ready)"
fi

echo ""
echo "🎉 Vercel deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. 🍴 Fork the repository: $REPO_URL"
echo "2. 🚀 Import to Vercel: https://vercel.com/new"
echo "3. ⚙️  Set environment variables:"
echo "   - DATABASE_URL (Vercel Postgres)"
echo "4. 🌐 Deploy and test at: your-app.vercel.app"
echo ""
echo "📚 Documentation:"
echo "- DEPLOYMENT_VERCEL.md - Complete deployment guide"
echo "- REALTIME_VERCEL.md - Real-time implementation details"
echo "- README_VERCEL.md - Quick start guide"
echo ""
echo "🔗 Repository: $REPO_URL"
echo "🏷️  Release: $RELEASE_URL"
echo ""
echo "✅ Ready for Vercel deployment! 🚀"
