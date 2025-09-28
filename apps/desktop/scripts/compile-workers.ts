#!/usr/bin/env tsx

/**
 * Standalone Worker Compilation Script
 *
 * Compiles TypeScript worker files to JavaScript for use in Electron worker threads.
 * This script can be run independently of the main build process for development.
 *
 * Usage:
 *   npm run build:workers          # Compile all workers once
 *   npm run build:workers:watch    # Watch mode for development
 *   npm run dev:workers            # Alias for watch mode
 *
 * Source: src/main/workers/*.worker.ts
 * Output: dist/workers/*.worker.js
 *
 * Worker Size Notes:
 * - 7zip.worker.js: ~140KB (includes 7z-wasm library)
 * - Future workers should aim for <50KB without large dependencies
 */

import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs/promises';
import { watch } from 'chokidar';

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'src/main/workers');
const OUTPUT_DIR = path.join(ROOT_DIR, 'dist/workers');
const IS_WATCH = process.argv.includes('--watch');
const IS_PROD = process.env.NODE_ENV === 'production';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)}KB` : `${(kb / 1024).toFixed(1)}MB`;
}

async function ensureDirectory(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function findWorkerFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(SOURCE_DIR);
    return files.filter(file => file.endsWith('.worker.ts'));
  } catch (error) {
    return [];
  }
}

async function compileWorker(workerFile: string): Promise<boolean> {
  const startTime = Date.now();
  const inputPath = path.join(SOURCE_DIR, workerFile);
  const outputFile = workerFile.replace('.ts', '.js');
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  try {
    const result = await esbuild.build({
      entryPoints: [inputPath],
      outfile: outputPath,
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',

      // External Node.js built-in modules
      external: [
        'worker_threads',
        'fs',
        'path',
        'crypto',
        'stream',
        'util',
        'os',
        'child_process',
        'events',
        'net',
        'http',
        'https',
        'zlib',
        'querystring',
        'url',
        'assert',
        'buffer',
        'process'
      ],

      // TypeScript support
      loader: { '.ts': 'ts' },

      // Sourcemaps only in development
      sourcemap: !IS_PROD,

      // Minify only in production
      minify: IS_PROD,

      // Keep function names for better stack traces
      keepNames: true,

      // Enable metafile for size analysis
      metafile: true,

      // Suppress warnings about large chunks (7z-wasm is inherently large)
      logLevel: 'warning',
    });

    // Get output size from metafile
    const outputSize = result.metafile?.outputs[outputPath]?.bytes || 0;
    const elapsed = Date.now() - startTime;

    log(`  ✅ ${workerFile} → ${outputFile} (${formatSize(outputSize)}) [${elapsed}ms]`, colors.green);

    // Warn if worker is unusually large (excluding known large workers)
    if (outputSize > 200 * 1024 && !workerFile.includes('7zip')) {
      log(`  ⚠️  Warning: ${outputFile} is larger than 200KB. Consider optimizing dependencies.`, colors.yellow);
    }

    return true;
  } catch (error) {
    log(`  ❌ Failed to compile ${workerFile}`, colors.red);
    if (error instanceof Error) {
      console.error(`     ${error.message}`);
    }
    return false;
  }
}

async function compileAllWorkers() {
  log('\n🔨 Compiling Desktop Workers...', colors.cyan);

  // Ensure output directory exists
  await ensureDirectory(OUTPUT_DIR);

  // Find all worker files
  const workerFiles = await findWorkerFiles();

  if (workerFiles.length === 0) {
    log('  ℹ️  No worker files found in ' + SOURCE_DIR, colors.dim);
    return;
  }

  log(`  📦 Found ${workerFiles.length} worker(s) to compile`, colors.blue);

  // Compile all workers
  const results = await Promise.all(
    workerFiles.map(file => compileWorker(file))
  );

  const successCount = results.filter(r => r).length;
  const failCount = results.length - successCount;

  if (failCount === 0) {
    log(`\n✨ Successfully compiled ${successCount} worker(s)\n`, colors.green);
  } else {
    log(`\n⚠️  Compiled ${successCount} worker(s), ${failCount} failed\n`, colors.yellow);
  }
}

async function setupWatchMode() {
  log('\n👁️  Watching for worker file changes...\n', colors.cyan);

  // Initial compilation
  await compileAllWorkers();

  // Watch for changes
  const watcher = watch(path.join(SOURCE_DIR, '*.worker.ts'), {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', async (filepath) => {
    const filename = path.basename(filepath);
    log(`\n📝 ${filename} changed, recompiling...`, colors.yellow);
    await compileWorker(filename);
  });

  watcher.on('add', async (filepath) => {
    const filename = path.basename(filepath);
    log(`\n➕ New worker ${filename} detected, compiling...`, colors.green);
    await compileWorker(filename);
  });

  watcher.on('unlink', async (filepath) => {
    const filename = path.basename(filepath);
    const outputFile = filename.replace('.ts', '.js');
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    try {
      await fs.unlink(outputPath);
      log(`\n🗑️  Removed ${outputFile}`, colors.dim);
    } catch (error) {
      // File might not exist
    }
  });

  // Handle exit gracefully
  process.on('SIGINT', () => {
    log('\n👋 Stopping worker compilation watch mode\n', colors.cyan);
    watcher.close();
    process.exit(0);
  });
}

// Main execution
async function main() {
  if (IS_WATCH) {
    await setupWatchMode();
  } else {
    await compileAllWorkers();
  }
}

// Run the script
main().catch(error => {
  log('\n❌ Fatal error:', colors.red);
  console.error(error);
  process.exit(1);
});