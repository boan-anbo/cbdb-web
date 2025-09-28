/**
 * Carrel Data Table DataSources Package
 * Export all available data source implementations
 */

// Mock DataSource
export { MockDataSource, generateMockData } from './mock/mock.datasource';

// HTTP DataSource
export { HttpDataSource, createHttpDataSource } from './http/http.datasource';
export type { HttpDataSourceConfig } from './http/http.datasource';

// CBDB DataSource
export { CBDBDataSource } from './cbdb/cbdb.datasource';
export type { CBDBDataSourceConfig } from './cbdb/cbdb.datasource';

// CBDB Real DataSource
export { CBDBRealDataSource } from './cbdb/cbdb-real.datasource';
export type { CBDBRealDataSourceConfig } from './cbdb/cbdb-real.datasource';

// CBDB Client DataSource
export { CBDBClientDataSource } from './cbdb/cbdb-client.datasource';
export type { CBDBClientDataSourceConfig } from './cbdb/cbdb-client.datasource';

// Re-export base types from core
export type {
  DataSource,
  DataSourceQuery,
  DataSourceResponse,
  DataSourceConfig,
  BaseDataSource,
} from '@carrel-data-table/core';