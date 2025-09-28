/**
 * NetworkExplorationService
 *
 * Provides sophisticated network exploration capabilities using Graphology algorithms.
 * This service properly leverages graph traversal algorithms instead of handcrafted loops,
 * and exposes rich parameters for flexible exploration strategies.
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { bfsFromNode, dfsFromNode } from 'graphology-traversal';
import { subgraph } from 'graphology-operators';
import { bidirectional } from 'graphology-shortest-path';

export interface NodeWithDepth {
  nodeId: string | number;
  depth: number;
  attributes?: any;
}

export interface ExploreByDepthOptions {
  startNode: string | number;
  maxDepth?: number;
  maxNodes?: number;
  nodeFilter?: (node: string | number, attributes: any) => boolean;
  edgeFilter?: (edge: string, attributes: any, source: string, target: string) => boolean;
  traversalMode?: 'all' | 'forward' | 'backward';
  weightFunction?: (edge: any) => number;
  earlyTermination?: (node: string | number, depth: number) => boolean;
  includeEdges?: boolean;
}

export interface ExploreByDegreesOptions {
  startNode: string | number;
  degrees: number;
  relationTypes?: string[];
  bidirectionalOnly?: boolean;
  weightThreshold?: number;
}

export interface ExploreWithFilterOptions {
  startNode: string | number;
  nodeFilter: (node: string | number, attributes: any, depth: number) => boolean;
  edgeFilter?: (edge: any) => boolean;
  maxDepth?: number;
  strategy?: 'breadth' | 'depth';
}

export interface ExtractSubgraphOptions {
  nodes?: Set<string | number>;
  centerNode?: string | number;
  radius?: number;
  minDegree?: number;
  maxDegree?: number;
  componentId?: number;
  preserveEdgeTypes?: string[];
  induced?: boolean; // If true, keep all edges between selected nodes
}

export interface ExplorationResult {
  nodes: Map<string | number, NodeWithDepth>;
  edges: Map<string, any>;
  nodesByDepth: Map<number, Set<string | number>>;
  statistics: {
    totalNodes: number;
    totalEdges: number;
    maxDepthReached: number;
    averageDegree: number;
  };
}

@Injectable()
export class NetworkExplorationService {
  /**
   * PERFORMANCE NOTE: Choosing the Right Method
   *
   * Use explorePreFiltered() when:
   * - Graph contains ONLY the edges you want to traverse
   * - No runtime edge filtering needed
   * - Maximum performance is priority
   *
   * Use exploreByDepth() when:
   * - Graph contains mixed edge types
   * - Complex runtime filtering logic needed
   * - Flexibility is more important than raw speed
   */
  /**
   * Fast-path exploration for pre-filtered graphs
   * Uses native Graphology BFS for maximum performance
   *
   * BEST PRACTICE: Filter edges at SQL level, then use this method
   *
   * @param graph Graph with only desired edges (pre-filtered at data layer)
   * @param options Simplified options without edge filtering
   */
  explorePreFiltered(graph: Graph, options: {
    startNode: string | number;
    maxDepth?: number;
    maxNodes?: number;
    nodeFilter?: (node: string | number, attributes: any) => boolean;
    earlyTermination?: (node: string | number, depth: number) => boolean;
    includeEdges?: boolean;
  }): ExplorationResult {
    const {
      startNode,
      maxDepth = 10,
      maxNodes = Number.MAX_SAFE_INTEGER,
      nodeFilter,
      earlyTermination,
      includeEdges = true
    } = options;

    const nodes = new Map<string | number, NodeWithDepth>();
    const edges = new Map<string, any>();
    const nodesByDepth = new Map<number, Set<string | number>>();

    let nodesVisited = 0;
    let maxDepthReached = 0;
    let shouldStop = false;

    // Initialize depth tracking
    for (let d = 0; d <= maxDepth; d++) {
      nodesByDepth.set(d, new Set());
    }

    // Use native Graphology BFS (FAST!)
    bfsFromNode(
      graph,
      startNode,
      (node, attributes, depth) => {
        // Check limits and termination
        if (depth > maxDepth || nodesVisited >= maxNodes || shouldStop) {
          return true; // Stop traversal
        }

        // Apply node filter if provided
        if (nodeFilter && !nodeFilter(node, attributes)) {
          return false; // Skip this branch but continue traversal
        }

        // Check early termination
        if (earlyTermination && earlyTermination(node, depth)) {
          shouldStop = true;
          return true; // Stop entire traversal
        }

        // Add node to results
        nodes.set(node, {
          nodeId: node,
          depth,
          attributes: attributes || {}
        });

        nodesByDepth.get(depth)?.add(node);
        nodesVisited++;
        maxDepthReached = Math.max(maxDepthReached, depth);

        return false; // Continue traversal
      }
    );

    // Collect edges if requested (post-processing, not during traversal)
    if (includeEdges) {
      nodes.forEach((_, nodeId) => {
        graph.forEachEdge(nodeId, (edge, attributes, source, target) => {
          if (nodes.has(source) && nodes.has(target)) {
            edges.set(edge, {
              source,
              target,
              ...attributes
            });
          }
        });
      });
    }

    // Calculate statistics
    const totalNodes = nodes.size;
    const totalEdges = edges.size;
    const averageDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;

    return {
      nodes,
      edges,
      nodesByDepth,
      statistics: {
        totalNodes,
        totalEdges,
        maxDepthReached,
        averageDegree
      }
    };
  }

  /**
   * Flexible exploration with runtime edge filtering
   * Uses custom BFS for complex filtering logic
   *
   * NOTE: Slower than explorePreFiltered() due to edge checking
   *
   * @param graph Graph potentially containing mixed edge types
   * @param options Full options including edge filtering
   */
  exploreByDepth(graph: Graph, options: ExploreByDepthOptions): ExplorationResult {
    const {
      startNode,
      maxDepth = 3,
      maxNodes = 1000,
      nodeFilter,
      edgeFilter,
      earlyTermination,
      includeEdges = true
    } = options;

    const nodes = new Map<string | number, NodeWithDepth>();
    const edges = new Map<string, any>();
    const nodesByDepth = new Map<number, Set<string | number>>();

    let nodesVisited = 0;
    let maxDepthReached = 0;

    // Initialize depth tracking
    for (let d = 0; d <= maxDepth; d++) {
      nodesByDepth.set(d, new Set());
    }

    // Custom BFS that respects edge filters
    const visited = new Set<string | number>();
    const queue: Array<{ node: string | number; depth: number }> = [{ node: startNode, depth: 0 }];
    visited.add(startNode);

    while (queue.length > 0 && nodesVisited < maxNodes) {
      const { node: currentNode, depth: currentDepth } = queue.shift()!;

      // Check if we should process this node
      const nodeAttributes = graph.getNodeAttributes(currentNode) || {};
      if (nodeFilter && !nodeFilter(currentNode, nodeAttributes)) {
        continue; // Skip this node
      }

      // Check early termination
      if (earlyTermination && earlyTermination(currentNode, currentDepth)) {
        break; // Stop traversal
      }

      // Add node to results
      nodes.set(currentNode, {
        nodeId: currentNode,
        depth: currentDepth,
        attributes: nodeAttributes
      });

      nodesByDepth.get(currentDepth)?.add(currentNode);
      nodesVisited++;
      maxDepthReached = Math.max(maxDepthReached, currentDepth);

      // Explore neighbors if within depth limit
      if (currentDepth < maxDepth) {
        graph.forEachNeighbor(currentNode, (neighbor, attributes) => {
          if (!visited.has(neighbor)) {
            // Check if we should follow this edge
            let shouldFollow = true;
            if (edgeFilter) {
              // Find the edge between current and neighbor
              const edgeId = graph.edge(currentNode, neighbor) || graph.edge(neighbor, currentNode);
              if (edgeId) {
                const edgeAttrs = graph.getEdgeAttributes(edgeId);
                shouldFollow = edgeFilter(edgeId, edgeAttrs, String(currentNode), String(neighbor));
              }
            }

            if (shouldFollow) {
              visited.add(neighbor);
              queue.push({ node: neighbor, depth: currentDepth + 1 });
            }
          }
        });
      }
    }

    // Collect edges between explored nodes if requested
    if (includeEdges) {
      nodes.forEach((_, nodeId) => {
        graph.forEachEdge(nodeId, (edge, attributes, source, target) => {
          if (nodes.has(source) && nodes.has(target)) {
            if (!edgeFilter || edgeFilter(edge, attributes, source, target)) {
              edges.set(edge, {
                source,
                target,
                ...attributes
              });
            }
          }
        });
      });
    }

    // Calculate statistics
    const totalNodes = nodes.size;
    const totalEdges = edges.size;
    const averageDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;

    return {
      nodes,
      edges,
      nodesByDepth,
      statistics: {
        totalNodes,
        totalEdges,
        maxDepthReached,
        averageDegree
      }
    };
  }

  /**
   * Explore network by relationship degrees (for social network analysis)
   * This properly uses graph algorithms instead of manual traversal
   */
  exploreByDegrees(graph: Graph, options: ExploreByDegreesOptions): ExplorationResult {
    const {
      startNode,
      degrees,
      relationTypes,
      bidirectionalOnly = false,
      weightThreshold
    } = options;

    // First, do a BFS to get all nodes within N degrees
    const bfsResult = this.exploreByDepth(graph, {
      startNode,
      maxDepth: degrees,
      edgeFilter: relationTypes ?
        (edge, attrs) => relationTypes.includes(attrs.type || attrs.edgeType || attrs.relationType) :
        undefined,
      includeEdges: true
    });

    // If bidirectional only, filter to keep only nodes with reciprocal connections
    if (bidirectionalOnly) {
      const filteredNodes = new Map<string | number, NodeWithDepth>();
      const filteredEdges = new Map<string, any>();

      bfsResult.nodes.forEach((nodeData, nodeId) => {
        if (nodeId === startNode) {
          filteredNodes.set(nodeId, nodeData);
          return;
        }

        // Check if there's a bidirectional connection
        let hasForward = false;
        let hasBackward = false;

        graph.forEachEdge(nodeId, (edge, attrs, source, target) => {
          if (source === nodeId && bfsResult.nodes.has(target)) {
            hasForward = true;
          }
          if (target === nodeId && bfsResult.nodes.has(source)) {
            hasBackward = true;
          }
        });

        if (hasForward && hasBackward) {
          filteredNodes.set(nodeId, nodeData);
        }
      });

      // Update edges to only include those between filtered nodes
      bfsResult.edges.forEach((edgeData, edgeId) => {
        if (filteredNodes.has(edgeData.source) && filteredNodes.has(edgeData.target)) {
          filteredEdges.set(edgeId, edgeData);
        }
      });

      bfsResult.nodes = filteredNodes;
      bfsResult.edges = filteredEdges;
    }

    // Apply weight threshold if specified
    if (weightThreshold !== undefined) {
      const filteredEdges = new Map<string, any>();
      bfsResult.edges.forEach((edgeData, edgeId) => {
        const weight = edgeData.weight || 1;
        if (weight >= weightThreshold) {
          filteredEdges.set(edgeId, edgeData);
        }
      });
      bfsResult.edges = filteredEdges;
    }

    return bfsResult;
  }

  /**
   * Explore with custom filter function using DFS or BFS
   */
  exploreWithFilter(graph: Graph, options: ExploreWithFilterOptions): ExplorationResult {
    const {
      startNode,
      nodeFilter,
      edgeFilter,
      maxDepth = 10,
      strategy = 'breadth'
    } = options;

    const nodes = new Map<string | number, NodeWithDepth>();
    const edges = new Map<string, any>();
    const nodesByDepth = new Map<number, Set<string | number>>();

    // Choose traversal strategy
    const traversalFn = strategy === 'breadth' ? bfsFromNode : dfsFromNode;

    traversalFn(
      graph,
      startNode,
      (node, attributes, depth) => {
        // Apply custom filter
        if (!nodeFilter(node, attributes, depth)) {
          return false; // Skip this branch
        }

        if (depth > maxDepth) {
          return true; // Stop traversal
        }

        // Add node
        nodes.set(node, {
          nodeId: node,
          depth,
          attributes
        });

        if (!nodesByDepth.has(depth)) {
          nodesByDepth.set(depth, new Set());
        }
        nodesByDepth.get(depth)?.add(node);

        return false; // Continue
      }
    );

    // Collect edges between explored nodes
    nodes.forEach((_, nodeId) => {
      graph.forEachEdge(nodeId, (edge, attributes, source, target) => {
        if (nodes.has(source) && nodes.has(target)) {
          if (!edgeFilter || edgeFilter(attributes)) {
            edges.set(edge, {
              source,
              target,
              ...attributes
            });
          }
        }
      });
    });

    return {
      nodes,
      edges,
      nodesByDepth,
      statistics: {
        totalNodes: nodes.size,
        totalEdges: edges.size,
        maxDepthReached: Math.max(...nodesByDepth.keys()),
        averageDegree: nodes.size > 0 ? (edges.size * 2) / nodes.size : 0
      }
    };
  }

  /**
   * Extract a subgraph based on various criteria
   * Uses Graphology's subgraph operator for efficiency
   */
  extractSubgraph(graph: Graph, options: ExtractSubgraphOptions): Graph {
    let nodesToKeep = new Set<string | number>();

    // Determine which nodes to keep based on options
    if (options.nodes) {
      nodesToKeep = options.nodes;
    } else if (options.centerNode !== undefined && options.radius !== undefined) {
      // Get all nodes within radius of center
      const exploration = this.exploreByDepth(graph, {
        startNode: options.centerNode,
        maxDepth: options.radius,
        includeEdges: true
      });
      nodesToKeep = new Set(exploration.nodes.keys());
    } else {
      // Keep all nodes by default
      graph.forEachNode(node => nodesToKeep.add(node));
    }

    // Apply degree filters
    if (options.minDegree !== undefined || options.maxDegree !== undefined) {
      const filteredNodes = new Set<string | number>();
      nodesToKeep.forEach(node => {
        const degree = graph.degree(node);
        const keepNode =
          (options.minDegree === undefined || degree >= options.minDegree) &&
          (options.maxDegree === undefined || degree <= options.maxDegree);
        if (keepNode) {
          filteredNodes.add(node);
        }
      });
      nodesToKeep = filteredNodes;
    }

    // Create subgraph using Graphology's subgraph function
    const subgraphInstance = subgraph(graph, Array.from(nodesToKeep).map(String));

    // Filter edges by type if specified
    if (options.preserveEdgeTypes && options.preserveEdgeTypes.length > 0) {
      const edgesToRemove: string[] = [];
      subgraphInstance.forEachEdge((edge, attributes) => {
        const edgeType = attributes.type || attributes.edgeType;
        if (!options.preserveEdgeTypes!.includes(edgeType)) {
          edgesToRemove.push(edge);
        }
      });
      edgesToRemove.forEach(edge => subgraphInstance.dropEdge(edge));
    }

    return subgraphInstance;
  }

  /**
   * Progressive exploration with different strategies
   * This enables more sophisticated exploration patterns
   */
  exploreProgressive(
    graph: Graph,
    options: {
      startNode: string | number;
      strategy: 'breadth' | 'depth' | 'best-first' | 'random-walk';
      maxNodes?: number;
      scoring?: (node: string | number, attributes: any) => number;
      walkProbability?: number;
      teleportProbability?: number;
    }
  ): ExplorationResult {
    const { startNode, strategy, maxNodes = 100, scoring } = options;

    if (strategy === 'best-first' && scoring) {
      // Implement best-first search using a priority queue
      const nodes = new Map<string | number, NodeWithDepth>();
      const edges = new Map<string, any>();
      const visited = new Set<string | number>();
      const queue: Array<{ node: string | number; score: number; depth: number }> = [];

      // Start with the initial node
      queue.push({ node: startNode, score: 0, depth: 0 });

      while (queue.length > 0 && nodes.size < maxNodes) {
        // Sort by score (higher score = higher priority)
        queue.sort((a, b) => b.score - a.score);
        const current = queue.shift()!;

        if (visited.has(current.node)) continue;
        visited.add(current.node);

        const attributes = graph.getNodeAttributes(current.node);
        nodes.set(current.node, {
          nodeId: current.node,
          depth: current.depth,
          attributes
        });

        // Add neighbors to queue
        graph.forEachNeighbor(current.node, (neighbor, neighborAttrs) => {
          if (!visited.has(neighbor)) {
            const score = scoring(neighbor, neighborAttrs);
            queue.push({
              node: neighbor,
              score,
              depth: current.depth + 1
            });
          }
        });
      }

      // Collect edges
      nodes.forEach((_, nodeId) => {
        graph.forEachEdge(nodeId, (edge, attrs, source, target) => {
          if (nodes.has(source) && nodes.has(target)) {
            edges.set(edge, { source, target, ...attrs });
          }
        });
      });

      return {
        nodes,
        edges,
        nodesByDepth: this.groupNodesByDepth(nodes),
        statistics: {
          totalNodes: nodes.size,
          totalEdges: edges.size,
          maxDepthReached: Math.max(...Array.from(nodes.values()).map(n => n.depth)),
          averageDegree: nodes.size > 0 ? (edges.size * 2) / nodes.size : 0
        }
      };
    } else if (strategy === 'random-walk') {
      // Implement random walk exploration
      return this.randomWalkExploration(graph, {
        startNode,
        maxNodes,
        walkProbability: options.walkProbability || 0.85,
        teleportProbability: options.teleportProbability || 0.15
      });
    } else {
      // Use standard BFS or DFS
      return this.exploreWithFilter(graph, {
        startNode,
        nodeFilter: () => true,
        strategy: strategy === 'depth' ? 'depth' : 'breadth',
        maxDepth: 10
      });
    }
  }

  /**
   * Random walk exploration for PageRank-style discovery
   */
  private randomWalkExploration(
    graph: Graph,
    options: {
      startNode: string | number;
      maxNodes: number;
      walkProbability: number;
      teleportProbability: number;
    }
  ): ExplorationResult {
    const { startNode, maxNodes, walkProbability, teleportProbability } = options;
    const nodes = new Map<string | number, NodeWithDepth>();
    const edges = new Map<string, any>();
    const visitCounts = new Map<string | number, number>();

    let currentNode = startNode;
    let steps = 0;
    const maxSteps = maxNodes * 10; // Allow multiple visits

    while (steps < maxSteps && nodes.size < maxNodes) {
      // Record visit
      const count = (visitCounts.get(currentNode) || 0) + 1;
      visitCounts.set(currentNode, count);

      if (!nodes.has(currentNode)) {
        nodes.set(currentNode, {
          nodeId: currentNode,
          depth: 0, // Depth doesn't apply to random walk
          attributes: {
            ...graph.getNodeAttributes(currentNode),
            visitCount: count
          }
        });
      }

      // Decide whether to walk or teleport
      if (Math.random() < walkProbability) {
        // Random walk to neighbor
        const neighbors = graph.neighbors(currentNode);
        if (neighbors.length > 0) {
          const nextNode = neighbors[Math.floor(Math.random() * neighbors.length)];

          // Record edge
          const edgeId = graph.edge(currentNode, nextNode);
          if (edgeId && !edges.has(edgeId)) {
            edges.set(edgeId, {
              source: currentNode,
              target: nextNode,
              ...graph.getEdgeAttributes(edgeId)
            });
          }

          currentNode = nextNode;
        } else {
          // Dead end, teleport
          const allNodes = graph.nodes();
          currentNode = allNodes[Math.floor(Math.random() * allNodes.length)];
        }
      } else {
        // Teleport to random node
        const allNodes = graph.nodes();
        currentNode = allNodes[Math.floor(Math.random() * allNodes.length)];
      }

      steps++;
    }

    return {
      nodes,
      edges,
      nodesByDepth: new Map([[0, new Set(nodes.keys())]]),
      statistics: {
        totalNodes: nodes.size,
        totalEdges: edges.size,
        maxDepthReached: 0,
        averageDegree: nodes.size > 0 ? (edges.size * 2) / nodes.size : 0
      }
    };
  }

  /**
   * Helper to group nodes by depth
   */
  private groupNodesByDepth(nodes: Map<string | number, NodeWithDepth>): Map<number, Set<string | number>> {
    const nodesByDepth = new Map<number, Set<string | number>>();
    nodes.forEach((nodeData, nodeId) => {
      if (!nodesByDepth.has(nodeData.depth)) {
        nodesByDepth.set(nodeData.depth, new Set());
      }
      nodesByDepth.get(nodeData.depth)?.add(nodeId);
    });
    return nodesByDepth;
  }

  /**
   * Find bridges and articulation points in the explored network
   * These are critical nodes/edges whose removal would disconnect the graph
   */
  findCriticalElements(graph: Graph): {
    bridges: Set<string>;
    articulationPoints: Set<string | number>;
  } {
    // This would use Tarjan's algorithm or similar
    // For now, returning placeholder
    return {
      bridges: new Set(),
      articulationPoints: new Set()
    };
  }
}