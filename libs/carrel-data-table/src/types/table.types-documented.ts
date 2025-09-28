/**
 * Core table types - UI framework agnostic
 * These types define the contract for the data table system
 *
 * @module types/table
 * @since 1.0.0
 * @author DataTable Team
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
 * Represents the complete state of a data table at any point in time
 *
 * @interface TableState
 * @extends {TanstackTableState}
 *
 * @example
 * ```typescript
 * const tableState: TableState = {
 *   sorting: [{ id: 'name', desc: false }],
 *   columnFilters: [],
 *   density: 'normal',
 *   isLoading: false
 * };
 * ```
 */
export interface TableState {
  // TanStack states
  /** Column sorting configuration */
  sorting: SortingState;
  /** Active column filters */
  columnFilters: ColumnFiltersState;
  /** Column visibility settings */
  columnVisibility: VisibilityState;
  /** Selected row IDs */
  rowSelection: RowSelectionState;
  /** Current column order */
  columnOrder: ColumnOrderState;
  /** Pinned columns configuration */
  columnPinning: ColumnPinningState;
  /** Column width settings */
  columnSizing: ColumnSizingState;
  /** Expanded row IDs */
  expanded: ExpandedState;
  /** Row grouping configuration */
  grouping: GroupingState;
  /** Pagination settings */
  pagination: PaginationState;
  /** Global search filter */
  globalFilter: string;

  // Custom states
  /** Current row density setting */
  density: DensityState;
  /** Current view mode */
  viewMode: ViewMode;
  /** Cell selection state */
  cellSelection: CellSelectionState;
  /** Cells currently being edited */
  editingCells: Record<string, unknown>;
  /** Rows currently being edited */
  editingRows: Record<string, unknown>;
  /** Advanced filter configuration */
  advancedFilters: AdvancedFilter[];

  // UI states
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether data is being exported */
  isExporting: boolean;
  /** Whether table is in fullscreen mode */
  isFullscreen: boolean;
  /** Current error state */
  error: Error | null;
}

/**
 * Density options for row height
 * Controls the vertical spacing of table rows
 *
 * @type DensityState
 * @enum {string}
 *
 * @example
 * ```typescript
 * const density: DensityState = 'compact'; // Less padding
 * const density: DensityState = 'normal';  // Default padding
 * const density: DensityState = 'comfortable'; // More padding
 * ```
 */
export type DensityState = 'compact' | 'normal' | 'comfortable';

/**
 * View mode options for displaying data
 * Different visual representations of the same dataset
 *
 * @type ViewMode
 * @enum {string}
 */
export type ViewMode =
  /** Traditional table view with rows and columns */
  | 'table'
  /** Card-based layout for visual appeal */
  | 'card'
  /** Simple list view */
  | 'list'
  /** Grid layout for thumbnails or cards */
  | 'grid'
  /** Timeline view for temporal data */
  | 'timeline';

/**
 * Cell selection state
 * Tracks which cells are selected for operations like copy/paste
 *
 * @interface CellSelectionState
 *
 * @example
 * ```typescript
 * const selection: CellSelectionState = {
 *   selectedCells: new Set(['row1:col1', 'row1:col2']),
 *   anchorCell: 'row1:col1',
 *   rangeEnd: 'row1:col2'
 * };
 * ```
 */
export interface CellSelectionState {
  /** Set of selected cell IDs in format "rowId:columnId" */
  selectedCells: Set<string>;
  /** The cell where selection started */
  anchorCell: string | null;
  /** The cell where range selection ends */
  rangeEnd: string | null;
}

/**
 * Advanced filter definition
 * Supports nested filters with AND/OR combinators
 *
 * @interface AdvancedFilter
 *
 * @example
 * ```typescript
 * const filter: AdvancedFilter = {
 *   id: 'age-filter',
 *   field: 'age',
 *   operator: 'gt',
 *   value: 18,
 *   combinator: 'and',
 *   children: [
 *     {
 *       id: 'city-filter',
 *       field: 'city',
 *       operator: 'eq',
 *       value: 'New York'
 *     }
 *   ]
 * };
 * ```
 */
export interface AdvancedFilter {
  /** Unique identifier for the filter */
  id: string;
  /** Field/column to filter */
  field: string;
  /** Filter operator to apply */
  operator: FilterOperator;
  /** Value to filter against */
  value: unknown;
  /** How to combine with other filters */
  combinator?: 'and' | 'or';
  /** Nested filters for complex conditions */
  children?: AdvancedFilter[];
}

