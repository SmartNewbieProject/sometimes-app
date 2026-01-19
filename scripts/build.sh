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

    # Verify critical environment variables
    echo ""
    echo -e "${CYAN}📋 Loaded Environment Variables:${NC}"
    echo -e "  API_URL: ${GREEN}${EXPO_PUBLIC_API_URL:-NOT SET}${NC}"
    echo -e "  MERCHANT_ID: ${GREEN}${EXPO_PUBLIC_MERCHANT_ID:-NOT SET}${NC}"
    echo -e "  CHANNEL_KEY: ${GREEN}${EXPO_PUBLIC_CHANNEL_KEY:0:20}...${NC}"
    echo -e "  APPLE_ENV: ${GREEN}${EXPO_PUBLIC_APPLE_ENVIRONMENT:-NOT SET}${NC}"

    if [ -z "$EXPO_PUBLIC_API_URL" ]; then
        echo ""
        print_error "EXPO_PUBLIC_API_URL is not set!"
        echo ""
        echo "Check your $env_file file"
        exit 1
    fi
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

# Sync build version with EAS at the beginning
sync_version_early() {
    local platform="$1"

    echo ""
    print_step "Syncing build version with App Store Connect / Play Store..."

    if eas build:version:sync --platform "$platform" 2>&1; then
        print_success "Build version synced successfully"
    else
        print_warning "Version sync failed - this may cause submission errors"
        echo ""
        echo -e "${YELLOW}가능한 원인:${NC}"
        echo "  1. App Store Connect에서 해당 버전이 이미 닫혀있음"
        echo "  2. 네트워크 연결 문제"
        echo "  3. EAS 인증 문제"
        echo ""
        read -p "계속 빌드를 진행하시겠습니까? [y/N]: " continue_build
        if [[ ! $continue_build =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${CYAN}해결 방법:${NC}"
            echo "  1. App Store Connect에서 새 버전 생성"
            echo "  2. app.config.ts의 version 값 증가"
            echo ""
            exit 1
        fi
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
    echo "  1) Production (Store Release - TestFlight only)"
    echo "  2) Preview + Production ENV (USB Install) ${GREEN}← 권장${NC}"
    echo "  3) Preview (Internal Testing - Dev Server)"
    echo "  4) Development (Dev Client)"
    echo ""
    read -p "Enter choice [1-4]: " env_choice

    case $env_choice in
        1)
            PROFILE="production"
            ENV_FILE=".env.production"
            APPLE_ENV="production"
            ;;
        2)
            PROFILE="preview"
            ENV_FILE=".env.production"
            APPLE_ENV="production"
            CAN_INSTALL_TO_DEVICE=true
            ;;
        3)
            PROFILE="preview"
            ENV_FILE=".env.preview"
            APPLE_ENV="sandbox"
            CAN_INSTALL_TO_DEVICE=true
            ;;
        4)
            PROFILE="development"
            ENV_FILE=".env"
            APPLE_ENV="sandbox"
            ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac

    export EXPO_PUBLIC_APPLE_ENVIRONMENT="$APPLE_ENV"
}

# Select clean build option
select_clean_build() {
    echo ""
    echo -e "${BOLD}Build mode:${NC}"
    echo "  1) Normal build (use cached native projects)"
    echo "  2) Clean build (delete ios/android/.expo + prebuild) ${YELLOW}← 크래시 발생 시 선택${NC}"
    echo ""
    read -p "Enter choice [1-2]: " clean_choice

    case $clean_choice in
        1) CLEAN_BUILD=false ;;
        2) CLEAN_BUILD=true ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
}

