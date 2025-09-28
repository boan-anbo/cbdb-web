/**
 * Row Grouping Feature - Group rows by column values
 * Using TanStack Table v8.14+ custom features API
 *
 * Enables rows to be grouped by one or more columns with expandable groups
 * Supports aggregation, custom group rendering, and nested grouping
 */

import type {
  TableFeature as TanstackTableFeature,
  Table,
  RowData,
  Column,
  Row,
  GroupingState,
  AggregationFn,
  Cell
} from '@tanstack/table-core';

/**
 * Group aggregation type
 */
export type GroupAggregationType = 'sum' | 'count' | 'min' | 'max' | 'mean' | 'median' | 'unique';

/**
 * Row grouping feature state
 */
export interface RowGroupingTableState {
  grouping: GroupingState;
  groupedColumnIds: string[];
}

/**
 * Row grouping feature options
 */
export interface RowGroupingOptions {
  enableGrouping?: boolean;
  enableMultiGrouping?: boolean;
  maxGroupingDepth?: number;
  defaultGrouping?: GroupingState;
  onGroupingChange?: (grouping: GroupingState) => void;
  groupedColumnMode?: 'reorder' | 'remove' | false;
  aggregationFns?: Record<string, AggregationFn<any>>;
  defaultAggregation?: GroupAggregationType;
  enableGroupingRemoval?: boolean;
}

/**
 * Row grouping feature instance methods
 */
export interface RowGroupingInstance {
  // State getters
  getGrouping: () => GroupingState;
  getGroupedColumns: () => Column<any>[];
  getGroupingDepth: () => number;
  getIsAllGroupsExpanded: () => boolean;
  getIsSomeGroupsExpanded: () => boolean;

  // State setters
  setGrouping: (grouping: GroupingState) => void;
  resetGrouping: () => void;

  // Column grouping
  groupByColumn: (columnId: string, position?: number) => void;
  ungroupColumn: (columnId: string) => void;
  toggleGrouping: (columnId: string) => void;
  clearGrouping: () => void;

  // Group expansion
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  toggleAllGroups: () => void;

  // Utilities
  canGroupByColumn: (columnId: string) => boolean;
  getGroupedRowModel: () => any;
  getGroupedColumnPosition: (columnId: string) => number;
}

/**
 * Column-specific grouping methods
 */
export interface RowGroupingColumnDef {
  enableGrouping?: boolean;
  aggregationFn?: AggregationFn<any> | GroupAggregationType;
  aggregatedCell?: (info: any) => any;
  groupedCell?: (info: any) => any;
  enableHiding?: boolean;
}

/**
 * Row-specific grouping methods
 */
export interface RowGroupingRow {
  getIsGrouped: () => boolean;
  getGroupingDepth: () => number;
  getGroupingValue: (columnId: string) => any;
  getIsExpanded: () => boolean;
  getCanExpand: () => boolean;
  getToggleExpandedHandler: () => () => void;
  getSubRows: () => Row<any>[];
  getLeafRows: () => Row<any>[];
  getParentRow: () => Row<any> | undefined;
  getParentRows: () => Row<any>[];
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends RowGroupingTableState {}
  interface TableOptionsResolved<TData extends RowData> extends RowGroupingOptions {}
  interface Table<TData extends RowData> extends RowGroupingInstance {}
  interface ColumnDef<TData extends RowData> extends RowGroupingColumnDef {}
  interface Column<TData extends RowData> {
    getCanGroup: () => boolean;
    getIsGrouped: () => boolean;
    getGroupedIndex: () => number;
    toggleGrouping: () => void;
    getAggregationFn: () => AggregationFn<TData> | undefined;
  }
  interface Row<TData extends RowData> extends RowGroupingRow {}
}

/**
 * Default aggregation functions
 */
