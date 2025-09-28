/**
 * Optimized Person Graph Service
 *
 * Performance improvements:
 * 1. Batch fetching for reciprocal relationships
 * 2. Parallel processing with Worker Pool
 * 3. Optimized data structures
 */

import { Injectable } from '@nestjs/common';
import {
  ExplorePersonNetworkQuery,
  ExploreDirectNetworkQuery,
  ExploreAssociationNetworkQuery,
  ExploreNetworkResult,
  cbdbMapper
} from '@cbdb/core';
import Graph from 'graphology';
import { write as writeGEXF } from 'graphology-gexf';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PersonRepository } from './person.repository';
import { PersonGraphRepository } from './person-graph.repository';
import { PersonBatchFetcherService } from './person-batch-fetcher.service';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import {
  KIN_DATA,
  ASSOC_DATA,
  KINSHIP_CODES,
  ASSOC_CODES
} from '../db/cbdb-schema/schema';
import { inArray, and, or, eq, sql } from 'drizzle-orm';
import { getNodeImportance, getNodeSize, calculateNodeSize } from '../graph/utils/node-sizing.utils';

interface ReciprocalRelationship {
  person1Id: number;
  person2Id: number;
  type: 'kinship' | 'association';
  code: number;
  label: string;
}

@Injectable()
export class PersonGraphOptimizedService {
  private batchFetcher: PersonBatchFetcherService;

  constructor(
    private readonly personRepository: PersonRepository,
    private readonly personGraphRepository: PersonGraphRepository,
    private readonly cbdbConnection: CbdbConnectionService
  ) {
    this.batchFetcher = new PersonBatchFetcherService(cbdbConnection);
  }

