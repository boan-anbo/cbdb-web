/**
 * Graph Export Service
 * Handles exporting graphs to various formats (GEXF, JSON, GraphML)
 * Pure utility service for format conversion
 */

import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import Graph from 'graphology';
import gexf from 'graphology-gexf';
import type { Attributes } from 'graphology-types';

export interface ExportOptions {
  prettyPrint?: boolean;
  encoding?: BufferEncoding;
  ensureDirectory?: boolean;
}

export interface GEXFExportOptions extends ExportOptions {
  version?: '1.2' | '1.3';
  meta?: {
    creator?: string;
    description?: string;
    lastModified?: Date;
  };
}

@Injectable()
export class GraphExportService {
  /**
   * Export graph to GEXF format
   */
  async exportToGEXF<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    filepath: string,
    options: GEXFExportOptions = {}
  ): Promise<void> {
    const {
      version = '1.3',
      meta,
      prettyPrint = true,
      encoding = 'utf-8',
      ensureDirectory = true
    } = options;

    // Ensure directory exists if requested
    if (ensureDirectory) {
      await this.ensureDirectoryExists(filepath);
    }

    // Generate GEXF string
    const gexfString = gexf.write(graph, {
      version,
      formatNode: (key, attributes) => {
        return {
          label: attributes?.label || key,
          attributes: this.filterAttributes(attributes),
          viz: this.extractVizAttributes(attributes)
        };
      },
      formatEdge: (_key, attributes) => {
        return {
          label: attributes?.label || attributes?.relationshipType || attributes?.type || '',
          weight: attributes?.weight,
          attributes: this.filterAttributes(attributes)
        };
      },
      pedantic: false
    });

    // Write to file
    await fs.writeFile(filepath, gexfString, encoding);
  }

  /**
   * Export graph to JSON format
   */
  async exportToJSON<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    filepath: string,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      prettyPrint = true,
      encoding = 'utf-8',
      ensureDirectory = true
    } = options;

    if (ensureDirectory) {
      await this.ensureDirectoryExists(filepath);
    }

    // Export graph to JSON object
    const jsonData = this.graphToJSON(graph);

    // Convert to string with optional pretty printing
    const jsonString = prettyPrint
      ? JSON.stringify(jsonData, null, 2)
      : JSON.stringify(jsonData);

    // Write to file
    await fs.writeFile(filepath, jsonString, encoding);
  }

  /**
   * Export graph to GraphML format (future implementation)
   */
  async exportToGraphML<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    filepath: string,
    options: ExportOptions = {}
  ): Promise<void> {
    // TODO: Implement GraphML export
    throw new Error('GraphML export not yet implemented');
  }

  /**
   * Export graph to memory (returns string instead of writing to file)
   */
  exportToGEXFString<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    options: Omit<GEXFExportOptions, 'ensureDirectory'> = {}
  ): string {
    const {
      version = '1.3',
      meta
    } = options;

    return gexf.write(graph, {
      version,
      formatNode: (key, attributes) => {
        return {
          label: attributes?.label || key,
          attributes: this.filterAttributes(attributes),
          viz: this.extractVizAttributes(attributes)
        };
      },
      formatEdge: (_key, attributes) => {
        return {
          label: attributes?.label || attributes?.relationshipType || attributes?.type || '',
          weight: attributes?.weight,
          attributes: this.filterAttributes(attributes)
        };
      }
    });
  }

  /**
   * Export graph to JSON object (in memory)
   */
  graphToJSON<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>
  ): object {
    const nodes: Array<{
      id: string;
      attributes: NodeAttributes;
    }> = [];

    const edges: Array<{
      source: string;
      target: string;
      attributes: EdgeAttributes;
    }> = [];

    // Collect nodes
    graph.forEachNode((node, attributes) => {
      nodes.push({
        id: node,
        attributes
      });
    });

    // Collect edges
    graph.forEachEdge((edge, attributes, source, target) => {
      edges.push({
        source,
        target,
        attributes
      });
    });

    return {
      type: graph.type,
      attributes: {
        order: graph.order,
        size: graph.size
      },
      nodes,
      edges
    };
  }

  /**
   * Import graph from GEXF file
   */
  async importFromGEXF(
    filepath: string,
    GraphClass: typeof Graph = Graph
  ): Promise<Graph> {
    const gexfContent = await fs.readFile(filepath, 'utf-8');
    return gexf.parse(GraphClass, gexfContent);
  }

  /**
   * Import graph from JSON file
   */
  async importFromJSON<NodeAttributes extends Attributes = Attributes, EdgeAttributes extends Attributes = Attributes>(
    filepath: string
  ): Promise<Graph<NodeAttributes, EdgeAttributes>> {
    const jsonContent = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(jsonContent);

    const graph = new Graph<NodeAttributes, EdgeAttributes>({
      type: data.type || 'mixed'
    });

    // Add nodes
    if (data.nodes) {
      data.nodes.forEach((node: any) => {
        graph.addNode(node.id, node.attributes);
      });
    }

    // Add edges
    if (data.edges) {
      data.edges.forEach((edge: any) => {
        graph.addEdge(edge.source, edge.target, edge.attributes);
      });
    }

    return graph;
  }

  /**
   * Validate GEXF file
   */
  async validateGEXF(filepath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const gexfContent = await fs.readFile(filepath, 'utf-8');
      gexf.parse(Graph, gexfContent);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filepath: string): Promise<{
    exists: boolean;
    size?: number;
    created?: Date;
    modified?: Date;
  }> {
    try {
      const stats = await fs.stat(filepath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch {
      return { exists: false };
    }
  }

  private async ensureDirectoryExists(filepath: string): Promise<void> {
    const dir = path.dirname(filepath);
    await fs.mkdir(dir, { recursive: true });
  }

  private filterAttributes(attributes: any): Record<string, any> {
    if (!attributes) return {};

    // Filter out visualization-specific attributes and internal properties
    const filtered: Record<string, any> = {};
    const vizKeys = ['color', 'size', 'position', 'shape', 'x', 'y', 'z'];

    for (const [key, value] of Object.entries(attributes)) {
      if (!vizKeys.includes(key) && value !== undefined && value !== null) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  private extractVizAttributes(attributes: any): any {
    if (!attributes) return undefined;

    const viz: any = {};
    let hasViz = false;

    // Extract color
    if (attributes.color) {
      viz.color = attributes.color;
      hasViz = true;
    }

    // Extract size
    if (attributes.size !== undefined) {
      viz.size = attributes.size;
      hasViz = true;
    }

    // Extract position
    if (attributes.x !== undefined || attributes.y !== undefined) {
      viz.position = {
        x: attributes.x || 0,
        y: attributes.y || 0,
        z: attributes.z || 0
      };
      hasViz = true;
    } else if (attributes.position) {
      viz.position = attributes.position;
      hasViz = true;
    }

    // Extract shape
    if (attributes.shape) {
      viz.shape = attributes.shape;
      hasViz = true;
    }

    return hasViz ? viz : undefined;
  }
}