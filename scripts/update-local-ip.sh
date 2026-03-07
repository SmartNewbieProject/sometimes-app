#!/bin/bash
# 현재 Mac의 네트워크 IP를 감지하여 .env.local의 서버 IP를 업데이트

ENV_FILE="$(dirname "$0")/../.env.local"
PORT=8044

if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  .env.local 파일이 없습니다."
  exit 0
fi

# 현재 활성 네트워크 인터페이스의 IP 감지
CURRENT_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

if [ -z "$CURRENT_IP" ]; then
  echo "⚠️  네트워크 IP를 감지할 수 없습니다. Wi-Fi 연결을 확인하세요."
  exit 0
fi

# .env.local에서 기존 IP 추출
OLD_IP=$(grep -oP '(?<=http://)[0-9.]+(?=:'"$PORT"')' "$ENV_FILE" 2>/dev/null \
  || grep -oE 'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:'"$PORT" "$ENV_FILE" | head -1 | sed "s|http://||;s|:$PORT||")

if [ -z "$OLD_IP" ]; then
  echo "⚠️  .env.local에서 서버 IP를 찾을 수 없습니다."
  exit 0
fi

if [ "$CURRENT_IP" = "$OLD_IP" ]; then
  echo "✅ IP 변경 없음: $CURRENT_IP"
else
  # macOS sed는 -i '' 필요
  sed -i '' "s|$OLD_IP|$CURRENT_IP|g" "$ENV_FILE"
  echo "🔄 IP 업데이트: $OLD_IP → $CURRENT_IP"
fi
