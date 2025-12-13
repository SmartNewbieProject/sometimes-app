#!/bin/bash

# ============================================================
# Upload IPA to Diawi for easy installation
# ============================================================
# Usage: ./scripts/upload-to-diawi.sh <path-to-ipa>
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

IPA_FILE="$1"

if [ -z "$IPA_FILE" ]; then
    echo -e "${RED}Error: IPA file path required${NC}"
    echo "Usage: $0 <path-to-ipa>"
    exit 1
fi

if [ ! -f "$IPA_FILE" ]; then
    echo -e "${RED}Error: IPA file not found: $IPA_FILE${NC}"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Uploading to Diawi${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Diawi API Token (Get from: https://www.diawi.com/dashboard/api/tokens)
DIAWI_TOKEN="${DIAWI_API_TOKEN}"

if [ -z "$DIAWI_TOKEN" ]; then
    echo -e "${YELLOW}DIAWI_API_TOKEN not set in environment${NC}"
    echo "Get your token from: https://www.diawi.com/dashboard/api/tokens"
    echo ""
    read -p "Enter your Diawi API token: " DIAWI_TOKEN
fi

echo -e "${BLUE}[STEP]${NC} Uploading IPA to Diawi..."

# Upload to Diawi
RESPONSE=$(curl -s https://upload.diawi.com/ \
    -F token="$DIAWI_TOKEN" \
    -F file=@"$IPA_FILE" \
    -F find_by_udid=0 \
    -F wall_of_apps=0)

JOB_ID=$(echo "$RESPONSE" | grep -o '"job":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo -e "${RED}[ERROR]${NC} Upload failed"
    echo "$RESPONSE"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Upload started, job ID: $JOB_ID"
echo -e "${BLUE}[STEP]${NC} Waiting for processing..."

# Poll for result
for i in {1..30}; do
    sleep 2

    STATUS=$(curl -s "https://upload.diawi.com/status?token=$DIAWI_TOKEN&job=$JOB_ID")

    # Check if completed
    if echo "$STATUS" | grep -q '"status":2000'; then
        LINK=$(echo "$STATUS" | grep -o '"link":"[^"]*' | cut -d'"' -f4)
        echo ""
        echo -e "${GREEN}============================================================${NC}"
        echo -e "${GREEN}  Upload Complete!${NC}"
        echo -e "${GREEN}============================================================${NC}"
        echo ""
        echo -e "${CYAN}Install link:${NC} https://i.diawi.com/$LINK"
        echo ""
        echo -e "${YELLOW}Share this link with testers to install the app${NC}"
        echo ""

        # Copy to clipboard
        echo "https://i.diawi.com/$LINK" | pbcopy
        echo -e "${GREEN}✓ Link copied to clipboard${NC}"

        # macOS notification
        osascript <<EOF
display notification "설치 링크가 클립보드에 복사되었습니다" with title "Diawi Upload Complete ✅" sound name "Glass"
EOF

        exit 0
    fi

    # Check if failed
    if echo "$STATUS" | grep -q '"status":4'; then
        echo -e "${RED}[ERROR]${NC} Processing failed"
        echo "$STATUS"
        exit 1
    fi

    echo -n "."
done

echo ""
echo -e "${RED}[ERROR]${NC} Timeout waiting for processing"
exit 1
