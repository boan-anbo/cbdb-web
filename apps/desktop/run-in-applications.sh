
#!/bin/bash

# Script to run the production Electron app with proper environment variables

echo "=== Starting CBDB Desktop Production App ==="
echo "Time: $(date)"
echo "============================================"
echo ""

# Set environment variables (use relative path or env var)
export CBDB_PATH=${CBDB_PATH:-"../../cbdb_sql_db/latest.db"}
export APP_DB_PATH=${APP_DB_PATH:-"/tmp/cbdb-desktop-app.db"}

echo "Environment Variables:"
echo "  CBDB_PATH: $CBDB_PATH"
echo "  APP_DB_PATH: $APP_DB_PATH"
echo ""
echo "Starting application..."
echo "============================================"
echo ""

# Run the app
~/Applications/desktop.app/Contents/MacOS/desktop 2>&1

# Capture exit code
EXIT_CODE=$?

echo ""
echo "============================================"
echo "Application exited with code: $EXIT_CODE"
echo "Time: $(date)"