/**
 * Filter operators for data comparison
 * Comprehensive set of operators for different data types
 *
 * @type FilterOperator
 * @enum {string}
 *
 * @example
 * ```typescript
 * // Text filtering
 * { operator: 'contains', value: 'search' }
 *
 * // Number comparison
 * { operator: 'between', value: [10, 20] }
 *
 * // Date filtering
 * { operator: 'after', value: new Date('2024-01-01') }
 *
 * // Boolean check
 * { operator: 'isNull', value: null }
 * ```
 */
export type FilterOperator =
  // Equality operators
  /** Equals - exact match */
  | 'eq'
  /** Not equals - excludes exact match */
  | 'neq'

  // Comparison operators
  /** Less than */
  | 'lt'
  /** Less than or equal */
  | 'lte'
  /** Greater than */
  | 'gt'
  /** Greater than or equal */
  | 'gte'

  // String operators
  /** Contains substring (case-insensitive) */
  | 'contains'
  /** Does not contain substring */
  | 'notContains'
  /** Starts with string */
  | 'startsWith'
  /** Ends with string */
  | 'endsWith'

  // Array/Set operators
  /** Value in array */
  | 'in'
  /** Value not in array */
  | 'notIn'

  // Range operators
  /** Value between two values [min, max] */
  | 'between'
  /** Value not between two values */
  | 'notBetween'

  // Null checks
  /** Value is null or undefined */
  | 'isNull'
  /** Value is not null or undefined */
  | 'isNotNull'

  // Pattern matching
  /** Matches regular expression */
  | 'regex'
  /** Does not match regular expression */
  | 'notRegex'

  // Date operators
  /** Date before specified date */
  | 'before'
  /** Date after specified date */
  | 'after'
  /** Date within range */
  | 'dateRange';

/**
 * Export format options
 * Supported formats for data export
 *
 * @type ExportFormat
 * @enum {string}
 */
export type ExportFormat =
  /** Comma-separated values */
  | 'csv'
  /** JavaScript Object Notation */
  | 'json'
  /** Microsoft Excel */
  | 'excel'
  /** Portable Document Format */
  | 'pdf';

/**
 * Selection modes for table rows/cells
 * Determines how users can select data
 *
 * @type SelectionMode
 * @enum {string}
 */
export type SelectionMode =
  /** No selection allowed */
  | 'none'
  /** Single row/cell selection */
  | 'single'
  /** Multiple row/cell selection */
  | 'multi'
  /** Cell-based selection */
  | 'cell'
  /** Range selection (Excel-like) */
  | 'range';

/**
 * Edit modes for inline editing
 * Determines how cells/rows can be edited
 *
 * @type EditMode
 * @enum {string}
 */
export type EditMode =
  /** No editing allowed */
  | 'none'
  /** Edit individual cells */
  | 'cell'
  /** Edit entire row */
  | 'row'
  /** Inline form editing */
  | 'inline'
  /** Modal dialog editing */
  | 'modal';

/**
 * Configuration for virtualization
 * Settings for virtual scrolling of large datasets
 *
 * @interface VirtualizationConfig
 *
 * @example
 * ```typescript
 * const config: VirtualizationConfig = {
 *   enabled: true,
 *   rowHeight: 48,
 *   overscan: 3,
 *   estimateSize: (index) => 48
 * };
 * ```
 */
export interface VirtualizationConfig {
  /** Whether virtualization is enabled */
  enabled: boolean;
  /** Fixed row height or function to calculate */
  rowHeight?: number | ((index: number) => number);
  /** Number of rows to render outside viewport */
  overscan?: number;
  /** Function to estimate row size */
  estimateSize?: (index: number) => number;
  /** Enable horizontal virtualization */
  horizontal?: boolean;
}

/**
 * Table configuration options
 * Complete configuration for table behavior
 *
 * @interface TableConfig
 *
 * @example
 * ```typescript
 * const config: TableConfig = {
 *   enableSorting: true,
 *   enableFiltering: true,
 *   pagination: {
 *     pageSize: 20,
 *     pageSizeOptions: [10, 20, 50, 100]
 *   },
 *   virtualization: {
 *     enabled: true,
 *     rowHeight: 48
 *   }
 * };
 * ```
 */
