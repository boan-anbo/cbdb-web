/**
 * GraphControls Component
 *
 * Provides standard controls for graph interaction.
 * Includes zoom, fullscreen, search, and layout selection.
 */

import { FC } from 'react';
import {
  ControlsContainer,
  FullScreenControl,
  ZoomControl
} from '@react-sigma/core';
import { GraphSearch } from '@react-sigma/graph-search';
import { ControlsConfig } from './types';
import LayoutSelector from './LayoutSelector';

interface GraphControlsProps extends ControlsConfig {
  /** Available layouts for selector */
  availableLayouts?: string[];
  /** Current layout */
  currentLayout?: string;
  /** Layout change handler */
  onLayoutChange?: (layout: string) => void;
}

const GraphControls: FC<GraphControlsProps> = ({
  showFullscreen = true,
  showZoom = true,
  showSearch = true,
  showLayoutSelector = true,
  position = 'bottom-right',
  containerOpacity = 0.3,
  searchWidth = 250,
  labels = {},
  availableLayouts,
  currentLayout,
  onLayoutChange
}) => {
  // Container styles with transparency
  const containerStyles: React.CSSProperties = {
    backgroundColor: `rgba(255, 255, 255, ${containerOpacity})`,
    backdropFilter: 'blur(8px)',
    borderRadius: '8px',
    padding: '8px',
  };

  // Search container styles
  const searchContainerStyles: React.CSSProperties = {
    ...containerStyles,
    width: `${searchWidth}px`,
  };

  // Center the buttons in bottom-right controls
  const bottomRightStyles: React.CSSProperties = {
    ...containerStyles,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      {/* Inject global styles for all sigma controls */}
      <style>{`
        /* Bottom-right controls styling */
        .react-sigma-controls.bottom-right {
          background-color: rgba(255, 255, 255, ${containerOpacity}) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 8px !important;
          padding: 8px !important;
        }

        /* Center the buttons */
        .react-sigma-controls.bottom-right .react-sigma-control {
          display: flex !important;
          justify-content: center !important;
        }

        /* Top-left search styling */
        .react-sigma-controls.top-left {
          background-color: rgba(255, 255, 255, ${containerOpacity}) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 8px !important;
          padding: 8px !important;
          width: ${searchWidth}px !important;
        }

        /* Style the search input */
        .react-sigma-controls.top-left .react-select__control {
          background-color: transparent !important;
          border-color: rgba(224, 224, 224, 0.5) !important;
        }

        .react-sigma-controls.top-left .react-select__control--is-focused {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Main controls (zoom, fullscreen) at bottom-right */}
      <ControlsContainer position={position}>
        {showFullscreen && (
          <FullScreenControl
            labels={{
              enterFullScreen: labels.fullscreen || "Fullscreen",
              exitFullScreen: labels.exitFullscreen || "Exit Fullscreen"
            }}
          />
        )}

        {showZoom && (
          <ZoomControl
            labels={{
              zoomIn: labels.zoomIn || "Zoom In",
              zoomOut: labels.zoomOut || "Zoom Out",
              reset: labels.zoomReset || "Reset"
            }}
          />
        )}
      </ControlsContainer>

      {/* Search at top-left */}
      {showSearch && (
        <ControlsContainer position="top-left">
          <GraphSearch />
        </ControlsContainer>
      )}

      {/* Layout selector at top-right */}
      {showLayoutSelector && availableLayouts && onLayoutChange && (
        <LayoutSelector
          availableLayouts={availableLayouts}
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
          position="top-right"
          containerOpacity={containerOpacity}
        />
      )}
    </>
  );
};

export default GraphControls;