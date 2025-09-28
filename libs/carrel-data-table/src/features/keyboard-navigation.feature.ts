/**
 * Keyboard Navigation Feature - Comprehensive keyboard shortcuts for table interaction
 * Using TanStack Table v8.14+ custom features API
 *
 * Enables full keyboard navigation with customizable shortcuts
 * Supports cell/row navigation, selection, actions, and accessibility
 */

import type {
  TableFeature as TanstackTableFeature,
  Table,
  RowData,
  Row,
  Cell,
  Column,
} from '@tanstack/table-core';

/**
 * Navigation direction
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageUp' | 'pageDown';

/**
 * Focus target type
 */
export type FocusTarget = 'cell' | 'row' | 'header' | 'none';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: (table: Table<any>) => void;
  description?: string;
}

/**
 * Keyboard navigation feature state
 */
export interface KeyboardNavigationTableState {
  keyboardNavigation: {
    enabled: boolean;
    focusedRowIndex: number;
    focusedColumnIndex: number;
    focusTarget: FocusTarget;
    lastAction: string | null;
    selectionAnchor: { row: number; column: number } | null;
  };
}

/**
 * Keyboard navigation feature options
 */
export interface KeyboardNavigationOptions {
  enableKeyboardNavigation?: boolean;
  focusTarget?: FocusTarget;
  wrapNavigation?: boolean;
  enableCellNavigation?: boolean;
  enableRowNavigation?: boolean;
  enableTypeAheadSearch?: boolean;
  typeAheadSearchDelay?: number;
  customShortcuts?: KeyboardShortcut[];
  onNavigate?: (direction: NavigationDirection, table: Table<any>) => void;
  onAction?: (action: string, table: Table<any>) => void;
  preventDefaultKeys?: boolean;
  enableVimMode?: boolean;
}

/**
 * Keyboard navigation feature instance methods
 */
export interface KeyboardNavigationInstance {
  // State getters
  getKeyboardNavigationState: () => KeyboardNavigationTableState['keyboardNavigation'];
  getFocusedCell: () => Cell<any, any> | null;
  getFocusedRow: () => Row<any> | null;
  getFocusedColumn: () => Column<any> | null;
  getIsKeyboardNavigationEnabled: () => boolean;

  // State setters
  setKeyboardNavigationEnabled: (enabled: boolean) => void;
  setFocusedCell: (rowIndex: number, columnIndex: number) => void;
  setFocusedRow: (rowIndex: number) => void;
  clearFocus: () => void;

  // Navigation methods
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  navigateHome: () => void;
  navigateEnd: () => void;
  navigatePageUp: () => void;
  navigatePageDown: () => void;
  navigateToCell: (rowIndex: number, columnIndex: number) => void;
  navigateToRow: (rowIndex: number) => void;

  // Selection methods
  selectFocused: () => void;
  toggleFocusedSelection: () => void;
  selectRange: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  expandSelection: (direction: NavigationDirection) => void;

  // Action methods
  activateFocused: () => void;
  editFocused: () => void;
  copyFocused: () => void;
  deleteFocused: () => void;

  // Utility methods
  handleKeyDown: (event: KeyboardEvent) => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  getShortcuts: () => KeyboardShortcut[];
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends KeyboardNavigationTableState {}
  interface TableOptionsResolved<TData extends RowData> extends KeyboardNavigationOptions {}
  interface Table<TData extends RowData> extends KeyboardNavigationInstance {}
}

