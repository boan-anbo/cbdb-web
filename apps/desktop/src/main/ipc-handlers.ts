import { ipcMain, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {
  getAppPaths,
  getCbdbPaths,
  getArchivePaths,
  openInFileExplorer,
  revealInFileExplorer,
  formatBytes,
  getSize
} from './modules/file-system.utils';
import { portManager } from './modules/port-manager';
import { SevenZipWorkerManager } from './modules/7zip-worker-manager';


/**
 * Set up IPC handlers for database operations
 */
export function setupIpcHandlers() {

  // Reload the app after extraction (restarts NestJS with CBDB_PATH set)
  ipcMain.handle('app:reload', () => {
    app.relaunch();
    app.exit(0);
  });

  // File system operations
  ipcMain.handle('fs:getAppPaths', () => {
    return getAppPaths();
  });

  ipcMain.handle('fs:getCbdbPaths', () => {
    return getCbdbPaths();
  });

  ipcMain.handle('fs:getArchiveInfo', () => {
    const paths = getCbdbPaths();
    const archivePaths = getArchivePaths();

    return {
      archive: {
        path: archivePaths.archivePath,
        exists: archivePaths.exists,
        size: archivePaths.exists && fs.existsSync(archivePaths.archivePath)
          ? getSize(archivePaths.archivePath)
          : 0,
        sizeFormatted: archivePaths.exists && fs.existsSync(archivePaths.archivePath)
          ? formatBytes(getSize(archivePaths.archivePath))
          : 'N/A'
      },
      extracted: {
        path: paths.extractedDb,
        exists: fs.existsSync(paths.extractedDb),
        size: fs.existsSync(paths.extractedDb) ? getSize(paths.extractedDb) : 0,
        sizeFormatted: fs.existsSync(paths.extractedDb)
          ? formatBytes(getSize(paths.extractedDb))
          : 'N/A'
      }
    };
  });

  ipcMain.handle('fs:openInExplorer', async (event, pathToOpen: string) => {
    return await openInFileExplorer(pathToOpen);
  });

  ipcMain.handle('fs:revealInExplorer', (event, pathToReveal: string) => {
    return revealInFileExplorer(pathToReveal);
  });

  ipcMain.handle('fs:openArchiveLocation', async () => {
    const archivePaths = getArchivePaths();
    if (archivePaths.exists && fs.existsSync(archivePaths.archivePath)) {
      return await openInFileExplorer(path.dirname(archivePaths.archivePath));
    }
    return false;
  });

  ipcMain.handle('fs:openExtractedLocation', async () => {
    const paths = getCbdbPaths();
    if (fs.existsSync(paths.extractedDb)) {
      return await openInFileExplorer(path.dirname(paths.extractedDb));
    } else if (fs.existsSync(paths.cbdbDir)) {
      return await openInFileExplorer(paths.cbdbDir);
    }
    return false;
  });

  // File existence check
  ipcMain.handle('fs:checkFileExists', (event, filePath: string) => {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  });

  // Ensure directory exists
  ipcMain.handle('fs:ensureDirectory', (event, dirPath: string) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (error) {
      console.error('Error ensuring directory:', error);
      return false;
    }
  });

  // Extract 7z archive using 7z-wasm in a worker thread with progress
  ipcMain.handle('fs:extract7z', async (event, archivePath: string, outputPath: string) => {
    try {
      // Check if archive exists
      if (!fs.existsSync(archivePath)) {
        return { success: false, error: 'Archive file does not exist' };
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Use the worker manager to extract with progress reporting
      const result = await SevenZipWorkerManager.extract(
        archivePath,
        outputDir,
        (progress) => {
          // Send progress to renderer
          event.sender.send('fs:extract7z-progress', progress);
        }
      );

      // If extraction was successful and we got a different filename, rename it
      if (result.success) {
        // Check if the extracted file needs to be renamed to latest.db
        const extractedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.db'));
        if (extractedFiles.length > 0 && !fs.existsSync(outputPath)) {
          const extractedFile = path.join(outputDir, extractedFiles[0]);
          fs.renameSync(extractedFile, outputPath);
        }

        // Set CBDB_PATH for next restart (won't affect current server)
        process.env.CBDB_PATH = outputPath;

        // Add restart flag to indicate server needs restart
        result.needsRestart = true;
      }

      return result;

    } catch (error) {
      console.error('Error extracting 7z archive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to extract archive'
      };
    }
  });

  // Server port information
  ipcMain.handle('server:getPort', () => {
    return portManager.getPort();
  });

  ipcMain.handle('server:getUrl', () => {
    return portManager.getServerUrl();
  });

  ipcMain.handle('server:getApiUrl', () => {
    return portManager.getApiUrl();
  });

  // Debug and diagnostics
  ipcMain.handle('debug:getSystemInfo', () => {
    const isDev = !app.isPackaged;

    return {
      app: {
        version: app.getVersion(),
        isPackaged: app.isPackaged,
        isDev,
      },
      server: {
        port: portManager.getPort(),
        serverUrl: portManager.getServerUrl(),
        apiUrl: portManager.getApiUrl(),
      },
      environment: {
        PORT: process.env.PORT,
        CBDB_PATH: process.env.CBDB_PATH,
        APP_DB_PATH: process.env.APP_DB_PATH,
        DS_RENDERER_URL: process.env.DS_RENDERER_URL,
        NODE_ENV: process.env.NODE_ENV,
        DEBUG_ELECTRON: process.env.DEBUG_ELECTRON,
        DEBUG_IPC: process.env.DEBUG_IPC,
        DEBUG_BUILD: process.env.DEBUG_BUILD,
      },
      paths: {
        userData: app.getPath('userData'),
        temp: app.getPath('temp'),
        appData: app.getPath('appData'),
      },
      platform: {
        os: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    };
  });
}