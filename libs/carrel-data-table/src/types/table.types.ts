/**
 * Core table types - UI framework agnostic
 * These types define the contract for the data table system
 */

import type {
  RowData,
  Table as TanstackTable,
  Row,
  Column,
  Cell,
  Header,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  GroupingState,
  PaginationState
} from '@tanstack/table-core';

/**
 * Core table state extending TanStack's state
 */
export interface TableState {
  // TanStack states
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  columnSizing: ColumnSizingState;
  expanded: ExpandedState;
  grouping: GroupingState;
  pagination: PaginationState;
  globalFilter: string;

  // Custom states
  density: DensityState;
  viewMode: ViewMode;
  cellSelection: CellSelectionState;
  editingCells: Record<string, unknown>;
  editingRows: Record<string, unknown>;
  advancedFilters: AdvancedFilter[];

  // UI states
  isLoading: boolean;
  isExporting: boolean;
  isFullscreen: boolean;
  error: Error | null;
}

/**
 * Density options for row height
 */
export type DensityState = 'compact' | 'normal' | 'comfortable';

/**
 * View mode options
 */
export type ViewMode = 'table' | 'card' | 'list' | 'grid' | 'timeline';

/**
 * Cell selection state
 */
export interface CellSelectionState {
  selectedCells: Set<string>; // Format: "rowId:columnId"
  anchorCell: string | null;
  rangeEnd: string | null;
}

/**
 * Advanced filter definition
 */
export interface AdvancedFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  combinator?: 'and' | 'or';
  children?: AdvancedFilter[];
}

/**
 * Filter operators
 */
export type FilterOperator =
  // Equality
  | 'eq'           // equals
  | 'neq'          // not equals
  // Comparison
  | 'lt'           // less than
  | 'lte'          // less than or equal
  | 'gt'           // greater than
  | 'gte'          // greater than or equal
  // String operations
  | 'contains'     // string contains
  | 'notContains'  // string doesn't contain
  | 'startsWith'   // string starts with
  | 'endsWith'     // string ends with
  // Array operations
  | 'in'           // value in array
  | 'notIn'        // value not in array
  // Range
  | 'between'      // value between two values
  | 'notBetween'   // value not between
  // Null checks
  | 'isNull'       // value is null
  | 'isNotNull'    // value is not null
  // Pattern matching
  | 'regex'        // regular expression match
  | 'notRegex'     // no regex match
  // Date specific
  | 'before'       // date before
  | 'after'        // date after
  | 'dateRange';   // date in range

/**
 * Selection mode configuration
 */
export type SelectionMode = 'none' | 'single' | 'multi' | 'cell' | 'range';

/**
 * Edit mode configuration
 */
export type EditMode = 'none' | 'cell' | 'row' | 'inline' | 'modal';

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

/**
 * Table configuration
 */
export interface TableConfig<TData extends RowData = any> {
  // Behavior
  selectionMode?: SelectionMode;
  editMode?: EditMode;
  enableVirtualization?: boolean;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableRowReorder?: boolean;
  enableGrouping?: boolean;
  enableAggregation?: boolean;

  // Performance
  virtualScrollThreshold?: number;
  debounceMs?: number;
  lazyLoad?: boolean;

  // Defaults
  defaultPageSize?: number;
  defaultDensity?: DensityState;
  defaultViewMode?: ViewMode;
  defaultSortOrder?: 'asc' | 'desc';

  // Persistence
  persistStateKey?: string;
  persistStateStorage?: 'localStorage' | 'sessionStorage' | 'none';

  // Accessibility
  announceUpdates?: boolean;
  focusTrap?: boolean;
  keyboardNavigation?: boolean;

  // Features
  features?: TableFeature<TData>[];
}

/**
 * Table feature plugin interface
 */
export interface TableFeature<TData extends RowData = any> {
  // Metadata
  name: string;
  version?: string;
  dependencies?: string[];

  // Lifecycle
  onInit?: (table: TanstackTable<TData>) => void;
  onDestroy?: (table: TanstackTable<TData>) => void;

  // State extensions
  getInitialState?: () => Partial<TableState>;
  getDefaultOptions?: () => Partial<TableConfig<TData>>;

  // Table API extensions
  extendTable?: (table: TanstackTable<TData>) => void;
  extendColumn?: (column: Column<TData>) => void;
  extendRow?: (row: Row<TData>) => void;
  extendCell?: (cell: Cell<TData, unknown>) => void;
}

/**
 * Column metadata for dynamic configuration
 */
export interface ColumnMetadata {
  id: string;
  label: string;
  type: ColumnDataType;
  description?: string;
  group?: string;

  // Capabilities
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  hideable?: boolean;
  exportable?: boolean;

  // Configuration
  filterOperators?: FilterOperator[];
  defaultVisible?: boolean;
  minWidth?: number;
  maxWidth?: number;

  // For enum types
  enumValues?: Array<{
    value: unknown;
    label: string;
    color?: string;
    icon?: string;
  }>;

  // Formatting
  format?: (value: unknown) => string;
  exportFormat?: (value: unknown) => string;

  // Validation (for editing)
  validate?: (value: unknown) => boolean | string;
}

/**
 * Column data types
 */
export type ColumnDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'enum'
  | 'json'
  | 'array'
  | 'custom';

/**
 * Aggregation function types
 */
export type AggregationFn =
  | 'sum'
  | 'average'
  | 'median'
  | 'min'
  | 'max'
  | 'count'
  | 'countDistinct'
  | 'first'
  | 'last'
  | ((values: unknown[]) => unknown);

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  modifiers?: Array<'ctrl' | 'alt' | 'shift' | 'meta'>;
  action: string;
  description?: string;
  handler: (table: TanstackTable<any>) => void;
}