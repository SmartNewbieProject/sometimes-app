#!/bin/bash
# i18n 배치 마이그레이션 도구
# 사용법: ./scripts/i18n-batch-migrate.sh <directory> [--limit N]

set -e

DIRECTORY=$1
LIMIT=${3:-0}  # --limit 뒤의 숫자

if [ -z "$DIRECTORY" ]; then
  echo "❌ 사용법: ./i18n-batch-migrate.sh <directory> [--limit N]"
  exit 1
fi

# 색상
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 배치 마이그레이션 시작: $DIRECTORY${NC}"
echo ""

# 제외할 파일 패턴
EXCLUDE_PATTERNS=(
  "*/locales/*"
  "*/lib/university.ts"
  "*/lib/area.ts"
  "*/.test.*"
  "*/.spec.*"
)

# 제외 패턴을 find 옵션으로 변환
FIND_EXCLUDE=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  FIND_EXCLUDE="$FIND_EXCLUDE -not -path '$pattern'"
done

# 한글이 있고 아직 t() 함수를 사용하지 않는 파일 찾기
count=0
total=0

echo -e "${BLUE}1. 대상 파일 스캔 중...${NC}"
echo ""

# 임시 파일 목록 생성
TEMP_FILE=$(mktemp)

eval "find \"$DIRECTORY\" -name '*.tsx' -o -name '*.ts' $FIND_EXCLUDE" | while read file; do
  # 한글이 있는지 확인
  if grep -q '[가-힣]' "$file" 2>/dev/null; then
    # console.log만 있는 파일은 제외
    if ! grep -v 'console\.' "$file" | grep -q '[가-힣]'; then
      continue
    fi

    # 이미 많은 t() 사용 중인 파일은 제외
    t_count=$(grep -c 't(' "$file" 2>/dev/null || echo 0)
    if [ "$t_count" -lt 3 ]; then
      echo "$file" >> "$TEMP_FILE"
      ((total++))
    fi
  fi
done

echo -e "${GREEN}✓ 대상 파일: $total개${NC}"
echo ""

# Limit 적용
if [ "$LIMIT" -gt 0 ] && [ "$total" -gt "$LIMIT" ]; then
  echo -e "${YELLOW}⚠️  Limit 적용: 상위 $LIMIT개만 처리${NC}"
  total=$LIMIT
  echo ""
fi

echo -e "${BLUE}2. 마이그레이션 실행 중...${NC}"
echo ""

# 파일별 마이그레이션
while IFS= read -r file && [ "$count" -lt "${LIMIT:-999999}" ]; do
  ((count++))
  echo -e "${YELLOW}[$count/$total]${NC} $file"

  # Dry-run 먼저 실행하여 변환 가능 여부 확인
  if npm run i18n:migrate -- "$file" --dry-run 2>&1 | grep -q "총 0개 문자열"; then
    echo "  ⏭️  건너뜀 (변환할 문자열 없음)"
    echo ""
    continue
  fi

  # 실제 마이그레이션
  npm run i18n:migrate -- "$file" 2>&1 | grep -E "총 [0-9]+개|JSON 업데이트|코드 파일 업데이트" || true
  echo ""

  sleep 0.2  # API 부하 방지
done < "$TEMP_FILE"

# 임시 파일 삭제
rm -f "$TEMP_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 배치 마이그레이션 완료!${NC}"
echo ""
echo "처리된 파일: $count개"
echo ""
echo "📊 전체 현황 확인:"
echo "   npm run i18n:extract -- $DIRECTORY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
