/**
 * PersonGraphRepository - Specialized repository for graph operations
 *
 * This repository provides minimal data queries optimized for graph operations.
 * It returns only the essential fields needed for graph algorithms and visualization,
 * avoiding the overhead of loading full domain objects.
 *
 * Key optimizations:
 * - Minimal SELECT columns (only IDs, labels, and essential metadata)
 * - Batch loading to reduce query count
 * - Recursive CTEs for N-degree network queries
 * - Proper indexing for graph traversal
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, inArray, or, SQL } from 'drizzle-orm';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import {
  KIN_DATA,
  KINSHIP_CODES,
  BIOG_MAIN,
  ASSOC_DATA,
  POSTED_TO_OFFICE_DATA,
  OFFICE_CODES,
  ASSOC_CODES,
} from '../db/cbdb-schema/schema';

// Minimal interfaces for graph data
export interface GraphEdgeData {
  sourceId: number;
  targetId: number;
  edgeType: 'kinship' | 'association' | 'office';
  edgeCode?: number;
  edgeLabel?: string;
  edgeWeight?: number;
}

export interface GraphNodeData {
  nodeId: number;
  nodeLabel: string;
  nodeType?: string;
  metadata?: {
    dynastyCode?: number;
    birthYear?: number;
    deathYear?: number;
  };
}

export interface GraphQueryOptions {
  relationTypes?: Array<'kinship' | 'association' | 'office'>;
  maxNodes?: number;
  includeMetadata?: boolean;
}

@Injectable()
export class PersonGraphRepository {
  constructor(private cbdbConnection: CbdbConnectionService) {}

  /**
   * Get minimal edge data for multiple persons in a single query
   * This is the key optimization - one query instead of N queries
   * @param includeReciprocal - If true, fetch edges where persons are targets too (bidirectional)
   */
  async getEdgesBatch(
    personIds: number[],
    types: string[] = ['kinship', 'association', 'office'],
    includeReciprocal: boolean = false
  ): Promise<GraphEdgeData[]> {
    if (personIds.length === 0) return [];

    const db = this.cbdbConnection.getDb();
    const edges: GraphEdgeData[] = [];

    // Fetch kinship edges if requested
    if (types.includes('kinship')) {
      const kinshipEdges = await db
        .select({
          sourceId: KIN_DATA.c_personid,
          targetId: KIN_DATA.c_kin_id,
          edgeType: sql<'kinship'>`'kinship'`,
          edgeCode: KIN_DATA.c_kin_code,
          edgeLabel: KINSHIP_CODES.c_kinrel_chn,
        })
        .from(KIN_DATA)
        .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
        .where(
          includeReciprocal
            ? or(
                inArray(KIN_DATA.c_personid, personIds),
                inArray(KIN_DATA.c_kin_id, personIds)
              )
            : inArray(KIN_DATA.c_personid, personIds)
        )
        .execute();

      edges.push(...kinshipEdges.filter(e => e.targetId !== null).map(e => ({
        ...e,
        targetId: e.targetId!,
        edgeLabel: e.edgeLabel || undefined,
      })));
    }

    // Fetch association edges if requested
    if (types.includes('association')) {
      const assocEdges = await db
        .select({
          sourceId: ASSOC_DATA.c_personid,
          targetId: ASSOC_DATA.c_assoc_id,
          edgeType: sql<'association'>`'association'`,
          edgeCode: ASSOC_DATA.c_assoc_code,
          edgeLabel: ASSOC_CODES.c_assoc_desc_chn,
        })
        .from(ASSOC_DATA)
        .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
        .where(
          includeReciprocal
            ? or(
                inArray(ASSOC_DATA.c_personid, personIds),
                inArray(ASSOC_DATA.c_assoc_id, personIds)
              )
            : inArray(ASSOC_DATA.c_personid, personIds)
        )
        .execute();

      edges.push(...assocEdges.filter(e => e.targetId !== null).map(e => ({
        ...e,
        targetId: e.targetId!,
        edgeLabel: e.edgeLabel || undefined,
      })));
    }

    // Fetch office edges if requested (person to office relationships)
    if (types.includes('office')) {
      const officeEdges = await db
        .select({
          sourceId: POSTED_TO_OFFICE_DATA.c_personid,
          targetId: POSTED_TO_OFFICE_DATA.c_office_id,
          edgeType: sql<'office'>`'office'`,
          edgeCode: POSTED_TO_OFFICE_DATA.c_office_id,
          edgeLabel: OFFICE_CODES.c_office_chn,
        })
        .from(POSTED_TO_OFFICE_DATA)
        .leftJoin(OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_office_id, OFFICE_CODES.c_office_id))
        .where(inArray(POSTED_TO_OFFICE_DATA.c_personid, personIds))
        .execute();

      // Filter and map properly with type assertions
      const validOfficeEdges: GraphEdgeData[] = officeEdges
        .filter((e): e is typeof e & { sourceId: number; targetId: number } =>
          e.sourceId !== null && e.targetId !== null
        )
        .map(e => ({
          sourceId: e.sourceId,
          targetId: e.targetId,
          edgeType: e.edgeType,
          edgeCode: e.edgeCode || undefined,
          edgeLabel: e.edgeLabel || undefined,
        }));

      edges.push(...validOfficeEdges);
    }

    return edges;
  }

  /**
   * Get minimal node data for graph display
   * Returns only essential fields for visualization
   */
  async getNodesBatch(nodeIds: number[]): Promise<GraphNodeData[]> {
    if (nodeIds.length === 0) return [];

    const db = this.cbdbConnection.getDb();

    const nodes = await db
      .select({
        nodeId: BIOG_MAIN.c_personid,
        nodeLabel: sql<string>`COALESCE(
          ${BIOG_MAIN.c_name_chn},
          ${BIOG_MAIN.c_name},
          'Person ' || ${BIOG_MAIN.c_personid}
        )`,
        dynastyCode: BIOG_MAIN.c_dy,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear,
      })
      .from(BIOG_MAIN)
      .where(inArray(BIOG_MAIN.c_personid, nodeIds))
      .execute();

    return nodes.map(node => ({
      nodeId: node.nodeId,
      nodeLabel: node.nodeLabel,
      nodeType: 'person',
      metadata: {
        dynastyCode: node.dynastyCode || undefined,
        birthYear: node.birthYear || undefined,
        deathYear: node.deathYear || undefined,
      },
    }));
  }

  /**
   * Get all edges within N degrees using recursive CTE
   * This is the most complex but powerful query for network exploration
   */
  async getNetworkEdges(
    centerPersonId: number,
    maxDegrees: number,
    options: GraphQueryOptions = {}
  ): Promise<GraphEdgeData[]> {
    const db = this.cbdbConnection.getDb();
    const types = options.relationTypes || ['kinship'];

    // Build a UNION query for all edge types
    const edgeQueries: SQL<unknown>[] = [];

    if (types.includes('kinship')) {
      edgeQueries.push(sql`
        SELECT
          ${KIN_DATA.c_personid} as source_id,
          ${KIN_DATA.c_kin_id} as target_id,
          'kinship' as edge_type,
          ${KIN_DATA.c_kin_code} as edge_code
        FROM ${KIN_DATA}
        WHERE ${KIN_DATA.c_kin_id} IS NOT NULL
      `);
    }

    if (types.includes('association')) {
      edgeQueries.push(sql`
        SELECT
          ${ASSOC_DATA.c_personid} as source_id,
          ${ASSOC_DATA.c_assoc_id} as target_id,
          'association' as edge_type,
          ${ASSOC_DATA.c_assoc_code} as edge_code
        FROM ${ASSOC_DATA}
        WHERE ${ASSOC_DATA.c_assoc_id} IS NOT NULL
      `);
    }

    if (edgeQueries.length === 0) return [];

    // Combine edge queries with UNION ALL
    const edgeUnion = edgeQueries.reduce((acc, query, index) => {
      if (index === 0) return query;
      return sql`${acc} UNION ALL ${query}`;
    }, sql``);

    // Recursive CTE to find all persons within N degrees
    // For complex CTEs with SQLite/LibSQL, we need to use the execute method
    // Type the result properly
    type EdgeResult = {
      sourceId: number;
      targetId: number;
      edgeType: string;
      edgeCode: number;
    };

    const statement = sql`
      WITH RECURSIVE
      -- All edges in the database
      all_edges AS (
        ${edgeUnion}
      ),
      -- Recursive network exploration
      network AS (
        -- Base case: starting person
        SELECT
          ${centerPersonId} as person_id,
          0 as degree

        UNION

        -- Recursive case: connected persons
        SELECT DISTINCT
          CASE
            WHEN e.source_id = n.person_id THEN e.target_id
            ELSE e.source_id
          END as person_id,
          n.degree + 1 as degree
        FROM network n
        INNER JOIN all_edges e ON (
          e.source_id = n.person_id OR e.target_id = n.person_id
        )
        WHERE n.degree < ${maxDegrees}
      ),
      -- Get all persons in the network
      network_persons AS (
        SELECT DISTINCT person_id FROM network
      )
      -- Get all edges where both endpoints are in the network
      SELECT DISTINCT
        e.source_id as sourceId,
        e.target_id as targetId,
        e.edge_type as edgeType,
        e.edge_code as edgeCode
      FROM all_edges e
      WHERE
        e.source_id IN (SELECT person_id FROM network_persons)
        AND e.target_id IN (SELECT person_id FROM network_persons)
      ${options.maxNodes ? sql`LIMIT ${options.maxNodes}` : sql``}
    `;

    // Execute the raw SQL query
    const result = await (db as any).run(statement);

    // SQLite returns rows in the result
    const rows = (result as any)?.rows || [];
    return rows as GraphEdgeData[];
  }

  /**
   * Get edges for a single degree (direct connections only)
   * Simpler and faster than the recursive CTE for single-hop queries
   */
  async getDirectEdges(
    personId: number,
    types: string[] = ['kinship'],
    includeReciprocal: boolean = false
  ): Promise<GraphEdgeData[]> {
    return this.getEdgesBatch([personId], types, includeReciprocal);
  }

  /**
   * Get all person IDs connected to the given persons
   * Useful for expanding the graph incrementally
   */
  async getConnectedPersonIds(
    personIds: number[],
    types: string[] = ['kinship'],
    includeReciprocal: boolean = false
  ): Promise<number[]> {
    const edges = await this.getEdgesBatch(personIds, types, includeReciprocal);

    const connectedIds = new Set<number>();
    edges.forEach(edge => {
      connectedIds.add(edge.sourceId);
      connectedIds.add(edge.targetId);
    });

    return Array.from(connectedIds);
  }

  /**
   * Count edges for performance monitoring
   * Helps decide whether to use full graph or pagination
   */
  async countEdges(
    personIds: number[],
    types: string[] = ['kinship'],
    includeReciprocal: boolean = false
  ): Promise<number> {
    const edges = await this.getEdgesBatch(personIds, types, includeReciprocal);
    return edges.length;
  }

  /**
   * Get edge statistics for optimization decisions
   */
  async getEdgeStats(personId: number): Promise<{
    kinshipCount: number;
    associationCount: number;
    officeCount: number;
    totalCount: number;
  }> {
    const db = this.cbdbConnection.getDb();

    const [kinshipResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(KIN_DATA)
      .where(eq(KIN_DATA.c_personid, personId))
      .execute();

    const [assocResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ASSOC_DATA)
      .where(eq(ASSOC_DATA.c_personid, personId))
      .execute();

    const [officeResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(POSTED_TO_OFFICE_DATA)
      .where(eq(POSTED_TO_OFFICE_DATA.c_personid, personId))
      .execute();

    const kinshipCount = kinshipResult?.count || 0;
    const associationCount = assocResult?.count || 0;
    const officeCount = officeResult?.count || 0;

    return {
      kinshipCount,
      associationCount,
      officeCount,
      totalCount: kinshipCount + associationCount + officeCount,
    };
  }
}