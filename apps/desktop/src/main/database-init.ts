import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {
  getDatabaseStatus,
  getExtractedDatabasePath,
  getBundledArchivePath,
  getDevSourceArchivePath,
  ensureDatabaseDirectories
} from './modules/database-paths';

/**
 * Initialize the CBDB database for the application
 * This will:
 * 1. Check if the database is already extracted
 * 2. Set CBDB_PATH if database exists
 * 3. Prepare for extraction if needed (actual extraction handled by UI)
 */
export async function initializeDatabase(): Promise<void> {
  const isDev = !app.isPackaged;

  // Ensure database directory structure exists
  ensureDatabaseDirectories();

  if (isDev) {
    // In development, copy .7z to simulate bundled resources
    await setupDevelopmentArchive();
  }

  // Get database status using centralized configuration
  const status = getDatabaseStatus();

  // If database is already extracted, set the environment variable
  if (status.isExtracted && status.extractedPath) {
    process.env.CBDB_PATH = status.extractedPath;
    console.log('✅ Using extracted database:', status.extractedPath);
    return;
  }

  // If bundled archive exists but not extracted, UI will handle extraction
  if (status.needsExtraction) {
    console.log('📦 Found bundled archive:', status.bundledArchivePath);
    console.log('⚠️  Database needs extraction - will show UI prompt');
    // Don't set CBDB_PATH - server starts without database
    return;
  }

  // No database available
  console.warn('❌ No CBDB database found. User will need to provide a database file.');
}

/**
 * Setup development archive by copying from source if needed
 */
async function setupDevelopmentArchive(): Promise<void> {
  const sourcePath = getDevSourceArchivePath();
  const targetPath = getBundledArchivePath();

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy archive if source exists and target doesn't
  if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
    console.log('📋 Copying development archive to simulate bundled resources...');
    fs.copyFileSync(sourcePath, targetPath);
    console.log('✅ Copied archive to:', targetPath);
  }
}


/**
 * Get the default database path based on environment
 * Returns the extracted database path if it exists, or archive path if extraction is needed
 */
export function getDefaultDatabasePath(): string | undefined {
  const status = getDatabaseStatus();

  // Return extracted database if available
  if (status.isExtracted && status.extractedPath) {
    return status.extractedPath;
  }

  // Return bundled archive if available (needs extraction)
  if (status.hasBundledArchive && status.bundledArchivePath) {
    return status.bundledArchivePath;
  }

  // In development, also check for direct .db file
  const isDev = !app.isPackaged;
  if (isDev) {
    const devDbPath = path.join(__dirname, '../../../../cbdb_sql_db/latest.db');
    if (fs.existsSync(devDbPath)) {
      return devDbPath;
    }
  }

  return undefined;
}