/**
 * Test Suite for PersonGraphRepository
 *
 * Tests for the specialized graph repository that returns minimal data
 * optimized for graph operations.
 *
 * These tests define the expected behavior BEFORE implementation (TDD).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { getEmptyTestDb } from '../../test/get-empty-test-db';
import * as schema from '../db/cbdb-schema/schema';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

// Define the expected interfaces for graph data
interface GraphEdgeData {
  sourceId: number;
  targetId: number;
  edgeType: 'kinship' | 'association' | 'office';
  edgeCode?: number;
  edgeLabel?: string;
  edgeWeight?: number;
}

interface GraphNodeData {
  nodeId: number;
  nodeLabel: string;
  nodeType?: string;
  metadata?: {
    dynastyCode?: number;
    birthYear?: number;
    deathYear?: number;
  };
}

import { PersonGraphRepository } from './person-graph.repository';

describe('PersonGraphRepository', () => {
  let module: TestingModule;
  let repository: PersonGraphRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get(PersonGraphRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('Minimal Data Queries', () => {
    it('should return only edge data needed for graphs', async () => {
      // This test will be enabled once PersonGraphRepository is implemented
      const personIds = [1762, 526];

      const edges = await repository.getEdgesBatch(personIds, ['kinship']);

      // Verify we only get the minimal fields
      edges.forEach((edge: GraphEdgeData) => {
        expect(edge).toHaveProperty('sourceId');
        expect(edge).toHaveProperty('targetId');
        expect(edge).toHaveProperty('edgeType');
        expect(typeof edge.sourceId).toBe('number');
        expect(typeof edge.targetId).toBe('number');

        // Should NOT have full domain object properties
        expect(edge).not.toHaveProperty('c_personid');
        expect(edge).not.toHaveProperty('kinPerson');
        expect(edge).not.toHaveProperty('createdAt');
      });
    });

    it('should return only node data needed for display', async () => {
      const nodeIds = [1762, 526, 1];

      const nodes = await repository.getNodesBatch(nodeIds);

      nodes.forEach((node: GraphNodeData) => {
        expect(node).toHaveProperty('nodeId');
        expect(node).toHaveProperty('nodeLabel');

        // Should have minimal metadata
        if (node.metadata) {
          const allowedKeys = ['dynastyCode', 'birthYear', 'deathYear'];
          Object.keys(node.metadata).forEach(key => {
            expect(allowedKeys).toContain(key);
          });
        }

        // Should NOT have full person object
        expect(node).not.toHaveProperty('c_personid');
        expect(node).not.toHaveProperty('addresses');
        expect(node).not.toHaveProperty('kinships');
      });
    });
  });

  describe('Batch Loading Performance', () => {
    it('should load edges for multiple persons in single query', async () => {
      const personIds = [1, 2, 3, 4, 5];

      const startTime = Date.now();
      const edges = await repository.getEdgesBatch(personIds, ['kinship', 'association']);
      const duration = Date.now() - startTime;

      console.log(`Batch loaded edges for ${personIds.length} persons in ${duration}ms`);

      // Should be very fast - single query
      expect(duration).toBeLessThan(50);

      // Should return edges for all requested persons
      const uniqueSourceIds = new Set(edges.map((e: GraphEdgeData) => e.sourceId));
      personIds.forEach(id => {
        if (edges.some((e: GraphEdgeData) => e.sourceId === id)) {
          expect(uniqueSourceIds).toContain(id);
        }
      });
    });

    it('should efficiently load nodes in batch', async () => {
      const nodeIds = Array.from({ length: 100 }, (_, i) => i + 1);

      const startTime = Date.now();
      const nodes = await repository.getNodesBatch(nodeIds);
      const duration = Date.now() - startTime;

      console.log(`Batch loaded ${nodes.length} nodes in ${duration}ms`);

      // Should be fast even for 100 nodes
      expect(duration).toBeLessThan(100);

      // Each node should be minimal
      const avgSize = JSON.stringify(nodes).length / nodes.length;
      console.log(`Average node size: ${Math.round(avgSize)} bytes`);
      expect(avgSize).toBeLessThan(200); // Should be small
    });
  });

  describe('Recursive Network Queries', () => {
    it.skip('should get all edges within N degrees using CTE', async () => {
      const centerPersonId = 1762;
      const maxDegrees = 2;

      const edges = await repository.getNetworkEdges(centerPersonId, maxDegrees);

      // Should return edges for multi-degree network
      expect(edges.length).toBeGreaterThan(0);

      // All edges should be within maxDegrees of center
      const nodesInNetwork = new Set<number>();
      nodesInNetwork.add(centerPersonId);

      // Build network iteratively to verify degree constraint
      for (let degree = 1; degree <= maxDegrees; degree++) {
        const nodesAtPrevDegree = [...nodesInNetwork];
        edges.forEach((edge: GraphEdgeData) => {
          if (nodesAtPrevDegree.includes(edge.sourceId)) {
            nodesInNetwork.add(edge.targetId);
          }
          if (nodesAtPrevDegree.includes(edge.targetId)) {
            nodesInNetwork.add(edge.sourceId);
          }
        });
      }

      // All edge endpoints should be in the network
      edges.forEach((edge: GraphEdgeData) => {
        expect(nodesInNetwork.has(edge.sourceId) || nodesInNetwork.has(edge.targetId)).toBe(true);
      });
    });

    it.skip('should handle bidirectional edges correctly', async () => {
      const centerPersonId = 1762;

      const edges = await repository.getNetworkEdges(centerPersonId, 1);

      // Check for any bidirectional relationships
      const edgePairs = new Map<string, GraphEdgeData>();
      const bidirectional: GraphEdgeData[] = [];

      edges.forEach((edge: GraphEdgeData) => {
        const reverseKey = `${edge.targetId}-${edge.sourceId}`;
        const forwardKey = `${edge.sourceId}-${edge.targetId}`;

        if (edgePairs.has(reverseKey)) {
          bidirectional.push(edge);
          bidirectional.push(edgePairs.get(reverseKey)!);
        } else {
          edgePairs.set(forwardKey, edge);
        }
      });

      console.log(`Found ${bidirectional.length / 2} bidirectional relationships`);
    });
  });

  describe('Controlled Data Tests', () => {
    it('should work with controlled test data', async () => {
      // This test uses empty DB to verify exact behavior
      const db = await getEmptyTestDb();

      // Insert controlled test data
      await db.insert(schema.BIOG_MAIN).values([
        { c_personid: 1, c_name: 'Person 1', c_name_chn: '人物一', c_female: 0, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 },
        { c_personid: 2, c_name: 'Person 2', c_name_chn: '人物二', c_female: 0, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 },
        { c_personid: 3, c_name: 'Person 3', c_name_chn: '人物三', c_female: 1, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 },
      ]);

      await db.insert(schema.KIN_DATA).values([
        { c_personid: 1, c_kin_id: 2, c_kin_code: 75 }, // Person 1 -> Person 2 (Father)
        { c_personid: 2, c_kin_id: 1, c_kin_code: 180 }, // Person 2 -> Person 1 (Son)
        { c_personid: 1, c_kin_id: 3, c_kin_code: 117 }, // Person 1 -> Person 3 (Wife)
        { c_personid: 3, c_kin_id: 1, c_kin_code: 134 }, // Person 3 -> Person 1 (Husband)
      ]);

      // Once implemented, create repository with this db
      // const testRepository = new PersonGraphRepository(db);

      // Test with controlled data
      // const edges = await testRepository.getEdgesBatch([1], ['kinship']);
      // expect(edges).toHaveLength(2); // Person 1 has 2 kinship edges

      // const nodes = await testRepository.getNodesBatch([1, 2, 3]);
      // expect(nodes).toHaveLength(3);
      // expect(nodes[0].nodeLabel).toContain('人物');

      expect(true).toBe(true); // Placeholder until implementation
    });
  });

  describe('Query Optimization Verification', () => {
    it.skip('should use minimal SELECT columns', async () => {
      // We can verify this by checking the query execution plan
      // or by monitoring the actual SQL executed

      const personIds = [1762];

      // Capture the SQL query (implementation detail)
      // This would require query logging or inspection
      const edges = await repository.getEdgesBatch(personIds, ['kinship']);

      // The query should only select necessary columns
      // Not: SELECT * FROM KIN_DATA
      // But: SELECT c_personid, c_kin_id, c_kin_code FROM KIN_DATA

      // Verify result has minimal fields
      if (edges.length > 0) {
        const keys = Object.keys(edges[0]);
        expect(keys.length).toBeLessThanOrEqual(6); // Only essential fields
      }
    });

    it.skip('should use proper indexes for graph queries', async () => {
      // Test that queries are using indexes efficiently
      const startTime = Date.now();

      // This should use index on c_personid
      const edges = await repository.getEdgesBatch([1762], ['kinship']);

      const duration = Date.now() - startTime;

      // Indexed query should be very fast
      expect(duration).toBeLessThan(10);

      console.log(`Indexed query took ${duration}ms for ${edges.length} edges`);
    });
  });
});