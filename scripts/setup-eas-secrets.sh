#!/bin/bash

# ============================================================
# EAS Secrets 일괄 등록 스크립트
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
echo -e "${CYAN}  EAS Secrets 등록${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

if [ ! -f ".env.production" ]; then
    echo -e "${RED}[ERROR]${NC} .env.production 파일이 없습니다"
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} .env.production에서 환경 변수 읽는 중..."
echo ""

# Production 환경 변수 등록
echo -e "${YELLOW}📝 Production Secrets 등록:${NC}"
echo ""

while IFS='=' read -r key value; do
  # 빈 줄과 주석 건너뛰기
  if [[ -z "$key" ]] || [[ "$key" =~ ^[[:space:]]*# ]]; then
    continue
  fi

  # EXPO_PUBLIC_로 시작하는 변수만 등록
  if [[ "$key" =~ ^EXPO_PUBLIC_ ]]; then
    echo -e "  → ${GREEN}$key${NC}"

    # EAS Secret 생성 (--force로 기존 값 덮어쓰기)
    eas secret:create \
      --scope project \
      --name "$key" \
      --value "$value" \
      --type string \
      --force \
      --non-interactive 2>/dev/null || echo -e "    ${YELLOW}⚠️  생성 실패 (이미 존재하거나 권한 없음)${NC}"
  fi
done < .env.production

echo ""

# Preview 환경 변수 등록 (다른 값들)
if [ -f ".env.preview" ]; then
    echo -e "${YELLOW}📝 Preview Secrets 등록 (_PREVIEW 접미사):${NC}"
    echo ""

    # Preview 전용 변수들
    PREVIEW_API_URL=$(grep "^EXPO_PUBLIC_API_URL=" .env.preview | cut -d'=' -f2)
    PREVIEW_SERVER_URL=$(grep "^EXPO_PUBLIC_SERVER_URL=" .env.preview | cut -d'=' -f2)
    PREVIEW_CHANNEL_KEY=$(grep "^EXPO_PUBLIC_CHANNEL_KEY=" .env.preview | cut -d'=' -f2)
    PREVIEW_MERCHANT_ID=$(grep "^EXPO_PUBLIC_MERCHANT_ID=" .env.preview | cut -d'=' -f2)

    if [ -n "$PREVIEW_API_URL" ]; then
        echo -e "  → ${GREEN}EXPO_PUBLIC_API_URL_PREVIEW${NC}"
        eas secret:create --scope project --name "EXPO_PUBLIC_API_URL_PREVIEW" --value "$PREVIEW_API_URL" --type string --force --non-interactive 2>/dev/null || true
    fi

    if [ -n "$PREVIEW_SERVER_URL" ]; then
        echo -e "  → ${GREEN}EXPO_PUBLIC_SERVER_URL_PREVIEW${NC}"
        eas secret:create --scope project --name "EXPO_PUBLIC_SERVER_URL_PREVIEW" --value "$PREVIEW_SERVER_URL" --type string --force --non-interactive 2>/dev/null || true
    fi

    if [ -n "$PREVIEW_CHANNEL_KEY" ]; then
        echo -e "  → ${GREEN}EXPO_PUBLIC_CHANNEL_KEY_PREVIEW${NC}"
        eas secret:create --scope project --name "EXPO_PUBLIC_CHANNEL_KEY_PREVIEW" --value "$PREVIEW_CHANNEL_KEY" --type string --force --non-interactive 2>/dev/null || true
    fi

    if [ -n "$PREVIEW_MERCHANT_ID" ]; then
        echo -e "  → ${GREEN}EXPO_PUBLIC_MERCHANT_ID_PREVIEW${NC}"
        eas secret:create --scope project --name "EXPO_PUBLIC_MERCHANT_ID_PREVIEW" --value "$PREVIEW_MERCHANT_ID" --type string --force --non-interactive 2>/dev/null || true
    fi
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✅ EAS Secrets 등록 완료!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""

echo -e "${BLUE}등록된 Secrets 목록:${NC}"
eas secret:list

echo ""
echo -e "${CYAN}이제 eas.json을 안전하게 GitHub에 커밋할 수 있습니다.${NC}"
echo ""
