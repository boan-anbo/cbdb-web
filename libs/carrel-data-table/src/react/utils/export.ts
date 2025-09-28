import type { Table } from '@tanstack/react-table'

/**
 * Export formats
 */
export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf'

/**
 * Export options
 */
export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  visibleColumnsOnly?: boolean
  selectedRowsOnly?: boolean
  onProgress?: (progress: number) => void
}

/**
 * Export utilities for data table
 */
export class ExportUtils {
  /**
   * Export table data to CSV
   */
  static async exportToCSV<TData>(
    table: Table<TData>,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = `export-${Date.now()}.csv`,
      includeHeaders = true,
      visibleColumnsOnly = true,
      selectedRowsOnly = false,
      onProgress,
    } = options

    // Get columns to export
    const columns = visibleColumnsOnly
      ? table.getVisibleLeafColumns()
      : table.getAllLeafColumns()

    // Get rows to export
    const rows = selectedRowsOnly
      ? table.getSelectedRowModel().rows
      : table.getRowModel().rows

    const totalRows = rows.length
    let processedRows = 0

    // Build CSV content
    const csvRows: string[] = []

    // Add headers
    if (includeHeaders) {
      const headers = columns.map(col => {
        const header = col.columnDef.header
        if (typeof header === 'string') {
          return this.escapeCSV(header)
        }
        return this.escapeCSV(col.id)
      })
      csvRows.push(headers.join(','))
    }

    // Add data rows
    for (const row of rows) {
      const rowData = columns.map(col => {
        const value = row.getValue(col.id)
        return this.escapeCSV(this.formatValue(value))
      })
      csvRows.push(rowData.join(','))

      processedRows++
      if (onProgress) {
        onProgress((processedRows / totalRows) * 100)
      }
    }

    // Create and download CSV file
    const csvContent = csvRows.join('\n')
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
  }

  /**
   * Export table data to JSON
   */
  static async exportToJSON<TData>(
    table: Table<TData>,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = `export-${Date.now()}.json`,
      visibleColumnsOnly = true,
      selectedRowsOnly = false,
      onProgress,
    } = options

    // Get columns to export
    const columns = visibleColumnsOnly
      ? table.getVisibleLeafColumns()
      : table.getAllLeafColumns()

    // Get rows to export
    const rows = selectedRowsOnly
      ? table.getSelectedRowModel().rows
      : table.getRowModel().rows

    const totalRows = rows.length
    let processedRows = 0

    // Build JSON data
    const jsonData = rows.map(row => {
      const rowObject: Record<string, any> = {}

      columns.forEach(col => {
        rowObject[col.id] = row.getValue(col.id)
      })

      processedRows++
      if (onProgress) {
        onProgress((processedRows / totalRows) * 100)
      }

      return rowObject
    })

    // Create and download JSON file
    const jsonContent = JSON.stringify(jsonData, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  /**
   * Export table data (main entry point)
   */
  static async export<TData>(
    table: Table<TData>,
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<void> {
    switch (format) {
      case 'csv':
        return this.exportToCSV(table, options)
      case 'json':
        return this.exportToJSON(table, options)
      case 'excel':
        throw new Error('Excel export not yet implemented')
      case 'pdf':
        throw new Error('PDF export not yet implemented')
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Escape CSV value
   */
  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * Format value for export
   */
  private static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  /**
   * Download file
   */
  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  /**
   * Get export filename with timestamp
   */
  static getFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `${prefix}-${timestamp}.${extension}`
  }
}

/**
 * Custom export function type
 */
export type CustomExporter<TData> = (
  table: Table<TData>,
  options: ExportOptions
) => Promise<void>

/**
 * Export registry for custom exporters
 */
export class ExportRegistry<TData> {
  private exporters = new Map<string, CustomExporter<TData>>()

  /**
   * Register custom exporter
   */
  register(format: string, exporter: CustomExporter<TData>): void {
    this.exporters.set(format, exporter)
  }

  /**
   * Get exporter for format
   */
  get(format: string): CustomExporter<TData> | undefined {
    return this.exporters.get(format)
  }

  /**
   * Check if format is registered
   */
  has(format: string): boolean {
    return this.exporters.has(format)
  }

  /**
   * Export using registered exporter
   */
  async export(
    table: Table<TData>,
    format: string,
    options: ExportOptions = {}
  ): Promise<void> {
    const exporter = this.get(format)

    if (!exporter) {
      // Fall back to built-in exporters
      return ExportUtils.export(table, format as ExportFormat, options)
    }

    return exporter(table, options)
  }
}