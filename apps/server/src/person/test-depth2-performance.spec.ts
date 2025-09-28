/**
 * Test depth=2 performance to ensure it doesn't crash or timeout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonGraphService } from './person-graph.service';

describe('Depth 2 Performance Test', () => {
  let module: TestingModule;
  let service: PersonGraphService;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get(PersonGraphService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  it('should handle depth=2 for Wang Anshi (1762) without timeout', async () => {
    const personId = 1762; // Wang Anshi - known to have many connections

    console.log('\n=== Testing Depth=2 Performance ===');
    console.log(`Person ID: ${personId} (Wang Anshi)`);

    const startTime = Date.now();
    const result = await service.exploreKinshipNetwork(personId, 2);
    const duration = Date.now() - startTime;

    console.log(`\nResults:`);
    console.log(`- Execution time: ${duration}ms`);
    console.log(`- Nodes: ${result.graphData.nodes.length}`);
    console.log(`- Edges: ${result.graphData.edges.length}`);
    console.log(`- Performance: ${Math.round(result.graphData.nodes.length / (duration / 1000))} nodes/second`);

    // Should complete quickly (under 1 second for depth=2)
    expect(duration).toBeLessThan(1000);

    // Should have expanded network
    expect(result.graphData.nodes.length).toBeGreaterThan(50);

    // Log metrics
    if (result.metrics) {
      console.log(`\nGraph Metrics:`);
      console.log(`- Density: ${result.metrics.density}`);
      console.log(`- Avg degree: ${result.metrics.avgDegree}`);
      console.log(`- Max degree: ${result.metrics.maxDegree}`);
    }
  });

  it('should handle depth=3 within reasonable time', async () => {
    const personId = 1762;

    console.log('\n=== Testing Depth=3 Performance ===');
    console.log(`Person ID: ${personId} (Wang Anshi)`);

    const startTime = Date.now();
    const result = await service.exploreKinshipNetwork(personId, 3);
    const duration = Date.now() - startTime;

    console.log(`\nResults:`);
    console.log(`- Execution time: ${duration}ms`);
    console.log(`- Nodes: ${result.graphData.nodes.length}`);
    console.log(`- Edges: ${result.graphData.edges.length}`);
    console.log(`- Performance: ${Math.round(result.graphData.nodes.length / (duration / 1000))} nodes/second`);

    // Should complete within 5 seconds even for depth=3
    expect(duration).toBeLessThan(5000);
  });

  it('should show progressive performance with different depths', async () => {
    const personId = 1762;
    const depths = [1, 2, 3];
    const results: any[] = [];

    console.log('\n=== Progressive Depth Performance ===');

    for (const depth of depths) {
      const startTime = Date.now();
      const result = await service.exploreKinshipNetwork(personId, depth);
      const duration = Date.now() - startTime;

      results.push({
        depth,
        duration,
        nodes: result.graphData.nodes.length,
        edges: result.graphData.edges.length,
        nodesPerSecond: Math.round(result.graphData.nodes.length / (duration / 1000))
      });

      console.log(`Depth ${depth}: ${duration}ms, ${result.graphData.nodes.length} nodes, ${result.graphData.edges.length} edges`);
    }

    // Performance should degrade gracefully, not exponentially
    const ratio12 = results[1].duration / results[0].duration;
    const ratio23 = results[2].duration / results[1].duration;

    console.log(`\nPerformance ratios:`);
    console.log(`- Depth 1→2: ${ratio12.toFixed(2)}x slower`);
    console.log(`- Depth 2→3: ${ratio23.toFixed(2)}x slower`);

    // Each depth should not be more than 10x slower than previous
    expect(ratio12).toBeLessThan(10);
    expect(ratio23).toBeLessThan(10);
  });
});