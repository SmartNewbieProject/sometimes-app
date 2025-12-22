#!/bin/bash

# ============================================================
# iOS Development Mode (Xcode + Metro)
# ============================================================
# 빠른 개발을 위한 Metro 연결 개발 모드
# ============================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Sometimes App - iOS Development Mode${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# 환경 선택
echo -e "${YELLOW}어떤 환경으로 실행하시겠습니까?${NC}"
echo "  1) Development (로컬 개발 서버: 192.168.219.49:8044)"
echo "  2) Preview (프로덕션 서버: api.some-in-univ.com)"
echo ""
read -p "선택 [1-2]: " env_choice

case $env_choice in
    1)
        ENV_FILE=".env"
        echo -e "${GREEN}✓ Development 환경 (내부 서버)${NC}"
        ;;
    2)
        ENV_FILE=".env.preview"
        echo -e "${GREEN}✓ Preview 환경 (프로덕션 서버)${NC}"
        ;;
    *)
        echo "잘못된 선택입니다."
        exit 1
        ;;
esac

# 환경 변수 로드
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo -e "${GREEN}✓ 환경 변수 로드: $ENV_FILE${NC}"
    echo -e "${CYAN}  API URL: $EXPO_PUBLIC_API_URL${NC}"
else
    echo -e "${YELLOW}⚠️  $ENV_FILE 파일을 찾을 수 없습니다. .env 사용${NC}"
    export $(grep -v '^#' .env | xargs)
fi

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}Metro 서버를 시작합니다...${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""
echo "터미널을 열어두고, Xcode에서 앱을 실행하세요:"
echo ""
echo -e "  1. Xcode 실행: ${CYAN}open ios/sometimes.xcworkspace${NC}"
echo "  2. iPhone 선택"
echo "  3. ▶️ 버튼 클릭"
echo ""
echo -e "${YELLOW}Tip: 코드 수정 시 자동으로 Hot Reload됩니다!${NC}"
echo ""

# Metro 시작
npm start
