/**
 * CBDB Client DataSource
 * DataSource implementation using @cbdb/core client to fetch from server
 */

import { BaseDataSource, DataSourceQuery, DataSourceResponse } from '@carrel-data-table/core';
import { createCbdbClient, CbdbClient } from '@cbdb/core';

export interface CBDBClientDataSourceConfig {
  entityType: 'person' | 'kinship' | 'association' | 'office' | 'address' | 'entry' | 'status' | 'text' | 'altname' | 'event';
  dynastyFilter?: string[];
  includeRelations?: boolean;
  baseUrl?: string;
}

export class CBDBClientDataSource extends BaseDataSource {
  id = 'cbdb-client';
  name = 'CBDB Client Data Source';

  private config: CBDBClientDataSourceConfig;
  private client: CbdbClient;

  constructor(config: CBDBClientDataSourceConfig) {
    super({
      name: 'cbdb-client',
      supportsPagination: true,
      supportsSorting: true,
      supportsFiltering: true,
    });
    this.config = config;
    this.client = createCbdbClient(config.baseUrl || 'http://localhost:3300/api');
  }

  async fetch(query: DataSourceQuery): Promise<DataSourceResponse> {
    // Extract query parameters
    const pageSize = query.pagination?.pageSize || 20;
    const pageIndex = query.pagination?.pageIndex || 0;
    const offset = pageIndex * pageSize;

    // Extract filters
    const search = query.filters?.search || query.globalFilter;

    try {
      let data: any[] = [];
      let total = 0;

      switch (this.config.entityType) {
        case 'person': {
          if (search) {
            const result = await this.client.person.searchByName({
              name: search,
              limit: pageSize,
            });
            data = result.data;
            total = result.total || result.data.length;
          } else if (this.config.dynastyFilter && this.config.dynastyFilter.length > 0) {
            const result = await this.client.person.searchByDynasty({
              dynasties: this.config.dynastyFilter,
              limit: pageSize,
              offset,
            });
            data = result.data;
            total = result.total;
          } else {
            const result = await this.client.person.advancedSearch({
              limit: pageSize,
              offset,
            });
            data = result.data;
            total = result.total;
          }
          break;
        }

        // TODO: Implement other entity types when client methods are available
        case 'kinship':
        case 'address':
        case 'office':
        default:
          console.warn(`Entity type ${this.config.entityType} not yet implemented in client`);
          data = [];
          total = 0;
      }

      return {
        data,
        total,
        totalCount: total,
        pageCount: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('Error fetching data from server:', error);
      return {
        data: [],
        total: 0,
        totalCount: 0,
        pageCount: 0,
      };
    }
  }

  async getRow(id: string | number): Promise<any> {
    switch (this.config.entityType) {
      case 'person':
        if (this.config.includeRelations) {
          return this.client.person.getFullById(Number(id));
        }
        return this.client.person.getById(Number(id));

      default:
        console.warn(`getRow not implemented for ${this.config.entityType}`);
        return null;
    }
  }
}