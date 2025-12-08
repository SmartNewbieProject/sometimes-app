#!/bin/bash

echo "🔍 Sometimes App 크래시 로그 모니터링"
echo "=================================="

# 기기 연결 확인
if ! adb devices | grep -q "device"; then
    echo "❌ 안드로이드 기기가 연결되지 않았습니다"
    echo "USB 디버깅을 활성화하고 기기를 연결해주세요"
    exit 1
fi

echo "✅ 안드로이드 기기 연결됨"
echo "📱 앱을 실행하고 크래시를 재현해주세요..."
echo "🛑 Ctrl+C로 종료할 수 있습니다"
echo ""

# 실시간 로그 필터링
adb logcat -c  # 기존 로그 클리어
adb logcat | grep -E "(com\.sometimesapp|FATAL|AndroidRuntime|CRASH)" | while read line; do
    echo "🚨 $line"
done