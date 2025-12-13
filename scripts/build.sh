#!/bin/bash

# ============================================================
# Sometimes App - Interactive Local Build Script
# ============================================================
# Usage: ./scripts/build.sh
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Sometimes App - Local Build${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# macOS system notification
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

# Load environment variables from file
load_env_file() {
    local env_file="$1"

    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi

    print_step "Loading environment from: $env_file"

    # Export each line as environment variable (skip comments and empty lines)
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip empty lines and comments
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        # Export the variable
        export "$line"
    done < "$env_file"

    print_success "Environment variables loaded"
}

# Check if eas-cli is installed
check_eas_cli() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed."
        echo -e "Install it with: ${CYAN}npm install -g eas-cli${NC}"
        exit 1
    fi
    print_success "EAS CLI found: $(eas --version 2>/dev/null | head -1)"
}

# Check if logged in to EAS
check_eas_login() {
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to EAS. Logging in..."
        eas login
    else
        print_success "Logged in as: $(eas whoami)"
    fi
}

# Select platform
select_platform() {
    echo ""
    echo -e "${BOLD}Select platform:${NC}"
    echo "  1) iOS (IPA)"
    echo "  2) Android (AAB - Play Store)"
    echo "  3) Android (APK - Direct Install)"
    echo "  4) Both (iOS + Android AAB)"
    echo ""
    read -p "Enter choice [1-4]: " platform_choice

    case $platform_choice in
        1) PLATFORM="ios"; OUTPUT_TYPE="ipa" ;;
        2) PLATFORM="android"; OUTPUT_TYPE="aab" ;;
        3) PLATFORM="android"; OUTPUT_TYPE="apk" ;;
        4) PLATFORM="all"; OUTPUT_TYPE="aab" ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
}

# Select environment
select_environment() {
    echo ""
    echo -e "${BOLD}Select environment:${NC}"
    echo "  1) Production (Store Release)"
    echo "  2) Preview (Internal Testing)"
    echo "  3) Development (Dev Client)"
    echo ""
    read -p "Enter choice [1-3]: " env_choice

    case $env_choice in
        1)
            PROFILE="production"
            ENV_FILE=".env.production"
            ;;
        2)
            PROFILE="preview"
            ENV_FILE=".env.production"
            ;;
        3)
            PROFILE="development"
            ENV_FILE=".env"
            ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
}

# Select deployment option
select_deployment() {
    # Only ask for deployment if production iOS build
    if [ "$PLATFORM" != "ios" ] || [ "$PROFILE" != "production" ]; then
        AUTO_SUBMIT="no"
        return
    fi

    echo ""
    echo -e "${BOLD}Deployment option:${NC}"
    echo "  1) Build only (no upload)"
    echo "  2) Build + Auto submit to TestFlight"
    echo "  3) Build + Upload to Diawi (for quick testing)"
    echo ""
    read -p "Enter choice [1-3]: " deploy_choice

    case $deploy_choice in
        1) AUTO_SUBMIT="no" ;;
        2) AUTO_SUBMIT="testflight" ;;
        3) AUTO_SUBMIT="diawi" ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
}

# Submit to TestFlight
submit_to_testflight() {
    print_step "Submitting to TestFlight..."

    if ! eas submit --platform ios --profile production --latest --non-interactive; then
        print_error "TestFlight submission failed"
        return 1
    fi

    print_success "Submitted to TestFlight!"
    echo ""
    echo -e "${CYAN}Check status at: https://appstoreconnect.apple.com${NC}"
    notify "TestFlight Upload Complete 🚀" "앱이 TestFlight에 업로드되었습니다. 검토 대기 중..." "Glass"
}

# Upload to Diawi
upload_to_diawi() {
    local ipa_file="$1"

    if [ ! -f "$ipa_file" ]; then
        print_error "IPA file not found: $ipa_file"
        return 1
    fi

    print_step "Uploading to Diawi..."

    if ./scripts/upload-to-diawi.sh "$ipa_file"; then
        print_success "Uploaded to Diawi!"
    else
        print_error "Diawi upload failed"
        return 1
    fi
}

# Confirm build settings
confirm_build() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}Build Configuration:${NC}"
    echo -e "  Platform:    ${GREEN}$PLATFORM${NC}"
    echo -e "  Profile:     ${GREEN}$PROFILE${NC}"
    echo -e "  Env File:    ${GREEN}$ENV_FILE${NC}"
    echo -e "  Output:      ${GREEN}$OUTPUT_TYPE${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""

    read -p "Proceed with build? [y/N]: " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Build cancelled."
        exit 0
    fi
}

