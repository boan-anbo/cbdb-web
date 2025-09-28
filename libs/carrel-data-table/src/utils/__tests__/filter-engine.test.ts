/**
 * FilterEngine Tests
 * Testing all filter operators and engine functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FilterEngine } from '../filter-engine';
import type { AdvancedFilter, FilterOperator } from '../../types/table.types';

describe('FilterEngine', () => {
  let engine: FilterEngine<any>;
  let testData: any[];

  beforeEach(() => {
    engine = new FilterEngine();
    testData = [
      { id: 1, name: 'John Doe', age: 30, city: 'New York', active: true, tags: ['developer', 'senior'] },
      { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles', active: false, tags: ['designer'] },
      { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago', active: true, tags: ['developer', 'junior'] },
      { id: 4, name: 'Alice Brown', age: 28, city: 'New York', active: true, tags: ['manager'] },
      { id: 5, name: 'Charlie Wilson', age: null, city: 'Boston', active: false, tags: [] },
    ];
  });

  describe('Equality operators', () => {
    it('should filter with equals operator', () => {
      const result = engine.applyFilter(testData[0], 'city', 'eq', 'New York');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'city', 'eq', 'New York');
      expect(result2).toBe(false);
    });

    it('should filter with not equals operator', () => {
      const result = engine.applyFilter(testData[0], 'city', 'neq', 'Los Angeles');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'city', 'neq', 'Los Angeles');
      expect(result2).toBe(false);
    });
  });

  describe('Comparison operators', () => {
    it('should filter with less than operator', () => {
      const result = engine.applyFilter(testData[1], 'age', 'lt', 30);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'age', 'lt', 30);
      expect(result2).toBe(false);
    });

    it('should filter with greater than or equal operator', () => {
      const result = engine.applyFilter(testData[0], 'age', 'gte', 30);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'age', 'gte', 30);
      expect(result2).toBe(false);
    });
  });

  describe('String operators', () => {
    it('should filter with contains operator', () => {
      const result = engine.applyFilter(testData[0], 'name', 'contains', 'John');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'name', 'contains', 'John');
      expect(result2).toBe(false);
    });

    it('should filter with startsWith operator', () => {
      const result = engine.applyFilter(testData[0], 'name', 'startsWith', 'John');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'name', 'startsWith', 'Doe');
      expect(result2).toBe(false);
    });

    it('should filter with endsWith operator', () => {
      const result = engine.applyFilter(testData[0], 'name', 'endsWith', 'Doe');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'name', 'endsWith', 'John');
      expect(result2).toBe(false);
    });
  });

  describe('Array operators', () => {
    it('should filter with in operator', () => {
      const result = engine.applyFilter(testData[0], 'city', 'in', ['New York', 'Chicago']);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'city', 'in', ['New York', 'Chicago']);
      expect(result2).toBe(false);
    });

    it('should filter with notIn operator', () => {
      const result = engine.applyFilter(testData[1], 'city', 'notIn', ['New York', 'Chicago']);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'city', 'notIn', ['New York', 'Chicago']);
      expect(result2).toBe(false);
    });

    it('should filter arrays with contains operator', () => {
      const result = engine.applyFilter(testData[0], 'tags', 'contains', 'developer');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'tags', 'contains', 'developer');
      expect(result2).toBe(false);
    });
  });

  describe('Range operators', () => {
    it('should filter with between operator', () => {
      const result = engine.applyFilter(testData[0], 'age', 'between', [25, 35]);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'age', 'between', [35, 40]);
      expect(result2).toBe(false);
    });

    it('should filter with notBetween operator', () => {
      const result = engine.applyFilter(testData[1], 'age', 'notBetween', [30, 35]);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'age', 'notBetween', [30, 35]);
      expect(result2).toBe(false);
    });
  });

  describe('Null operators', () => {
    it('should filter with isNull operator', () => {
      const result = engine.applyFilter(testData[4], 'age', 'isNull', null);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'age', 'isNull', null);
      expect(result2).toBe(false);
    });

    it('should filter with isNotNull operator', () => {
      const result = engine.applyFilter(testData[0], 'age', 'isNotNull', null);
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[4], 'age', 'isNotNull', null);
      expect(result2).toBe(false);
    });
  });

  describe('Pattern matching', () => {
    it('should filter with regex operator', () => {
      const result = engine.applyFilter(testData[0], 'name', 'regex', '^John.*');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[1], 'name', 'regex', '^John.*');
      expect(result2).toBe(false);
    });

    it('should filter with notRegex operator', () => {
      const result = engine.applyFilter(testData[1], 'name', 'notRegex', '^John.*');
      expect(result).toBe(true);

      const result2 = engine.applyFilter(testData[0], 'name', 'notRegex', '^John.*');
      expect(result2).toBe(false);
    });
  });

  describe('Date operators', () => {
    const dateData = [
      { id: 1, date: new Date('2024-01-15') },
      { id: 2, date: new Date('2024-02-20') },
      { id: 3, date: new Date('2024-03-10') },
    ];

    it('should filter with before operator', () => {
      const result = engine.applyFilter(dateData[0], 'date', 'before', new Date('2024-02-01'));
      expect(result).toBe(true);

      const result2 = engine.applyFilter(dateData[1], 'date', 'before', new Date('2024-02-01'));
      expect(result2).toBe(false);
    });

    it('should filter with after operator', () => {
      const result = engine.applyFilter(dateData[2], 'date', 'after', new Date('2024-03-01'));
      expect(result).toBe(true);

      const result2 = engine.applyFilter(dateData[0], 'date', 'after', new Date('2024-03-01'));
      expect(result2).toBe(false);
    });

    it('should filter with dateRange operator', () => {
      const result = engine.applyFilter(
        dateData[1],
        'date',
        'dateRange',
        [new Date('2024-02-01'), new Date('2024-03-01')]
      );
      expect(result).toBe(true);

      const result2 = engine.applyFilter(
        dateData[0],
        'date',
        'dateRange',
        [new Date('2024-02-01'), new Date('2024-03-01')]
      );
      expect(result2).toBe(false);
    });
  });

  describe('applyFilters with multiple filters', () => {
    it('should apply multiple filters with AND combinator', () => {
      const filters: AdvancedFilter[] = [
        { id: '1', field: 'city', operator: 'eq', value: 'New York', combinator: 'and' },
        { id: '2', field: 'active', operator: 'eq', value: true, combinator: 'and' },
      ];

      const result = engine.applyFilters(testData, filters, 'and');
      expect(result).toHaveLength(2); // John Doe and Alice Brown
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Alice Brown');
    });

    it('should apply multiple filters with OR combinator', () => {
      const filters: AdvancedFilter[] = [
        { id: '1', field: 'city', operator: 'eq', value: 'New York', combinator: 'or' },
        { id: '2', field: 'age', operator: 'lt', value: 26, combinator: 'or' },
      ];

      const result = engine.applyFilters(testData, filters, 'or');
      expect(result).toHaveLength(3); // John Doe, Jane Smith, Alice Brown
    });

    it('should handle nested filters', () => {
      const filters: AdvancedFilter[] = [
        {
          id: '1',
          field: 'active',
          operator: 'eq',
          value: true,
          combinator: 'and',
          children: [
            { id: '1.1', field: 'city', operator: 'eq', value: 'New York', combinator: 'or' },
            { id: '1.2', field: 'city', operator: 'eq', value: 'Chicago', combinator: 'or' },
          ],
        },
      ];

      const result = engine.applyFilters(testData, filters, 'and');
      expect(result).toHaveLength(3); // John Doe, Bob Johnson, Alice Brown
    });
  });

  describe('applyGlobalFilter', () => {
    it('should apply global filter across specified fields', () => {
      const result = engine.applyGlobalFilter(testData, 'john', ['name', 'city']);
      expect(result).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should be case-insensitive', () => {
      const result = engine.applyGlobalFilter(testData, 'YORK', ['city']);
      expect(result).toHaveLength(2); // John Doe and Alice Brown
    });

    it('should search all fields if none specified', () => {
      const result = engine.applyGlobalFilter(testData, 'developer', []);
      expect(result).toHaveLength(2); // John Doe and Bob Johnson (have 'developer' in tags)
    });
  });

  describe('Custom filters', () => {
    it('should register and apply custom filter', () => {
      engine.registerFilter('customEven', (value) => {
        return typeof value === 'number' && value % 2 === 0;
      });

      const result = engine.applyFilter(testData[0], 'age', 'customEven' as FilterOperator, null);
      expect(result).toBe(true); // 30 is even

      const result2 = engine.applyFilter(testData[2], 'age', 'customEven' as FilterOperator, null);
      expect(result2).toBe(false); // 35 is odd
    });

    it('should override existing filter', () => {
      // Override the 'eq' filter to always return true
      engine.registerFilter('eq', () => true);

      const result = engine.applyFilter(testData[0], 'city', 'eq', 'Wrong City');
      expect(result).toBe(true); // Custom filter always returns true
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined values', () => {
      const data = { id: 1, name: undefined };
      const result = engine.applyFilter(data, 'name', 'isNull', null);
      expect(result).toBe(true);
    });

    it('should handle empty arrays', () => {
      const result = engine.applyFilters([], [
        { id: '1', field: 'name', operator: 'eq', value: 'test' },
      ]);
      expect(result).toEqual([]);
    });

    it('should handle empty filter array', () => {
      const result = engine.applyFilters(testData, []);
      expect(result).toEqual(testData);
    });

    it('should handle invalid operator gracefully', () => {
      const result = engine.applyFilter(testData[0], 'name', 'invalid' as FilterOperator, 'test');
      expect(result).toBe(false);
    });

    it('should handle missing field gracefully', () => {
      const result = engine.applyFilter(testData[0], 'nonexistent', 'eq', 'test');
      expect(result).toBe(false);
    });
  });
});