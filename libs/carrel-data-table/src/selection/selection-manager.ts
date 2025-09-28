/**
 * Selection Manager - Handle all selection logic
 * Supports row, cell, and range selection
 */

import type { SelectionMode, CellSelectionState } from '../types/table.types';

/**
 * Selection event types
 */
export type SelectionEvent = MouseEvent | KeyboardEvent;

/**
 * Selection range
 */
export interface SelectionRange {
  start: { row: number; column: number };
  end: { row: number; column: number };
}

/**
 * Selection manager class
 */
export class SelectionManager<T = any> {
  private mode: SelectionMode = 'multi';
  private selectedRows: Set<string> = new Set();
  private selectedCells: Set<string> = new Set();
  private lastSelectedRow: string | null = null;
  private lastSelectedCell: string | null = null;
  private anchorCell: string | null = null;

  constructor(mode: SelectionMode = 'multi') {
    this.mode = mode;
  }

  /**
   * Set selection mode
   */
  setMode(mode: SelectionMode): void {
    this.mode = mode;
    // Clear selection when changing modes
    this.clearAll();
  }

  /**
   * Get selection mode
   */
  getMode(): SelectionMode {
    return this.mode;
  }

  /**
   * Handle row selection
   */
  selectRow(
    rowId: string,
    event?: SelectionEvent,
    allRowIds?: string[]
  ): void {
    if (this.mode === 'none') return;

    const isMultiSelect = event && (event.ctrlKey || event.metaKey);
    const isRangeSelect = event && event.shiftKey;

    if (this.mode === 'single') {
      // Single selection mode
      this.selectedRows.clear();
      this.selectedRows.add(rowId);
      this.lastSelectedRow = rowId;
    } else if (this.mode === 'multi') {
      if (isRangeSelect && this.lastSelectedRow && allRowIds) {
        // Range selection
        this.selectRowRange(this.lastSelectedRow, rowId, allRowIds);
      } else if (isMultiSelect) {
        // Toggle selection
        if (this.selectedRows.has(rowId)) {
          this.selectedRows.delete(rowId);
        } else {
          this.selectedRows.add(rowId);
        }
        this.lastSelectedRow = rowId;
      } else {
        // Single click - replace selection
        this.selectedRows.clear();
        this.selectedRows.add(rowId);
        this.lastSelectedRow = rowId;
      }
    }
  }

  /**
   * Select row range
   */
  private selectRowRange(
    startRowId: string,
    endRowId: string,
    allRowIds: string[]
  ): void {
    const startIndex = allRowIds.indexOf(startRowId);
    const endIndex = allRowIds.indexOf(endRowId);

    if (startIndex === -1 || endIndex === -1) return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    for (let i = minIndex; i <= maxIndex; i++) {
      this.selectedRows.add(allRowIds[i]);
    }
  }

  /**
   * Toggle row selection
   */
  toggleRow(rowId: string): void {
    if (this.mode === 'none') return;

    if (this.selectedRows.has(rowId)) {
      this.selectedRows.delete(rowId);
    } else {
      if (this.mode === 'single') {
        this.selectedRows.clear();
      }
      this.selectedRows.add(rowId);
    }
    this.lastSelectedRow = rowId;
  }

  /**
   * Select all rows
   */
  selectAll(rowIds: string[]): void {
    if (this.mode === 'none' || this.mode === 'single') return;

    this.selectedRows.clear();
    rowIds.forEach(id => this.selectedRows.add(id));
  }

  /**
   * Clear row selection
   */
  clearRows(): void {
    this.selectedRows.clear();
    this.lastSelectedRow = null;
  }

  /**
   * Check if row is selected
   */
  isRowSelected(rowId: string): boolean {
    return this.selectedRows.has(rowId);
  }

  /**
   * Get selected row IDs
   */
  getSelectedRows(): string[] {
    return Array.from(this.selectedRows);
  }

  /**
   * Get selected row count
   */
  getSelectedRowCount(): number {
    return this.selectedRows.size;
  }

  /**
   * Handle cell selection
   */
  selectCell(
    cellId: string,
    event?: SelectionEvent,
    allCellIds?: string[][]
  ): void {
    if (this.mode !== 'cell' && this.mode !== 'range') return;

    const isMultiSelect = event && (event.ctrlKey || event.metaKey);
    const isRangeSelect = event && event.shiftKey;

    if (this.mode === 'cell') {
      if (isMultiSelect) {
        // Toggle cell selection
        if (this.selectedCells.has(cellId)) {
          this.selectedCells.delete(cellId);
        } else {
          this.selectedCells.add(cellId);
        }
      } else {
        // Single cell selection
        this.selectedCells.clear();
        this.selectedCells.add(cellId);
      }
      this.lastSelectedCell = cellId;
    } else if (this.mode === 'range') {
      if (isRangeSelect && this.anchorCell && allCellIds) {
        // Range selection
        this.selectCellRange(this.anchorCell, cellId, allCellIds);
      } else {
        // Set anchor for range selection
        this.selectedCells.clear();
        this.selectedCells.add(cellId);
        this.anchorCell = cellId;
        this.lastSelectedCell = cellId;
      }
    }
  }

