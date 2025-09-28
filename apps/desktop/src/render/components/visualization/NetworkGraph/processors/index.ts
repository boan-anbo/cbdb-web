/**
 * Processors Module
 *
 * Components that process and transform graph data or appearance.
 * This includes both direct processors and reducer-based transformations.
 */

// Direct processors
export { default as EdgeCurveProcessor } from './EdgeCurveProcessor';
export type { EdgeCurveMode } from './EdgeCurveProcessor';

export { default as HoverHighlight } from './HoverHighlight';
export { default as ClusterLabels } from './ClusterLabels';
export { default as CameraReset } from './CameraReset';
export { default as InitialSpread } from './InitialSpread';
export { default as NodeSizeScaler } from './NodeSizeScaler';

// Reducer system
export { default as GraphReducers } from './GraphReducers';
export type {
  GraphReducer,
  NodeReducer,
  EdgeReducer,
  ReducerContext
} from './GraphReducers';

// Reducer creators
export {
  createHoverHighlightReducer,
  createNodeFilterReducer,
  createEdgeWeightReducer,
  createSearchHighlightReducer
} from './reducers';