#!/bin/bash

# ============================================================
# Build wrapper with macOS notifications
# Usage: ./scripts/build-with-notify.sh <platform> <profile>
# ============================================================

PLATFORM="${1:-ios}"
PROFILE="${2:-production}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# macOS notification function
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

# Play system sound
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
        esac
    fi
}

echo "Starting $PLATFORM $PROFILE build..."
start_time=$(date +%s)

# Set up Android SDK environment if needed
if [ "$PLATFORM" = "android" ]; then
    if [ -z "$ANDROID_HOME" ]; then
        if [ -d "$HOME/Library/Android/sdk" ]; then
            export ANDROID_HOME="$HOME/Library/Android/sdk"
            export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
            echo "Set ANDROID_HOME=$ANDROID_HOME"
        else
            echo "ERROR: ANDROID_HOME not set and Android SDK not found"
            echo "Please run: ./scripts/setup-android-sdk.sh"
            exit 1
        fi
    fi
fi

# Run the build
export $(grep -v '^#' .env.production | xargs)
EXPO_NO_DOCTOR=1 eas build --platform "$PLATFORM" --profile "$PROFILE" --local --non-interactive
build_result=$?

end_time=$(date +%s)
duration=$((end_time - start_time))
minutes=$((duration / 60))
seconds=$((duration % 60))

if [ $build_result -eq 0 ]; then
    play_sound "success"
    notify "Sometimes Build Complete ✅" "${PLATFORM} ${PROFILE} 빌드가 완료되었습니다! (${minutes}분 ${seconds}초)" "Glass"
    echo ""
    echo "Build completed in ${minutes}m ${seconds}s"
else
    play_sound "error"
    notify "Sometimes Build Failed ❌" "빌드가 실패했습니다. 로그를 확인해주세요. (${minutes}분 ${seconds}초)" "Basso"
    echo ""
    echo "Build failed after ${minutes}m ${seconds}s"
    exit 1
fi
