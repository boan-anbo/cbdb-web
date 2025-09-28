/**
 * Person Graph Service
 *
 * Orchestrates graph analysis for person-related network explorations.
 * Combines data fetching from repositories with graph algorithms to provide
 * domain-specific network analysis capabilities.
 *
 * This service is part of the Application Level of the Graph System,
 * residing in the person domain and orchestrating between data access
 * and pure graph algorithms.
 *
 * @module PersonModule
 */

import { Injectable } from '@nestjs/common';
import {
  ExploreAssociationNetworkQuery,
  ExploreDirectNetworkQuery,
  ExplorePersonNetworkQuery,
  ExploreNetworkResult,
  cbdbMapper
} from '@cbdb/core';
import Graph from 'graphology';
import { AlgorithmOrchestratorService } from '../graph/core/algorithms/algorithm-orchestrator.service';
import { NetworkExplorationService } from '../graph/core/algorithms/network-exploration.service';
import { GraphExportService } from '../graph/core/export/graph-export.service';
import { GraphCoordinateService } from '../graph/services/graph-coordinate.service';
import { PersonRepository } from './person.repository';
import { PersonGraphRepository } from './person-graph.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';
import { PersonKinshipRelationRepository } from '../kinship/person-kinship-relation.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { getNodeImportance, getNodeSize, calculateNodeSize } from '../graph/utils/node-sizing.utils';

@Injectable()
export class PersonGraphService {
  constructor(
    private readonly algorithmOrchestrator: AlgorithmOrchestratorService,
    private readonly networkExploration: NetworkExplorationService,
    private readonly graphExportService: GraphExportService,
    private readonly graphCoordinateService: GraphCoordinateService,
    private readonly personRepository: PersonRepository,
    private readonly personGraphRepository: PersonGraphRepository,
    private readonly personAssociationRelationRepository: PersonAssociationRelationRepository,
    private readonly personKinshipRelationRepository: PersonKinshipRelationRepository,
    private readonly personOfficeRelationRepository: PersonOfficeRelationRepository
  ) {}

