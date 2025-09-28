import * as React from 'react'
import { type Table } from '@tanstack/react-table'
import { cn } from '../lib/utils'
import type { DensityState } from '@carrel-data-table/core'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  enableGlobalFilter?: boolean
  enableColumnFiltering?: boolean
  enableExport?: boolean
  enableDensity?: boolean
  currentDensity?: DensityState
  onExport?: (format: string) => void
  onDensityChange?: (density: DensityState) => void
  isExporting?: boolean
  className?: string
}

export function DataTableToolbar<TData>({
  table,
  enableGlobalFilter = true,
  enableColumnFiltering = true,
  enableExport = true,
  enableDensity = true,
  currentDensity = 'normal',
  onExport,
  onDensityChange,
  isExporting = false,
  className,
}: DataTableToolbarProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("flex items-center justify-between space-x-2 pb-4", className)}>
      <div className="flex flex-1 items-center space-x-2">
        {enableGlobalFilter && (
          <input
            type="text"
            placeholder="Search..."
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="max-w-sm pl-8 h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Column visibility */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Columns
          </button>
          {isOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md">
              <div className="p-2">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={() => column.toggleVisibility()}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{column.id}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Export */}
        {enableExport && (
          <button
            disabled={isExporting}
            onClick={() => onExport?.('csv')}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        )}

        {/* Density */}
        {enableDensity && (
          <select
            value={currentDensity}
            onChange={(e) => onDensityChange?.(e.target.value as DensityState)}
            className="h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="comfortable">Comfortable</option>
          </select>
        )}

        {/* Settings */}
        <button
          onClick={() => {
            table.resetColumnFilters()
            table.resetSorting()
            table.resetRowSelection()
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}