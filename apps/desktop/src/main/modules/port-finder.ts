import * as net from 'net';

/**
 * Port finding utilities for dynamic port allocation
 *
 * This module provides standalone functions for port discovery,
 * used during the early application initialization phase before
 * NestJS modules are loaded.
 *
 * @module port-finder
 */

/**
 * Default port range for automatic port selection
 */
const DEFAULT_PORT = 18019;
const PORT_RANGE_START = 18019;
const PORT_RANGE_END = 18099;

/**
 * Check if a specific port is available for binding
 *
 * @param port - Port number to check
 * @param host - Host to bind to (default checks both IPv4 and IPv6)
 * @returns Promise<boolean> - True if port is available, false if in use
 *
 * @example
 * const isAvailable = await isPortAvailable(3000);
 * if (isAvailable) {
 *   console.log('Port 3000 is available');
 * }
 */
export async function isPortAvailable(port: number, host?: string): Promise<boolean> {
  // If specific host is provided, check only that
  if (host) {
    return checkPortOnHost(port, host);
  }

  // Otherwise, check both IPv4 and IPv6 to match NestJS behavior
  // NestJS by default binds to :: (all IPv6) which also includes IPv4
  const ipv6Available = await checkPortOnHost(port, '::');
  if (!ipv6Available) {
    return false; // Port is in use on IPv6
  }

  // Also check IPv4 explicitly in case IPv6 is disabled
  const ipv4Available = await checkPortOnHost(port, '0.0.0.0');
  return ipv4Available;
}

/**
 * Internal helper to check port on specific host
 */
async function checkPortOnHost(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        resolve(false);
      } else if (err.code === 'EAFNOSUPPORT' && host === '::') {
        // IPv6 not supported, consider as available for our purposes
        resolve(true);
      } else {
        // For other errors, consider port as unavailable
        console.warn(`Port ${port} check on ${host} failed:`, err.code);
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    try {
      server.listen(port, host);
    } catch (err) {
      resolve(false);
    }
  });
}

/**
 * Options for port finding behavior
 */
export interface PortFinderOptions {
  /** Start of port range to try (default: 18019) */
  rangeStart?: number;
  /** End of port range to try (default: 18099) */
  rangeEnd?: number;
  /** Whether to allow fallback to alternative ports if preferred is occupied */
  allowFallback?: boolean;
}

/**
 * Find an available port, preferring the specified port if available
 *
 * This function first checks if the preferred port is available.
 * If not, it searches for an available port in the configured range.
 * If no port in the range is available, it falls back to letting
 * the OS assign a random available port.
 *
 * In Electron mode (default): Always allows fallback to alternative ports
 * In production mode: Can be configured to fail if preferred port is unavailable
 *
 * @param preferredPort - Preferred port number (optional)
 * @param options - Additional options for port finding
 * @returns Promise<number> - Available port number
 *
 * @example
 * // Try to use port 3000, or find another if it's busy
 * const port = await findAvailablePort(3000);
 * console.log(`Server will start on port ${port}`);
 */
export async function findAvailablePort(
  preferredPort?: number,
  options?: PortFinderOptions
): Promise<number> {
  const rangeStart = options?.rangeStart || PORT_RANGE_START;
  const rangeEnd = options?.rangeEnd || PORT_RANGE_END;
  // Electron always allows fallback by default
  const allowFallback = options?.allowFallback ?? true;

  // First, try the preferred port if specified
  if (preferredPort) {
    const isAvailable = await isPortAvailable(preferredPort);
    if (isAvailable) {
      console.log(`✓ Using preferred port: ${preferredPort}`);
      return preferredPort;
    }
    // In Electron, we always allow fallback
    if (!allowFallback) {
      throw new Error(
        `Port ${preferredPort} is already in use. ` +
        `The application requires this specific port to be available.`
      );
    }
    console.log(`✗ Preferred port ${preferredPort} is in use, searching for alternative...`);
  }

  // Try ports in the configured range
  for (let port = rangeStart; port <= rangeEnd; port++) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      console.log(`✓ Found available port: ${port}`);
      return port;
    }
  }

  // If no port in range is available, let OS assign one
  console.log('No port in configured range available, requesting OS-assigned port...');
  return getRandomPort();
}

/**
 * Get a random available port assigned by the operating system
 *
 * @param host - Host to bind to (default: '127.0.0.1')
 * @returns Promise<number> - Random available port number
 *
 * @internal
 */
async function getRandomPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err) => {
      reject(new Error(`Failed to get random port: ${err.message}`));
    });

    // Listen on port 0 to get a random available port
    // Use :: to match NestJS behavior (binds to all interfaces)
    server.listen(0, '::', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to get server address'));
        return;
      }

      const port = address.port;
      server.close(() => {
        console.log(`✓ OS assigned port: ${port}`);
        resolve(port);
      });
    });
  });
}

/**
 * Find an available port with retry logic
 *
 * This function attempts to find an available port with automatic
 * retry on failure. Useful for handling race conditions where
 * multiple processes might be searching for ports simultaneously.
 *
 * @param preferredPort - Preferred port number (optional)
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise<number> - Available port number
 *
 * @example
 * const port = await findAvailablePortWithRetry(3000, 5);
 */
export async function findAvailablePortWithRetry(
  preferredPort?: number,
  maxRetries = 3
): Promise<number> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const port = await findAvailablePort(preferredPort);

      // Double-check the port is still available (handles race conditions)
      const stillAvailable = await isPortAvailable(port);
      if (stillAvailable) {
        return port;
      }

      console.warn(`Port ${port} became unavailable, retrying... (attempt ${attempt}/${maxRetries})`);
      // For next attempt, don't use the same preferred port
      preferredPort = undefined;

    } catch (error) {
      lastError = error as Error;
      console.error(`Port finding attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  throw new Error(
    `Failed to find available port after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Get the default port for the application
 *
 * @returns number - Default port number
 */
export function getDefaultPort(): number {
  return DEFAULT_PORT;
}

/**
 * Parse port from environment variable or return default
 *
 * @param envPort - Port value from environment variable
 * @returns number - Parsed port number or default
 */
export function parsePortFromEnv(envPort?: string): number {
  if (!envPort) {
    return DEFAULT_PORT;
  }

  const parsed = parseInt(envPort, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    console.warn(`Invalid port value "${envPort}", using default port ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
  }

  return parsed;
}

/**
 * Check if we're running in Electron environment
 */
export function isElectronEnvironment(): boolean {
  // In Electron main process, process.versions.electron exists
  return !!(process.versions as any)?.electron;
}

/**
 * Determines if port fallback should be allowed
 * In Electron, we always allow fallback for better user experience
 */
export function shouldAllowPortFallback(): boolean {
  // Electron always allows fallback for desktop app experience
  // Only web deployments might need fixed ports
  return isElectronEnvironment();
}