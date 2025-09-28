/**
 * DataSource abstraction for pluggable backend support
 * Enables any backend: REST, GraphQL, WebSocket, local data, etc.
 */

import type { ColumnMetadata, FilterOperator, ExportFormat } from '../types/table.types';

/**
 * Query sent to the data source
 */
export interface DataSourceQuery {
  // Pagination
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };

  // Sorting
  sorting?: Array<{
    id: string;
    desc: boolean;
  }>;

  // Filtering
  filters?: Array<{
    id: string;
    value: unknown;
    operator?: FilterOperator;
  }>;

  // Global search
  globalFilter?: string;

  // Field selection (for GraphQL-like projection)
  fields?: string[];

  // Relation loading (for ORM-like includes)
  includes?: string[];

  // Grouping
  groupBy?: string[];

  // Aggregation
  aggregations?: Array<{
    field: string;
    fn: 'sum' | 'avg' | 'min' | 'max' | 'count';
    alias?: string;
  }>;

  // Additional custom parameters
  params?: Record<string, unknown>;
}

/**
 * Response from data source
 */
export interface DataSourceResponse<TData> {
  // The actual data
  data: TData[];

  // Total count (for pagination)
  total: number;

  // Page information
  pageCount?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;

  // Aggregation results
  aggregations?: Record<string, unknown>;

  // Metadata
  meta?: {
    executionTime?: number;
    cached?: boolean;
    version?: string;
    [key: string]: unknown;
  };
}

/**
 * Data source error
 */
export class DataSourceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DataSourceError';
  }
}

/**
 * Main data source interface
 */
export interface DataSource<TData = unknown> {
  // Unique identifier for this data source
  id: string;

  // Human-readable name
  name: string;

  // Core data fetching
  fetch(query: DataSourceQuery): Promise<DataSourceResponse<TData>>;

  // Get total count without fetching data (optimization)
  count?(query: DataSourceQuery): Promise<number>;

  // Export data in specific format
  export?(query: DataSourceQuery, format: ExportFormat): Promise<Blob>;

  // Get column metadata for dynamic configuration
  getColumns?(): Promise<ColumnMetadata[]>;

  // Get available filter operators for this source
  getFilterOperators?(): Promise<FilterOperator[]>;

  // Validate query before execution
  validateQuery?(query: DataSourceQuery): Promise<boolean>;

  // Transform query for backend-specific format
  transformQuery?(query: DataSourceQuery): unknown;

  // Transform response for normalization
  transformResponse?<TRaw>(response: TRaw): DataSourceResponse<TData>;

  // Real-time updates support
  subscribe?(
    query: DataSourceQuery,
    callback: (data: TData[]) => void
  ): () => void; // Returns unsubscribe function

  // Batch operations
  batchCreate?(items: Partial<TData>[]): Promise<TData[]>;
  batchUpdate?(items: TData[]): Promise<TData[]>;
  batchDelete?(ids: unknown[]): Promise<void>;

  // Single operations
  create?(item: Partial<TData>): Promise<TData>;
  update?(id: unknown, item: Partial<TData>): Promise<TData>;
  delete?(id: unknown): Promise<void>;
}

/**
 * Configuration for data sources
 */
export interface DataSourceConfig {
  // Caching
  cache?: {
    enabled: boolean;
    ttl?: number; // Time to live in milliseconds
    key?: (query: DataSourceQuery) => string;
    storage?: 'memory' | 'localStorage' | 'sessionStorage';
  };

  // Retry logic
  retry?: {
    enabled: boolean;
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    shouldRetry?: (error: Error) => boolean;
  };

  // Request configuration
  request?: {
    timeout?: number;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    baseURL?: string;
  };

  // Polling for real-time-ish updates
  polling?: {
    enabled: boolean;
    interval: number;
    stopOnError?: boolean;
    stopOnInactive?: boolean;
  };

  // Optimistic updates
  optimistic?: {
    enabled: boolean;
    rollbackOnError?: boolean;
  };

