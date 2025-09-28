import { PersonControllerAPI, cbdbClientManager } from '@cbdb/core';
import type {
  SearchPersonRequest,
  SearchPersonResponse,
  GetPersonDetailRequest,
  PersonDetailResponse,
} from '@cbdb/core';

/**
 * Legacy API service for backward compatibility
 * @deprecated Use cbdbClientManager or useApiClient hook instead
 */
class ApiService {
  private baseUrl: string | null = null;
  private initialized = false;

  constructor() {
    // Will be set dynamically
  }

  /**
   * Initialize the service with dynamic port discovery
   *
   * Port Resolution Flow:
   * 1. Check if already initialized (cached)
   * 2. Try to get port from Electron IPC (with retry)
   * 3. Fall back to default port if all else fails
   */
  private async initialize() {
    if (this.initialized) return;

    try {
      // If in Electron, get the dynamic port with retry logic
      if (window.electronAPI) {
        let port = null;
        let retries = 0;
        const maxRetries = 3;
        const retryDelay = 500; // ms

        while (!port && retries < maxRetries) {
          try {
            port = await window.electronAPI.getServerPort();
            if (port) {
              this.baseUrl = `http://localhost:${port}`;
              console.log(`✅ ApiService initialized with dynamic port: ${port}`);
              break;
            }
          } catch (error) {
            retries++;
            console.warn(`Failed to get port (attempt ${retries}/${maxRetries}):`, error);
            if (retries < maxRetries) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }

        if (!port && retries >= maxRetries) {
          console.error('❌ Failed to get dynamic port after retries');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize with dynamic port:', error);
    }

    // Fallback to default if not initialized
    if (!this.baseUrl) {
      this.baseUrl = 'http://localhost:18019';
      console.warn('⚠️  ApiService using fallback port: 18019');
    }

    this.initialized = true;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure initialization
    await this.initialize();

    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Person API methods
  async searchPersons(request: SearchPersonRequest): Promise<SearchPersonResponse> {
    const params = new URLSearchParams();

    if (request.name) params.append('name', request.name);
    if (request.dynasty) params.append('dynasty', request.dynasty);
    if (request.year_from) params.append('year_from', request.year_from.toString());
    if (request.year_to) params.append('year_to', request.year_to.toString());
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.offset) params.append('offset', request.offset.toString());

    return this.request<SearchPersonResponse>(
      `${PersonControllerAPI.CONTROLLER_PATH}${PersonControllerAPI.SEARCH.relativePath}?${params}`
    );
  }

  async getPersonDetail(request: GetPersonDetailRequest): Promise<PersonDetailResponse> {
    const params = new URLSearchParams();

    if (request.id) params.append('id', request.id);
    if (request.includeRelations) params.append('includeRelations', 'true');

    return this.request<PersonDetailResponse>(
      `${PersonControllerAPI.CONTROLLER_PATH}${PersonControllerAPI.GET_DETAIL.relativePath}?${params}`
    );
  }

  // Database status
  async checkDatabaseStatus(): Promise<{ ready: boolean; path?: string }> {
    return this.request<{ ready: boolean; path?: string }>('/database/status');
  }

  /**
   * Get the current base URL (after initialization)
   */
  async getBaseUrl(): Promise<string> {
    await this.initialize();
    return this.baseUrl || 'http://localhost:18019';
  }
}

// Export singleton instance
export const apiService = new ApiService();