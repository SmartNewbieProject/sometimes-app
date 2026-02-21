#!/bin/bash

# ============================================================
# Sometimes App - Delete All Caches
# ============================================================
# 환경 변수 변경이 반영되지 않을 때 실행
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Sometimes App - Cache Cleaner${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# 1. Metro bundler cache
echo -e "${YELLOW}[1/7]${NC} Metro bundler cache..."
rm -rf "$PROJECT_ROOT/node_modules/.cache" 2>/dev/null && echo -e "  ${GREEN}✓${NC} node_modules/.cache"
rm -rf "$TMPDIR/metro-*" 2>/dev/null && echo -e "  ${GREEN}✓${NC} metro temp files"
rm -rf "$TMPDIR/haste-map-*" 2>/dev/null && echo -e "  ${GREEN}✓${NC} haste-map cache"

# 2. Expo cache
echo -e "${YELLOW}[2/7]${NC} Expo cache..."
rm -rf "$PROJECT_ROOT/.expo" 2>/dev/null && echo -e "  ${GREEN}✓${NC} .expo"
rm -rf ~/.expo/web-build-cache 2>/dev/null && echo -e "  ${GREEN}✓${NC} expo web-build-cache"

# 3. React Native cache
echo -e "${YELLOW}[3/7]${NC} React Native cache..."
rm -rf "$TMPDIR/react-*" 2>/dev/null && echo -e "  ${GREEN}✓${NC} react temp files"

# 4. Watchman cache (if installed)
echo -e "${YELLOW}[4/7]${NC} Watchman cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null && echo -e "  ${GREEN}✓${NC} watchman watches cleared"
else
    echo -e "  ${YELLOW}-${NC} watchman not installed (skip)"
fi

# 5. Babel cache
echo -e "${YELLOW}[5/7]${NC} Babel cache..."
rm -rf "$PROJECT_ROOT/node_modules/.cache/babel-loader" 2>/dev/null && echo -e "  ${GREEN}✓${NC} babel-loader cache"

# 6. iOS build cache (optional)
echo -e "${YELLOW}[6/7]${NC} iOS build cache..."
rm -rf "$PROJECT_ROOT/ios/build" 2>/dev/null && echo -e "  ${GREEN}✓${NC} ios/build"
rm -rf "$PROJECT_ROOT/ios/Pods" 2>/dev/null && echo -e "  ${GREEN}✓${NC} ios/Pods"

# 7. Android build cache (optional)
echo -e "${YELLOW}[7/7]${NC} Android build cache..."
rm -rf "$PROJECT_ROOT/android/build" 2>/dev/null && echo -e "  ${GREEN}✓${NC} android/build"
rm -rf "$PROJECT_ROOT/android/app/build" 2>/dev/null && echo -e "  ${GREEN}✓${NC} android/app/build"
rm -rf "$PROJECT_ROOT/android/.gradle" 2>/dev/null && echo -e "  ${GREEN}✓${NC} android/.gradle"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All caches deleted!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. npm start -- --clear"
echo "  2. Or: npm run start:clean"
echo ""
