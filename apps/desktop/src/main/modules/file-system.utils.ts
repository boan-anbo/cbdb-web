import { app, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {
  getDatabaseRoot,
  getExtractedDatabasePath,
  getBundledArchivePath,
  isDatabaseExtracted
} from './database-paths';

/**
 * File system utilities for Electron main process
 */

/**
 * Get common application paths
 */
export function getAppPaths() {
  return {
    userData: app.getPath('userData'),
    temp: app.getPath('temp'),
    appData: app.getPath('appData'),
    home: app.getPath('home'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
    desktop: app.getPath('desktop'),
    exe: app.getPath('exe'),
    module: app.getPath('module')
  };
}

/**
 * Get CBDB-specific paths
 * Uses centralized database path configuration
 */
export function getCbdbPaths() {
  const userDataPath = app.getPath('userData');

  return {
    userDataPath,
    databasesDir: getDatabaseRoot(),
    cbdbDir: getDatabaseRoot(), // For backward compatibility
    extractedDb: getExtractedDatabasePath(),
    appDb: path.join(userDataPath, 'cbdb-desktop.db'),
    logs: path.join(userDataPath, 'logs'),
    cache: path.join(userDataPath, 'cache')
  };
}

/**
 * Get archive paths (for development and production)
 * Uses centralized database path configuration
 */
export function getArchivePaths() {
  const archivePath = getBundledArchivePath();
  const exists = fs.existsSync(archivePath);

  // Get the resources path for backward compatibility
  const isDev = !app.isPackaged;
  const resourcesPath = isDev
    ? path.join(__dirname, '../../../resources')
    : (process.resourcesPath || app.getAppPath());

  return {
    resourcesPath,
    archivePath,
    devFallbackPaths: [], // No longer needed - handled in database-paths.ts
    exists
  };
}

/**
 * Open a folder in the system file explorer
 * @param folderPath Path to the folder to open
 * @returns Promise<boolean> indicating success
 */
export async function openInFileExplorer(folderPath: string): Promise<boolean> {
  try {
    // Ensure the path exists
    if (!fs.existsSync(folderPath)) {
      console.error(`Path does not exist: ${folderPath}`);
      return false;
    }

    // If it's a file, show it in its containing folder
    const stats = fs.statSync(folderPath);
    if (stats.isFile()) {
      // Show the file in its folder
      shell.showItemInFolder(folderPath);
    } else {
      // Open the folder directly
      await shell.openPath(folderPath);
    }

    return true;
  } catch (error) {
    console.error('Failed to open in file explorer:', error);
    return false;
  }
}

/**
 * Reveal a file in the system file explorer
 * This will open the containing folder and select the file
 * @param filePath Path to the file to reveal
 * @returns boolean indicating success
 */
export function revealInFileExplorer(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return false;
    }

    shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    console.error('Failed to reveal in file explorer:', error);
    return false;
  }
}

/**
 * Open a file with the default system application
 * @param filePath Path to the file to open
 * @returns Promise<string> empty string on success, error message on failure
 */
export async function openWithDefaultApp(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      return `File does not exist: ${filePath}`;
    }

    const errorMessage = await shell.openPath(filePath);
    return errorMessage; // Empty string means success
  } catch (error) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}

/**
 * Open an external URL in the default browser
 * @param url URL to open
 * @returns Promise<void>
 */
export async function openExternalUrl(url: string): Promise<void> {
  await shell.openExternal(url);
}

/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath Path to the directory
 * @returns boolean indicating if directory exists (created or already existed)
 */
export function ensureDirectory(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Failed to ensure directory ${dirPath}:`, error);
    return false;
  }
}

/**
 * Get file or folder size in bytes
 * @param itemPath Path to file or folder
 * @returns Size in bytes, or -1 if error
 */
export function getSize(itemPath: string): number {
  try {
    const stats = fs.statSync(itemPath);

    if (stats.isFile()) {
      return stats.size;
    } else if (stats.isDirectory()) {
      let totalSize = 0;
      const files = fs.readdirSync(itemPath);

      for (const file of files) {
        const filePath = path.join(itemPath, file);
        totalSize += getSize(filePath);
      }

      return totalSize;
    }

    return 0;
  } catch (error) {
    console.error(`Failed to get size of ${itemPath}:`, error);
    return -1;
  }
}

/**
 * Format bytes to human readable string
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.2 GB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Unknown';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}