#!/bin/bash
# i18n 마이그레이션 빠른 시작 가이드

set -e

echo "🚀 i18n 마이그레이션 빠른 시작"
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 의존성 확인
echo -e "${BLUE}1. 의존성 확인 중...${NC}"
if ! npm list tsx &> /dev/null; then
  echo -e "${YELLOW}tsx가 설치되어 있지 않습니다. 설치 중...${NC}"
  npm install --save-dev tsx glob
else
  echo -e "${GREEN}✓ tsx 설치됨${NC}"
fi

if ! npm list glob &> /dev/null; then
  echo -e "${YELLOW}glob이 설치되어 있지 않습니다. 설치 중...${NC}"
  npm install --save-dev glob
else
  echo -e "${GREEN}✓ glob 설치됨${NC}"
fi

echo ""

# 2. 전체 분석
echo -e "${BLUE}2. 전체 프로젝트 분석 중...${NC}"
echo "   (상위 20개 파일만 표시됩니다)"
echo ""

npm run i18n:extract -- src

echo ""

# 3. 결과 확인
if [ -f "scripts/i18n-report.json" ]; then
  echo -e "${GREEN}✓ 분석 완료!${NC}"
  echo ""
  echo "📊 상세 보고서: scripts/i18n-report.json"
  echo ""

  # jq가 있으면 요약 정보 출력
  if command -v jq &> /dev/null; then
    echo "📈 요약:"
    jq '.summary' scripts/i18n-report.json
  fi
else
  echo -e "${YELLOW}⚠️  보고서 파일을 찾을 수 없습니다.${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 다음 단계:"
echo ""
echo "1. 보고서 검토:"
echo "   cat scripts/i18n-report.json | jq '.files[:5]'"
echo ""
echo "2. 특정 파일 마이그레이션 (Dry-run):"
echo "   npm run i18n:migrate -- src/features/match/constants/miho-messages.ts --dry-run"
echo ""
echo "3. 실제 마이그레이션:"
echo "   npm run i18n:migrate -- src/features/match/constants/miho-messages.ts"
echo ""
echo "4. 자세한 가이드:"
echo "   cat scripts/README-i18n.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
