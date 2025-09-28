/**
 * NetworkGraph Component Type Definitions
 *
 * Component-specific types for the NetworkGraph visualization.
 * Graph data types are imported from @cbdb/core as the SSOT.
 */

import type {
  // Main graph data types (SSOT from @cbdb/core)
  GraphData,
  GraphNode,
  GraphEdge,
  GraphNodeAttributes,
  GraphEdgeAttributes,
} from '@cbdb/core';

/**
 * Layout types available for graph visualization
 */
export type LayoutType = 'circular' | 'force' | 'random' | 'grid' | 'hierarchical';

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
 * Props for the NetworkGraph component
 */
export interface NetworkGraphProps {
  /**
   * Graph data to visualize
   * Can be any domain-specific data following the GraphData structure
   */
  data: GraphData;

  /** Layout algorithm to use (default: 'circular') */
  layout?: LayoutType;

  /** Layout configuration */
  layoutConfig?: LayoutConfig;

  /** Whether to render edge labels (default: true) */
  renderEdgeLabels?: boolean;

  /** Default color for edges without color attribute */
  defaultEdgeColor?: string;

  /** Default color for nodes without color attribute */
  defaultNodeColor?: string;

  /** Default edge thickness when not specified */
  defaultEdgeSize?: number;

  /** Minimum edge thickness (prevents invisible edges) */
  minEdgeSize?: number;

  /** Maximum edge thickness */
  maxEdgeSize?: number;

  /** Container width (default: '100%') */
  width?: string | number;

  /** Container height (default: '100vh') */
  height?: string | number;

  /** Additional Sigma settings */
  sigmaSettings?: Record<string, any>;

  /** Enable hover highlight effect (default: true) */
  enableHoverHighlight?: boolean;

  /** Enable cluster labels for identified communities (default: false) */
  enableClusterLabels?: boolean;

  /** Minimum cluster size to show labels (default: 5) */
  minClusterSize?: number;

  /**
   * Mode for handling edge curves with multiple relationships
   * - 'auto': Automatically curve parallel edges (default)
   * - 'always-straight': Force all edges to be straight
   * - 'always-curved': Force all edges to be curved
   */
  edgeCurveMode?: 'auto' | 'always-straight' | 'always-curved';

  /** Enable graph controls (zoom, search, fullscreen, layout selector) */
  enableControls?: boolean;

  /** Configuration for controls */
  controlsConfig?: {
    showFullscreen?: boolean;
    showZoom?: boolean;
    showSearch?: boolean;
    showLayoutSelector?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    labels?: Record<string, string>;
  };

  /** Available layouts for the selector */
  availableLayouts?: LayoutType[];

  /** Callback when layout changes */
  onLayoutChange?: (layout: LayoutType) => void;

  /** Callback when a node is clicked */
  onNodeClick?: (node: GraphNode) => void;

  /** Callback when an edge is clicked */
  onEdgeClick?: (edge: GraphEdge) => void;

  /** Callback when the background is clicked */
  onBackgroundClick?: () => void;
}

/**
 * Utility type for transforming domain data to graph format
 */
export interface GraphDataTransformer<TNode = any, TEdge = any> {
  /** Transform domain node to graph node */
  transformNode: (node: TNode) => GraphNode;

  /** Transform domain edge to graph edge */
  transformEdge: (edge: TEdge) => GraphEdge;
}

// All graph data types and utilities are in @cbdb/core
// Import directly from '@cbdb/core' for EDGE_SIZE_GUIDELINES and calculateEdgeSize