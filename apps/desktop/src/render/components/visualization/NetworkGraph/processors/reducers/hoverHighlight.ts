/**
 * Hover Highlight Reducer
 *
 * When hovering over a node:
 * - Hovered node and its direct neighbors remain fully visible with labels
 * - Other nodes are faded to light gray (#f6f6f6) - matching official Sigma.js example
 * - Labels on faded nodes are hidden
 * - Unrelated edges are hidden completely
 * - No size changes are applied to avoid visual confusion
 */

import { GraphReducer } from '../GraphReducers';

export interface HoverHighlightOptions {
  /** The currently hovered node ID */
  hoveredNode: string | null;
  /** Whether to show edges between neighbors (default: false) */
  showNeighborEdges?: boolean;
}

/**
 * Create a hover highlight reducer
 *
 * Matches the official Sigma.js example behavior:
 * - Non-highlighted nodes are shown in light gray (#f6f6f6)
 * - Labels are hidden for non-highlighted nodes
 * - This creates a subtle background effect that maintains graph structure visibility
 *
 * @example
 * ```tsx
 * const [hoveredNode, setHoveredNode] = useState(null);
 *
 * const hoverReducer = createHoverHighlightReducer({
 *   hoveredNode,
 *   showNeighborEdges: false
 * });
 *
 * <GraphReducers reducers={[hoverReducer]} />
 * ```
 */
export function createHoverHighlightReducer(
  options: HoverHighlightOptions
): GraphReducer {
  const {
    hoveredNode,
    showNeighborEdges = false,
  } = options;

  return {
    id: 'hover-highlight',
    enabled: hoveredNode !== null,
    state: { hoveredNode, showNeighborEdges },

    nodeReducer: (node, attributes, { graph, state }) => {
      const hovered = state?.hoveredNode;

      if (!hovered) return attributes;

      // Hovered node stays visible with its label
      if (node === hovered) {
        return {
          ...attributes,
          zIndex: 20,  // Higher zIndex for hovered node
          highlighted: true,
          forceLabel: true,  // Ensure label is visible
        };
      }

      // Neighbors stay visible with their labels
      const neighbors = graph.neighbors(hovered);
      if (neighbors.includes(node)) {
        return {
          ...attributes,
          zIndex: 15,  // Higher zIndex for neighbor nodes
          highlighted: true,
          forceLabel: true,  // Ensure label is visible
        };
      }

      // Other nodes are faded to light gray (matching official Sigma.js example)
      // This maintains graph structure visibility while de-emphasizing non-relevant nodes
      return {
        ...attributes,
        color: '#f6f6f6',  // Light gray color from official example
        label: '',  // Hide label by making it empty
        zIndex: 0,
        highlighted: false,
        // Keep original size - don't change it
      };
    },

    edgeReducer: (edge, attributes, { graph, state }) => {
      const hovered = state?.hoveredNode;

      if (!hovered) return attributes;

      const [source, target] = graph.extremities(edge);

      // Edges connected to hovered node stay visible with high zIndex
      if (source === hovered || target === hovered) {
        return {
          ...attributes,
          zIndex: 25,  // Higher than nodes to prevent occlusion
          hidden: false,
        };
      }

      // Optionally show edges between neighbors
      if (state?.showNeighborEdges) {
        const neighbors = graph.neighbors(hovered);
        if (neighbors.includes(source) && neighbors.includes(target)) {
          return {
            ...attributes,
            zIndex: 10,  // Above faded nodes but below highlighted edges
            hidden: false,
          };
        }
      }

      // Hide all other edges
      return {
        ...attributes,
        hidden: true,
      };
    }
  };
}