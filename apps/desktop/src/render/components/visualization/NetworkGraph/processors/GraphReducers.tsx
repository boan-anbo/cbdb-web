/**
 * GraphReducers Component
 *
 * A composable system for applying visual transformations to graph elements.
 * Reducers allow dynamic attribute changes without modifying the underlying graph data.
 *
 * @example Basic usage with hover highlight:
 * ```tsx
 * <GraphReducers reducers={[hoverHighlightReducer]} />
 * ```
 *
 * @example Combining multiple reducers:
 * ```tsx
 * const reducers = [
 *   hoverHighlightReducer,
 *   nodeTypeColorReducer,
 *   edgeWeightSizeReducer
 * ];
 * <GraphReducers reducers={reducers} />
 * ```
 */

import { useEffect, FC } from 'react';
import { useSigma } from '@react-sigma/core';
import { Attributes } from 'graphology-types';
import Graph from 'graphology';

/**
 * Node reducer function type
 * @param node - The node key/id
 * @param attributes - Current node attributes
 * @param context - Additional context (graph, state, etc.)
 * @returns Modified attributes or null to use defaults
 */
export type NodeReducer = (
  node: string,
  attributes: Attributes,
  context: ReducerContext
) => Attributes | null;

/**
 * Edge reducer function type
 * @param edge - The edge key/id
 * @param attributes - Current edge attributes
 * @param context - Additional context (graph, state, etc.)
 * @returns Modified attributes or null to use defaults
 */
export type EdgeReducer = (
  edge: string,
  attributes: Attributes,
  context: ReducerContext
) => Attributes | null;

/**
 * Context provided to reducer functions
 */
export interface ReducerContext {
  graph: Graph;
  state?: Record<string, any>;
}

/**
 * A graph reducer that can transform both nodes and edges
 */
export interface GraphReducer {
  /** Unique identifier for this reducer */
  id: string;
  /** Optional node transformation */
  nodeReducer?: NodeReducer;
  /** Optional edge transformation */
  edgeReducer?: EdgeReducer;
  /** State associated with this reducer */
  state?: Record<string, any>;
  /** Whether this reducer is enabled */
  enabled?: boolean;
}

interface GraphReducersProps {
  /** Array of reducers to apply */
  reducers: GraphReducer[];
}

/**
 * Compose multiple reducer functions into one
 */
const composeReducers = (
  reducers: Array<NodeReducer | EdgeReducer>,
  context: ReducerContext
) => {
  return (element: string, attributes: Attributes) => {
    return reducers.reduce((acc, reducer) => {
      const result = reducer(element, acc, context);
      return result !== null ? result : acc;
    }, attributes);
  };
};

const GraphReducers: FC<GraphReducersProps> = ({ reducers }) => {
  const sigma = useSigma();

  useEffect(() => {
    const graph = sigma.getGraph();
    const enabledReducers = reducers.filter(r => r.enabled !== false);

    // Collect all node reducers
    const nodeReducers = enabledReducers
      .filter(r => r.nodeReducer)
      .map(r => r.nodeReducer!);

    // Collect all edge reducers
    const edgeReducers = enabledReducers
      .filter(r => r.edgeReducer)
      .map(r => r.edgeReducer!);

    // Create context with all reducer states
    const context: ReducerContext = {
      graph,
      state: enabledReducers.reduce((acc, r) => ({
        ...acc,
        ...(r.state || {})
      }), {})
    };

    // Apply composed node reducer
    if (nodeReducers.length > 0) {
      const composedNodeReducer = composeReducers(nodeReducers, context);
      sigma.setSetting('nodeReducer', composedNodeReducer);
    } else {
      sigma.setSetting('nodeReducer', null);
    }

    // Apply composed edge reducer
    if (edgeReducers.length > 0) {
      const composedEdgeReducer = composeReducers(edgeReducers, context);
      sigma.setSetting('edgeReducer', composedEdgeReducer);
    } else {
      sigma.setSetting('edgeReducer', null);
    }

    // Force re-render
    sigma.refresh();

    // Cleanup
    return () => {
      sigma.setSetting('nodeReducer', null);
      sigma.setSetting('edgeReducer', null);
    };
  }, [reducers, sigma]);

  return null;
};

export default GraphReducers;