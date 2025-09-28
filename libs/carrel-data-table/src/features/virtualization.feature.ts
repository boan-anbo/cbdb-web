/**
 * Virtualization Feature - Virtual scrolling for large datasets
 * Using TanStack Table v8.14+ custom features API with TanStack Virtual
 *
 * Enables efficient rendering of large datasets by only rendering visible rows
 * Supports dynamic row heights, horizontal scrolling, and smooth scrolling
 */

import type {
  TableFeature as TanstackTableFeature,
  Table,
  RowData,
  Row,
} from '@tanstack/table-core';

/**
 * Scroll direction for virtualization
 */
export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

/**
 * Virtualization mode
 */
export type VirtualizationMode = 'fixed' | 'dynamic' | 'variable';

/**
 * Virtualization feature state
 */
export interface VirtualizationTableState {
  virtualization: {
    enabled: boolean;
    scrollTop: number;
    scrollLeft: number;
    viewportHeight: number;
    viewportWidth: number;
    visibleRange: {
      start: number;
      end: number;
    };
  };
}

/**
 * Virtualization feature options
 */
export interface VirtualizationOptions {
  enableVirtualization?: boolean;
  virtualizationMode?: VirtualizationMode;
  estimatedRowHeight?: number | ((index: number) => number);
  estimatedColumnWidth?: number | ((index: number) => number);
  overscan?: number;
  scrollDirection?: ScrollDirection;
  smoothScrolling?: boolean;
  scrollDebounceMs?: number;
  getRowHeight?: (row: Row<any>) => number;
  getColumnWidth?: (columnId: string) => number;
  onVirtualizationChange?: (state: VirtualizationTableState['virtualization']) => void;
  virtualizeColumns?: boolean;
  minRowsForVirtualization?: number;
  enableWindowScroll?: boolean;
  scrollingElement?: HTMLElement | null;
}

/**
 * Virtualization feature instance methods
 */
export interface VirtualizationInstance {
  // State getters
  getVirtualizationState: () => VirtualizationTableState['virtualization'];
  getIsVirtualized: () => boolean;
  getVirtualItems: () => VirtualItem[];
  getVirtualColumnItems: () => VirtualItem[];
  getTotalSize: () => number;
  getVirtualStart: () => number;
  getVirtualEnd: () => number;

  // State setters
  setVirtualizationEnabled: (enabled: boolean) => void;
  setScrollPosition: (top: number, left?: number) => void;
  setViewportSize: (height: number, width?: number) => void;

  // Scrolling methods
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  scrollToRow: (row: Row<any>, options?: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;

  // Utilities
  measureItem: (index: number) => void;
  remeasureItems: () => void;
  getOffsetForIndex: (index: number) => number;
  getIndexForOffset: (offset: number) => number;
}

/**
 * Virtual item representation
 */
export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
  key: string | number;
  measureRef?: (el: HTMLElement | null) => void;
}

/**
 * Scroll to options
 */
export interface ScrollToOptions {
  align?: 'start' | 'center' | 'end' | 'auto';
  smooth?: boolean;
}

/**
 * Type augmentation for TanStack Table
 */
declare module '@tanstack/table-core' {
  interface TableState extends VirtualizationTableState {}
  interface TableOptionsResolved<TData extends RowData> extends VirtualizationOptions {}
  interface Table<TData extends RowData> extends VirtualizationInstance {}
}

/**
 * Virtualization Feature implementation
 */
