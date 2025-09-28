/**
 * DataTable React Component (Refactored)
 * Main component that integrates TanStack Table with our extensions
 * No UIAdapter - using shadcn/ui pattern with React 19
 */

import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  type ExpandedState,
  type GroupingState,
  type RowSelectionState,
  type VisibilityState,
  type ColumnPinningState,
  type OnChangeFn,
} from '@tanstack/react-table'

import type {
  DataSource,
  DataSourceQuery,
  ViewMode,
  DensityState,
  SelectionMode,
} from '@carrel-data-table/core'

import {
  FilterEngine,
  SelectionManager,
  getColumnPinningStyles,
  getTablePinningStyles,
} from '@carrel-data-table/core'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table'
import { DataTableToolbar } from './components/data-table-toolbar'
import { DataTablePagination } from './components/data-table-pagination'
import { cn } from './lib/utils'

export interface DataTableProps<TData, TValue = unknown> {
  // Core props
  columns: ColumnDef<TData, TValue>[]  // Dynamic columns from TanStack
  dataSource: DataSource<TData>

  // React 19: ref as prop
  ref?: React.Ref<HTMLDivElement>

  // Styling (all optional with defaults)
  className?: string
  containerClassName?: string
  density?: "compact" | "normal" | "comfortable"
  variant?: "default" | "bordered" | "striped"

  // Features
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnFiltering?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableExpanding?: boolean
  enableGrouping?: boolean
  enableColumnVisibility?: boolean
  enableColumnPinning?: boolean
  enableExport?: boolean
  enableVirtualization?: boolean
  enableDensity?: boolean

  // Selection
  selectionMode?: SelectionMode

  // Initial states
  initialSorting?: SortingState
  initialFilters?: ColumnFiltersState
  initialGlobalFilter?: string
  initialPagination?: PaginationState
  initialSelection?: RowSelectionState
  initialExpanded?: ExpandedState
  initialGrouping?: GroupingState
  initialColumnVisibility?: VisibilityState
  initialColumnPinning?: ColumnPinningState

  // Event handlers
  onSortingChange?: OnChangeFn<SortingState>
  onFiltersChange?: OnChangeFn<ColumnFiltersState>
  onGlobalFilterChange?: OnChangeFn<string>
  onPaginationChange?: OnChangeFn<PaginationState>
  onSelectionChange?: OnChangeFn<RowSelectionState>
  onExpandedChange?: OnChangeFn<ExpandedState>
  onGroupingChange?: OnChangeFn<GroupingState>
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
  onDataExport?: (format: string) => void

  // Customization
  renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderLoading?: () => React.ReactNode
  renderError?: (error: Error) => React.ReactNode
}

export function DataTable<TData, TValue = unknown>({
  columns,
  dataSource,
  ref,
  className,
  containerClassName,
  density = "normal",
  variant = "default",

  // Features
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

  // Selection
  selectionMode = 'none',

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
}: DataTableProps<TData, TValue>) {

  // State management
  const [data, setData] = React.useState<TData[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [totalCount, setTotalCount] = React.useState(0)

  // Table states
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters)
  const [globalFilter, setGlobalFilter] = React.useState(initialGlobalFilter)
  const [pagination, setPagination] = React.useState<PaginationState>(initialPagination)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialSelection)
  const [expanded, setExpanded] = React.useState<ExpandedState>(initialExpanded)
  const [grouping, setGrouping] = React.useState<GroupingState>(initialGrouping)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(initialColumnPinning)

  // Custom features state
  const [currentDensity, setCurrentDensity] = React.useState<DensityState>(density as DensityState)
  const [isExporting, setIsExporting] = React.useState(false)

  // Initialize managers
  const filterEngine = React.useRef(new FilterEngine()).current
  const selectionManager = React.useRef(new SelectionManager(selectionMode)).current

  // Fetch data from data source
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const query: DataSourceQuery = {
        pagination: enablePagination ? {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        } : undefined,
        sorting: enableSorting ? sorting : undefined,
        filters: enableFiltering ? columnFilters : undefined,
        globalFilter: enableGlobalFilter ? globalFilter : undefined,
      }

      const response = await dataSource.fetch(query)
      setData(response.data || [])
      setTotalCount(response.totalCount || response.total || 0)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
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
  ])

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // TanStack Table instance with dynamic columns
  const table = useReactTable({
    // Data
    data,
    columns, // Dynamic columns passed as prop
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
  })

  // Handle export
  const handleExport = async (format: string) => {
    setIsExporting(true)
    try {
      // Export logic here
      onDataExport?.(format)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle density change
  const handleDensityChange = (newDensity: DensityState) => {
    setCurrentDensity(newDensity)
  }

  // Default renderers
  const defaultRenderLoading = () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )

  const defaultRenderError = (err: Error) => (
    <div className="flex items-center justify-center p-8">
      <div className="text-destructive">Error: {err.message}</div>
    </div>
  )

  const defaultRenderEmpty = () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">No data available</div>
    </div>
  )

  // Render loading state
  if (loading && !data.length) {
    return (renderLoading || defaultRenderLoading)()
  }

  // Render error state
  if (error && !data.length) {
    return (renderError || defaultRenderError)(error)
  }

  // Render empty state
  if (!data.length && !loading) {
    return (renderEmpty || defaultRenderEmpty)()
  }

  return (
    <div ref={ref} className={cn("space-y-4", containerClassName)}>
      {/* Toolbar */}
      {renderToolbar ? (
        renderToolbar(table)
      ) : (
        <DataTableToolbar
          table={table}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnFiltering={enableColumnFiltering}
          enableExport={enableExport}
          enableDensity={enableDensity}
          currentDensity={currentDensity}
          onExport={handleExport}
          onDensityChange={handleDensityChange}
          isExporting={isExporting}
        />
      )}

      {/* Table with dynamic columns */}
      <div
        className="rounded-md border"
        style={getTablePinningStyles(table)}
      >
        <Table density={density} variant={variant} className={className}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={getColumnPinningStyles(header.column, table)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}