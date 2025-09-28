/**
 * CBDB DataSource
 * DataSource implementation for CBDB (China Biographical Database)
 */

import { BaseDataSource, DataSourceQuery, DataSourceResponse } from '@carrel-data-table/core';

export interface CBDBDataSourceConfig {
  entityType: 'person' | 'kinship' | 'association' | 'office' | 'address' | 'entry' | 'status' | 'text' | 'altname' | 'event';
  dynastyFilter?: string[];
  includeRelations?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

// Mock data for demonstration
const mockPersonData = [
  { c_personid: 1, c_name: 'Wang Wei', c_name_chn: '王維', c_birthyear: 701, c_deathyear: 761, c_dynasty: '唐' },
  { c_personid: 2, c_name: 'Li Bai', c_name_chn: '李白', c_birthyear: 701, c_deathyear: 762, c_dynasty: '唐' },
  { c_personid: 3, c_name: 'Du Fu', c_name_chn: '杜甫', c_birthyear: 712, c_deathyear: 770, c_dynasty: '唐' },
  { c_personid: 4, c_name: 'Su Shi', c_name_chn: '蘇軾', c_birthyear: 1037, c_deathyear: 1101, c_dynasty: '宋' },
  { c_personid: 5, c_name: 'Wang Anshi', c_name_chn: '王安石', c_birthyear: 1021, c_deathyear: 1086, c_dynasty: '宋' },
];

const mockKinshipData = [
  { c_kinship_id: 1, c_kin_code: 'F', c_personid: 1, c_kin_id: 2 },
  { c_kinship_id: 2, c_kin_code: 'S', c_personid: 2, c_kin_id: 1 },
];

const mockAddressData = [
  { c_addr_id: 1, c_personid: 1, c_addr_type: 'BY', c_addr_name_chn: '長安', c_addr_name: 'Changan' },
  { c_addr_id: 2, c_personid: 2, c_addr_type: 'BY', c_addr_name_chn: '蜀郡', c_addr_name: 'Shu' },
];

export class CBDBDataSource extends BaseDataSource {
  id = 'cbdb';
  name = 'CBDB Data Source';

  private config: CBDBDataSourceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: CBDBDataSourceConfig) {
    super({
      name: 'cbdb',
      supportsPagination: true,
      supportsSorting: true,
      supportsFiltering: true,
    });
    this.config = config;
  }

  async fetch(query: DataSourceQuery): Promise<DataSourceResponse> {
    // Check cache if enabled
    if (this.config.cacheEnabled && this.cache) {
      const cacheKey = JSON.stringify({ ...query, ...this.config });
      const cached = this.cache.get(cacheKey);

      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < (this.config.cacheTTL || 300000)) {
          return cached.data;  // cached.data is already the response object
        }
      }
    }

    // Select data based on entity type
    let data: any[] = [];
    switch (this.config.entityType) {
      case 'person':
        data = [...mockPersonData];
        break;
      case 'kinship':
        data = [...mockKinshipData];
        break;
      case 'address':
        data = [...mockAddressData];
        break;
      default:
        data = [];
    }

    // Apply dynasty filter for person entities
    if (this.config.entityType === 'person' && this.config.dynastyFilter?.length) {
      data = data.filter(item => this.config.dynastyFilter!.includes(item.c_dynasty));
    }

    // Apply search filter
    if (query.filters?.search) {
      const searchLower = query.filters.search.toLowerCase();
      data = data.filter(item => {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply column filters
    if (query.filters?.columns) {
      Object.entries(query.filters.columns).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          data = data.filter(item => {
            const itemValue = item[key];
            if (typeof value === 'string') {
              return String(itemValue).toLowerCase().includes(value.toLowerCase());
            }
            return itemValue === value;
          });
        }
      });
    }

    // Apply sorting
    if (query.sorting?.length) {
      const [sortConfig] = query.sorting;
      data.sort((a, b) => {
        const aValue = a[sortConfig.id];
        const bValue = b[sortConfig.id];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return sortConfig.desc ? -result : result;
      });
    }

    // Calculate total before pagination
    const total = data.length;

    // Apply pagination
    if (query.pagination) {
      const { pageIndex, pageSize } = query.pagination;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      data = data.slice(start, end);
    }

    const response: DataSourceResponse = {
      data,
      total,
      totalCount: total,  // Add totalCount for compatibility
      pageCount: query.pagination ? Math.ceil(total / query.pagination.pageSize) : 1,
    };

    // Cache the response if enabled
    if (this.config.cacheEnabled && this.cache) {
      const cacheKey = JSON.stringify({ ...query, ...this.config });
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    }

    return response;
  }

  async getRow(id: string | number): Promise<any> {
    const response = await this.fetch({});
    return response.data.find((item: any) => {
      switch (this.config.entityType) {
        case 'person':
          return item.c_personid === id;
        case 'kinship':
          return item.c_kinship_id === id;
        case 'address':
          return item.c_addr_id === id;
        default:
          return false;
      }
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}