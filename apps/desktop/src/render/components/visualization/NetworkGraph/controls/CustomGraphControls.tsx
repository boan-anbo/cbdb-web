/**
 * Custom Graph Controls Component
 *
 * Custom implementation of graph controls with full styling control.
 * Uses useSigma hook to interact with the graph programmatically.
 */

import { FC, useState, useCallback, useEffect } from 'react';
import { useSigma, useCamera } from '@react-sigma/core';
import { GraphSearch } from '@react-sigma/graph-search';
import '@react-sigma/graph-search/lib/style.css';
import './graph-controls.css'; // Import fullscreen styles
import { ControlsConfig } from './types';
import LayoutSelector from './LayoutSelector';
import { defaultTheme, getContainerStyles, getButtonStyles, getSearchControlCSS } from './styles';

interface CustomGraphControlsProps extends ControlsConfig {
  /** Available layouts for selector */
  availableLayouts?: string[];
  /** Current layout */
  currentLayout?: string;
  /** Layout change handler */
  onLayoutChange?: (layout: string) => void;
}

/**
 * Custom Zoom/Fullscreen Controls using useSigma
 */
const CustomControls: FC<{ theme?: Partial<typeof defaultTheme> }> = ({ theme = {} }) => {
  const sigma = useSigma();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = { ...defaultTheme, ...theme };

  const handleZoomIn = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ ratio: 0.5 });
  }, [sigma]);

  const handleZoomOut = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ ratio: 0.5 });
  }, [sigma]);

  const handleZoomReset = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedReset();
  }, [sigma]);

  const handleFullscreen = useCallback(() => {
    // Get the parent container that wraps the entire graph
    const container = sigma.getContainer();
    const parentElement = container.parentElement;

    if (!isFullscreen) {
      // Request fullscreen on the parent element
      // CSS handles background colors via :fullscreen pseudo-class
      if (parentElement && parentElement.requestFullscreen) {
        parentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [sigma, isFullscreen]);

  // Listen for fullscreen changes to update state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const buttonStyles = getButtonStyles(theme);

  const containerStyles: React.CSSProperties = {
    ...getContainerStyles(theme),
    position: 'absolute',
    bottom: `${t.spacing}px`,
    right: `${t.spacing}px`,
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={containerStyles}>
      <button
        style={buttonStyles}
        onClick={handleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `rgba(224, 224, 224, 0.3)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>
      <button
        style={buttonStyles}
        onClick={handleZoomIn}
        title="Zoom In"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `rgba(224, 224, 224, 0.3)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        +
      </button>
      <button
        style={buttonStyles}
        onClick={handleZoomOut}
        title="Zoom Out"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `rgba(224, 224, 224, 0.3)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        −
      </button>
      <button
        style={buttonStyles}
        onClick={handleZoomReset}
        title="Reset View"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `rgba(224, 224, 224, 0.3)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ⊙
      </button>
    </div>
  );
};

/**
 * Custom Search Control - Wrapper for GraphSearch with custom styling
 */
const CustomSearchControl: FC<{ theme?: Partial<typeof defaultTheme> }> = ({ theme = {} }) => {
  const sigma = useSigma();
  const { gotoNode } = useCamera();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const t = { ...defaultTheme, ...theme };

  // Handle when user hovers over a search result
  const handleFocus = useCallback((option: any) => {
    if (option && option.type === 'nodes') {
      // Highlight the node when hovering
      const graph = sigma.getGraph();
      graph.setNodeAttribute(option.id, 'highlighted', true);
    }
  }, [sigma]);

  // Handle when user selects a node (click or enter)
  const handleChange = useCallback((option: any) => {
    if (option && option.type === 'nodes') {
      setSelectedNode(option.id);

      // Get the graph
      const graph = sigma.getGraph();

      // Use the gotoNode utility from useCamera hook
      // This is the recommended way to focus on a node
      gotoNode(option.id, {
        duration: 500,
        factor: 1.5,  // How close to zoom (1 = fit perfectly, <1 = zoom in more)
      });

      // Optional: Highlight the selected node
      graph.forEachNode((node) => {
        if (node === option.id) {
          // Highlight selected node
          graph.setNodeAttribute(node, 'highlighted', true);
          const originalColor = graph.getNodeAttribute(node, 'color');
          if (originalColor && !graph.getNodeAttribute(node, 'originalColor')) {
            graph.setNodeAttribute(node, 'originalColor', originalColor);
          }
          graph.setNodeAttribute(node, 'color', '#ff0000');
        } else {
          // Reset other nodes
          graph.setNodeAttribute(node, 'highlighted', false);
          const originalColor = graph.getNodeAttribute(node, 'originalColor');
          if (originalColor) {
            graph.setNodeAttribute(node, 'color', originalColor);
          }
        }
      });
    } else {
      // Clear selection when search is cleared
      setSelectedNode(null);
      const graph = sigma.getGraph();
      graph.forEachNode((node) => {
        graph.setNodeAttribute(node, 'highlighted', false);
        const originalColor = graph.getNodeAttribute(node, 'originalColor');
        if (originalColor) {
          graph.setNodeAttribute(node, 'color', originalColor);
        }
      });
    }
  }, [sigma]);

  const containerStyles: React.CSSProperties = {
    ...getContainerStyles(theme),
    position: 'absolute',
    top: `${t.spacing}px`,
    left: `${t.spacing}px`,
    padding: '0',
    width: `${t.controlWidth}px`,
  };

  // Clear search when clicking on the input
  useEffect(() => {
    // Add event listener to detect clicks on the search input
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is on the search input or its container
      if (target.closest('.custom-search-container')) {
        // Clear the selected node
        if (selectedNode) {
          setSelectedNode(null);
          // Also clear highlights
          const graph = sigma.getGraph();
          graph.forEachNode((node) => {
            graph.setNodeAttribute(node, 'highlighted', false);
            const originalColor = graph.getNodeAttribute(node, 'originalColor');
            if (originalColor) {
              graph.setNodeAttribute(node, 'color', originalColor);
            }
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [selectedNode, sigma]);


  return (
    <>
      <div
        style={containerStyles}
        className="custom-search-container"
      >
        <GraphSearch
          type="nodes"
          value={selectedNode ? { type: 'nodes', id: selectedNode } : null}
          onFocus={handleFocus}
          onChange={handleChange}
        />
      </div>

      {/* Custom CSS from centralized styles */}
      <style>{getSearchControlCSS(theme)}</style>
    </>
  );
};

/**
 * Main Custom Graph Controls Component
 */
const CustomGraphControls: FC<CustomGraphControlsProps> = ({
  showFullscreen = true,
  showZoom = true,
  showSearch = true,
  showLayoutSelector = true,
  containerOpacity = defaultTheme.containerOpacity,
  searchWidth = defaultTheme.controlWidth,
  availableLayouts,
  currentLayout,
  onLayoutChange
}) => {
  // Create theme configuration
  const theme: Partial<typeof defaultTheme> = {
    containerOpacity,
    controlWidth: searchWidth,
  };

  return (
    <>
      {/* Custom controls for zoom and fullscreen */}
      {(showZoom || showFullscreen) && (
        <CustomControls theme={theme} />
      )}

      {/* Custom search control */}
      {showSearch && (
        <CustomSearchControl theme={theme} />
      )}

      {/* Layout selector at top-right */}
      {showLayoutSelector && availableLayouts && onLayoutChange && (
        <LayoutSelector
          availableLayouts={availableLayouts}
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
          position="top-right"
          containerOpacity={containerOpacity}
          width={120}  // Independent width for layout selector
        />
      )}
    </>
  );
};

export default CustomGraphControls;