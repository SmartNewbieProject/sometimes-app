#!/bin/bash

# ============================================================
# Android SDK Setup Script for Local Builds
# ============================================================
# This script sets up Android SDK for EAS local builds
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Android SDK Setup for Local Builds${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Android Studio is installed
check_android_studio() {
    if [ -d "/Applications/Android Studio.app" ]; then
        print_success "Android Studio is installed"
        return 0
    else
        print_warning "Android Studio is not installed"
        return 1
    fi
}

# Find Android SDK location
find_android_sdk() {
    local sdk_locations=(
        "$HOME/Library/Android/sdk"
        "$ANDROID_HOME"
        "$ANDROID_SDK_ROOT"
    )

    for location in "${sdk_locations[@]}"; do
        if [ -d "$location" ]; then
            echo "$location"
            return 0
        fi
    done

    return 1
}

# Setup Android SDK via Homebrew
setup_android_sdk_homebrew() {
    print_step "Installing Android SDK via Homebrew..."

    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed. Please install it first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi

    # Install Android SDK command line tools
    brew install --cask android-commandlinetools

    # Set default location
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    mkdir -p "$ANDROID_HOME"

    print_success "Android SDK installed"
}

# Install required SDK components
install_sdk_components() {
    local android_sdk="$1"

    print_step "Installing required SDK components..."

    export ANDROID_HOME="$android_sdk"
    export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

    # Accept licenses
    yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses 2>/dev/null || true

    # Install required components
    "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" \
        "platform-tools" \
        "platforms;android-34" \
        "build-tools;34.0.0" \
        "ndk;26.1.10909125" \
        "cmake;3.22.1"

    print_success "SDK components installed"
}

# Setup environment variables
setup_environment() {
    local android_sdk="$1"
    local shell_rc=""

    # Detect shell
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        shell_rc="$HOME/.bash_profile"
    else
        print_warning "Unknown shell: $SHELL. Please set ANDROID_HOME manually."
        return 1
    fi

    print_step "Setting up environment variables in $shell_rc..."

    # Check if already configured
    if grep -q "ANDROID_HOME" "$shell_rc" 2>/dev/null; then
        print_warning "ANDROID_HOME already configured in $shell_rc"
        return 0
    fi

    # Add Android SDK to shell config
    cat >> "$shell_rc" <<EOF

# Android SDK (added by Sometimes App build script)
export ANDROID_HOME="$android_sdk"
export PATH="\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/emulator:\$PATH"
EOF

    print_success "Environment variables configured"
    echo -e "${YELLOW}Please restart your terminal or run:${NC}"
    echo -e "  ${CYAN}source $shell_rc${NC}"
}

main() {
    print_header

    # Check if ANDROID_HOME is already set
    if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
        print_success "ANDROID_HOME is already set: $ANDROID_HOME"
        echo ""
        echo -e "${GREEN}Android SDK is ready for local builds!${NC}"
        exit 0
    fi

    # Try to find existing Android SDK
    print_step "Searching for existing Android SDK..."
    if android_sdk=$(find_android_sdk); then
        print_success "Found Android SDK at: $android_sdk"
        export ANDROID_HOME="$android_sdk"
        setup_environment "$android_sdk"
        echo ""
        echo -e "${GREEN}Android SDK is ready!${NC}"
        echo -e "${YELLOW}Please restart your terminal or run:${NC}"
        echo -e "  ${CYAN}source ~/.zshrc${NC} (or ~/.bash_profile)"
        exit 0
    fi

    # Ask user if they want to install Android SDK
    print_warning "Android SDK not found"
    echo ""
    echo "Options:"
    echo "  1) Install Android SDK via Homebrew (recommended for CLI-only)"
    echo "  2) Install Android Studio (recommended for full development)"
    echo "  3) Exit (manual setup)"
    echo ""
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            setup_android_sdk_homebrew
            android_sdk="$HOME/Library/Android/sdk"
            install_sdk_components "$android_sdk"
            setup_environment "$android_sdk"
            echo ""
            echo -e "${GREEN}============================================================${NC}"
            echo -e "${GREEN}  Android SDK Setup Complete!${NC}"
            echo -e "${GREEN}============================================================${NC}"
            echo -e "${YELLOW}Please restart your terminal or run:${NC}"
            echo -e "  ${CYAN}source ~/.zshrc${NC} (or ~/.bash_profile)"
            ;;
        2)
            echo ""
            echo -e "${CYAN}Please install Android Studio:${NC}"
            echo -e "  1. Download from: ${CYAN}https://developer.android.com/studio${NC}"
            echo -e "  2. Install and open Android Studio"
            echo -e "  3. Follow the setup wizard to install Android SDK"
            echo -e "  4. Run this script again"
            ;;
        3)
            echo ""
            echo -e "${YELLOW}Manual setup required:${NC}"
            echo -e "  1. Install Android SDK"
            echo -e "  2. Set ANDROID_HOME environment variable"
            echo -e "  3. Add to PATH: \$ANDROID_HOME/platform-tools"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

main
