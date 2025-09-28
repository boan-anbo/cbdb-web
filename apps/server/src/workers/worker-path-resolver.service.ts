/**
 * Worker Path Resolver Service
 *
 * Convention-based path resolution for Node.js Worker Threads.
 *
 * ## Architecture
 * Workers are ALWAYS located in 'dist/workers' directory, regardless of environment:
 * - NestJS standalone: dist/workers (via nest-cli.json assets)
 * - Electron dev/prod: dist/workers (via Vite copyWorkersPlugin)
 *
 * ## Convention
 * All worker files must follow the naming pattern: *.worker.js
 * This ensures they are properly identified and copied during build.
 *
 * ## Build Process
 * 1. NestJS: nest-cli.json copies src/workers/*.worker.js → dist/workers/
 * 2. Electron: Vite plugin copies server/src/workers/*.worker.js → desktop/dist/workers/
 *
 * This service abstracts the path resolution so consumers don't need to
 * worry about the underlying directory structure.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class WorkerPathResolverService {
  private readonly logger = new Logger(WorkerPathResolverService.name);

  /**
   * Resolves the absolute path to a worker file.
   *
   * The resolution follows a simple convention:
   * - From compiled code location (__dirname), go up one level
   * - Then look in the 'workers' subdirectory
   *
   * @param workerName The worker filename (e.g., 'graph-metrics.worker.js')
   * @returns The absolute path to the worker file
   * @throws Never throws - returns path even if file doesn't exist for better error messages
   */
  getWorkerPath(workerName: string): string {
    // Convention: workers are always at ../workers relative to compiled service location
    // This works because:
    // - Service compiles to: dist/workers/worker-path-resolver.service.js
    // - Workers compile to: dist/workers/*.worker.js
    const workerPath = path.join(__dirname, '..', 'workers', workerName);

    if (!fs.existsSync(workerPath)) {
      this.logger.error(`Worker not found at: ${workerPath}`);
      this.logger.error(`Available workers: ${this.listAvailableWorkers().join(', ') || 'none'}`);
      // Return path anyway for better error messages in worker pool initialization
    } else {
      this.logger.log(`Found worker at: ${workerPath}`);
    }

    return workerPath;
  }

  /**
   * Checks if a worker file exists at the expected location.
   *
   * @param workerName The worker filename to check
   * @returns true if the worker exists, false otherwise
   */
  workerExists(workerName: string): boolean {
    const workerPath = path.join(__dirname, '..', 'workers', workerName);
    return fs.existsSync(workerPath);
  }

  /**
   * Gets the absolute path to the workers directory.
   * Useful for debugging and build verification.
   *
   * @returns The absolute path to the workers directory
   */
  getWorkersDirectory(): string {
    return path.join(__dirname, '..', 'workers');
  }

  /**
   * Lists all available worker files in the workers directory.
   * Only returns files matching the *.worker.js pattern.
   *
   * @returns Array of worker filenames (not full paths)
   * @example ['graph-metrics.worker.js', 'graph-coordinate.worker.js']
   */
  listAvailableWorkers(): string[] {
    const workersDir = this.getWorkersDirectory();

    try {
      if (fs.existsSync(workersDir)) {
        return fs.readdirSync(workersDir)
          .filter(file => file.endsWith('.worker.js'))
          .sort(); // Sort for consistent output
      }
    } catch (error) {
      this.logger.error(`Error listing workers: ${error}`);
    }

    return [];
  }

  /**
   * Validates that all required workers are present.
   * Useful for startup checks and health monitoring.
   *
   * @param requiredWorkers Array of required worker filenames
   * @returns Object with validation result and missing workers
   */
  validateWorkers(requiredWorkers: string[]): { valid: boolean; missing: string[] } {
    const available = this.listAvailableWorkers();
    const missing = requiredWorkers.filter(worker => !available.includes(worker));

    if (missing.length > 0) {
      this.logger.warn(`Missing required workers: ${missing.join(', ')}`);
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }
}