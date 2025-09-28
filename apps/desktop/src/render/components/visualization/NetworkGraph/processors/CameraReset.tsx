/**
 * CameraReset Processor
 *
 * Automatically resets camera to fit all nodes in viewport after layout changes.
 * This ensures the graph is always properly scaled to the container.
 */

import { FC, useEffect } from 'react';
import { useSigma } from '@react-sigma/core';

interface CameraResetProps {
  /** Trigger reset when this value changes */
  triggerKey?: string | number;
  /** Delay before resetting (ms) */
  delay?: number;
}

const CameraReset: FC<CameraResetProps> = ({
  triggerKey,
  delay = 500
}) => {
  const sigma = useSigma();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const graph = sigma.getGraph();

      if (graph.order === 0) {
        console.log('[CameraReset] No nodes to fit');
        return;
      }

      // Get the camera and reset it to fit all nodes
      const camera = sigma.getCamera();

      // Calculate bounding box of all nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      graph.forEachNode((node, attrs) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const size = attrs.size || 10;

        minX = Math.min(minX, x - size);
        minY = Math.min(minY, y - size);
        maxX = Math.max(maxX, x + size);
        maxY = Math.max(maxY, y + size);
      });

      // Add some padding
      const padding = 0.1; // 10% padding
      const width = maxX - minX;
      const height = maxY - minY;
      minX -= width * padding;
      maxX += width * padding;
      minY -= height * padding;
      maxY += height * padding;

      // Calculate center and ratio
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Get container dimensions
      const container = sigma.getContainer();
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Calculate the ratio to fit all nodes
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      // Use the larger ratio to ensure all nodes fit
      const ratioX = graphWidth / containerWidth;
      const ratioY = graphHeight / containerHeight;
      const ratio = Math.max(ratioX, ratioY, 1);

      console.log('[CameraReset] Resetting camera to fit', graph.order, 'nodes');
      console.log('[CameraReset] Bounds:', { minX, minY, maxX, maxY });
      console.log('[CameraReset] Center:', { centerX, centerY });
      console.log('[CameraReset] Ratio:', ratio);

      // Apply camera state
      camera.setState({
        x: centerX,
        y: centerY,
        ratio: ratio,
        angle: 0,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [sigma, triggerKey, delay]);

  return null;
};

export default CameraReset;