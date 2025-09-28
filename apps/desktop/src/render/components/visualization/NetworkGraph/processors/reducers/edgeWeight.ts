/**
 * Edge Weight Reducer
 *
 * Adjusts edge visual properties based on weight/strength.
 * Useful for emphasizing important connections.
 */

import { GraphReducer } from '../GraphReducers';
import { calculateEdgeSize } from '@cbdb/core';

export interface EdgeWeightOptions {
  /** Minimum edge size */
  minSize?: number;
  /** Maximum edge size */
  maxSize?: number;
  /** Whether to adjust opacity based on weight */
  adjustOpacity?: boolean;
  /** Weight threshold below which edges are hidden */
  hideThreshold?: number;
}

/**
 * Create an edge weight reducer
 *
 * @example Basic weight visualization:
 * ```tsx
 * const weightReducer = createEdgeWeightReducer({
 *   minSize: 1,
 *   maxSize: 10,
 *   hideThreshold: 0.1
 * });
 * ```
 *
 * @example With opacity adjustment:
 * ```tsx
 * const weightReducer = createEdgeWeightReducer({
 *   adjustOpacity: true,
 *   hideThreshold: 0.2
 * });
 * ```
 */
export function createEdgeWeightReducer(
  options: EdgeWeightOptions = {}
): GraphReducer {
  const {
    minSize = 1,
    maxSize = 10,
    adjustOpacity = false,
    hideThreshold = 0
  } = options;

  return {
    id: 'edge-weight',
    state: { minSize, maxSize, adjustOpacity, hideThreshold },

    edgeReducer: (edge, attributes, { state }) => {
      const weight = attributes.strength || attributes.weight || 0.5;

      // Hide edges below threshold
      if (weight < (state?.hideThreshold || 0)) {
        return {
          ...attributes,
          hidden: true,
        };
      }

      // Calculate size based on weight
      const size = calculateEdgeSize(
        weight,
        state?.minSize || 1,
        state?.maxSize || 10
      );

      const result: any = {
        ...attributes,
        size,
      };

      // Optionally adjust opacity
      if (state?.adjustOpacity) {
        const opacity = Math.max(0.3, Math.min(1, weight));
        const currentColor = attributes.color || '#999999';

        // Add opacity to hex color
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        result.color = currentColor.startsWith('#')
          ? `${currentColor}${opacityHex}`
          : currentColor;
      }

      return result;
    }
  };
}