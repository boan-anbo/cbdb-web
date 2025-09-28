#!/bin/bash

# Debug script for built Electron app
# This script runs the built Electron app with debugging enabled

# Script is now in apps/desktop/scripts/, so the app is at dist/electron/...
APP_PATH="dist/electron/mac-arm64/CBDB Desktop.app/Contents/MacOS/CBDB Desktop"

# Check if the app exists
if [ ! -f "$APP_PATH" ]; then
    echo "Error: Built app not found at $APP_PATH"
    echo "Please run 'npm run build:electron' first"
    exit 1
fi

echo "Starting CBDB Desktop with debugging enabled..."
echo "----------------------------------------"
echo "Developer Tools will open automatically"
echo "Console logs will appear below:"
echo "----------------------------------------"
echo ""

# Environment variables for debugging
export ELECTRON_BUILD_DEBUG_MODE=1
export ELECTRON_ENABLE_LOGGING=1
export ELECTRON_LOG_LEVEL=verbose
export NODE_ENV=development

# Run the app with debugging flags
"$APP_PATH" \
  --enable-logging \
  --log-level=verbose \
  --disable-gpu-sandbox \
  --remote-debugging-port=9222 \
  --inspect=5858 \
  2>&1 | tee electron-debug.log

echo ""
echo "----------------------------------------"
echo "App closed. Logs saved to electron-debug.log"