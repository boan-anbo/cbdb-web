/**
 * Singleton manager for CBDB client instances
 * Provides centralized client management with lazy initialization
 */

import { CbdbClient, ClientConfig } from './index';
import { CbdbClientFactory } from './client-factory';

/**
 * Manages a singleton CBDB client instance
 */
export class CbdbClientManager {
  private static instance: CbdbClientManager;
  private client: CbdbClient | null = null;
  private initPromise: Promise<void> | null = null;
  private baseUrl: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): CbdbClientManager {
    if (!CbdbClientManager.instance) {
      CbdbClientManager.instance = new CbdbClientManager();
    }
    return CbdbClientManager.instance;
  }

  /**
   * Initialize the client (if not already initialized)
   * This method is idempotent - safe to call multiple times
   * @param config Optional client configuration (e.g., for error handlers)
   */
  async initialize(config?: ClientConfig): Promise<void> {
    // If already initialized, return immediately
    if (this.client) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this.doInitialize(config);

    try {
      await this.initPromise;
    } catch (error) {
      // Reset on failure so it can be retried
      this.initPromise = null;
      throw error;
    }

    return;
  }

  /**
   * Perform the actual initialization
   */
  private async doInitialize(config?: ClientConfig): Promise<void> {
    try {
      if (config) {
        // Use provided configuration
        this.client = CbdbClientFactory.createWithConfig(config);
        this.baseUrl = config.baseUrl;
      } else {
        // Try automatic detection first
        this.client = await CbdbClientFactory.createAutomatic();

        // Store the base URL for reference
        if (this.client) {
          // @ts-ignore - accessing private property for debugging
          this.baseUrl = this.client.baseClient?.config?.baseUrl;
        }
      }

      console.log(`CBDB client initialized with baseUrl: ${this.baseUrl}`);
    } catch (error) {
      console.error('Failed to initialize CBDB client:', error);
      throw new Error(`Failed to initialize CBDB client: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the client instance
   * Throws if not initialized
   */
  getClient(): CbdbClient {
    if (!this.client) {
      throw new Error(
        'CBDB client not initialized. Call initialize() first or use getClientAsync()'
      );
    }
    return this.client;
  }

  /**
   * Get the client instance, initializing if necessary
   */
  async getClientAsync(): Promise<CbdbClient> {
    await this.initialize();
    return this.getClient();
  }

  /**
   * Check if the client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string | null {
    return this.baseUrl;
  }

  /**
   * Reconfigure the client with a new base URL or full config
   * Useful for switching between environments or servers
   */
  async reconfigure(baseUrlOrConfig: string | ClientConfig): Promise<void> {
    if (typeof baseUrlOrConfig === 'string') {
      console.log(`Reconfiguring CBDB client with new baseUrl: ${baseUrlOrConfig}`);
      // Create new client with just baseUrl
      this.client = CbdbClientFactory.createForWeb(baseUrlOrConfig);
      this.baseUrl = baseUrlOrConfig;
    } else {
      console.log(`Reconfiguring CBDB client with config: ${baseUrlOrConfig.baseUrl}`);
      // Create new client with full config
      this.client = CbdbClientFactory.createWithConfig(baseUrlOrConfig);
      this.baseUrl = baseUrlOrConfig.baseUrl;
    }

    // Reset initialization state
    this.initPromise = null;
  }

  /**
   * Reset the client manager
   * Useful for testing or when switching environments
   */
  reset(): void {
    this.client = null;
    this.initPromise = null;
    this.baseUrl = null;
  }

  /**
   * Create a new independent client instance
   * Useful when you need a client with different configuration
   */
  static async createNewClient(): Promise<CbdbClient> {
    return CbdbClientFactory.createAutomatic();
  }
}

// Export singleton instance
export const cbdbClientManager = CbdbClientManager.getInstance();