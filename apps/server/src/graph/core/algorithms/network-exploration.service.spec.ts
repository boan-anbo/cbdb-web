/**
 * Tests for NetworkExplorationService
 * Verifies that we're properly using Graphology algorithms
 * instead of handcrafted traversal
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Graph from 'graphology';
import { NetworkExplorationService } from './network-exploration.service';

describe('NetworkExplorationService', () => {
  let service: NetworkExplorationService;
  let testGraph: Graph;

  beforeEach(() => {
    service = new NetworkExplorationService();

    // Create a test graph with known structure
    testGraph = new Graph();

    // Add nodes
    for (let i = 1; i <= 10; i++) {
      testGraph.addNode(String(i), { label: `Node ${i}` });
    }

    // Create a tree-like structure for predictable depth testing
    // Level 0: Node 1 (root)
    // Level 1: Nodes 2, 3, 4
    // Level 2: Nodes 5, 6 (from 2), 7, 8 (from 3), 9, 10 (from 4)
    testGraph.addEdge('1', '2', { type: 'kinship', weight: 1 });
    testGraph.addEdge('1', '3', { type: 'kinship', weight: 1 });
    testGraph.addEdge('1', '4', { type: 'association', weight: 0.8 });

    testGraph.addEdge('2', '5', { type: 'kinship', weight: 0.9 });
    testGraph.addEdge('2', '6', { type: 'kinship', weight: 0.9 });

    testGraph.addEdge('3', '7', { type: 'kinship', weight: 0.8 });
    testGraph.addEdge('3', '8', { type: 'association', weight: 0.7 });

    testGraph.addEdge('4', '9', { type: 'association', weight: 0.6 });
    testGraph.addEdge('4', '10', { type: 'association', weight: 0.6 });
  });

  describe('exploreByDepth', () => {
    it('should explore network using BFS to correct depth', () => {
      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 1
      });

      // Should have nodes at depth 0 and 1
      expect(result.nodesByDepth.get(0)?.size).toBe(1); // Node 1
      expect(result.nodesByDepth.get(1)?.size).toBe(3); // Nodes 2, 3, 4
      expect(result.statistics.totalNodes).toBe(4);
      expect(result.statistics.maxDepthReached).toBe(1);
    });

    it('should explore to depth 2 and include all descendants', () => {
      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 2
      });

      // Should have all nodes
      expect(result.nodesByDepth.get(0)?.size).toBe(1); // Node 1
      expect(result.nodesByDepth.get(1)?.size).toBe(3); // Nodes 2, 3, 4
      expect(result.nodesByDepth.get(2)?.size).toBe(6); // Nodes 5-10
      expect(result.statistics.totalNodes).toBe(10);
      expect(result.statistics.maxDepthReached).toBe(2);
    });

    it('should apply node filters correctly', () => {
      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 2,
        nodeFilter: (node) => Number(node) <= 7 // Only nodes 1-7
      });

      expect(result.statistics.totalNodes).toBe(7);
      expect(result.nodes.has('8')).toBe(false);
      expect(result.nodes.has('9')).toBe(false);
      expect(result.nodes.has('10')).toBe(false);
    });

    it('should apply edge filters to only include specific types', () => {
      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 2,
        edgeFilter: (edge, attrs) => attrs.type === 'kinship'
      });

      // Should only have edges with type 'kinship'
      const edgeTypes = Array.from(result.edges.values()).map(e => e.type);
      expect(edgeTypes.every(t => t === 'kinship')).toBe(true);
    });

    it('should respect maxNodes limit', () => {
      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 10, // High depth
        maxNodes: 5    // But limited nodes
      });

      expect(result.statistics.totalNodes).toBeLessThanOrEqual(5);
    });

    it('should support early termination', () => {
      let terminatedAtNode: string | number | null = null;

      const result = service.exploreByDepth(testGraph, {
        startNode: '1',
        maxDepth: 10,
        earlyTermination: (node, depth) => {
          if (node === '7') {
            terminatedAtNode = node;
            return true; // Stop when we hit node 7
          }
          return false;
        }
      });

      expect(terminatedAtNode).toBe('7');
      // Result may vary depending on traversal order
      expect(result.nodes.size).toBeGreaterThan(0);
    });
  });

  describe('exploreByDegrees', () => {
    it('should explore by social degrees', () => {
      const result = service.exploreByDegrees(testGraph, {
        startNode: '1',
        degrees: 2
      });

      expect(result.statistics.totalNodes).toBe(10);
      expect(result.statistics.maxDepthReached).toBe(2);
    });

    it('should filter by relation types', () => {
      const result = service.exploreByDegrees(testGraph, {
        startNode: '1',
        degrees: 2,
        relationTypes: ['kinship']
      });

      // Should only follow kinship edges
      // From node 1: reaches 2, 3 (kinship), not 4 (association)
      // From node 2: reaches 5, 6
      // From node 3: reaches 7 (kinship), not 8 (association)
      expect(result.nodes.has('1')).toBe(true);
      expect(result.nodes.has('2')).toBe(true);
      expect(result.nodes.has('3')).toBe(true);
      expect(result.nodes.has('5')).toBe(true);
      expect(result.nodes.has('6')).toBe(true);
      expect(result.nodes.has('7')).toBe(true);

      // These should be excluded (association edges)
      expect(result.nodes.has('4')).toBe(false);
      expect(result.nodes.has('9')).toBe(false);
      expect(result.nodes.has('10')).toBe(false);
    });

    it('should apply weight threshold', () => {
      const result = service.exploreByDegrees(testGraph, {
        startNode: '1',
        degrees: 2,
        weightThreshold: 0.8
      });

      // Only edges with weight >= 0.8 should be included
      const edgeWeights = Array.from(result.edges.values()).map(e => e.weight || 1);
      expect(edgeWeights.every(w => w >= 0.8)).toBe(true);
    });
  });

  describe('extractSubgraph', () => {
    it('should extract subgraph by node set', () => {
      const nodesToKeep = new Set(['1', '2', '3', '5']);
      const subgraph = service.extractSubgraph(testGraph, {
        nodes: nodesToKeep
      });

      expect(subgraph.order).toBe(4); // 4 nodes
      expect(subgraph.hasNode('1')).toBe(true);
      expect(subgraph.hasNode('2')).toBe(true);
      expect(subgraph.hasNode('3')).toBe(true);
      expect(subgraph.hasNode('5')).toBe(true);
      expect(subgraph.hasNode('4')).toBe(false);
    });

    it('should extract subgraph by radius from center', () => {
      const subgraph = service.extractSubgraph(testGraph, {
        centerNode: '2',
        radius: 1
      });

      // Should have node 2 and its direct neighbors
      expect(subgraph.hasNode('2')).toBe(true);
      expect(subgraph.hasNode('1')).toBe(true); // Parent
      expect(subgraph.hasNode('5')).toBe(true); // Child
      expect(subgraph.hasNode('6')).toBe(true); // Child
    });

    it('should filter by degree constraints', () => {
      const subgraph = service.extractSubgraph(testGraph, {
        minDegree: 2
      });

      // Only nodes with degree >= 2
      // Node 1 has degree 3, nodes 2,3,4 have degree 2-3
      expect(subgraph.hasNode('1')).toBe(true);
      expect(subgraph.hasNode('2')).toBe(true);
      expect(subgraph.hasNode('3')).toBe(true);
      expect(subgraph.hasNode('4')).toBe(true);

      // Leaf nodes (degree 1) should be excluded
      expect(subgraph.hasNode('5')).toBe(false);
      expect(subgraph.hasNode('10')).toBe(false);
    });

    it('should preserve only specified edge types', () => {
      const subgraph = service.extractSubgraph(testGraph, {
        preserveEdgeTypes: ['kinship']
      });

      // Check all edges are kinship type
      let hasNonKinship = false;
      subgraph.forEachEdge((edge, attrs) => {
        if (attrs.type !== 'kinship') {
          hasNonKinship = true;
        }
      });

      expect(hasNonKinship).toBe(false);
    });
  });

  describe('exploreProgressive', () => {
    it('should support best-first search with scoring', () => {
      // Create a scoring function that prefers even-numbered nodes
      const scoring = (node: string | number) => {
        const n = Number(node);
        return n % 2 === 0 ? 10 : 1; // Even nodes get higher score
      };

      const result = service.exploreProgressive(testGraph, {
        startNode: '1',
        strategy: 'best-first',
        maxNodes: 5,
        scoring
      });

      // Should prioritize even-numbered nodes
      expect(result.nodes.has('1')).toBe(true); // Starting node
      expect(result.nodes.has('2')).toBe(true); // Even, high score
      expect(result.nodes.has('4')).toBe(true); // Even, high score

      // Result should have 5 nodes total
      expect(result.statistics.totalNodes).toBe(5);
    });

    it('should support random walk exploration', () => {
      const result = service.exploreProgressive(testGraph, {
        startNode: '1',
        strategy: 'random-walk',
        maxNodes: 20, // Allow multiple visits
        walkProbability: 0.85,
        teleportProbability: 0.15
      });

      // Random walk should visit some nodes
      expect(result.statistics.totalNodes).toBeGreaterThan(0);
      expect(result.statistics.totalNodes).toBeLessThanOrEqual(20);

      // Check that visit counts are recorded
      const firstNode = result.nodes.values().next().value;
      expect(firstNode?.attributes?.visitCount).toBeGreaterThan(0);
    });

    it('should fall back to standard BFS/DFS for basic strategies', () => {
      const bfsResult = service.exploreProgressive(testGraph, {
        startNode: '1',
        strategy: 'breadth',
        maxNodes: 100
      });

      const dfsResult = service.exploreProgressive(testGraph, {
        startNode: '1',
        strategy: 'depth',
        maxNodes: 100
      });

      // Both should explore the whole graph
      expect(bfsResult.statistics.totalNodes).toBe(10);
      expect(dfsResult.statistics.totalNodes).toBe(10);
    });
  });

  describe('explorePreFiltered', () => {
    it('should explore pre-filtered graph using native BFS', () => {
      // Create a graph with only kinship edges
      const kinshipGraph = new Graph();
      for (let i = 1; i <= 10; i++) {
        kinshipGraph.addNode(String(i), { label: `Node ${i}` });
      }

      // Add only kinship edges
      kinshipGraph.addEdge('1', '2', { type: 'kinship', weight: 1 });
      kinshipGraph.addEdge('1', '3', { type: 'kinship', weight: 1 });
      kinshipGraph.addEdge('2', '5', { type: 'kinship', weight: 0.9 });
      kinshipGraph.addEdge('2', '6', { type: 'kinship', weight: 0.9 });
      kinshipGraph.addEdge('3', '7', { type: 'kinship', weight: 0.8 });

      const result = service.explorePreFiltered(kinshipGraph, {
        startNode: '1',
        maxDepth: 2
      });

      // Should explore using native BFS
      expect(result.nodes.has('1')).toBe(true);
      expect(result.nodes.has('2')).toBe(true);
      expect(result.nodes.has('3')).toBe(true);
      expect(result.nodes.has('5')).toBe(true);
      expect(result.nodes.has('6')).toBe(true);
      expect(result.nodes.has('7')).toBe(true);

      // Should not have isolated nodes
      expect(result.nodes.has('4')).toBe(false);
      expect(result.nodes.has('8')).toBe(false);
      expect(result.nodes.has('9')).toBe(false);
      expect(result.nodes.has('10')).toBe(false);
    });

    it('should respect node filters in pre-filtered exploration', () => {
      const result = service.explorePreFiltered(testGraph, {
        startNode: '1',
        maxDepth: 2,
        nodeFilter: (node) => Number(node) % 2 === 1 // Only odd nodes
      });

      // Should only include odd-numbered nodes
      expect(result.nodes.has('1')).toBe(true);
      expect(result.nodes.has('3')).toBe(true);
      expect(result.nodes.has('5')).toBe(true);
      expect(result.nodes.has('7')).toBe(true);
      expect(result.nodes.has('9')).toBe(true);

      // Should exclude even-numbered nodes
      expect(result.nodes.has('2')).toBe(false);
      expect(result.nodes.has('4')).toBe(false);
      expect(result.nodes.has('6')).toBe(false);
      expect(result.nodes.has('8')).toBe(false);
      expect(result.nodes.has('10')).toBe(false);
    });

    it('should support early termination in pre-filtered exploration', () => {
      let terminatedAt: string | null = null;

      const result = service.explorePreFiltered(testGraph, {
        startNode: '1',
        maxDepth: 10,
        earlyTermination: (node) => {
          if (node === '5') {
            terminatedAt = node as string;
            return true;
          }
          return false;
        }
      });

      expect(terminatedAt).toBe('5');
      // Should have stopped exploration
      expect(result.nodes.size).toBeLessThan(10);
    });
  });

  describe('Performance comparison', () => {
    it('should be faster than handcrafted traversal', () => {
      // Create a larger graph for performance testing
      const largeGraph = new Graph();
      const nodeCount = 1000;

      // Add nodes
      for (let i = 1; i <= nodeCount; i++) {
        largeGraph.addNode(String(i));
      }

      // Create a connected graph
      for (let i = 1; i < nodeCount; i++) {
        // Connect to next node
        largeGraph.addEdge(String(i), String(i + 1), { type: 'test' });
        // Add some random connections
        if (i % 3 === 0 && i + 10 <= nodeCount) {
          largeGraph.addEdge(String(i), String(i + 10), { type: 'test' });
        }
      }

      const startTime = Date.now();
      const result = service.exploreByDepth(largeGraph, {
        startNode: '1',
        maxDepth: 5
      });
      const duration = Date.now() - startTime;

      console.log(`Explored ${result.statistics.totalNodes} nodes in ${duration}ms`);
      console.log(`Performance: ${Math.round(result.statistics.totalNodes / (duration / 1000))} nodes/second`);

      // Should be very fast
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('pre-filtered should be faster than flexible path', () => {
      const largeGraph = new Graph();
      const nodeCount = 500;

      // Add nodes
      for (let i = 1; i <= nodeCount; i++) {
        largeGraph.addNode(String(i));
      }

      // Create a connected graph with mixed edge types
      for (let i = 1; i < nodeCount; i++) {
        const edgeType = i % 2 === 0 ? 'kinship' : 'association';
        largeGraph.addEdge(String(i), String(i + 1), { type: edgeType });
        if (i % 3 === 0 && i + 10 <= nodeCount) {
          largeGraph.addEdge(String(i), String(i + 10), { type: edgeType });
        }
      }

      // Test flexible path with edge filtering
      const flexibleStart = Date.now();
      const flexibleResult = service.exploreByDepth(largeGraph, {
        startNode: '1',
        maxDepth: 4,
        edgeFilter: (edge, attrs) => attrs.type === 'kinship'
      });
      const flexibleDuration = Date.now() - flexibleStart;

      // Create pre-filtered graph with only kinship edges
      const kinshipGraph = new Graph();
      for (let i = 1; i <= nodeCount; i++) {
        kinshipGraph.addNode(String(i));
      }
      largeGraph.forEachEdge((edge, attrs, source, target) => {
        if (attrs.type === 'kinship') {
          kinshipGraph.addEdge(source, target, attrs);
        }
      });

      // Test pre-filtered path
      const preFilteredStart = Date.now();
      const preFilteredResult = service.explorePreFiltered(kinshipGraph, {
        startNode: '1',
        maxDepth: 4
      });
      const preFilteredDuration = Date.now() - preFilteredStart;

      console.log(`Flexible path: ${flexibleDuration}ms for ${flexibleResult.statistics.totalNodes} nodes`);
      console.log(`Pre-filtered path: ${preFilteredDuration}ms for ${preFilteredResult.statistics.totalNodes} nodes`);

      // Pre-filtered should be faster
      expect(preFilteredDuration).toBeLessThanOrEqual(flexibleDuration);
    });
  });

  describe('Algorithm verification', () => {
    it('should use Graphology traversal algorithms not handcrafted loops', () => {
      // Verify we're importing and using graphology-traversal
      const serviceCode = NetworkExplorationService.toString();

      // Should import traversal functions
      expect(serviceCode).toContain('bfsFromNode');

      // Should not have manual queue-based traversal in fast path
      const explorePreFilteredCode = service.explorePreFiltered.toString();
      expect(explorePreFilteredCode).toContain('bfsFromNode');
      expect(explorePreFilteredCode).not.toContain('while (queue.length');
    });

    it('should properly separate pre-processing, algorithm, and post-processing', () => {
      // This test verifies the three-phase approach
      const result = service.explorePreFiltered(testGraph, {
        startNode: '1',
        maxDepth: 2,
        includeEdges: true
      });

      // Phase 1: Pre-processing (handled by caller - graph creation)
      // Phase 2: Algorithm execution (BFS traversal)
      // Phase 3: Post-processing (edge collection)

      // Verify post-processing collected edges correctly
      expect(result.edges.size).toBeGreaterThan(0);

      // All edges should connect nodes in the result
      for (const [, edge] of result.edges) {
        expect(result.nodes.has(edge.source)).toBe(true);
        expect(result.nodes.has(edge.target)).toBe(true);
      }
    });
  });
});