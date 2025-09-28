import { app } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { findAvailablePortWithRetry, parsePortFromEnv } from './port-finder';
import { portManager } from './port-manager';

/**
 * Load server environment variables in development mode.
 *
 * CRITICAL: This MUST run before ANY server code is imported!
 *
 * The server's env.config.ts runs at module import time, which means
 * it executes immediately when the module is loaded. Due to JavaScript's
 * import hoisting, all static imports at the top of a file execute
 * before any code in the file body.
 *
 * To ensure environment variables like CBDB_PATH are available when
 * the server initializes, we must:
 * 1. Load the server's .env file FIRST
 * 2. Use dynamic import() for server modules (delays their loading)
 *
 * @returns void
 */
export function loadServerEnvironment(): void {
  if (!app.isPackaged) {
    const serverEnvPath = path.join(__dirname, '../../../server/.env');
    dotenv.config({ path: serverEnvPath });
    console.log('Development mode: Loading server environment from:', serverEnvPath);
  }
}

/**
 * Initialize Electron app environment
 */
export async function initializeElectronApp(): Promise<void> {
  const isDev = !app.isPackaged;

  // Set up quit handlers
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });


  // Handle graceful exit in development
  if (isDev) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          app.quit();
        }
      });
    } else {
      process.on('SIGTERM', () => {
        app.quit();
      });
    }
  }

  await app.whenReady();
}

/**
 * Set up environment variables for the app
 *
 * This function runs BEFORE any NestJS modules are loaded,
 * allowing us to set the PORT environment variable that will
 * be read by envConfig when the server module is imported.
 *
 * Port Resolution Flow:
 * 1. Check if PORT is already set in environment
 * 2. Try to use preferred port (18019)
 * 3. If unavailable, find an alternative port
 * 4. Set process.env.PORT for NestJS to use
 * 5. Store in PortManager for IPC communication
 */
export async function setupEnvironment(): Promise<void> {
  // Disable Electron security warnings
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

  // Set APP_DB_PATH to Electron's userData directory
  const userDataPath = app.getPath('userData');
  const appDbPath = path.join(userDataPath, 'cbdb-desktop.db');
  process.env.APP_DB_PATH = appDbPath;
  console.log('Setting APP_DB_PATH to:', appDbPath);

  // Find and set available port BEFORE NestJS modules are loaded
  console.log('🔍 Resolving server port...');
  const preferredPort = parsePortFromEnv(process.env.PORT);

  try {
    const availablePort = await findAvailablePortWithRetry(preferredPort, 3);

    // Set the port in environment for NestJS to read
    process.env.PORT = String(availablePort);

    // Also store in PortManager for IPC queries
    portManager.setPort(availablePort);

    console.log(`✅ Server port resolved: ${availablePort}`);

    if (availablePort !== preferredPort) {
      console.log(`ℹ️  Note: Preferred port ${preferredPort} was unavailable`);
    }
  } catch (error) {
    console.error('❌ Failed to find available port:', error);
    // Fall back to default port and hope for the best
    const fallbackPort = preferredPort || 18019;
    process.env.PORT = String(fallbackPort);
    portManager.setPort(fallbackPort);
    console.warn(`⚠️  Using fallback port ${fallbackPort} - server may fail to start if port is in use`);
  }
}