  /**
   * OPTIMIZED: Batch fetch all reciprocal relationships in 2 queries
   * instead of N*(N-1) queries
   */
  async findReciprocalRelationshipsBatch(
    personIds: number[],
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<ReciprocalRelationship[]> {
    if (personIds.length < 2) return [];

    const db = this.cbdbConnection.getDb();
    const relationships: ReciprocalRelationship[] = [];

    // Create a set for O(1) lookups
    const personIdSet = new Set(personIds);

    // Batch fetch ALL kinship relationships between these persons (1 query)
    if (includeKinship) {
      const kinships = await db
        .select({
          person1: KIN_DATA.c_personid,
          person2: KIN_DATA.c_kin_id,
          code: KIN_DATA.c_kin_code,
          label: KINSHIP_CODES.c_kinrel_chn
        })
        .from(KIN_DATA)
        .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
        .where(
          and(
            inArray(KIN_DATA.c_personid, personIds),
            inArray(KIN_DATA.c_kin_id, personIds)
          )
        );

      // Process kinship relationships
      for (const k of kinships) {
        if (k.person2 && personIdSet.has(k.person2)) {
          relationships.push({
            person1Id: k.person1,
            person2Id: k.person2,
            type: 'kinship',
            code: k.code || 0,
            label: k.label || 'Kinship'
          });
        }
      }
    }

    // Batch fetch ALL association relationships between these persons (1 query)
    if (includeAssociation) {
      const associations = await db
        .select({
          person1: ASSOC_DATA.c_personid,
          person2: ASSOC_DATA.c_assoc_id,
          code: ASSOC_DATA.c_assoc_code,
          label: ASSOC_CODES.c_assoc_desc_chn
        })
        .from(ASSOC_DATA)
        .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
        .where(
          and(
            inArray(ASSOC_DATA.c_personid, personIds),
            inArray(ASSOC_DATA.c_assoc_id, personIds)
          )
        );

      // Process association relationships
      for (const a of associations) {
        if (a.person2 && personIdSet.has(a.person2)) {
          relationships.push({
            person1Id: a.person1,
            person2Id: a.person2,
            type: 'association',
            code: a.code || 0,
            label: a.label || 'Association'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * OPTIMIZED: Build graph with batch-fetched reciprocal relationships
   */
  async addReciprocalRelationshipsOptimized(
    graph: Graph,
    addedPersons: Set<number>,
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<void> {
    const personIds = Array.from(addedPersons);

    // Batch fetch ALL relationships in 2 queries max
    const relationships = await this.findReciprocalRelationshipsBatch(
      personIds,
      includeKinship,
      includeAssociation
    );

    // Add edges to graph (no DB queries in loop!)
    for (const rel of relationships) {
      const node1 = `person:${rel.person1Id}`;
      const node2 = `person:${rel.person2Id}`;

      // Skip if edge already exists
      if (graph.hasEdge(node1, node2) || graph.hasEdge(node2, node1)) {
        continue;
      }

      // Add edge with proper attributes
      graph.addEdge(node1, node2, {
        type: rel.type,
        [rel.type === 'kinship' ? 'kinCode' : 'assocCode']: rel.code,
        label: rel.label,
        reciprocal: true,
        weight: rel.type === 'kinship' ? 1.5 : 1.0
      });
    }

    console.log(`Added ${relationships.length} reciprocal relationships from ${personIds.length} persons`);
  }

  /**
   * OPTIMIZED: Main network exploration with batch optimizations
   */
  async explorePersonNetworkOptimized(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult> {
    const { personId, depth = 1, relationTypes, includeReciprocal = false } = query;

    // Get the central person using optimized batch fetcher for consistency
    const persons = await this.batchFetcher.findModelsByIdsOptimized([personId]);
    const person = persons[0];
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    // Create graph
    const graph = new Graph();

    // Add central person
    const centralNodeId = `person:${personId}`;
    graph.addNode(centralNodeId, {
      id: personId,
      label: person.nameChn || person.name || `Person ${personId}`,
      name: person.name,
      nameChn: person.nameChn,
      dynasty: person.dynastyCode,
      indexYear: person.indexYear,
      nodeType: 'central',
      isCentral: true,
      color: '#ff6b6b',
      size: getNodeSize(getNodeImportance(0)), // Central node (depth 0)
      zIndex: 5
    });

    const relationTypesToFetch = relationTypes || ['kinship', 'association', 'office'];
    const addedPersons = new Set<number>([personId]);
    const nodesByLevel = new Map<number, Set<number>>();
    nodesByLevel.set(0, new Set([personId]));

    // Build graph iteratively with batch fetching
    for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
      const nodesAtPrevLevel = nodesByLevel.get(currentDepth - 1)!;
      const prevLevelIds = Array.from(nodesAtPrevLevel);

      // Batch fetch edges (already optimized in PersonGraphRepository)
      const edges = await this.personGraphRepository.getEdgesBatch(
        prevLevelIds,
        relationTypesToFetch
      );

      // Process edges and collect person IDs
      const newPersonIds = new Set<number>();
      for (const edge of edges) {
        const sourceNodeId = `person:${edge.sourceId}`;
        const targetNodeId = `person:${edge.targetId}`;

        // Add temporary nodes if needed
        if (!graph.hasNode(sourceNodeId)) {
          graph.addNode(sourceNodeId, { id: edge.sourceId, zIndex: 3 });
        }
        if (!graph.hasNode(targetNodeId)) {
          graph.addNode(targetNodeId, { id: edge.targetId, zIndex: 3 });
        }

        // Add edge if not exists
        if (!graph.hasEdge(sourceNodeId, targetNodeId)) {
          const edgeData: any = {
            type: edge.edgeType,
            label: edge.edgeLabel || edge.edgeType,
            weight: edge.edgeWeight || (edge.edgeType === 'kinship' ? 1.5 : 1.0),
            zIndex: 10
          };

          if (edge.edgeType === 'kinship') {
            edgeData.kinCode = edge.edgeCode;
          } else if (edge.edgeType === 'association') {
            edgeData.assocCode = edge.edgeCode;
          } else if (edge.edgeType === 'office') {
            edgeData.officeCode = edge.edgeCode;
          }

          graph.addEdge(sourceNodeId, targetNodeId, edgeData);
        }

        // Track new persons
        if (!addedPersons.has(edge.sourceId)) {
          newPersonIds.add(edge.sourceId);
        }
        if (!addedPersons.has(edge.targetId)) {
          newPersonIds.add(edge.targetId);
        }
      }

      nodesByLevel.set(currentDepth, newPersonIds);
      newPersonIds.forEach(id => addedPersons.add(id));
    }

    // OPTIMIZED: Use batch fetching for node data
    const personIdsToLoad = Array.from(addedPersons).filter(id => id !== personId);
    if (personIdsToLoad.length > 0) {
      // Use optimized batch fetcher instead of individual queries
      const personModels = await this.batchFetcher.findModelsByIdsOptimized(personIdsToLoad);
      const personMap = new Map(personModels.map(p => [p.id, p]));

      // Update node attributes
      for (const id of personIdsToLoad) {
        const nodeId = `person:${id}`;
        if (!graph.hasNode(nodeId)) continue;

        const personModel = personMap.get(id);
        if (personModel) {
          // Determine node type based on edges
          let primaryType = 'association';
          graph.forEachEdge(nodeId, (edge, attrs) => {
            if (attrs.type === 'kinship') {
              primaryType = 'kinship';
              return;
            }
          });

          const colors = {
            kinship: '#95e77e',
            association: '#4ecdc4',
            office: '#f7b731'
          };

          // Determine depth for this node
          let nodeDepth = depth; // Default to max depth
          for (let d = 0; d <= depth; d++) {
            if (nodesByLevel.get(d)?.has(id)) {
              nodeDepth = d;
              break;
            }
          }

          graph.mergeNodeAttributes(nodeId, {
            id: id,
            label: personModel.nameChn || personModel.name || `Person ${id}`,
            name: personModel.name,
            nameChn: personModel.nameChn,
            nodeType: primaryType,
            color: colors[primaryType] || '#666',
            size: getNodeSize(getNodeImportance(nodeDepth, primaryType)),
            depth: nodeDepth,
            dynastyCode: personModel.dynastyCode,
            birthYear: personModel.birthYear,
            deathYear: personModel.deathYear,
            zIndex: 3
          });
        }
      }
    }

    // OPTIMIZED: Use batch method for reciprocal relationships
    if (includeReciprocal && addedPersons.size < 500) {
      await this.addReciprocalRelationshipsOptimized(
        graph,
        addedPersons,
        relationTypesToFetch.includes('kinship'),
        relationTypesToFetch.includes('association')
      );
    }

    // Build result
    const result = new ExploreNetworkResult();
    result.centralPersonId = personId;

    // Export nodes
    result.graphData.nodes = Array.from(graph.nodes()).map(nodeId => {
      const attrs = graph.getNodeAttributes(nodeId);
      return {
        key: nodeId,
        attributes: {
          label: attrs.label,
          color: attrs.color,
          size: attrs.size,
          nodeDistance: attrs.depth || 0,
          personId: attrs.id,
          nameChn: attrs.nameChn,
          nameEng: attrs.name,
          dynastyCode: attrs.dynasty,
          birthYear: attrs.indexYear,
          x: Math.random() * 1000 - 500,
          y: Math.random() * 1000 - 500
        }
      };
    });

    // Export edges
    result.graphData.edges = Array.from(graph.edges()).map(edgeId => {
      const [source, target] = graph.extremities(edgeId);
      const attrs = graph.getEdgeAttributes(edgeId);
      return {
        key: edgeId,
        source,
        target,
        attributes: {
          label: attrs.label,
          color: attrs.color || '#6d727e99',
          size: attrs.size || attrs.weight || 1,
          relationshipType: attrs.type as any,
          kinshipCode: attrs.kinCode,
          assocCode: attrs.assocCode,
          strength: attrs.weight
        }
      };
    });

    // Add metrics
    result.metrics = {
      nodeCount: graph.order,
      edgeCount: graph.size,
      density: graph.size / (graph.order * (graph.order - 1) / 2),
      avgDegree: (2 * graph.size) / graph.order
    };

    return result;
  }

  // Interface implementations for IPersonGraphService compatibility
  async explorePersonNetwork(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult> {
    return this.explorePersonNetworkOptimized(query);
  }

  async exploreDirectNetwork(query: ExploreDirectNetworkQuery): Promise<ExploreNetworkResult> {
    // Direct network is depth 1 with specified relation types
    const relationTypes: string[] = [];
    if (query.includeKinship !== false) relationTypes.push('kinship');
    if (query.includeAssociations !== false) relationTypes.push('association');
    if (query.includeOffices) relationTypes.push('office');

    const personQuery: ExplorePersonNetworkQuery = {
      personId: query.personId,
      depth: 1,
      relationTypes: relationTypes.length > 0 ? relationTypes : undefined
    };
    return this.explorePersonNetworkOptimized(personQuery);
  }

  async exploreAssociationNetwork(query: ExploreAssociationNetworkQuery): Promise<ExploreNetworkResult> {
    // Focus on associations with optional kinship
    const relationTypes: string[] = ['association'];
    if (query.includeKinship) relationTypes.push('kinship');

    const personQuery: ExplorePersonNetworkQuery = {
      personId: query.personId,
      depth: query.maxDepth || 2,
      relationTypes
    };
    return this.explorePersonNetworkOptimized(personQuery);
  }

  async exploreKinshipNetwork(personId: number, depth: number = 2): Promise<ExploreNetworkResult> {
    // Focus on kinship only
    const query: ExplorePersonNetworkQuery = {
      personId,
      depth,
      relationTypes: ['kinship']
    };
    return this.explorePersonNetworkOptimized(query);
  }

  async exportNetworkToGEXF(
    personId: number,
    outputPath: string,
    options?: {
      includeKinship?: boolean;
      includeAssociations?: boolean;
      includeOffices?: boolean;
    }
  ): Promise<{ success: boolean; filepath: string; metrics: any }> {
    try {
      // Build relation types array
      const relationTypes: string[] = [];
      if (options?.includeKinship !== false) relationTypes.push('kinship');
      if (options?.includeAssociations !== false) relationTypes.push('association');
      if (options?.includeOffices) relationTypes.push('office');

      const query: ExplorePersonNetworkQuery = {
        personId,
        depth: 2,
        relationTypes: relationTypes.length > 0 ? relationTypes : undefined
      };

      // Build the graph
      const result = await this.explorePersonNetworkOptimized(query);

      // Create a new graph for GEXF export
      const exportGraph = new Graph();

      // Add nodes from result
      result.graphData.nodes.forEach(node => {
        const attrs = node.attributes || {};
        exportGraph.addNode(node.key, {
          label: attrs.label,
          personId: attrs.personId,
          nameChn: attrs.nameChn,
          nameEng: attrs.nameEng,
          dynastyCode: attrs.dynastyCode,
          birthYear: attrs.birthYear,
          x: attrs.x,
          y: attrs.y,
          size: attrs.size,
          color: attrs.color
        });
      });

      // Add edges from result
      result.graphData.edges.forEach(edge => {
        if (!exportGraph.hasEdge(edge.source, edge.target)) {
          const attrs = edge.attributes || {};
          exportGraph.addEdge(edge.source, edge.target, {
            label: attrs.label,
            relationshipType: attrs.relationshipType,
            kinshipCode: attrs.kinshipCode,
            assocCode: attrs.assocCode,
            strength: attrs.strength,
            color: attrs.color,
            size: attrs.size
          });
        }
      });

      // Generate GEXF string
      const gexfString = writeGEXF(exportGraph, {
        formatNode: (key, attributes) => ({
          label: attributes.label || key,
          attributes: {
            personId: attributes.personId,
            nameChn: attributes.nameChn,
            nameEng: attributes.nameEng,
            dynastyCode: attributes.dynastyCode,
            birthYear: attributes.birthYear
          },
          viz: {
            color: attributes.color,
            size: attributes.size,
            position: {
              x: attributes.x || 0,
              y: attributes.y || 0,
              z: 0
            }
          }
        }),
        formatEdge: (key, attributes) => ({
          label: attributes.label || '',
          attributes: {
            relationshipType: attributes.relationshipType,
            kinshipCode: attributes.kinshipCode,
            assocCode: attributes.assocCode,
            strength: attributes.strength
          },
          viz: {
            color: attributes.color,
            thickness: attributes.size || 1
          }
        })
      });

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Write to file
      await fs.writeFile(outputPath, gexfString, 'utf-8');

      return {
        success: true,
        filepath: outputPath,
        metrics: result.metrics
      };
    } catch (error) {
      console.error('Failed to export network to GEXF:', error);
      return {
        success: false,
        filepath: outputPath,
        metrics: null
      };
    }
  }
}