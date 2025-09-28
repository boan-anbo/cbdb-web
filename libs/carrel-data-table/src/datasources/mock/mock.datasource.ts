/**
 * Mock data source for testing and development
 */

import {
  BaseDataSource,
  DataSource,
  DataSourceQuery,
  DataSourceResponse,
  DataSourceConfig,
  FilterOperator,
  ColumnMetadata
} from '../../../core/src/data-sources/types';

/**
 * Mock data generator options
 */
export interface MockDataOptions {
  seed?: number;
  count?: number;
  delay?: number;
  errorRate?: number;
}

/**
 * Generic mock data source
 */
export class MockDataSource<TData = any> extends BaseDataSource<TData> {
  id = 'mock';
  name = 'Mock Data Source';

  private data: TData[];
  private delay: number;
  private errorRate: number;

  constructor(
    data: TData[] | ((index: number) => TData),
    options?: MockDataOptions & { config?: DataSourceConfig }
  ) {
    super(options?.config);

    const { count = 100, delay = 300, errorRate = 0 } = options || {};

    this.delay = delay;
    this.errorRate = errorRate;

    // Generate data if function provided
    if (typeof data === 'function') {
      this.data = Array.from({ length: count }, (_, i) => data(i));
    } else {
      this.data = data;
    }
  }

