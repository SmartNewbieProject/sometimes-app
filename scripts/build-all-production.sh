#!/bin/bash

# ============================================================
# Sometimes App - Build All Production (iOS + Android)
# ============================================================
# iOS IPA + Android AAB 프로덕션 빌드 병렬 실행
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# External drive build directory (to save main drive space)
EXTERNAL_BUILD_DIR="/Volumes/eungu/build/sometimes"
if [ -d "/Volumes/eungu" ]; then
    mkdir -p "$EXTERNAL_BUILD_DIR"
    export TMPDIR="$EXTERNAL_BUILD_DIR/tmp"
    mkdir -p "$TMPDIR"
    echo -e "${GREEN}[OK]${NC} Using external drive for build: $EXTERNAL_BUILD_DIR"
fi

# Log directory
LOG_DIR="$PROJECT_ROOT/builds/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# ============================================================
# Helper Functions
# ============================================================

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Sometimes App - Production Build (iOS + Android)${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

notify() {
    local title="$1"
    local message="$2"
    local sound="${3:-default}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript <<EOF
display notification "$message" with title "$title" sound name "$sound"
EOF
    fi
}

play_sound() {
    local sound_type="$1"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        case $sound_type in
            success) afplay /System/Library/Sounds/Glass.aiff & ;;
            error) afplay /System/Library/Sounds/Basso.aiff & ;;
            start) afplay /System/Library/Sounds/Ping.aiff & ;;
        esac
    fi
}

# ============================================================
# Environment Setup
# ============================================================

load_env() {
    local env_file="$PROJECT_ROOT/.env.production"

    if [ ! -f "$env_file" ]; then
        echo -e "${RED}[ERROR] .env.production not found${NC}"
        exit 1
    fi

    echo -e "${BLUE}[STEP]${NC} Loading environment: .env.production"

    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        export "$line"
    done < "$env_file"

    export EXPO_PUBLIC_APPLE_ENVIRONMENT="production"
    echo -e "${GREEN}[OK]${NC} Environment loaded"
}

# ============================================================
# Build Functions
# ============================================================

build_ios() {
    local log_file="$LOG_DIR/ios_production_$TIMESTAMP.log"
    local start_time=$(date +%s)

    echo -e "${BLUE}[iOS]${NC} Starting production build..."

    # Ruby 3.4.x FileUtils.mkdir_p bug workaround
    local archives_link="$HOME/Library/Developer/Xcode/Archives"
    if [ -L "$archives_link" ]; then
        local archives_target=$(readlink "$archives_link")
        mkdir -p "$archives_target/$(date +%Y-%m-%d)" 2>/dev/null || true
    fi

    if EXPO_NO_DOCTOR=1 eas build --platform ios --profile production --local --non-interactive 2>&1 | tee "$log_file"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}[iOS]${NC} Build SUCCESS ($((duration/60))m $((duration%60))s)"
        return 0
    else
        echo -e "${RED}[iOS]${NC} Build FAILED - see $log_file"
        return 1
    fi
}

build_android() {
    local log_file="$LOG_DIR/android_production_$TIMESTAMP.log"
    local start_time=$(date +%s)

    echo -e "${BLUE}[Android]${NC} Starting production build..."

    if EXPO_NO_DOCTOR=1 eas build --platform android --profile production --local --non-interactive 2>&1 | tee "$log_file"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}[Android]${NC} Build SUCCESS ($((duration/60))m $((duration%60))s)"
        return 0
    else
        echo -e "${RED}[Android]${NC} Build FAILED - see $log_file"
        return 1
    fi
}

# ============================================================
# Organize Artifacts
# ============================================================

organize_artifacts() {
    # Use external drive if available
    local target_dir
    if [ -d "/Volumes/eungu" ]; then
        target_dir="$EXTERNAL_BUILD_DIR/production_$TIMESTAMP"
    else
        target_dir="$PROJECT_ROOT/builds/production_$TIMESTAMP"
    fi
    mkdir -p "$target_dir"

    find "$PROJECT_ROOT" -maxdepth 1 -name "*.ipa" -mmin -120 -exec mv {} "$target_dir/" \; 2>/dev/null || true
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.aab" -mmin -120 -exec mv {} "$target_dir/" \; 2>/dev/null || true

    if [ "$(ls -A $target_dir 2>/dev/null)" ]; then
        echo ""
        echo -e "${BOLD}Build artifacts:${NC}"
        ls -lah "$target_dir"
        echo ""
        echo -e "${CYAN}Location: $target_dir${NC}"
    fi
}

# ============================================================
# Main
# ============================================================

main() {
    print_header
    load_env

    echo ""
    echo -e "${BOLD}Build Configuration:${NC}"
    echo -e "  Platform:  ${GREEN}iOS + Android${NC}"
    echo -e "  Profile:   ${GREEN}production${NC}"
    echo -e "  Env:       ${GREEN}.env.production${NC}"
    echo -e "  Mode:      ${GREEN}Parallel${NC}"
    echo ""

    read -p "Proceed with build? [y/N]: " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Build cancelled."
        exit 0
    fi

    notify "Build Started" "iOS + Android 프로덕션 빌드 시작..." "Ping"
    play_sound "start"

    local start_time=$(date +%s)
    local ios_failed=false
    local android_failed=false

    # Pre-set git config to reduce lock contention during parallel compression
    git config core.ignorecase false 2>/dev/null || true

    # Parallel build (staggered start to avoid git config lock race)
    echo ""
    echo -e "${CYAN}Starting parallel builds...${NC}"
    echo ""

    # Run builds in parallel using subshells
    # iOS starts first
    (build_ios) &
    local ios_pid=$!

    # Stagger Android start by 30s to avoid git config.lock race
    # during project compression phase
    echo -e "${YELLOW}[Android]${NC} Waiting 30s to avoid compression race..."
    sleep 30

    (build_android) &
    local android_pid=$!

    # Wait for iOS
    if ! wait $ios_pid; then
        ios_failed=true
    fi

    # Wait for Android
    if ! wait $android_pid; then
        android_failed=true
    fi

    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    local total_min=$((total_duration / 60))
    local total_sec=$((total_duration % 60))

    organize_artifacts

    echo ""
    echo -e "${CYAN}============================================================${NC}"

    if [ "$ios_failed" = false ] && [ "$android_failed" = false ]; then
        echo -e "${GREEN}  All builds completed! (${total_min}m ${total_sec}s)${NC}"
        notify "Build Complete" "iOS + Android 빌드 완료! (${total_min}m ${total_sec}s)" "Glass"
        play_sound "success"
    else
        local failed=""
        [ "$ios_failed" = true ] && failed="iOS"
        [ "$android_failed" = true ] && failed="${failed:+$failed, }Android"
        echo -e "${RED}  Build failed: $failed${NC}"
        notify "Build Failed" "$failed 빌드 실패" "Basso"
        play_sound "error"
    fi

    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

main
