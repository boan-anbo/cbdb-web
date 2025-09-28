/**
 * Performance Test for PersonGraphService
 *
 * Tests the performance of kinship network queries, especially with depth=2
 * which can result in large networks (400+ nodes).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PersonGraphService } from './person-graph.service';
import { PersonGraphController } from './person-graph.controller';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe('PersonGraphService Performance', () => {
  let module: TestingModule;
  let service: PersonGraphService;
  let controller: PersonGraphController;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonGraphService>(PersonGraphService);
    controller = module.get<PersonGraphController>(PersonGraphController);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('Kinship Network Performance', () => {
    it('should complete kinship network depth=1 within 2 seconds', async () => {
      const startTime = Date.now();

      const result = await controller.getKinshipNetwork(1762, { depth: '1' });

      const duration = Date.now() - startTime;
      console.log(`Kinship network depth=1 took ${duration}ms`);
      console.log(`  - Nodes: ${result.nodes?.length || 0}`);
      console.log(`  - Edges: ${result.edges?.length || 0}`);

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
    });

    it('should complete kinship network depth=2 within 10 seconds', async () => {
      const startTime = Date.now();

      try {
        const result = await controller.getKinshipNetwork(1762, { depth: '2' });

        const duration = Date.now() - startTime;
        console.log(`Kinship network depth=2 took ${duration}ms`);
        console.log(`  - Nodes: ${result.nodes?.length || 0}`);
        console.log(`  - Edges: ${result.edges?.length || 0}`);

        expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
        expect(result).toBeDefined();
        expect(result.nodes).toBeDefined();
        expect(result.edges).toBeDefined();

        // Check if there are duplicate nodes
        const nodeIds = result.nodes.map(n => n.id);
        const uniqueNodeIds = new Set(nodeIds);
        if (nodeIds.length !== uniqueNodeIds.size) {
          console.warn(`Found duplicate nodes: ${nodeIds.length} total, ${uniqueNodeIds.size} unique`);
        }

        // Check for duplicate edges
        const edgeKeys = result.edges.map(e => `${e.source}-${e.target}`);
        const uniqueEdgeKeys = new Set(edgeKeys);
        if (edgeKeys.length !== uniqueEdgeKeys.size) {
          console.warn(`Found duplicate edges: ${edgeKeys.length} total, ${uniqueEdgeKeys.size} unique`);
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Kinship network depth=2 failed after ${duration}ms:`, error.message);
        throw error;
      }
    }, 15000); // Set timeout to 15 seconds

    it('should profile exploreKinshipNetwork method with depth=2', async () => {
      const personId = 1762;
      const depth = 2;

      console.log('\n=== Profiling exploreKinshipNetwork ===');
      const totalStart = Date.now();

      // Profile the service method directly
      const serviceStart = Date.now();
      const result = await service.exploreKinshipNetwork(personId, depth);
      const serviceDuration = Date.now() - serviceStart;

      console.log(`Service execution: ${serviceDuration}ms`);
      console.log(`  - Nodes: ${result.graphData.nodes.length}`);
      console.log(`  - Edges: ${result.graphData.edges.length}`);
      console.log(`  - Metrics calculation included`);

      // Check memory usage if available
      if (process.memoryUsage) {
        const mem = process.memoryUsage();
        console.log(`Memory usage:`);
        console.log(`  - Heap used: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`);
        console.log(`  - External: ${Math.round(mem.external / 1024 / 1024)}MB`);
      }

      expect(result).toBeDefined();
      expect(result.graphData.nodes.length).toBeGreaterThan(0);
    }, 20000);

    it('should measure coordinate population performance', async () => {
      // First get the network data
      const networkResult = await service.exploreKinshipNetwork(1762, 2);

      console.log('\n=== Measuring Coordinate Population ===');
      console.log(`Graph size: ${networkResult.graphData.nodes.length} nodes, ${networkResult.graphData.edges.length} edges`);

      // Test if coordinates are present
      const nodesWithCoordinates = networkResult.graphData.nodes.filter(
        n => n.attributes?.x !== undefined && n.attributes?.y !== undefined
      );

      console.log(`Nodes with coordinates: ${nodesWithCoordinates.length}/${networkResult.graphData.nodes.length}`);

      expect(nodesWithCoordinates.length).toBe(networkResult.graphData.nodes.length);
    }, 20000);
  });

  describe('Database Query Performance', () => {
    it('should profile database queries for kinship relations', async () => {
      const personId = 1762;

      console.log('\n=== Profiling Database Queries ===');

      // Profile direct kinship query
      const { PersonKinshipRelationRepository } = await import('../kinship/person-kinship-relation.repository');
      const kinshipRepo = module.get(PersonKinshipRelationRepository);

      const queryStart = Date.now();
      const kinships = await kinshipRepo.getDirectKinships(personId);
      const queryDuration = Date.now() - queryStart;

      console.log(`Direct kinship query: ${queryDuration}ms`);
      console.log(`  - Results: ${kinships.length} kinship relations`);

      // Profile batch person query
      const { PersonRepository } = await import('./person.repository');
      const personRepo = module.get(PersonRepository);
      const personIds = kinships.map(k => k.kinPersonId).filter(id => id !== personId);

      const batchStart = Date.now();
      const persons = await personRepo.findModelsByIds(personIds.slice(0, 50)); // Test with first 50
      const batchDuration = Date.now() - batchStart;

      console.log(`Batch person query (50 IDs): ${batchDuration}ms`);
      console.log(`  - Results: ${persons.length} persons`);

      expect(queryDuration).toBeLessThan(500); // Direct query should be fast
      expect(batchDuration).toBeLessThan(1000); // Batch query should be reasonable
    });
  });
});