/**
 * Test Layout Component - Simple manual layout for debugging
 */

import { FC, useEffect } from 'react';
import { useSigma } from '@react-sigma/core';

interface TestLayoutProps {
  onLayoutComplete?: () => void;
}

const TestLayout: FC<TestLayoutProps> = ({ onLayoutComplete }) => {
  const sigma = useSigma();

  useEffect(() => {
    console.log('TestLayout: Starting layout');
    const graph = sigma.getGraph();

    if (!graph) {
      console.log('TestLayout: No graph available');
      return;
    }

    const nodeCount = graph.order;
    console.log('TestLayout: Found', nodeCount, 'nodes');

    // Simple circular layout calculation
    let index = 0;
    const radius = 100;
    const center = { x: 0, y: 0 };

    graph.forEachNode((node) => {
      const angle = (index * 2 * Math.PI) / nodeCount;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      console.log(`TestLayout: Setting node ${node} to position (${x}, ${y})`);
      graph.setNodeAttribute(node, 'x', x);
      graph.setNodeAttribute(node, 'y', y);

      index++;
    });

    // Refresh the rendering
    sigma.refresh();
    console.log('TestLayout: Layout complete, refreshed');

    if (onLayoutComplete) {
      onLayoutComplete();
    }
  }, [sigma, onLayoutComplete]);

  return null;
};

export default TestLayout;