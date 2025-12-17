#!/bin/bash

# ============================================================
# Sometimes App - Build Tools Installer
# ============================================================
# This script installs all dependencies required for local
# iOS/Android builds and sets up the 'build-sometimes-app' command.
#
# Usage: ./scripts/install-build-tools.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_SCRIPT="$PROJECT_ROOT/scripts/build.sh"

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Sometimes App - Build Tools Installer${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running on macOS
check_macos() {
    if [[ "$(uname)" != "Darwin" ]]; then
        print_error "This script only supports macOS"
        exit 1
    fi
    print_success "macOS detected: $(sw_vers -productVersion)"
}

# Check and install Homebrew
install_homebrew() {
    print_step "Checking Homebrew..."

    if command -v brew &> /dev/null; then
        print_success "Homebrew already installed: $(brew --version | head -1)"
    else
        print_warning "Homebrew not found. Installing..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

        # Add to PATH for Apple Silicon
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi

        print_success "Homebrew installed"
    fi
}

# Install Fastlane
install_fastlane() {
    print_step "Checking Fastlane..."

    if command -v fastlane &> /dev/null; then
        print_success "Fastlane already installed: $(fastlane --version 2>/dev/null | grep fastlane | head -1)"
    else
        print_warning "Fastlane not found. Installing via Homebrew..."
        brew install fastlane
        print_success "Fastlane installed"
    fi
}

# Install CocoaPods
install_cocoapods() {
    print_step "Checking CocoaPods..."

    if command -v pod &> /dev/null; then
        print_success "CocoaPods already installed: $(pod --version)"
    else
        print_warning "CocoaPods not found. Installing via Homebrew..."
        brew install cocoapods
        print_success "CocoaPods installed"
    fi
}

# Install EAS CLI
install_eas_cli() {
    print_step "Checking EAS CLI..."

    if command -v eas &> /dev/null; then
        local current_version=$(eas --version 2>/dev/null | head -1)
        print_success "EAS CLI already installed: $current_version"

        # Check for updates
        print_step "Checking for EAS CLI updates..."
        npm install -g eas-cli@latest 2>/dev/null || true
        print_success "EAS CLI is up to date"
    else
        print_warning "EAS CLI not found. Installing..."
        npm install -g eas-cli
        print_success "EAS CLI installed"
    fi
}

# Install Java (required for Android builds)
install_java() {
    print_step "Checking Java (required for Android builds)..."

    if command -v java &> /dev/null; then
        print_success "Java already installed: $(java -version 2>&1 | head -1)"
    else
        print_warning "Java not found. Installing OpenJDK 17..."
        brew install openjdk@17

        # Symlink for system Java wrappers
        sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk 2>/dev/null || true

        print_success "Java installed"
    fi
}

# Detect shell config file
detect_shell_config() {
    if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
        SHELL_CONFIG="$HOME/.bashrc"
    else
        SHELL_CONFIG="$HOME/.zshrc"
    fi
}

# Setup build-sometimes-app command
setup_command_alias() {
    print_step "Setting up 'build-sometimes-app' command..."

    detect_shell_config

    local alias_line="alias build-sometimes-app='$BUILD_SCRIPT'"
    local marker="# Sometimes App Build Command"

    # Check if already added
    if grep -q "build-sometimes-app" "$SHELL_CONFIG" 2>/dev/null; then
        print_warning "Command already exists in $SHELL_CONFIG. Updating..."
        # Remove old entry
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "/$marker/d" "$SHELL_CONFIG" 2>/dev/null || true
            sed -i '' "/build-sometimes-app/d" "$SHELL_CONFIG" 2>/dev/null || true
        else
            sed -i "/$marker/d" "$SHELL_CONFIG" 2>/dev/null || true
            sed -i "/build-sometimes-app/d" "$SHELL_CONFIG" 2>/dev/null || true
        fi
    fi

    # Add new entry
    echo "" >> "$SHELL_CONFIG"
    echo "$marker" >> "$SHELL_CONFIG"
    echo "$alias_line" >> "$SHELL_CONFIG"

    print_success "Added 'build-sometimes-app' command to $SHELL_CONFIG"
}

# Verify all installations
verify_installations() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}Installation Summary${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""

    local all_ok=true

    # Homebrew
    if command -v brew &> /dev/null; then
        echo -e "  Homebrew:    ${GREEN}✓${NC} $(brew --version | head -1)"
    else
        echo -e "  Homebrew:    ${RED}✗ Not installed${NC}"
        all_ok=false
    fi

    # Fastlane
    if command -v fastlane &> /dev/null; then
        echo -e "  Fastlane:    ${GREEN}✓${NC} $(fastlane --version 2>/dev/null | grep fastlane | head -1 || echo 'installed')"
    else
        echo -e "  Fastlane:    ${RED}✗ Not installed${NC}"
        all_ok=false
    fi

    # CocoaPods
    if command -v pod &> /dev/null; then
        echo -e "  CocoaPods:   ${GREEN}✓${NC} $(pod --version)"
    else
        echo -e "  CocoaPods:   ${RED}✗ Not installed${NC}"
        all_ok=false
    fi

    # EAS CLI
    if command -v eas &> /dev/null; then
        echo -e "  EAS CLI:     ${GREEN}✓${NC} $(eas --version 2>/dev/null | head -1)"
    else
        echo -e "  EAS CLI:     ${RED}✗ Not installed${NC}"
        all_ok=false
    fi

    # Java
    if command -v java &> /dev/null; then
        echo -e "  Java:        ${GREEN}✓${NC} $(java -version 2>&1 | head -1)"
    else
        echo -e "  Java:        ${YELLOW}! Not installed (needed for Android)${NC}"
    fi

    # Xcode
    if command -v xcodebuild &> /dev/null; then
        echo -e "  Xcode:       ${GREEN}✓${NC} $(xcodebuild -version | head -1)"
    else
        echo -e "  Xcode:       ${YELLOW}! Not installed (needed for iOS)${NC}"
    fi

    echo ""

    if $all_ok; then
        return 0
    else
        return 1
    fi
}

# Print usage instructions
print_usage() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}Setup Complete!${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
    echo -e "To apply changes, run:"
    echo -e "  ${CYAN}source $SHELL_CONFIG${NC}"
    echo ""
    echo -e "Or restart your terminal, then run:"
    echo -e "  ${CYAN}build-sometimes-app${NC}"
    echo ""
    echo -e "This will launch the interactive build menu where you can:"
    echo -e "  • Select platform (iOS/Android/Both)"
    echo -e "  • Select environment (Production/Preview/Development)"
    echo -e "  • Build locally without EAS cloud queue"
    echo ""
    echo -e "Alternative commands:"
    echo -e "  ${CYAN}npm run build${NC}              - Same as build-sometimes-app"
    echo -e "  ${CYAN}npm run build:ios${NC}          - Direct iOS production build"
    echo -e "  ${CYAN}npm run build:android${NC}      - Direct Android production build"
    echo ""
}

# Main
main() {
    print_header

    check_macos
    install_homebrew
    install_fastlane
    install_cocoapods
    install_eas_cli
    install_java
    setup_command_alias

    echo ""
    if verify_installations; then
        print_usage
    else
        echo ""
        print_error "Some installations failed. Please check the errors above."
        exit 1
    fi
}

main
