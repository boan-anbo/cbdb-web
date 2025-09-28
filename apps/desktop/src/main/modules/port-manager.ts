import * as net from 'net';

/**
 * Manages dynamic port allocation for the NestJS server
 * Finds available ports and stores the selected port for IPC queries
 */
export class PortManager {
  private static instance: PortManager;
  private currentPort: number | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager();
    }
    return PortManager.instance;
  }

  /**
   * Find an available port, preferring the specified port if available
   * @param preferred - Preferred port number (optional)
   * @returns Promise<number> - Available port number
   */
  async findAvailablePort(preferred?: number): Promise<number> {
    // If preferred port is specified and available, use it
    if (preferred && await this.isPortAvailable(preferred)) {
      console.log(`Using preferred port: ${preferred}`);
      return preferred;
    }

    // Otherwise find a random available port
    return new Promise((resolve, reject) => {
      const server = net.createServer();

      // Listen on port 0 to get a random available port
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          server.close();
          reject(new Error('Failed to get server address'));
          return;
        }

        const port = address.port;
        server.close(() => {
          console.log(`Found available port: ${port}`);
          resolve(port);
        });
      });

      server.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Check if a specific port is available
   * @param port - Port number to check
   * @returns Promise<boolean> - True if port is available
   */
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, '127.0.0.1', () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get the current port
   * @returns Current port number or null if not set
   */
  getPort(): number | null {
    return this.currentPort;
  }

  /**
   * Set the current port
   * @param port - Port number to store
   */
  setPort(port: number): void {
    this.currentPort = port;
    console.log(`Port manager: Server port set to ${port}`);
  }

  /**
   * Get the base server URL (without /api)
   * @returns Server URL or null if port not set
   */
  getServerUrl(): string | null {
    if (!this.validatePort()) return null;
    return `http://localhost:${this.currentPort}`;
  }

  /**
   * Get the full API base URL (with /api)
   * @returns API URL or null if port not set
   */
  getApiUrl(): string | null {
    if (!this.validatePort()) return null;
    return `${this.getServerUrl()}/api`;
  }

  /**
   * Get the API base URL (alias for getApiUrl)
   * @returns API base URL or null if port not set
   */
  getApiBaseUrl(): string | null {
    return this.getApiUrl();
  }

  /**
   * Validate that port is set
   * @returns True if port is valid
   */
  private validatePort(): boolean {
    if (!this.currentPort) {
      console.error('[PortManager] Port not set - cannot generate URL');
      return false;
    }
    return true;
  }
}

// Export singleton instance
export const portManager = PortManager.getInstance();