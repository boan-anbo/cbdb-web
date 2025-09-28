/**
 * Export Feature - Export table data to various formats
 * Using TanStack Table v8.14+ custom features API
 */

import type { TableFeature as TanstackTableFeature, Table, RowData } from '@tanstack/table-core';
import type { ExportFormat, DataSource } from '../types/table.types';

/**
 * Export feature state
 */
export interface ExportTableState {
  isExporting: boolean;
  exportProgress?: number;
}

/**
 * Export feature options
 */
export interface ExportOptions {
  enableExport?: boolean;
  exportFormats?: ExportFormat[];
  maxExportRows?: number;
  exportFilename?: string | ((date: Date) => string);
  onExportStart?: () => void;
  onExportComplete?: (format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
}

/**
 * Export feature instance methods
 */
export interface ExportInstance {
  exportData: (format: ExportFormat, options?: ExportDataOptions) => Promise<void>;
  cancelExport: () => void;
  getIsExporting: () => boolean;
  getExportProgress: () => number | undefined;
  getSupportedExportFormats: () => ExportFormat[];
}

/**
 * Export data options
 */
export interface ExportDataOptions {
  includeHeaders?: boolean;
  visibleColumnsOnly?: boolean;
  selectedRowsOnly?: boolean;
  customFilename?: string;
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends ExportTableState {}
  interface TableOptionsResolved<TData extends RowData> extends ExportOptions {}
  interface Table<TData extends RowData> extends ExportInstance {}
}

/**
 * Export Feature implementation
 */
export const ExportFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): ExportTableState => {
    return {
      isExporting: false,
      exportProgress: undefined,
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): ExportOptions => {
    return {
      enableExport: true,
      exportFormats: ['csv', 'json', 'excel'],
      maxExportRows: 10000,
      exportFilename: (date) => `table-export-${date.toISOString().split('T')[0]}`,
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    let abortController: AbortController | null = null;

    // Export data
    table.exportData = async (format: ExportFormat, options?: ExportDataOptions) => {
      const {
        includeHeaders = true,
        visibleColumnsOnly = true,
        selectedRowsOnly = false,
        customFilename,
      } = options || {};

      const {
        exportFormats = ['csv', 'json'],
        maxExportRows = 10000,
        exportFilename,
        onExportStart,
        onExportComplete,
        onExportError,
      } = table.options;

      // Check if format is supported
      if (!exportFormats.includes(format)) {
        throw new Error(`Export format ${format} is not supported`);
      }

      // Set exporting state
      table.setState((old) => ({
        ...old,
        isExporting: true,
        exportProgress: 0,
      }));

      // Call start handler
      onExportStart?.();

      try {
        // Create abort controller
        abortController = new AbortController();

        // Get data to export
        let dataToExport: any[] = [];
        let columns = table.getAllColumns();

        // Filter columns if needed
        if (visibleColumnsOnly) {
          columns = columns.filter((col) => col.getIsVisible());
        }

        // Get rows to export
        if (selectedRowsOnly) {
          const selectedRows = table.getSelectedRowModel().rows;
          dataToExport = selectedRows.map((row) => row.original);
        } else {
          // Try to get from data source if available
          const dataSource = (table.options as any).dataSource as DataSource<TData>;

          if (dataSource?.export) {
            // Use data source export
            const blob = await dataSource.export(
              {
                filters: table.getState().columnFilters as any,
                sorting: table.getState().sorting,
                globalFilter: table.getState().globalFilter,
              },
              format
            );

            // Download the blob
            downloadBlob(blob, getFilename(format, customFilename, exportFilename));

            // Complete
            table.setState((old) => ({
              ...old,
              isExporting: false,
              exportProgress: undefined,
            }));

            onExportComplete?.(format);
            return;
          } else {
            // Use current table data
            dataToExport = table.getFilteredRowModel().rows
              .slice(0, maxExportRows)
              .map((row) => row.original);
          }
        }

        // Check abort
        if (abortController.signal.aborted) {
          throw new Error('Export cancelled');
        }

        // Convert data based on format
        const blob = await convertDataToFormat(
          dataToExport,
          columns,
          format,
          includeHeaders
        );

        // Download the blob
        downloadBlob(blob, getFilename(format, customFilename, exportFilename));

        // Complete
        table.setState((old) => ({
          ...old,
          isExporting: false,
          exportProgress: undefined,
        }));

        onExportComplete?.(format);
      } catch (error) {
        // Handle error
        table.setState((old) => ({
          ...old,
          isExporting: false,
          exportProgress: undefined,
        }));

        onExportError?.(error as Error);
        throw error;
      } finally {
        abortController = null;
      }
    };

    // Cancel export
    table.cancelExport = () => {
      if (abortController) {
        abortController.abort();
        table.setState((old) => ({
          ...old,
          isExporting: false,
          exportProgress: undefined,
        }));
      }
    };

    // Get export state
    table.getIsExporting = () => {
      return table.getState().isExporting;
    };

    table.getExportProgress = () => {
      return table.getState().exportProgress;
    };

    table.getSupportedExportFormats = () => {
      return table.options.exportFormats || ['csv', 'json'];
    };
  },
};

/**
 * Convert data to specific format
 */
async function convertDataToFormat(
  data: any[],
  columns: any[],
  format: ExportFormat,
  includeHeaders: boolean
): Promise<Blob> {
  switch (format) {
    case 'csv':
      return convertToCSV(data, columns, includeHeaders);
    case 'json':
      return convertToJSON(data);
    case 'excel':
      // For excel, we'd need a library like SheetJS
      throw new Error('Excel export not yet implemented');
    case 'pdf':
      // For PDF, we'd need a library like jsPDF
      throw new Error('PDF export not yet implemented');
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Convert to CSV
 */
function convertToCSV(data: any[], columns: any[], includeHeaders: boolean): Blob {
  const rows: string[] = [];

  // Add headers
  if (includeHeaders) {
    const headers = columns
      .filter((col) => col.accessorKey || col.accessorFn)
      .map((col) => col.header || col.id || '');
    rows.push(headers.map(escapeCSV).join(','));
  }

  // Add data rows
  for (const item of data) {
    const row = columns
      .filter((col) => col.accessorKey || col.accessorFn)
      .map((col) => {
        const value = col.accessorKey ? item[col.accessorKey] : '';
        return escapeCSV(value);
      });
    rows.push(row.join(','));
  }

  return new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Convert to JSON
 */
function convertToJSON(data: any[]): Blob {
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
}

/**
 * Escape CSV value
 */
function escapeCSV(value: any): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get filename
 */
function getFilename(
  format: ExportFormat,
  customFilename?: string,
  exportFilename?: string | ((date: Date) => string)
): string {
  if (customFilename) {
    return customFilename;
  }

  const base = typeof exportFilename === 'function'
    ? exportFilename(new Date())
    : exportFilename || `export-${Date.now()}`;

  return `${base}.${format}`;
}