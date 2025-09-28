/**
 * Node Filter Reducer
 *
 * Filters nodes based on custom criteria.
 * Useful for showing/hiding specific node types or categories.
 */

import { GraphReducer } from '../GraphReducers';

export interface NodeFilterOptions {
  /** Function to determine if a node should be visible */
  filterFn: (nodeId: string, attributes: any) => boolean;
  /** Whether to hide edges connected to filtered nodes */
  hideConnectedEdges?: boolean;
}

/**
 * Create a node filter reducer
 *
 * @example Filter by node type:
 * ```tsx
 * const typeFilter = createNodeFilterReducer({
 *   filterFn: (nodeId, attrs) => attrs.type === 'person',
 *   hideConnectedEdges: true
 * });
 * ```
 *
 * @example Filter by attribute threshold:
 * ```tsx
 * const sizeFilter = createNodeFilterReducer({
 *   filterFn: (nodeId, attrs) => attrs.size >= 10
 * });
 * ```
 */
export function createNodeFilterReducer(
  options: NodeFilterOptions
): GraphReducer {
  const { filterFn, hideConnectedEdges = true } = options;

  return {
    id: 'node-filter',
    state: { filterFn, hideConnectedEdges },

    nodeReducer: (node, attributes, { state }) => {
      const shouldShow = state?.filterFn(node, attributes);

      if (!shouldShow) {
        return {
          ...attributes,
          hidden: true,
          filtered: true,
        };
      }

      return attributes;
    },

    edgeReducer: hideConnectedEdges ? (edge, attributes, { graph, state }) => {
      const [source, target] = graph.extremities(edge);
      const sourceAttrs = graph.getNodeAttributes(source);
      const targetAttrs = graph.getNodeAttributes(target);

      const sourceVisible = state?.filterFn(source, sourceAttrs);
      const targetVisible = state?.filterFn(target, targetAttrs);

      if (!sourceVisible || !targetVisible) {
        return {
          ...attributes,
          hidden: true,
        };
      }

      return attributes;
    } : undefined
  };
}