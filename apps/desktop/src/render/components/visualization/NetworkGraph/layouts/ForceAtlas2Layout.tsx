/**
 * ForceAtlas2 Layout Component
 *
 * Uses React Sigma's ForceAtlas2 layout which runs in a Web Worker.
 * This prevents UI blocking for large graphs.
 */

import { FC, useEffect } from 'react';
import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';
import { LayoutProcessorProps } from './types';

const ForceAtlas2Layout: FC<LayoutProcessorProps> = ({
  config,
  onLayoutComplete
}) => {
  // ForceAtlas2 with worker - continuous layout that runs in background
  const { start, stop, isRunning } = useWorkerLayoutForceAtlas2({
    settings: {
      // Animation speed settings
      slowDown: 15,  // Higher value = slower, smoother animation
      // Core algorithm parameters
      gravity: config?.gravity || 1,
      scalingRatio: config?.scalingRatio || 10,  // Lower value for tighter clustering
      barnesHutOptimize: config?.barnesHutOptimize !== false,  // O(n log n) performance
      barnesHutTheta: 0.5,  // Barnes-Hut approximation parameter
      strongGravityMode: config?.strongGravityMode || false,
      outboundAttractionDistribution: config?.outboundAttractionDistribution || false,
      linLogMode: config?.linLogMode || false,
      adjustSizes: config?.adjustSizes !== false,  // Prevent node overlap
      edgeWeightInfluence: config?.edgeWeightInfluence || 1,
    },
  });

  // Store duration in a ref to avoid re-renders
  const duration = config?.duration || 0;

  useEffect(() => {
    // Start the layout worker
    start();

    // Stop after duration if specified
    if (duration > 0) {
      const timeout = setTimeout(() => {
        stop();
        if (onLayoutComplete) {
          onLayoutComplete();
        }
      }, duration);

      // Cleanup
      return () => {
        clearTimeout(timeout);
        stop();
      };
    }

    // Cleanup without timeout
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, stop]); // Only depend on start/stop functions

  return null;
};

export default ForceAtlas2Layout;