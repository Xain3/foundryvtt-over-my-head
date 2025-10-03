#!/usr/bin/env bash
set -euo pipefail

FOUNDRY_DOWNLOAD_URL="https://foundryvtt.com/releases/download?build=350&platform=node"

if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    cat << EOF
Devcontainer Post-Create Setup Script

Usage: $0 [OPTIONS]

Options:
  --dry-run    Simulate the setup without making changes
  --help, -h   Show this help message

Description:
This script is automatically called when a devcontainer is first created.
It can also be run manually by newcomers for troubleshooting or manual setup.

What it does:
1. Configures Git safe directory to prevent ownership errors
2. Installs npm dependencies
3. Sets up Git hooks (husky)
4. Runs environment validation checks
5. Sets up Python environment
6. Sets up ZSH configuration
7. Shows available commands
EOF
    exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "Running in dry-run mode. No changes will be made."
fi

# Devcontainer Post-Create Setup Script
#
# This script is automatically called when a devcontainer is first created.
# It can also be run manually by newcomers for troubleshooting or manual setup.
#
# What it does:
# 1. Configures Git safe directory to prevent ownership errors
# 2. Installs npm dependencies
# 3. Sets up Git hooks (husky)
# 4. Runs environment validation checks
# 5. Sets up Python environment
# 6. Sets up ZSH configuration
# 7. Shows available commands
#
# Usage:
#   Automatic: Called by devcontainer.json postCreateCommand
#   Manual: ./dev/scripts/setup/devcontainer-setup.sh
#   Dry-run: ./dev/scripts/setup/devcontainer-setup.sh --dry-run
#   Help: ./dev/scripts/setup/devcontainer-setup.sh --help

# COLORS
COLOR_GREEN="\033[32m"
COLOR_RED="\033[31m"
COLOR_YELLOW="\033[33m"
COLOR_RESET="\033[0m"

# LOGGING HELPERS
pass() { echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $1"; }
warn() { echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $1"; }
fail() { echo -e "${COLOR_RED}[FAIL]${COLOR_RESET} $1"; }

# FUNCTIONS
ensure-zsh() {
    if [ ! -d "$HOME/.oh-my-zsh" ]; then
        if [[ "$DRY_RUN" == true ]]; then
            echo "Would install Oh My Zsh"
        else
            echo "Oh My Zsh not found. Installing..."
            # Install Oh My Zsh silently, without changing the shell or overwriting .zshrc
            RUNZSH=no CHSH=no KEEP_ZSHRC=yes sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
            pass "Oh My Zsh installed"
        fi
    fi
}

install-zsh-plugin() {
    local plugin_url=$1
    local plugin_dir=$2
    if [ ! -d "$plugin_dir" ]; then
        if [[ "$DRY_RUN" == true ]]; then
            pass "Would install ZSH plugin from $plugin_url to $plugin_dir"
        else
            git clone "$plugin_url" "$plugin_dir"
            pass "Installed ZSH plugin from $plugin_url"
        fi
    else
        warn "ZSH plugin at $plugin_dir already exists. Skipping."
    fi
}


# MAIN SCRIPT
section() { echo -e "\n== $1 =="; }

echo "🚀 Starting devcontainer setup..."

section "📁 Git Configuration"
if [[ "$DRY_RUN" == true ]]; then
    echo "Would configure Git safe directory"
    pass "Git safe directory configured (dry-run)"
else
    echo "Configuring Git safe directory..."
    git config --global --add safe.directory "$(pwd)"
    pass "Git safe directory configured"
fi

section "Dependencies"
if [[ "$DRY_RUN" == true ]]; then
    echo "📦 Would install npm dependencies"
    pass "npm dependencies installed (dry-run)"
else
    echo "📦 Installing npm dependencies..."
    npm install
    pass "npm dependencies installed"
fi

section "Setting up ZSH"
if [[ "$DRY_RUN" == true ]]; then
    echo "▶️ Would set up ZSH configuration"
    echo "Would copy .devcontainer/.zshrc to ~/.zshrc"
else
    echo "▶️ Setting up ZSH configuration..."
    # Ensure Oh My Zsh is installed
    ensure-zsh
    cp .devcontainer/.zshrc ~/.zshrc
fi
echo "Ensuring ZSH plugins are installed..."
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
install-zsh-plugin https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM}/plugins/zsh-autosuggestions
# zsh-syntax-highlighting
install-zsh-plugin https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM}/plugins/zsh-syntax-highlighting
# zsh-completions
install-zsh-plugin https://github.com/zsh-users/zsh-completions.git ${ZSH_CUSTOM}/plugins/zsh-completions
pass "ZSH configuration applied"

section "Git Hooks"
if [[ "$DRY_RUN" == true ]]; then
    echo "🪝 Would install Git hooks"
    pass "Git hooks installed (dry-run)"
else
    echo "🪝 Installing Git hooks..."
    npm run prepare
    pass "Git hooks installed"
fi

section "Install Foundry VTT (will be deprecated when the containerized app is available)"
if [[ "$DRY_RUN" == true ]]; then
    echo "📦 Would install Foundry VTT"
    pass "Foundry VTT installed (dry-run)"
else
    echo "📦 Installing Foundry VTT..."
    # Create application and user data directories
    cd $HOME
    mkdir foundryvtt
    mkdir foundrydata

    # Install the software
    cd foundryvtt
    wget -O foundryvtt.zip "$FOUNDRY_DOWNLOAD_URL"
    unzip foundryvtt.zip
    echo "Foundry VTT installed in $HOME/foundryvtt"
    echo "User data directory is $HOME/foundrydata"
    echo "You can run Foundry VTT with: npm run run-foundry"
    echo "Make sure to set up your configuration on first run."
    pass "Foundry VTT installed"
fi

if [[ "$DRY_RUN" == true ]]; then
    section "Dry-run Complete"
    echo "🎭 Dry-run finished! No changes were made."
else
    section "Setup Complete"
    echo "🎉 Devcontainer setup finished!"
fi