/**
 * Default keyboard shortcuts
 */
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'ArrowUp', action: (table) => table.navigateUp(), description: 'Move up' },
  { key: 'ArrowDown', action: (table) => table.navigateDown(), description: 'Move down' },
  { key: 'ArrowLeft', action: (table) => table.navigateLeft(), description: 'Move left' },
  { key: 'ArrowRight', action: (table) => table.navigateRight(), description: 'Move right' },
  { key: 'Home', action: (table) => table.navigateHome(), description: 'Go to first cell' },
  { key: 'End', action: (table) => table.navigateEnd(), description: 'Go to last cell' },
  { key: 'PageUp', action: (table) => table.navigatePageUp(), description: 'Page up' },
  { key: 'PageDown', action: (table) => table.navigatePageDown(), description: 'Page down' },

  // Selection
  { key: ' ', action: (table) => table.toggleFocusedSelection(), description: 'Toggle selection' },
  { key: 'Enter', action: (table) => table.activateFocused(), description: 'Activate focused' },
  { key: 'a', ctrl: true, action: (table) => table.selectAll(), description: 'Select all' },

  // Selection with shift (range selection)
  { key: 'ArrowUp', shift: true, action: (table) => table.expandSelection('up'), description: 'Expand selection up' },
  { key: 'ArrowDown', shift: true, action: (table) => table.expandSelection('down'), description: 'Expand selection down' },
  { key: 'ArrowLeft', shift: true, action: (table) => table.expandSelection('left'), description: 'Expand selection left' },
  { key: 'ArrowRight', shift: true, action: (table) => table.expandSelection('right'), description: 'Expand selection right' },

  // Actions
  { key: 'F2', action: (table) => table.editFocused(), description: 'Edit cell' },
  { key: 'c', ctrl: true, action: (table) => table.copyFocused(), description: 'Copy' },
  { key: 'Delete', action: (table) => table.deleteFocused(), description: 'Delete' },
  { key: 'Escape', action: (table) => table.clearFocus(), description: 'Clear focus' },

  // Filtering and search
  { key: 'f', ctrl: true, action: (table) => table.setGlobalFilter(''), description: 'Focus search' },
  { key: 'F3', action: (table) => table.options.onAction?.('search-next', table), description: 'Find next' },
  { key: 'F3', shift: true, action: (table) => table.options.onAction?.('search-prev', table), description: 'Find previous' },
];

/**
 * Vim mode shortcuts
 */
const VIM_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'h', action: (table) => table.navigateLeft(), description: 'Move left (Vim)' },
  { key: 'j', action: (table) => table.navigateDown(), description: 'Move down (Vim)' },
  { key: 'k', action: (table) => table.navigateUp(), description: 'Move up (Vim)' },
  { key: 'l', action: (table) => table.navigateRight(), description: 'Move right (Vim)' },
  { key: 'g', action: (table) => table.navigateHome(), description: 'Go to start (Vim)' },
  { key: 'G', shift: true, action: (table) => table.navigateEnd(), description: 'Go to end (Vim)' },
  { key: '0', action: (table) => table.navigateToCell(table.getKeyboardNavigationState().focusedRowIndex, 0), description: 'Go to line start (Vim)' },
  { key: '$', shift: true, action: (table) => table.navigateToCell(table.getKeyboardNavigationState().focusedRowIndex, table.getAllColumns().length - 1), description: 'Go to line end (Vim)' },
];

/**
 * Keyboard Navigation Feature implementation
 */