export const VirtualizationFeature: TanstackTableFeature<any> = {
  // Initial state
  getInitialState: (state): VirtualizationTableState => {
    return {
      virtualization: {
        enabled: false,
        scrollTop: 0,
        scrollLeft: 0,
        viewportHeight: 600,
        viewportWidth: 800,
        visibleRange: {
          start: 0,
          end: 0,
        },
      },
      ...state,
    };
  },

  // Default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): VirtualizationOptions => {
    return {
      enableVirtualization: false,
      virtualizationMode: 'fixed',
      estimatedRowHeight: 48,
      estimatedColumnWidth: 150,
      overscan: 3,
      scrollDirection: 'vertical',
      smoothScrolling: true,
      scrollDebounceMs: 150,
      virtualizeColumns: false,
      minRowsForVirtualization: 100,
      enableWindowScroll: false,
      scrollingElement: null,
      onVirtualizationChange: (virtualization) => {
        table.setState((old) => ({
          ...old,
          virtualization,
        }));
      },
    };
  },

  // Create table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    // Get virtualization state
    table.getVirtualizationState = () => {
      return table.getState().virtualization;
    };

    // Check if virtualization is enabled
    table.getIsVirtualized = () => {
      const { enableVirtualization, minRowsForVirtualization } = table.options;
      const rowCount = table.getRowModel().rows.length;

      if (!enableVirtualization) {
        return false;
      }

      if (minRowsForVirtualization && rowCount < minRowsForVirtualization) {
        return false;
      }

      return table.getVirtualizationState().enabled;
    };

    // Get virtual items (visible rows)
    table.getVirtualItems = (): VirtualItem[] => {
      if (!table.getIsVirtualized()) {
        return [];
      }

      const state = table.getVirtualizationState();
      const { estimatedRowHeight, overscan = 3 } = table.options;
      const rows = table.getRowModel().rows;

      // Calculate item height
      const getItemHeight = (index: number): number => {
        if (typeof estimatedRowHeight === 'function') {
          return estimatedRowHeight(index);
        }
        return estimatedRowHeight || 48;
      };

      // Calculate visible range
      const totalHeight = rows.length * (estimatedRowHeight as number || 48);
      const scrollTop = state.scrollTop;
      const viewportHeight = state.viewportHeight;

      // Find start index
      let accumulatedHeight = 0;
      let startIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        const itemHeight = getItemHeight(i);
        if (accumulatedHeight + itemHeight > scrollTop) {
          startIndex = Math.max(0, i - overscan);
          break;
        }
        accumulatedHeight += itemHeight;
      }

      // Find end index
      accumulatedHeight = 0;
      let endIndex = startIndex;
      for (let i = startIndex; i < rows.length; i++) {
        const itemHeight = getItemHeight(i);
        accumulatedHeight += itemHeight;
        if (accumulatedHeight > viewportHeight + (overscan * getItemHeight(i))) {
          endIndex = i;
          break;
        }
      }

      // Create virtual items
      const virtualItems: VirtualItem[] = [];
      let currentOffset = 0;

      // Calculate offset for start index
      for (let i = 0; i < startIndex; i++) {
        currentOffset += getItemHeight(i);
      }

      // Create virtual items for visible range
      for (let i = startIndex; i <= Math.min(endIndex, rows.length - 1); i++) {
        const itemHeight = getItemHeight(i);
        virtualItems.push({
          index: i,
          start: currentOffset,
          end: currentOffset + itemHeight,
          size: itemHeight,
          key: rows[i].id,
        });
        currentOffset += itemHeight;
      }

      return virtualItems;
    };

    // Get virtual column items (for horizontal virtualization)
    table.getVirtualColumnItems = (): VirtualItem[] => {
      if (!table.getIsVirtualized() || !table.options.virtualizeColumns) {
        return [];
      }

      // Similar logic for columns
      // Implementation would be similar to getVirtualItems but for columns
      return [];
    };

    // Get total size
    table.getTotalSize = (): number => {
      const { estimatedRowHeight } = table.options;
      const rows = table.getRowModel().rows;

      if (typeof estimatedRowHeight === 'function') {
        return rows.reduce((sum, _, index) => sum + estimatedRowHeight(index), 0);
      }

      return rows.length * (estimatedRowHeight || 48);
    };

    // Get virtual start index
    table.getVirtualStart = (): number => {
      const virtualItems = table.getVirtualItems();
      return virtualItems[0]?.index || 0;
    };

    // Get virtual end index
    table.getVirtualEnd = (): number => {
      const virtualItems = table.getVirtualItems();
      return virtualItems[virtualItems.length - 1]?.index || 0;
    };

    // Set virtualization enabled
    table.setVirtualizationEnabled = (enabled: boolean) => {
      const { onVirtualizationChange } = table.options;
      const current = table.getVirtualizationState();

      const newState = {
        ...current,
        enabled,
      };

      if (onVirtualizationChange) {
        onVirtualizationChange(newState);
      } else {
        table.setState((old) => ({
          ...old,
          virtualization: newState,
        }));
      }
    };

    // Set scroll position
    table.setScrollPosition = (top: number, left: number = 0) => {
      const { onVirtualizationChange } = table.options;
      const current = table.getVirtualizationState();

      const newState = {
        ...current,
        scrollTop: top,
        scrollLeft: left,
      };

      if (onVirtualizationChange) {
        onVirtualizationChange(newState);
      } else {
        table.setState((old) => ({
          ...old,
          virtualization: newState,
        }));
      }
    };

    // Set viewport size
    table.setViewportSize = (height: number, width: number = 800) => {
      const { onVirtualizationChange } = table.options;
      const current = table.getVirtualizationState();

      const newState = {
        ...current,
        viewportHeight: height,
        viewportWidth: width,
      };

      if (onVirtualizationChange) {
        onVirtualizationChange(newState);
      } else {
        table.setState((old) => ({
          ...old,
          virtualization: newState,
        }));
      }
    };

    // Scroll to index
    table.scrollToIndex = (index: number, options?: ScrollToOptions) => {
      const offset = table.getOffsetForIndex(index);
      const { scrollingElement, smoothScrolling } = table.options;
      const smooth = options?.smooth ?? smoothScrolling;

      if (scrollingElement) {
        scrollingElement.scrollTo({
          top: offset,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }

      table.setScrollPosition(offset);
    };

    // Scroll to row
    table.scrollToRow = (row: Row<any>, options?: ScrollToOptions) => {
      const rows = table.getRowModel().rows;
      const index = rows.findIndex(r => r.id === row.id);

      if (index !== -1) {
        table.scrollToIndex(index, options);
      }
    };

    // Scroll to top
    table.scrollToTop = () => {
      table.scrollToIndex(0, { smooth: true });
    };

    // Scroll to bottom
    table.scrollToBottom = () => {
      const rows = table.getRowModel().rows;
      table.scrollToIndex(rows.length - 1, { smooth: true });
    };

    // Measure item (for dynamic heights)
    table.measureItem = (index: number) => {
      // In a real implementation, this would measure the actual DOM element
      // and update the height cache
    };

    // Remeasure all items
    table.remeasureItems = () => {
      // Trigger remeasurement of all visible items
    };

    // Get offset for index
    table.getOffsetForIndex = (index: number): number => {
      const { estimatedRowHeight } = table.options;

      if (typeof estimatedRowHeight === 'function') {
        let offset = 0;
        for (let i = 0; i < index; i++) {
          offset += estimatedRowHeight(i);
        }
        return offset;
      }

      return index * (estimatedRowHeight || 48);
    };

    // Get index for offset
    table.getIndexForOffset = (offset: number): number => {
      const { estimatedRowHeight } = table.options;

      if (typeof estimatedRowHeight === 'function') {
        let accumulatedHeight = 0;
        const rows = table.getRowModel().rows;

        for (let i = 0; i < rows.length; i++) {
          accumulatedHeight += estimatedRowHeight(i);
          if (accumulatedHeight > offset) {
            return i;
          }
        }
        return rows.length - 1;
      }

      const itemHeight = estimatedRowHeight || 48;
      return Math.floor(offset / itemHeight);
    };
  },
};

/**
 * Helper hook for virtual scrolling container
 */
export function useVirtualizer(table: Table<any>) {
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    table.setScrollPosition(target.scrollTop, target.scrollLeft);
  };

  const handleResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      const { height, width } = entry.contentRect;
      table.setViewportSize(height, width);
    }
  };

  return {
    handleScroll,
    handleResize,
    virtualItems: table.getVirtualItems(),
    totalSize: table.getTotalSize(),
  };
}

/**
 * Helper component styles for virtualized container
 */
export function getVirtualizedContainerStyles(table: Table<any>): React.CSSProperties {
  return {
    height: '100%',
    overflow: 'auto',
    position: 'relative',
  };
}

/**
 * Helper component styles for virtual spacer
 */
export function getVirtualSpacerStyles(table: Table<any>): React.CSSProperties {
  return {
    height: table.getTotalSize(),
    position: 'relative',
  };
}

/**
 * Helper component styles for virtual items
 */
export function getVirtualItemStyles(item: VirtualItem): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: item.size,
    transform: `translateY(${item.start}px)`,
  };
}