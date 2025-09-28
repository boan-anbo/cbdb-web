/**
 * Orchestrator repository for all Association relations
 * Associations are multi-dimensional and can involve:
 * - Primary person → Associated person
 * - Kinship context for both parties
 * - Tertiary person involvement
 * - Text/document context
 * This complexity warrants its own orchestrator
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, or, inArray } from 'drizzle-orm';
import {
  ASSOC_DATA,
  ASSOC_CODES,
  KINSHIP_CODES,
  TEXT_CODES,
  BIOG_MAIN,
  RelationStat
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { PersonAssociationRelationRepository } from './person-association-relation.repository';

@Injectable()
export class AssociationRelationsRepository {
  constructor(
    private readonly cbdbConnection: CbdbConnectionService,
    private readonly personAssociationRelation: PersonAssociationRelationRepository
  ) {}

  /**
   * Get complete association network for a person
   * Includes all dimensions: direct associations, kinship context, tertiary persons
   */
  async getCompleteNetwork(personId: number) {
    const db = this.cbdbConnection.getDb();

    // Get all associations where person is involved
    const associations = await db
      .select({
        assocData: ASSOC_DATA,
        assocCode: ASSOC_CODES,
        primaryPerson: BIOG_MAIN,
        kinshipCode: KINSHIP_CODES
      })
      .from(ASSOC_DATA)
      .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
      .leftJoin(BIOG_MAIN, eq(ASSOC_DATA.c_assoc_id, BIOG_MAIN.c_personid))
      .leftJoin(KINSHIP_CODES, eq(ASSOC_DATA.c_assoc_kin_code, KINSHIP_CODES.c_kincode))
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .all();

    return associations;
  }

  /**
   * Find association chains (person → association → association)
   * Useful for understanding indirect relationships
   */
  async findAssociationChains(personId: number, depth: number = 2) {
    const db = this.cbdbConnection.getDb();

    // First level: direct associations
    const directAssocs = await db
      .select({
        assocId: sql<number>`CASE
          WHEN ${ASSOC_DATA.c_personid} = ${personId} THEN ${ASSOC_DATA.c_assoc_id}
          ELSE ${ASSOC_DATA.c_personid}
        END`
      })
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .all();

    if (depth === 1 || directAssocs.length === 0) {
      return { level1: directAssocs, level2: [] };
    }

    const directIds = directAssocs.map(a => a.assocId).filter(Boolean);

    // Second level: associations of associations
    const secondLevel = await db
      .select({
        personId: ASSOC_DATA.c_personid,
        assocId: ASSOC_DATA.c_assoc_id,
        assocCode: ASSOC_DATA.c_assoc_code
      })
      .from(ASSOC_DATA)
      .where(or(
        inArray(ASSOC_DATA.c_personid, directIds),
        inArray(ASSOC_DATA.c_assoc_id, directIds)
      ))
      .all();

    return {
      level1: directAssocs,
      level2: secondLevel
    };
  }

  /**
   * Get associations grouped by document/text context
   * Many associations are documented in specific texts
   */
  async getAssociationsByTextContext(personId: number) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        textTitle: ASSOC_DATA.c_text_title,
        count: sql<number>`count(*)`,
        assocIds: sql<string>`group_concat(CASE
          WHEN ${ASSOC_DATA.c_personid} = ${personId} THEN ${ASSOC_DATA.c_assoc_id}
          ELSE ${ASSOC_DATA.c_personid}
        END)`
      })
      .from(ASSOC_DATA)
      .where(and(
        or(
          eq(ASSOC_DATA.c_personid, personId),
          eq(ASSOC_DATA.c_assoc_id, personId)
        )
      ))
      .groupBy(ASSOC_DATA.c_text_title)
      .all();

    return results.map(row => {
      const ids = row.assocIds
        ? row.assocIds.split(',').map(Number).filter(Boolean)
        : [];

      return {
        textTitle: row.textTitle,
        associationCount: row.count,
        associatedPersonIds: ids
      };
    });
  }

  /**
   * Find mutual associations (people who share multiple association types)
   */
  async findMutualAssociations(personId1: number, personId2: number) {
    const db = this.cbdbConnection.getDb();

    // Find all association types between these two people
    const results = await db
      .select({
        assocCode: ASSOC_DATA.c_assoc_code,
        kinshipCode: ASSOC_DATA.c_assoc_kin_code,
        textTitle: ASSOC_DATA.c_text_title
      })
      .from(ASSOC_DATA)
      .where(or(
        and(
          eq(ASSOC_DATA.c_personid, personId1),
          eq(ASSOC_DATA.c_assoc_id, personId2)
        ),
        and(
          eq(ASSOC_DATA.c_personid, personId2),
          eq(ASSOC_DATA.c_assoc_id, personId1)
        )
      ))
      .all();

    return results;
  }

  /**
   * Get association statistics across all dimensions
   */
  async getMultiDimensionalStats(personId: number) {
    const [
      basicStats,
      byType,
      withKinship,
      asPrimary,
      asAssociated
    ] = await Promise.all([
      this.personAssociationRelation.getStatsSummary(personId),
      this.personAssociationRelation.getStatsByType(personId),
      this.personAssociationRelation.getStatsWithKinshipContext(personId),
      this.personAssociationRelation.getStatsByDirection(personId, 'primary'),
      this.personAssociationRelation.getStatsByDirection(personId, 'associated')
    ]);

    return {
      summary: basicStats,
      byType,
      withKinshipContext: withKinship,
      direction: {
        asPrimary,
        asAssociated
      }
    };
  }

  /**
   * Find association clusters (groups of people with dense interconnections)
   */
  async findAssociationClusters(personId: number) {
    const db = this.cbdbConnection.getDb();

    // Get all people associated with the target person
    const firstDegree = await db
      .select({
        personId: sql<number>`CASE
          WHEN ${ASSOC_DATA.c_personid} = ${personId} THEN ${ASSOC_DATA.c_assoc_id}
          ELSE ${ASSOC_DATA.c_personid}
        END`,
        assocCode: ASSOC_DATA.c_assoc_code
      })
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .all();

    const personIds = [...new Set(firstDegree.map(a => a.personId).filter(Boolean))];

    if (personIds.length === 0) {
      return { clusters: [] };
    }

    // Find interconnections between these people
    const interconnections = await db
      .select({
        person1: ASSOC_DATA.c_personid,
        person2: ASSOC_DATA.c_assoc_id,
        assocCode: ASSOC_DATA.c_assoc_code
      })
      .from(ASSOC_DATA)
      .where(and(
        inArray(ASSOC_DATA.c_personid, personIds),
        inArray(ASSOC_DATA.c_assoc_id, personIds)
      ))
      .all();

    // Group by association type to identify clusters
    const clusters = new Map<number, Set<number>>();

    interconnections.forEach(conn => {
      if (!clusters.has(conn.assocCode)) {
        clusters.set(conn.assocCode, new Set());
      }
      clusters.get(conn.assocCode)!.add(conn.person1);
      clusters.get(conn.assocCode)!.add(conn.person2);
    });

    return {
      clusters: Array.from(clusters.entries()).map(([code, members]) => ({
        associationCode: code,
        memberCount: members.size,
        members: Array.from(members)
      }))
    };
  }

  /**
   * Analyze association patterns over time
   */
  async getTemporalAssociationPatterns(personId: number) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        year: ASSOC_DATA.c_assoc_first_year,
        count: sql<number>`count(*)`,
        assocCodes: sql<string>`group_concat(${ASSOC_DATA.c_assoc_code})`
      })
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .groupBy(ASSOC_DATA.c_assoc_first_year)
      .orderBy(ASSOC_DATA.c_assoc_first_year)
      .all();

    return results.map(row => ({
      year: row.year,
      associationCount: row.count,
      associationTypes: row.assocCodes
        ? [...new Set(row.assocCodes.split(',').map(Number))]
        : []
    }));
  }
}