import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonKinshipService } from './person-kinship.service';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe('PersonKinshipService', () => {
  let service: PersonKinshipService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonKinshipService>(PersonKinshipService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe.skip('buildKinshipGraph - TODO: Feature not yet implemented', () => {
    it('should build a kinship graph for Wang Anshi (1762)', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Verify the graph exists
      expect(graph).toBeDefined();

      // Wang Anshi should be in the graph
      expect(graph.hasNode('person:1762')).toBe(true);

      // Check that Wang Anshi is marked as central
      const wangAnshiAttrs = graph.getNodeAttributes('person:1762');
      expect(wangAnshiAttrs.isCentral).toBe(true);
      expect(wangAnshiAttrs.label).toContain('王安石');

      // Verify his brothers are included
      expect(graph.hasNode('person:1760')).toBe(true); // Wang Anli
      expect(graph.hasNode('person:7076')).toBe(true); // Wang Anguo
      expect(graph.hasNode('person:21944')).toBe(true); // Wang Anren

      // Verify edges from Wang Anshi to his brothers
      expect(graph.hasEdge('person:1762', 'person:1760')).toBe(true);
      expect(graph.hasEdge('person:1762', 'person:7076')).toBe(true);
      expect(graph.hasEdge('person:1762', 'person:21944')).toBe(true);
    });

    it('should include relationships between relatives at depth > 1', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 2; // Need depth > 1 to get inter-relative connections

      const graph = await service.buildKinshipGraph(personId, depth);

      // Verify the graph exists
      expect(graph).toBeDefined();

      // Check that brothers have relationships between each other
      // Based on our SQL investigation, we know:
      // - Wang Anguo (7076) has Wang Anren (21944) as brother
      // - Wang Anren (21944) has Wang Anguo (7076) as brother

      // At least one of these edges should exist (avoiding duplicates)
      const hasAnguoToAnren = graph.hasEdge('person:7076', 'person:21944');
      const hasAnrenToAnguo = graph.hasEdge('person:21944', 'person:7076');

      expect(hasAnguoToAnren || hasAnrenToAnguo).toBe(true);

      // Verify the edge has proper kinship data
      if (hasAnguoToAnren) {
        const edgeAttrs = graph.getEdgeAttributes('person:7076', 'person:21944');
        expect(edgeAttrs.kinshipCode).toBeDefined();
        expect(edgeAttrs.label).toBeTruthy();
      } else if (hasAnrenToAnguo) {
        const edgeAttrs = graph.getEdgeAttributes('person:21944', 'person:7076');
        expect(edgeAttrs.kinshipCode).toBeDefined();
        expect(edgeAttrs.label).toBeTruthy();
      }
    });

    it('should not duplicate edges between the same people', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 2;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Count edges in the graph
      const edgeCount = graph.size;

      // Create a set to track unique person pairs
      const uniquePairs = new Set<string>();

      graph.forEachEdge((edge, attributes, source, target) => {
        // Create a normalized key for the pair (smaller id first)
        const [id1, id2] = [source, target].sort();
        const pairKey = `${id1}-${id2}`;

        // This pair should not have been seen before
        expect(uniquePairs.has(pairKey)).toBe(false);
        uniquePairs.add(pairKey);
      });

      // The number of unique pairs should equal the edge count
      expect(uniquePairs.size).toBe(edgeCount);
    });

    it('should include reciprocal relationships from getFullRelations', async () => {
      const personId = 1760; // Wang Anli
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Wang Anli should be central
      expect(graph.hasNode('person:1760')).toBe(true);
      const wangAnliAttrs = graph.getNodeAttributes('person:1760');
      expect(wangAnliAttrs.isCentral).toBe(true);

      // Wang Anshi should be included as Wang Anli's brother
      // This is a reciprocal relationship (Wang Anshi → Wang Anli exists as 弟)
      expect(graph.hasNode('person:1762')).toBe(true);

      // There should be an edge between them
      const hasAnliToAnshi = graph.hasEdge('person:1760', 'person:1762');
      const hasAnshiToAnli = graph.hasEdge('person:1762', 'person:1760');
      expect(hasAnliToAnshi || hasAnshiToAnli).toBe(true);
    });

    it('should respect depth limits', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // All non-central nodes should have depth 1
      graph.forEachNode((node, attributes) => {
        if (node !== 'person:1762') {
          expect(attributes.depth).toBe(1);
        }
      });

      // Build a deeper graph
      const deepGraph = await service.buildKinshipGraph(personId, 2);

      // Should have more nodes at depth 2
      const depthTwoNodes = [];
      deepGraph.forEachNode((node, attributes) => {
        if (attributes.depth === 2) {
          depthTwoNodes.push(node);
        }
      });

      // There should be some depth 2 nodes
      expect(depthTwoNodes.length).toBeGreaterThan(0);
    });

    it('should pass through kinship data transparently', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Check edges have kinship data
      graph.forEachEdge((edge, attributes) => {
        // Should have kinship code
        expect(attributes.kinshipCode).toBeDefined();

        // Should have label (Chinese or English)
        expect(attributes.label || attributes.kinshipType || attributes.kinshipTypeChn).toBeTruthy();

        // Should NOT have domain-specific visual properties
        // (no color coding, no weight based on relationship type)
        expect(attributes.color).toBeUndefined();
        expect(attributes.weight).toBeUndefined();
      });
    });
  });

  describe.skip('edge deduplication - TODO: Feature not yet implemented', () => {
    it('should use createEdgeKey to prevent duplicate edges', async () => {
      // This is a unit test for the helper method
      // The createEdgeKey should produce the same key regardless of order
      const key1 = (service as any).createEdgeKey(1762, 1760);
      const key2 = (service as any).createEdgeKey(1760, 1762);

      expect(key1).toBe(key2);
      expect(key1).toBe('1760-1762'); // Smaller ID first
    });
  });
});