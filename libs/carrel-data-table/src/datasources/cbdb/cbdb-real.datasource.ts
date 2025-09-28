/**
 * CBDB Real DataSource
 * DataSource implementation using real CBDB database via Drizzle
 */

import { BaseDataSource, DataSourceQuery, DataSourceResponse } from '@carrel-data-table/core';

export interface CBDBRealDataSourceConfig {
  entityType: 'person' | 'kinship' | 'association' | 'office' | 'address' | 'entry' | 'status' | 'text' | 'altname' | 'event';
  dynastyFilter?: string[];
  includeRelations?: boolean;
  // Pass in the query utilities from storybook-db
  cbdbQueries: any;
}

export class CBDBRealDataSource extends BaseDataSource {
  id = 'cbdb-real';
  name = 'CBDB Real Data Source';

  private config: CBDBRealDataSourceConfig;

  constructor(config: CBDBRealDataSourceConfig) {
    super({
      name: 'cbdb-real',
      supportsPagination: true,
      supportsSorting: true,
      supportsFiltering: true,
    });
    this.config = config;
  }

  async fetch(query: DataSourceQuery): Promise<DataSourceResponse> {
    const { cbdbQueries } = this.config;

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
          const result = await cbdbQueries.getPersons({
            limit: pageSize,
            offset,
            dynastyFilter: this.config.dynastyFilter,
            search,
          });
          data = result.data;
          total = result.total;
          break;
        }

        case 'kinship': {
          const kinships = await cbdbQueries.getKinships({
            limit: pageSize,
            offset,
          });
          data = kinships;
          // For simplicity, assume we have all data
          total = kinships.length;
          break;
        }

        case 'address': {
          const addresses = await cbdbQueries.getAddresses({
            limit: pageSize,
            offset,
          });
          data = addresses;
          total = addresses.length;
          break;
        }

        case 'office': {
          const offices = await cbdbQueries.getOffices({
            limit: pageSize,
            offset,
          });
          data = offices;
          total = offices.length;
          break;
        }

        default:
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
      console.error('Error fetching data from CBDB:', error);
      return {
        data: [],
        total: 0,
        totalCount: 0,
        pageCount: 0,
      };
    }
  }

  async getRow(id: string | number): Promise<any> {
    const { cbdbQueries } = this.config;

    switch (this.config.entityType) {
      case 'person':
        if (this.config.includeRelations) {
          return cbdbQueries.getPersonWithRelations(Number(id));
        }
        const result = await cbdbQueries.getPersons({
          limit: 1,
          offset: 0
        });
        return result.data.find((p: any) => p.c_personid === Number(id));

      default:
        return null;
    }
  }
}