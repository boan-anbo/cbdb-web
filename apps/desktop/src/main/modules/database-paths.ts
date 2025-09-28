/**
 * Database Path Configuration Module
 *
 * Centralized configuration for all database-related paths.
 * This module provides a single source of truth for database locations,
 * making it easy to maintain and modify path structures.
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Database path configuration constants
 */
const DATABASE_FOLDER = 'database';
const DATABASE_NAME = 'latest';
const DATABASE_FILE = 'latest.db';
const ARCHIVE_FILE = 'latest.7z';

/**
 * Get the root database directory in user data
 */
export function getDatabaseRoot(): string {
  return path.join(app.getPath('userData'), DATABASE_FOLDER);
}

/**
 * Get the extracted database directory path
 */
export function getExtractedDatabaseDir(): string {
  return path.join(getDatabaseRoot(), DATABASE_NAME);
}

/**
 * Get the full path to the extracted database file
 */
export function getExtractedDatabasePath(): string {
  return path.join(getExtractedDatabaseDir(), DATABASE_FILE);
}

/**
 * Get the path to the bundled archive in resources
 */
export function getBundledArchivePath(): string {
  const isDev = !app.isPackaged;

  if (isDev) {
    // Development: simulate resources location
    const devResourcesPath = path.join(__dirname, '../../../resources');
    return path.join(devResourcesPath, DATABASE_FOLDER, ARCHIVE_FILE);
  } else {
    // Production: use actual resources path
    const resourcesPath = process.resourcesPath || app.getAppPath();
    return path.join(resourcesPath, DATABASE_FOLDER, ARCHIVE_FILE);
  }
}

/**
 * Get the development source archive path (for copying during dev)
 */
export function getDevSourceArchivePath(): string {
  return path.join(__dirname, '../../../../../cbdb_sql_db', ARCHIVE_FILE);
}

/**
 * Check if the database is already extracted
 */
export function isDatabaseExtracted(): boolean {
  return fs.existsSync(getExtractedDatabasePath());
}

/**
 * Check if the bundled archive exists
 */
export function isBundledArchiveAvailable(): boolean {
  return fs.existsSync(getBundledArchivePath());
}

/**
 * Ensure the database directory structure exists
 */
export function ensureDatabaseDirectories(): void {
  const dirs = [
    getDatabaseRoot(),
    getExtractedDatabaseDir()
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Get database status information
 */
export interface DatabaseStatus {
  isExtracted: boolean;
  extractedPath?: string;
  hasBundledArchive: boolean;
  bundledArchivePath?: string;
  needsExtraction: boolean;
}

export function getDatabaseStatus(): DatabaseStatus {
  const isExtracted = isDatabaseExtracted();
  const hasBundledArchive = isBundledArchiveAvailable();

  return {
    isExtracted,
    extractedPath: isExtracted ? getExtractedDatabasePath() : undefined,
    hasBundledArchive,
    bundledArchivePath: hasBundledArchive ? getBundledArchivePath() : undefined,
    needsExtraction: !isExtracted && hasBundledArchive
  };
}