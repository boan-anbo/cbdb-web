/**
 * Factory for creating CbdbClient instances with different configurations
 */

import { CbdbClient, ClientConfig } from './index';
import './electron.d'; // Import type declarations

/**
 * Factory class for creating CBDB client instances
 */
export class CbdbClientFactory {
  /**
   * Create a client for Electron environment with dynamic port discovery
   */
  static async createForElectron(): Promise<CbdbClient> {
    // Check if we're in Electron environment
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Not running in Electron environment');
    }

    // Get the server URL from the main process (without /api suffix)
    // Endpoints already include /api prefix
    const baseUrl = await window.electronAPI.getServerUrl();
    if (!baseUrl) {
      throw new Error('Server URL not available. Server may not be started yet.');
    }
    console.log(`Creating CBDB client for Electron with baseUrl: ${baseUrl}`);

    return new CbdbClient({ baseUrl });
  }

  /**
   * Create a client for web environment with specified base URL
   */
  static createForWeb(baseUrl: string): CbdbClient {
    if (!baseUrl) {
      throw new Error('Base URL is required for web client');
    }

    console.log(`Creating CBDB client for web with baseUrl: ${baseUrl}`);
    return new CbdbClient({ baseUrl });
  }

  /**
   * Create a client with custom configuration
   */
  static createWithConfig(config: ClientConfig): CbdbClient {
    if (!config.baseUrl) {
      throw new Error('Base URL is required in config');
    }

    return new CbdbClient(config);
  }

  /**
   * Create a client based on the current environment
   * Falls back to default URL if not in Electron
   */
  static async createAutomatic(): Promise<CbdbClient> {
    // Check if we're in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        return await this.createForElectron();
      } catch (e) {
        console.warn('Failed to create Electron client, falling back to default', e);
      }
    }

    // Check for environment variable
    if (typeof process !== 'undefined' && process.env?.CBDB_API_URL) {
      return this.createForWeb(process.env.CBDB_API_URL);
    }

    // Check for Vite environment variable
    // Note: import.meta is not supported in CommonJS modules
    // This would be handled by the bundler in a browser environment
    // For now, we'll skip this check and rely on process.env or defaults

    // Default fallback for development
    const defaultUrl = 'http://localhost:18019';
    console.warn(`No environment configuration found, using default URL: ${defaultUrl}`);
    return this.createForWeb(defaultUrl);
  }
}