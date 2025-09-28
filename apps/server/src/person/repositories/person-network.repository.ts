/**
 * Repository for Multi-Person Network Discovery
 * Implements the iterative discovery algorithm from CBDB patterns
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, or, inArray } from 'drizzle-orm';
import {
  KIN_DATA,
  ASSOC_DATA,
  BIOG_MAIN,
  NetworkEdge,
  DiscoveredPerson
} from '@cbdb/core';
import { CbdbConnectionService } from '../../db/cbdb-connection.service';

/**
 * Related person discovered through network search
 */
export interface RelatedPerson {
  relatedPersonId: number;
  type: 'kinship' | 'association';
  label: string;
  code: number;
  direction: 'forward' | 'reverse' | 'mutual';
}

@Injectable()
export class PersonNetworkRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Discover all persons connected to query persons
   * Following CBDB PHP pattern: bidirectional search for associations
   *
   * @param personIds Array of person IDs to search from
   * @param includeKinship Include kinship relationships
   * @param includeAssociation Include association relationships
   * @returns Map of personId to their connections
   */
  async discoverConnectedPersons(
    personIds: number[],
    includeKinship: boolean = true,
    includeAssociation: boolean = true
  ): Promise<Map<number, RelatedPerson[]>> {
    const db = this.cbdbConnection.getDb();
    const connections = new Map<number, RelatedPerson[]>();

    // Initialize map for all query persons
    personIds.forEach(id => connections.set(id, []));

    // Get kinship connections if requested
    if (includeKinship) {
      const kinships = await db
        .select({
          personId: KIN_DATA.c_personid,
          kinId: KIN_DATA.c_kin_id,
          kinCode: KIN_DATA.c_kin_code
        })
        .from(KIN_DATA)
        .where(inArray(KIN_DATA.c_personid, personIds))
        .all();

      for (const kin of kinships) {
        if (kin.kinId) {
          const relations = connections.get(kin.personId) || [];
          relations.push({
            relatedPersonId: kin.kinId,
            type: 'kinship',
            label: `K${kin.kinCode}`, // Will be replaced with proper label
            code: kin.kinCode,
            direction: 'forward'
          });
          connections.set(kin.personId, relations);
        }
      }
    }

    // Get association connections if requested (bidirectional)
    if (includeAssociation) {
      // Forward associations (person is c_personid)
      const forwardAssocs = await db
        .select({
          personId: ASSOC_DATA.c_personid,
          assocId: ASSOC_DATA.c_assoc_id,
          assocCode: ASSOC_DATA.c_assoc_code
        })
        .from(ASSOC_DATA)
        .where(inArray(ASSOC_DATA.c_personid, personIds))
        .all();

      for (const assoc of forwardAssocs) {
        if (assoc.assocId) {
          const relations = connections.get(assoc.personId) || [];
          relations.push({
            relatedPersonId: assoc.assocId,
            type: 'association',
            label: `A${assoc.assocCode}`, // Will be replaced with proper label
            code: assoc.assocCode,
            direction: 'forward'
          });
          connections.set(assoc.personId, relations);
        }
      }

      // Reverse associations (person is c_assoc_id)
      const reverseAssocs = await db
        .select({
          assocId: ASSOC_DATA.c_assoc_id,
          personId: ASSOC_DATA.c_personid,
          assocCode: ASSOC_DATA.c_assoc_code
        })
        .from(ASSOC_DATA)
        .where(inArray(ASSOC_DATA.c_assoc_id, personIds))
        .all();

      for (const assoc of reverseAssocs) {
        if (assoc.personId) {
          const relations = connections.get(assoc.assocId) || [];
          relations.push({
            relatedPersonId: assoc.personId,
            type: 'association',
            label: `A${assoc.assocCode}`, // Will be replaced with proper label
            code: assoc.assocCode,
            direction: 'reverse'
          });
          connections.set(assoc.assocId, relations);
        }
      }
    }

    return connections;
  }

  /**
   * Find all edges within a group of persons
   * Used to identify direct connections and complete network
   *
   * @param personIds All person IDs in the network
   * @param includeKinship Include kinship relationships
   * @param includeAssociation Include association relationships
   * @returns Array of edges found
   */
  async findEdgesWithinGroup(
    personIds: number[],
    includeKinship: boolean = true,
    includeAssociation: boolean = true
  ): Promise<NetworkEdge[]> {
    const db = this.cbdbConnection.getDb();
    const edges: NetworkEdge[] = [];

    // Find kinship edges where both parties are in the group
    if (includeKinship) {
      const kinships = await db
        .select({
          source: KIN_DATA.c_personid,
          target: KIN_DATA.c_kin_id,
          code: KIN_DATA.c_kin_code
        })
        .from(KIN_DATA)
        .where(and(
          inArray(KIN_DATA.c_personid, personIds),
          inArray(KIN_DATA.c_kin_id, personIds)
        ))
        .all();

      for (const kin of kinships) {
        edges.push({
          source: kin.source,
          target: kin.target,
          edgeType: 'kinship',
          edgeLabel: `Kinship ${kin.code}`,
          edgeCode: kin.code,
          edgeDistance: 0, // Will be calculated by service
          nodeDistance: 0, // Will be calculated by service
          metadata: {
            kinshipCode: kin.code
          }
        });
      }
    }

    // Find association edges where both parties are in the group
    if (includeAssociation) {
      const associations = await db
        .select({
          source: ASSOC_DATA.c_personid,
          target: ASSOC_DATA.c_assoc_id,
          code: ASSOC_DATA.c_assoc_code
        })
        .from(ASSOC_DATA)
        .where(and(
          inArray(ASSOC_DATA.c_personid, personIds),
          inArray(ASSOC_DATA.c_assoc_id, personIds)
        ))
        .all();

      for (const assoc of associations) {
        edges.push({
          source: assoc.source,
          target: assoc.target,
          edgeType: 'association',
          edgeLabel: `Association ${assoc.code}`,
          edgeCode: assoc.code,
          edgeDistance: 0, // Will be calculated by service
          nodeDistance: 0, // Will be calculated by service
          metadata: {
            assocCode: assoc.code
          }
        });
      }
    }

    return edges;
  }

  /**
   * Load person data for a set of IDs
   * Batch loading for efficiency
   *
   * @param personIds Array of person IDs to load
   * @returns Map of person ID to person data
   */
  async loadPersonsByIds(personIds: number[]): Promise<Map<number, any>> {
    const db = this.cbdbConnection.getDb();
    const personMap = new Map();

    if (personIds.length === 0) {
      return personMap;
    }

    // Batch load in chunks of 500 to avoid query size limits
    const chunkSize = 500;
    for (let i = 0; i < personIds.length; i += chunkSize) {
      const chunk = personIds.slice(i, i + chunkSize);

      const persons = await db
        .select()
        .from(BIOG_MAIN)
        .where(inArray(BIOG_MAIN.c_personid, chunk))
        .all();

      for (const person of persons) {
        personMap.set(person.c_personid, person);
      }
    }

    return personMap;
  }

  /**
   * Apply filters to discovered persons
   * Query persons are never filtered out
   *
   * @param personIds Person IDs to filter
   * @param queryPersonIds Original query person IDs (never filtered)
   * @param filters Filter options
   * @returns Filtered person IDs
   */
  async filterPersons(
    personIds: number[],
    queryPersonIds: Set<number>,
    filters: {
      indexYearRange?: [number, number];
      dynasties?: number[];
      includeMale?: boolean;
      includeFemale?: boolean;
    }
  ): Promise<number[]> {
    const db = this.cbdbConnection.getDb();

    // Separate query persons from discovered persons
    const discoveredIds = personIds.filter(id => !queryPersonIds.has(id));

    if (discoveredIds.length === 0) {
      // Only query persons, return as-is
      return personIds;
    }

    // Build filter conditions
    const conditions: any[] = [inArray(BIOG_MAIN.c_personid, discoveredIds)];

    if (filters.indexYearRange) {
      conditions.push(
        sql`${BIOG_MAIN.c_index_year} >= ${filters.indexYearRange[0]}`,
        sql`${BIOG_MAIN.c_index_year} <= ${filters.indexYearRange[1]}`
      );
    }

    if (filters.dynasties && filters.dynasties.length > 0) {
      conditions.push(inArray(BIOG_MAIN.c_dy, filters.dynasties));
    }

    if (filters.includeMale === false) {
      conditions.push(eq(BIOG_MAIN.c_female, '1'));
    }

    if (filters.includeFemale === false) {
      conditions.push(eq(BIOG_MAIN.c_female, '0'));
    }

    // Apply filters to discovered persons only
    let filteredDiscovered = discoveredIds;
    if (conditions.length > 1) { // Only filter if we have more than just the inArray condition
      const filtered = await db
        .select({
          personId: BIOG_MAIN.c_personid
        })
        .from(BIOG_MAIN)
        .where(and(...conditions))
        .all();

      filteredDiscovered = filtered.map(f => f.personId);
    }

    // Combine query persons (unfiltered) with filtered discovered persons
    return [...Array.from(queryPersonIds), ...filteredDiscovered];
  }

  /**
   * Find shortest paths between two persons using BFS
   * Limited depth to prevent explosion
   *
   * @param source Source person ID
   * @param target Target person ID
   * @param maxDepth Maximum path length
   * @param includeKinship Include kinship relationships
   * @param includeAssociation Include association relationships
   * @returns Array of paths found
   */
  async findPathsBetween(
    source: number,
    target: number,
    maxDepth: number = 3,
    includeKinship: boolean = true,
    includeAssociation: boolean = true
  ): Promise<Array<{ path: number[]; edges: NetworkEdge[] }>> {
    // BFS implementation
    const queue: Array<{ person: number; path: number[]; edges: NetworkEdge[] }> = [
      { person: source, path: [source], edges: [] }
    ];
    const visited = new Set<number>([source]);
    const paths: Array<{ path: number[]; edges: NetworkEdge[] }> = [];

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Check depth limit
      if (current.path.length > maxDepth) {
        break;
      }

      // Get connections for current person
      const connections = await this.discoverConnectedPersons(
        [current.person],
        includeKinship,
        includeAssociation
      );

      const relations = connections.get(current.person) || [];

      for (const rel of relations) {
        // Found target
        if (rel.relatedPersonId === target) {
          const edge: NetworkEdge = {
            source: current.person,
            target: rel.relatedPersonId,
            edgeType: rel.type,
            edgeLabel: rel.label,
            edgeCode: rel.code,
            edgeDistance: 0,
            nodeDistance: current.path.length
          };

          paths.push({
            path: [...current.path, target],
            edges: [...current.edges, edge]
          });
        }

        // Continue search if not visited
        if (!visited.has(rel.relatedPersonId)) {
          visited.add(rel.relatedPersonId);

          const edge: NetworkEdge = {
            source: current.person,
            target: rel.relatedPersonId,
            edgeType: rel.type,
            edgeLabel: rel.label,
            edgeCode: rel.code,
            edgeDistance: 0,
            nodeDistance: current.path.length
          };

          queue.push({
            person: rel.relatedPersonId,
            path: [...current.path, rel.relatedPersonId],
            edges: [...current.edges, edge]
          });
        }
      }
    }

    return paths;
  }
}