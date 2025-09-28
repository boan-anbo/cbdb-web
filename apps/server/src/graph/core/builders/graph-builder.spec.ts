/**
 * Tests for GraphBuilder
 * Validates fluent API and type-safe graph construction
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GraphService } from '@/graph/graph.service';
import { GraphBuilder } from '@/graph/core/builders/graph-builder.service';

interface TestNode {
  label: string;
  value: number;
}

interface TestEdge {
  type: string;
  weight: number;
}

describe('GraphBuilder', () => {
  let graphService: GraphService;
  let builder: GraphBuilder<TestNode, TestEdge>;

  beforeEach(() => {
    graphService = new GraphService();
    builder = new GraphBuilder<TestNode, TestEdge>(graphService);
  });

  describe('initialization', () => {
    it('should create directed graph', () => {
      const graph = builder.directed().build();
      expect(graph.type).toBe('directed');
    });

    it('should create undirected graph', () => {
      const graph = builder.undirected().build();
      expect(graph.type).toBe('undirected');
    });

    it('should create mixed graph', () => {
      const graph = builder.mixed().build();
      expect(graph.type).toBe('mixed');
    });

    it('should throw error if graph not initialized', () => {
      const newBuilder = new GraphBuilder(graphService);
      expect(() => newBuilder.build()).toThrow('Graph not initialized');
    });
  });

  describe('fluent API', () => {
    it('should chain node operations', () => {
      const graph = builder
        .directed()
        .addNode('1', { label: 'First', value: 1 })
        .addNode('2', { label: 'Second', value: 2 })
        .addNode('3', { label: 'Third', value: 3 })
        .build();

      expect(graph.order).toBe(3);
      expect(graph.getNodeAttribute('1', 'label')).toBe('First');
      expect(graph.getNodeAttribute('2', 'value')).toBe(2);
    });

    it('should chain edge operations', () => {
      const graph = builder
        .directed()
        .addEdge('a', 'b', { type: 'connection', weight: 1 })
        .addEdge('b', 'c', { type: 'connection', weight: 2 })
        .addEdge('c', 'd', { type: 'connection', weight: 3 })
        .build();

      expect(graph.size).toBe(3);
      expect(graph.getEdgeAttribute('a', 'b', 'weight')).toBe(1);
      expect(graph.getEdgeAttribute('c', 'd', 'type')).toBe('connection');
    });

    it('should chain mixed operations', () => {
      const graph = builder
        .directed()
        .addNode('center', { label: 'Central', value: 100 })
        .addEdge('center', 'node1', { type: 'outgoing', weight: 1 })
        .addNode('node1', { label: 'Node 1', value: 10 })
        .addEdge('center', 'node2', { type: 'outgoing', weight: 2 })
        .build();

      expect(graph.order).toBe(3);
      expect(graph.size).toBe(2);
    });
  });

  describe('default attributes', () => {
    it('should apply node defaults', () => {
      const graph = builder
        .directed()
        .withNodeDefaults({ label: 'Default', value: 0 })
        .addNode('1')
        .addNode('2', { value: 5 })
        .addNode('3', { label: 'Custom', value: 10 })
        .build();

      expect(graph.getNodeAttribute('1', 'label')).toBe('Default');
      expect(graph.getNodeAttribute('1', 'value')).toBe(0);
      expect(graph.getNodeAttribute('2', 'label')).toBe('Default');
      expect(graph.getNodeAttribute('2', 'value')).toBe(5);
      expect(graph.getNodeAttribute('3', 'label')).toBe('Custom');
    });

    it('should apply edge defaults', () => {
      const graph = builder
        .directed()
        .withEdgeDefaults({ type: 'default', weight: 1 })
        .addEdge('a', 'b')
        .addEdge('c', 'd', { weight: 5 })
        .addEdge('e', 'f', { type: 'custom', weight: 10 })
        .build();

      expect(graph.getEdgeAttribute('a', 'b', 'type')).toBe('default');
      expect(graph.getEdgeAttribute('a', 'b', 'weight')).toBe(1);
      expect(graph.getEdgeAttribute('c', 'd', 'type')).toBe('default');
      expect(graph.getEdgeAttribute('c', 'd', 'weight')).toBe(5);
      expect(graph.getEdgeAttribute('e', 'f', 'type')).toBe('custom');
    });
  });

  describe('batch operations', () => {
    it('should add multiple nodes', () => {
      const nodes = [
        { id: 'n1', attributes: { label: 'Node 1', value: 1 } },
        { id: 'n2', attributes: { label: 'Node 2', value: 2 } },
        { id: 'n3', attributes: { label: 'Node 3', value: 3 } }
      ];

      const graph = builder
        .directed()
        .addNodes(nodes)
        .build();

      expect(graph.order).toBe(3);
      nodes.forEach(node => {
        expect(graph.hasNode(String(node.id))).toBe(true);
        expect(graph.getNodeAttributes(String(node.id))).toEqual(node.attributes);
      });
    });

    it('should add multiple edges', () => {
      const edges = [
        { source: 's1', target: 't1', attributes: { type: 'type1', weight: 1 } },
        { source: 's2', target: 't2', attributes: { type: 'type2', weight: 2 } },
        { source: 's3', target: 't3', attributes: { type: 'type3', weight: 3 } }
      ];

      const graph = builder
        .directed()
        .addEdges(edges)
        .build();

      expect(graph.size).toBe(3);
      edges.forEach(edge => {
        expect(graph.hasEdge(String(edge.source), String(edge.target))).toBe(true);
        expect(graph.getEdgeAttributes(String(edge.source), String(edge.target))).toEqual(edge.attributes);
      });
    });
  });

  describe('collection transformers', () => {
    it('should transform collection to nodes', () => {
      interface Person {
        id: number;
        name: string;
        age: number;
      }

      const people: Person[] = [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 },
        { id: 3, name: 'Charlie', age: 35 }
      ];

      const graph = builder
        .directed()
        .fromCollection(people, person => ({
          id: person.id,
          attributes: { label: person.name, value: person.age }
        }))
        .build();

      expect(graph.order).toBe(3);
      expect(graph.getNodeAttribute('1', 'label')).toBe('Alice');
      expect(graph.getNodeAttribute('2', 'value')).toBe(25);
    });

    it('should transform collection to edges', () => {
      interface Relationship {
        from: string;
        to: string;
        strength: number;
      }

      const relationships: Relationship[] = [
        { from: 'A', to: 'B', strength: 0.8 },
        { from: 'B', to: 'C', strength: 0.6 },
        { from: 'C', to: 'A', strength: 0.9 }
      ];

      const graph = builder
        .directed()
        .connectFromCollection(relationships, rel => ({
          source: rel.from,
          target: rel.to,
          attributes: { type: 'relationship', weight: rel.strength }
        }))
        .build();

      expect(graph.size).toBe(3);
      expect(graph.getEdgeAttribute('A', 'B', 'weight')).toBe(0.8);
      expect(graph.getEdgeAttribute('C', 'A', 'weight')).toBe(0.9);
    });
  });

  describe('graph patterns', () => {
    it('should create chain pattern', () => {
      const graph = builder
        .directed()
        .addChain(['a', 'b', 'c', 'd', 'e'], { type: 'chain', weight: 1 })
        .build();

      expect(graph.order).toBe(5);
      expect(graph.size).toBe(4);
      expect(graph.hasEdge('a', 'b')).toBe(true);
      expect(graph.hasEdge('b', 'c')).toBe(true);
      expect(graph.hasEdge('d', 'e')).toBe(true);
      expect(graph.getEdgeAttribute('c', 'd', 'type')).toBe('chain');
    });

    it('should create star pattern', () => {
      const graph = builder
        .directed()
        .addStar('center', ['p1', 'p2', 'p3', 'p4'], { type: 'star', weight: 1 })
        .build();

      expect(graph.order).toBe(5);
      expect(graph.size).toBe(4);
      expect(graph.hasEdge('center', 'p1')).toBe(true);
      expect(graph.hasEdge('center', 'p4')).toBe(true);
      expect(graph.getEdgeAttribute('center', 'p2', 'type')).toBe('star');
    });
  });

  describe('conditional operations', () => {
    it('should apply conditional operations', () => {
      const includeExtra = true;
      const graph = builder
        .directed()
        .addNode('always', { label: 'Always', value: 1 })
        .when(
          includeExtra,
          b => b.addNode('extra', { label: 'Extra', value: 2 })
        )
        .when(
          false,
          b => b.addNode('never', { label: 'Never', value: 3 })
        )
        .build();

      expect(graph.hasNode('always')).toBe(true);
      expect(graph.hasNode('extra')).toBe(true);
      expect(graph.hasNode('never')).toBe(false);
    });

    it('should apply else branch in conditional', () => {
      const useTypeA = false;
      const graph = builder
        .directed()
        .when(
          useTypeA,
          b => b.addEdge('a', 'b', { type: 'typeA', weight: 1 }),
          b => b.addEdge('a', 'b', { type: 'typeB', weight: 2 })
        )
        .build();

      expect(graph.getEdgeAttribute('a', 'b', 'type')).toBe('typeB');
      expect(graph.getEdgeAttribute('a', 'b', 'weight')).toBe(2);
    });
  });

  describe('utility methods', () => {
    it('should apply custom function', () => {
      const graph = builder
        .directed()
        .addNode('test')
        .apply(g => {
          g.setNodeAttribute('test', 'custom', 'value');
        })
        .build();

      expect(graph.getNodeAttribute('test', 'custom')).toBe('value');
    });

    it('should get metrics', () => {
      builder
        .directed()
        .addNode('1')
        .addNode('2')
        .addEdge('1', '2');

      const metrics = builder.getMetrics();

      expect(metrics.nodeCount).toBe(2);
      expect(metrics.edgeCount).toBe(1);
    });

    it('should reset builder', () => {
      builder
        .directed()
        .addNode('node1')
        .reset()
        .undirected()
        .addNode('node2');

      const graph = builder.build();

      expect(graph.type).toBe('undirected');
      expect(graph.hasNode('node1')).toBe(false);
      expect(graph.hasNode('node2')).toBe(true);
    });

    it('should clone graph', () => {
      builder
        .directed()
        .addNode('original', { label: 'Original', value: 1 })
        .addEdge('original', 'other');

      const clone = builder.clone();
      const original = builder.build();

      // Modify clone
      clone.addNode('new');

      expect(original.hasNode('new')).toBe(false);
      expect(clone.hasNode('new')).toBe(true);
      expect(clone.hasNode('original')).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should enforce node attribute types', () => {
      const typedBuilder = new GraphBuilder<{ name: string; age: number }, { weight: number }>(graphService);

      const graph = typedBuilder
        .directed()
        .addNode('person1', { name: 'Alice', age: 30 })
        .addEdge('person1', 'person2', { weight: 0.5 })
        .build();

      const attrs = graph.getNodeAttributes('person1');
      expect(attrs.name).toBe('Alice');
      expect(attrs.age).toBe(30);

      const edgeAttrs = graph.getEdgeAttributes('person1', 'person2');
      expect(edgeAttrs.weight).toBe(0.5);
    });
  });
});