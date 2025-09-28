/**
 * View Mode Manager - Manages different display modes for table data
 * Provides configuration and utilities for table, card, list, and grid views
 *
 * Pure TypeScript implementation for view mode handling
 * Can be used with any UI framework
 */

import type { Row, Column } from '@tanstack/table-core';

/**
 * Available view modes
 */
export type ViewMode = 'table' | 'card' | 'list' | 'grid' | 'timeline';

/**
 * View mode configuration
 */
export interface ViewModeConfig {
  mode: ViewMode;
  enabled: boolean;
  defaultMode?: ViewMode;
  availableModes?: ViewMode[];
  responsive?: ResponsiveConfig;
  cardConfig?: CardViewConfig;
  listConfig?: ListViewConfig;
  gridConfig?: GridViewConfig;
  timelineConfig?: TimelineViewConfig;
}

/**
 * Responsive configuration for view modes
 */
export interface ResponsiveConfig {
  breakpoints: {
    sm?: number;  // Small screens
    md?: number;  // Medium screens
    lg?: number;  // Large screens
    xl?: number;  // Extra large screens
  };
  modesByBreakpoint?: {
    sm?: ViewMode;
    md?: ViewMode;
    lg?: ViewMode;
    xl?: ViewMode;
  };
}

/**
 * Card view configuration
 */
export interface CardViewConfig {
  columnsPerRow?: number | ResponsiveValue<number>;
  spacing?: number | string;
  aspectRatio?: string;
  showHeader?: boolean;
  showImage?: boolean;
  imageField?: string;
  titleField?: string;
  subtitleField?: string;
  descriptionField?: string;
  fieldsToShow?: string[];
  maxDescriptionLength?: number;
  cardStyle?: 'default' | 'compact' | 'expanded' | 'minimal';
  enableHover?: boolean;
  enableSelection?: boolean;
}

/**
 * List view configuration
 */
export interface ListViewConfig {
  showAvatar?: boolean;
  avatarField?: string;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  metaFields?: string[];
  showDividers?: boolean;
  density?: 'compact' | 'normal' | 'comfortable';
  enableGrouping?: boolean;
  groupByField?: string;
  showActions?: boolean;
  actionsPosition?: 'left' | 'right';
}

/**
 * Grid view configuration
 */
export interface GridViewConfig {
  columns?: number | ResponsiveValue<number>;
  gap?: number | string;
  aspectRatio?: string;
  showOverlay?: boolean;
  overlayPosition?: 'top' | 'bottom' | 'center';
  overlayContent?: string[];
  minItemWidth?: number | string;
  maxItemWidth?: number | string;
  autoFit?: boolean;
  enableMasonry?: boolean;
}

/**
 * Timeline view configuration
 */
export interface TimelineViewConfig {
  dateField: string;
  titleField?: string;
  contentField?: string;
  orientation?: 'vertical' | 'horizontal';
  position?: 'left' | 'right' | 'alternate';
  showConnector?: boolean;
  groupByPeriod?: 'day' | 'week' | 'month' | 'year';
  markerStyle?: 'dot' | 'icon' | 'number';
  enableCollapse?: boolean;
}

/**
 * Responsive value helper
 */
