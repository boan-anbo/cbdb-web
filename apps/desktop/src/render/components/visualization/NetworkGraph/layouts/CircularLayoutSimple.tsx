/**
 * Simple Circular Layout Component
 * Based on React Sigma documentation pattern
 */

import { FC, useEffect } from 'react';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { useSigma } from '@react-sigma/core';

interface CircularLayoutSimpleProps {
  scale?: number;
}

const CircularLayoutSimple: FC<CircularLayoutSimpleProps> = ({ scale = 1 }) => {
  const sigma = useSigma();
  const { positions, assign } = useLayoutCircular();

  useEffect(() => {
    // Wait a tick for the graph to be loaded
    const timeoutId = setTimeout(() => {
      console.log('CircularLayoutSimple: Applying layout');

      try {
        // Simply assign the layout
        assign();

        // Ensure the camera is properly adjusted
        const graph = sigma.getGraph();
        if (graph && graph.order > 0) {
          console.log('CircularLayoutSimple: Layout applied to', graph.order, 'nodes');
          // Adjust camera to fit all nodes
          sigma.getCamera().setState(sigma.getCamera().getState());
        }
      } catch (error) {
        console.error('CircularLayoutSimple: Error:', error);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [assign, sigma]);

  return null;
};

export default CircularLayoutSimple;