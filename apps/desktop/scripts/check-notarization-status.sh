#!/bin/bash

echo "=== Checking Apple Developer Status ==="
echo ""

# Check certificate validity
echo "1. Checking Developer ID Certificate:"
security find-identity -v -p codesigning | grep "Developer ID Application"
echo ""

# Check certificate expiration
echo "2. Certificate Expiration Date:"
security find-certificate -c "Developer ID Application: Bo An" -p | openssl x509 -noout -dates
echo ""

# Test notarization with xcrun (this will show account status)
echo "3. Testing Notarization Tool Access:"
echo "   (This will show if your account can access notarization)"
echo ""

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
    echo "❌ Missing APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD in .env.local"
    exit 1
fi

# Try to get notarization history (will fail if account issues)
echo "Attempting to check notarization history..."
xcrun notarytool history \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_APP_SPECIFIC_PASSWORD" \
    --team-id "G9ZN95U2YH" 2>&1 | head -20

echo ""
echo "=== What to check: ==="
echo "1. Go to https://developer.apple.com/account"
echo "2. Sign in with your Apple ID"
echo "3. Look for any agreements that need to be accepted"
echo "4. Check if your developer membership is active"
echo "5. Check https://developer.apple.com/account/resources/agreements/"
echo ""
echo "Common issues:"
echo "- Expired developer membership ($99/year)"
echo "- New Apple Developer Program Agreement needs acceptance"
echo "- Updated Paid Apps Agreement needs acceptance"