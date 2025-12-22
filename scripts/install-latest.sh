#!/bin/bash

# ============================================================
# Quick Install - 최신 빌드를 iPhone에 설치
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Sometimes App - Quick Install${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Find latest IPA file
LATEST_IPA=$(find "$PROJECT_ROOT/builds" -name "*.ipa" -type f -print0 | xargs -0 ls -t | head -1)

if [ -z "$LATEST_IPA" ]; then
    echo -e "${RED}[ERROR]${NC} No IPA file found in builds/ directory"
    echo ""
    echo "Please build first:"
    echo -e "  ${CYAN}./scripts/build.sh${NC}"
    exit 1
fi

# Check if it's a production build
BUILD_DIR=$(dirname "$LATEST_IPA")
if [[ "$BUILD_DIR" == *"production"* ]]; then
    echo -e "${RED}[ERROR]${NC} Production builds cannot be installed directly via USB!"
    echo ""
    echo -e "${YELLOW}Production builds use App Store Distribution profiles${NC}"
    echo -e "${YELLOW}and can only be installed through:${NC}"
    echo ""
    echo "  1. TestFlight:"
    echo -e "     ${CYAN}npm run submit:testflight${NC}"
    echo ""
    echo "  2. App Store (after review)"
    echo ""
    echo -e "${BLUE}For USB installation, use Preview build:${NC}"
    echo -e "  ${CYAN}npm run build:ios:preview${NC}"
    echo -e "  ${CYAN}npm run install:latest${NC}"
    echo ""
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Latest build:"
echo -e "  ${GREEN}$(basename "$LATEST_IPA")${NC}"
echo -e "  ${GREEN}$(ls -lh "$LATEST_IPA" | awk '{print $5}')${NC}"
echo ""

# Check for connected devices
CONNECTED_DEVICES=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | grep "connected" || true)

if [ -z "$CONNECTED_DEVICES" ]; then
    echo -e "${RED}[ERROR]${NC} No iPhone/iPad connected via USB"
    echo ""
    echo "Please:"
    echo "  1. Connect your iPhone/iPad via USB cable"
    echo "  2. Unlock the device"
    echo "  3. Trust this computer if prompted"
    echo "  4. Run this script again"
    exit 1
fi

echo -e "${CYAN}Connected Devices:${NC}"
echo "$CONNECTED_DEVICES"
echo ""

# Get device ID
DEVICE_ID=$(echo "$CONNECTED_DEVICES" | head -1 | awk '{print $3}')

echo -e "${BLUE}[STEP]${NC} Installing to device..."
echo -e "${CYAN}Device ID: $DEVICE_ID${NC}"
echo ""

if xcrun devicectl device install app --device "$DEVICE_ID" "$LATEST_IPA"; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  ✅ App installed successfully!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""

    # macOS notification
    osascript <<EOF
display notification "썸타임 앱이 iPhone에 설치되었습니다!" with title "App Installed ✅" sound name "Glass"
EOF

    # Play success sound
    afplay /System/Library/Sounds/Glass.aiff &
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}  ❌ Installation failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""

    # macOS notification
    osascript <<EOF
display notification "앱 설치에 실패했습니다." with title "Installation Failed ❌" sound name "Basso"
EOF

    # Play error sound
    afplay /System/Library/Sounds/Basso.aiff &

    exit 1
fi