  /**
   * Select cell range
   */
  private selectCellRange(
    startCellId: string,
    endCellId: string,
    allCellIds: string[][]
  ): void {
    // Parse cell IDs (format: "row:column")
    const [startRow, startCol] = startCellId.split(':').map(Number);
    const [endRow, endCol] = endCellId.split(':').map(Number);

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    this.selectedCells.clear();

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (allCellIds[row] && allCellIds[row][col]) {
          this.selectedCells.add(allCellIds[row][col]);
        }
      }
    }
  }

  /**
   * Clear cell selection
   */
  clearCells(): void {
    this.selectedCells.clear();
    this.lastSelectedCell = null;
    this.anchorCell = null;
  }

  /**
   * Check if cell is selected
   */
  isCellSelected(cellId: string): boolean {
    return this.selectedCells.has(cellId);
  }

  /**
   * Get selected cell IDs
   */
  getSelectedCells(): string[] {
    return Array.from(this.selectedCells);
  }

  /**
   * Get cell selection state
   */
  getCellSelectionState(): CellSelectionState {
    return {
      selectedCells: new Set(this.selectedCells),
      anchorCell: this.anchorCell,
      rangeEnd: this.lastSelectedCell,
    };
  }

  /**
   * Clear all selection
   */
  clearAll(): void {
    this.clearRows();
    this.clearCells();
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboard(event: KeyboardEvent, currentPosition: { row: number; column: number }): void {
    const { key, shiftKey, ctrlKey, metaKey } = event;
    const isSelectMode = shiftKey;
    const isMultiSelect = ctrlKey || metaKey;

    switch (key) {
      case 'ArrowUp':
        this.navigate('up', currentPosition, isSelectMode);
        break;
      case 'ArrowDown':
        this.navigate('down', currentPosition, isSelectMode);
        break;
      case 'ArrowLeft':
        this.navigate('left', currentPosition, isSelectMode);
        break;
      case 'ArrowRight':
        this.navigate('right', currentPosition, isSelectMode);
        break;
      case 'Home':
        this.navigate('home', currentPosition, isSelectMode);
        break;
      case 'End':
        this.navigate('end', currentPosition, isSelectMode);
        break;
      case 'PageUp':
        this.navigate('pageUp', currentPosition, isSelectMode);
        break;
      case 'PageDown':
        this.navigate('pageDown', currentPosition, isSelectMode);
        break;
      case 'a':
      case 'A':
        if (isMultiSelect) {
          // Select all (Ctrl+A)
          event.preventDefault();
          // This would need access to all row/cell IDs
        }
        break;
      case 'Escape':
        // Clear selection
        this.clearAll();
        break;
    }
  }

  /**
   * Navigate and optionally select
   */
  private navigate(
    direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageUp' | 'pageDown',
    currentPosition: { row: number; column: number },
    select: boolean
  ): void {
    // This would need to be implemented based on table structure
    // For now, just a placeholder
    console.log('Navigate:', direction, currentPosition, select);
  }

  /**
   * Get selection summary
   */
  getSelectionSummary(): {
    mode: SelectionMode;
    rowCount: number;
    cellCount: number;
    hasSelection: boolean;
  } {
    return {
      mode: this.mode,
      rowCount: this.selectedRows.size,
      cellCount: this.selectedCells.size,
      hasSelection: this.selectedRows.size > 0 || this.selectedCells.size > 0,
    };
  }

  /**
   * Serialize selection state
   */
  serialize(): string {
    return JSON.stringify({
      mode: this.mode,
      selectedRows: Array.from(this.selectedRows),
      selectedCells: Array.from(this.selectedCells),
      lastSelectedRow: this.lastSelectedRow,
      lastSelectedCell: this.lastSelectedCell,
      anchorCell: this.anchorCell,
    });
  }

  /**
   * Deserialize selection state
   */
  deserialize(state: string): void {
    try {
      const parsed = JSON.parse(state);
      this.mode = parsed.mode || 'multi';
      this.selectedRows = new Set(parsed.selectedRows || []);
      this.selectedCells = new Set(parsed.selectedCells || []);
      this.lastSelectedRow = parsed.lastSelectedRow || null;
      this.lastSelectedCell = parsed.lastSelectedCell || null;
      this.anchorCell = parsed.anchorCell || null;
    } catch (error) {
      console.error('Failed to deserialize selection state:', error);
    }
  }
}

// Default selection manager instance
export const defaultSelectionManager = new SelectionManager();