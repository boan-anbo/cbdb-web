/**
 * Filter Engine - Core filtering logic
 * Handles all filter operations with various operators
 */

import type { FilterOperator, AdvancedFilter } from '../types/table.types';

/**
 * Filter function type
 */
export type FilterFn<T = any> = (
  value: any,
  filterValue: any,
  row?: T
) => boolean;

/**
 * Filter function map
 */
export const filterFunctions: Record<FilterOperator, FilterFn> = {
  // Equality
  eq: (value, filterValue) => value === filterValue,
  neq: (value, filterValue) => value !== filterValue,

  // Comparison
  lt: (value, filterValue) => Number(value) < Number(filterValue),
  lte: (value, filterValue) => Number(value) <= Number(filterValue),
  gt: (value, filterValue) => Number(value) > Number(filterValue),
  gte: (value, filterValue) => Number(value) >= Number(filterValue),

  // String operations
  contains: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  },
  notContains: (value, filterValue) => {
    if (value == null || filterValue == null) return true;
    return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  },
  startsWith: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
  },
  endsWith: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
  },

  // Array operations
  in: (value, filterValue) => {
    if (!Array.isArray(filterValue)) return false;
    return filterValue.includes(value);
  },
  notIn: (value, filterValue) => {
    if (!Array.isArray(filterValue)) return true;
    return !filterValue.includes(value);
  },

  // Range
  between: (value, filterValue) => {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
    const [min, max] = filterValue;
    const numValue = Number(value);
    return numValue >= Number(min) && numValue <= Number(max);
  },
  notBetween: (value, filterValue) => {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
    const [min, max] = filterValue;
    const numValue = Number(value);
    return numValue < Number(min) || numValue > Number(max);
  },

  // Null checks
  isNull: (value) => value == null,
  isNotNull: (value) => value != null,

  // Pattern matching
  regex: (value, filterValue) => {
    try {
      const regex = new RegExp(String(filterValue), 'i');
      return regex.test(String(value));
    } catch {
      return false;
    }
  },
  notRegex: (value, filterValue) => {
    try {
      const regex = new RegExp(String(filterValue), 'i');
      return !regex.test(String(value));
    } catch {
      return true;
    }
  },

  // Date operations
  before: (value, filterValue) => {
    const date = new Date(value);
    const compareDate = new Date(filterValue);
    return date < compareDate;
  },
  after: (value, filterValue) => {
    const date = new Date(value);
    const compareDate = new Date(filterValue);
    return date > compareDate;
  },
  dateRange: (value, filterValue) => {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
    const date = new Date(value);
    const [start, end] = filterValue.map(d => new Date(d));
    return date >= start && date <= end;
  },
};

/**
 * Filter engine class
 */
export class FilterEngine<T = any> {
  private customFilters: Map<string, FilterFn<T>> = new Map();

  /**
   * Register custom filter function
   */
  registerFilter(name: string, fn: FilterFn<T>): void {
    this.customFilters.set(name, fn);
  }

  /**
   * Get filter function by operator
   */
  getFilterFn(operator: FilterOperator | string): FilterFn<T> | undefined {
    return (
      this.customFilters.get(operator) ||
      filterFunctions[operator as FilterOperator]
    );
  }

  /**
   * Apply single filter
   */
  applyFilter(
    row: T,
    field: string,
    operator: FilterOperator,
    value: any
  ): boolean {
    const fieldValue = this.getFieldValue(row, field);
    const filterFn = this.getFilterFn(operator);

    if (!filterFn) {
      console.warn(`Unknown filter operator: ${operator}`);
      return true;
    }

    return filterFn(fieldValue, value, row);
  }

  /**
   * Apply advanced filter (with AND/OR logic)
   */
  applyAdvancedFilter(row: T, filter: AdvancedFilter): boolean {
    // If filter has children, evaluate them
    if (filter.children && filter.children.length > 0) {
      const combinator = filter.combinator || 'and';

      if (combinator === 'and') {
        return filter.children.every(child =>
          this.applyAdvancedFilter(row, child)
        );
      } else {
        return filter.children.some(child =>
          this.applyAdvancedFilter(row, child)
        );
      }
    }

    // Otherwise apply single filter
    return this.applyFilter(row, filter.field, filter.operator, filter.value);
  }

  /**
   * Apply multiple filters
   */
  applyFilters(
    data: T[],
    filters: AdvancedFilter[],
    combinator: 'and' | 'or' = 'and'
  ): T[] {
    if (!filters || filters.length === 0) {
      return data;
    }

    return data.filter(row => {
      if (combinator === 'and') {
        return filters.every(filter => this.applyAdvancedFilter(row, filter));
      } else {
        return filters.some(filter => this.applyAdvancedFilter(row, filter));
      }
    });
  }

  /**
   * Apply global filter (search across all fields)
   */
  applyGlobalFilter(
    data: T[],
    searchTerm: string,
    searchableFields?: string[]
  ): T[] {
    if (!searchTerm) {
      return data;
    }

    const term = searchTerm.toLowerCase();

    return data.filter(row => {
      const fields = searchableFields || Object.keys(row as any);

      return fields.some(field => {
        const value = this.getFieldValue(row, field);
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }

  /**
   * Get field value from row (supports nested fields)
   */
  private getFieldValue(row: any, field: string): any {
    // Support nested field access (e.g., "user.name")
    const keys = field.split('.');
    let value = row;

    for (const key of keys) {
      if (value == null) return null;
      value = value[key];
    }

    return value;
  }

  /**
   * Create filter from string expression
   */
  parseFilterExpression(expression: string): AdvancedFilter | null {
    // Simple parser for expressions like "age > 18 AND name contains 'John'"
    // This would need a proper parser for production use
    // For now, return null (not implemented)
    return null;
  }

  /**
   * Get operators valid for a data type
   */
  static getOperatorsForType(type: string): FilterOperator[] {
    switch (type) {
      case 'number':
        return ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between', 'notBetween', 'in', 'notIn', 'isNull', 'isNotNull'];

      case 'string':
        return ['eq', 'neq', 'contains', 'notContains', 'startsWith', 'endsWith', 'in', 'notIn', 'regex', 'notRegex', 'isNull', 'isNotNull'];

      case 'boolean':
        return ['eq', 'neq', 'isNull', 'isNotNull'];

      case 'date':
      case 'datetime':
        return ['eq', 'neq', 'before', 'after', 'between', 'dateRange', 'isNull', 'isNotNull'];

      case 'array':
        return ['contains', 'notContains', 'isNull', 'isNotNull'];

      default:
        return ['eq', 'neq', 'isNull', 'isNotNull'];
    }
  }

  /**
   * Validate filter value for operator
   */
  static validateFilterValue(
    operator: FilterOperator,
    value: any
  ): { valid: boolean; message?: string } {
    switch (operator) {
      case 'between':
      case 'notBetween':
      case 'dateRange':
        if (!Array.isArray(value) || value.length !== 2) {
          return {
            valid: false,
            message: `${operator} requires an array of exactly 2 values`,
          };
        }
        break;

      case 'in':
      case 'notIn':
        if (!Array.isArray(value)) {
          return {
            valid: false,
            message: `${operator} requires an array of values`,
          };
        }
        break;

      case 'isNull':
      case 'isNotNull':
        // These don't need a value
        break;

      default:
        if (value === undefined) {
          return {
            valid: false,
            message: `${operator} requires a value`,
          };
        }
    }

    return { valid: true };
  }
}

// Default filter engine instance
export const defaultFilterEngine = new FilterEngine();