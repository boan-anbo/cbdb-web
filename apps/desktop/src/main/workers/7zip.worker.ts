/**
 * 7-Zip Archive Worker
 *
 * Handles archive operations (extract, test, list) using 7z-wasm in a separate worker thread.
 * This prevents blocking the main Electron process during intensive archive operations.
 *
 * ## Architecture
 * - Uses 7z-wasm which runs 7-Zip compiled to WebAssembly
 * - Operations happen in Emscripten virtual filesystem first
 * - Files are then copied to real filesystem after successful extraction
 *
 * ## Supported Operations
 * - extract: Extract archive contents to specified directory
 * - test: Verify archive integrity
 * - list: List archive contents
 *
 * ## Communication Protocol
 * - Receives: WorkerTask via parentPort.on('message')
 * - Returns: WorkerResult via parentPort.postMessage()
 *
 * ## Emscripten Filesystem Notes
 * - Virtual filesystem operations use different API than Node.js
 * - stat() returns object with mode field instead of methods
 * - Must manually check file types using bitmasks
 */

import { parentPort } from 'worker_threads';
import SevenZipWASM from '7z-wasm';
import * as fs from 'fs';
import * as path from 'path';

interface WorkerTask {
  action: 'test' | 'extract' | 'list';
  filePath: string;
  options?: any;
}

interface WorkerResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
  exitCode?: number;
}

interface ProgressMessage {
  type: 'progress';
  phase: 'analyzing' | 'extracting' | 'copying';
  current: number;
  total: number;
  percentage: number;
  currentFile?: string;
  message?: string;
}

interface ArchiveInfo {
  totalSize: number;
  compressedSize: number;
  fileCount: number;
  files: Array<{ name: string; size: number }>;
}

// Initialize 7z-wasm once
let sevenZipInstance: any = null;

async function initSevenZip() {
  if (!sevenZipInstance) {
    try {
      // Load WASM binary
      const wasmPath = require.resolve('7z-wasm/7zz.wasm');
      const wasmBinary = fs.readFileSync(wasmPath);

      sevenZipInstance = await SevenZipWASM({
        wasmBinary: wasmBinary,
        print: (text: string) => {
          // Log output for debugging
          console.log('7z output:', text);
        }
      });
    } catch (error) {
      console.error('Failed to initialize 7z-wasm:', error);
      throw error;
    }
  }
  return sevenZipInstance;
}

async function testArchive(filePath: string): Promise<WorkerResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'File does not exist',
        message: `File not found: ${filePath}`
      };
    }

    const sevenZip = await initSevenZip();

    // Read the file into the virtual filesystem
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Write file to virtual filesystem
    const stream = sevenZip.FS.open(fileName, 'w+');
    sevenZip.FS.write(stream, fileBuffer, 0, fileBuffer.byteLength);
    sevenZip.FS.close(stream);

    // Test the archive
    const consoleOutput: string[] = [];
    sevenZip.print = (text: string) => {
      consoleOutput.push(text);
    };

    const exitCode = sevenZip.callMain(['t', fileName]);

    // Clean up
    sevenZip.FS.unlink(fileName);

    // Check if test was successful
    const output = consoleOutput.join('\n');
    const isValid = exitCode === 0 &&
                   (output.includes('Everything is Ok') ||
                    output.includes('No errors'));

    return {
      success: isValid,
      message: isValid ? 'Archive integrity verified' : 'Archive is corrupted or invalid',
      exitCode: exitCode,
      data: { output: output.substring(0, 1000) } // Limit output size
    };

  } catch (error) {
    console.error('Error in testArchive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to test archive integrity'
    };
  }
}

