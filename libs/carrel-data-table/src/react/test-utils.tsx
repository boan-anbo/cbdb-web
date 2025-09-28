import React from 'react';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import type { DataSource, DataSourceQuery, DataSourceResponse } from '@carrel-data-table/core';

/**
 * Custom render function that includes providers
 */
export function render(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    ...options,
  });
}

/**
 * Mock data for testing
 */
export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
}

export const mockUsers: MockUser[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', department: 'IT', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Developer', department: 'Engineering', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Designer', department: 'Design', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', department: 'Management', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Developer', department: 'Engineering', status: 'pending' },
];

/**
 * Create mock columns
 */
export function createMockColumns(): ColumnDef<MockUser>[] {
  const columnHelper = createColumnHelper<MockUser>();

  return [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => info.getValue(),
    }),
  ];
}

/**
 * Create mock data source
 */
export function createMockDataSource<T = MockUser>(
  data: T[] = mockUsers as any,
  delay = 0
): DataSource<T> {
  return {
    fetch: async (query: DataSourceQuery): Promise<DataSourceResponse<T>> => {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      let result = [...data];

      // Apply global filter
      if (query.globalFilter) {
        const searchTerm = query.globalFilter.toLowerCase();
        result = result.filter((item: any) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm)
          )
        );
      }

      // Apply sorting
      if (query.sorting && query.sorting.length > 0) {
        const sort = query.sorting[0];
        result.sort((a: any, b: any) => {
          const aVal = a[sort.id];
          const bVal = b[sort.id];

          if (aVal < bVal) return sort.desc ? 1 : -1;
          if (aVal > bVal) return sort.desc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const totalCount = result.length;
      if (query.pagination) {
        const { limit, offset } = query.pagination;
        result = result.slice(offset, offset + limit);
      }

      return {
        data: result,
        totalCount,
      };
    },
  };
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';