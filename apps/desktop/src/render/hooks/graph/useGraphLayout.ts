/**
 * useGraphLayout Hook
 *
 * React hook for managing graph layout algorithms and visualization settings.
 * Works with graphology and sigma.js for rendering.
 */

import { useState, useCallback, useMemo } from 'react';
import Graph from 'graphology';
import { SerializedGraph } from 'graphology-types';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import circular from 'graphology-layout/circular';
import random from 'graphology-layout/random';
import { NetworkExplorationResponse } from '@cbdb/core';

export type LayoutType = 'force' | 'circular' | 'random' | 'hierarchical';

interface LayoutSettings {
  iterations?: number;
  gravity?: number;
  scalingRatio?: number;
  barnesHutOptimize?: boolean;
  strongGravityMode?: boolean;
  outboundAttractionDistribution?: boolean;
}

interface UseGraphLayoutOptions {
  defaultLayout?: LayoutType;
  defaultSettings?: LayoutSettings;
}

/**
 * Hook for managing graph layout and visualization
 */
export function useGraphLayout(options?: UseGraphLayoutOptions) {
  const [layout, setLayout] = useState<LayoutType>(options?.defaultLayout || 'force');
  const [settings, setSettings] = useState<LayoutSettings>(
    options?.defaultSettings || {
      iterations: 100,
      gravity: 1,
      scalingRatio: 10,
      barnesHutOptimize: true,
      strongGravityMode: false,
      outboundAttractionDistribution: false
    }
  );

  /**
   * Convert network response to graphology graph
   */
  const createGraph = useCallback((data: NetworkExplorationResponse | SerializedGraph) => {
    const graph = new Graph();

    // Handle both NetworkExplorationResponse and SerializedGraph
    const graphData = 'graph' in data ? data.graph : data;

    // Add nodes
    if (graphData.nodes) {
      graphData.nodes.forEach((node: any) => {
        graph.addNode(node.id || node.key, {
          ...node.attributes,
          label: node.attributes?.label || node.attributes?.nameChn || node.attributes?.name || String(node.id || node.key),
          size: node.attributes?.size || 10,
          color: node.attributes?.color || '#666666'
        });
      });
    }

    // Add edges
    if (graphData.edges) {
      graphData.edges.forEach((edge: any, index: number) => {
        const edgeKey = edge.key || `${edge.source}-${edge.target}-${index}`;
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            ...edge.attributes,
            size: edge.attributes?.weight || 1,
            color: edge.attributes?.color || '#cccccc'
          }, edgeKey);
        }
      });
    }

    return graph;
  }, []);

  /**
   * Apply layout algorithm to graph
   */
  const applyLayout = useCallback((graph: Graph, layoutType?: LayoutType) => {
    const currentLayout = layoutType || layout;

    switch (currentLayout) {
      case 'force':
        forceAtlas2.assign(graph, {
          iterations: settings.iterations,
          settings: {
            gravity: settings.gravity,
            scalingRatio: settings.scalingRatio,
            barnesHutOptimize: settings.barnesHutOptimize,
            strongGravityMode: settings.strongGravityMode,
            outboundAttractionDistribution: settings.outboundAttractionDistribution
          }
        });
        break;

      case 'circular':
        circular.assign(graph);
        break;

      case 'random':
        random.assign(graph);
        break;

      case 'hierarchical':
        // TODO: Implement hierarchical layout
        // For now, use circular as fallback
        circular.assign(graph);
        break;

      default:
        forceAtlas2.assign(graph, { iterations: 100 });
    }

    return graph;
  }, [layout, settings]);

  /**
   * Process network data and apply layout
   */
  const processNetworkData = useCallback((data: NetworkExplorationResponse | SerializedGraph) => {
    const graph = createGraph(data);
    applyLayout(graph);
    return graph;
  }, [createGraph, applyLayout]);

  /**
   * Update layout settings
   */
  const updateSettings = useCallback((newSettings: Partial<LayoutSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Get node positions as object
   */
  const getPositions = useCallback((graph: Graph) => {
    const positions: Record<string, { x: number; y: number }> = {};
    graph.forEachNode((node, attributes) => {
      positions[node] = {
        x: attributes.x || 0,
        y: attributes.y || 0
      };
    });
    return positions;
  }, []);

  /**
   * Calculate graph metrics
   */
  const calculateMetrics = useCallback((graph: Graph) => {
    const nodeCount = graph.order;
    const edgeCount = graph.size;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;

    let totalDegree = 0;
    graph.forEachNode((node) => {
      totalDegree += graph.degree(node);
    });
    const avgDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    return {
      nodeCount,
      edgeCount,
      density,
      avgDegree
    };
  }, []);

  /**
   * Filter graph by node/edge attributes
   */
  const filterGraph = useCallback((
    graph: Graph,
    nodeFilter?: (attributes: any) => boolean,
    edgeFilter?: (attributes: any) => boolean
  ) => {
    const filteredGraph = graph.copy();

    // Filter nodes
    if (nodeFilter) {
      filteredGraph.forEachNode((node, attributes) => {
        if (!nodeFilter(attributes)) {
          filteredGraph.dropNode(node);
        }
      });
    }

    // Filter edges
    if (edgeFilter) {
      filteredGraph.forEachEdge((edge, attributes) => {
        if (!edgeFilter(attributes)) {
          filteredGraph.dropEdge(edge);
        }
      });
    }

    return filteredGraph;
  }, []);

  return {
    layout,
    setLayout,
    settings,
    updateSettings,
    createGraph,
    applyLayout,
    processNetworkData,
    getPositions,
    calculateMetrics,
    filterGraph
  };
}

/**
 * Hook for managing graph node/edge selection
 */
export function useGraphSelection() {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const selectNode = useCallback((nodeId: string, multiSelect: boolean = false) => {
    setSelectedNodes(prev => {
      const newSet = new Set(multiSelect ? prev : []);
      newSet.add(nodeId);
      return newSet;
    });
  }, []);

  const deselectNode = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes(new Set());
    setSelectedEdges(new Set());
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  return {
    selectedNodes,
    selectedEdges,
    hoveredNode,
    setHoveredNode,
    selectNode,
    deselectNode,
    clearSelection,
    toggleNodeSelection
  };
}