async function analyzeArchive(sevenZip: any, fileName: string): Promise<ArchiveInfo> {
  // List archive contents with technical info
  const consoleOutput: string[] = [];
  const originalPrint = sevenZip.print;
  sevenZip.print = (text: string) => {
    consoleOutput.push(text);
  };

  const exitCode = sevenZip.callMain(['l', '-slt', fileName]);
  sevenZip.print = originalPrint;

  if (exitCode !== 0) {
    throw new Error('Failed to analyze archive');
  }

  // Parse the output
  let totalSize = 0;
  let compressedSize = 0;
  let fileCount = 0;
  const files: Array<{ name: string; size: number }> = [];

  let currentFile: any = {};
  for (const line of consoleOutput) {
    if (line.startsWith('Size = ')) {
      currentFile.size = parseInt(line.substring(7));
    } else if (line.startsWith('Path = ')) {
      currentFile.path = line.substring(7);
    } else if (line.startsWith('Attributes = ')) {
      const attrs = line.substring(13);
      if (!attrs.includes('D')) { // Not a directory
        if (currentFile.path && currentFile.size !== undefined) {
          files.push({ name: currentFile.path, size: currentFile.size });
          totalSize += currentFile.size;
          fileCount++;
        }
      }
      currentFile = {};
    } else if (line.includes('Physical Size = ')) {
      compressedSize = parseInt(line.split('=')[1].trim());
    }
  }

  return { totalSize, compressedSize, fileCount, files };
}

function sendProgress(progress: ProgressMessage) {
  parentPort?.postMessage(progress);
}

async function extractArchive(filePath: string, options: any): Promise<WorkerResult> {
  try {
    const sevenZip = await initSevenZip();

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'Archive file does not exist',
        message: `File not found: ${filePath}`
      };
    }

    // Phase 1: Analyze archive
    sendProgress({
      type: 'progress',
      phase: 'analyzing',
      current: 0,
      total: 100,
      percentage: 0,
      message: 'Analyzing archive structure...'
    });

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const outputDir = options.outputDir || path.dirname(filePath);

    // Write file to virtual filesystem
    const stream = sevenZip.FS.open(fileName, 'w+');
    sevenZip.FS.write(stream, fileBuffer, 0, fileBuffer.byteLength);
    sevenZip.FS.close(stream);

    // Analyze the archive
    const archiveInfo = await analyzeArchive(sevenZip, fileName);

    sendProgress({
      type: 'progress',
      phase: 'analyzing',
      current: 100,
      total: 100,
      percentage: 100,
      message: `Found ${archiveInfo.fileCount} file(s) (${Math.round(archiveInfo.totalSize / 1024 / 1024)}MB)`
    });

    // Create extraction directory in virtual filesystem
    const extractDir = '/extract';
    try {
      sevenZip.FS.mkdir(extractDir);
    } catch (e) {
      // Directory might already exist
    }

    // Phase 2: Extract to virtual filesystem
    sendProgress({
      type: 'progress',
      phase: 'extracting',
      current: 0,
      total: 100,
      percentage: 0,
      message: 'Extracting archive...'
    });

    // Extract the archive to virtual filesystem
    const consoleOutput: string[] = [];
    sevenZip.print = (text: string) => {
      consoleOutput.push(text);
      // Log extraction progress for debugging
      if (text.includes('Extracting')) {
        console.log('7z output:', text);
      }
    };

    const startTime = Date.now();
    const exitCode = sevenZip.callMain(['x', fileName, `-o${extractDir}`, '-y']);
    const extractTime = Date.now() - startTime;

    if (exitCode === 0) {
      sendProgress({
        type: 'progress',
        phase: 'extracting',
        current: 100,
        total: 100,
        percentage: 100,
        message: `Extraction complete (${(extractTime / 1000).toFixed(1)}s), copying files...`
      });
      // Phase 3: Copy from virtual FS to real FS with accurate progress
      const extractedFiles = sevenZip.FS.readdir(extractDir);
      let copiedBytes = 0;
      const totalBytes = archiveInfo.totalSize || 0;

      for (const file of extractedFiles) {
        if (file === '.' || file === '..') continue;

        const virtualPath = `${extractDir}/${file}`;
        const stats = sevenZip.FS.stat(virtualPath);

        // Emscripten FS.stat returns an object with mode field
        // Check if it's a regular file using the mode field (S_IFREG = 0x8000)
        const S_IFMT = 0xF000;
        const S_IFREG = 0x8000;
        const isFile = (stats.mode & S_IFMT) === S_IFREG;

        if (isFile) {
          // Read file from virtual filesystem
          const fileData = sevenZip.FS.readFile(virtualPath);

          // Update progress before writing
          const percentage = totalBytes > 0
            ? Math.min(100, Math.round((copiedBytes / totalBytes) * 100))
            : 50;

          sendProgress({
            type: 'progress',
            phase: 'copying',
            current: copiedBytes,
            total: totalBytes,
            percentage: percentage,
            currentFile: file,
            message: `Saving ${file} (${Math.round(fileData.length / 1024 / 1024)}MB)`
          });

          // Write to real filesystem
          const realPath = path.join(outputDir, file);
          fs.writeFileSync(realPath, fileData);

          copiedBytes += fileData.length;
          console.log(`Extracted: ${file} -> ${realPath}`);
        }
      }

      // Send final progress
      sendProgress({
        type: 'progress',
        phase: 'copying',
        current: totalBytes,
        total: totalBytes,
        percentage: 100,
        message: 'Extraction complete!'
      });
    }

    // Clean up virtual filesystem
    try {
      // Remove extracted files
      const files = sevenZip.FS.readdir(extractDir);
      for (const file of files) {
        if (file !== '.' && file !== '..') {
          sevenZip.FS.unlink(`${extractDir}/${file}`);
        }
      }
      sevenZip.FS.rmdir(extractDir);
    } catch (e) {
      // Ignore cleanup errors
    }

    sevenZip.FS.unlink(fileName);

    return {
      success: exitCode === 0,
      message: exitCode === 0 ? 'Archive extracted successfully' : 'Extraction failed',
      exitCode: exitCode,
      data: { output: consoleOutput.join('\n').substring(0, 1000) }
    };

  } catch (error) {
    console.error('Error in extractArchive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to extract archive'
    };
  }
}

