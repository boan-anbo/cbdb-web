/**
 * ForceAtlas2 Worker Layout - Animated version using Web Worker
 */

import { FC, useEffect } from 'react';
import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';

interface ForceAtlas2WorkerLayoutProps {
  duration?: number; // How long to run the animation (ms)
  onComplete?: () => void;
}

const ForceAtlas2WorkerLayout: FC<ForceAtlas2WorkerLayoutProps> = ({
  duration = 3000,
  onComplete
}) => {
  const { start, stop, kill, isRunning } = useWorkerLayoutForceAtlas2({
    settings: {
      gravity: 1,
      adjustSizes: true,
      barnesHutOptimize: true,
      strongGravityMode: false,
      slowDown: 10,
      outboundAttractionDistribution: false,
      linLogMode: false,
      edgeWeightInfluence: 1,
      scalingRatio: 10,
    },
  });

  useEffect(() => {
    console.log('Starting ForceAtlas2 Worker layout');

    // Start the worker-based layout
    start();

    // Stop after the specified duration
    const timer = setTimeout(() => {
      console.log('Stopping ForceAtlas2 Worker layout');
      stop();
      if (onComplete) onComplete();
    }, duration);

    // Cleanup: kill the worker when component unmounts
    return () => {
      clearTimeout(timer);
      if (isRunning()) {
        stop();
      }
      kill();
    };
  }, [start, stop, kill, isRunning, duration, onComplete]);

  return null;
};

export default ForceAtlas2WorkerLayout;