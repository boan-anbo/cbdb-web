/**
 * InitialSpread Processor
 *
 * Spreads nodes randomly before force-directed layouts run.
 * This prevents nodes from clustering in the center when ForceAtlas2 starts.
 * ForceAtlas2 expects initial positions to be spread out for stability.
 */

import { FC, useEffect } from 'react';
import { useSigma } from '@react-sigma/core';
import { useLayoutRandom } from '@react-sigma/layout-random';

interface InitialSpreadProps {
  /** Only apply if no positions are set */
  checkExisting?: boolean;
  /** Scale factor for spreading */
  scale?: number;
}

const InitialSpread: FC<InitialSpreadProps> = ({
  checkExisting = true,
  scale = 500  // Large scale for good initial spread
}) => {
  const sigma = useSigma();
  const { assign } = useLayoutRandom({
    scale,
    center: 0.5,
  });

  useEffect(() => {
    const graph = sigma.getGraph();

    if (graph.order === 0) {
      return;
    }

    // Check if nodes already have positions
    if (checkExisting) {
      let hasPositions = true;
      graph.forEachNode((_, attrs) => {
        if (attrs.x === undefined || attrs.y === undefined) {
          hasPositions = false;
        }
      });

      if (hasPositions) {
        console.log('[InitialSpread] Nodes already have positions, skipping');
        return;
      }
    }

    console.log('[InitialSpread] Applying random spread to', graph.order, 'nodes with scale', scale);
    assign();
  }, [sigma, assign, checkExisting, scale]);

  return null;
};

export default InitialSpread;