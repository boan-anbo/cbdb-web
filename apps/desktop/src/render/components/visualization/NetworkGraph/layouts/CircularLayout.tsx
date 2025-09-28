/**
 * Circular Layout Component
 *
 * Arranges nodes in a circle for clear visibility of all nodes and edges.
 * Good for small to medium graphs where you want to see all connections.
 */

import { FC, useEffect } from 'react';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { LayoutProcessorProps } from './types';

interface CircularLayoutProps extends LayoutProcessorProps {
  /** Radius scale factor (default: 0.3) */
  scale?: number;
}

const CircularLayout: FC<CircularLayoutProps> = ({
  config,
  animate = false,
  animationDuration = 500,
  onLayoutComplete
}) => {
  // Use same parameters as working NetworkGraphAllLayouts
  const { assign } = useLayoutCircular({
    scale: config?.scale || 100,
    center: config?.center || 0,
  });

  useEffect(() => {
    console.log('CircularLayout: Applying layout');
    assign();

    if (onLayoutComplete) {
      onLayoutComplete();
    }
  }, [assign, onLayoutComplete]);

  return null;
};

export default CircularLayout;