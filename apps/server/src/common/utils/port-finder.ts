import * as net from 'net';

/**
 * Server-side port finding utilities with deployment mode support
 *
 * This module provides port discovery functions for the standalone server.
 * It supports different behaviors based on deployment mode:
 * - Development/Electron: Allows fallback to alternative ports
 * - Production/Web: Uses fixed ports only (no fallback)
 *
 * @module server/port-finder
 */

/**
 * Options for port finding behavior
 */
export interface PortFinderOptions {
  /** Whether to allow fallback to alternative ports if preferred is occupied */
  allowFallback?: boolean;
  /** Start of port range to try (default: 18019) */
  rangeStart?: number;
  /** End of port range to try (default: 18099) */
  rangeEnd?: number;
  /** Host to bind to (default: 127.0.0.1) */
  host?: string;
}

/**
 * Check if a specific port is available
 */
export async function isPortAvailable(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // For other errors, consider port as unavailable
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, host);
  });
}

/**
 * Find an available port based on deployment mode
 *
 * In production/web deployment (allowFallback=false):
 * - Only tries the preferred port
 * - Throws error if port is occupied
 *
 * In development/Electron (allowFallback=true):
 * - Tries preferred port first
 * - Falls back to alternative ports in range
 * - Finally uses OS-assigned port if needed
 */
export async function findAvailablePort(
  preferredPort: number,
  options: PortFinderOptions = {}
): Promise<number> {
  const {
    allowFallback = true,
    rangeStart = 18019,
    rangeEnd = 18099,
    host = '127.0.0.1'
  } = options;

  // First try the preferred port
  if (await isPortAvailable(preferredPort, host)) {
    return preferredPort;
  }

  // In production mode, don't try alternatives
  if (!allowFallback) {
    throw new Error(
      `Port ${preferredPort} is already in use. ` +
      `In production mode, the server requires this specific port to be available.`
    );
  }

  // Development mode: try alternative ports
  console.log(`Port ${preferredPort} is occupied, searching for alternatives...`);

  // Try ports in range
  for (let port = rangeStart; port <= rangeEnd; port++) {
    if (port === preferredPort) continue; // Already tried
    if (await isPortAvailable(port, host)) {
      console.log(`Found alternative port: ${port}`);
      return port;
    }
  }

  // Fall back to OS-assigned port
  console.log('No ports available in range, using OS-assigned port...');
  return getRandomPort();
}

/**
 * Get deployment mode from environment
 */
export function getDeploymentMode(): 'development' | 'electron' | 'web' | 'production' {
  const mode = process.env.DEPLOYMENT_MODE?.toLowerCase();

  // Check explicit deployment mode
  if (mode === 'web') return 'production';
  if (mode === 'production') return 'production';
  if (mode === 'electron') return 'electron';
  if (mode === 'development') return 'development';

  // Check NODE_ENV only if DEPLOYMENT_MODE is not set
  if (!mode && process.env.NODE_ENV === 'development') return 'development';

  // Default to production for safety
  return 'production';
}

/**
 * Determines if port fallback should be allowed based on deployment mode
 */
export function shouldAllowPortFallback(): boolean {
  const mode = getDeploymentMode();
  // Allow fallback in development and Electron, but not in production/web
  return mode === 'development' || mode === 'electron';
}

/**
 * Get a random available port from the OS
 */
async function getRandomPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to get server address'));
        return;
      }

      const port = address.port;
      server.close(() => {
        resolve(port);
      });
    });

    server.on('error', reject);
  });
}