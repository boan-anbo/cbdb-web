import { ArchiveClient } from '@cbdb/core';
import type {
  ArchiveStatusResponse,
  ArchiveInfoResponse,
  ArchiveProgressEvent,
  OpenLocationResponse,
  CleanExtractedResponse
} from '@cbdb/core';

export interface MockArchiveClientConfig {
  initialState?: 'ready' | 'extracted' | 'error';
  extractionSpeed?: 'slow' | 'normal' | 'fast';
  failAtPercent?: number;
  networkDelay?: number;
  archiveSize?: number;
  enableLogging?: boolean;
}

/**
 * Enhanced mock client for testing archive extraction in Storybook
 */
export class MockArchiveClient extends ArchiveClient {
  private mockState: 'ready' | 'extracted' | 'error';
  private config: Required<MockArchiveClientConfig>;
  private extractionAbortController?: AbortController;

  // Single database file that gets extracted
  // The 7z archive contains just one large database file
  // Real sizes: ~146MB compressed -> ~1.7GB uncompressed
  private readonly mockFiles = [
    'latest.db'
  ];

  constructor(config: MockArchiveClientConfig = {}) {
    super({ baseUrl: 'http://mock' });

    this.mockState = config.initialState || 'ready';
    this.config = {
      initialState: config.initialState || 'ready',
      extractionSpeed: config.extractionSpeed || 'normal',
      failAtPercent: config.failAtPercent || -1,
      networkDelay: config.networkDelay || 300,
      archiveSize: config.archiveSize || 146482123, // ~146MB compressed (actual size)
      enableLogging: config.enableLogging || true
    };

    if (this.config.enableLogging) {
      console.log('MockArchiveClient initialized with:', this.config);
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.config.networkDelay));
  }

  async getStatus(): Promise<ArchiveStatusResponse> {
    await this.simulateNetworkDelay();

    if (this.mockState === 'error') {
      throw new Error('Failed to connect to server');
    }

    // Actual compression ratio: ~146MB -> ~1.7GB (about 11.6x)
    const extractedSize = this.config.archiveSize * 11.6;

    return {
      exists: true,
      extracted: this.mockState === 'extracted',
      archivePath: this.config.enableLogging ? '/path/to/cbdb_sql_db/latest.7z' : undefined,
      extractedPath: this.mockState === 'extracted'
        ? (this.config.enableLogging ? '/path/to/.cbdb-desktop/databases/cbdb/latest.db' : undefined)
        : undefined,
      archiveSize: this.config.archiveSize,
      extractedSize: this.mockState === 'extracted' ? extractedSize : undefined,
      checksum: this.mockState === 'extracted' ? 'a1b2c3d4e5f6789012345678' : undefined,
      lastModified: new Date('2024-09-17T19:27:00Z')
    };
  }

  async getInfo(): Promise<ArchiveInfoResponse> {
    await this.simulateNetworkDelay();

    const sizeInGB = (this.config.archiveSize / (1024 * 1024 * 1024)).toFixed(2);

    return {
      archivePath: this.config.enableLogging ? '/path/to/cbdb_sql_db/latest.7z' : undefined,
      fileName: 'latest.7z',
      fileSize: this.config.archiveSize,
      sizeFormatted: `${sizeInGB} GB`,
      compressionRatio: this.mockState === 'extracted' ? 11.6 : undefined,
      contents: {
        files: ['latest.db'],  // Single database file
        totalFiles: 1
      }
    };
  }

  async openLocation(location: 'archive' | 'extracted'): Promise<OpenLocationResponse> {
    await this.simulateNetworkDelay();

    if (this.config.enableLogging) {
      console.log(`MockArchiveClient: Opening ${location} location...`);
    }

    return {
      success: true,
      path: location === 'archive'
        ? '/path/to/cbdb_sql_db'
        : '/path/to/.cbdb-desktop/databases/cbdb'
    };
  }

  async extractWithProgress(
    onProgress: (event: ArchiveProgressEvent) => void,
    request?: any
  ): Promise<void> {
    this.extractionAbortController = new AbortController();
    const signal = this.extractionAbortController.signal;

    // Calculate intervals based on speed
    const speedMultipliers = {
      slow: 3,
      normal: 1,
      fast: 0.3
    };
    const baseInterval = 500;
    const interval = baseInterval * speedMultipliers[this.config.extractionSpeed];

    // Simulate realistic extraction with variable speed
    let percent = 0;
    let currentFileIndex = 0;
    const startTime = Date.now();

    const extractionLoop = async () => {
      while (percent <= 100 && !signal.aborted) {
        // Check for simulated failure
        if (this.config.failAtPercent > 0 && percent >= this.config.failAtPercent) {
          onProgress({
            type: 'error',
            message: `Extraction failed at ${percent}%: Simulated error for testing`
          });
          return;
        }

        // Since we only have one file, always show it
        const currentFile = this.mockFiles[0];

        // Calculate realistic speed (MB/s)
        const elapsed = (Date.now() - startTime) / 1000;
        const bytesProcessed = (this.config.archiveSize * percent) / 100;
        const speed = elapsed > 0
          ? (bytesProcessed / (1024 * 1024) / elapsed).toFixed(1)
          : '0';

        // Send progress event
        onProgress({
          type: 'progress',
          percent: Math.min(percent, 100),
          file: currentFile,
          speed: `${speed} MB/s`
        });

        if (percent >= 100) {
          // Send completion event
          setTimeout(() => {
            if (!signal.aborted) {
              onProgress({
                type: 'complete',
                extractedPath: '/path/to/.cbdb-desktop/databases/cbdb/latest.db',
                duration: Date.now() - startTime
              });
              this.mockState = 'extracted';
            }
          }, 300);
          return;
        }

        // Variable increment to simulate real extraction
        const baseIncrement = 5;
        const variance = Math.random() * 3 - 1.5; // ±1.5%
        percent += baseIncrement + variance;
        percent = Math.min(percent, 100);

        // Wait for next update
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    };

    // Start extraction
    extractionLoop();
  }

  async cleanExtracted(): Promise<CleanExtractedResponse> {
    await this.simulateNetworkDelay();

    if (this.config.enableLogging) {
      console.log('MockArchiveClient: Cleaning extracted files...');
    }

    this.mockState = 'ready';
    const freedSpace = this.config.archiveSize * 11.6;

    return {
      success: true,
      freedSpace
    };
  }

  /**
   * Abort current extraction (for testing cancellation)
   */
  abortExtraction(): void {
    if (this.extractionAbortController) {
      this.extractionAbortController.abort();
      if (this.config.enableLogging) {
        console.log('MockArchiveClient: Extraction aborted');
      }
    }
  }

  /**
   * Change configuration on the fly (for interactive testing)
   */
  updateConfig(config: Partial<MockArchiveClientConfig>): void {
    this.config = { ...this.config, ...config } as Required<MockArchiveClientConfig>;
    if (config.initialState) {
      this.mockState = config.initialState;
    }
    if (this.config.enableLogging) {
      console.log('MockArchiveClient config updated:', this.config);
    }
  }
}