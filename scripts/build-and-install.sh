#!/bin/bash

# ============================================================
# Build iOS Development and Install to Device
# ============================================================

set -e

echo "🔨 Building iOS Development..."
./scripts/build-with-notify.sh ios development

echo ""
echo "📱 Installing to device..."
./scripts/install-to-device.sh

echo ""
echo "✅ Build and Install Complete!"
