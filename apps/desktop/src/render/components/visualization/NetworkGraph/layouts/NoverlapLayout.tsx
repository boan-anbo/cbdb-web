/**
 * Noverlap Layout Component
 *
 * Uses React Sigma's Noverlap layout with Web Worker support.
 * Prevents node overlapping by adjusting positions in background worker.
 */

import { FC, useEffect } from 'react';
import { useWorkerLayoutNoverlap } from '@react-sigma/layout-noverlap';
import { LayoutProcessorProps } from './types';

const NoverlapLayout: FC<LayoutProcessorProps> = ({
  config,
  onLayoutComplete
}) => {
  // Use worker-based noverlap layout for non-blocking computation
  const { start, stop, isRunning } = useWorkerLayoutNoverlap({
    maxIterations: config?.maxIterations || 500, // Can use more iterations with worker
    settings: {
      ratio: config?.ratio || 10,
      margin: config?.margin || 5,
      expansion: config?.expansion || 1.2,
      gridSize: config?.gridSize || 20,
      speed: config?.speed || 3,
    }
  });

  useEffect(() => {
    console.log('[NoverlapLayout] Starting worker-based noverlap layout');

    // Start the layout worker
    start();

    // Optional: Stop after a certain time if duration is specified
    let timeout: NodeJS.Timeout | undefined;
    if (config?.duration && config.duration > 0) {
      timeout = setTimeout(() => {
        console.log('[NoverlapLayout] Auto-stopping worker after', config.duration, 'ms');
        stop();
        if (onLayoutComplete) {
          onLayoutComplete();
        }
      }, config.duration);
    }

    // Call onLayoutComplete immediately since layout is continuous
    if (onLayoutComplete && !config?.duration) {
      // Give it a moment to start before calling complete
      setTimeout(onLayoutComplete, 100);
    }

    // Cleanup - only stop worker when component unmounts
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      console.log('[NoverlapLayout] Component unmounting, stopping worker');
      stop(); // Gracefully stop the worker
    };
  }, [start, stop]); // Add minimal dependencies so it restarts properly

  return null;
};

export default NoverlapLayout;