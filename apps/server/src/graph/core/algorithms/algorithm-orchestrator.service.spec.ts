import { Test, TestingModule } from '@nestjs/testing';
import { AlgorithmOrchestratorService } from './algorithm-orchestrator.service';
import { GraphologyPathfindingAlgorithm } from './graphology/pathfinding.algorithm';
import { GraphologyTraversalAlgorithm } from './graphology/traversal.algorithm';
import { GraphologyMetricsAlgorithm } from './graphology/metrics.algorithm';
import { GraphologyCommunityAlgorithm } from './graphology/community.algorithm';
import { GraphologyLayoutAlgorithm } from './graphology/layout.algorithm';
import { GraphCacheService } from '../cache/graph-cache.service';
import { NetworkEdge } from '@cbdb/core';

describe('AlgorithmOrchestratorService', () => {
  let service: AlgorithmOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgorithmOrchestratorService,
        GraphCacheService,
        GraphologyPathfindingAlgorithm,
        GraphologyTraversalAlgorithm,
        GraphologyMetricsAlgorithm,
        GraphologyCommunityAlgorithm,
        GraphologyLayoutAlgorithm,
      ],
    }).compile();

    service = module.get<AlgorithmOrchestratorService>(AlgorithmOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildGraph', () => {
    it('should build a graph from nodes and edges', () => {
      const nodes = new Set([1, 2, 3]);
      const edges: NetworkEdge[] = [
        {
          source: 1,
          target: 2,
          edgeType: 'kinship',
          edgeLabel: 'parent',
          edgeCode: 1,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 2,
          target: 3,
          edgeType: 'kinship',
          edgeLabel: 'child',
          edgeCode: 2,
          edgeDistance: 1,
          nodeDistance: 0
        }
      ];

      const graph = service.buildGraph(nodes, edges);

      expect(graph.order).toBe(3); // 3 nodes
      expect(graph.size).toBe(2); // 2 edges
      expect(graph.hasNode('1')).toBe(true);
      expect(graph.hasNode('2')).toBe(true);
      expect(graph.hasNode('3')).toBe(true);
      expect(graph.hasEdge('1', '2')).toBe(true);
      expect(graph.hasEdge('2', '3')).toBe(true);
    });
  });

  describe('findShortestPath', () => {
    it('should find shortest path between two nodes', async () => {
      const nodes = new Set([1, 2, 3, 4]);
      const edges: NetworkEdge[] = [
        {
          source: 1,
          target: 2,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 2,
          target: 3,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 3,
          target: 4,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 1,
          target: 4,
          edgeType: 'kinship',
          edgeLabel: 'direct',
          edgeCode: 4,
          edgeDistance: 1,
          nodeDistance: 0
        }
      ];

      const path = await service.findShortestPath(nodes, edges, 1, 4);

      expect(path).toBeDefined();
      expect(path).toEqual([1, 4]); // Direct path is shortest
    });

    it('should return null when no path exists', async () => {
      const nodes = new Set([1, 2, 3, 4]);
      const edges: NetworkEdge[] = [
        {
          source: 1,
          target: 2,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 3,
          target: 4,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        }
      ];

      const path = await service.findShortestPath(nodes, edges, 1, 4);

      expect(path).toBeNull();
    });
  });

  describe('findComponents', () => {
    it('should find connected components', async () => {
      const nodes = new Set([1, 2, 3, 4, 5]);
      const edges: NetworkEdge[] = [
        {
          source: 1,
          target: 2,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        },
        {
          source: 3,
          target: 4,
          edgeType: 'kinship',
          edgeLabel: 'relation',
          edgeCode: 3,
          edgeDistance: 1,
          nodeDistance: 0
        }
      ];

      const components = await service.findComponents(nodes, edges);

      // Debug log
      console.log('Components found:', components);

      expect(components).toHaveLength(3); // 3 components: [1,2], [3,4], [5]

      // Sort components by their first element for consistent testing
      const sortedComponents = components
        .map(c => c.sort((a, b) => a - b))
        .sort((a, b) => a[0] - b[0]);

      expect(sortedComponents[0]).toContain(1);
      expect(sortedComponents[0]).toContain(2);
      expect(sortedComponents[1]).toContain(3);
      expect(sortedComponents[1]).toContain(4);
      expect(sortedComponents[2]).toEqual([5]);
    });
  });
});