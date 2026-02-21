#!/bin/bash

# ============================================================
# Sometimes App - Setup Auto Build Hook
# ============================================================
# Git post-commit hook을 설치하여 커밋 시 자동 빌드 실행
# ============================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
POST_COMMIT_HOOK="$HOOKS_DIR/post-commit"

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Sometimes App - Auto Build Setup${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Create hooks directory if not exists
mkdir -p "$HOOKS_DIR"

# Backup existing hook if exists
if [ -f "$POST_COMMIT_HOOK" ]; then
    echo -e "${YELLOW}Existing post-commit hook found, backing up...${NC}"
    cp "$POST_COMMIT_HOOK" "$POST_COMMIT_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create post-commit hook
cat > "$POST_COMMIT_HOOK" << 'HOOK_EOF'
#!/bin/bash

# ============================================================
# Git Post-Commit Hook - Auto Build
# ============================================================
# 브랜치: main, release/*에서만 빌드 실행
# ============================================================

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Check if branch matches criteria
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "release" ]] || [[ "$CURRENT_BRANCH" == release/* ]]; then
    # Get script directory
    SCRIPT_DIR="$(git rev-parse --show-toplevel)/scripts"

    if [ -f "$SCRIPT_DIR/auto-build.sh" ]; then
        echo ""
        echo "[Auto Build] Starting background build for $CURRENT_BRANCH..."

        # Run auto-build in background
        "$SCRIPT_DIR/auto-build.sh" --background
    else
        echo "[Auto Build] Warning: auto-build.sh not found"
    fi
fi
HOOK_EOF

# Make hook executable
chmod +x "$POST_COMMIT_HOOK"

# Make auto-build.sh executable
chmod +x "$PROJECT_ROOT/scripts/auto-build.sh"

echo -e "${GREEN}Post-commit hook installed successfully!${NC}"
echo ""
echo -e "${CYAN}Configuration:${NC}"
echo "  - Hook location: $POST_COMMIT_HOOK"
echo "  - Build script: $PROJECT_ROOT/scripts/auto-build.sh"
echo "  - Target branches: main, release/*"
echo ""
echo -e "${CYAN}How it works:${NC}"
echo "  1. Commit to main or release/* branch"
echo "  2. Build starts automatically in background"
echo "  3. OS notification when build completes"
echo ""
echo -e "${YELLOW}To disable:${NC}"
echo "  rm $POST_COMMIT_HOOK"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
