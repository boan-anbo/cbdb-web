/**
 * DataTable React Component
 * Main component that integrates TanStack Table with our extensions
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getColumnCanGlobalFilter,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  ExpandedState,
  GroupingState,
  RowSelectionState,
  VisibilityState,
  ColumnPinningState,
  OnChangeFn,
  flexRender,
} from '@tanstack/react-table';

import type {
  DataSource,
  DataSourceQuery,
  DataSourceResponse,
  UIAdapter,
  TableConfig,
  ViewMode,
  DensityState,
  SelectionMode,
  AdvancedFilter,
} from '@carrel-data-table/core';

import {
  DensityFeature,
  ExportFeature,
  ColumnPinningFeature,
  DEFAULT_FEATURES,
  getColumnPinningStyles,
  getTablePinningStyles,
} from '@carrel-data-table/core';

import { FilterEngine, SelectionManager } from '@carrel-data-table/core';

export interface DataTableProps<TData> {
  // Required
  columns: ColumnDef<TData>[];
  dataSource: DataSource<TData>;
  uiAdapter: UIAdapter;

  // Optional configurations
  config?: Partial<TableConfig>;
  viewMode?: ViewMode;
  density?: DensityState;
  selectionMode?: SelectionMode;

  // Feature flags
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableExpanding?: boolean;
  enableGrouping?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnPinning?: boolean;
  enableExport?: boolean;
  enableVirtualization?: boolean;
  enableDensity?: boolean;

  // Initial states
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  initialGlobalFilter?: string;
  initialPagination?: PaginationState;
  initialSelection?: RowSelectionState;
  initialExpanded?: ExpandedState;
  initialGrouping?: GroupingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnPinning?: ColumnPinningState;

  // Event handlers
  onSortingChange?: OnChangeFn<SortingState>;
  onFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onGlobalFilterChange?: OnChangeFn<string>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSelectionChange?: OnChangeFn<RowSelectionState>;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  onGroupingChange?: OnChangeFn<GroupingState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
  onDataExport?: (format: string) => void;

  // Custom rendering
  renderToolbar?: (table: any) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;

  // Style
  className?: string;
  containerClassName?: string;
  toolbarClassName?: string;
  tableClassName?: string;
  paginationClassName?: string;
}

/**
 * DataTable Component
 */
