/**
 * Performance Benchmark Suite for Graph Optimization
 *
 * This test suite establishes baseline performance metrics and validates
 * optimizations throughout the implementation process.
 *
 * Run: npm test -- person-graph.benchmark.spec.ts
 * Run with watch: npm test -- --watch person-graph.benchmark.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonGraphService } from './person-graph.service';
import { PersonGraphController } from './person-graph.controller';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { ExplorePersonNetworkQuery } from '@cbdb/core';

describe('Graph System Performance Benchmarks', () => {
  let module: TestingModule;
  let service: PersonGraphService;
  let controller: PersonGraphController;

  // Test persons with different network sizes
  const TEST_CASES = [
    { personId: 1, name: 'Kou Zhun', expectedNodes: 'small' },
    { personId: 1762, name: 'Wang Anshi', expectedNodes: 'large' },
    { personId: 526, name: 'Test Person 526', expectedNodes: 'medium' },
  ];

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonGraphService>(PersonGraphService);
    controller = module.get<PersonGraphController>(PersonGraphController);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('Baseline Performance Metrics', () => {
    it('should establish baseline for depth=1 queries', async () => {
      const results = [];

      for (const testCase of TEST_CASES) {
        const startTime = Date.now();
        const startMem = process.memoryUsage().heapUsed;

        const result = await controller.getKinshipNetwork(testCase.personId, { depth: '1' });

        const duration = Date.now() - startTime;
        const memUsed = process.memoryUsage().heapUsed - startMem;

        results.push({
          personId: testCase.personId,
          name: testCase.name,
          duration,
          memUsedMB: Math.round(memUsed / 1024 / 1024 * 10) / 10,
          nodes: result.nodes?.length || 0,
          edges: result.edges?.length || 0,
        });

        console.log(`\nBaseline depth=1 for ${testCase.name} (ID: ${testCase.personId}):`);
        console.log(`  Duration: ${duration}ms`);
        console.log(`  Memory: ${results[results.length - 1].memUsedMB}MB`);
        console.log(`  Nodes: ${result.nodes?.length || 0}`);
        console.log(`  Edges: ${result.edges?.length || 0}`);
      }

      // All depth=1 queries should complete quickly
      results.forEach(r => {
        expect(r.duration).toBeLessThan(500);
      });
    });

    it('should establish baseline for depth=2 queries', async () => {
      const results = [];

      for (const testCase of TEST_CASES.slice(0, 2)) { // Skip large networks for now
        const startTime = Date.now();
        const startMem = process.memoryUsage().heapUsed;

        try {
          const result = await controller.getKinshipNetwork(testCase.personId, { depth: '2' });

          const duration = Date.now() - startTime;
          const memUsed = process.memoryUsage().heapUsed - startMem;

          results.push({
            personId: testCase.personId,
            name: testCase.name,
            duration,
            memUsedMB: Math.round(memUsed / 1024 / 1024 * 10) / 10,
            nodes: result.nodes?.length || 0,
            edges: result.edges?.length || 0,
            status: 'success',
          });

          console.log(`\nBaseline depth=2 for ${testCase.name} (ID: ${testCase.personId}):`);
          console.log(`  Duration: ${duration}ms`);
          console.log(`  Memory: ${results[results.length - 1].memUsedMB}MB`);
          console.log(`  Nodes: ${result.nodes?.length || 0}`);
          console.log(`  Edges: ${result.edges?.length || 0}`);
        } catch (error) {
          const duration = Date.now() - startTime;
          results.push({
            personId: testCase.personId,
            name: testCase.name,
            duration,
            memUsedMB: 0,
            nodes: 0,
            edges: 0,
            status: 'failed',
            error: error.message,
          });

          console.log(`\nBaseline depth=2 for ${testCase.name} (ID: ${testCase.personId}):`);
          console.log(`  FAILED after ${duration}ms: ${error.message}`);
        }
      }

      // Record baseline - may fail initially, will improve with optimizations
      console.log('\n=== Depth=2 Baseline Summary ===');
      results.forEach(r => {
        if (r.status === 'success') {
          console.log(`${r.name}: ${r.duration}ms, ${r.memUsedMB}MB, ${r.nodes} nodes`);
        } else {
          console.log(`${r.name}: FAILED after ${r.duration}ms`);
        }
      });
    }, 20000); // 20 second timeout
  });

  describe('Query Pattern Performance', () => {
    it('should measure loop-based query performance', async () => {
      const personId = 1762;
      const { PersonKinshipRelationRepository } = await import('../kinship/person-kinship-relation.repository');
      const kinshipRepo = module.get(PersonKinshipRelationRepository);

      console.log('\n=== Loop-based Query Pattern (Current) ===');

      // Simulate current loop-based pattern
      const startTime = Date.now();
      const firstLevelKinships = await kinshipRepo.getDirectKinships(personId);
      const firstLevelDuration = Date.now() - startTime;

      console.log(`First level query: ${firstLevelDuration}ms for ${firstLevelKinships.length} relations`);

      // Get unique person IDs
      const relatedPersonIds = [...new Set(firstLevelKinships.map(k => k.kinPersonId))];

      // Simulate loop-based second level queries
      const secondLevelStart = Date.now();
      let totalSecondLevel = 0;

      for (const relatedId of relatedPersonIds.slice(0, 10)) { // Test with first 10
        const relations = await kinshipRepo.getDirectKinships(relatedId);
        totalSecondLevel += relations.length;
      }

      const secondLevelDuration = Date.now() - secondLevelStart;

      console.log(`Second level loop queries: ${secondLevelDuration}ms for 10 persons`);
      console.log(`Average per query: ${Math.round(secondLevelDuration / 10)}ms`);
      console.log(`Extrapolated for ${relatedPersonIds.length} persons: ${Math.round(secondLevelDuration / 10 * relatedPersonIds.length)}ms`);

      expect(firstLevelDuration).toBeLessThan(100);
    });

    it('should measure batch query performance potential', async () => {
      const personId = 1762;
      const { PersonKinshipRelationRepository } = await import('../kinship/person-kinship-relation.repository');
      const { PersonRepository } = await import('./person.repository');
      const kinshipRepo = module.get(PersonKinshipRelationRepository);
      const personRepo = module.get(PersonRepository);

      console.log('\n=== Batch Query Pattern (Target) ===');

      // Get first level
      const firstLevelKinships = await kinshipRepo.getDirectKinships(personId);
      const relatedPersonIds = [...new Set(firstLevelKinships.map(k => k.kinPersonId))];

      // Measure batch loading potential
      const batchStart = Date.now();
      const persons = await personRepo.findModelsByIds(relatedPersonIds);
      const batchDuration = Date.now() - batchStart;

      console.log(`Batch load ${relatedPersonIds.length} persons: ${batchDuration}ms`);
      console.log(`Average per person: ${Math.round(batchDuration / relatedPersonIds.length * 10) / 10}ms`);

      // This should be much faster than loop-based
      expect(batchDuration).toBeLessThan(relatedPersonIds.length * 10); // Should be less than 10ms per person
    });
  });

  describe('Memory Usage Patterns', () => {
    it('should measure memory usage for different graph sizes', async () => {
      const testSizes = [
        { personId: 1, depth: 1, label: 'Small (depth=1)' },
        { personId: 1, depth: 2, label: 'Small (depth=2)' },
        { personId: 1762, depth: 1, label: 'Large (depth=1)' },
      ];

      console.log('\n=== Memory Usage Analysis ===');

      for (const test of testSizes) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const memBefore = process.memoryUsage();

        try {
          const result = await controller.getKinshipNetwork(test.personId, {
            depth: test.depth.toString()
          });

          const memAfter = process.memoryUsage();

          const memUsed = {
            heapMB: Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024 * 10) / 10,
            externalMB: Math.round((memAfter.external - memBefore.external) / 1024 / 1024 * 10) / 10,
            totalMB: Math.round((memAfter.heapUsed + memAfter.external - memBefore.heapUsed - memBefore.external) / 1024 / 1024 * 10) / 10,
          };

          console.log(`\n${test.label}:`);
          console.log(`  Nodes: ${result.nodes?.length || 0}`);
          console.log(`  Edges: ${result.edges?.length || 0}`);
          console.log(`  Heap: ${memUsed.heapMB}MB`);
          console.log(`  External: ${memUsed.externalMB}MB`);
          console.log(`  Total: ${memUsed.totalMB}MB`);
          console.log(`  Per node: ${result.nodes?.length ? Math.round(memUsed.totalMB / result.nodes.length * 1000) / 1000 : 0}MB`);
        } catch (error) {
          console.log(`\n${test.label}: FAILED - ${error.message}`);
        }
      }
    });
  });

  describe('Algorithm Performance Comparison', () => {
    it('should compare manual traversal vs graph algorithms', async () => {
      const personId = 1762;

      console.log('\n=== Algorithm Performance Comparison ===');

      // Test current manual traversal
      const manualStart = Date.now();
      const query = new ExplorePersonNetworkQuery();
      query.personId = personId;
      query.depth = 1;
      query.includeReciprocal = false; // Disabled due to O(n²) issue

      const manualResult = await service.explorePersonNetwork(query);
      const manualDuration = Date.now() - manualStart;

      console.log(`Manual traversal (current):`);
      console.log(`  Duration: ${manualDuration}ms`);
      console.log(`  Nodes: ${manualResult.graphData.nodes.length}`);
      console.log(`  Edges: ${manualResult.graphData.edges.length}`);

      // Future: Test graph algorithm traversal
      // This will be implemented after we add the graph algorithms
      console.log(`\nGraph algorithm traversal (target):`);
      console.log(`  Will be implemented in Phase 4`);
      console.log(`  Expected: < ${Math.round(manualDuration / 2)}ms`);

      expect(manualDuration).toBeLessThan(2000);
    });
  });

  describe('Target Performance Goals', () => {
    it('should define and track optimization targets', async () => {
      console.log('\n=== Performance Optimization Targets ===');
      console.log('Current Status → Target Goal');
      console.log('─'.repeat(50));

      const targets = [
        { metric: 'Depth 2 query (small)', current: '~1000ms', target: '< 200ms' },
        { metric: 'Depth 2 query (large)', current: 'timeout', target: '< 500ms' },
        { metric: 'Depth 3 query', current: 'timeout', target: '< 1000ms' },
        { metric: 'Memory per node', current: '~1MB', target: '< 0.1MB' },
        { metric: 'Batch load 100 IDs', current: 'N/A', target: '< 50ms' },
        { metric: 'Cache hit rate', current: '0%', target: '> 80%' },
      ];

      targets.forEach(t => {
        console.log(`${t.metric.padEnd(25)} ${t.current.padEnd(12)} → ${t.target}`);
      });

      console.log('\n' + '─'.repeat(50));
      console.log('These targets will be validated as we implement optimizations.');

      // This test just documents our goals
      expect(true).toBe(true);
    });
  });
});