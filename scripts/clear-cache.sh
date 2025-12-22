#!/bin/bash

echo "🧹 Clearing all caches for Sometimes App..."

# 1. Metro bundler cache 삭제
echo "📦 Clearing Metro bundler cache..."
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*
rm -rf $TMPDIR/react-native-packager-cache-*

# 2. Watchman cache 삭제 (설치되어 있는 경우)
if command -v watchman &> /dev/null; then
    echo "👁️  Clearing Watchman cache..."
    watchman watch-del-all
fi

# 3. Node modules 재설치
echo "📚 Clearing node_modules..."
rm -rf node_modules

# 4. Lock file 삭제 (선택적)
if [ "$1" == "--hard" ]; then
    echo "🔒 Removing lock files..."
    rm -f package-lock.json
    rm -f yarn.lock
    rm -f pnpm-lock.yaml
fi

echo "✅ Cache cleared! Now run: npm install && npm start"
