/**
 * useGraphControl Hook
 *
 * Provides programmatic control over the graph visualization.
 * Returns an API object for controlling zoom, layout, search, etc.
 */

import { useCallback, useRef, useState } from 'react';
import { useSigma } from '@react-sigma/core';
import { GraphControlAPI } from './types';
import { LayoutType } from '../layouts/types';

export function useGraphControl(
  initialLayout: LayoutType = 'circular'
): GraphControlAPI {
  const sigma = useSigma();
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(initialLayout);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Zoom controls
  const zoomIn = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ duration: 300, factor: 1.5 });
  }, [sigma]);

  const zoomOut = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ duration: 300, factor: 1.5 });
  }, [sigma]);

  const zoomReset = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedReset({ duration: 300 });
  }, [sigma]);

  const setZoom = useCallback((level: number) => {
    const camera = sigma.getCamera();
    camera.setState({ ratio: 1 / level });
  }, [sigma]);

  // Layout controls
  const setLayout = useCallback((layout: LayoutType) => {
    setCurrentLayout(layout);
    // Layout change is handled by the NetworkGraph component
  }, []);

  const getCurrentLayout = useCallback(() => {
    return currentLayout;
  }, [currentLayout]);

  // Search controls
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    const graph = sigma.getGraph();

    // Highlight matching nodes
    graph.forEachNode((node, attributes) => {
      const label = attributes.label || '';
      const matches = label.toLowerCase().includes(query.toLowerCase());

      graph.setNodeAttribute(node, 'highlighted', matches);
      if (!matches && query) {
        graph.setNodeAttribute(node, 'color', '#e0e0e0');
        graph.setNodeAttribute(node, 'zIndex', 0);
      } else {
        // Reset to original color
        graph.setNodeAttribute(node, 'color', attributes.originalColor || attributes.color);
        graph.setNodeAttribute(node, 'zIndex', matches ? 10 : 1);
      }
    });

    sigma.refresh();
  }, [sigma]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    const graph = sigma.getGraph();

    // Reset all nodes
    graph.forEachNode((node, attributes) => {
      graph.setNodeAttribute(node, 'highlighted', false);
      graph.setNodeAttribute(node, 'color', attributes.originalColor || attributes.color);
      graph.setNodeAttribute(node, 'zIndex', 1);
    });

    sigma.refresh();
  }, [sigma]);

  // Fullscreen controls
  const enterFullscreen = useCallback(() => {
    const container = sigma.getContainer();
    if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  }, [sigma]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Export controls
  const exportImage = useCallback((format: 'png' | 'jpeg' = 'png') => {
    const renderer = sigma.getRenderer();
    const canvas = renderer.getCanvas();

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `graph.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, `image/${format}`);
  }, [sigma]);

  const exportData = useCallback(() => {
    const graph = sigma.getGraph();
    return graph.export();
  }, [sigma]);

  return {
    // Zoom
    zoomIn,
    zoomOut,
    zoomReset,
    setZoom,

    // Layout
    setLayout,
    getCurrentLayout,

    // Search
    search,
    clearSearch,

    // Fullscreen
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,

    // Export
    exportImage,
    exportData
  };
}