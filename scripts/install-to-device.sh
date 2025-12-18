#!/bin/bash

# ============================================================
# Install IPA to Connected iPhone
# ============================================================
# Usage: ./scripts/install-to-device.sh [build-directory]
# Example: ./scripts/install-to-device.sh builds/preview_20251218_020430
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Build directory argument
BUILD_DIR="${1:-}"

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Install IPA to Connected iPhone${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# If no argument, find the most recent build directory
if [ -z "$BUILD_DIR" ]; then
    print_step "Looking for most recent build..."
    BUILD_DIR=$(find "$PROJECT_ROOT/builds" -type d -maxdepth 1 -name "preview_*" -o -name "production_*" -o -name "development_*" 2>/dev/null | sort -r | head -1)

    if [ -z "$BUILD_DIR" ]; then
        print_error "No build directory found"
        echo "Usage: $0 [build-directory]"
        echo "Example: $0 builds/preview_20251218_020430"
        exit 1
    fi

    print_success "Found: $BUILD_DIR"
fi

# Resolve relative path
if [[ "$BUILD_DIR" != /* ]]; then
    BUILD_DIR="$PROJECT_ROOT/$BUILD_DIR"
fi

# Check if directory exists
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Directory not found: $BUILD_DIR"
    exit 1
fi

# Find IPA file
print_step "Looking for IPA file..."
IPA_FILE=$(find "$BUILD_DIR" -name "*.ipa" -type f | head -1)

if [ -z "$IPA_FILE" ]; then
    print_error "No IPA file found in: $BUILD_DIR"
    exit 1
fi

print_success "Found: $(basename "$IPA_FILE")"
echo ""

# Check for connected devices
print_step "Checking for connected iOS devices..."

CONNECTED_DEVICES=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | grep "connected" || true)

if [ -z "$CONNECTED_DEVICES" ]; then
    print_error "No iPhone or iPad connected via USB"
    echo ""
    echo "Please connect your device and try again."
    exit 1
fi

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${BOLD}Connected iOS Devices:${NC}"
echo "$CONNECTED_DEVICES"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Get device ID (first connected device)
DEVICE_ID=$(echo "$CONNECTED_DEVICES" | head -1 | awk '{print $3}')

if [ -z "$DEVICE_ID" ]; then
    print_error "Could not extract device ID"
    exit 1
fi

# Confirm installation
read -p "Install $(basename "$IPA_FILE") to device? [y/N]: " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

# Install IPA
echo ""
print_step "Installing to device..."
echo -e "${CYAN}Device ID: $DEVICE_ID${NC}"
echo -e "${CYAN}IPA: $(basename "$IPA_FILE")${NC}"
echo ""

if xcrun devicectl device install app --device "$DEVICE_ID" "$IPA_FILE"; then
    echo ""
    print_success "App installed successfully! 🎉"

    # macOS notification
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript <<EOF
display notification "썸타임 앱이 iPhone에 설치되었습니다!" with title "App Installed ✅" sound name "Glass"
EOF
        afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
    fi
else
    echo ""
    print_error "Installation failed"

    # macOS notification
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript <<EOF
display notification "앱 설치에 실패했습니다." with title "Installation Failed ❌" sound name "Basso"
EOF
        afplay /System/Library/Sounds/Basso.aiff 2>/dev/null &
    fi
    exit 1
fi
