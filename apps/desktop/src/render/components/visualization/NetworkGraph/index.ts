// Core exports
export { default as NetworkGraph } from './core/NetworkGraph';
export type {
  NetworkGraphProps,
  GraphDataTransformer,
  LayoutType,
  LayoutConfig
} from './core/NetworkGraph.types';

// Graph data types are from @cbdb/core - import directly from there
// import { GraphData, GraphNode, GraphEdge, GraphNodeAttributes, GraphEdgeAttributes, EDGE_SIZE_GUIDELINES, calculateEdgeSize } from '@cbdb/core';

// Processor exports (including reducers)
export {
  HoverHighlight,
  EdgeCurveProcessor,
  GraphReducers,
  // Reducer creators
  createHoverHighlightReducer,
  createNodeFilterReducer,
  createEdgeWeightReducer,
  createSearchHighlightReducer
} from './processors';

export type {
  EdgeCurveMode,
  GraphReducer,
  NodeReducer,
  EdgeReducer,
  ReducerContext
} from './processors';

// Layout exports
export {
  CircularLayout,
  ForceLayout,
  GridLayout,
  RandomLayout,
  LayoutManager
} from './layouts';
export type {
  LayoutType,
  LayoutConfig,
  LayoutProcessorProps
} from './layouts';

// Control exports
export {
  GraphControls,
  LayoutSelector,
  useGraphControl
} from './controls';
export type {
  ControlPosition,
  ControlsConfig,
  LayoutSelectorConfig,
  GraphControlAPI
} from './controls';