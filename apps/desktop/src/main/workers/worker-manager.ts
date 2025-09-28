/**
 * Desktop Worker Manager
 *
 * Manages worker thread lifecycle for Electron desktop application.
 * Provides unified interface for creating and managing desktop-specific workers.
 *
 * ## Architecture
 * - Desktop workers are compiled from TypeScript to JavaScript during build
 * - Workers are located in dist/workers/ directory
 * - Path resolution handles both development and production environments
 *
 * ## Usage
 * ```typescript
 * const worker = DesktopWorkerManager.createWorker('7zip.worker.js');
 * worker.postMessage({ action: 'extract', filePath: '...' });
 * ```
 */

import { Worker } from 'worker_threads';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

export class DesktopWorkerManager {
  /**
   * Get the absolute path to a worker file.
   * Handles different paths for development vs production.
   *
   * @param workerName The worker filename (e.g., '7zip.worker.js')
   * @returns The absolute path to the worker file
   */
  private static getWorkerPath(workerName: string): string {
    const isDev = !app.isPackaged;

    // Get the app path - in dev this is dist/main
    const appPath = app.getAppPath();

    // In development: app.getAppPath() returns dist/main, we need to go up to dist then into workers
    // In production: workers are in dist/workers inside app.asar
    const basePath = isDev
      ? path.join(appPath, '..', 'workers')  // dist/main/../workers = dist/workers
      : path.join(appPath, 'dist', 'workers');  // Inside app.asar: /dist/workers

    const workerPath = path.join(basePath, workerName);

    // Log for debugging
    console.log(`[DesktopWorkerManager] Resolving worker: ${workerName}`);
    console.log(`[DesktopWorkerManager] Environment: ${isDev ? 'development' : 'production'}`);
    console.log(`[DesktopWorkerManager] App path: ${appPath}`);
    console.log(`[DesktopWorkerManager] Worker path: ${workerPath}`);
    console.log(`[DesktopWorkerManager] Exists: ${fs.existsSync(workerPath)}`);

    return workerPath;
  }

  /**
   * Create a new worker thread.
   *
   * @param workerName The worker filename (e.g., '7zip.worker.js')
   * @returns A new Worker instance
   * @throws Error if worker file doesn't exist
   */
  static createWorker(workerName: string): Worker {
    const workerPath = this.getWorkerPath(workerName);

    if (!fs.existsSync(workerPath)) {
      // List available workers for debugging
      const workersDir = path.dirname(workerPath);
      const availableWorkers = fs.existsSync(workersDir)
        ? fs.readdirSync(workersDir).filter(f => f.endsWith('.worker.js'))
        : [];

      throw new Error(
        `Worker not found: ${workerName}\n` +
        `Expected at: ${workerPath}\n` +
        `Available workers: ${availableWorkers.join(', ') || 'none'}`
      );
    }

    return new Worker(workerPath);
  }

  /**
   * Check if a worker file exists.
   *
   * @param workerName The worker filename to check
   * @returns true if the worker exists, false otherwise
   */
  static workerExists(workerName: string): boolean {
    const workerPath = this.getWorkerPath(workerName);
    return fs.existsSync(workerPath);
  }

  /**
   * List all available desktop workers.
   *
   * @returns Array of worker filenames
   */
  static listAvailableWorkers(): string[] {
    const isDev = !app.isPackaged;
    const basePath = isDev
      ? path.join(__dirname, '../../workers')
      : path.join(process.resourcesPath, 'app', 'dist', 'workers');

    try {
      if (fs.existsSync(basePath)) {
        return fs.readdirSync(basePath)
          .filter(file => file.endsWith('.worker.js'))
          .sort();
      }
    } catch (error) {
      console.error(`[DesktopWorkerManager] Error listing workers: ${error}`);
    }

    return [];
  }

  /**
   * Execute a task in a worker with timeout support.
   * Creates a worker, sends the task, and handles cleanup.
   *
   * @param workerName The worker to use
   * @param task The task to execute
   * @param timeout Timeout in milliseconds (default: 30 seconds)
   * @param onProgress Optional callback for progress updates
   * @returns Promise resolving to worker result
   */
  static async executeTask<T = any>(
    workerName: string,
    task: any,
    timeout: number = 30000,
    onProgress?: (progress: any) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let worker: Worker | null = null;
      let timeoutHandle: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
        }
        if (worker) {
          worker.terminate();
          worker = null;
        }
      };

      try {
        // Create worker
        worker = this.createWorker(workerName);

        // Set up timeout
        timeoutHandle = setTimeout(() => {
          cleanup();
          reject(new Error(`Worker task timed out after ${timeout}ms`));
        }, timeout);

        // Listen for messages
        worker.on('message', (message: any) => {
          // Check if it's a progress message
          if (message && message.type === 'progress') {
            // Don't cleanup for progress messages
            onProgress?.(message);
          } else {
            // It's the final result
            cleanup();
            resolve(message as T);
          }
        });

        // Listen for errors
        worker.on('error', (error) => {
          cleanup();
          reject(error);
        });

        // Send task to worker
        worker.postMessage(task);

      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }
}