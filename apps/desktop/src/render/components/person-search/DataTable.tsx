import React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Table as TableType,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/render/components/ui/table';
import { useSelection } from '@/render/contexts/SelectionContext';
import { personToSelectableItem } from '@/render/components/selector/integration/person/person-selector.adapter';
import { PersonModel } from '@cbdb/core';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  multiSelectEnabled?: boolean;
  onViewDetails?: (person: PersonModel) => void;
  isLoading?: boolean;
  onTableReady?: (table: TableType<TData>) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  multiSelectEnabled = false,
  onViewDetails,
  isLoading,
  onTableReady,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
  const { select } = useSelection();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({
    // Hide less important columns by default
    surname: false,
    surnameChn: false,
    mingzi: false,
    ethnicity: false,
    choronym: false,
    householdStatus: false,
    indexYear: false,
    indexAddress: false,
    notes: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  // Use controlled visibility if provided, otherwise use internal state
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility = onColumnVisibilityChange ?? setInternalColumnVisibility;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onViewDetails,
      onAddToSelector: (person: PersonModel) => {
        const item = personToSelectableItem(person, 'search');
        select(item, 'toggle');
      },
    },
  });

  // Notify parent when table is ready
  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, onTableReady, columnVisibility]);

  // Handle row click for single-select mode
  const handleRowClick = (person: PersonModel) => {
    if (!multiSelectEnabled) {
      const item = personToSelectableItem(person, 'search');
      select(item, 'replace');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-sm text-muted-foreground">No results found</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 min-w-0">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={!multiSelectEnabled ? 'cursor-pointer' : ''}
                  onClick={() => {
                    if (!multiSelectEnabled) {
                      handleRowClick(row.original as PersonModel);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {multiSelectEnabled && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
      )}
    </div>
  );
}