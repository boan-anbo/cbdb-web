/**
 * GraphologyLayoutAlgorithm
 * Graphology-based implementation of layout algorithms
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { circular, random } from 'graphology-layout';

/**
 * Layout algorithm implementation using Graphology library
 */
@Injectable()
export class GraphologyLayoutAlgorithm {
  /**
   * Calculate layout positions using specified algorithm
   *
   * @param graph Graphology graph instance
   * @param algorithm Layout algorithm to use
   * @param options Algorithm-specific options
   * @returns Map of node ID to position {x, y}
   */
  calculateLayout(
    graph: Graph,
    algorithm: 'forceatlas2' | 'circular' | 'random' = 'forceatlas2',
    options?: any
  ): Map<number, { x: number; y: number }> {
    switch (algorithm) {
      case 'forceatlas2':
        return this.calculateForceAtlas2Layout(graph, options);
      case 'circular':
        return this.calculateCircularLayout(graph, options);
      case 'random':
        return this.calculateRandomLayout(graph, options);
      default:
        return this.calculateForceAtlas2Layout(graph, options);
    }
  }

  /**
   * Calculate ForceAtlas2 layout
   * Force-directed layout that produces organic-looking graphs
   *
   * @param graph Graphology graph instance
   * @param options ForceAtlas2 options
   * @returns Map of node ID to position
   */
  private calculateForceAtlas2Layout(
    graph: Graph,
    options?: {
      iterations?: number;
      settings?: {
        gravity?: number;
        scalingRatio?: number;
        barnesHutOptimize?: boolean;
        strongGravityMode?: boolean;
        slowDown?: number;
        linLogMode?: boolean;
        outboundAttractionDistribution?: boolean;
      };
    }
  ): Map<number, { x: number; y: number }> {
    // Clone the graph to avoid modifying the original
    const workingGraph = graph.copy();

    // Assign initial random positions if not present
    random.assign(workingGraph);

    // Default settings optimized for readability
    const settings = {
      iterations: options?.iterations || 500,
      settings: {
        gravity: options?.settings?.gravity || 1,
        scalingRatio: options?.settings?.scalingRatio || 10,
        barnesHutOptimize: options?.settings?.barnesHutOptimize !== false,
        strongGravityMode: options?.settings?.strongGravityMode || false,
        slowDown: options?.settings?.slowDown || 1,
        linLogMode: options?.settings?.linLogMode || false,
        outboundAttractionDistribution: options?.settings?.outboundAttractionDistribution || false
      }
    };

    // Run ForceAtlas2
    forceAtlas2.assign(workingGraph, settings);

    // Extract positions
    const positions = new Map<number, { x: number; y: number }>();
    workingGraph.forEachNode((node, attributes) => {
      positions.set(Number(node), {
        x: attributes.x || 0,
        y: attributes.y || 0
      });
    });

    return positions;
  }

  /**
   * Calculate circular layout
   * Arranges nodes in a circle
   *
   * @param graph Graphology graph instance
   * @param options Circular layout options
   * @returns Map of node ID to position
   */
  private calculateCircularLayout(
    graph: Graph,
    options?: {
      center?: number;
      scale?: number;
    }
  ): Map<number, { x: number; y: number }> {
    const workingGraph = graph.copy();

    circular.assign(workingGraph, {
      center: options?.center || 0.5,
      scale: options?.scale || 1
    });

    const positions = new Map<number, { x: number; y: number }>();
    workingGraph.forEachNode((node, attributes) => {
      positions.set(Number(node), {
        x: attributes.x || 0,
        y: attributes.y || 0
      });
    });

    return positions;
  }

  /**
   * Calculate random layout
   * Assigns random positions to nodes
   *
   * @param graph Graphology graph instance
   * @param options Random layout options
   * @returns Map of node ID to position
   */
  private calculateRandomLayout(
    graph: Graph,
    options?: {
      center?: number;
      scale?: number;
    }
  ): Map<number, { x: number; y: number }> {
    const workingGraph = graph.copy();

    random.assign(workingGraph, {
      center: options?.center || 0.5,
      scale: options?.scale || 1
    });

    const positions = new Map<number, { x: number; y: number }>();
    workingGraph.forEachNode((node, attributes) => {
      positions.set(Number(node), {
        x: attributes.x || 0,
        y: attributes.y || 0
      });
    });

    return positions;
  }

