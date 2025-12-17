#!/bin/bash

# ============================================================
# Install IPA to iPhone via Xcode
# ============================================================
# Usage: ./scripts/install-to-device.sh [ipa-file]
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
cd "$PROJECT_ROOT"

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Install to iPhone via Xcode${NC}"
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

# Find most recent IPA file or use provided path
find_ipa() {
    local ipa_file="$1"

    if [ -n "$ipa_file" ] && [ -f "$ipa_file" ]; then
        echo "$ipa_file"
        return 0
    fi

    # Find most recent IPA
    local recent_ipa=$(find "$PROJECT_ROOT" -name "*.ipa" -type f -mmin -120 | sort -r | head -1)

    if [ -z "$recent_ipa" ]; then
        print_error "No IPA file found"
        echo ""
        echo "Please build first:"
        echo "  ./scripts/build.sh"
        echo "  → iOS → Development"
        exit 1
    fi

    echo "$recent_ipa"
}

# Check if Xcode is installed
check_xcode() {
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed"
        echo ""
        echo "Install Xcode from:"
        echo "  https://apps.apple.com/app/xcode/id497799835"
        exit 1
    fi

    print_success "Xcode found: $(xcodebuild -version | head -1)"
}

# List connected devices
list_devices() {
    print_step "Checking connected devices..."
    echo ""

    # Get device list using xcrun
    local devices=$(xcrun devicectl list devices 2>/dev/null || instruments -s devices 2>/dev/null || true)

    if [ -z "$devices" ]; then
        print_warning "No devices found"
        echo ""
        echo -e "${BOLD}To connect your iPhone:${NC}"
        echo "  1. Connect iPhone via USB cable"
        echo "  2. Trust this computer on your iPhone"
        echo "  3. Or enable WiFi sync (Window > Devices and Simulators)"
        echo ""
        return 1
    fi

    echo -e "${CYAN}Connected devices:${NC}"
    echo "$devices" | grep -v "Simulator" | grep -i "iphone\|ipad" || echo "  No iOS devices found"
    echo ""
}

# Install IPA using Xcode
install_ipa() {
    local ipa_file="$1"

    print_step "Opening Xcode Devices window..."
    echo ""
    echo -e "${YELLOW}Follow these steps in Xcode:${NC}"
    echo ""
    echo "  1. ${BOLD}Window${NC} → ${BOLD}Devices and Simulators${NC} (⇧⌘2)"
    echo "  2. Select your ${BOLD}connected iPhone${NC} in the left sidebar"
    echo "  3. Click the ${BOLD}+ button${NC} under 'Installed Apps'"
    echo "  4. Select this file:"
    echo ""
    echo -e "     ${CYAN}$ipa_file${NC}"
    echo ""
    echo "  5. Wait for installation to complete"
    echo "  6. Check your iPhone home screen!"
    echo ""

    # Copy IPA path to clipboard
    echo "$ipa_file" | pbcopy
    print_success "IPA file path copied to clipboard!"
    echo ""

    # Open Xcode Devices window
    open "xcode:///"
    sleep 2

    # Try to open Devices window directly
    osascript <<EOF 2>/dev/null || true
tell application "Xcode"
    activate
end tell

tell application "System Events"
    tell process "Xcode"
        keystroke "2" using {command down, shift down}
    end tell
end tell
EOF

    echo ""
    print_warning "After installation, you may need to trust the developer certificate:"
    echo ""
    echo "  iPhone Settings → General → VPN & Device Management"
    echo "  → Developer App → Trust"
    echo ""
}

# Alternative: Install via command line (if device is connected)
install_via_cli() {
    local ipa_file="$1"

    print_step "Attempting to install via command line..."

    # Get first connected device
    local device_id=$(xcrun devicectl list devices 2>/dev/null | grep -i "iphone\|ipad" | head -1 | grep -oE '[0-9A-F-]{36}' || true)

    if [ -z "$device_id" ]; then
        print_warning "No device found for automatic installation"
        return 1
    fi

    print_step "Installing to device: $device_id"

    # Try to install using xcrun
    if xcrun devicectl device install app --device "$device_id" "$ipa_file" 2>/dev/null; then
        print_success "Installation successful!"

        # Notification
        osascript <<EOF
display notification "앱이 iPhone에 설치되었습니다!" with title "Installation Complete ✅" sound name "Glass"
EOF
        return 0
    else
        print_warning "Automatic installation failed, please use Xcode GUI"
        return 1
    fi
}

# Main execution
main() {
    print_header

    # Find IPA file
    IPA_FILE=$(find_ipa "$1")

    echo -e "${CYAN}IPA File:${NC} $(basename "$IPA_FILE")"
    echo -e "${CYAN}Size:${NC} $(du -h "$IPA_FILE" | cut -f1)"
    echo ""

    # Check Xcode
    check_xcode

    # List devices
    list_devices || true

    echo ""
    echo -e "${BOLD}Choose installation method:${NC}"
    echo "  1) Automatic CLI installation (recommended)"
    echo "  2) Manual installation via Xcode GUI"
    echo ""
    read -p "Enter choice [1-2]: " install_choice

    case $install_choice in
        1)
            if install_via_cli "$IPA_FILE"; then
                echo ""
                echo -e "${GREEN}============================================================${NC}"
                echo -e "${GREEN}  Installation Complete!${NC}"
                echo -e "${GREEN}============================================================${NC}"
                echo ""
                echo "Check your iPhone home screen for the app!"
            else
                echo ""
                install_ipa "$IPA_FILE"
            fi
            ;;
        2)
            install_ipa "$IPA_FILE"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

main "$@"
