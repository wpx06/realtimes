#!/bin/bash

# 🚀 Quick Upload Script for CPA Lead Dashboard Vercel Version
# Use this script after creating the GitHub repository manually

echo "🚀 CPA Lead Dashboard - Quick Upload to GitHub"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory verified"

# Get GitHub username
echo ""
echo "📝 Please enter your GitHub username:"
read -p "Username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

# Repository name
REPO_NAME="cpa-lead-dashboard-vercel"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "📦 Repository Information:"
echo "   Name: $REPO_NAME"
echo "   URL: $REPO_URL"
echo ""

# Confirm
read -p "Continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin-upload 2>/dev/null; then
    echo "🔄 Removing existing remote..."
    git remote remove origin-upload
fi

# Add remote
echo "🔗 Adding remote..."
git remote add origin-upload "$REPO_URL"

# Push to GitHub
echo "📤 Pushing to GitHub..."
echo "This may take a few minutes..."

git push -u origin-upload master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Repository URL: $REPO_URL"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Open the repository in your browser"
    echo "2. Go to Settings → Pages (if you want GitHub Pages)"
    echo "3. Import to Vercel: https://vercel.com/new"
    echo "4. Set DATABASE_URL in Vercel environment variables"
    echo "5. Deploy!"
    echo ""
    echo "📊 Testing commands:"
    echo "curl -N \"https://your-app.vercel.app/api/realtime\""
    echo "curl \"https://your-app.vercel.app/api/postback/imonetizeit?click_id=test123&payout=5.50&country=US\""
    echo ""
    echo "🎉 Ready for Vercel deployment!"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Make sure you created the repository on GitHub first"
    echo "2. Check that the repository name is correct"
    echo "3. Verify you have push permissions"
    echo "4. Try manual upload: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 Manual upload steps:"
    echo "1. Open: $REPO_URL"
    echo "2. Click 'Uploading an existing file'"
    echo "3. Drag and drop all files from this directory"
    echo "4. Commit changes"
fi

# Clean up remote
git remote remove origin-upload 2>/dev/null

echo ""
echo "✅ Script completed!"