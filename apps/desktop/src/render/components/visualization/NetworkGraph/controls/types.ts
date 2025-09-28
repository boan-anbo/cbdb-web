/**
 * Control Types and Interfaces
 */

import { LayoutType } from '../layouts/types';

/**
 * Available control positions
 */
export type ControlPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Control configuration
 */
export interface ControlsConfig {
  /** Show fullscreen control */
  showFullscreen?: boolean;

  /** Show zoom controls */
  showZoom?: boolean;

  /** Show search control */
  showSearch?: boolean;

  /** Show layout selector */
  showLayoutSelector?: boolean;

  /** Control container position */
  position?: ControlPosition;

  /** Opacity for control containers (0-1, default: 1) */
  containerOpacity?: number;

  /** Width for search control in pixels */
  searchWidth?: number;

  /** Custom control labels for i18n */
  labels?: {
    zoomIn?: string;
    zoomOut?: string;
    zoomReset?: string;
    fullscreen?: string;
    exitFullscreen?: string;
    search?: string;
    layoutSelector?: string;
  };
}

/**
 * Layout selector configuration
 */
export interface LayoutSelectorConfig {
  /** Available layouts to choose from */
  availableLayouts?: LayoutType[];

  /** Current selected layout */
  currentLayout?: LayoutType;

  /** Callback when layout changes */
  onLayoutChange?: (layout: LayoutType) => void;

  /** Custom layout labels */
  layoutLabels?: Record<LayoutType, string>;
}

/**
 * Programmatic control API
 */
export interface GraphControlAPI {
  /** Zoom controls */
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setZoom: (level: number) => void;

  /** Layout controls */
  setLayout: (layout: LayoutType) => void;
  getCurrentLayout: () => LayoutType;

  /** Search controls */
  search: (query: string) => void;
  clearSearch: () => void;

  /** Fullscreen controls */
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;

  /** Export controls */
  exportImage: (format?: 'png' | 'jpeg') => void;
  exportData: () => any;
}