export interface TableConfig {
  // Feature flags
  /** Enable column sorting */
  enableSorting?: boolean;
  /** Enable column filtering */
  enableFiltering?: boolean;
  /** Enable global search */
  enableGlobalFilter?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable column resizing */
  enableColumnResizing?: boolean;
  /** Enable column reordering */
  enableColumnReordering?: boolean;
  /** Enable column pinning */
  enableColumnPinning?: boolean;
  /** Enable row expansion */
  enableExpanding?: boolean;
  /** Enable row grouping */
  enableGrouping?: boolean;
  /** Enable data export */
  enableExport?: boolean;
  /** Enable density control */
  enableDensity?: boolean;
  /** Enable fullscreen mode */
  enableFullscreen?: boolean;
  /** Enable virtualization for large datasets */
  enableVirtualization?: boolean;

  // Configuration objects
  /** Pagination settings */
  pagination?: {
    /** Default page size */
    pageSize?: number;
    /** Available page size options */
    pageSizeOptions?: number[];
    /** Show page size selector */
    showPageSizeSelector?: boolean;
    /** Show page jumper */
    showPageJumper?: boolean;
  };

  /** Sorting configuration */
  sorting?: {
    /** Allow multi-column sort */
    multiSort?: boolean;
    /** Remove sort on third click */
    removeSortOnThirdClick?: boolean;
    /** Custom sort functions by column */
    customSortFns?: Record<string, (a: any, b: any) => number>;
  };

  /** Filtering configuration */
  filtering?: {
    /** Show column filters */
    showColumnFilters?: boolean;
    /** Debounce filter input (ms) */
    debounceMs?: number;
    /** Case sensitive filtering */
    caseSensitive?: boolean;
  };

  /** Export configuration */
  export?: {
    /** Available export formats */
    formats?: ExportFormat[];
    /** Max rows to export */
    maxRows?: number;
    /** Include headers in export */
    includeHeaders?: boolean;
    /** Export filename pattern */
    filename?: string | ((date: Date) => string);
  };

  /** Selection configuration */
  selection?: {
    /** Selection mode */
    mode?: SelectionMode;
    /** Show selection checkboxes */
    showCheckboxes?: boolean;
    /** Select on row click */
    selectOnClick?: boolean;
    /** Allow range selection */
    allowRangeSelection?: boolean;
  };

  /** Virtualization settings */
  virtualization?: VirtualizationConfig;

  // Styling
  /** Custom class names */
  classNames?: {
    root?: string;
    table?: string;
    header?: string;
    body?: string;
    row?: string;
    cell?: string;
    toolbar?: string;
    pagination?: string;
  };

  /** Sticky header */
  stickyHeader?: boolean;
  /** Striped rows */
  stripedRows?: boolean;
  /** Bordered cells */
  bordered?: boolean;
  /** Hover effect on rows */
  hoverEffect?: boolean;
}

/**
 * Table feature plugin interface
 * Allows extending table functionality with custom features
 *
 * @interface TableFeature
 * @template TData - The type of data in the table
 *
 * @example
 * ```typescript
 * const customFeature: TableFeature<User> = {
 *   name: 'custom-feature',
 *   version: '1.0.0',
 *   onInit: (table) => {
 *     console.log('Feature initialized');
 *   },
 *   extendTable: (table) => {
 *     table.customMethod = () => { /* ... *\/ };
 *   }
 * };
 * ```
 */
export interface TableFeature<TData = unknown> {
  /** Feature name */
  name: string;
  /** Feature version */
  version: string;
  /** Dependencies on other features */
  dependencies?: string[];

  /** Lifecycle hooks */
  /** Called when feature is initialized */
  onInit?: (table: TanstackTable<TData>) => void;
  /** Called when feature is destroyed */
  onDestroy?: (table: TanstackTable<TData>) => void;

  /** State management */
  /** Initial state for the feature */
  getInitialState?: () => Partial<TableState>;
  /** Default options for the feature */
  getDefaultOptions?: () => Partial<TableConfig>;

  /** Table extensions */
  /** Extend table instance with new methods */
  extendTable?: (table: TanstackTable<TData>) => void;
  /** Extend column definition */
  extendColumn?: (column: Column<TData>) => void;
  /** Extend row instance */
  extendRow?: (row: Row<TData>) => void;
  /** Extend cell instance */
  extendCell?: (cell: Cell<TData, unknown>) => void;
}