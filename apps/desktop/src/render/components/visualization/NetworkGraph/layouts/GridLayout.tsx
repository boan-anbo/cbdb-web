/**
 * Grid Layout Component
 *
 * Arranges nodes in a regular grid pattern.
 * Good for systematic visualization or when spatial position has meaning.
 */

import { FC, useEffect } from 'react';
import { useSigma } from '@react-sigma/core';
import { LayoutProcessorProps } from './types';

interface GridLayoutProps extends LayoutProcessorProps {
  /** Number of columns (auto-calculated if not provided) */
  columns?: number;
  /** Spacing between nodes */
  spacing?: number;
}

const GridLayout: FC<GridLayoutProps> = ({
  config,
  onLayoutComplete
}) => {
  const sigma = useSigma();

  useEffect(() => {
    const graph = sigma.getGraph();
    const nodes = graph.nodes();
    const nodeCount = nodes.length;

    // Calculate grid dimensions
    const columns = config?.columns || Math.ceil(Math.sqrt(nodeCount));
    const rows = Math.ceil(nodeCount / columns);
    const spacing = config?.spacing || 1;

    // Position nodes in grid
    nodes.forEach((node, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      graph.setNodeAttribute(node, 'x', col * spacing);
      graph.setNodeAttribute(node, 'y', row * spacing);
    });

    // Force re-render
    sigma.refresh();

    if (onLayoutComplete) {
      onLayoutComplete();
    }
  }, [sigma, config, onLayoutComplete]);

  return null;
};

export default GridLayout;