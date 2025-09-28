/**
 * Column Pinning Feature - Pin columns to left or right
 * Using TanStack Table v8.14+ custom features API
 *
 * Enables columns to be fixed to either side of the table while scrolling
 * Supports multiple pinned columns with proper stacking
 */

import type {
  TableFeature as TanstackTableFeature,
  Table,
  RowData,
  Column,
  ColumnPinningState
} from '@tanstack/table-core';

/**
 * Column pinning position
 */
export type ColumnPinPosition = 'left' | 'right' | false;

/**
 * Column pinning feature state
 */
export interface ColumnPinningTableState {
  columnPinning: ColumnPinningState;
}

/**
 * Column pinning feature options
 */
export interface ColumnPinningOptions {
  enableColumnPinning?: boolean;
  defaultColumnPinning?: ColumnPinningState;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  maxPinnedColumns?: {
    left?: number;
    right?: number;
  };
  pinnableColumns?: string[] | ((column: Column<any>) => boolean);
}

/**
 * Column pinning feature instance methods
 */
export interface ColumnPinningInstance {
  // State getters
  getColumnPinning: () => ColumnPinningState;
  getLeftPinnedColumns: () => string[];
  getRightPinnedColumns: () => string[];
  getIsSomeColumnsPinned: () => boolean;

  // State setters
  setColumnPinning: (pinning: ColumnPinningState) => void;
  resetColumnPinning: () => void;

  // Column-specific methods
  pinColumn: (columnId: string, position: 'left' | 'right') => void;
  unpinColumn: (columnId: string) => void;
  toggleColumnPinning: (columnId: string, position?: 'left' | 'right') => void;

  // Utilities
  canPinColumn: (columnId: string) => boolean;
  getColumnPinPosition: (columnId: string) => ColumnPinPosition;
  getPinnedColumnsWidth: (position: 'left' | 'right') => number;
}

/**
 * Column-specific pinning methods
 */
export interface ColumnPinningColumnDef {
  enablePinning?: boolean;
  defaultPinned?: 'left' | 'right';
  size?: number; // Used for calculating pinned column width
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends ColumnPinningTableState {}
  interface TableOptionsResolved<TData extends RowData> extends ColumnPinningOptions {}
  interface Table<TData extends RowData> extends ColumnPinningInstance {}
  interface ColumnDef<TData extends RowData> extends ColumnPinningColumnDef {}
  interface Column<TData extends RowData> {
    getCanPin: () => boolean;
    getIsPinned: () => ColumnPinPosition;
    getPinnedIndex: () => number;
    pin: (position: 'left' | 'right') => void;
    unpin: () => void;
  }
}

/**
 * Column Pinning Feature implementation
 */
