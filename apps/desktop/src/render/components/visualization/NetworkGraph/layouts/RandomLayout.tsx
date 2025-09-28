/**
 * Random Layout Component
 *
 * Uses React Sigma's random layout to position nodes.
 */

import { FC, useEffect } from 'react';
import { useLayoutRandom } from '@react-sigma/layout-random';
import { LayoutProcessorProps } from './types';

const RandomLayout: FC<LayoutProcessorProps> = ({
  config,
  onLayoutComplete
}) => {
  const { assign } = useLayoutRandom({
    scale: config?.scale || 100,
    center: config?.center || 0,
  });

  useEffect(() => {
    assign();
    if (onLayoutComplete) {
      onLayoutComplete();
    }
  }, [assign, onLayoutComplete]);

  return null;
};

export default RandomLayout;