import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonKinshipService } from './person-kinship.service';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe.skip('PersonKinshipService - Graph Building - TODO: buildKinshipGraph not yet implemented', () => {
  let service: PersonKinshipService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonKinshipService>(PersonKinshipService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('buildKinshipGraph - Wang Anshi label issue', () => {
    it('should set Wang Anshi node with proper name and label', async () => {
      const personId = 1762; // Wang Anshi
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Get Wang Anshi's node attributes
      const wangAnshiAttrs = graph.getNodeAttributes('person:1762');

      // Debug output
      console.log('Wang Anshi attributes:', wangAnshiAttrs);

      // The critical assertions - Wang Anshi should have proper Chinese name as label
      expect(wangAnshiAttrs).toBeDefined();
      expect(wangAnshiAttrs.label).toBe('王安石'); // Should NOT be null or 'person:1762'
      expect(wangAnshiAttrs.name).toBe('Wang Anshi');
      expect(wangAnshiAttrs.nameChn).toBe('王安石');
      expect(wangAnshiAttrs.isCentral).toBe(true);
      expect(wangAnshiAttrs.depth).toBe(0);
      expect(wangAnshiAttrs.dynasty).toBe(15);
    });

    it('should not overwrite central person attributes when processing network', async () => {
      const personId = 1762;
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Check multiple nodes to ensure only Wang Anshi has isCentral flag
      let centralCount = 0;
      let wangAnshiLabel = null;

      graph.forEachNode((node, attrs) => {
        if (attrs.isCentral) {
          centralCount++;
          if (node === 'person:1762') {
            wangAnshiLabel = attrs.label;
          }
        }
      });

      expect(centralCount).toBe(1); // Only one central node
      expect(wangAnshiLabel).toBe('王安石'); // Central node has correct label
    });

    it('should have all other relatives with proper labels too', async () => {
      const personId = 1762;
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      // Check that other people also have proper labels
      // Wang Anli (1760) is Wang Anshi's brother
      if (graph.hasNode('person:1760')) {
        const wangAnliAttrs = graph.getNodeAttributes('person:1760');
        expect(wangAnliAttrs.label).toBe('王安禮');
        expect(wangAnliAttrs.name).toBe('Wang Anli');
        expect(wangAnliAttrs.nameChn).toBe('王安禮');
        expect(wangAnliAttrs.isCentral).toBeUndefined(); // Should not be central
      }

      // Wang Anguo (7076) is also Wang Anshi's brother
      if (graph.hasNode('person:7076')) {
        const wangAnguoAttrs = graph.getNodeAttributes('person:7076');
        expect(wangAnguoAttrs.label).toBe('王安國');
        expect(wangAnguoAttrs.name).toBe('Wang Anguo');
        expect(wangAnguoAttrs.nameChn).toBe('王安國');
      }
    });

    it('should not have any nodes with null labels', async () => {
      const personId = 1762;
      const depth = 1;

      const graph = await service.buildKinshipGraph(personId, depth);

      const nodesWithNullLabels: string[] = [];

      graph.forEachNode((node, attrs) => {
        if (attrs.label === null || attrs.label === undefined) {
          nodesWithNullLabels.push(node);
        }
      });

      expect(nodesWithNullLabels).toEqual([]); // No nodes should have null labels
    });

    it('should not duplicate node attributes when same person appears multiple times', async () => {
      const personId = 1762;
      const depth = 2; // Deeper depth might have more complex relationships

      const graph = await service.buildKinshipGraph(personId, depth);

      // Wang Anshi should still have correct attributes even with deeper traversal
      const wangAnshiAttrs = graph.getNodeAttributes('person:1762');

      expect(wangAnshiAttrs.label).toBe('王安石');
      expect(wangAnshiAttrs.name).toBe('Wang Anshi');
      expect(wangAnshiAttrs.nameChn).toBe('王安石');
      expect(wangAnshiAttrs.isCentral).toBe(true);

      // Count total nodes to ensure no duplicates
      const nodeCount = graph.order; // Total number of nodes
      const uniquePersonIds = new Set<number>();

      graph.forEachNode((node) => {
        const match = node.match(/person:(\d+)/);
        if (match) {
          uniquePersonIds.add(parseInt(match[1]));
        }
      });

      expect(nodeCount).toBe(uniquePersonIds.size); // Each person should appear only once
    });
  });
});