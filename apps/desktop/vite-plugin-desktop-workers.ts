/**
 * Vite Plugin: Compile Desktop Workers
 *
 * This plugin compiles TypeScript worker files from the desktop application
 * into JavaScript files that can be run in worker threads.
 *
 * ## Why This Plugin Exists
 * - Desktop-specific workers (like 7zip) should live in the desktop app
 * - Workers need to be compiled from TypeScript to JavaScript
 * - Compilation happens during build to ensure type safety
 *
 * ## Convention
 * - Source: apps/desktop/src/main/workers/*.worker.ts
 * - Target: apps/desktop/dist/workers/*.worker.js
 * - Pattern: All TypeScript files ending with .worker.ts are compiled
 *
 * ## Execution
 * - buildStart: Compiles workers when dev server starts
 * - writeBundle: Compiles workers during production build
 */

import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { Plugin } from 'vite';
import * as esbuild from 'esbuild';

export function compileDesktopWorkersPlugin(): Plugin {
  // Configuration constants
  const WORKER_SOURCE_DIR = 'src/main/workers';
  const WORKER_TARGET_DIR = 'dist/workers';
  const WORKER_SOURCE_PATTERN = '.worker.ts';
  const WORKER_TARGET_PATTERN = '.worker.js';

  /**
   * Compiles all desktop worker files from TypeScript to JavaScript.
   * Creates target directory if it doesn't exist.
   */
  async function compileWorkers(): Promise<void> {
    const sourcePath = join(__dirname, WORKER_SOURCE_DIR);
    const targetPath = join(__dirname, WORKER_TARGET_DIR);

    try {
      // Ensure target directory exists
      await fs.mkdir(targetPath, { recursive: true });

      // Check if source directory exists
      try {
        await fs.access(sourcePath);
      } catch {
        console.log('⏭️  No desktop workers to compile (source directory not found)');
        return;
      }

      // Find all TypeScript worker files
      const files = await fs.readdir(sourcePath);
      const workerFiles = files.filter(file => file.endsWith(WORKER_SOURCE_PATTERN));

      if (workerFiles.length === 0) {
        console.log('⏭️  No desktop workers to compile');
        return;
      }

      console.log(`📦 Compiling ${workerFiles.length} desktop worker(s)...`);

      // Compile each worker file
      const compilePromises = workerFiles.map(async (file) => {
        const entryPoint = join(sourcePath, file);
        const outfile = join(targetPath, file.replace(WORKER_SOURCE_PATTERN, WORKER_TARGET_PATTERN));

        try {
          // Use esbuild to compile TypeScript to JavaScript
          await esbuild.build({
            entryPoints: [entryPoint],
            outfile,
            bundle: true,
            platform: 'node',
            target: 'node18',
            format: 'cjs',
            // Don't bundle Node.js built-in modules
            external: ['worker_threads', 'fs', 'path', 'crypto', 'stream', 'util', 'os'],
            // Handle TypeScript
            loader: { '.ts': 'ts' },
            // Enable source maps for debugging
            sourcemap: true,
            // Minify in production
            minify: process.env.NODE_ENV === 'production',
          });

          console.log(`  ✅ Compiled: ${file} → ${file.replace(WORKER_SOURCE_PATTERN, WORKER_TARGET_PATTERN)}`);
          return file;
        } catch (error) {
          console.error(`  ❌ Failed to compile ${file}:`, error);
          throw error;
        }
      });

      await Promise.all(compilePromises);
      console.log(`✅ Successfully compiled ${workerFiles.length} desktop worker(s)`);

    } catch (error) {
      // Log error but don't fail the build
      console.error('❌ Failed to compile desktop workers:', error);
      console.error('   Desktop workers may not function properly');
    }
  }

  return {
    name: 'compile-desktop-workers',

    // Hook: Called when build starts (dev mode)
    async buildStart() {
      console.log('🔨 Compiling desktop workers for development...');
      await compileWorkers();
    },

    // Hook: Called when writing the bundle (production build)
    async writeBundle() {
      console.log('🔨 Compiling desktop workers for production...');
      await compileWorkers();
    }
  };
}