export const aggregationFns: Record<GroupAggregationType, AggregationFn<any>> = {
  sum: (columnId, leafRows) => {
    return leafRows.reduce((sum, row) => {
      const value = row.getValue(columnId);
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  },
  count: (columnId, leafRows) => leafRows.length,
  min: (columnId, leafRows) => {
    const values = leafRows.map(row => row.getValue(columnId)).filter(v => v != null);
    return Math.min(...values);
  },
  max: (columnId, leafRows) => {
    const values = leafRows.map(row => row.getValue(columnId)).filter(v => v != null);
    return Math.max(...values);
  },
  mean: (columnId, leafRows) => {
    const sum = aggregationFns.sum(columnId, leafRows);
    return sum / leafRows.length;
  },
  median: (columnId, leafRows) => {
    const values = leafRows
      .map(row => row.getValue(columnId))
      .filter(v => typeof v === 'number')
      .sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  },
  unique: (columnId, leafRows) => {
    const values = leafRows.map(row => row.getValue(columnId));
    return [...new Set(values)].length;
  },
};

/**
 * Row Grouping Feature implementation
 */
export const RowGroupingFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): RowGroupingTableState => {
    return {
      grouping: [],
      groupedColumnIds: [],
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): RowGroupingOptions => {
    return {
      enableGrouping: true,
      enableMultiGrouping: true,
      maxGroupingDepth: 5,
      defaultGrouping: [],
      groupedColumnMode: 'reorder',
      aggregationFns: aggregationFns,
      defaultAggregation: 'sum',
      enableGroupingRemoval: true,
      onGroupingChange: (grouping) => {
        table.setState((old) => ({
          ...old,
          grouping,
          groupedColumnIds: grouping,
        }));
      },
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    // Get current grouping state
    table.getGrouping = () => {
      return table.getState().grouping;
    };

    // Get grouped columns
    table.getGroupedColumns = () => {
      const grouping = table.getGrouping();
      return grouping
        .map(columnId => table.getColumn(columnId))
        .filter(Boolean) as Column<TData>[];
    };

    // Get grouping depth
    table.getGroupingDepth = () => {
      return table.getGrouping().length;
    };

    // Check if all groups are expanded
    table.getIsAllGroupsExpanded = () => {
      const rows = table.getRowModel().rows;
      return rows.every(row => !row.getCanExpand() || row.getIsExpanded());
    };

    // Check if some groups are expanded
    table.getIsSomeGroupsExpanded = () => {
      const rows = table.getRowModel().rows;
      return rows.some(row => row.getCanExpand() && row.getIsExpanded());
    };

    // Set grouping
    table.setGrouping = (grouping: GroupingState) => {
      const { onGroupingChange, maxGroupingDepth } = table.options;

      // Limit grouping depth
      if (maxGroupingDepth && grouping.length > maxGroupingDepth) {
        grouping = grouping.slice(0, maxGroupingDepth);
      }

      if (onGroupingChange) {
        onGroupingChange(grouping);
      } else {
        table.setState((old) => ({
          ...old,
          grouping,
          groupedColumnIds: grouping,
        }));
      }
    };

    // Reset grouping
    table.resetGrouping = () => {
      table.setGrouping([]);
    };

    // Group by a specific column
    table.groupByColumn = (columnId: string, position?: number) => {
      if (!table.canGroupByColumn(columnId)) {
        return;
      }

      const current = [...table.getGrouping()];

      // Remove if already grouped
      const existingIndex = current.indexOf(columnId);
      if (existingIndex !== -1) {
        current.splice(existingIndex, 1);
      }

      // Add at position
      if (position !== undefined && position >= 0) {
        current.splice(position, 0, columnId);
      } else {
        current.push(columnId);
      }

      table.setGrouping(current);
    };

    // Ungroup a specific column
    table.ungroupColumn = (columnId: string) => {
      const current = table.getGrouping();
      table.setGrouping(current.filter(id => id !== columnId));
    };

    // Toggle column grouping
    table.toggleGrouping = (columnId: string) => {
      const current = table.getGrouping();

      if (current.includes(columnId)) {
        table.ungroupColumn(columnId);
      } else {
        table.groupByColumn(columnId);
      }
    };

    // Clear all grouping
    table.clearGrouping = () => {
      table.setGrouping([]);
    };

    // Expand all groups
    table.expandAllGroups = () => {
      table.toggleAllRowsExpanded(true);
    };

    // Collapse all groups
    table.collapseAllGroups = () => {
      table.toggleAllRowsExpanded(false);
    };

    // Toggle all groups
    table.toggleAllGroups = () => {
      table.toggleAllRowsExpanded();
    };

    // Check if column can be grouped
    table.canGroupByColumn = (columnId: string) => {
      const { enableGrouping } = table.options;

      if (!enableGrouping) {
        return false;
      }

      const column = table.getColumn(columnId);
      if (!column) {
        return false;
      }

      // Check column-specific enableGrouping
      if (column.columnDef.enableGrouping === false) {
        return false;
      }

      return true;
    };

    // Get grouped column position
    table.getGroupedColumnPosition = (columnId: string): number => {
      const grouping = table.getGrouping();
      return grouping.indexOf(columnId);
    };
  },

  // Create column methods
  createColumn: <TData extends RowData>(
    column: Column<TData>,
    table: Table<TData>
  ): void => {
    // Check if column can be grouped
    column.getCanGroup = () => {
      return table.canGroupByColumn(column.id);
    };

    // Check if column is grouped
    column.getIsGrouped = () => {
      return table.getGrouping().includes(column.id);
    };

    // Get grouped index
    column.getGroupedIndex = (): number => {
      return table.getGroupedColumnPosition(column.id);
    };

    // Toggle grouping for this column
    column.toggleGrouping = () => {
      table.toggleGrouping(column.id);
    };

    // Get aggregation function
    column.getAggregationFn = (): AggregationFn<TData> | undefined => {
      const { aggregationFn } = column.columnDef;
      const { aggregationFns, defaultAggregation } = table.options;

      if (typeof aggregationFn === 'function') {
        return aggregationFn;
      }

      if (typeof aggregationFn === 'string' && aggregationFns) {
        return aggregationFns[aggregationFn];
      }

      if (defaultAggregation && aggregationFns) {
        return aggregationFns[defaultAggregation];
      }

      return undefined;
    };
  },
};

/**
 * Helper function to get group header data
 */
export function getGroupHeaderData(row: Row<any>, column: Column<any>): { value: any; count: number } | null {
  if (row.getIsGrouped()) {
    const groupingValue = row.getGroupingValue(column.id);
    const subRowsCount = row.subRows?.length || 0;

    return {
      value: groupingValue,
      count: subRowsCount
    };
  }

  return null;
}

/**
 * Helper function to get aggregated cell content
 */
export function getAggregatedCellContent(
  cell: Cell<any, any>,
  aggregationFn?: GroupAggregationType
): string | number | null {
  const row = cell.row;
  const column = cell.column;

  if (!row.getIsGrouped() || !column.columnDef.aggregationFn) {
    return null;
  }

  const leafRows = row.getLeafRows();
  const aggregatedValue = column.getAggregationFn()?.(column.id, leafRows);

  if (aggregatedValue == null) {
    return null;
  }

  // Format based on aggregation type
  const formatValue = (value: any, type?: GroupAggregationType) => {
    switch (type) {
      case 'count':
      case 'unique':
        return value.toLocaleString();
      case 'sum':
      case 'mean':
      case 'median':
        return typeof value === 'number' ? value.toFixed(2) : value;
      default:
        return value;
    }
  };

  return formatValue(aggregatedValue, aggregationFn);
}

/**
 * Helper function to get group expand button data
 */
export function getGroupExpandButtonData(row: Row<any>): { depth: number; isExpanded: boolean; onClick: () => void; symbol: string } | null {
  if (!row.getCanExpand()) {
    return null;
  }

  const depth = row.depth || 0;
  const isExpanded = row.getIsExpanded();

  return {
    depth,
    isExpanded,
    onClick: row.getToggleExpandedHandler(),
    symbol: isExpanded ? '▼' : '▶'
  };
}

/**
 * Helper to determine if column should show grouping controls
 */
export function shouldShowGroupingControls(
  column: Column<any>,
  table: Table<any>
): boolean {
  if (!table.options.enableGrouping) {
    return false;
  }

  return column.getCanGroup();
}

/**
 * Helper to get group row styles
 */
export function getGroupRowStyles(row: Row<any>): React.CSSProperties {
  if (!row.getIsGrouped()) {
    return {};
  }

  const depth = row.depth || 0;

  return {
    backgroundColor: `rgba(0, 0, 0, ${0.02 * (depth + 1)})`,
    fontWeight: 500,
  };
}