  /**
   * Calculate hierarchical layout for DAGs
   * Arranges nodes in layers based on their depth
   *
   * @param graph Graphology graph instance (should be a DAG)
   * @returns Map of node ID to position
   */
  calculateHierarchicalLayout(graph: Graph): Map<number, { x: number; y: number }> {
    const positions = new Map<number, { x: number; y: number }>();
    const levels = new Map<number, number>();
    const nodesPerLevel = new Map<number, number[]>();

    // Calculate levels using BFS from root nodes (nodes with no incoming edges)
    const roots: number[] = [];
    graph.forEachNode(node => {
      if (graph.inDegree(node) === 0) {
        roots.push(Number(node));
      }
    });

    // If no roots found, start from arbitrary node
    if (roots.length === 0 && graph.order > 0) {
      roots.push(Number(graph.nodes()[0]));
    }

    // BFS to assign levels
    const visited = new Set<number>();
    const queue: Array<{ node: number; level: number }> =
      roots.map(node => ({ node, level: 0 }));

    while (queue.length > 0) {
      const { node, level } = queue.shift()!;

      if (visited.has(node)) continue;
      visited.add(node);

      levels.set(node, level);

      if (!nodesPerLevel.has(level)) {
        nodesPerLevel.set(level, []);
      }
      nodesPerLevel.get(level)!.push(node);

      // Add neighbors to queue
      graph.forEachOutNeighbor(node, neighbor => {
        const neighborId = Number(neighbor);
        if (!visited.has(neighborId)) {
          queue.push({ node: neighborId, level: level + 1 });
        }
      });
    }

    // Assign positions based on levels
    const levelHeight = 100;
    const nodeSpacing = 100;

    for (const [level, nodes] of nodesPerLevel) {
      const y = level * levelHeight;
      const totalWidth = (nodes.length - 1) * nodeSpacing;
      const startX = -totalWidth / 2;

      nodes.forEach((node, index) => {
        positions.set(node, {
          x: startX + index * nodeSpacing,
          y
        });
      });
    }

    return positions;
  }

  /**
   * Calculate radial layout
   * Arranges nodes in concentric circles based on distance from center
   *
   * @param graph Graphology graph instance
   * @param centerNode Central node ID
   * @returns Map of node ID to position
   */
  calculateRadialLayout(
    graph: Graph,
    centerNode: number
  ): Map<number, { x: number; y: number }> {
    const positions = new Map<number, { x: number; y: number }>();
    const distances = new Map<number, number>();
    const nodesPerDistance = new Map<number, number[]>();

    // BFS to calculate distances from center
    const visited = new Set<number>();
    const queue: Array<{ node: number; distance: number }> = [
      { node: centerNode, distance: 0 }
    ];

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!;

      if (visited.has(node)) continue;
      visited.add(node);

      distances.set(node, distance);

      if (!nodesPerDistance.has(distance)) {
        nodesPerDistance.set(distance, []);
      }
      nodesPerDistance.get(distance)!.push(node);

      // Add neighbors to queue
      graph.forEachNeighbor(node, neighbor => {
        const neighborId = Number(neighbor);
        if (!visited.has(neighborId)) {
          queue.push({ node: neighborId, distance: distance + 1 });
        }
      });
    }

    // Assign positions in concentric circles
    const radiusStep = 100;

    for (const [distance, nodes] of nodesPerDistance) {
      if (distance === 0) {
        // Center node at origin
        positions.set(centerNode, { x: 0, y: 0 });
      } else {
        const radius = distance * radiusStep;
        const angleStep = (2 * Math.PI) / nodes.length;

        nodes.forEach((node, index) => {
          const angle = index * angleStep;
          positions.set(node, {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
          });
        });
      }
    }

    return positions;
  }

  /**
   * Optimize layout to reduce edge crossings
   * Post-processes an existing layout
   *
   * @param graph Graphology graph instance
   * @param positions Existing positions
   * @param iterations Number of optimization iterations
   * @returns Optimized positions
   */
  optimizeLayout(
    graph: Graph,
    positions: Map<number, { x: number; y: number }>,
    iterations: number = 10
  ): Map<number, { x: number; y: number }> {
    const optimized = new Map(positions);

    for (let iter = 0; iter < iterations; iter++) {
      // Simple force-directed optimization
      const forces = new Map<number, { x: number; y: number }>();

      // Initialize forces
      for (const node of optimized.keys()) {
        forces.set(node, { x: 0, y: 0 });
      }

      // Calculate repulsive forces between all nodes
      const nodes = Array.from(optimized.keys());
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const pos1 = optimized.get(nodes[i])!;
          const pos2 = optimized.get(nodes[j])!;

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;

          const force = 100 / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          forces.get(nodes[i])!.x -= fx;
          forces.get(nodes[i])!.y -= fy;
          forces.get(nodes[j])!.x += fx;
          forces.get(nodes[j])!.y += fy;
        }
      }

      // Calculate attractive forces along edges
      graph.forEachEdge((edge, attributes, source, target) => {
        const sourceId = Number(source);
        const targetId = Number(target);
        const pos1 = optimized.get(sourceId)!;
        const pos2 = optimized.get(targetId)!;

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;

        const force = distance * 0.01;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        forces.get(sourceId)!.x += fx;
        forces.get(sourceId)!.y += fy;
        forces.get(targetId)!.x -= fx;
        forces.get(targetId)!.y -= fy;
      });

      // Apply forces with damping
      const damping = 0.1;
      for (const [node, force] of forces) {
        const pos = optimized.get(node)!;
        pos.x += force.x * damping;
        pos.y += force.y * damping;
      }
    }

    return optimized;
  }
}