export type ResponsiveValue<T> = T | {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

/**
 * View mode item representation
 */
export interface ViewModeItem<TData> {
  id: string;
  data: TData;
  index: number;
  selected?: boolean;
  expanded?: boolean;
  metadata?: Record<string, any>;
}

/**
 * View Mode Manager class
 */
export class ViewModeManager<TData = any> {
  private config: ViewModeConfig;
  private currentMode: ViewMode;
  private viewportWidth: number = 0;

  constructor(config: Partial<ViewModeConfig> = {}) {
    this.config = {
      mode: 'table',
      enabled: true,
      defaultMode: 'table',
      availableModes: ['table', 'card', 'list', 'grid'],
      ...config,
    };
    this.currentMode = config.defaultMode || 'table';
  }

  /**
   * Get current view mode
   */
  getCurrentMode(): ViewMode {
    return this.currentMode;
  }

  /**
   * Set view mode
   */
  setMode(mode: ViewMode): void {
    if (this.isModEnabled(mode)) {
      this.currentMode = mode;
    }
  }

  /**
   * Check if mode is enabled
   */
  isModEnabled(mode: ViewMode): boolean {
    return this.config.availableModes?.includes(mode) ?? false;
  }

  /**
   * Get available modes
   */
  getAvailableModes(): ViewMode[] {
    return this.config.availableModes || [];
  }

  /**
   * Update viewport width for responsive behavior
   */
  updateViewport(width: number): void {
    this.viewportWidth = width;

    // Auto-switch mode based on breakpoints
    if (this.config.responsive?.modesByBreakpoint) {
      const { breakpoints, modesByBreakpoint } = this.config.responsive;

      if (breakpoints.sm && width < breakpoints.sm && modesByBreakpoint.sm) {
        this.setMode(modesByBreakpoint.sm);
      } else if (breakpoints.md && width < breakpoints.md && modesByBreakpoint.md) {
        this.setMode(modesByBreakpoint.md);
      } else if (breakpoints.lg && width < breakpoints.lg && modesByBreakpoint.lg) {
        this.setMode(modesByBreakpoint.lg);
      } else if (breakpoints.xl && width >= breakpoints.xl && modesByBreakpoint.xl) {
        this.setMode(modesByBreakpoint.xl);
      }
    }
  }

  /**
   * Get responsive value based on viewport
   */
  getResponsiveValue<T>(value: ResponsiveValue<T>): T {
    if (typeof value !== 'object' || !this.config.responsive) {
      return value as T;
    }

    const { breakpoints } = this.config.responsive;
    const responsiveValue = value as { sm?: T; md?: T; lg?: T; xl?: T };

    if (breakpoints.sm && this.viewportWidth < breakpoints.sm && responsiveValue.sm !== undefined) {
      return responsiveValue.sm;
    }
    if (breakpoints.md && this.viewportWidth < breakpoints.md && responsiveValue.md !== undefined) {
      return responsiveValue.md;
    }
    if (breakpoints.lg && this.viewportWidth < breakpoints.lg && responsiveValue.lg !== undefined) {
      return responsiveValue.lg;
    }
    if (breakpoints.xl && this.viewportWidth >= breakpoints.xl && responsiveValue.xl !== undefined) {
      return responsiveValue.xl;
    }

    // Return the base value if it exists
    return (value as any).default || value as T;
  }

  /**
   * Transform rows to view mode items
   */
  transformToViewItems(rows: Row<TData>[]): ViewModeItem<TData>[] {
    return rows.map((row, index) => ({
      id: row.id,
      data: row.original,
      index,
      selected: row.getIsSelected(),
      expanded: row.getIsExpanded(),
      metadata: row.getAllCells().reduce((acc, cell) => {
        acc[cell.column.id] = cell.getValue();
        return acc;
      }, {} as Record<string, any>),
    }));
  }

  /**
   * Get layout configuration for current mode
   */
  getLayoutConfig(): any {
    switch (this.currentMode) {
      case 'card':
        return this.getCardLayoutConfig();
      case 'list':
        return this.getListLayoutConfig();
      case 'grid':
        return this.getGridLayoutConfig();
      case 'timeline':
        return this.getTimelineLayoutConfig();
      default:
        return {};
    }
  }

  /**
   * Get card layout configuration
   */
  private getCardLayoutConfig(): CardLayoutConfig {
    const config = this.config.cardConfig || {};
    const columnsPerRow = this.getResponsiveValue(config.columnsPerRow || 3);

    return {
      columnsPerRow,
      spacing: config.spacing || 16,
      aspectRatio: config.aspectRatio || '16/9',
      showHeader: config.showHeader ?? true,
      cardStyle: config.cardStyle || 'default',
      enableHover: config.enableHover ?? true,
      enableSelection: config.enableSelection ?? true,
    };
  }

  /**
   * Get list layout configuration
   */
  private getListLayoutConfig(): ListLayoutConfig {
    const config = this.config.listConfig || {};

    return {
      showAvatar: config.showAvatar ?? false,
      showDividers: config.showDividers ?? true,
      density: config.density || 'normal',
      showActions: config.showActions ?? false,
      actionsPosition: config.actionsPosition || 'right',
    };
  }

  /**
   * Get grid layout configuration
   */
  private getGridLayoutConfig(): GridLayoutConfig {
    const config = this.config.gridConfig || {};
    const columns = this.getResponsiveValue(config.columns || 4);

    return {
      columns,
      gap: config.gap || 16,
      aspectRatio: config.aspectRatio || '1/1',
      minItemWidth: config.minItemWidth || '200px',
      maxItemWidth: config.maxItemWidth || '1fr',
      autoFit: config.autoFit ?? true,
      enableMasonry: config.enableMasonry ?? false,
    };
  }

  /**
   * Get timeline layout configuration
   */
  private getTimelineLayoutConfig(): TimelineLayoutConfig {
    const config = this.config.timelineConfig || {
      dateField: 'date',
    };

    return {
      dateField: config.dateField,
      orientation: config.orientation || 'vertical',
      position: config.position || 'alternate',
      showConnector: config.showConnector ?? true,
      markerStyle: config.markerStyle || 'dot',
      enableCollapse: config.enableCollapse ?? false,
    };
  }

  /**
   * Get CSS grid template for grid view
   */
  getGridTemplate(): string {
    if (this.currentMode !== 'grid') return '';

    const config = this.getGridLayoutConfig();

    if (config.autoFit) {
      return `repeat(auto-fit, minmax(${config.minItemWidth}, ${config.maxItemWidth}))`;
    }

    return `repeat(${config.columns}, 1fr)`;
  }

  /**
   * Get container styles for current view mode
   */
  getContainerStyles(): Record<string, any> {
    const baseStyles: Record<string, any> = {
      position: 'relative',
    };

    switch (this.currentMode) {
      case 'card':
        const cardConfig = this.getCardLayoutConfig();
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: `repeat(${cardConfig.columnsPerRow}, 1fr)`,
          gap: cardConfig.spacing,
        };

      case 'grid':
        const gridConfig = this.getGridLayoutConfig();
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: this.getGridTemplate(),
          gap: gridConfig.gap,
        };

      case 'list':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column',
        };

      case 'timeline':
        const timelineConfig = this.getTimelineLayoutConfig();
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: timelineConfig.orientation === 'vertical' ? 'column' : 'row',
        };

      default:
        return baseStyles;
    }
  }

  /**
   * Get item styles for current view mode
   */
  getItemStyles(index: number): Record<string, any> {
    const baseStyles: Record<string, any> = {};

    switch (this.currentMode) {
      case 'card':
        const cardConfig = this.getCardLayoutConfig();
        return {
          ...baseStyles,
          aspectRatio: cardConfig.aspectRatio,
        };

      case 'grid':
        const gridConfig = this.getGridLayoutConfig();
        return {
          ...baseStyles,
          aspectRatio: gridConfig.aspectRatio,
        };

      case 'timeline':
        const timelineConfig = this.getTimelineLayoutConfig();
        if (timelineConfig.position === 'alternate') {
          return {
            ...baseStyles,
            alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end',
          };
        }
        return baseStyles;

      default:
        return baseStyles;
    }
  }

  /**
   * Should show column headers
   */
  shouldShowHeaders(): boolean {
    switch (this.currentMode) {
      case 'table':
        return true;
      case 'card':
        return this.config.cardConfig?.showHeader ?? false;
      case 'list':
      case 'grid':
      case 'timeline':
        return false;
      default:
        return true;
    }
  }

  /**
   * Get columns to display for current mode
   */
  getVisibleColumns(columns: Column<TData>[]): Column<TData>[] {
    switch (this.currentMode) {
      case 'card':
        return this.getCardColumns(columns);
      case 'list':
        return this.getListColumns(columns);
      case 'grid':
        return this.getGridColumns(columns);
      case 'timeline':
        return this.getTimelineColumns(columns);
      default:
        return columns;
    }
  }

  /**
   * Get columns for card view
   */
  private getCardColumns(columns: Column<TData>[]): Column<TData>[] {
    const fieldsToShow = this.config.cardConfig?.fieldsToShow;
    if (!fieldsToShow) return columns;

    return columns.filter(col => fieldsToShow.includes(col.id));
  }

  /**
   * Get columns for list view
   */
  private getListColumns(columns: Column<TData>[]): Column<TData>[] {
    const config = this.config.listConfig || {};
    const fields = [
      config.primaryField,
      config.secondaryField,
      config.tertiaryField,
      ...(config.metaFields || []),
    ].filter(Boolean) as string[];

    if (fields.length === 0) return columns;

    return columns.filter(col => fields.includes(col.id));
  }

  /**
   * Get columns for grid view
   */
  private getGridColumns(columns: Column<TData>[]): Column<TData>[] {
    const overlayContent = this.config.gridConfig?.overlayContent;
    if (!overlayContent) return columns.slice(0, 3); // Default to first 3 columns

    return columns.filter(col => overlayContent.includes(col.id));
  }

  /**
   * Get columns for timeline view
   */
  private getTimelineColumns(columns: Column<TData>[]): Column<TData>[] {
    const config = this.config.timelineConfig;
    if (!config) return columns;

    const fields = [
      config.dateField,
      config.titleField,
      config.contentField,
    ].filter(Boolean) as string[];

    return columns.filter(col => fields.includes(col.id));
  }
}