  // Pagination defaults
  pagination?: {
    defaultPageSize: number;
    pageSizeOptions: number[];
    maxPageSize?: number;
  };

  // Performance
  debounce?: number;
  throttle?: number;
}

/**
 * Abstract base class for data sources
 */
export abstract class BaseDataSource<TData = unknown> implements DataSource<TData> {
  abstract id: string;
  abstract name: string;

  protected config: DataSourceConfig;
  private cache?: Map<string, { data: DataSourceResponse<TData>; timestamp: number }>;

  constructor(config?: DataSourceConfig) {
    this.config = {
      cache: { enabled: false },
      retry: { enabled: true, maxAttempts: 3, delay: 1000, backoff: 'exponential' },
      pagination: { defaultPageSize: 25, pageSizeOptions: [10, 25, 50, 100] },
      ...config
    };

    if (this.config.cache?.enabled) {
      this.cache = new Map();
    }
  }

  abstract fetch(query: DataSourceQuery): Promise<DataSourceResponse<TData>>;

  /**
   * Fetch with caching
   */
  protected async fetchWithCache(
    query: DataSourceQuery,
    fetcher: () => Promise<DataSourceResponse<TData>>
  ): Promise<DataSourceResponse<TData>> {
    if (!this.config.cache?.enabled) {
      return fetcher();
    }

    const cacheKey = this.getCacheKey(query);
    const cached = this.cache?.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache?.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Fetch with retry
   */
  protected async fetchWithRetry(
    fetcher: () => Promise<DataSourceResponse<TData>>
  ): Promise<DataSourceResponse<TData>> {
    const { retry } = this.config;
    if (!retry?.enabled) {
      return fetcher();
    }

    let lastError: Error | undefined;
    const maxAttempts = retry.maxAttempts ?? 3;
    let delay = retry.delay ?? 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          break;
        }

        if (retry.shouldRetry && !retry.shouldRetry(lastError)) {
          break;
        }

        await this.sleep(delay);

        if (retry.backoff === 'exponential') {
          delay *= 2;
        }
      }
    }

    throw lastError;
  }

  /**
   * Default count implementation
   */
  async count(query: DataSourceQuery): Promise<number> {
    const response = await this.fetch({
      ...query,
      pagination: { pageIndex: 0, pageSize: 1 }
    });
    return response.total;
  }

  /**
   * Default export implementation
   */
  async export(query: DataSourceQuery, format: ExportFormat): Promise<Blob> {
    // Fetch all data
    const allData: TData[] = [];
    let pageIndex = 0;
    const pageSize = 1000;

    while (true) {
      const response = await this.fetch({
        ...query,
        pagination: { pageIndex, pageSize }
      });

      allData.push(...response.data);

      if (!response.hasNextPage || response.data.length < pageSize) {
        break;
      }

      pageIndex++;
    }

    // Convert to requested format
    return this.convertToFormat(allData, format);
  }

  /**
   * Convert data to export format
   */
  protected convertToFormat(data: TData[], format: ExportFormat): Blob {
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });

      case 'csv': {
        if (data.length === 0) {
          return new Blob([''], { type: 'text/csv' });
        }

        const headers = Object.keys(data[0] as any);
        const csvContent = [
          headers.join(','),
          ...data.map((row: any) =>
            headers.map(header => {
              const value = row[header];
              // Escape values that contain commas or quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value ?? '';
            }).join(',')
          )
        ].join('\n');

        return new Blob([csvContent], { type: 'text/csv' });
      }

      default:
        throw new Error(`Export format ${format} not implemented`);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateCache(query: DataSourceQuery): void {
    if (!this.cache) return;
    const key = this.getCacheKey(query);
    this.cache.delete(key);
  }

  private getCacheKey(query: DataSourceQuery): string {
    if (this.config.cache?.key) {
      return this.config.cache.key(query);
    }
    return JSON.stringify(query);
  }

  private isCacheValid(timestamp: number): boolean {
    const ttl = this.config.cache?.ttl ?? 60000; // Default 1 minute
    return Date.now() - timestamp < ttl;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}