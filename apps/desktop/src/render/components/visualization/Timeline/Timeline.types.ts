/**
 * Timeline Component Type Definitions
 *
 * Provides data structures and interfaces for the Timeline visualization component.
 * Following the same pattern as NetworkGraph component for consistency.
 */

export interface TimelineEvent {
  id: string | number;
  title: string;
  startDate: number;  // Year as number
  endDate?: number;   // Optional end year for ranges
  category?: string;
  description?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimelineData {
  events: TimelineEvent[];
  categories?: TimelineCategory[];
}

export interface TimelineCategory {
  name: string;
  color: string;
  label?: string;
}

export type TimelineLayout = 'horizontal' | 'vertical' | 'grouped';

export interface TimelineLayoutConfig {
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  barHeight?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  showAxis?: boolean;
}

export interface TimelineControlsConfig {
  showZoom?: boolean;
  showPan?: boolean;
  showReset?: boolean;
  showExport?: boolean;
  showLayoutSelector?: boolean;
}

export interface TimelineProps {
  /** Timeline data to visualize */
  data: TimelineData;

  /** Timeline layout type */
  layout?: TimelineLayout;

  /** Layout configuration */
  layoutConfig?: TimelineLayoutConfig;

  /** Width of the timeline container */
  width?: string | number;

  /** Height of the timeline container */
  height?: string | number;

  /** Enable interactive controls */
  enableControls?: boolean;

  /** Controls configuration */
  controlsConfig?: TimelineControlsConfig;

  /** Show category legend */
  showLegend?: boolean;

  /** Custom date formatter */
  dateFormatter?: (year: number) => string;

  /** Event handlers */
  onEventClick?: (event: TimelineEvent) => void;
  onEventHover?: (event: TimelineEvent | null) => void;
  onTimeRangeChange?: (start: number, end: number) => void;

  /** Custom color scale */
  colorScale?: string[] | ((category: string) => string);

  /** Minimum year for axis */
  minYear?: number;

  /** Maximum year for axis */
  maxYear?: number;
}

export interface TimelineControlAPI {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  panTo: (year: number) => void;
  setTimeRange: (start: number, end: number) => void;
  exportImage: (format: 'png' | 'svg') => void;
}

export interface TimelineStats {
  totalEvents: number;
  dateRange: {
    start: number;
    end: number;
  };
  categoryCounts: Record<string, number>;
  averageDuration?: number;
}