# Build for iOS
build_ios() {
    print_step "Building iOS ($PROFILE)..."

    local cmd="EXPO_NO_DOCTOR=1 eas build --platform ios --profile $PROFILE --local --non-interactive"

    echo -e "${CYAN}Running: $cmd${NC}"
    eval $cmd

    print_success "iOS build completed!"
}

# Build for Android
build_android() {
    print_step "Building Android ($PROFILE)..."

    local cmd="EXPO_NO_DOCTOR=1 eas build --platform android --profile $PROFILE --local --non-interactive"

    # For APK output, use preview profile
    if [ "$OUTPUT_TYPE" = "apk" ] && [ "$PROFILE" = "production" ]; then
        print_warning "Production builds use AAB by default. Using preview profile for APK."
        cmd="EXPO_NO_DOCTOR=1 eas build --platform android --profile preview --local --non-interactive"
    fi

    echo -e "${CYAN}Running: $cmd${NC}"
    eval $cmd

    print_success "Android build completed!"
}

# Move build artifacts to organized directory
organize_artifacts() {
    local build_dir="$PROJECT_ROOT/builds"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local target_dir="$build_dir/${PROFILE}_${timestamp}"

    mkdir -p "$target_dir"

    # Find and move recent build artifacts
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.ipa" -mmin -60 -exec mv {} "$target_dir/" \; 2>/dev/null || true
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.aab" -mmin -60 -exec mv {} "$target_dir/" \; 2>/dev/null || true
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.apk" -mmin -60 -exec mv {} "$target_dir/" \; 2>/dev/null || true

    if [ "$(ls -A $target_dir 2>/dev/null)" ]; then
        print_success "Build artifacts moved to: $target_dir"
        echo ""
        echo -e "${BOLD}Generated files:${NC}"
        ls -lah "$target_dir"
    else
        print_warning "No build artifacts found to organize"
        # Check if artifacts are in current directory
        echo ""
        echo -e "${BOLD}Looking for build outputs...${NC}"
        find "$PROJECT_ROOT" -maxdepth 2 \( -name "*.ipa" -o -name "*.aab" -o -name "*.apk" \) -mmin -60 2>/dev/null || echo "No recent builds found"
    fi
}

# Main execution
main() {
    print_header
    check_eas_cli
    check_eas_login
    select_platform
    select_environment
    select_deployment

    # Load environment variables BEFORE confirming
    load_env_file "$ENV_FILE"

    confirm_build

    echo ""
    print_step "Starting build process..."

    local start_time=$(date +%s)
    local build_failed=false

    # Trap for handling build failures
    trap 'build_failed=true' ERR

    case $PLATFORM in
        ios)
            build_ios || build_failed=true
            ;;
        android)
            build_android || build_failed=true
            ;;
        all)
            build_ios || build_failed=true
            build_android || build_failed=true
            ;;
    esac

    trap - ERR

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    if [ "$build_failed" = true ]; then
        echo ""
        echo -e "${RED}============================================================${NC}"
        echo -e "${RED}  Build FAILED after ${minutes}m ${seconds}s${NC}"
        echo -e "${RED}============================================================${NC}"
        echo ""

        # Send failure notification
        play_sound "error"
        notify "Sometimes Build Failed ❌" "빌드가 실패했습니다. 로그를 확인해주세요. (${minutes}분 ${seconds}초)" "Basso"
        exit 1
    fi

    organize_artifacts

    # Auto-submit if requested
    if [ "$AUTO_SUBMIT" = "testflight" ]; then
        echo ""
        submit_to_testflight || true
    elif [ "$AUTO_SUBMIT" = "diawi" ]; then
        echo ""
        # Find the most recent IPA file
        local ipa_file=$(find "$PROJECT_ROOT" -name "*.ipa" -mmin -60 -type f | head -1)
        if [ -n "$ipa_file" ]; then
            upload_to_diawi "$ipa_file" || true
        else
            print_warning "No IPA file found to upload to Diawi"
        fi
    fi

    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Build completed in ${minutes}m ${seconds}s${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""

    # Send success notification
    play_sound "success"
    notify "Sometimes Build Complete ✅" "${PLATFORM} ${PROFILE} 빌드가 완료되었습니다! (${minutes}분 ${seconds}초)" "Glass"
}

# Run main function
main
