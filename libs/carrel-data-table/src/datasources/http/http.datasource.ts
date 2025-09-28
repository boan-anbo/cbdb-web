/**
 * HTTP DataSource Implementation
 * Generic data source for REST APIs
 */

import {
  BaseDataSource,
  DataSourceQuery,
  DataSourceResponse,
  DataSourceConfig,
} from '@carrel-data-table/core';

/**
 * HTTP DataSource Configuration
 */
export interface HttpDataSourceConfig extends DataSourceConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;

  // Path configuration
  fetchPath?: string;
  exportPath?: string;
  aggregatePath?: string;

  // Field mapping (map API fields to expected fields)
  fieldMapping?: {
    data?: string;           // Field containing data array
    totalCount?: string;     // Field containing total count
    hasNext?: string;        // Field for pagination info
    hasPrev?: string;        // Field for pagination info
  };

  // Request transformation
  transformRequest?: (query: DataSourceQuery) => any;
  transformResponse?: <T>(response: any) => DataSourceResponse<T>;

  // Authentication
  auth?: {
    type: 'bearer' | 'apikey' | 'basic' | 'custom';
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    customHeader?: { name: string; value: string };
  };

  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;

  // Timeout
  timeout?: number;
}

/**
 * HTTP DataSource
 */
export class HttpDataSource<TData> extends BaseDataSource<TData> {
  protected config: HttpDataSourceConfig;

  constructor(config: HttpDataSourceConfig) {
    super(config);
    this.config = {
      fetchPath: '/data',
      exportPath: '/export',
      aggregatePath: '/aggregate',
      fieldMapping: {
        data: 'data',
        totalCount: 'totalCount',
        hasNext: 'hasNext',
        hasPrev: 'hasPrev',
      },
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Fetch data from API
   */
  async fetch(query: DataSourceQuery): Promise<DataSourceResponse<TData>> {
    const url = this.buildUrl(this.config.fetchPath!, query);
    const options = this.buildRequestOptions('GET', query);

    try {
      const response = await this.fetchWithRetry(url, options);
      const data = await response.json();

      if (this.config.transformResponse) {
        return this.config.transformResponse<TData>(data);
      }

      return this.parseResponse(data);
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  /**
   * Export data
   */
  async export(
    query: DataSourceQuery,
    format: string
  ): Promise<Blob> {
    if (!this.config.exportPath) {
      throw new Error('Export not supported');
    }

    const url = this.buildUrl(this.config.exportPath, {
      ...query,
      format,
    });

    const options = this.buildRequestOptions('GET', query);

    try {
      const response = await this.fetchWithRetry(url, options);
      return await response.blob();
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  /**
   * Get aggregated data
   */
  async aggregate(
    query: DataSourceQuery,
    aggregations: any[]
  ): Promise<any> {
    if (!this.config.aggregatePath) {
      throw new Error('Aggregation not supported');
    }

    const url = this.buildUrl(this.config.aggregatePath, query);
    const options = this.buildRequestOptions('POST', {
      ...query,
      aggregations,
    });

    try {
      const response = await this.fetchWithRetry(url, options);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to aggregate data: ${error.message}`);
    }
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, query: DataSourceQuery): string {
    const url = new URL(path, this.config.baseUrl);

    // Add default query params
    if (this.config.queryParams) {
      Object.entries(this.config.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Add pagination params
    if (query.pagination) {
      url.searchParams.append('limit', query.pagination.limit.toString());
      url.searchParams.append('offset', query.pagination.offset.toString());
    }

    // Add sorting params
    if (query.sorting && query.sorting.length > 0) {
      const sortString = query.sorting
        .map(sort => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`)
        .join(',');
      url.searchParams.append('sort', sortString);
    }

    // Add filter params
    if (query.filters && query.filters.length > 0) {
      // Simple encoding - can be customized
      const filterString = JSON.stringify(query.filters);
      url.searchParams.append('filters', filterString);
    }

    // Add global filter
    if (query.globalFilter) {
      url.searchParams.append('search', query.globalFilter);
    }

    // Add custom fields
    if (query.customParams) {
      Object.entries(query.customParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Build request options
   */
  protected buildRequestOptions(
    method: string,
    body?: any
  ): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    // Add authentication
    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.auth.token}`;
          break;
        case 'apikey':
          headers['X-API-Key'] = this.config.auth.apiKey!;
          break;
        case 'basic':
          const encoded = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
          headers['Authorization'] = `Basic ${encoded}`;
          break;
        case 'custom':
          if (this.config.auth.customHeader) {
            headers[this.config.auth.customHeader.name] = this.config.auth.customHeader.value;
          }
          break;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!),
    };

    if (method !== 'GET' && body) {
      const requestBody = this.config.transformRequest
        ? this.config.transformRequest(body)
        : body;
      options.body = JSON.stringify(requestBody);
    }

    return options;
  }

  /**
   * Parse API response
   */
  protected parseResponse(data: any): DataSourceResponse<TData> {
    const mapping = this.config.fieldMapping!;

    // Extract data array
    const dataField = mapping.data!;
    const items = this.getNestedValue(data, dataField) || [];

    // Extract total count
    const totalField = mapping.totalCount!;
    const totalCount = this.getNestedValue(data, totalField) || items.length;

    // Extract pagination info
    const hasNext = mapping.hasNext
      ? this.getNestedValue(data, mapping.hasNext)
      : undefined;
    const hasPrev = mapping.hasPrev
      ? this.getNestedValue(data, mapping.hasPrev)
      : undefined;

    return {
      data: items,
      totalCount,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Get nested value from object
   */
  protected getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Fetch with retry logic
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Retry on 5xx errors
        if (response.status >= 500 && attempt < this.config.maxRetries!) {
          await this.delay(this.config.retryDelay! * attempt);
          return this.fetchWithRetry(url, options, attempt + 1);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      // Retry on network errors
      if (attempt < this.config.maxRetries!) {
        await this.delay(this.config.retryDelay! * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Delay helper
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function for creating HTTP data source
 */
export function createHttpDataSource<TData>(
  config: HttpDataSourceConfig
): HttpDataSource<TData> {
  return new HttpDataSource<TData>(config);
}