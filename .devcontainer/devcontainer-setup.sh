#!/usr/bin/env bash
set -euo pipefail

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
2. Copies Git config from host to inherit user.name and user.email
3. Sets Git editor to VS Code
4. Installs npm dependencies
5. Sets up Git hooks (husky)
6. Sets up ZSH configuration
7. Installs Python3 and uv (Universal Version Manager)
8. Shows available commands
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
# 2. Copies Git config from host to inherit user.name and user.email
# 3. Sets Git editor to VS Code
# 4. Installs npm dependencies
# 5. Sets up Git hooks (husky)
# 6. Sets up ZSH configuration
# 7. Installs Python3 and Uvm (Universal Version Manager)
# 8. Shows available commands
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
if [[ "$DRY_RUN" == true ]]; then
    echo "Would copy Git config from host if available"
    pass "Git config copied (dry-run)"
else
    echo "Copying Git config from host..."
    if [ -f "$HOST_HOME/.gitconfig" ]; then
        cp "$HOST_HOME/.gitconfig" ~/.gitconfig
        pass "Git config copied from host"
    else
        warn "No .gitconfig found on host. Git user.name and user.email may need to be set manually."
    fi
fi
if [[ "$DRY_RUN" == true ]]; then
    echo "Would configure Git editor to use code --wait"
    pass "Git editor configured (dry-run)"
else
    echo "Configuring Git editor to use code --wait..."
    git config --global core.editor "code --wait"
    pass "Git editor configured"
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

section "🐍 Ensure Python3 is installed"
if [[ "$DRY_RUN" == true ]]; then
    echo "Would install Python3"
else
    echo "Ensuring Python3 is installed..."
    if ! command -v python3 &> /dev/null; then
        echo "Python3 could not be found. Installing Python3..."
        apt-get update && apt-get install -y python3
        pass "Python3 installed"
    fi
fi

section "🍇 Ensure Uv is installed"
if [[ "$DRY_RUN" == true ]]; then
    echo "Would install Uv (Universal Version Manager)"
    pass "Uv installation simulated (dry-run)"
else
    if ! command -v uv &> /dev/null; then
        echo "Uv could not be found. Installing Uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        # Reload PATH to make uv command available. The installer may place the binary
        # in one of several locations depending on system and installer (e.g. ~/.local/bin,
        # ~/.cargo/bin). Add common locations to PATH so the new uv command is found.
        export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$HOME/.local/.bin:$PATH"
        pass "Uv installed"
    fi
fi

section "Install Uv Packages"
if [[ "$DRY_RUN" == true ]]; then
    echo "Would install Uv packages"
    pass "Uv packages installation simulated (dry-run)"
else
    echo "Installing Uv packages..."
    # Ensure uv is in PATH (add common install locations again in case this script
    # is executed in a new shell session)
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$HOME/.local/.bin:$PATH"

    if command -v uv &> /dev/null; then
        # Try to install the optional specify-cli tool. Use conditional checks so
        # failures here won't abort the whole postCreateCommand.
        if uv tool install specify-cli --from git+https://github.com/github/spec-kit.git; then
            pass "specify-cli installed"
        else
            warn "Failed to install specify-cli (optional). Continuing."
        fi

        # Run uv sync to create the virtual environment / install Python deps.
        # uv sync may fail if the repository isn't configured as a Python package
        # (hatchling/build issues). Don't let that failure break the whole setup;
        # warn and continue.
        if uv sync; then
            pass "Uv sync completed"
        else
            warn "uv sync failed. This usually means the Python project isn't configured for packaging (see hatchling errors). Skipping Python env setup."
        fi
    else
        warn "Uv not found in PATH. Skipping uv package installation and sync."
    fi
fi

if [[ "$DRY_RUN" == true ]]; then
    section "Dry-run Complete"
    echo "🎭 Dry-run finished! No changes were made."
else
    section "Setup Complete"
    echo "🎉 Devcontainer setup finished!"
fi
