/**
 * LayoutManager Component
 *
 * Dynamically renders the appropriate layout component based on selection.
 * Handles smooth transitions between layouts.
 */

import { FC, memo } from 'react';
import { LayoutType, LayoutConfig } from './types';
import CircularLayout from './CircularLayout';
import RandomLayout from './RandomLayout';
import ForceLayout from './ForceLayout';
import ForceAtlas2Layout from './ForceAtlas2Layout';
import NoverlapLayout from './NoverlapLayout';
import CirclepackLayout from './CirclepackLayout';

interface LayoutManagerProps {
  /** Selected layout type */
  layout: LayoutType;
  /** Layout configuration */
  config?: LayoutConfig;
  /** Animation settings */
  animate?: boolean;
  /** Callback when layout is complete */
  onLayoutComplete?: () => void;
}

const LayoutManager: FC<LayoutManagerProps> = memo(({
  layout,
  config,
  animate = false,
  onLayoutComplete
}) => {
  // Render the appropriate layout component
  switch (layout) {
    case 'circular':
      return (
        <CircularLayout
          config={config}
          animate={animate}
          onLayoutComplete={onLayoutComplete}
        />
      );

    case 'random':
      return (
        <RandomLayout
          config={config}
          onLayoutComplete={onLayoutComplete}
        />
      );

    case 'force':
      return (
        <ForceLayout
          config={config}
          onLayoutComplete={onLayoutComplete}
        />
      );

    case 'forceatlas2':
      return (
        <ForceAtlas2Layout
          config={config?.forceatlas2 || config}
          onLayoutComplete={onLayoutComplete}
        />
      );

    case 'noverlap':
      return (
        <NoverlapLayout
          config={config}
          onLayoutComplete={onLayoutComplete}
        />
      );

    case 'circlepack':
      return (
        <CirclepackLayout
          config={config}
          onLayoutComplete={onLayoutComplete}
        />
      );

    default:
      console.warn(`Unknown layout type: ${layout}, falling back to circular`);
      return (
        <CircularLayout
          config={config}
          animate={animate}
          onLayoutComplete={onLayoutComplete}
        />
      );
  }
});

LayoutManager.displayName = 'LayoutManager';

export default LayoutManager;