// Type exports for layout configs
interface CardLayoutConfig {
  columnsPerRow: number;
  spacing: number | string;
  aspectRatio: string;
  showHeader: boolean;
  cardStyle: 'default' | 'compact' | 'expanded' | 'minimal';
  enableHover: boolean;
  enableSelection: boolean;
}

interface ListLayoutConfig {
  showAvatar: boolean;
  showDividers: boolean;
  density: 'compact' | 'normal' | 'comfortable';
  showActions: boolean;
  actionsPosition: 'left' | 'right';
}

interface GridLayoutConfig {
  columns: number;
  gap: number | string;
  aspectRatio: string;
  minItemWidth: number | string;
  maxItemWidth: number | string;
  autoFit: boolean;
  enableMasonry: boolean;
}

interface TimelineLayoutConfig {
  dateField: string;
  orientation: 'vertical' | 'horizontal';
  position: 'left' | 'right' | 'alternate';
  showConnector: boolean;
  markerStyle: 'dot' | 'icon' | 'number';
  enableCollapse: boolean;
}

/**
 * Factory function to create view mode manager
 */
export function createViewModeManager<TData>(
  config?: Partial<ViewModeConfig>
): ViewModeManager<TData> {
  return new ViewModeManager<TData>(config);
}

/**
 * Preset configurations
 */
export const VIEW_MODE_PRESETS = {
  default: {
    mode: 'table' as ViewMode,
    enabled: true,
    availableModes: ['table', 'card', 'list', 'grid'] as ViewMode[],
  },

  cardOnly: {
    mode: 'card' as ViewMode,
    enabled: true,
    availableModes: ['card'] as ViewMode[],
    cardConfig: {
      columnsPerRow: 3,
      cardStyle: 'default',
      enableHover: true,
      enableSelection: true,
    },
  },

  responsive: {
    mode: 'table' as ViewMode,
    enabled: true,
    availableModes: ['table', 'card', 'list'] as ViewMode[],
    responsive: {
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
      modesByBreakpoint: {
        sm: 'list' as ViewMode,
        md: 'card' as ViewMode,
        lg: 'table' as ViewMode,
      },
    },
  },

  gallery: {
    mode: 'grid' as ViewMode,
    enabled: true,
    availableModes: ['grid'] as ViewMode[],
    gridConfig: {
      columns: { sm: 2, md: 3, lg: 4, xl: 6 },
      aspectRatio: '1/1',
      autoFit: true,
      enableMasonry: false,
    },
  },
} as const;