export const KeyboardNavigationFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): KeyboardNavigationTableState => {
    return {
      keyboardNavigation: {
        enabled: true,
        focusedRowIndex: -1,
        focusedColumnIndex: -1,
        focusTarget: 'none',
        lastAction: null,
        selectionAnchor: null,
      },
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): KeyboardNavigationOptions => {
    return {
      enableKeyboardNavigation: true,
      focusTarget: 'cell',
      wrapNavigation: true,
      enableCellNavigation: true,
      enableRowNavigation: true,
      enableTypeAheadSearch: false,
      typeAheadSearchDelay: 500,
      customShortcuts: [],
      preventDefaultKeys: true,
      enableVimMode: false,
      onNavigate: undefined,
      onAction: undefined,
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    // Private shortcuts registry
    let shortcuts: KeyboardShortcut[] = [...DEFAULT_SHORTCUTS];
    if (table.options.enableVimMode) {
      shortcuts.push(...VIM_SHORTCUTS);
    }
    if (table.options.customShortcuts) {
      shortcuts.push(...table.options.customShortcuts);
    }

    // Type-ahead search state
    let typeAheadBuffer = '';
    let typeAheadTimeout: NodeJS.Timeout | null = null;

    // Get keyboard navigation state
    table.getKeyboardNavigationState = () => {
      return table.getState().keyboardNavigation;
    };

    // Get focused cell
    table.getFocusedCell = (): Cell<any, any> | null => {
      const state = table.getKeyboardNavigationState();
      if (state.focusTarget !== 'cell') return null;

      const row = table.getRowModel().rows[state.focusedRowIndex];
      if (!row) return null;

      return row.getAllCells()[state.focusedColumnIndex] || null;
    };

    // Get focused row
    table.getFocusedRow = (): Row<any> | null => {
      const state = table.getKeyboardNavigationState();
      return table.getRowModel().rows[state.focusedRowIndex] || null;
    };

    // Get focused column
    table.getFocusedColumn = (): Column<any> | null => {
      const state = table.getKeyboardNavigationState();
      return table.getAllColumns()[state.focusedColumnIndex] || null;
    };

    // Check if keyboard navigation is enabled
    table.getIsKeyboardNavigationEnabled = () => {
      return table.options.enableKeyboardNavigation && table.getKeyboardNavigationState().enabled;
    };

    // Set keyboard navigation enabled
    table.setKeyboardNavigationEnabled = (enabled: boolean) => {
      table.setState((old) => ({
        ...old,
        keyboardNavigation: {
          ...old.keyboardNavigation,
          enabled,
        },
      }));
    };

    // Set focused cell
    table.setFocusedCell = (rowIndex: number, columnIndex: number) => {
      const rows = table.getRowModel().rows;
      const columns = table.getAllColumns();

      // Validate indices
      rowIndex = Math.max(0, Math.min(rowIndex, rows.length - 1));
      columnIndex = Math.max(0, Math.min(columnIndex, columns.length - 1));

      table.setState((old) => ({
        ...old,
        keyboardNavigation: {
          ...old.keyboardNavigation,
          focusedRowIndex: rowIndex,
          focusedColumnIndex: columnIndex,
          focusTarget: 'cell',
        },
      }));
    };

    // Set focused row
    table.setFocusedRow = (rowIndex: number) => {
      const rows = table.getRowModel().rows;
      rowIndex = Math.max(0, Math.min(rowIndex, rows.length - 1));

      table.setState((old) => ({
        ...old,
        keyboardNavigation: {
          ...old.keyboardNavigation,
          focusedRowIndex: rowIndex,
          focusedColumnIndex: -1,
          focusTarget: 'row',
        },
      }));
    };

    // Clear focus
    table.clearFocus = () => {
      table.setState((old) => ({
        ...old,
        keyboardNavigation: {
          ...old.keyboardNavigation,
          focusedRowIndex: -1,
          focusedColumnIndex: -1,
          focusTarget: 'none',
          selectionAnchor: null,
        },
      }));
    };

    // Navigate up
    table.navigateUp = () => {
      const state = table.getKeyboardNavigationState();
      const rows = table.getRowModel().rows;

      if (state.focusTarget === 'none') {
        table.setFocusedCell(rows.length - 1, 0);
        return;
      }

      let newRowIndex = state.focusedRowIndex - 1;

      if (newRowIndex < 0) {
        newRowIndex = table.options.wrapNavigation ? rows.length - 1 : 0;
      }

      if (state.focusTarget === 'cell') {
        table.setFocusedCell(newRowIndex, state.focusedColumnIndex);
      } else {
        table.setFocusedRow(newRowIndex);
      }

      table.options.onNavigate?.('up', table);
    };

    // Navigate down
    table.navigateDown = () => {
      const state = table.getKeyboardNavigationState();
      const rows = table.getRowModel().rows;

      if (state.focusTarget === 'none') {
        table.setFocusedCell(0, 0);
        return;
      }

      let newRowIndex = state.focusedRowIndex + 1;

      if (newRowIndex >= rows.length) {
        newRowIndex = table.options.wrapNavigation ? 0 : rows.length - 1;
      }

      if (state.focusTarget === 'cell') {
        table.setFocusedCell(newRowIndex, state.focusedColumnIndex);
      } else {
        table.setFocusedRow(newRowIndex);
      }

      table.options.onNavigate?.('down', table);
    };

    // Navigate left
    table.navigateLeft = () => {
      const state = table.getKeyboardNavigationState();
      const columns = table.getAllColumns();

      if (state.focusTarget !== 'cell') return;

      let newColumnIndex = state.focusedColumnIndex - 1;

      if (newColumnIndex < 0) {
        if (table.options.wrapNavigation) {
          // Wrap to previous row
          const newRowIndex = state.focusedRowIndex - 1;
          if (newRowIndex >= 0) {
            table.setFocusedCell(newRowIndex, columns.length - 1);
          } else {
            table.setFocusedCell(table.getRowModel().rows.length - 1, columns.length - 1);
          }
        } else {
          newColumnIndex = 0;
          table.setFocusedCell(state.focusedRowIndex, newColumnIndex);
        }
      } else {
        table.setFocusedCell(state.focusedRowIndex, newColumnIndex);
      }

      table.options.onNavigate?.('left', table);
    };

    // Navigate right
    table.navigateRight = () => {
      const state = table.getKeyboardNavigationState();
      const columns = table.getAllColumns();

      if (state.focusTarget !== 'cell') return;

      let newColumnIndex = state.focusedColumnIndex + 1;

      if (newColumnIndex >= columns.length) {
        if (table.options.wrapNavigation) {
          // Wrap to next row
          const newRowIndex = state.focusedRowIndex + 1;
          if (newRowIndex < table.getRowModel().rows.length) {
            table.setFocusedCell(newRowIndex, 0);
          } else {
            table.setFocusedCell(0, 0);
          }
        } else {
          newColumnIndex = columns.length - 1;
          table.setFocusedCell(state.focusedRowIndex, newColumnIndex);
        }
      } else {
        table.setFocusedCell(state.focusedRowIndex, newColumnIndex);
      }

      table.options.onNavigate?.('right', table);
    };

    // Navigate home
    table.navigateHome = () => {
      table.setFocusedCell(0, 0);
      table.options.onNavigate?.('home', table);
    };

    // Navigate end
    table.navigateEnd = () => {
      const rows = table.getRowModel().rows;
      const columns = table.getAllColumns();
      table.setFocusedCell(rows.length - 1, columns.length - 1);
      table.options.onNavigate?.('end', table);
    };

    // Navigate page up
    table.navigatePageUp = () => {
      const state = table.getKeyboardNavigationState();
      const pageSize = table.getState().pagination?.pageSize || 10;
      const newRowIndex = Math.max(0, state.focusedRowIndex - pageSize);

      if (state.focusTarget === 'cell') {
        table.setFocusedCell(newRowIndex, state.focusedColumnIndex);
      } else {
        table.setFocusedRow(newRowIndex);
      }

      table.options.onNavigate?.('pageUp', table);
    };

    // Navigate page down
    table.navigatePageDown = () => {
      const state = table.getKeyboardNavigationState();
      const rows = table.getRowModel().rows;
      const pageSize = table.getState().pagination?.pageSize || 10;
      const newRowIndex = Math.min(rows.length - 1, state.focusedRowIndex + pageSize);

      if (state.focusTarget === 'cell') {
        table.setFocusedCell(newRowIndex, state.focusedColumnIndex);
      } else {
        table.setFocusedRow(newRowIndex);
      }

      table.options.onNavigate?.('pageDown', table);
    };

    // Navigate to specific cell
    table.navigateToCell = (rowIndex: number, columnIndex: number) => {
      table.setFocusedCell(rowIndex, columnIndex);
    };

    // Navigate to specific row
    table.navigateToRow = (rowIndex: number) => {
      table.setFocusedRow(rowIndex);
    };

    // Select focused
    table.selectFocused = () => {
      const row = table.getFocusedRow();
      if (row && table.options.enableRowSelection) {
        row.toggleSelected(true);
      }
    };

    // Toggle focused selection
    table.toggleFocusedSelection = () => {
      const row = table.getFocusedRow();
      if (row && table.options.enableRowSelection) {
        row.toggleSelected();
      }
    };

    // Select range
    table.selectRange = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      // Implementation for range selection
      const startRow = Math.min(fromRow, toRow);
      const endRow = Math.max(fromRow, toRow);

      for (let i = startRow; i <= endRow; i++) {
        const row = table.getRowModel().rows[i];
        if (row && table.options.enableRowSelection) {
          row.toggleSelected(true);
        }
      }
    };

    // Expand selection
    table.expandSelection = (direction: NavigationDirection) => {
      const state = table.getKeyboardNavigationState();

      // Set anchor if not set
      if (!state.selectionAnchor) {
        table.setState((old) => ({
          ...old,
          keyboardNavigation: {
            ...old.keyboardNavigation,
            selectionAnchor: {
              row: state.focusedRowIndex,
              column: state.focusedColumnIndex,
            },
          },
        }));
      }

      // Navigate in the direction
      switch (direction) {
        case 'up':
          table.navigateUp();
          break;
        case 'down':
          table.navigateDown();
          break;
        case 'left':
          table.navigateLeft();
          break;
        case 'right':
          table.navigateRight();
          break;
      }

      // Select range from anchor to current
      const newState = table.getKeyboardNavigationState();
      if (state.selectionAnchor) {
        table.selectRange(
          state.selectionAnchor.row,
          state.selectionAnchor.column,
          newState.focusedRowIndex,
          newState.focusedColumnIndex
        );
      }
    };

    // Activate focused (enter key)
    table.activateFocused = () => {
      table.options.onAction?.('activate', table);
    };

    // Edit focused
    table.editFocused = () => {
      table.options.onAction?.('edit', table);
    };

    // Copy focused
    table.copyFocused = () => {
      const cell = table.getFocusedCell();
      if (cell) {
        const value = cell.getValue();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(String(value));
        }
      }
      table.options.onAction?.('copy', table);
    };

    // Delete focused
    table.deleteFocused = () => {
      table.options.onAction?.('delete', table);
    };

    // Handle key down
    table.handleKeyDown = (event: KeyboardEvent) => {
      if (!table.getIsKeyboardNavigationEnabled()) {
        return;
      }

      // Type-ahead search
      if (table.options.enableTypeAheadSearch && event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        typeAheadBuffer += event.key.toLowerCase();

        if (typeAheadTimeout) {
          clearTimeout(typeAheadTimeout);
        }

        typeAheadTimeout = setTimeout(() => {
          typeAheadBuffer = '';
        }, table.options.typeAheadSearchDelay || 500);

        // Search for matching row
        const rows = table.getRowModel().rows;
        const currentIndex = table.getKeyboardNavigationState().focusedRowIndex;

        for (let i = currentIndex + 1; i < rows.length + currentIndex; i++) {
          const rowIndex = i % rows.length;
          const row = rows[rowIndex];
          const firstCell = row.getAllCells()[0];

          if (firstCell) {
            const value = String(firstCell.getValue()).toLowerCase();
            if (value.startsWith(typeAheadBuffer)) {
              table.setFocusedRow(rowIndex);
              break;
            }
          }
        }
      }

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        return (
          s.key === event.key &&
          (!s.ctrl || event.ctrlKey) &&
          (!s.alt || event.altKey) &&
          (!s.shift || event.shiftKey) &&
          (!s.meta || event.metaKey)
        );
      });

      if (shortcut) {
        if (table.options.preventDefaultKeys) {
          event.preventDefault();
          event.stopPropagation();
        }
        shortcut.action(table);

        // Update last action
        table.setState((old) => ({
          ...old,
          keyboardNavigation: {
            ...old.keyboardNavigation,
            lastAction: shortcut.description || shortcut.key,
          },
        }));
      }
    };

    // Register shortcut
    table.registerShortcut = (shortcut: KeyboardShortcut) => {
      shortcuts.push(shortcut);
    };

    // Unregister shortcut
    table.unregisterShortcut = (key: string) => {
      shortcuts = shortcuts.filter((s) => s.key !== key);
    };

    // Get shortcuts
    table.getShortcuts = () => shortcuts;
  },
};

