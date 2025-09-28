import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Configuration for database initialization
 */
export interface DatabaseConfig {
  bundled7zPath: string;
  extractedDbPath: string;
  isDev: boolean;
}

/**
 * Get database configuration based on environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  const isDev = !app.isPackaged;
  const userDataPath = app.getPath('userData');
  const extractedDbPath = path.join(userDataPath, 'databases', 'cbdb', 'latest.db');

  let bundled7zPath: string;

  if (isDev) {
    // In development, use simulated resources path
    const devResourcesPath = path.join(__dirname, '../../../resources');
    bundled7zPath = path.join(devResourcesPath, 'database', 'latest.7z');
  } else {
    // In production, use actual resources path
    const resourcesPath = process.resourcesPath || app.getAppPath();
    bundled7zPath = path.join(resourcesPath, 'database', 'latest.7z');
  }

  return {
    bundled7zPath,
    extractedDbPath,
    isDev
  };
}

/**
 * Set up development environment for database testing
 */
function setupDevelopmentDatabase(config: DatabaseConfig): void {
  if (!config.isDev) return;

  // In development, simulate the production flow by copying .7z to resources location
  const dev7zSource = path.join(__dirname, '../../../../../../cbdb_sql_db/latest.7z');
  const devResourcesPath = path.join(__dirname, '../../../resources');
  const dev7zTarget = path.join(devResourcesPath, 'database', 'latest.7z');

  // Ensure the resources/database directory exists
  const devDbDir = path.join(devResourcesPath, 'database');
  if (!fs.existsSync(devDbDir)) {
    fs.mkdirSync(devDbDir, { recursive: true });
  }

  // Copy the .7z file if it doesn't exist in resources
  if (!fs.existsSync(dev7zTarget) && fs.existsSync(dev7zSource)) {
    console.log('Copying development .7z to simulate bundled resources...');
    fs.copyFileSync(dev7zSource, dev7zTarget);
    console.log('Copied .7z to:', dev7zTarget);
  }
}

/**
 * Check database status and determine initialization path
 */
function checkDatabaseStatus(config: DatabaseConfig): 'extracted' | 'needs-extraction' | 'not-found' {
  // Check if database is already extracted
  if (fs.existsSync(config.extractedDbPath)) {
    process.env.CBDB_PATH = config.extractedDbPath;
    console.log('Using extracted database:', config.extractedDbPath);
    return 'extracted';
  }

  // Check if bundled 7z exists and needs extraction
  if (fs.existsSync(config.bundled7zPath)) {
    console.log('Found bundled database archive:', config.bundled7zPath);
    console.log('Database needs extraction - will show UI prompt');
    // Don't set CBDB_PATH - let the app start without it
    // The React UI will handle extraction
    return 'needs-extraction';
  }

  // No database found
  console.warn('No CBDB database found. User will need to provide a database file.');
  return 'not-found';
}

/**
 * Initialize the CBDB database for the application
 * This will:
 * 1. Check if the database is already extracted
 * 2. If not, check if bundled .7z exists
 * 3. Set the CBDB_PATH environment variable if database is ready
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const config = getDatabaseConfig();

    // Set up development environment if needed
    setupDevelopmentDatabase(config);

    // Check database status and handle accordingly
    const status = checkDatabaseStatus(config);

    if (status === 'not-found' && config.isDev) {
      console.warn('No CBDB database found in development. Please ensure cbdb_sql_db/latest.7z exists');
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
}

/**
 * Get the default database path based on environment
 * Used for fallback when no configured path exists
 */
export function getDefaultDatabasePath(): string | undefined {
  const config = getDatabaseConfig();

  // Check if database is already extracted
  if (fs.existsSync(config.extractedDbPath)) {
    return config.extractedDbPath;
  }

  // Check if bundled 7z exists
  if (fs.existsSync(config.bundled7zPath)) {
    return config.bundled7zPath;
  }

  // In dev, also check source location
  if (config.isDev) {
    const devDbPath = path.join(__dirname, '../../../../../../cbdb_sql_db/latest.db');
    const dev7zPath = path.join(__dirname, '../../../../../../cbdb_sql_db/latest.7z');

    if (fs.existsSync(devDbPath)) {
      return devDbPath;
    } else if (fs.existsSync(dev7zPath)) {
      return dev7zPath;
    }
  }

  return undefined;
}