export function DataTable<TData>({
  columns,
  dataSource,
  uiAdapter,
  config = {},
  viewMode = 'table',
  density = 'normal',
  selectionMode = 'none',

  // Feature flags
  enableSorting = true,
  enableFiltering = true,
  enableColumnFiltering = true,
  enableGlobalFilter = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExpanding = false,
  enableGrouping = false,
  enableColumnVisibility = true,
  enableColumnPinning = false,
  enableExport = true,
  enableVirtualization = false,
  enableDensity = true,

  // Initial states
  initialSorting = [],
  initialFilters = [],
  initialGlobalFilter = '',
  initialPagination = { pageIndex: 0, pageSize: 20 },
  initialSelection = {},
  initialExpanded = {},
  initialGrouping = [],
  initialColumnVisibility = {},
  initialColumnPinning = { left: [], right: [] },

  // Event handlers
  onSortingChange,
  onFiltersChange,
  onGlobalFilterChange,
  onPaginationChange,
  onSelectionChange,
  onExpandedChange,
  onGroupingChange,
  onColumnVisibilityChange,
  onColumnPinningChange,
  onDataExport,

  // Custom rendering
  renderToolbar,
  renderEmpty,
  renderLoading,
  renderError,

  // Style
  className = '',
  containerClassName = '',
  toolbarClassName = '',
  tableClassName = '',
  paginationClassName = '',
}: DataTableProps<TData>) {
  // State management
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Table states
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialSelection);
  const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded);
  const [grouping, setGrouping] = useState<GroupingState>(initialGrouping);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialColumnPinning);

  // Custom features state
  const [currentDensity, setCurrentDensity] = useState<DensityState>(density);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize managers
  const filterEngine = React.useRef(new FilterEngine()).current;
  const selectionManager = React.useRef(new SelectionManager(selectionMode)).current;

  // UI Components from adapter
  const {
    Table,
    TableRow,
    TableCell,
    TableHeader,
    TableBody,
    Button,
    Input,
    Select,
    Checkbox,
    DropdownMenu,
    Dialog,
    Tooltip,
    Pagination,
    icons,
  } = uiAdapter;

  // Fetch data from data source
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: DataSourceQuery = {
        pagination: enablePagination ? {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        } : undefined,
        sorting: enableSorting ? sorting : undefined,
        filters: enableFiltering ? columnFilters : undefined,
        globalFilter: enableGlobalFilter ? globalFilter : undefined,
      };

      const response = await dataSource.fetch(query);
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    dataSource,
    enablePagination,
    pagination,
    enableSorting,
    sorting,
    enableFiltering,
    columnFilters,
    enableGlobalFilter,
    globalFilter,
  ]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create TanStack Table instance
  const table = useReactTable({
    // Data
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),

    // Core row models
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,

    // States
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
      expanded,
      grouping,
      columnVisibility,
      columnPinning,
      density: currentDensity,
      isExporting,
    },

    // State handlers
    onSortingChange: onSortingChange || setSorting,
    onColumnFiltersChange: onFiltersChange || setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange || setGlobalFilter,
    onPaginationChange: onPaginationChange || setPagination,
    onRowSelectionChange: onSelectionChange || setRowSelection,
    onExpandedChange: onExpandedChange || setExpanded,
    onGroupingChange: onGroupingChange || setGrouping,
    onColumnVisibilityChange: onColumnVisibilityChange || setColumnVisibility,
    onColumnPinningChange: onColumnPinningChange || setColumnPinning,

    // Options
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: selectionMode === 'multi',
    enableSubRowSelection: enableExpanding,
    enableGlobalFilter: enableGlobalFilter,

    // Custom features
    _features: DEFAULT_FEATURES,

    // Feature options
    enableDensity,
    defaultDensity: density,
    onDensityChange: setCurrentDensity,

    enableColumnPinning,
    defaultColumnPinning: initialColumnPinning,
    maxPinnedColumns: config.maxPinnedColumns || { left: 3, right: 2 },

    enableExport,
    exportFormats: config.exportFormats || ['csv', 'json'],
    onExportStart: () => setIsExporting(true),
    onExportComplete: () => {
      setIsExporting(false);
      onDataExport?.(format);
    },
    onExportError: (error) => {
      setIsExporting(false);
      setError(error);
    },
  } as any);

  // Handle export
  const handleExport = async (format: string) => {
    if (table.exportData) {
      await table.exportData(format as any);
    }
  };

  // Handle density change
  const handleDensityChange = () => {
    if (table.toggleDensity) {
      table.toggleDensity();
    }
  };

  // Render loading state
  if (loading && !data.length) {
    return renderLoading ? renderLoading() : (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Render error state
  if (error && !data.length) {
    return renderError ? renderError(error) : (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  // Render empty state
  if (!data.length && !loading) {
    return renderEmpty ? renderEmpty() : (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${containerClassName}`}>
      {/* Toolbar */}
      {renderToolbar ? (
        renderToolbar(table)
      ) : (
        <DataTableToolbar
          table={table}
          uiAdapter={uiAdapter}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnFiltering={enableColumnFiltering}
          enableExport={enableExport}
          enableDensity={enableDensity}
          onExport={handleExport}
          onDensityChange={handleDensityChange}
          className={toolbarClassName}
        />
      )}

      {/* Table */}
      <div className={`data-table-wrapper ${className}`} style={getTablePinningStyles(table)}>
        <Table
          className={tableClassName}
          density={currentDensity}
        >
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHeader
                    key={header.id}
                    sortable={header.column.getCanSort()}
                    sorted={header.column.getIsSorted() !== false}
                    sortDirection={header.column.getIsSorted() || undefined}
                    onSort={header.column.getToggleSortingHandler()}
                    style={getColumnPinningStyles(header.column, table)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHeader>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                selected={row.getIsSelected()}
                onClick={row.getToggleSelectedHandler()}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    style={getColumnPinningStyles(cell.column, table)}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={table.setPageSize}
          className={paginationClassName}
        />
      )}
    </div>
  );
}

/**
 * DataTable Toolbar Component
 */
interface DataTableToolbarProps<TData> {
  table: any;
  uiAdapter: UIAdapter;
  enableGlobalFilter?: boolean;
  enableColumnFiltering?: boolean;
  enableExport?: boolean;
  enableDensity?: boolean;
  onExport?: (format: string) => void;
  onDensityChange?: () => void;
  className?: string;
}

function DataTableToolbar<TData>({
  table,
  uiAdapter,
  enableGlobalFilter,
  enableColumnFiltering,
  enableExport,
  enableDensity,
  onExport,
  onDensityChange,
  className = '',
}: DataTableToolbarProps<TData>) {
  const { Input, Button, DropdownMenu, icons } = uiAdapter;
  const SearchIcon = icons.get('search');
  const SettingsIcon = icons.get('settings');
  const DownloadIcon = icons.get('download');
  const ColumnsIcon = icons.get('columns');

  return (
    <div className={`flex items-center justify-between space-x-2 pb-4 ${className}`}>
      <div className="flex flex-1 items-center space-x-2">
        {enableGlobalFilter && (
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={table.getState().globalFilter ?? ''}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Column visibility */}
        <DropdownMenu
          trigger={
            <Button variant="outline" size="sm">
              <ColumnsIcon className="mr-2 h-4 w-4" />
              Columns
            </Button>
          }
          items={table
            .getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label: column.id,
              checkbox: true,
              checked: column.getIsVisible(),
              onClick: () => column.toggleVisibility(),
            }))}
        />

        {/* Export */}
        {enableExport && (
          <DropdownMenu
            trigger={
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            }
            items={[
              { label: 'Export as CSV', onClick: () => onExport?.('csv') },
              { label: 'Export as JSON', onClick: () => onExport?.('json') },
              { label: 'Export as Excel', onClick: () => onExport?.('excel'), disabled: true },
              { label: 'Export as PDF', onClick: () => onExport?.('pdf'), disabled: true },
            ]}
          />
        )}

        {/* Settings */}
        <DropdownMenu
          trigger={
            <Button variant="outline" size="icon">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          }
          items={[
            ...(enableDensity ? [
              { label: 'Compact view', onClick: onDensityChange },
              { separator: true },
            ] : []),
            { label: 'Reset filters', onClick: () => table.resetColumnFilters() },
            { label: 'Reset sorting', onClick: () => table.resetSorting() },
            { label: 'Clear selection', onClick: () => table.resetRowSelection() },
          ]}
        />
      </div>
    </div>
  );
}