# Run TypeScript type check
run_typecheck() {
    print_step "Running TypeScript type check..."
    echo ""

    if npm run typecheck 2>&1; then
        print_success "Type check passed! ✓"
        echo ""
    else
        echo ""
        print_error "Type check failed!"
        echo ""
        echo -e "${YELLOW}타입 에러를 수정한 후 다시 빌드해주세요.${NC}"
        echo -e "${CYAN}팁: npm run typecheck 로 에러를 확인할 수 있습니다.${NC}"
        echo ""

        read -p "타입 에러를 무시하고 계속 빌드하시겠습니까? (권장하지 않음) [y/N]: " ignore_typecheck
        if [[ ! $ignore_typecheck =~ ^[Yy]$ ]]; then
            notify "Build Cancelled ⚠️" "타입 에러로 인해 빌드가 취소되었습니다." "Basso"
            exit 1
        fi
        print_warning "타입 에러를 무시하고 빌드를 계속합니다..."
        echo ""
    fi
}

# Perform clean build
perform_clean_build() {
    if [ "$CLEAN_BUILD" = false ]; then
        return
    fi

    print_step "Performing clean build..."
    echo ""

    # Delete native folders
    if [ -d "ios" ] || [ -d "android" ] || [ -d ".expo" ]; then
        echo -e "${YELLOW}Deleting cached native projects...${NC}"
        rm -rf ios android .expo
        print_success "Deleted: ios/, android/, .expo/"
    fi

    # Run prebuild
    print_step "Running expo prebuild --clean..."
    echo ""

    if npx expo prebuild --clean; then
        print_success "Prebuild completed!"
    else
        print_error "Prebuild failed"
        exit 1
    fi

    echo ""
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
    local clean_mode="Normal"
    if [ "$CLEAN_BUILD" = true ]; then
        clean_mode="${YELLOW}Clean (prebuild)${NC}"
    fi

    local apple_env_display="${GREEN}$APPLE_ENV${NC}"
    if [ "$APPLE_ENV" = "production" ]; then
        apple_env_display="${GREEN}production${NC} (App Store/TestFlight)"
    else
        apple_env_display="${YELLOW}sandbox${NC} (개발/테스트)"
    fi

    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}Build Configuration:${NC}"
    echo -e "  Platform:    ${GREEN}$PLATFORM${NC}"
    echo -e "  Profile:     ${GREEN}$PROFILE${NC}"
    echo -e "  Env File:    ${GREEN}$ENV_FILE${NC}"
    echo -e "  Apple IAP:   $apple_env_display"
    echo -e "  Output:      ${GREEN}$OUTPUT_TYPE${NC}"
    echo -e "  Build Mode:  $clean_mode"
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

    # Workaround: Ruby 3.4.x FileUtils.mkdir_p bug with symlinked directories
    # Creates the dated Archives subdirectory to prevent Fastlane gym failure
    local archives_link="$HOME/Library/Developer/Xcode/Archives"
    if [ -L "$archives_link" ]; then
        local archives_target=$(readlink "$archives_link")
        local dated_dir="$archives_target/$(date +%Y-%m-%d)"
        mkdir -p "$dated_dir" 2>/dev/null || true
    fi

    # Ad-hoc 빌드는 .env.production 사용
    local env_file="$ENV_FILE"
    if [ "$PROFILE" = "adhoc" ]; then
        env_file=".env.production"
    fi

    local cmd="EXPO_NO_DOCTOR=1 eas build --platform ios --profile $PROFILE --local --non-interactive"

    echo -e "${CYAN}Running: $cmd${NC}"
    echo -e "${CYAN}Using environment: $env_file${NC}"
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

# List connected iOS devices
list_connected_devices() {
    xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | grep "connected" || true
}

# Get device ID from device name or use first connected device
get_device_id() {
    local device_list=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | grep "connected")

    if [ -z "$device_list" ]; then
        return 1
    fi

    # Extract device ID (3rd column)
    echo "$device_list" | head -1 | awk '{print $3}'
}

