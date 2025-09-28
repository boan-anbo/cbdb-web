/**
 * Integration test for PersonGraphService with PersonGraphRepository
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonGraphService } from './person-graph.service';
import { ExploreDirectNetworkQuery } from '@cbdb/core';

describe('PersonGraphService Integration', () => {
  let module: TestingModule;
  let service: PersonGraphService;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get(PersonGraphService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  it('should explore kinship network using PersonGraphRepository', async () => {
    const personId = 1762; // Wang Anshi

    console.log('\n=== Testing PersonGraphService with PersonGraphRepository ===');

    // Test the kinship network exploration
    const result = await service.exploreKinshipNetwork(personId, 1);

    console.log(`Central person: ${result.centralPersonId}`);
    console.log(`Nodes: ${result.graphData.nodes.length}`);
    console.log(`Edges: ${result.graphData.edges.length}`);

    // Should have nodes and edges now
    expect(result.graphData.nodes.length).toBeGreaterThan(1);
    expect(result.graphData.edges.length).toBeGreaterThan(0);

    // Verify the central node exists
    const centralNode = result.graphData.nodes.find(n => n.key === `person:${personId}`);
    expect(centralNode).toBeDefined();
    expect(centralNode?.attributes?.label).toContain('王安石');

    // Log sample edges for verification
    if (result.graphData.edges.length > 0) {
      console.log('Sample edges:');
      result.graphData.edges.slice(0, 5).forEach(edge => {
        const sourceNode = result.graphData.nodes.find(n => n.key === edge.source);
        const targetNode = result.graphData.nodes.find(n => n.key === edge.target);
        console.log(`  ${sourceNode?.attributes?.label} -> ${targetNode?.attributes?.label}: ${edge.attributes?.label}`);
      });
    }
  });

  it('should explore direct network with batch loading', async () => {
    const query = new ExploreDirectNetworkQuery();
    query.personId = 1762;
    query.includeKinship = true;
    query.includeAssociations = false;
    query.includeOffices = false;

    console.log('\n=== Testing Direct Network Exploration ===');

    const startTime = Date.now();
    const result = await service.exploreDirectNetwork(query);
    const duration = Date.now() - startTime;

    console.log(`Execution time: ${duration}ms`);
    console.log(`Nodes: ${result.graphData.nodes.length}`);
    console.log(`Edges: ${result.graphData.edges.length}`);

    // Should be fast with batch loading
    expect(duration).toBeLessThan(500); // Should complete in under 500ms
    expect(result.graphData.nodes.length).toBeGreaterThan(1);
    expect(result.graphData.edges.length).toBeGreaterThan(0);
  });

  it('should explore multi-depth network efficiently', async () => {
    const personId = 1762;

    console.log('\n=== Testing Multi-Depth Network (depth=2) ===');

    const startTime = Date.now();
    const result = await service.exploreKinshipNetwork(personId, 2);
    const duration = Date.now() - startTime;

    console.log(`Execution time: ${duration}ms`);
    console.log(`Nodes: ${result.graphData.nodes.length}`);
    console.log(`Edges: ${result.graphData.edges.length}`);

    // Should complete without timeout even for depth=2
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(result.graphData.nodes.length).toBeGreaterThan(10); // Should have expanded network
  });
});