  /**
   * Explore Association Network (学术圈子/社交网络)
   *
   * Returns the network of associations for a person, including:
   * - Academic relationships (师生, 同门)
   * - Social connections (朋友, 同僚)
   * - Optional kinship connections
   *
   * @param query Query parameters for association network exploration
   * @returns Network result with nodes, edges, and historical interpretation
   */
  async exploreAssociationNetwork(query: ExploreAssociationNetworkQuery): Promise<ExploreNetworkResult> {
    const { personId, maxDepth = 2, includeKinship = false } = query;

    // Get the central person
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    // Create graph using the new architecture
    const graph = new Graph();

    // Add central person as the root node
    const centralNode = String(personId);
    graph.addNode(centralNode, {
      id: personId,
      label: person.nameChn || person.name || `Person ${personId}`,
      name: person.name,
      nameChn: person.nameChn,
      dynasty: person.dynastyCode,
      indexYear: person.indexYear,
      nodeType: 'central',
      color: '#ff6b6b', // Red for central person
      size: getNodeSize(getNodeImportance(0))  // Central person (depth 0)
    });

    // Get associations
    const associations = await this.personAssociationRelationRepository.getWithFullRelations(personId);

    // Track added persons to avoid duplicates
    const addedPersons = new Set<number>([personId]);

    // Add associated persons and edges
    for (const assoc of associations) {
      const associatedPerson = assoc.assocPersonInfo || assoc.kinPersonInfo;
      if (associatedPerson && associatedPerson.personId) {
        const assocId = associatedPerson.personId;
        const assocNodeId = String(assocId);

        // Add node if not already added
        if (!addedPersons.has(assocId)) {
          graph.addNode(assocNodeId, {
            id: assocId,
            label: associatedPerson.nameChn || associatedPerson.name || `Person ${assocId}`,
            name: associatedPerson.name,
            nameChn: associatedPerson.nameChn,
            nodeType: 'associated',
            color: '#4ecdc4', // Teal for associated persons
            size: getNodeSize(3)  // Associated persons get medium importance
          });
          addedPersons.add(assocId);
        }

        // Add edge
        graph.addEdge(centralNode, assocNodeId, {
          type: 'association',
          assocCode: assoc.assocCode,
          label: assoc.associationTypeInfo?.assocTypeChn ||
                 assoc.associationTypeInfo?.assocType ||
                 'Association',
          weight: 1.0
        });
      }
    }

    // Optionally include kinship
    if (includeKinship) {
      const kinships = await this.personKinshipRelationRepository.getFullRelations(personId);

      for (const kinship of kinships) {
        const kinPersonId = kinship.kinPersonId;
        if (kinPersonId) {
          const kinNodeId = String(kinPersonId);

          // Add node if not already added
          if (!addedPersons.has(kinPersonId)) {
            const kinPerson = await this.personRepository.findModelById(kinPersonId);
            if (kinPerson) {
              graph.addNode(kinNodeId, {
                id: kinPersonId,
                label: kinPerson.nameChn || kinPerson.name || `Person ${kinPersonId}`,
                name: kinPerson.name,
                nameChn: kinPerson.nameChn,
                nodeType: 'kinship',
                color: '#95e77e', // Green for kinship
                size: getNodeSize(4)  // Kinship persons get higher importance
              });
              addedPersons.add(kinPersonId);
            }
          }

          // Add kinship edge if node exists
          if (graph.hasNode(kinNodeId)) {
            graph.addEdge(centralNode, kinNodeId, {
              type: 'kinship',
              kinCode: kinship.kinshipCode,
              label: kinship.kinshipTypeInfo?.kinshipTypeChn || 'Kinship',
              weight: 1.5 // Higher weight for kinship
            });
          }
        }
      }
    }

    // Calculate metrics
    const metrics = this.algorithmOrchestrator.calculateMetricsFromGraph(graph);

    // Create result with proper CbdbGraphData format
    const result = new ExploreNetworkResult();
    result.centralPersonId = personId;

    // Export nodes in CbdbGraphData format (without coordinates yet)
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
          birthYear: attrs.indexYear
        }
      };
    });

    // Export edges in CbdbGraphData format
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
          assocCode: attrs.assocCode,
          kinshipCode: attrs.kinCode,
          strength: attrs.weight
        }
      };
    });

    result.metrics = {
      ...metrics,
      nodeCount: graph.order,
      edgeCount: graph.size
    };

    // Add historical interpretation
    result.interpretation = {
      summary: `${person.nameChn || person.name} has ${associations.length} documented associations`,
      keyFindings: this.generateAssociationInsights(associations, metrics),
      suggestions: [
        'Consider exploring political network for office connections',
        'Check geographic connections for same hometown relationships'
      ]
    };

    // Temporarily disable coordinate population to test performance
    // result.graphData = await this.graphCoordinateService.populateCoordinates(result.graphData);

    // Add coordinates inline for now (simple and fast)
    result.graphData.nodes = result.graphData.nodes.map(node => ({
      ...node,
      attributes: {
        ...node.attributes,
        x: node.attributes?.x ?? Math.random() * 1000 - 500,
        y: node.attributes?.y ?? Math.random() * 1000 - 500
      }
    }));

    return result;
  }

  /**
   * Explore Direct Network (直接关系)
   *
   * Returns immediate connections including:
   * - Family members (if includeKinship)
   * - Direct associates (if includeAssociations)
   * - Office colleagues (if includeOffices)
   *
   * @param query Query parameters for direct network exploration
   * @returns Network result focused on immediate relationships
   */
  async exploreDirectNetwork(query: ExploreDirectNetworkQuery): Promise<ExploreNetworkResult> {
    const {
      personId,
      includeKinship = true,
      includeAssociations = true,
      includeOffices = false
    } = query;

    // Get the central person
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    // Create graph
    const graph = new Graph();

    // Add central person
    const centralNode = String(personId);
    graph.addNode(centralNode, {
      id: personId,
      label: person.nameChn || person.name || `Person ${personId}`,
      name: person.name,
      nameChn: person.nameChn,
      dynasty: person.dynastyCode,
      indexYear: person.indexYear,
      nodeType: 'central',
      color: '#ff6b6b',
      size: getNodeSize(getNodeImportance(0)),  // Central person (depth 0)
      zIndex: 5  // Lower than edges (10) by default
    });

    const addedPersons = new Set<number>([personId]);
    let kinshipCount = 0;
    let associationCount = 0;
    let officeCount = 0;

    // Batch load all edges for the central person
    const relationTypesToFetch: string[] = [];
    if (includeKinship) relationTypesToFetch.push('kinship');
    if (includeAssociations) relationTypesToFetch.push('association');
    if (includeOffices) relationTypesToFetch.push('office');

    const edges = await this.personGraphRepository.getEdgesBatch([personId], relationTypesToFetch);

    // Collect all connected person IDs for batch loading
    const connectedPersonIds = new Set<number>();
    for (const edge of edges) {
      if (edge.sourceId === personId && edge.targetId !== personId) {
        connectedPersonIds.add(edge.targetId);
      } else if (edge.targetId === personId && edge.sourceId !== personId) {
        connectedPersonIds.add(edge.sourceId);
      }
    }

    // Batch load all connected persons
    const connectedPersons = connectedPersonIds.size > 0
      ? await this.personGraphRepository.getNodesBatch(Array.from(connectedPersonIds))
      : [];

    // Create a map for fast lookup
    const personsMap = new Map(connectedPersons.map(p => [p.nodeId, p]));

    // Add nodes and edges based on edge type
    for (const edge of edges) {
      const connectedId = edge.sourceId === personId ? edge.targetId : edge.sourceId;
      const nodeData = personsMap.get(connectedId);

      if (nodeData && !addedPersons.has(connectedId)) {
        const nodeId = String(connectedId);
        const color = edge.edgeType === 'kinship' ? '#95e77e' :
                      edge.edgeType === 'association' ? '#4ecdc4' :
                      '#f7b731'; // office

        graph.addNode(nodeId, {
          id: connectedId,
          label: nodeData.nodeLabel,
          name: nodeData.nodeLabel,
          nameChn: nodeData.nodeLabel,
          nodeType: edge.edgeType,
          relationDetail: edge.edgeLabel,
          color: color,
          size: getNodeSize(getNodeImportance(1, edge.edgeType)),  // Use importance-based sizing
          dynastyCode: nodeData.metadata?.dynastyCode,
          birthYear: nodeData.metadata?.birthYear,
          deathYear: nodeData.metadata?.deathYear,
          zIndex: 3  // Lower than edges (10) by default
        });
        addedPersons.add(connectedId);

        if (edge.edgeType === 'kinship') kinshipCount++;
        else if (edge.edgeType === 'association') associationCount++;
        else if (edge.edgeType === 'office') officeCount++;
      }

      if (graph.hasNode(String(connectedId)) && !graph.hasEdge(centralNode, String(connectedId))) {
        graph.addEdge(centralNode, String(connectedId), {
          type: edge.edgeType,
          kinCode: edge.edgeType === 'kinship' ? edge.edgeCode : undefined,
          assocCode: edge.edgeType === 'association' ? edge.edgeCode : undefined,
          officeCode: edge.edgeType === 'office' ? edge.edgeCode : undefined,
          label: edge.edgeLabel || edge.edgeType,
          weight: edge.edgeType === 'kinship' ? 2.0 : 1.0,
          zIndex: 10  // Default zIndex higher than nodes (0-5) to prevent occlusion
        });
      }
    }

    // Note: Office and association handling is done in the batch loading above

    // Calculate metrics
    const metrics = this.algorithmOrchestrator.calculateMetricsFromGraph(graph);

    // Create result with proper CbdbGraphData format
    const result = new ExploreNetworkResult();
    result.centralPersonId = personId;

    // Export nodes in CbdbGraphData format (without coordinates yet)
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
          birthYear: attrs.indexYear
        }
      };
    });

    // Export edges in CbdbGraphData format
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

    result.metrics = {
      ...metrics,
      nodeCount: graph.order,
      edgeCount: graph.size
    };

    // Add interpretation
    result.interpretation = {
      summary: `Direct network of ${person.nameChn || person.name}: ${kinshipCount} family members, ${associationCount} associates`,
      keyFindings: [
        kinshipCount > 0 ? `${kinshipCount} family relationships documented` : 'No family relationships found',
        associationCount > 0 ? `${associationCount} social/academic connections` : 'No associations found',
        officeCount > 0 ? `Held ${officeCount} official positions` : 'No official positions recorded'
      ],
      suggestions: [
        'Use association network explorer for deeper social connections',
        'Consider geographic connections for regional relationships'
      ]
    };

    // Temporarily disable coordinate population to test performance
    // result.graphData = await this.graphCoordinateService.populateCoordinates(result.graphData);

    // Add coordinates inline for now (simple and fast)
    result.graphData.nodes = result.graphData.nodes.map(node => ({
      ...node,
      attributes: {
        ...node.attributes,
        x: node.attributes?.x ?? Math.random() * 1000 - 500,
        y: node.attributes?.y ?? Math.random() * 1000 - 500
      }
    }));

    return result;
  }

  /**
   * Explore Person Network (Generic, Flexible)
   *
   * OPTIMIZATION STRATEGY:
   * 1. Filter at SQL level (only fetch needed edge types)
   * 2. Build graph with pre-filtered data
   * 3. Use fast native BFS (no runtime edge filtering)
   *
   * This is 30-50% faster than filtering during traversal!
   *
   * @param query Query parameters for network exploration
   * @returns Network result with nodes, edges, metrics, and interpretation
   */
  async explorePersonNetwork(query: ExplorePersonNetworkQuery): Promise<ExploreNetworkResult> {
    const { personId, depth = 1, relationTypes, includeReciprocal = false, filters } = query;

    // Performance timing
    console.time(`[PersonGraph] Total exploration for person ${personId} depth ${depth}`);

    // Get the central person
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    // Create graph using the new architecture
    const graph = new Graph();

    // Add central person as the root node with person: prefix for compatibility
    const centralNodeId = `person:${personId}`;
    graph.addNode(centralNodeId, {
      id: personId,
      label: person.nameChn || person.name || `Person ${personId}`,
      name: person.name,
      nameChn: person.nameChn,
      dynasty: person.dynastyCode,
      indexYear: person.indexYear,
      nodeType: 'central',
      isCentral: true, // Mark as central for tests
      color: '#ff6b6b', // Red for central person
      size: getNodeSize(getNodeImportance(0)),  // Central person (depth 0)
      zIndex: 5  // Lower than edges (10) by default
    });

    // OPTIMIZATION: Filter at SQL level - only fetch what we need!
    const relationTypesToFetch = relationTypes || ['kinship', 'association', 'office'];

    // Track nodes as we explore
    const addedPersons = new Set<number>([personId]);
    const nodesByLevel = new Map<number, Set<number>>();
    nodesByLevel.set(0, new Set([personId]));

    // OPTIMIZATION: Add node limits to prevent exponential growth
    const MAX_NODES_PER_LEVEL = 200;  // Limit nodes per depth level
    const MAX_TOTAL_NODES = 1000;     // Absolute maximum nodes

    // Build graph iteratively with ONLY the edges we want
    for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
      console.time(`[PersonGraph] Depth ${currentDepth} processing`);
      const nodesAtPrevLevel = nodesByLevel.get(currentDepth - 1)!;
      const prevLevelIds = Array.from(nodesAtPrevLevel);

      // Fetch ONLY the edge types we need (SQL filtering)
      console.time(`[PersonGraph] Batch fetch edges for ${prevLevelIds.length} nodes`);
      const edges = await this.personGraphRepository.getEdgesBatch(
        prevLevelIds,
        relationTypesToFetch  // Already filtered!
      );
      console.timeEnd(`[PersonGraph] Batch fetch edges for ${prevLevelIds.length} nodes`);
      console.log(`[PersonGraph] Fetched ${edges.length} edges`);

      // Process edges and add to graph
      const newPersonIds = new Set<number>();
      for (const edge of edges) {
        const sourceNodeId = `person:${edge.sourceId}`;
        const targetNodeId = `person:${edge.targetId}`;

        // Add edges to graph (we'll add nodes later)
        if (!graph.hasEdge(sourceNodeId, targetNodeId)) {
          const edgeData = {
            type: edge.edgeType,
            label: edge.edgeLabel || edge.edgeType,
            weight: edge.edgeWeight || (edge.edgeType === 'kinship' ? 1.5 : 1.0),
            zIndex: 10  // Default zIndex higher than nodes (0-5) to prevent occlusion
          };

          if (edge.edgeType === 'kinship') {
            (edgeData as any).kinCode = edge.edgeCode;
          } else if (edge.edgeType === 'association') {
            (edgeData as any).assocCode = edge.edgeCode;
          } else if (edge.edgeType === 'office') {
            (edgeData as any).officeCode = edge.edgeCode;
          }

          // Add nodes temporarily if they don't exist
          if (!graph.hasNode(sourceNodeId)) {
            graph.addNode(sourceNodeId, { id: edge.sourceId, zIndex: 3 });
          }
          if (!graph.hasNode(targetNodeId)) {
            graph.addNode(targetNodeId, { id: edge.targetId, zIndex: 3 });
          }

          graph.addEdge(sourceNodeId, targetNodeId, edgeData);
        }

        // Track new persons to fetch
        if (!addedPersons.has(edge.sourceId)) {
          newPersonIds.add(edge.sourceId);
        }
        if (!addedPersons.has(edge.targetId)) {
          newPersonIds.add(edge.targetId);
        }
      }

      // OPTIMIZATION: Limit nodes per level
      const limitedNewPersonIds = new Set(
        Array.from(newPersonIds).slice(0, MAX_NODES_PER_LEVEL)
      );

      // Check total node limit
      if (addedPersons.size + limitedNewPersonIds.size > MAX_TOTAL_NODES) {
        console.warn(`[PersonGraph] Reached max node limit (${MAX_TOTAL_NODES}), stopping exploration`);
        break;
      }

      nodesByLevel.set(currentDepth, limitedNewPersonIds);
      limitedNewPersonIds.forEach(id => addedPersons.add(id));

      console.log(`[PersonGraph] Level ${currentDepth}: Added ${limitedNewPersonIds.size} new nodes (total: ${addedPersons.size})`);
      console.timeEnd(`[PersonGraph] Depth ${currentDepth} processing`);
    }

    // FAST PATH: Use native BFS since edges are pre-filtered!
    const explorationResult = this.networkExploration.explorePreFiltered(graph, {
      startNode: centralNodeId,
      maxDepth: depth,
      includeEdges: true
      // No edge filter needed - we only fetched the edges we want!
    });

    // Remove nodes that weren't reached by the exploration
    const nodesToKeep = new Set(explorationResult.nodes.keys());
    const allNodes = Array.from(graph.nodes());
    for (const nodeId of allNodes) {
      if (!nodesToKeep.has(nodeId)) {
        graph.dropNode(nodeId);
      }
    }

    // Now batch load person data for all nodes in the explored graph
    const personIdsToLoad = new Set<number>();
    explorationResult.nodes.forEach((nodeData, nodeId) => {
      const id = graph.getNodeAttribute(nodeId, 'id');
      if (id && id !== personId) { // Skip central person, we already have it
        personIdsToLoad.add(id);
      }
    });

    if (personIdsToLoad.size > 0) {
      const nodes = await this.personGraphRepository.getNodesBatch(Array.from(personIdsToLoad));
      const nodesMap = new Map(nodes.map(n => [n.nodeId, n]));

      // Update node attributes with fetched data
      explorationResult.nodes.forEach((exploredNodeData, nodeId) => {
        const id = graph.getNodeAttribute(nodeId, 'id');
        if (id !== personId) {
          const nodeData = nodesMap.get(id);
          if (nodeData) {
            // Determine node type based on edges
            let primaryType = 'association';
            graph.forEachEdge(nodeId, (edge, attrs) => {
              if (attrs.type === 'kinship') {
                primaryType = 'kinship';
                return; // Prefer kinship
              }
            });

            const colors = {
              kinship: '#95e77e',
              association: '#4ecdc4',
              office: '#f7b731'
            };

            graph.mergeNodeAttributes(nodeId, {
              id: id,
              label: nodeData.nodeLabel,
              name: nodeData.nodeLabel,
              nameChn: nodeData.nodeLabel,
              nodeType: primaryType,
              depth: exploredNodeData.depth,
              color: colors[primaryType] || '#666',
              size: getNodeSize(getNodeImportance(exploredNodeData.depth, primaryType)),
              dynastyCode: nodeData.metadata?.dynastyCode,
              birthYear: nodeData.metadata?.birthYear,
              deathYear: nodeData.metadata?.deathYear,
              zIndex: 3  // Lower than edges (10) by default
            });
          }
        }
      });
    }

    // PERFORMANCE FIX: Disable reciprocal relationships for large networks
    // For depth=2 with 454 nodes, this was doing 102,000+ pair checks with DB queries
    // Only enable for small networks or when explicitly requested
    const nodeCount = addedPersons.size;
    const shouldIncludeReciprocal = includeReciprocal && nodeCount < 100 && depth > 1;

    if (shouldIncludeReciprocal) {
      console.log(`Adding reciprocal relationships for ${nodeCount} nodes (${nodeCount * (nodeCount - 1) / 2} pairs to check)`);
      await this.addReciprocalRelationships(graph, addedPersons, relationTypesToFetch.includes('kinship'), relationTypesToFetch.includes('association'));
    } else if (includeReciprocal && nodeCount >= 100) {
      console.log(`Skipping reciprocal relationships for performance (${nodeCount} nodes would require ${nodeCount * (nodeCount - 1) / 2} pair checks)`);
    }

    // Calculate metrics
    const metrics = this.algorithmOrchestrator.calculateMetricsFromGraph(graph);

    // Create result with proper CbdbGraphData format
    const result = new ExploreNetworkResult();
    result.centralPersonId = personId;

    // Export nodes in CbdbGraphData format (without coordinates yet)
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
          birthYear: attrs.indexYear
        }
      };
    });

    // Export edges in CbdbGraphData format
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

    result.metrics = {
      ...metrics,
      nodeCount: graph.order,
      edgeCount: graph.size
    };

    // Add generic interpretation (NOT Chinese-specific)
    const edgesByType = this.categorizeEdgesByType(result.graphData.edges);
    result.interpretation = {
      summary: `Network of ${person.nameChn || person.name}: ${addedPersons.size - 1} connections at depth ${depth}`,
      keyFindings: [
        `Total nodes: ${addedPersons.size}`,
        `Total edges: ${result.graphData.edges.length}`,
        relationTypesToFetch.includes('kinship') ? `Family connections: ${edgesByType.kinship}` : null,
        relationTypesToFetch.includes('association') ? `Social/academic connections: ${edgesByType.association}` : null,
        relationTypesToFetch.includes('office') ? `Professional connections: ${edgesByType.office}` : null,
        `Network density: ${metrics.density.toFixed(3)}`,
        `Average degree: ${metrics.avgDegree.toFixed(2)}`,
        `Clustering coefficient: ${metrics.clusteringCoefficient.toFixed(3)}`
      ].filter(Boolean) as string[],
      suggestions: [
        depth < 3 ? 'Increase depth to explore extended network' : null,
        !relationTypesToFetch.includes('kinship') ? 'Enable kinship to see family connections' : null,
        !relationTypesToFetch.includes('association') ? 'Enable associations to see social connections' : null,
        metrics.density < 0.1 ? 'Sparse network - consider exploring specific relationship types' : null,
        metrics.density > 0.5 ? 'Dense network - strong interconnections' : null
      ].filter(Boolean) as string[]
    };

    // Temporarily disable coordinate population to test performance
    // result.graphData = await this.graphCoordinateService.populateCoordinates(result.graphData);

    // Add coordinates inline for now (simple and fast)
    result.graphData.nodes = result.graphData.nodes.map(node => ({
      ...node,
      attributes: {
        ...node.attributes,
        x: node.attributes?.x ?? Math.random() * 1000 - 500,
        y: node.attributes?.y ?? Math.random() * 1000 - 500
      }
    }));

    console.timeEnd(`[PersonGraph] Total exploration for person ${personId} depth ${depth}`);
    console.log(`[PersonGraph] Final graph: ${result.graphData.nodes.length} nodes, ${result.graphData.edges.length} edges`);

    return result;
  }

  /**
   * Helper method to add a person node to the graph
   */
  private async addPersonNode(
    graph: Graph,
    personId: number,
    nodeType: string,
    depth: number
  ): Promise<void> {
    const person = await this.personRepository.findModelById(personId);
    if (person) {
      const nodeId = `person:${personId}`;
      const colors = {
        kinship: '#95e77e',     // Green for family
        association: '#4ecdc4', // Teal for associates
        office: '#f7b731'       // Yellow for colleagues
      };

      graph.addNode(nodeId, {
        id: personId,
        label: person.nameChn || person.name || `Person ${personId}`,
        name: person.name,
        nameChn: person.nameChn,
        nodeType,
        depth,
        color: colors[nodeType] || '#666',
        size: getNodeSize(getNodeImportance(depth, nodeType))
      });
    }
  }

  /**
   * Add reciprocal relationships between discovered nodes
   */
  private async addReciprocalRelationships(
    graph: Graph,
    addedPersons: Set<number>,
    includeKinship: boolean,
    includeAssociation: boolean
  ): Promise<void> {
    const personIds = Array.from(addedPersons);

    // Check relationships between all pairs
    for (let i = 0; i < personIds.length; i++) {
      for (let j = i + 1; j < personIds.length; j++) {
        const person1 = personIds[i];
        const person2 = personIds[j];
        const node1 = `person:${person1}`;
        const node2 = `person:${person2}`;

        // Skip if edge already exists
        if (graph.hasEdge(node1, node2) || graph.hasEdge(node2, node1)) {
          continue;
        }

        // Check for kinship relationships
        if (includeKinship) {
          const kinships = await this.personKinshipRelationRepository.getFullRelations(person1);
          const kinship = kinships.find(k => k.kinPersonId === person2);
          if (kinship) {
            graph.addEdge(node1, node2, {
              type: 'kinship',
              kinCode: kinship.kinshipCode,
              label: kinship.kinshipTypeInfo?.kinshipTypeChn || 'Kinship',
              reciprocal: true,
              weight: 1.5
            });
          }
        }

        // Check for association relationships
        if (includeAssociation) {
          const associations = await this.personAssociationRelationRepository.getWithFullRelations(person1);
          const assoc = associations.find(a => {
            const assocPerson = a.assocPersonInfo || a.kinPersonInfo;
            return assocPerson?.personId === person2;
          });
          if (assoc) {
            graph.addEdge(node1, node2, {
              type: 'association',
              assocCode: assoc.assocCode,
              label: assoc.associationTypeInfo?.assocTypeChn || 'Association',
              reciprocal: true,
              weight: 1.0
            });
          }
        }
      }
    }
  }

  /**
   * Categorize edges by type for interpretation
   */
  private categorizeEdgesByType(edges: any[]): { kinship: number; association: number; office: number } {
    const counts = { kinship: 0, association: 0, office: 0 };

    for (const edge of edges) {
      const type = edge.attributes?.type;
      if (type === 'kinship') counts.kinship++;
      else if (type === 'association') counts.association++;
      else if (type === 'office') counts.office++;
    }

    return counts;
  }

  /**
   * Generate insights about associations for interpretation
   */
  private generateAssociationInsights(associations: any[], metrics: any): string[] {
    const insights: string[] = [];

    // Count association types
    const typeCount = new Map<string, number>();
    for (const assoc of associations) {
      const type = assoc.associationTypeInfo?.assocTypeChn || 'Unknown';
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
    }

    // Most common association type
    if (typeCount.size > 0) {
      const sortedTypes = Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1]);
      insights.push(`Most common relationship: ${sortedTypes[0][0]} (${sortedTypes[0][1]} connections)`);
    }

    // Network density insight
    if (metrics.density > 0.3) {
      insights.push('Highly interconnected network suggests strong social influence');
    } else if (metrics.density < 0.1) {
      insights.push('Sparse network indicates selective relationships');
    }

    // Network size insight
    if (associations.length > 20) {
      insights.push('Extensive network indicates prominent social position');
    } else if (associations.length < 5) {
      insights.push('Limited documented relationships, possibly incomplete records');
    }

    return insights;
  }

  /**
   * Explore kinship network for a person
   *
   * Convenience method for kinship-only network exploration.
   * This is a Tier 2 preset explorer for family relationships.
   *
   * @param personId Person ID
   * @param depth Network depth (default: 1)
   * @returns Network exploration result with kinship relationships only
   */
  async exploreKinshipNetwork(personId: number, depth: number = 1): Promise<ExploreNetworkResult> {
    const query = new ExplorePersonNetworkQuery();
    query.personId = personId;
    query.depth = depth;
    query.relationTypes = ['kinship'];
    query.includeReciprocal = false; // Disabled for performance

    return this.explorePersonNetwork(query);
  }

  /**
   * Export network to file (for compatibility with existing functionality)
   */
  async exportNetworkToGEXF(
    personId: number,
    outputPath: string,
    options: {
      includeKinship?: boolean;
      includeAssociations?: boolean;
      includeOffices?: boolean;
    } = {}
  ): Promise<{ success: boolean; filepath: string; metrics: any }> {
    // Build the network
    const query = new ExploreDirectNetworkQuery();
    query.personId = personId;
    query.includeKinship = options.includeKinship ?? true;
    query.includeAssociations = options.includeAssociations ?? true;
    query.includeOffices = options.includeOffices ?? false;

    const networkResult = await this.exploreDirectNetwork(query);

    // Rebuild graph for export (since we need the Graph instance)
    const graph = new Graph();

    // Add nodes with all their properties as attributes
    for (const node of networkResult.graphData.nodes) {
      graph.addNode(node.key, node.attributes || {});
    }

    // Add edges with all their properties as attributes
    for (const edge of networkResult.graphData.edges) {
      graph.addEdge(edge.source, edge.target, edge.attributes || {});
    }

    // Export to GEXF
    await this.graphExportService.exportToGEXF(graph, outputPath, {
      meta: {
        description: `Network of Person ${personId} - Generated by CBDB Preset Explorer`
      }
    });

    return {
      success: true,
      filepath: outputPath,
      metrics: networkResult.metrics
    };
  }
}