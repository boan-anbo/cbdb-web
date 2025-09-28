/**
 * DataTable React Package
 * Main exports for the React implementation
 */

// Main component
export { DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';

// Table components
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table';

// Additional components
export { DataTableToolbar } from './components/data-table-toolbar';
export { DataTablePagination } from './components/data-table-pagination';

// Utilities
export { cn } from './lib/utils';

// Filter builder
export { FilterBuilder } from './FilterBuilder';
export type { FilterBuilderProps, FilterPreset } from './FilterBuilder';

// Re-export useful types from core (removed UIAdapter)
export type {
  DataSource,
  DataSourceQuery,
  DataSourceResponse,
  TableConfig,
  ViewMode,
  DensityState,
  SelectionMode,
  FilterOperator,
  AdvancedFilter,
  ExportFormat,
} from '@carrel-data-table/core';

// Re-export utilities
export {
  FilterEngine,
  SelectionManager,
  DensityFeature,
  ExportFeature,
  DEFAULT_FEATURES,
  getColumnPinningStyles,
  getTablePinningStyles,
} from '@carrel-data-table/core';