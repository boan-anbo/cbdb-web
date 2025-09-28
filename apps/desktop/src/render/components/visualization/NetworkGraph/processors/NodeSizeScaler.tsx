/**
 * NodeSizeScaler Processor
 *
 * Scales node sizes using a standardized 1-10 scale with adjustable ratio.
 * Uses Sigma's nodeReducer for efficient, non-data-modifying transformations.
 */

import { FC, useEffect } from 'react';
import { useSigma } from '@react-sigma/core';

interface NodeSizeScalerProps {
  /**
   * Ratio to scale node sizes (default: 0.5)
   * - 0.3: Smaller nodes (1-10 becomes 0.3-3)
   * - 0.5: Balanced (1-10 becomes 0.5-5)
   * - 1.0: Full scale (1-10 stays 1-10)
   */
  ratio?: number;
  /** Minimum node size after scaling */
  minSize?: number;
  /** Maximum node size after scaling */
  maxSize?: number;
  /** Enable/disable the scaler */
  enabled?: boolean;
}

const NodeSizeScaler: FC<NodeSizeScalerProps> = ({
  ratio = 0.5,
  minSize = 1,
  maxSize = 10,
  enabled = true
}) => {
  const sigma = useSigma();

  useEffect(() => {
    if (!enabled) {
      // Remove the reducer if disabled
      sigma.setSetting('nodeReducer', null);
      return;
    }

    // Set up the nodeReducer to scale sizes
    const nodeReducer = (node: string, attributes: any) => {
      const originalSize = attributes.size || 3; // Default to 3 if no size

      // Normalize to 1-10 scale first (assuming backend sends 1-20 range)
      let normalizedSize = originalSize;
      if (originalSize > 10) {
        // Map 11-20 to 6-10
        normalizedSize = 6 + (originalSize - 11) * (4 / 9);
      }

      // Apply ratio scaling
      const scaledSize = normalizedSize * ratio;

      // Clamp to min/max
      const finalSize = Math.min(maxSize, Math.max(minSize, scaledSize));

      return {
        ...attributes,
        size: finalSize
      };
    };

    sigma.setSetting('nodeReducer', nodeReducer);

    console.log(`[NodeSizeScaler] Applied with ratio=${ratio}, min=${minSize}, max=${maxSize}`);

    // Cleanup function
    return () => {
      // Only remove if this component set it
      const currentReducer = sigma.getSetting('nodeReducer');
      if (currentReducer === nodeReducer) {
        sigma.setSetting('nodeReducer', null);
      }
    };
  }, [sigma, ratio, minSize, maxSize, enabled]);

  return null;
};

export default NodeSizeScaler;