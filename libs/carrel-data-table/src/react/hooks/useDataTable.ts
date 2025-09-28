import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  type ColumnDef,
  type Table,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  type ExpandedState,
  type GroupingState,
  type RowSelectionState,
  type VisibilityState,
  type ColumnPinningState,
} from '@tanstack/react-table'

import type {
  DataSource,
  DataSourceQuery,
  SelectionMode,
} from '@carrel-data-table/core'

/**
 * Options for useDataTable hook
 */
export interface UseDataTableOptions<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  dataSource: DataSource<TData>

  // Features
  enableSorting?: boolean
  enableFiltering?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableExpanding?: boolean
  enableGrouping?: boolean
  enableColumnVisibility?: boolean
  enableColumnPinning?: boolean

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

  // Callbacks
  onDataChange?: (data: TData[]) => void
  onLoadingChange?: (loading: boolean) => void
  onErrorChange?: (error: Error | null) => void
}

/**
 * Return type for useDataTable hook
 */
export interface UseDataTableResult<TData> {
  table: Table<TData>
  data: TData[]
  loading: boolean
  error: Error | null
  totalCount: number
  refetch: () => Promise<void>
}

/**
 * Main hook for data table functionality
 */
export function useDataTable<TData, TValue = unknown>(
  options: UseDataTableOptions<TData, TValue>
): UseDataTableResult<TData> {
  const {
    columns,
    dataSource,

    // Features
    enableSorting = true,
    enableFiltering = true,
    enableGlobalFilter = true,
    enablePagination = true,
    enableRowSelection = false,
    enableExpanding = false,
    enableGrouping = false,

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

    // Callbacks
    onDataChange,
    onLoadingChange,
    onErrorChange,
  } = options

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

  // Fetch data from data source
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    onLoadingChange?.(true)
    onErrorChange?.(null)

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
      setData(response.data)
      setTotalCount(response.totalCount)
      onDataChange?.(response.data)
    } catch (err) {
      const error = err as Error
      setError(error)
      onErrorChange?.(error)
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
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
    onDataChange,
    onLoadingChange,
    onErrorChange,
  ])

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Create TanStack Table instance
  const table = useReactTable({
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
    },

    // State handlers
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,

    // Options
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: selectionMode === 'multi',
    enableSubRowSelection: enableExpanding,
    enableGlobalFilter: enableGlobalFilter,
  })

  return {
    table,
    data,
    loading,
    error,
    totalCount,
    refetch: fetchData,
  }
}