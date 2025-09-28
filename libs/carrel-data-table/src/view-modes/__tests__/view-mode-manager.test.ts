/**
 * ViewModeManager Tests
 * Testing view mode management and configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ViewModeManager,
  createViewModeManager,
  VIEW_MODE_PRESETS,
  type ViewMode,
  type ViewModeConfig,
} from '../view-mode-manager';

describe('ViewModeManager', () => {
  let manager: ViewModeManager;

  beforeEach(() => {
    manager = new ViewModeManager();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(manager.getCurrentMode()).toBe('table');
      expect(manager.getAvailableModes()).toEqual(['table', 'card', 'list', 'grid']);
      expect(manager.isModEnabled('table')).toBe(true);
    });

    it('should initialize with custom config', () => {
      const customManager = new ViewModeManager({
        defaultMode: 'card',
        availableModes: ['card', 'list'],
      });

      expect(customManager.getCurrentMode()).toBe('card');
      expect(customManager.getAvailableModes()).toEqual(['card', 'list']);
      expect(customManager.isModEnabled('grid')).toBe(false);
    });

    it('should use factory function to create manager', () => {
      const factoryManager = createViewModeManager({
        defaultMode: 'grid',
      });

      expect(factoryManager.getCurrentMode()).toBe('grid');
    });
  });

  describe('Mode management', () => {
    it('should set valid mode', () => {
      manager.setMode('card');
      expect(manager.getCurrentMode()).toBe('card');

      manager.setMode('list');
      expect(manager.getCurrentMode()).toBe('list');
    });

    it('should not set disabled mode', () => {
      const customManager = new ViewModeManager({
        availableModes: ['table', 'card'],
      });

      customManager.setMode('grid');
      expect(customManager.getCurrentMode()).toBe('table'); // Should remain at default
    });

    it('should check if mode is enabled', () => {
      expect(manager.isModEnabled('table')).toBe(true);
      expect(manager.isModEnabled('card')).toBe(true);
      expect(manager.isModEnabled('timeline' as ViewMode)).toBe(false);
    });
  });

  describe('Responsive behavior', () => {
    it('should update viewport and auto-switch mode', () => {
      const responsiveManager = new ViewModeManager({
        defaultMode: 'table',
        responsive: {
          breakpoints: {
            sm: 640,
            md: 768,
            lg: 1024,
          },
          modesByBreakpoint: {
            sm: 'list',
            md: 'card',
            lg: 'table',
          },
        },
        availableModes: ['table', 'card', 'list'],
      });

      // Small screen
      responsiveManager.updateViewport(500);
      expect(responsiveManager.getCurrentMode()).toBe('list');

      // Medium screen
      responsiveManager.updateViewport(700);
      expect(responsiveManager.getCurrentMode()).toBe('card');

      // Large screen
      responsiveManager.updateViewport(1100);
      expect(responsiveManager.getCurrentMode()).toBe('table');
    });

    it('should handle responsive values', () => {
      const responsiveManager = new ViewModeManager({
        responsive: {
          breakpoints: {
            sm: 640,
            md: 768,
            lg: 1024,
          },
        },
        cardConfig: {
          columnsPerRow: {
            sm: 1,
            md: 2,
            lg: 3,
          },
        },
      });

      responsiveManager.updateViewport(500);
      const smValue = responsiveManager.getResponsiveValue(
        responsiveManager['config'].cardConfig!.columnsPerRow!
      );
      expect(smValue).toBe(1);

      responsiveManager.updateViewport(800);
      const mdValue = responsiveManager.getResponsiveValue(
        responsiveManager['config'].cardConfig!.columnsPerRow!
      );
      expect(mdValue).toBe(2);

      responsiveManager.updateViewport(1200);
      const lgValue = responsiveManager.getResponsiveValue(
        responsiveManager['config'].cardConfig!.columnsPerRow!
      );
      expect(lgValue).toBe(3);
    });

    it('should handle non-responsive values', () => {
      const value = manager.getResponsiveValue(5);
      expect(value).toBe(5);

      const stringValue = manager.getResponsiveValue('test');
      expect(stringValue).toBe('test');
    });
  });

  describe('Layout configurations', () => {
    describe('Card layout', () => {
      it('should get card layout config', () => {
        const cardManager = new ViewModeManager({
          cardConfig: {
            columnsPerRow: 4,
            spacing: 20,
            aspectRatio: '4/3',
            cardStyle: 'compact',
          },
        });

        cardManager.setMode('card');
        const config = cardManager.getLayoutConfig();

        expect(config.columnsPerRow).toBe(4);
        expect(config.spacing).toBe(20);
        expect(config.aspectRatio).toBe('4/3');
        expect(config.cardStyle).toBe('compact');
      });

      it('should use default card config', () => {
        manager.setMode('card');
        const config = manager.getLayoutConfig();

        expect(config.columnsPerRow).toBe(3);
        expect(config.spacing).toBe(16);
        expect(config.aspectRatio).toBe('16/9');
        expect(config.cardStyle).toBe('default');
      });
    });

    describe('List layout', () => {
      it('should get list layout config', () => {
        const listManager = new ViewModeManager({
          listConfig: {
            showAvatar: true,
            density: 'compact',
            showDividers: false,
          },
        });

        listManager.setMode('list');
        const config = listManager.getLayoutConfig();

        expect(config.showAvatar).toBe(true);
        expect(config.density).toBe('compact');
        expect(config.showDividers).toBe(false);
      });
    });

    describe('Grid layout', () => {
      it('should get grid layout config', () => {
        const gridManager = new ViewModeManager({
          gridConfig: {
            columns: 5,
            gap: '24px',
            autoFit: false,
            enableMasonry: true,
          },
        });

        gridManager.setMode('grid');
        const config = gridManager.getLayoutConfig();

        expect(config.columns).toBe(5);
        expect(config.gap).toBe('24px');
        expect(config.autoFit).toBe(false);
        expect(config.enableMasonry).toBe(true);
      });

      it('should generate grid template', () => {
        manager.setMode('grid');
        const template = manager.getGridTemplate();
        expect(template).toBe('repeat(auto-fit, minmax(200px, 1fr))');
      });

      it('should generate fixed grid template when autoFit is false', () => {
        const gridManager = new ViewModeManager({
          gridConfig: {
            columns: 3,
            autoFit: false,
          },
        });

        gridManager.setMode('grid');
        const template = gridManager.getGridTemplate();
        expect(template).toBe('repeat(3, 1fr)');
      });
    });

    describe('Timeline layout', () => {
      it('should get timeline layout config', () => {
        const timelineManager = new ViewModeManager({
          timelineConfig: {
            dateField: 'createdAt',
            orientation: 'horizontal',
            position: 'left',
          },
        });

        timelineManager.setMode('timeline');
        const config = timelineManager.getLayoutConfig();

        expect(config.dateField).toBe('createdAt');
        expect(config.orientation).toBe('horizontal');
        expect(config.position).toBe('left');
      });
    });
  });

  describe('Container and item styles', () => {
    it('should get table container styles', () => {
      manager.setMode('table');
      const styles = manager.getContainerStyles();
      expect(styles.position).toBe('relative');
      expect(styles.display).toBeUndefined();
    });

    it('should get card container styles', () => {
      manager.setMode('card');
      const styles = manager.getContainerStyles();

      expect(styles.display).toBe('grid');
      expect(styles.gridTemplateColumns).toBe('repeat(3, 1fr)');
      expect(styles.gap).toBe(16);
    });

    it('should get list container styles', () => {
      manager.setMode('list');
      const styles = manager.getContainerStyles();

      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('should get grid item styles', () => {
      manager.setMode('grid');
      const styles = manager.getItemStyles(0);

      expect(styles.aspectRatio).toBe('1/1');
    });

    it('should get timeline item styles with alternating position', () => {
      const timelineManager = new ViewModeManager({
        timelineConfig: {
          dateField: 'date',
          position: 'alternate',
        },
      });

      timelineManager.setMode('timeline');

      const evenStyles = timelineManager.getItemStyles(0);
      expect(evenStyles.alignSelf).toBe('flex-start');

      const oddStyles = timelineManager.getItemStyles(1);
      expect(oddStyles.alignSelf).toBe('flex-end');
    });
  });

  describe('Column visibility', () => {
    it('should determine header visibility', () => {
      manager.setMode('table');
      expect(manager.shouldShowHeaders()).toBe(true);

      manager.setMode('list');
      expect(manager.shouldShowHeaders()).toBe(false);

      manager.setMode('grid');
      expect(manager.shouldShowHeaders()).toBe(false);
    });

    it('should show headers for card mode if configured', () => {
      const cardManager = new ViewModeManager({
        cardConfig: {
          showHeader: true,
        },
      });

      cardManager.setMode('card');
      expect(cardManager.shouldShowHeaders()).toBe(true);
    });

    it('should filter columns for card view', () => {
      const columns = [
        { id: 'name' },
        { id: 'email' },
        { id: 'phone' },
        { id: 'address' },
      ] as any;

      const cardManager = new ViewModeManager({
        cardConfig: {
          fieldsToShow: ['name', 'email'],
        },
      });

      cardManager.setMode('card');
      const visibleColumns = cardManager.getVisibleColumns(columns);

      expect(visibleColumns).toHaveLength(2);
      expect(visibleColumns[0].id).toBe('name');
      expect(visibleColumns[1].id).toBe('email');
    });

    it('should filter columns for list view', () => {
      const columns = [
        { id: 'name' },
        { id: 'email' },
        { id: 'phone' },
      ] as any;

      const listManager = new ViewModeManager({
        listConfig: {
          primaryField: 'name',
          secondaryField: 'email',
        },
      });

      listManager.setMode('list');
      const visibleColumns = listManager.getVisibleColumns(columns);

      expect(visibleColumns).toHaveLength(2);
      expect(visibleColumns.find(c => c.id === 'name')).toBeDefined();
      expect(visibleColumns.find(c => c.id === 'email')).toBeDefined();
    });
  });

  describe('Transform to view items', () => {
    it('should transform rows to view items', () => {
      const mockRows = [
        {
          id: 'row1',
          original: { id: 1, name: 'Item 1' },
          getIsSelected: () => true,
          getIsExpanded: () => false,
          getAllCells: () => [
            { column: { id: 'name' }, getValue: () => 'Item 1' },
            { column: { id: 'id' }, getValue: () => 1 },
          ],
        },
        {
          id: 'row2',
          original: { id: 2, name: 'Item 2' },
          getIsSelected: () => false,
          getIsExpanded: () => true,
          getAllCells: () => [
            { column: { id: 'name' }, getValue: () => 'Item 2' },
            { column: { id: 'id' }, getValue: () => 2 },
          ],
        },
      ] as any;

      const viewItems = manager.transformToViewItems(mockRows);

      expect(viewItems).toHaveLength(2);
      expect(viewItems[0].id).toBe('row1');
      expect(viewItems[0].selected).toBe(true);
      expect(viewItems[0].expanded).toBe(false);
      expect(viewItems[0].metadata.name).toBe('Item 1');

      expect(viewItems[1].id).toBe('row2');
      expect(viewItems[1].selected).toBe(false);
      expect(viewItems[1].expanded).toBe(true);
      expect(viewItems[1].metadata.name).toBe('Item 2');
    });
  });

  describe('Presets', () => {
    it('should use default preset', () => {
      const presetManager = new ViewModeManager(VIEW_MODE_PRESETS.default);
      expect(presetManager.getCurrentMode()).toBe('table');
      expect(presetManager.getAvailableModes()).toEqual(['table', 'card', 'list', 'grid']);
    });

    it('should use card-only preset', () => {
      const presetManager = new ViewModeManager(VIEW_MODE_PRESETS.cardOnly);
      expect(presetManager.getCurrentMode()).toBe('card');
      expect(presetManager.getAvailableModes()).toEqual(['card']);
    });

    it('should use responsive preset', () => {
      const presetManager = new ViewModeManager(VIEW_MODE_PRESETS.responsive);
      expect(presetManager.getCurrentMode()).toBe('table');
      expect(presetManager.getAvailableModes()).toEqual(['table', 'card', 'list']);

      presetManager.updateViewport(600);
      expect(presetManager.getCurrentMode()).toBe('list');
    });

    it('should use gallery preset', () => {
      const presetManager = new ViewModeManager(VIEW_MODE_PRESETS.gallery);
      expect(presetManager.getCurrentMode()).toBe('grid');
      expect(presetManager.getAvailableModes()).toEqual(['grid']);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty available modes', () => {
      const emptyManager = new ViewModeManager({
        availableModes: [],
      });

      expect(emptyManager.isModEnabled('table')).toBe(false);
      emptyManager.setMode('table');
      expect(emptyManager.getCurrentMode()).toBe('table'); // Remains at default
    });

    it('should handle invalid mode in setMode', () => {
      manager.setMode('invalid' as ViewMode);
      expect(manager.getCurrentMode()).toBe('table'); // Should remain unchanged
    });

    it('should handle missing breakpoint configuration', () => {
      const noBreakpointManager = new ViewModeManager({
        responsive: {
          breakpoints: {},
          modesByBreakpoint: {
            sm: 'list',
          },
        },
        availableModes: ['table', 'list'],
      });

      noBreakpointManager.updateViewport(500);
      expect(noBreakpointManager.getCurrentMode()).toBe('table'); // Should remain at default
    });

    it('should return empty string for non-grid mode template', () => {
      manager.setMode('table');
      expect(manager.getGridTemplate()).toBe('');
    });

    it('should handle empty columns array for filtering', () => {
      manager.setMode('card');
      const visibleColumns = manager.getVisibleColumns([]);
      expect(visibleColumns).toEqual([]);
    });
  });
});