# Install IPA to connected iPhone
install_ipa_to_device() {
    local ipa_file="$1"
    local device_id="$2"

    if [ ! -f "$ipa_file" ]; then
        print_error "IPA file not found: $ipa_file"
        return 1
    fi

    print_step "Installing to iPhone..."
    echo -e "${CYAN}Device ID: $device_id${NC}"
    echo -e "${CYAN}IPA: $(basename "$ipa_file")${NC}"
    echo ""

    if xcrun devicectl device install app --device "$device_id" "$ipa_file"; then
        print_success "App installed successfully! 🎉"
        notify "App Installed ✅" "썸타임 앱이 iPhone에 설치되었습니다!" "Glass"
        play_sound "success"
        return 0
    else
        print_error "Installation failed"
        notify "Installation Failed ❌" "앱 설치에 실패했습니다." "Basso"
        play_sound "error"
        return 1
    fi
}

# Prompt user to install IPA to device
prompt_install_to_device() {
    local build_dir="$1"

    # Find IPA file in build directory
    local ipa_file=$(find "$build_dir" -name "*.ipa" -type f | head -1)

    if [ -z "$ipa_file" ]; then
        return 0
    fi

    # Check for connected devices
    local connected_devices=$(list_connected_devices)

    if [ -z "$connected_devices" ]; then
        echo ""
        print_warning "No iPhone/iPad connected via USB"
        return 0
    fi

    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}Connected iOS Devices:${NC}"
    echo "$connected_devices"
    echo -e "${CYAN}============================================================${NC}"
    echo ""

    read -p "Install app to connected device? [y/N]: " install_confirm

    if [[ $install_confirm =~ ^[Yy]$ ]]; then
        local device_id=$(get_device_id)
        if [ -n "$device_id" ]; then
            install_ipa_to_device "$ipa_file" "$device_id"
        else
            print_error "Could not get device ID"
            return 1
        fi
    else
        echo "Skipping installation."
    fi
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

        # Store the build directory path in a global variable
        BUILD_OUTPUT_DIR="$target_dir"
    else
        print_warning "No build artifacts found to organize"
        # Check if artifacts are in current directory
        echo ""
        echo -e "${BOLD}Looking for build outputs...${NC}"
        find "$PROJECT_ROOT" -maxdepth 2 \( -name "*.ipa" -o -name "*.aab" -o -name "*.apk" \) -mmin -60 2>/dev/null || echo "No recent builds found"
        echo ""
        BUILD_OUTPUT_DIR=""
    fi
}

# Main execution
main() {
    print_header
    check_eas_cli
    check_eas_login
    select_platform

    # 플랫폼 선택 직후 버전 동기화 (문제 조기 감지)
    local sync_platform="$PLATFORM"
    if [ "$PLATFORM" = "all" ]; then
        sync_platform="all"
    fi
    sync_version_early "$sync_platform"

    select_environment
    select_deployment
    select_clean_build

    # Load environment variables BEFORE confirming
    load_env_file "$ENV_FILE"

    confirm_build

    # Run type check before build
    run_typecheck

    # Perform clean build if requested
    perform_clean_build

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

    # Prompt to install to connected device (iOS only)
    # Skip for production builds (they can't be installed via USB)
    if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
        # Check if this build can be installed via USB
        if [ "$CAN_INSTALL_TO_DEVICE" = true ] || [ "$PROFILE" = "preview" ] || [ "$PROFILE" = "development" ]; then
            if [ -n "$BUILD_OUTPUT_DIR" ]; then
                prompt_install_to_device "$BUILD_OUTPUT_DIR" || true
            fi
        elif [ "$PROFILE" = "production" ]; then
            echo ""
            print_warning "Production builds cannot be installed directly via USB"
            echo ""
            echo -e "${BLUE}To test this build:${NC}"
            echo ""
            echo "  1. Submit to TestFlight:"
            echo -e "     ${CYAN}npm run submit:testflight${NC}"
            echo ""
            echo "  2. Install from TestFlight app on your iPhone"
            echo ""
            echo -e "${BLUE}For USB installation, use Ad-hoc build:${NC}"
            echo -e "  ${CYAN}./scripts/build.sh${NC} → Select 'Ad-hoc'"
            echo ""
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
