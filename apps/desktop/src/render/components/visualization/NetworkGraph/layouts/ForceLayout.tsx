/**
 * Force Layout Component
 *
 * Uses React Sigma's force layout with Web Worker support.
 * Runs in background worker to prevent UI blocking for large graphs.
 */

import { FC, useEffect } from 'react';
import { useWorkerLayoutForce } from '@react-sigma/layout-force';
import { LayoutProcessorProps } from './types';

const ForceLayout: FC<LayoutProcessorProps> = ({
  config,
  onLayoutComplete
}) => {
  // Use worker-based force layout for non-blocking computation
  const { start, stop, isRunning } = useWorkerLayoutForce({
    maxIterations: config?.maxIterations || 1000, // Can use more iterations with worker
    settings: {
      attraction: config?.attraction || 0.005,
      repulsion: config?.repulsion || 0.1,
      gravity: config?.gravity || 0.0001,
      inertia: config?.inertia || 0.8,
      maxMove: config?.maxMove || 200,
    }
  });

  useEffect(() => {
    console.log('[ForceLayout] Starting worker-based force layout');

    // Start the layout worker
    start();

    // Optional: Stop after a certain time if duration is specified
    let timeout: NodeJS.Timeout | undefined;
    if (config?.duration && config.duration > 0) {
      timeout = setTimeout(() => {
        console.log('[ForceLayout] Auto-stopping worker after', config.duration, 'ms');
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
      console.log('[ForceLayout] Component unmounting, stopping worker');
      stop(); // Gracefully stop the worker
    };
  }, [start, stop]); // Add minimal dependencies so it restarts properly

  return null;
};

export default ForceLayout;