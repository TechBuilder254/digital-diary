#!/bin/bash
# GitHub Authentication Setup Script
# This script helps you set up permanent GitHub authentication

set -e

echo "🔐 GitHub Authentication Setup"
echo "=============================="
echo ""

# Check if SSH key exists
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "✅ SSH key found: ~/.ssh/id_ed25519.pub"
    echo ""
    echo "Your public SSH key:"
    echo "----------------------------------------"
    cat ~/.ssh/id_ed25519.pub
    echo "----------------------------------------"
    echo ""
    
    # Try to copy to clipboard
    if command -v xclip &> /dev/null; then
        cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
        echo "✅ Public key copied to clipboard!"
    elif command -v wl-copy &> /dev/null; then
        cat ~/.ssh/id_ed25519.pub | wl-copy
        echo "✅ Public key copied to clipboard!"
    else
        echo "📋 Copy the key above manually"
    fi
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to: https://github.com/settings/ssh/new"
    echo "2. Give it a title (e.g., 'Linux Machine')"
    echo "3. Paste the key above"
    echo "4. Click 'Add SSH key'"
    echo ""
    read -p "Press Enter after you've added the key to GitHub..."
    
    # Test connection
    echo ""
    echo "🧪 Testing SSH connection to GitHub..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo "✅ SSH authentication successful!"
    else
        echo "⚠️  SSH test failed. Please verify:"
        echo "   - The key was added to GitHub correctly"
        echo "   - Your SSH config is correct"
    fi
else
    echo "❌ No SSH key found. Generating one..."
    ssh-keygen -t ed25519 -C "developerkamande@gmail.com" -f ~/.ssh/id_ed25519 -N ""
    echo "✅ SSH key generated!"
    echo "Run this script again to continue setup."
fi

# Option: GitHub CLI setup
echo ""
echo "💡 Alternative: GitHub CLI (easier for some workflows)"
read -p "Do you want to install and set up GitHub CLI? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v gh &> /dev/null; then
        echo "✅ GitHub CLI is already installed"
    else
        echo "📦 Installing GitHub CLI..."
        if command -v apt &> /dev/null; then
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
        elif command -v dnf &> /dev/null; then
            sudo dnf install gh -y
        elif command -v yum &> /dev/null; then
            sudo yum install gh -y
        else
            echo "❌ Package manager not supported. Please install GitHub CLI manually:"
            echo "   Visit: https://cli.github.com/"
            exit 1
        fi
    fi
    
    echo "🔐 Authenticating with GitHub CLI..."
    gh auth login
    echo "✅ GitHub CLI authentication complete!"
fi

echo ""
echo "✨ Setup complete! You should now be able to use GitHub without repeated logins."
echo ""
echo "💡 Tips:"
echo "   - Use SSH URLs: git@github.com:username/repo.git"
echo "   - Or use GitHub CLI: gh repo clone username/repo"
echo "   - For HTTPS, credentials will be cached automatically"

