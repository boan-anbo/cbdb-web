/**
 * Vite Plugin: Copy Server Workers
 *
 * This plugin copies pre-compiled server worker files to the desktop build
 * so they can be used when the desktop app embeds the NestJS server.
 *
 * ## Why This Plugin Exists
 * - Server workers are used by NestJS services for graph computations
 * - Desktop app embeds the NestJS server and needs access to these workers
 * - Workers must be available at a predictable location
 *
 * ## Convention
 * - Source: apps/server/src/workers/*.worker.js (pre-compiled JavaScript)
 * - Target: apps/desktop/dist/workers/*.worker.js
 * - Pattern: Only copies actual worker files (*.worker.js), not services
 *
 * ## Execution
 * - buildStart: Copies workers when dev server starts
 * - writeBundle: Copies workers during production build
 */

import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { Plugin } from 'vite';

export function copyServerWorkersPlugin(): Plugin {
  // Configuration constants
  const SERVER_WORKER_SOURCE_DIR = '../../apps/server/src/workers';
  const WORKER_TARGET_DIR = 'dist/workers';
  const WORKER_FILE_PATTERN = '.worker.js';

  // List of desktop-specific workers that should NOT be copied from server
  const DESKTOP_WORKERS = ['7zip.worker.js'];

  /**
   * Copies server worker files to the desktop build.
   * Only copies actual worker files, not TypeScript services or other files.
   */
  async function copyServerWorkers(): Promise<void> {
    const sourcePath = join(__dirname, SERVER_WORKER_SOURCE_DIR);
    const targetPath = join(__dirname, WORKER_TARGET_DIR);

    try {
      // Ensure target directory exists
      await fs.mkdir(targetPath, { recursive: true });

      // Check if source directory exists
      try {
        await fs.access(sourcePath);
      } catch {
        console.log('⏭️  No server workers to copy (source directory not found)');
        return;
      }

      // Find all worker files
      const files = await fs.readdir(sourcePath);
      const workerFiles = files.filter(file => {
        // Only copy JavaScript worker files
        if (!file.endsWith(WORKER_FILE_PATTERN)) return false;
        // Skip desktop-specific workers if they somehow end up in server
        if (DESKTOP_WORKERS.includes(file)) return false;
        return true;
      });

      if (workerFiles.length === 0) {
        console.log('⏭️  No server workers to copy');
        return;
      }

      console.log(`📋 Copying ${workerFiles.length} server worker(s)...`);

      // Copy each worker file
      const copyPromises = workerFiles.map(async (file) => {
        const source = join(sourcePath, file);
        const target = join(targetPath, file);

        try {
          await fs.copyFile(source, target);
          console.log(`  📋 Copied: ${file}`);
          return file;
        } catch (error) {
          console.error(`  ❌ Failed to copy ${file}:`, error);
          throw error;
        }
      });

      await Promise.all(copyPromises);
      console.log(`✅ Successfully copied ${workerFiles.length} server worker(s)`);

    } catch (error) {
      // Log error but don't fail the build - server workers are optional for UI-only development
      console.error('❌ Failed to copy server workers:', error);
      console.error('   Server-based features may not function properly');
    }
  }

  return {
    name: 'copy-server-workers',

    // Hook: Called when build starts (dev mode)
    async buildStart() {
      // Skip in UI-only mode (no backend needed)
      if (process.env.VITE_UI_ONLY === 'true') {
        console.log('⏭️  Skipping server worker copy (UI-only mode)');
        return;
      }

      console.log('📦 Copying server workers for development...');
      await copyServerWorkers();
    },

    // Hook: Called when writing the bundle (production build)
    async writeBundle() {
      // Skip in UI-only mode
      if (process.env.VITE_UI_ONLY === 'true') return;

      console.log('📦 Copying server workers for production...');
      await copyServerWorkers();
    }
  };
}