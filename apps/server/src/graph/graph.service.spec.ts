/**
 * Tests for GraphService
 * Validates core graph operations with type safety
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GraphService } from './graph.service';
import Graph from 'graphology';

describe('GraphService', () => {
  let service: GraphService;

  beforeEach(() => {
    service = new GraphService();
  });

  describe('graph creation', () => {
    it('should create directed graph', () => {
      const graph = service.createDirectedGraph();
      expect(graph).toBeInstanceOf(Graph);
      expect(graph.type).toBe('directed');
      expect(graph.allowSelfLoops).toBe(false);
    });

    it('should create undirected graph', () => {
      const graph = service.createUndirectedGraph();
      expect(graph).toBeInstanceOf(Graph);
      expect(graph.type).toBe('undirected');
      expect(graph.allowSelfLoops).toBe(false);
    });

    it('should create mixed graph', () => {
      const graph = service.createMixedGraph();
      expect(graph).toBeInstanceOf(Graph);
      expect(graph.type).toBe('mixed');
      expect(graph.allowSelfLoops).toBe(false);
    });

    it('should create graph with generic types', () => {
      interface PersonNode {
        name: string;
        age: number;
      }
      interface FriendshipEdge {
        since: Date;
        strength: number;
      }

      const graph = service.createDirectedGraph<PersonNode, FriendshipEdge>();
      service.addNode(graph, 'person1', { name: 'Alice', age: 30 });
      service.addNode(graph, 'person2', { name: 'Bob', age: 25 });
      service.addEdge(graph, 'person1', 'person2', {
        since: new Date('2020-01-01'),
        strength: 0.9
      });

      expect(graph.getNodeAttribute('person1', 'name')).toBe('Alice');
      expect(graph.getNodeAttribute('person2', 'age')).toBe(25);
      expect(graph.getEdgeAttribute('person1', 'person2', 'strength')).toBe(0.9);
    });
  });

  describe('node operations', () => {
    it('should add nodes with attributes', () => {
      const graph = service.createDirectedGraph<{ label: string; weight: number }>();

      service.addNode(graph, 'node1', { label: 'Node 1', weight: 10 });

      expect(graph.hasNode('node1')).toBe(true);
      expect(graph.getNodeAttribute('node1', 'label')).toBe('Node 1');
      expect(graph.getNodeAttribute('node1', 'weight')).toBe(10);
    });

    it('should merge attributes when adding existing node', () => {
      const graph = service.createDirectedGraph<{ label?: string; weight?: number }>();

      service.addNode(graph, 'node1', { label: 'Initial' });
      service.addNode(graph, 'node1', { weight: 20 });

      expect(graph.getNodeAttribute('node1', 'label')).toBe('Initial');
      expect(graph.getNodeAttribute('node1', 'weight')).toBe(20);
    });

    it('should add multiple nodes at once', () => {
      const graph = service.createDirectedGraph();
      const nodes = [
        { id: 'n1', attributes: { label: 'Node 1' } },
        { id: 'n2', attributes: { label: 'Node 2' } },
        { id: 'n3', attributes: { label: 'Node 3' } }
      ];

      service.addNodes(graph, nodes);

      expect(graph.order).toBe(3);
      expect(graph.hasNode('n1')).toBe(true);
      expect(graph.hasNode('n2')).toBe(true);
      expect(graph.hasNode('n3')).toBe(true);
    });

    it('should get node attributes', () => {
      const graph = service.createDirectedGraph<{ data: string }>();
      service.addNode(graph, 'test', { data: 'value' });

      const attrs = service.getNodeAttributes(graph, 'test');
      expect(attrs).toEqual({ data: 'value' });

      const missing = service.getNodeAttributes(graph, 'missing');
      expect(missing).toBeUndefined();
    });
  });

  describe('edge operations', () => {
    it('should add edges with attributes', () => {
      const graph = service.createDirectedGraph<any, { type: string; weight: number }>();

      service.addEdge(graph, 'a', 'b', { type: 'connection', weight: 5 });

      expect(graph.hasEdge('a', 'b')).toBe(true);
      expect(graph.getEdgeAttribute('a', 'b', 'type')).toBe('connection');
      expect(graph.getEdgeAttribute('a', 'b', 'weight')).toBe(5);
    });

    it('should auto-create nodes when adding edge', () => {
      const graph = service.createDirectedGraph();

      service.addEdge(graph, 'new1', 'new2');

      expect(graph.hasNode('new1')).toBe(true);
      expect(graph.hasNode('new2')).toBe(true);
      expect(graph.hasEdge('new1', 'new2')).toBe(true);
    });

    it('should add multiple edges at once', () => {
      const graph = service.createDirectedGraph();
      const edges = [
        { source: 's1', target: 't1', attributes: { weight: 1 } },
        { source: 's2', target: 't2', attributes: { weight: 2 } },
        { source: 's3', target: 't3', attributes: { weight: 3 } }
      ];

      service.addEdges(graph, edges);

      expect(graph.size).toBe(3);
      expect(graph.hasEdge('s1', 't1')).toBe(true);
      expect(graph.hasEdge('s2', 't2')).toBe(true);
      expect(graph.hasEdge('s3', 't3')).toBe(true);
    });

    it('should get edge attributes', () => {
      const graph = service.createDirectedGraph<any, { label: string }>();
      service.addEdge(graph, 'x', 'y', { label: 'test' });

      const attrs = service.getEdgeAttributes(graph, 'x', 'y');
      expect(attrs).toEqual({ label: 'test' });

      const missing = service.getEdgeAttributes(graph, 'a', 'b');
      expect(missing).toBeUndefined();
    });
  });

  describe('graph metrics', () => {
    it('should calculate metrics for empty graph', () => {
      const graph = service.createDirectedGraph();
      const metrics = service.getMetrics(graph);

      expect(metrics.nodeCount).toBe(0);
      expect(metrics.edgeCount).toBe(0);
      expect(metrics.density).toBe(0);
      expect(metrics.avgDegree).toBe(0);
    });

    it('should calculate metrics for simple graph', () => {
      const graph = service.createDirectedGraph();
      service.addNode(graph, '1');
      service.addNode(graph, '2');
      service.addNode(graph, '3');
      service.addEdge(graph, '1', '2');
      service.addEdge(graph, '2', '3');

      const metrics = service.getMetrics(graph);

      expect(metrics.nodeCount).toBe(3);
      expect(metrics.edgeCount).toBe(2);
      expect(metrics.density).toBeCloseTo(0.333, 2);
      expect(metrics.avgDegree).toBeCloseTo(1.333, 2);
    });

    it('should calculate metrics for complete graph', () => {
      const graph = service.createUndirectedGraph();
      const nodes = ['a', 'b', 'c', 'd'];

      // Create complete graph
      nodes.forEach(n => service.addNode(graph, n));
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          service.addEdge(graph, nodes[i], nodes[j]);
        }
      }

      const metrics = service.getMetrics(graph);

      expect(metrics.nodeCount).toBe(4);
      expect(metrics.edgeCount).toBe(6);
      expect(metrics.density).toBe(1);
      expect(metrics.avgDegree).toBe(3);
    });
  });

  describe('graph queries', () => {
    it('should check node existence', () => {
      const graph = service.createDirectedGraph();
      service.addNode(graph, 'exists');

      expect(service.hasNode(graph, 'exists')).toBe(true);
      expect(service.hasNode(graph, 'missing')).toBe(false);
    });

    it('should check edge existence', () => {
      const graph = service.createDirectedGraph();
      service.addEdge(graph, 'a', 'b');

      expect(service.hasEdge(graph, 'a', 'b')).toBe(true);
      expect(service.hasEdge(graph, 'b', 'a')).toBe(false);
      expect(service.hasEdge(graph, 'x', 'y')).toBe(false);
    });

    it('should get all nodes', () => {
      const graph = service.createDirectedGraph();
      service.addNode(graph, 'node1');
      service.addNode(graph, 'node2');
      service.addNode(graph, 'node3');

      const nodes = service.getNodes(graph);

      expect(nodes).toHaveLength(3);
      expect(nodes).toContain('node1');
      expect(nodes).toContain('node2');
      expect(nodes).toContain('node3');
    });

    it('should get all edges with attributes', () => {
      const graph = service.createDirectedGraph<any, { weight: number }>();
      service.addEdge(graph, 'a', 'b', { weight: 1 });
      service.addEdge(graph, 'b', 'c', { weight: 2 });

      const edges = service.getEdges(graph);

      expect(edges).toHaveLength(2);
      expect(edges).toContainEqual(['a', 'b', { weight: 1 }]);
      expect(edges).toContainEqual(['b', 'c', { weight: 2 }]);
    });

    it('should get node degree', () => {
      const graph = service.createUndirectedGraph();
      service.addEdge(graph, 'center', 'n1');
      service.addEdge(graph, 'center', 'n2');
      service.addEdge(graph, 'center', 'n3');

      expect(service.getNodeDegree(graph, 'center')).toBe(3);
      expect(service.getNodeDegree(graph, 'n1')).toBe(1);
      expect(service.getNodeDegree(graph, 'missing')).toBe(0);
    });

    it('should get node neighbors', () => {
      const graph = service.createDirectedGraph();
      service.addEdge(graph, 'a', 'b');
      service.addEdge(graph, 'a', 'c');
      service.addEdge(graph, 'd', 'a');

      const neighbors = service.getNeighbors(graph, 'a');

      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContain('b');
      expect(neighbors).toContain('c');
      expect(neighbors).toContain('d');

      expect(service.getNeighbors(graph, 'missing')).toEqual([]);
    });
  });

  describe('graph transformations', () => {
    it('should extract subgraph', () => {
      const graph = service.createDirectedGraph();
      service.addEdge(graph, '1', '2');
      service.addEdge(graph, '2', '3');
      service.addEdge(graph, '3', '4');
      service.addEdge(graph, '4', '5');

      const subgraph = service.getSubgraph(graph, ['2', '3', '4']);

      expect(subgraph.order).toBe(3);
      expect(subgraph.size).toBe(2);
      expect(subgraph.hasEdge('2', '3')).toBe(true);
      expect(subgraph.hasEdge('3', '4')).toBe(true);
      expect(subgraph.hasEdge('4', '5')).toBe(false);
    });

    it('should merge graphs', () => {
      const graph1 = service.createDirectedGraph();
      service.addEdge(graph1, 'a', 'b');
      service.addEdge(graph1, 'b', 'c');

      const graph2 = service.createDirectedGraph();
      service.addEdge(graph2, 'c', 'd');
      service.addEdge(graph2, 'd', 'e');

      const merged = service.mergeGraphs(graph1, graph2);

      expect(merged.order).toBe(5);
      expect(merged.size).toBe(4);
      expect(merged.hasEdge('a', 'b')).toBe(true);
      expect(merged.hasEdge('d', 'e')).toBe(true);
    });

    it('should clear graph', () => {
      const graph = service.createDirectedGraph();
      service.addNode(graph, 'node');
      service.addEdge(graph, 'a', 'b');

      expect(graph.order).toBeGreaterThan(0);
      expect(graph.size).toBeGreaterThan(0);

      service.clear(graph);

      expect(graph.order).toBe(0);
      expect(graph.size).toBe(0);
    });
  });
});