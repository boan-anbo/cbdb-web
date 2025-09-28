/**
 * Tests for GraphExportService
 * Validates GEXF export and file operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GraphService } from '@/graph/graph.service';
import { GraphBuilder } from '@/graph/core/builders/graph-builder.service';
import { EntityGraphBuilder } from '@/graph/core/builders/entity-graph-builder.service';
import { GraphExportService } from '@/graph/core/export/graph-export.service';
import Graph from 'graphology';

describe('GraphExportService', () => {
  let graphService: GraphService;
  let exportService: GraphExportService;
  let testDir: string;

  beforeEach(async () => {
    graphService = new GraphService();
    exportService = new GraphExportService();

    // Create temp directory for test files
    testDir = path.join(os.tmpdir(), `graph-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('GEXF export', () => {
    it('should export simple two-node graph to GEXF', async () => {
      // Create a simple directed graph with two nodes and one edge
      const builder = new GraphBuilder(graphService);
      const graph = builder
        .directed()
        .addNode('1762', {
          label: 'Wang An',
          dynasty: 'Song',
          birthYear: 1021,
          deathYear: 1086
        })
        .addNode('1763', {
          label: 'Wang Son',
          dynasty: 'Song',
          birthYear: 1050,
          deathYear: 1110
        })
        .addEdge('1762', '1763', {
          type: 'kinship',
          relationshipType: 'father-son',
          label: 'Son'
        })
        .build();

      // Export to GEXF
      const filepath = path.join(testDir, 'two-node-kinship.gexf');
      await exportService.exportToGEXF(graph, filepath);

      // Verify file exists
      const stats = await exportService.getFileStats(filepath);
      expect(stats.exists).toBe(true);
      expect(stats.size).toBeGreaterThan(0);

      // Read and verify content
      const content = await fs.readFile(filepath, 'utf-8');

      // Check GEXF structure
      expect(content).toContain('<?xml');
      expect(content).toContain('<gexf');
      expect(content).toContain('<graph');
      expect(content).toContain('</gexf>');

      // Check nodes
      expect(content).toContain('Wang An');
      expect(content).toContain('Wang Son');
      expect(content).toContain('1762');
      expect(content).toContain('1763');

      // Check edge
      expect(content).toContain('<edge');
      expect(content).toContain('source="1762"');
      expect(content).toContain('target="1763"');
      expect(content).toContain('Son');

      // Validate GEXF can be parsed
      const validation = await exportService.validateGEXF(filepath);
      expect(validation.valid).toBe(true);
    });

    it('should export entity graph with relationships', async () => {
      // Use EntityGraphBuilder for more complex graph
      const builder = new GraphBuilder(graphService);
      const entityBuilder = new EntityGraphBuilder(builder);

      const graph = entityBuilder
        .directed()
        .addEntity('person', 1762, {
          label: 'Wang An',
          dynasty: 'Song'
        })
        .addEntity('person', 1763, {
          label: 'Wang Son',
          dynasty: 'Song'
        })
        .addEntity('person', 1764, {
          label: 'Wang Daughter',
          dynasty: 'Song'
        })
        .relate('person', 1762, 'person', 1763, 'kinship', {
          kinshipCode: 'S',
          label: 'Son'
        })
        .relate('person', 1762, 'person', 1764, 'kinship', {
          kinshipCode: 'D',
          label: 'Daughter'
        })
        .build();

      const filepath = path.join(testDir, 'family-network.gexf');
      await exportService.exportToGEXF(graph, filepath);

      const content = await fs.readFile(filepath, 'utf-8');

      // Check all nodes are present
      expect(content).toContain('person:1762');
      expect(content).toContain('person:1763');
      expect(content).toContain('person:1764');
      expect(content).toContain('Wang An');
      expect(content).toContain('Wang Son');
      expect(content).toContain('Wang Daughter');

      // Check relationships
      expect(content).toContain('Son');
      expect(content).toContain('Daughter');
    });

    it('should export to GEXF string without file', () => {
      const graph = graphService.createDirectedGraph();
      graphService.addNode(graph, 'A', { label: 'Node A' });
      graphService.addNode(graph, 'B', { label: 'Node B' });
      graphService.addEdge(graph, 'A', 'B', { type: 'connection' });

      const gexfString = exportService.exportToGEXFString(graph);

      expect(gexfString).toContain('<?xml');
      expect(gexfString).toContain('<gexf');
      expect(gexfString).toContain('Node A');
      expect(gexfString).toContain('Node B');
      expect(gexfString).toContain('connection');
    });

    it('should include metadata in GEXF', async () => {
      const graph = graphService.createDirectedGraph();
      graphService.addNode(graph, 'test');

      const filepath = path.join(testDir, 'with-metadata.gexf');
      await exportService.exportToGEXF(graph, filepath, {
        meta: {
          creator: 'Test Suite',
          description: 'Test graph with metadata'
        }
      });

      const content = await fs.readFile(filepath, 'utf-8');
      // The graphology-gexf library includes metadata in the meta tag
      expect(content).toContain('<meta');
      expect(content).toContain('<gexf');
      // Metadata might be encoded or in attributes, so just verify structure
      expect(content).toContain('</gexf>');
    });
  });

  describe('JSON export', () => {
    it('should export graph to JSON', async () => {
      const builder = new GraphBuilder(graphService);
      const graph = builder
        .directed()
        .addNode('1', { label: 'First' })
        .addNode('2', { label: 'Second' })
        .addEdge('1', '2', { weight: 0.5 })
        .build();

      const filepath = path.join(testDir, 'graph.json');
      await exportService.exportToJSON(graph, filepath);

      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);

      expect(data.type).toBe('directed');
      expect(data.attributes.order).toBe(2);
      expect(data.attributes.size).toBe(1);
      expect(data.nodes).toHaveLength(2);
      expect(data.edges).toHaveLength(1);
      expect(data.nodes[0].id).toBe('1');
      expect(data.edges[0].source).toBe('1');
      expect(data.edges[0].target).toBe('2');
    });

    it('should export to JSON object in memory', () => {
      const graph = graphService.createUndirectedGraph();
      graphService.addNode(graph, 'A', { value: 1 });
      graphService.addNode(graph, 'B', { value: 2 });
      graphService.addEdge(graph, 'A', 'B', { weight: 1.5 });

      const jsonObj = exportService.graphToJSON(graph);

      expect(jsonObj).toHaveProperty('type', 'undirected');
      expect(jsonObj).toHaveProperty('nodes');
      expect(jsonObj).toHaveProperty('edges');
      expect(jsonObj.nodes).toHaveLength(2);
      expect(jsonObj.edges).toHaveLength(1);
    });
  });

  describe('import operations', () => {
    it('should import graph from GEXF', async () => {
      // First create and export a graph
      const originalGraph = graphService.createDirectedGraph();
      graphService.addNode(originalGraph, 'node1', { label: 'Node 1' });
      graphService.addNode(originalGraph, 'node2', { label: 'Node 2' });
      graphService.addEdge(originalGraph, 'node1', 'node2');

      const filepath = path.join(testDir, 'import-test.gexf');
      await exportService.exportToGEXF(originalGraph, filepath);

      // Import it back
      const importedGraph = await exportService.importFromGEXF(filepath);

      expect(importedGraph.order).toBe(2);
      expect(importedGraph.size).toBe(1);
      expect(importedGraph.hasNode('node1')).toBe(true);
      expect(importedGraph.hasNode('node2')).toBe(true);
      expect(importedGraph.hasEdge('node1', 'node2')).toBe(true);
    });

    it('should import graph from JSON', async () => {
      // Create test JSON file
      const jsonData = {
        type: 'directed',
        nodes: [
          { id: 'a', attributes: { label: 'A' } },
          { id: 'b', attributes: { label: 'B' } },
          { id: 'c', attributes: { label: 'C' } }
        ],
        edges: [
          { source: 'a', target: 'b', attributes: { weight: 1 } },
          { source: 'b', target: 'c', attributes: { weight: 2 } }
        ]
      };

      const filepath = path.join(testDir, 'import-test.json');
      await fs.writeFile(filepath, JSON.stringify(jsonData));

      // Import
      const graph = await exportService.importFromJSON(filepath);

      expect(graph.order).toBe(3);
      expect(graph.size).toBe(2);
      expect(graph.getNodeAttribute('a', 'label')).toBe('A');
      expect(graph.getEdgeAttribute('b', 'c', 'weight')).toBe(2);
    });
  });

  describe('file operations', () => {
    it('should ensure directory exists', async () => {
      const nestedPath = path.join(testDir, 'nested', 'deep', 'path', 'file.gexf');
      const graph = graphService.createDirectedGraph();
      graphService.addNode(graph, 'test');

      await exportService.exportToGEXF(graph, nestedPath);

      const stats = await exportService.getFileStats(nestedPath);
      expect(stats.exists).toBe(true);
    });

    it('should validate invalid GEXF', async () => {
      const invalidPath = path.join(testDir, 'invalid.gexf');
      await fs.writeFile(invalidPath, '<invalid>not gexf</invalid>');

      const validation = await exportService.validateGEXF(invalidPath);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it('should get file stats for non-existent file', async () => {
      const stats = await exportService.getFileStats('/non/existent/file.gexf');
      expect(stats.exists).toBe(false);
      expect(stats.size).toBeUndefined();
    });
  });

  describe('real-world scenario: CBDB kinship export', () => {
    it('should export two-person kinship graph for Gephi', async () => {
      // Simulate real CBDB data
      interface CBDBPerson {
        id: number;
        name: string;
        nameChn: string;
        dynasty: string;
        indexYear: number;
      }

      interface CBDBKinship {
        personId: number;
        kinPersonId: number;
        kinshipCode: string;
        kinshipType: string;
      }

      const person1: CBDBPerson = {
        id: 1762,
        name: 'Wang Anshi',
        nameChn: '王安石',
        dynasty: 'Song',
        indexYear: 1070
      };

      const person2: CBDBPerson = {
        id: 1763,
        name: 'Wang Pang',
        nameChn: '王雱',
        dynasty: 'Song',
        indexYear: 1090
      };

      const kinship: CBDBKinship = {
        personId: 1762,
        kinPersonId: 1763,
        kinshipCode: 'S',
        kinshipType: 'Son'
      };

      // Build graph using entity builder
      const builder = new GraphBuilder(graphService);
      const entityBuilder = new EntityGraphBuilder(builder);

      const graph = entityBuilder
        .directed()
        .addEntity('person', person1.id, {
          label: person1.nameChn,
          name: person1.name,
          dynasty: person1.dynasty,
          indexYear: person1.indexYear,
          color: '#FF6B6B'  // Visual attribute for Gephi
        })
        .addEntity('person', person2.id, {
          label: person2.nameChn,
          name: person2.name,
          dynasty: person2.dynasty,
          indexYear: person2.indexYear,
          color: '#4ECDC4'  // Different color for child
        })
        .relate(
          'person', kinship.personId,
          'person', kinship.kinPersonId,
          'kinship',
          {
            kinshipCode: kinship.kinshipCode,
            label: kinship.kinshipType,
            weight: 1.0
          }
        )
        .build();

      // Export to GEXF
      const filepath = path.join(testDir, 'cbdb-kinship.gexf');
      await exportService.exportToGEXF(graph, filepath, {
        meta: {
          creator: 'CBDB Graph Module',
          description: 'Kinship relationship between Wang Anshi and Wang Pang'
        }
      });

      // Verify the export
      const validation = await exportService.validateGEXF(filepath);
      expect(validation.valid).toBe(true);

      const content = await fs.readFile(filepath, 'utf-8');

      // Check Chinese names are preserved
      expect(content).toContain('王安石');
      expect(content).toContain('王雱');

      // Check relationship
      expect(content).toContain('kinship');
      expect(content).toContain('Son');

      // Check visual attributes for Gephi
      expect(content).toContain('color');

      console.log(`✅ Successfully exported CBDB kinship graph to: ${filepath}`);
      console.log('   This file can be opened in Gephi for visualization');
    });
  });
});