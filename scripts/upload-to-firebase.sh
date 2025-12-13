#!/bin/bash

# ============================================================
# Upload IPA/APK to Firebase App Distribution
# ============================================================
# Usage: ./scripts/upload-to-firebase.sh <path-to-ipa-or-apk>
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_FILE="$1"

if [ -z "$APP_FILE" ]; then
    echo -e "${RED}Error: APP file path required${NC}"
    echo "Usage: $0 <path-to-ipa-or-apk>"
    exit 1
fi

if [ ! -f "$APP_FILE" ]; then
    echo -e "${RED}Error: APP file not found: $APP_FILE${NC}"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Uploading to Firebase App Distribution${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
if ! firebase projects:list &> /dev/null; then
    echo -e "${BLUE}[STEP]${NC} Please login to Firebase..."
    firebase login
fi

echo -e "${BLUE}[STEP]${NC} Uploading to Firebase App Distribution..."

# Detect platform
if [[ "$APP_FILE" == *.ipa ]]; then
    PLATFORM="ios"
elif [[ "$APP_FILE" == *.apk ]] || [[ "$APP_FILE" == *.aab ]]; then
    PLATFORM="android"
else
    echo -e "${RED}[ERROR]${NC} Unknown file type: $APP_FILE"
    exit 1
fi

# Upload to Firebase
firebase appdistribution:distribute "$APP_FILE" \
    --app "$FIREBASE_APP_ID" \
    --groups "internal-testers" \
    --release-notes "New build from local machine"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Upload Complete!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${CYAN}Testers will receive an email notification${NC}"
    echo ""

    # macOS notification
    osascript <<EOF
display notification "Firebase App Distribution 업로드 완료" with title "Firebase Upload Complete ✅" sound name "Glass"
EOF
else
    echo ""
    echo -e "${RED}[ERROR]${NC} Upload failed"
    exit 1
fi