export const ColumnPinningFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): ColumnPinningTableState => {
    return {
      columnPinning: {
        left: [],
        right: [],
      },
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): ColumnPinningOptions => {
    return {
      enableColumnPinning: true,
      defaultColumnPinning: {
        left: [],
        right: [],
      },
      maxPinnedColumns: {
        left: 3,
        right: 2,
      },
      pinnableColumns: undefined,
      onColumnPinningChange: (pinning) => {
        table.setState((old) => ({
          ...old,
          columnPinning: pinning,
        }));
      },
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    // Get current pinning state
    table.getColumnPinning = () => {
      return table.getState().columnPinning;
    };

    // Get left pinned columns
    table.getLeftPinnedColumns = () => {
      return table.getState().columnPinning.left || [];
    };

    // Get right pinned columns
    table.getRightPinnedColumns = () => {
      return table.getState().columnPinning.right || [];
    };

    // Check if any columns are pinned
    table.getIsSomeColumnsPinned = () => {
      const { left = [], right = [] } = table.getState().columnPinning;
      return left.length > 0 || right.length > 0;
    };

    // Set column pinning
    table.setColumnPinning = (pinning: ColumnPinningState) => {
      const { onColumnPinningChange } = table.options;

      if (onColumnPinningChange) {
        onColumnPinningChange(pinning);
      } else {
        table.setState((old) => ({
          ...old,
          columnPinning: pinning,
        }));
      }
    };

    // Reset column pinning
    table.resetColumnPinning = () => {
      table.setColumnPinning({
        left: [],
        right: [],
      });
    };

    // Pin a specific column
    table.pinColumn = (columnId: string, position: 'left' | 'right') => {
      if (!table.canPinColumn(columnId)) {
        return;
      }

      const current = table.getColumnPinning();
      const { maxPinnedColumns } = table.options;

      // Remove from opposite side if already pinned
      const left = [...(current.left || [])].filter(id => id !== columnId);
      const right = [...(current.right || [])].filter(id => id !== columnId);

      // Add to new position if not exceeding max
      if (position === 'left') {
        if (!maxPinnedColumns?.left || left.length < maxPinnedColumns.left) {
          left.push(columnId);
        }
      } else {
        if (!maxPinnedColumns?.right || right.length < maxPinnedColumns.right) {
          right.push(columnId);
        }
      }

      table.setColumnPinning({ left, right });
    };

    // Unpin a specific column
    table.unpinColumn = (columnId: string) => {
      const current = table.getColumnPinning();

      table.setColumnPinning({
        left: (current.left || []).filter(id => id !== columnId),
        right: (current.right || []).filter(id => id !== columnId),
      });
    };

    // Toggle column pinning
    table.toggleColumnPinning = (columnId: string, position: 'left' | 'right' = 'left') => {
      const currentPosition = table.getColumnPinPosition(columnId);

      if (currentPosition === position) {
        table.unpinColumn(columnId);
      } else {
        table.pinColumn(columnId, position);
      }
    };

    // Check if column can be pinned
    table.canPinColumn = (columnId: string) => {
      const { enableColumnPinning, pinnableColumns } = table.options;

      if (!enableColumnPinning) {
        return false;
      }

      const column = table.getColumn(columnId);
      if (!column) {
        return false;
      }

      // Check column-specific enablePinning
      if (column.columnDef.enablePinning === false) {
        return false;
      }

      // Check pinnableColumns restriction
      if (pinnableColumns) {
        if (Array.isArray(pinnableColumns)) {
          return pinnableColumns.includes(columnId);
        } else if (typeof pinnableColumns === 'function') {
          return pinnableColumns(column);
        }
      }

      return true;
    };

    // Get column pin position
    table.getColumnPinPosition = (columnId: string): ColumnPinPosition => {
      const { left = [], right = [] } = table.getState().columnPinning;

      if (left.includes(columnId)) {
        return 'left';
      }
      if (right.includes(columnId)) {
        return 'right';
      }
      return false;
    };

    // Get total width of pinned columns
    table.getPinnedColumnsWidth = (position: 'left' | 'right'): number => {
      const pinnedIds = position === 'left'
        ? table.getLeftPinnedColumns()
        : table.getRightPinnedColumns();

      return pinnedIds.reduce((total, columnId) => {
        const column = table.getColumn(columnId);
        const size = column?.getSize() || column?.columnDef.size || 150;
        return total + size;
      }, 0);
    };
  },

  // Create column methods
  createColumn: <TData extends RowData>(
    column: Column<TData>,
    table: Table<TData>
  ): void => {
    // Check if column can be pinned
    column.getCanPin = () => {
      return table.canPinColumn(column.id);
    };

    // Get column pin position
    column.getIsPinned = (): ColumnPinPosition => {
      return table.getColumnPinPosition(column.id);
    };

    // Get pinned index within its group
    column.getPinnedIndex = (): number => {
      const position = column.getIsPinned();
      if (!position) return -1;

      const pinnedColumns = position === 'left'
        ? table.getLeftPinnedColumns()
        : table.getRightPinnedColumns();

      return pinnedColumns.indexOf(column.id);
    };

    // Pin column
    column.pin = (position: 'left' | 'right') => {
      table.pinColumn(column.id, position);
    };

    // Unpin column
    column.unpin = () => {
      table.unpinColumn(column.id);
    };
  },
};

/**
 * Helper function to get pinning CSS styles
 */
export function getColumnPinningStyles(
  column: Column<any>,
  table: Table<any>
): React.CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return {};
  }

  const isLastPinned = isPinned === 'left'
    ? table.getLeftPinnedColumns().slice(-1)[0] === column.id
    : table.getRightPinnedColumns()[0] === column.id;

  const offset = isPinned === 'left'
    ? table.getLeftPinnedColumns()
        .slice(0, column.getPinnedIndex())
        .reduce((sum, id) => {
          const col = table.getColumn(id);
          return sum + (col?.getSize() || 150);
        }, 0)
    : table.getRightPinnedColumns()
        .slice(column.getPinnedIndex() + 1)
        .reduce((sum, id) => {
          const col = table.getColumn(id);
          return sum + (col?.getSize() || 150);
        }, 0);

  return {
    position: 'sticky',
    [isPinned]: offset,
    zIndex: 1,
    backgroundColor: 'var(--table-bg, white)',
    ...(isLastPinned && {
      boxShadow: isPinned === 'left'
        ? '2px 0 5px -2px rgba(0, 0, 0, 0.1)'
        : '-2px 0 5px -2px rgba(0, 0, 0, 0.1)',
    }),
  };
}

/**
 * Helper function to get table wrapper styles for pinned columns
 */
export function getTablePinningStyles(table: Table<any>): React.CSSProperties {
  const hasPinnedColumns = table.getIsSomeColumnsPinned();

  if (!hasPinnedColumns) {
    return {};
  }

  return {
    overflow: 'auto',
    position: 'relative',
  };
}

/**
 * Helper to determine if column should show pin controls
 */
export function shouldShowPinControls(
  column: Column<any>,
  table: Table<any>
): boolean {
  if (!table.options.enableColumnPinning) {
    return false;
  }

  return column.getCanPin();
}