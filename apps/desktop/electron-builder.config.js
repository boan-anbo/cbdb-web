// Load environment variables for notarization
require('dotenv').config({ path: '.env.local' });

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  electronVersion: '38.1.2',
  directories: {
    output: 'dist/electron',
    buildResources: 'build',
  },
  publish: null,
  npmRebuild: true,
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/render/**/*',
    'dist/workers/**/*',
    'node_modules/**/*',
    '!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!node_modules/**/*.d.ts',
  ],
  extraResources: [
    {
      from: '../../cbdb_sql_db/latest.7z',
      to: 'database/latest.7z',
    },
  ],
  // Hook for code signing and notarization
  afterSign: './scripts/notarize.js',
  // Platform-specific configurations
  mac: {
    icon: 'build/icon.icns',
    category: 'public.app-category.education',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  win: {
    icon: 'build/icon.ico',
  },
  linux: {
    icon: 'build/icon.png',
    category: 'Education',
  },
}

module.exports = config