async function listArchive(filePath: string): Promise<WorkerResult> {
  try {
    const sevenZip = await initSevenZip();

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Write file to virtual filesystem
    const stream = sevenZip.FS.open(fileName, 'w+');
    sevenZip.FS.write(stream, fileBuffer, 0, fileBuffer.byteLength);
    sevenZip.FS.close(stream);

    // List archive contents
    const consoleOutput: string[] = [];
    sevenZip.print = (text: string) => {
      consoleOutput.push(text);
    };

    const exitCode = sevenZip.callMain(['l', fileName]);

    // Clean up
    sevenZip.FS.unlink(fileName);

    return {
      success: exitCode === 0,
      message: exitCode === 0 ? 'Archive listed successfully' : 'Failed to list archive',
      exitCode: exitCode,
      data: { files: consoleOutput }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to list archive'
    };
  }
}

// Listen for messages from the main thread
parentPort?.on('message', async (task: WorkerTask) => {
  let result: WorkerResult;

  try {
    switch (task.action) {
      case 'test':
        result = await testArchive(task.filePath);
        break;
      case 'extract':
        result = await extractArchive(task.filePath, task.options || {});
        break;
      case 'list':
        result = await listArchive(task.filePath);
        break;
      default:
        result = {
          success: false,
          error: `Unknown action: ${task.action}`,
          message: 'Invalid action specified'
        };
    }
  } catch (error) {
    result = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Worker thread error'
    };
  }

  // Send result back to main thread
  parentPort?.postMessage(result);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Worker uncaught exception:', error);
  parentPort?.postMessage({
    success: false,
    error: error.message,
    message: 'Worker thread crashed'
  });
});