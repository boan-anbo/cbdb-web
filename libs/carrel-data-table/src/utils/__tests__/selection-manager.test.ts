/**
 * SelectionManager Tests
 * Testing all selection modes and manager functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SelectionManager } from '../selection-manager';
import type { SelectionMode, SelectionEvent } from '../../types/table.types';

describe('SelectionManager', () => {
  let manager: SelectionManager;

  beforeEach(() => {
    manager = new SelectionManager('multi');
  });

  describe('Mode management', () => {
    it('should initialize with correct mode', () => {
      expect(manager.getMode()).toBe('multi');

      const singleManager = new SelectionManager('single');
      expect(singleManager.getMode()).toBe('single');
    });

    it('should change selection mode', () => {
      manager.setMode('single');
      expect(manager.getMode()).toBe('single');

      manager.setMode('none');
      expect(manager.getMode()).toBe('none');
    });

    it('should clear selections when switching from multi to single', () => {
      manager.selectRow('row1');
      manager.selectRow('row2');
      expect(manager.getSelectedRows()).toHaveLength(2);

      manager.setMode('single');
      expect(manager.getSelectedRows()).toHaveLength(0);
    });
  });

  describe('Row selection', () => {
    describe('Single selection mode', () => {
      beforeEach(() => {
        manager.setMode('single');
      });

      it('should select a single row', () => {
        manager.selectRow('row1');
        expect(manager.getSelectedRows()).toEqual(['row1']);
        expect(manager.isRowSelected('row1')).toBe(true);
      });

      it('should replace selection when selecting another row', () => {
        manager.selectRow('row1');
        manager.selectRow('row2');

        expect(manager.getSelectedRows()).toEqual(['row2']);
        expect(manager.isRowSelected('row1')).toBe(false);
        expect(manager.isRowSelected('row2')).toBe(true);
      });

      it('should toggle row selection', () => {
        manager.toggleRow('row1');
        expect(manager.isRowSelected('row1')).toBe(true);

        manager.toggleRow('row1');
        expect(manager.isRowSelected('row1')).toBe(false);
      });
    });

    describe('Multi selection mode', () => {
      it('should select multiple rows', () => {
        manager.selectRow('row1');
        manager.selectRow('row2');
        manager.selectRow('row3');

        expect(manager.getSelectedRows()).toEqual(['row1', 'row2', 'row3']);
        expect(manager.isRowSelected('row1')).toBe(true);
        expect(manager.isRowSelected('row2')).toBe(true);
        expect(manager.isRowSelected('row3')).toBe(true);
      });

      it('should deselect rows', () => {
        manager.selectRow('row1');
        manager.selectRow('row2');
        manager.deselectRow('row1');

        expect(manager.getSelectedRows()).toEqual(['row2']);
        expect(manager.isRowSelected('row1')).toBe(false);
        expect(manager.isRowSelected('row2')).toBe(true);
      });

      it('should handle shift-click for range selection', () => {
        const allRowIds = ['row1', 'row2', 'row3', 'row4', 'row5'];
        const event: SelectionEvent = {
          shiftKey: true,
          ctrlKey: false,
          metaKey: false,
        };

        manager.selectRow('row1');
        manager.selectRow('row4', event, allRowIds);

        expect(manager.getSelectedRows()).toEqual(['row1', 'row2', 'row3', 'row4']);
      });

      it('should handle ctrl-click for toggle selection', () => {
        const event: SelectionEvent = {
          shiftKey: false,
          ctrlKey: true,
          metaKey: false,
        };

        manager.selectRow('row1');
        manager.selectRow('row3', event);

        expect(manager.getSelectedRows()).toEqual(['row1', 'row3']);

        // Toggle off
        manager.selectRow('row1', event);
        expect(manager.getSelectedRows()).toEqual(['row3']);
      });

      it('should select all rows', () => {
        const allRowIds = ['row1', 'row2', 'row3'];
        manager.selectAll(allRowIds);

        expect(manager.getSelectedRows()).toEqual(allRowIds);
        expect(manager.isAllSelected(allRowIds)).toBe(true);
      });

      it('should clear all selections', () => {
        manager.selectRow('row1');
        manager.selectRow('row2');
        manager.clearAll();

        expect(manager.getSelectedRows()).toEqual([]);
        expect(manager.getSelectionCount()).toBe(0);
      });
    });

    describe('None selection mode', () => {
      beforeEach(() => {
        manager.setMode('none');
      });

      it('should not allow selection', () => {
        manager.selectRow('row1');
        expect(manager.getSelectedRows()).toEqual([]);
      });

      it('should not toggle selection', () => {
        manager.toggleRow('row1');
        expect(manager.isRowSelected('row1')).toBe(false);
      });
    });
  });

  describe('Cell selection', () => {
    beforeEach(() => {
      manager.setMode('cell');
    });

    it('should select individual cells', () => {
      manager.selectCell('row1:col1');
      manager.selectCell('row2:col2');

      expect(manager.getSelectedCells()).toEqual(['row1:col1', 'row2:col2']);
      expect(manager.isCellSelected('row1:col1')).toBe(true);
      expect(manager.isCellSelected('row2:col2')).toBe(true);
    });

    it('should deselect cells', () => {
      manager.selectCell('row1:col1');
      manager.selectCell('row2:col2');
      manager.deselectCell('row1:col1');

      expect(manager.getSelectedCells()).toEqual(['row2:col2']);
      expect(manager.isCellSelected('row1:col1')).toBe(false);
    });

    it('should toggle cell selection', () => {
      manager.toggleCell('row1:col1');
      expect(manager.isCellSelected('row1:col1')).toBe(true);

      manager.toggleCell('row1:col1');
      expect(manager.isCellSelected('row1:col1')).toBe(false);
    });

    it('should clear all cell selections', () => {
      manager.selectCell('row1:col1');
      manager.selectCell('row2:col2');
      manager.clearAllCells();

      expect(manager.getSelectedCells()).toEqual([]);
      expect(manager.getCellSelectionCount()).toBe(0);
    });
  });

  describe('Range selection', () => {
    beforeEach(() => {
      manager.setMode('range');
    });

    it('should select rectangular range of cells', () => {
      const allCellIds: string[][] = [
        ['row1:col1', 'row1:col2', 'row1:col3'],
        ['row2:col1', 'row2:col2', 'row2:col3'],
        ['row3:col1', 'row3:col2', 'row3:col3'],
      ];

      manager.selectRange('row1:col1', 'row2:col2', allCellIds);

      const selected = manager.getSelectedCells();
      expect(selected).toContain('row1:col1');
      expect(selected).toContain('row1:col2');
      expect(selected).toContain('row2:col1');
      expect(selected).toContain('row2:col2');
      expect(selected).toHaveLength(4);
    });

    it('should extend range with shift-click', () => {
      const allCellIds: string[][] = [
        ['row1:col1', 'row1:col2', 'row1:col3'],
        ['row2:col1', 'row2:col2', 'row2:col3'],
        ['row3:col1', 'row3:col2', 'row3:col3'],
      ];

      const event: SelectionEvent = {
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
      };

      manager.selectCell('row1:col1');
      manager.selectCell('row3:col3', event, allCellIds);

      expect(manager.getSelectedCells()).toHaveLength(9); // 3x3 grid
    });

    it('should get range bounds', () => {
      const allCellIds: string[][] = [
        ['row1:col1', 'row1:col2'],
        ['row2:col1', 'row2:col2'],
      ];

      manager.selectRange('row1:col1', 'row2:col2', allCellIds);

      const bounds = manager.getRangeBounds();
      expect(bounds).toEqual({
        startRow: 0,
        startCol: 0,
        endRow: 1,
        endCol: 1,
      });
    });
  });

  describe('Selection utilities', () => {
    it('should get selection count', () => {
      manager.selectRow('row1');
      manager.selectRow('row2');
      expect(manager.getSelectionCount()).toBe(2);
    });

    it('should check if any rows are selected', () => {
      expect(manager.hasSelection()).toBe(false);

      manager.selectRow('row1');
      expect(manager.hasSelection()).toBe(true);

      manager.clearAll();
      expect(manager.hasSelection()).toBe(false);
    });

    it('should check if some but not all rows are selected', () => {
      const allRowIds = ['row1', 'row2', 'row3'];

      manager.selectRow('row1');
      manager.selectRow('row2');

      expect(manager.isSomeSelected(allRowIds)).toBe(true);
      expect(manager.isAllSelected(allRowIds)).toBe(false);

      manager.selectRow('row3');
      expect(manager.isSomeSelected(allRowIds)).toBe(false);
      expect(manager.isAllSelected(allRowIds)).toBe(true);
    });

    it('should invert selection', () => {
      const allRowIds = ['row1', 'row2', 'row3'];

      manager.selectRow('row1');
      manager.invertSelection(allRowIds);

      expect(manager.getSelectedRows()).toEqual(['row2', 'row3']);
    });

    it('should get selection state', () => {
      manager.selectRow('row1');
      manager.selectRow('row2');
      manager.selectCell('row1:col1');

      const state = manager.getSelectionState();
      expect(state.mode).toBe('multi');
      expect(state.selectedRows).toEqual(['row1', 'row2']);
      expect(state.selectedCells).toEqual(['row1:col1']);
      expect(state.lastSelectedRow).toBe('row2');
    });

    it('should restore selection state', () => {
      const state = {
        mode: 'multi' as SelectionMode,
        selectedRows: ['row1', 'row3'],
        selectedCells: ['row2:col2'],
        lastSelectedRow: 'row3',
        lastSelectedCell: 'row2:col2',
        anchorRow: null,
        anchorCell: null,
      };

      manager.setSelectionState(state);

      expect(manager.getMode()).toBe('multi');
      expect(manager.getSelectedRows()).toEqual(['row1', 'row3']);
      expect(manager.getSelectedCells()).toEqual(['row2:col2']);
    });
  });

  describe('Edge cases', () => {
    it('should handle selecting the same row multiple times', () => {
      manager.selectRow('row1');
      manager.selectRow('row1');
      manager.selectRow('row1');

      expect(manager.getSelectedRows()).toEqual(['row1']);
      expect(manager.getSelectionCount()).toBe(1);
    });

    it('should handle deselecting non-selected rows', () => {
      manager.deselectRow('row1');
      expect(manager.getSelectedRows()).toEqual([]);
    });

    it('should handle empty row IDs array for selectAll', () => {
      manager.selectAll([]);
      expect(manager.getSelectedRows()).toEqual([]);
    });

    it('should handle malformed cell IDs', () => {
      manager.selectCell('invalid-cell-id');
      expect(manager.isCellSelected('invalid-cell-id')).toBe(true);

      manager.selectCell('');
      expect(manager.getSelectedCells()).toContain('');
    });

    it('should handle range selection with invalid bounds', () => {
      const allCellIds: string[][] = [];
      manager.selectRange('row1:col1', 'row2:col2', allCellIds);
      expect(manager.getSelectedCells()).toEqual([]);
    });

    it('should maintain selection integrity when switching modes', () => {
      // Start with multi selection
      manager.selectRow('row1');
      manager.selectRow('row2');
      expect(manager.getSelectedRows()).toHaveLength(2);

      // Switch to cell mode
      manager.setMode('cell');
      expect(manager.getSelectedRows()).toEqual([]);

      manager.selectCell('row1:col1');
      expect(manager.getSelectedCells()).toHaveLength(1);

      // Switch to range mode
      manager.setMode('range');
      expect(manager.getSelectedCells()).toHaveLength(1); // Cells preserved in range mode

      // Switch to none mode
      manager.setMode('none');
      expect(manager.getSelectedRows()).toEqual([]);
      expect(manager.getSelectedCells()).toEqual([]);
    });
  });
});