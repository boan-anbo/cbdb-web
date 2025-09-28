/**
 * Circlepack Layout Component
 *
 * Hierarchical circle packing layout.
 * Works best with hierarchical or clustered data.
 */

import { FC, useEffect } from 'react';
import { useLayoutCirclepack } from '@react-sigma/layout-circlepack';
import { LayoutProcessorProps } from './types';

const CirclepackLayout: FC<LayoutProcessorProps> = ({
  config,
  onLayoutComplete
}) => {
  const { assign } = useLayoutCirclepack({
    scale: config?.scale || 100,
    center: config?.center || 0,
    hierarchyAttributes: config?.hierarchyAttributes || ['community', 'cluster'],
  });

  useEffect(() => {
    try {
      assign();
    } catch (error) {
      console.warn('CirclePack layout error (may need hierarchical data):', error);
    }
    if (onLayoutComplete) {
      onLayoutComplete();
    }
  }, [assign, onLayoutComplete]);

  return null;
};

export default CirclepackLayout;