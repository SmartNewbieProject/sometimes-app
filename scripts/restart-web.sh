#!/bin/bash

echo "🔄 Restarting Expo Web with clean cache..."

# 1. 기존 프로세스 종료
echo "🛑 Stopping existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Metro cache 클리어
echo "🧹 Clearing Metro cache..."
rm -rf .expo/web
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# 3. 웹 서버 재시작
echo "🚀 Starting Expo web server..."
npx expo start --web --clear --port 3000
