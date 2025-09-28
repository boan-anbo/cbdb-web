import { ipcMain, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Seven from 'node-7z';
const pathTo7zip = require('7zip-bin').path7za;

/**
 * Database status information
 */
export interface DatabaseStatus {
  needsExtraction: boolean;
  bundledPath?: string;
  targetPath?: string;
}

/**
 * Database extraction result
 */
export interface ExtractionResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Check if database extraction is needed
 */
export function checkDatabaseStatus(): DatabaseStatus {
  const isDev = !app.isPackaged;

  // In dev, use the simulated resources path
  const resourcesPath = isDev
    ? path.join(__dirname, '../../../resources')
    : (process.resourcesPath || app.getAppPath());

  const bundled7zPath = path.join(resourcesPath, 'database', 'latest.7z');
  const userDataPath = app.getPath('userData');
  const extractedDbPath = path.join(userDataPath, 'databases', 'cbdb', 'latest.db');

  // Already extracted
  if (fs.existsSync(extractedDbPath)) {
    return { needsExtraction: false };
  }

  // Has bundled database that needs extraction
  if (fs.existsSync(bundled7zPath)) {
    return {
      needsExtraction: true,
      bundledPath: bundled7zPath,
      targetPath: extractedDbPath
    };
  }

  // No database at all
  return { needsExtraction: false };
}

/**
 * Extract database with progress tracking
 */
async function extractDatabase(event: Electron.IpcMainInvokeEvent): Promise<ExtractionResult> {
  const status = checkDatabaseStatus();

  if (!status.needsExtraction || !status.bundledPath || !status.targetPath) {
    return { success: false, error: 'No extraction needed or paths invalid' };
  }

  return new Promise((resolve) => {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(status.targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Extract using 7zip
      const myStream = Seven.extractFull(status.bundledPath, targetDir, {
        $bin: pathTo7zip,
        $progress: true
      });

      myStream.on('progress', (progress) => {
        // Send progress to renderer
        event.sender.send('database:extract-progress', {
          percent: progress.percent,
          file: progress.file
        });
      });

      myStream.on('end', () => {
        // Check if extraction produced the expected file
        if (!fs.existsSync(status.targetPath)) {
          // Try to find any .db file in the extraction directory
          const files = fs.readdirSync(targetDir);
          const dbFile = files.find(f => f.endsWith('.db'));

          if (dbFile) {
            const actualDbPath = path.join(targetDir, dbFile);
            // Rename to expected name
            fs.renameSync(actualDbPath, status.targetPath);

            // Set the environment variable for NestJS
            process.env.CBDB_PATH = status.targetPath;

            resolve({ success: true, path: status.targetPath });
          } else {
            resolve({ success: false, error: 'No database file found after extraction' });
          }
        } else {
          // Set the environment variable for NestJS
          process.env.CBDB_PATH = status.targetPath;
          resolve({ success: true, path: status.targetPath });
        }
      });

      myStream.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    } catch (error: any) {
      resolve({ success: false, error: error.message });
    }
  });
}

/**
 * Set up IPC handlers for database operations
 */
export function setupIpcHandlers(): void {
  // Check if extraction is needed
  ipcMain.handle('database:check-status', () => {
    return checkDatabaseStatus();
  });

  // Extract database with progress
  ipcMain.handle('database:extract', extractDatabase);

  // Reload the app after extraction (restarts NestJS with CBDB_PATH set)
  ipcMain.handle('app:reload', () => {
    app.relaunch();
    app.exit(0);
  });
}