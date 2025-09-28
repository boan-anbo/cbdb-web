const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizeMacApp(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize on macOS
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization - not building for macOS');
    return;
  }

  // Skip notarization in CI if not configured
  if (process.env.CI && !process.env.APPLE_ID) {
    console.log('Skipping notarization in CI - credentials not configured');
    return;
  }

  // Check for required environment variables
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID || 'G9ZN95U2YH';

  if (!appleId || !appleIdPassword) {
    console.warn('Skipping notarization - Missing APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD');
    console.warn('Please set these environment variables or create a .env.local file');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appPath}...`);
  console.log(`Apple ID: ${appleId}`);
  console.log(`Team ID: ${teamId}`);

  try {
    await notarize({
      appPath,
      appleId,
      appleIdPassword,
      teamId,
      // Use notarytool (new method) instead of legacy altool
      tool: 'notarytool',
    });
    console.log('Notarization successful!');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};