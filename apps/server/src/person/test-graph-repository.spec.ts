/**
 * Quick test to debug PersonGraphRepository
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonGraphRepository } from './person-graph.repository';

describe('PersonGraphRepository Debug', () => {
  let module: TestingModule;
  let repository: PersonGraphRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get(PersonGraphRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  it('should find edges for person 1762', async () => {
    const personId = 1762; // Wang Anshi

    console.log('\n=== Testing PersonGraphRepository for person 1762 ===');

    // Test getting edges
    const edges = await repository.getEdgesBatch([personId], ['kinship']);

    console.log(`Found ${edges.length} kinship edges for person ${personId}`);

    if (edges.length > 0) {
      console.log('Sample edges:');
      edges.slice(0, 5).forEach(edge => {
        console.log(`  ${edge.sourceId} -> ${edge.targetId} (${edge.edgeType}, code: ${edge.edgeCode}, label: ${edge.edgeLabel})`);
      });
    }

    expect(edges.length).toBeGreaterThan(0);
  });

  it('should find nodes for batch of IDs', async () => {
    const nodeIds = [1762, 526, 1];

    console.log('\n=== Testing node batch loading ===');

    const nodes = await repository.getNodesBatch(nodeIds);

    console.log(`Found ${nodes.length} nodes`);
    nodes.forEach(node => {
      console.log(`  Node ${node.nodeId}: ${node.nodeLabel}`);
    });

    expect(nodes.length).toBeGreaterThan(0);
  });
});