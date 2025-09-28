import { DesktopWorkerManager } from '../workers/worker-manager';

export interface SevenZipWorkerResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
  exitCode?: number;
}

export interface SevenZipWorkerTask {
  action: 'test' | 'extract' | 'list';
  filePath: string;
  options?: any;
}

export interface SevenZipProgressMessage {
  type: 'progress';
  phase: 'analyzing' | 'extracting' | 'copying';
  current: number;
  total: number;
  percentage: number;
  currentFile?: string;
  message?: string;
}

/**
 * SevenZipWorkerManager
 *
 * High-level interface for 7-Zip archive operations using worker threads.
 * Delegates to DesktopWorkerManager for actual worker management.
 *
 * ## Architecture
 * - Uses DesktopWorkerManager for worker lifecycle management
 * - Provides typed interfaces for 7zip-specific operations
 * - Handles timeouts and error recovery
 *
 * ## Usage
 * ```typescript
 * // Extract an archive
 * const result = await SevenZipWorkerManager.extract(
 *   '/path/to/archive.7z',
 *   '/output/directory'
 * );
 *
 * // Test archive integrity
 * const isValid = await SevenZipWorkerManager.testIntegrity('/path/to/archive.7z');
 * ```
 *
 * ## Error Handling
 * - Returns SevenZipWorkerResult with success/error information
 * - Catches and wraps worker errors in consistent format
 * - Provides default timeout of 30 seconds (configurable)
 */
export class SevenZipWorkerManager {
  private static defaultTimeout = 30000; // 30 seconds

  /**
   * Execute a 7zip task in a worker thread with optional progress callback
   */
  static async execute(
    task: SevenZipWorkerTask,
    timeout: number = this.defaultTimeout,
    onProgress?: (progress: SevenZipProgressMessage) => void
  ): Promise<SevenZipWorkerResult> {
    try {
      // Use the centralized DesktopWorkerManager to execute the task
      return await DesktopWorkerManager.executeTask<SevenZipWorkerResult>(
        '7zip.worker.js',
        task,
        timeout,
        onProgress
      );
    } catch (error) {
      console.error('Error executing 7zip task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to ${task.action} archive`
      };
    }
  }

  /**
   * Test archive integrity
   */
  static async testIntegrity(filePath: string): Promise<SevenZipWorkerResult> {
    return this.execute({
      action: 'test',
      filePath
    });
  }

  /**
   * Extract archive with optional progress callback
   */
  static async extract(
    filePath: string,
    outputDir?: string,
    onProgress?: (progress: SevenZipProgressMessage) => void
  ): Promise<SevenZipWorkerResult> {
    // Use a longer timeout for large archives
    const timeout = 300000; // 5 minutes
    return this.execute(
      {
        action: 'extract',
        filePath,
        options: { outputDir }
      },
      timeout,
      onProgress
    );
  }

  /**
   * List archive contents
   */
  static async list(filePath: string): Promise<SevenZipWorkerResult> {
    return this.execute({
      action: 'list',
      filePath
    });
  }
}