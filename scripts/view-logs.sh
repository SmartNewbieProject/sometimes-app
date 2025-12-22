#!/bin/bash

# ============================================================
# iPhone 로그 보기 스크립트
# ============================================================
# USB로 연결된 iPhone의 로그를 실시간으로 확인합니다.
# ============================================================

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  Sometimes App - iPhone 로그 보기${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Check if iPhone is connected
if ! idevice_id -l &> /dev/null; then
    echo -e "${YELLOW}⚠️  연결된 iPhone을 찾을 수 없습니다.${NC}"
    echo ""
    echo "다음을 확인하세요:"
    echo "  1. iPhone이 USB로 연결되어 있는지"
    echo "  2. iPhone에서 '이 컴퓨터를 신뢰하시겠습니까?' 승인했는지"
    echo ""
    exit 1
fi

DEVICE_NAME=$(ideviceinfo -k DeviceName 2>/dev/null || echo "Unknown Device")
echo -e "${GREEN}✓ 연결된 기기: $DEVICE_NAME${NC}"
echo ""
echo -e "${CYAN}필터 옵션:${NC}"
echo "  1) 전체 로그 보기"
echo "  2) Sometimes 앱 로그만 보기"
echo "  3) API 관련 로그만 보기"
echo "  4) 에러 로그만 보기"
echo ""
read -p "선택 [1-4]: " choice

echo ""
echo -e "${GREEN}로그 스트리밍 시작... (Ctrl+C로 종료)${NC}"
echo ""

case $choice in
    1)
        idevicesyslog
        ;;
    2)
        idevicesyslog | grep -i "sometimes\|expo"
        ;;
    3)
        idevicesyslog | grep -i "API\|axios\|baseURL"
        ;;
    4)
        idevicesyslog | grep -i "error\|fail\|exception"
        ;;
    *)
        echo "잘못된 선택입니다."
        exit 1
        ;;
esac
