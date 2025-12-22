#!/bin/bash

# ============================================================
# Quick TestFlight Submit - 최신 빌드를 TestFlight에 제출
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
echo -e "${CYAN}  Sometimes App - TestFlight Submit${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Check if API key file exists
if [ ! -f "./AuthKey.p8" ]; then
    echo -e "${RED}[ERROR]${NC} AuthKey.p8 not found in project root"
    echo ""
    echo "Expected location: ./AuthKey.p8"
    echo ""
    echo "Alternative: Use Transporter app for manual upload:"
    echo -e "  ${CYAN}open -a Transporter${NC}"
    echo ""
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} API Key found: ./AuthKey.p8"

# Load environment variables from .env.production
if [ -f ".env.production" ]; then
    echo -e "${BLUE}[INFO]${NC} Loading environment variables from .env.production"
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip empty lines and comments
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        # Export the variable
        export "$line"
    done < ".env.production"
fi

# Find latest IPA file
LATEST_IPA=$(find "$PROJECT_ROOT/builds" -name "*.ipa" -type f -print0 | xargs -0 ls -t | head -1)

if [ -z "$LATEST_IPA" ]; then
    echo -e "${RED}[ERROR]${NC} No IPA file found in builds/ directory"
    echo ""
    echo "Please build first:"
    echo -e "  ${CYAN}./scripts/build.sh${NC}"
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Latest build:"
echo -e "  ${GREEN}$(basename "$LATEST_IPA")${NC}"
echo -e "  ${GREEN}$(ls -lh "$LATEST_IPA" | awk '{print $5}')${NC}"
echo ""

read -p "Submit this build to TestFlight? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}[STEP]${NC} Submitting to TestFlight..."
echo ""

if eas submit --platform ios --profile production --path "$LATEST_IPA" --non-interactive; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  ✅ Submitted to TestFlight!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "Check status at: ${CYAN}https://appstoreconnect.apple.com${NC}"
    echo ""

    # macOS notification
    osascript <<EOF
display notification "앱이 TestFlight에 업로드되었습니다. 검토 대기 중..." with title "TestFlight Upload Complete 🚀" sound name "Glass"
EOF

    # Play success sound
    afplay /System/Library/Sounds/Glass.aiff &
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}  ❌ TestFlight submission failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    echo -e "${YELLOW}Alternative: Use Transporter app${NC}"
    echo -e "  ${CYAN}open -a Transporter${NC}"
    echo ""
    echo "Then drag and drop:"
    echo -e "  ${CYAN}$LATEST_IPA${NC}"
    echo ""

    # macOS notification
    osascript <<EOF
display notification "TestFlight 제출에 실패했습니다." with title "Upload Failed ❌" sound name "Basso"
EOF

    # Play error sound
    afplay /System/Library/Sounds/Basso.aiff &

    exit 1
fi
