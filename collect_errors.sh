#!/bin/bash

echo "📋 Sometimes App 오류 로그 수집"
echo "==============================="

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="crash_log_${TIMESTAMP}.txt"

# 기존 로그 클리어
adb logcat -c

echo "📱 앱을 실행하고 문제를 재현한 후 Enter를 누르세요..."
read

# 로그 수집
echo "📝 로그 수集中..."
adb logcat -d > "$LOG_FILE"

# 관련 로그만 필터링
echo "🔍 관련 로그 필터링..."
grep -E "(com\.sometimesapp|FATAL|AndroidRuntime|CRASH|Exception|Error)" "$LOG_FILE" > "filtered_${LOG_FILE}"

echo "✅ 로그 저장 완료:"
echo "   - 전체 로그: $LOG_FILE"
echo "   - 필터링 로그: filtered_${LOG_FILE}"

# 가장 최근 오류 표시
echo ""
echo "🚨 최근 오류 로그:"
echo "=================="
tail -50 "filtered_${LOG_FILE}"