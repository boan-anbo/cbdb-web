/**
 * Layout Type Definitions
 */

/**
 * Available layout types for graph visualization
 * All 6 layouts provided by React Sigma
 */
export type LayoutType = 'circular' | 'random' | 'force' | 'forceatlas2' | 'noverlap' | 'circlepack';

/**
 * Configuration for graph layouts
 */
export interface LayoutConfig {
  /** Scale factor for the layout */
  scale?: number;

  /** Center point for the layout */
  center?: { x: number; y: number };

  /** Layout-specific options */
  [key: string]: any;
}

/**
 * Base props for layout processor components
 */
export interface LayoutProcessorProps {
  /** Layout configuration */
  config?: LayoutConfig;

  /** Whether to animate the layout transition */
  animate?: boolean;

  /** Animation duration in ms */
  animationDuration?: number;

  /** Callback when layout is complete */
  onLayoutComplete?: () => void;
}