  async fetch(query: DataSourceQuery): Promise<DataSourceResponse<TData>> {
    // Simulate network delay
    await this.simulateDelay();

    // Simulate random errors
    if (this.shouldError()) {
      throw new Error('Mock network error');
    }

    // Start with all data
    let result = [...this.data];

    // Apply global filter
    if (query.globalFilter) {
      const searchTerm = query.globalFilter.toLowerCase();
      result = result.filter((item) =>
        Object.values(item as any).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply column filters
    if (query.filters && query.filters.length > 0) {
      result = this.applyFilters(result, query.filters);
    }

    // Apply grouping
    if (query.groupBy && query.groupBy.length > 0) {
      // For simplicity, we'll just return ungrouped data
      // Real implementation would group the data
    }

    // Apply sorting
    if (query.sorting && query.sorting.length > 0) {
      result = this.applySorting(result, query.sorting);
    }

    // Calculate total before pagination
    const total = result.length;

    // Apply pagination
    if (query.pagination) {
      const { pageIndex, pageSize } = query.pagination;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      result = result.slice(start, end);
    }

    // Calculate page count
    const pageSize = query.pagination?.pageSize || 10;
    const pageCount = Math.ceil(total / pageSize);
    const currentPage = query.pagination?.pageIndex || 0;

    return {
      data: result,
      total,
      pageCount,
      hasNextPage: currentPage < pageCount - 1,
      hasPrevPage: currentPage > 0,
      meta: {
        executionTime: this.delay,
        cached: false,
      },
    };
  }

  async getColumns(): Promise<ColumnMetadata[]> {
    await this.simulateDelay();

    if (this.data.length === 0) {
      return [];
    }

    // Auto-generate column metadata from first item
    const firstItem = this.data[0] as any;
    return Object.keys(firstItem).map((key) => {
      const value = firstItem[key];
      const type = this.inferColumnType(value);

      return {
        id: key,
        label: this.humanizeLabel(key),
        type,
        sortable: true,
        filterable: true,
        filterOperators: this.getOperatorsForType(type),
      };
    });
  }

  async getFilterOperators(): Promise<FilterOperator[]> {
    return [
      'eq',
      'neq',
      'lt',
      'lte',
      'gt',
      'gte',
      'contains',
      'startsWith',
      'endsWith',
      'in',
      'between',
      'isNull',
      'isNotNull',
    ];
  }

  /**
   * Set new data
   */
  setData(data: TData[]): void {
    this.data = data;
    this.clearCache();
  }

  /**
   * Add item
   */
  async create(item: Partial<TData>): Promise<TData> {
    await this.simulateDelay();

    const newItem = {
      ...item,
      id: this.generateId(),
    } as TData;

    this.data.push(newItem);
    this.clearCache();
    return newItem;
  }

  /**
   * Update item
   */
  async update(id: unknown, item: Partial<TData>): Promise<TData> {
    await this.simulateDelay();

    const index = this.data.findIndex((d: any) => d.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.data[index] = { ...this.data[index], ...item };
    this.clearCache();
    return this.data[index];
  }

  /**
   * Delete item
   */
  async delete(id: unknown): Promise<void> {
    await this.simulateDelay();

    const index = this.data.findIndex((d: any) => d.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.data.splice(index, 1);
    this.clearCache();
  }

  private applyFilters(
    data: TData[],
    filters: Array<{ id: string; value: unknown; operator?: FilterOperator }>
  ): TData[] {
    return data.filter((item) => {
      return filters.every((filter) => {
        const itemValue = (item as any)[filter.id];
        const filterValue = filter.value;
        const operator = filter.operator || 'eq';

        return this.evaluateFilter(itemValue, filterValue, operator);
      });
    });
  }

  private evaluateFilter(
    itemValue: unknown,
    filterValue: unknown,
    operator: FilterOperator
  ): boolean {
    // Handle null/undefined
    if (operator === 'isNull') return itemValue == null;
    if (operator === 'isNotNull') return itemValue != null;

    // Convert to strings for string operations
    const itemStr = String(itemValue).toLowerCase();
    const filterStr = String(filterValue).toLowerCase();

    switch (operator) {
      case 'eq':
        return itemValue === filterValue;
      case 'neq':
        return itemValue !== filterValue;
      case 'lt':
        return Number(itemValue) < Number(filterValue);
      case 'lte':
        return Number(itemValue) <= Number(filterValue);
      case 'gt':
        return Number(itemValue) > Number(filterValue);
      case 'gte':
        return Number(itemValue) >= Number(filterValue);
      case 'contains':
        return itemStr.includes(filterStr);
      case 'notContains':
        return !itemStr.includes(filterStr);
      case 'startsWith':
        return itemStr.startsWith(filterStr);
      case 'endsWith':
        return itemStr.endsWith(filterStr);
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(itemValue);
      case 'notIn':
        return Array.isArray(filterValue) && !filterValue.includes(itemValue);
      case 'between':
        if (Array.isArray(filterValue) && filterValue.length === 2) {
          const [min, max] = filterValue;
          const val = Number(itemValue);
          return val >= Number(min) && val <= Number(max);
        }
        return false;
      case 'regex':
        try {
          const regex = new RegExp(String(filterValue), 'i');
          return regex.test(String(itemValue));
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  private applySorting(
    data: TData[],
    sorting: Array<{ id: string; desc: boolean }>
  ): TData[] {
    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        const aVal = (a as any)[sort.id];
        const bVal = (b as any)[sort.id];

        let comparison = 0;

        if (aVal == null && bVal == null) comparison = 0;
        else if (aVal == null) comparison = 1;
        else if (bVal == null) comparison = -1;
        else if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;

        if (comparison !== 0) {
          return sort.desc ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  private inferColumnType(value: unknown): string {
    if (value == null) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'json';
    return 'string';
  }

  private getOperatorsForType(type: string): FilterOperator[] {
    switch (type) {
      case 'number':
        return ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between', 'isNull', 'isNotNull'];
      case 'boolean':
        return ['eq', 'neq', 'isNull', 'isNotNull'];
      case 'date':
      case 'datetime':
        return ['eq', 'neq', 'before', 'after', 'between', 'isNull', 'isNotNull'];
      case 'array':
      case 'json':
        return ['isNull', 'isNotNull'];
      default:
        return [
          'eq',
          'neq',
          'contains',
          'notContains',
          'startsWith',
          'endsWith',
          'isNull',
          'isNotNull',
        ];
    }
  }

  private humanizeLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
  }

  private shouldError(): boolean {
    return Math.random() < this.errorRate;
  }
}

/**
 * Generate mock data (generic helper)
 */
export function generateMockData(count: number = 100): any[] {
  return Array.from({ length: count }, (_, i) => generateMockPerson(i));
}

/**
 * Generate mock person data (example)
 */
export function generateMockPerson(index: number): any {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses = ['active', 'inactive', 'pending'];

  return {
    id: index + 1,
    firstName: firstNames[index % firstNames.length],
    lastName: lastNames[index % lastNames.length],
    email: `user${index}@example.com`,
    department: departments[index % departments.length],
    salary: Math.floor(Math.random() * 100000) + 50000,
    startDate: new Date(2020 + (index % 4), index % 12, (index % 28) + 1),
    status: statuses[index % statuses.length],
    isManager: index % 5 === 0,
  };
}