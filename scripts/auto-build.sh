#!/bin/bash

# ============================================================
# Sometimes App - Auto Build Script (Post-Commit)
# ============================================================
# 커밋 후 백그라운드에서 iOS/Android 프로덕션 빌드 병렬 실행
# 브랜치: main, release/*
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# External drive build directory (to save main drive space)
EXTERNAL_BUILD_DIR="/Volumes/eungu/build/sometimes"
if [ -d "/Volumes/eungu" ]; then
    mkdir -p "$EXTERNAL_BUILD_DIR"
    export TMPDIR="$EXTERNAL_BUILD_DIR/tmp"
    mkdir -p "$TMPDIR"
fi

# Log file
LOG_DIR="$PROJECT_ROOT/builds/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/auto-build_$TIMESTAMP.log"

# ============================================================
# Helper Functions
# ============================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
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
            success)
                afplay /System/Library/Sounds/Glass.aiff &
                ;;
            error)
                afplay /System/Library/Sounds/Basso.aiff &
                ;;
            start)
                afplay /System/Library/Sounds/Ping.aiff &
                ;;
        esac
    fi
}

# ============================================================
# Branch Check
# ============================================================

check_branch() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

    if [[ "$current_branch" == "main" ]]; then
        return 0
    elif [[ "$current_branch" == "release" ]] || [[ "$current_branch" == release/* ]]; then
        return 0
    else
        log "Skipping auto-build: branch '$current_branch' is not main or release/*"
        return 1
    fi
}

# ============================================================
# Environment Setup
# ============================================================

load_env() {
    local env_file="$PROJECT_ROOT/.env.production"

    if [ ! -f "$env_file" ]; then
        log "ERROR: .env.production not found"
        return 1
    fi

    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        export "$line"
    done < "$env_file"

    export EXPO_PUBLIC_APPLE_ENVIRONMENT="production"
    log "Environment loaded: .env.production"
}

# ============================================================
# Build Functions
# ============================================================

build_ios() {
    local ios_log="$LOG_DIR/ios_$TIMESTAMP.log"
    local start_time=$(date +%s)

    log "Starting iOS build..."

    # Ruby 3.4.x FileUtils.mkdir_p bug workaround
    local archives_link="$HOME/Library/Developer/Xcode/Archives"
    if [ -L "$archives_link" ]; then
        local archives_target=$(readlink "$archives_link")
        local dated_dir="$archives_target/$(date +%Y-%m-%d)"
        mkdir -p "$dated_dir" 2>/dev/null || true
    fi

    if EXPO_NO_DOCTOR=1 eas build --platform ios --profile production --local --non-interactive >> "$ios_log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local minutes=$((duration / 60))
        local seconds=$((duration % 60))

        log "iOS build SUCCESS (${minutes}m ${seconds}s)"
        echo "success:${minutes}m ${seconds}s"
    else
        log "iOS build FAILED - see $ios_log"
        echo "failed"
    fi
}

build_android() {
    local android_log="$LOG_DIR/android_$TIMESTAMP.log"
    local start_time=$(date +%s)

    log "Starting Android build..."

    if EXPO_NO_DOCTOR=1 eas build --platform android --profile production --local --non-interactive >> "$android_log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local minutes=$((duration / 60))
        local seconds=$((duration % 60))

        log "Android build SUCCESS (${minutes}m ${seconds}s)"
        echo "success:${minutes}m ${seconds}s"
    else
        log "Android build FAILED - see $android_log"
        echo "failed"
    fi
}

# ============================================================
# Organize Build Artifacts
# ============================================================

organize_artifacts() {
    local build_dir="$PROJECT_ROOT/builds"
    local target_dir="$build_dir/production_$TIMESTAMP"

    mkdir -p "$target_dir"

    find "$PROJECT_ROOT" -maxdepth 1 -name "*.ipa" -mmin -120 -exec mv {} "$target_dir/" \; 2>/dev/null || true
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.aab" -mmin -120 -exec mv {} "$target_dir/" \; 2>/dev/null || true

    if [ "$(ls -A $target_dir 2>/dev/null)" ]; then
        log "Build artifacts moved to: $target_dir"
        echo "$target_dir"
    else
        log "No build artifacts found"
        echo ""
    fi
}

# ============================================================
# Main Execution
# ============================================================

main() {
    log "============================================"
    log "Auto Build Started"
    log "============================================"

    # Check branch
    if ! check_branch; then
        exit 0
    fi

    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    local commit_hash=$(git rev-parse --short HEAD)
    local commit_msg=$(git log -1 --pretty=%B | head -1)

    log "Branch: $current_branch"
    log "Commit: $commit_hash - $commit_msg"

    # Load environment
    if ! load_env; then
        notify "Build Failed" "환경 파일을 로드할 수 없습니다" "Basso"
        play_sound "error"
        exit 1
    fi

    # Start notification
    notify "Build Started" "iOS/Android 프로덕션 빌드 시작..." "Ping"
    play_sound "start"

    local start_time=$(date +%s)

    # Run builds in parallel
    log "Starting parallel builds..."

    local ios_result=""
    local android_result=""

    # Create temp files for results
    local ios_result_file=$(mktemp)
    local android_result_file=$(mktemp)

    # Run iOS build in background
    (build_ios > "$ios_result_file") &
    local ios_pid=$!

    # Run Android build in background
    (build_android > "$android_result_file") &
    local android_pid=$!

    # Wait for both builds
    wait $ios_pid
    local ios_exit=$?

    wait $android_pid
    local android_exit=$?

    # Read results
    ios_result=$(cat "$ios_result_file")
    android_result=$(cat "$android_result_file")

    # Cleanup temp files
    rm -f "$ios_result_file" "$android_result_file"

    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    local total_minutes=$((total_duration / 60))
    local total_seconds=$((total_duration % 60))

    # Organize artifacts
    local artifact_dir=$(organize_artifacts)

    # Final notification
    local ios_status="?"
    local android_status="?"

    if [[ "$ios_result" == success* ]]; then
        ios_status="iOS OK"
    else
        ios_status="iOS FAIL"
    fi

    if [[ "$android_result" == success* ]]; then
        android_status="Android OK"
    else
        android_status="Android FAIL"
    fi

    if [[ "$ios_result" == success* ]] && [[ "$android_result" == success* ]]; then
        log "============================================"
        log "All builds completed successfully!"
        log "Total time: ${total_minutes}m ${total_seconds}s"
        log "============================================"

        notify "Build Complete" "$ios_status, $android_status (${total_minutes}m ${total_seconds}s)" "Glass"
        play_sound "success"
    else
        log "============================================"
        log "Some builds failed!"
        log "$ios_status, $android_status"
        log "============================================"

        notify "Build Failed" "$ios_status, $android_status" "Basso"
        play_sound "error"
    fi

    log "Log file: $LOG_FILE"
}

# Run in background (called from post-commit hook)
if [[ "${1:-}" == "--background" ]]; then
    main >> "$LOG_FILE" 2>&1 &
    disown
    echo "Auto build started in background. Log: $LOG_FILE"
else
    main
fi
