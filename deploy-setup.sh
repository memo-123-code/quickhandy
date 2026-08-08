#!/bin/bash

echo "🚀 Initializing Deployment Setup for QuickHandy..."

# 1. Initialize Git if not already initialized
if [ -d ".git" ]; then
    echo "✅ Git is already initialized."
else
    git init
    echo "✅ Git repository initialized."
fi

# 2. Stage all files
git add .
echo "✅ All files staged."

# 3. Commit
git commit -m "Initial Backend Setup"
echo "✅ Changes committed."

# 4. Provide Vercel Deployment Instructions
echo ""
echo "=========================================================="
echo "🎉 Setup Complete! You are ready to deploy to Vercel."
echo "=========================================================="
echo "To deploy instantly, just run:"
echo "npx vercel"
echo ""
echo "Don't forget to set your environment variables on Vercel:"
echo "1. DATABASE_URL"
echo "2. NEXTAUTH_SECRET"
echo "=========================================================="
