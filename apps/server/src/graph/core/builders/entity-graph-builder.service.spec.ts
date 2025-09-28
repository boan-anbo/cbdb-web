import { describe, it, expect, beforeEach } from 'vitest';
import { EntityGraphBuilder } from '@/graph/core/builders/entity-graph-builder.service';
import { GraphBuilder } from '@/graph/core/builders/graph-builder.service';
import { GraphService } from '@/graph/graph.service';

interface TestNode {
  entityType: string;
  entityId: string | number;
  label?: string;
  name?: string;
  nameChn?: string;
  [key: string]: any;
}

interface TestEdge {
  relationshipType: string;
  [key: string]: any;
}

describe('EntityGraphBuilder', () => {
  let graphService: GraphService;
  let graphBuilder: GraphBuilder<TestNode, TestEdge>;
  let entityBuilder: EntityGraphBuilder<TestNode, TestEdge>;

  beforeEach(() => {
    graphService = new GraphService();
    graphBuilder = new GraphBuilder<TestNode, TestEdge>(graphService);
    entityBuilder = new EntityGraphBuilder<TestNode, TestEdge>(graphBuilder);
  });

  describe('addEntity', () => {
    it('should add entity with all provided attributes including label', () => {
      // Arrange
      const attributes = {
        label: '王安石',
        name: 'Wang Anshi',
        nameChn: '王安石',
        dynasty: 15,
        indexYear: 1021,
        birthYear: null,
        deathYear: null,
        isCentral: true,
        depth: 0
      };

      // Act
      entityBuilder.directed().addEntity('person', 1762, attributes);
      const graph = entityBuilder.build();

      // Assert
      expect(graph.hasNode('person:1762')).toBe(true);

      const nodeAttributes = graph.getNodeAttributes('person:1762');
      expect(nodeAttributes).toBeDefined();
      expect(nodeAttributes.entityType).toBe('person');
      expect(nodeAttributes.entityId).toBe(1762);
      expect(nodeAttributes.label).toBe('王安石');
      expect(nodeAttributes.name).toBe('Wang Anshi');
      expect(nodeAttributes.nameChn).toBe('王安石');
      expect(nodeAttributes.dynasty).toBe(15);
      expect(nodeAttributes.isCentral).toBe(true);
      expect(nodeAttributes.depth).toBe(0);
    });

    it('should preserve null values in attributes', () => {
      // Arrange
      const attributes = {
        label: null,
        name: null,
        nameChn: null,
        birthYear: null,
        deathYear: null
      };

      // Act
      entityBuilder.directed().addEntity('person', 1762, attributes);
      const graph = entityBuilder.build();

      // Assert
      const nodeAttributes = graph.getNodeAttributes('person:1762');
      expect(nodeAttributes).toBeDefined();
      expect(nodeAttributes.label).toBeNull();
      expect(nodeAttributes.name).toBeNull();
      expect(nodeAttributes.nameChn).toBeNull();
      expect(nodeAttributes.birthYear).toBeNull();
      expect(nodeAttributes.deathYear).toBeNull();
    });

    it('should handle label attribute separately from nodeId', () => {
      // This test verifies that the label attribute is not being overwritten
      // by the nodeId or any other automatic value

      // Test case 1: With a proper label
      entityBuilder.directed().addEntity('person', 1762, {
        label: '王安石',
        name: 'Wang Anshi'
      });

      // Test case 2: With a different label
      entityBuilder.addEntity('person', 1760, {
        label: '王安禮',
        name: 'Wang Anli'
      });

      const graph = entityBuilder.build();

      // Verify first node
      const node1Attrs = graph.getNodeAttributes('person:1762');
      expect(node1Attrs.label).toBe('王安石');
      expect(node1Attrs.label).not.toBe('person:1762'); // Should NOT default to nodeId

      // Verify second node
      const node2Attrs = graph.getNodeAttributes('person:1760');
      expect(node2Attrs.label).toBe('王安禮');
      expect(node2Attrs.label).not.toBe('person:1760'); // Should NOT default to nodeId
    });

    it('should not auto-generate label if not provided', () => {
      // When no label is provided, it should remain undefined, not default to nodeId
      entityBuilder.directed().addEntity('person', 1762, {
        name: 'Wang Anshi',
        nameChn: '王安石'
      });

      const graph = entityBuilder.build();
      const nodeAttributes = graph.getNodeAttributes('person:1762');

      // Label should be undefined if not provided
      expect(nodeAttributes.label).toBeUndefined();
      // But name fields should still be present
      expect(nodeAttributes.name).toBe('Wang Anshi');
      expect(nodeAttributes.nameChn).toBe('王安石');
    });

    it('should correctly spread attributes without mutation', () => {
      // This tests that the spread operator is working correctly
      const originalAttributes = {
        label: '王安石',
        name: 'Wang Anshi',
        nameChn: '王安石',
        isCentral: true
      };

      entityBuilder.directed().addEntity('person', 1762, originalAttributes);
      const graph = entityBuilder.build();

      const nodeAttributes = graph.getNodeAttributes('person:1762');

      // All original attributes should be preserved
      expect(nodeAttributes.label).toBe('王安石');
      expect(nodeAttributes.name).toBe('Wang Anshi');
      expect(nodeAttributes.nameChn).toBe('王安石');
      expect(nodeAttributes.isCentral).toBe(true);

      // Entity metadata should be added
      expect(nodeAttributes.entityType).toBe('person');
      expect(nodeAttributes.entityId).toBe(1762);
    });
  });

  describe('Wang Anshi specific case', () => {
    it('should correctly handle Wang Anshi node with all attributes', () => {
      // This replicates the exact scenario from the kinship service
      const personId = 1762;
      const person = {
        id: 1762,
        name: 'Wang Anshi',
        nameChn: '王安石',
        dynastyCode: 15,
        indexYear: 1021,
        birthYear: null,
        deathYear: null
      };

      const label = person.nameChn || person.name || `person:${person.id}`;

      entityBuilder.directed().addEntity('person', person.id, {
        label,
        name: person.name,
        nameChn: person.nameChn,
        dynasty: person.dynastyCode,
        indexYear: person.indexYear,
        birthYear: person.birthYear,
        deathYear: person.deathYear,
        isCentral: true,
        depth: 0
      });

      const graph = entityBuilder.build();
      const nodeAttrs = graph.getNodeAttributes('person:1762');

      // The label should be '王安石', not null or 'person:1762'
      expect(nodeAttrs.label).toBe('王安石');
      expect(nodeAttrs.name).toBe('Wang Anshi');
      expect(nodeAttrs.nameChn).toBe('王安石');
      expect(nodeAttrs.dynasty).toBe(15);
      expect(nodeAttrs.isCentral).toBe(true);
      expect(nodeAttrs.depth).toBe(0);
    });
  });
});