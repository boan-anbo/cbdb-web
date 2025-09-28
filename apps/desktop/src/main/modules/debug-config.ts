/**
 * Debug Configuration Module
 *
 * Centralized debug flags for the Electron application.
 * Use environment variables to enable specific debug features.
 *
 * Usage:
 * - DEBUG_ELECTRON=true npm run dev  # Enable Electron debugging
 * - DEBUG_IPC=true npm run dev       # Enable IPC debugging
 * - DEBUG_BUILD=true npm run dev     # Enable build debugging
 * - DEBUG_ALL=true npm run dev       # Enable all debugging
 */

// Check if any debug flag is enabled
const DEBUG_ALL = process.env.DEBUG_ALL === 'true';

// Individual debug flags
export const DEBUG_ELECTRON = DEBUG_ALL || process.env.DEBUG_ELECTRON === 'true';
export const DEBUG_IPC = DEBUG_ALL || process.env.DEBUG_IPC === 'true';
export const DEBUG_BUILD = DEBUG_ALL || process.env.DEBUG_BUILD === 'true';
export const DEBUG_URL = DEBUG_ALL || process.env.DEBUG_URL === 'true';

// Helper function for conditional debug logging
export function debugLog(flag: boolean, ...args: any[]) {
  if (flag) {
    console.log(...args);
  }
}

// Helper function for debug-only code execution
export function debugOnly(flag: boolean, fn: () => void) {
  if (flag) {
    fn();
  }
}

// Log active debug flags on startup
if (DEBUG_ALL || DEBUG_ELECTRON || DEBUG_IPC || DEBUG_BUILD || DEBUG_URL) {
  console.log('🔍 Debug Mode Active:');
  if (DEBUG_ALL) console.log('  - ALL debugging enabled');
  if (DEBUG_ELECTRON) console.log('  - Electron debugging enabled');
  if (DEBUG_IPC) console.log('  - IPC debugging enabled');
  if (DEBUG_BUILD) console.log('  - Build debugging enabled');
  if (DEBUG_URL) console.log('  - URL debugging enabled');
}