/**
 * Helper hook for keyboard navigation
 */
export function useKeyboardNavigation(table: Table<any>) {
  const handleKeyDown = (event: KeyboardEvent) => {
    table.handleKeyDown(event);
  };

  // Add event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }

  return () => {};
}

/**
 * Helper function to get focused cell styles
 */
export function getFocusedCellStyles(
  cell: Cell<any, any>,
  table: Table<any>
): React.CSSProperties {
  const state = table.getKeyboardNavigationState();
  const isFocused =
    state.focusTarget === 'cell' &&
    state.focusedRowIndex === cell.row.index &&
    state.focusedColumnIndex === cell.column.getIndex();

  if (!isFocused) {
    return {};
  }

  return {
    outline: '2px solid var(--primary, #3b82f6)',
    outlineOffset: -1,
    zIndex: 1,
  };
}

/**
 * Helper function to get focused row styles
 */
export function getFocusedRowStyles(
  row: Row<any>,
  table: Table<any>
): React.CSSProperties {
  const state = table.getKeyboardNavigationState();
  const isFocused =
    state.focusTarget === 'row' &&
    state.focusedRowIndex === row.index;

  if (!isFocused) {
    return {};
  }

  return {
    outline: '2px solid var(--primary, #3b82f6)',
    outlineOffset: -1,
  };
}