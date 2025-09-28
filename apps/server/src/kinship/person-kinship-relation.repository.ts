/**
 * Repository for Person-to-Kinship Relations
 *
 * Purpose: Pure data access layer for kinship relationships in CBDB
 * Pattern: Composable query methods without domain logic
 *
 * Key Responsibilities:
 * - Fetching kinship data with various joins and filters
 * - Providing statistical aggregations
 * - Supporting network traversal for relationship discovery
 *
 * Design Principles:
 * - NO domain logic (that belongs in service layer)
 * - NO assumptions about kinship semantics
 * - Pure SQL/Drizzle queries that return raw data
 * - Composable methods that can be combined for complex queries
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, inArray, count, or, desc } from 'drizzle-orm';
import {
  KIN_DATA,
  KINSHIP_CODES,
  BIOG_MAIN,
  TEXT_CODES,
  cbdbMapper,
  type Kinship,
  type KinshipDataWithRelations,
  KinshipWithFullRelations,
  KinshipTypeInfo,
  KinPersonInfo,
  KinshipSourceTextInfo,
  RelationStat,
  KinshipFilterOptions,
  DEFAULT_KINSHIP_FILTERS,
  KinshipPathInfo,
  KinshipNetworkNode
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

// Kinship code constants from CBDB database
// These are the actual numeric codes stored in c_kin_code field
const KINSHIP_CODE = {
  // Parent generation
  FATHER: 75,
  MOTHER: 111,

  // Child generation
  SON: 180,
  DAUGHTER_1: 327,
  DAUGHTER_2: 328,

  // Siblings
  BROTHER_OLDER: 125,
  BROTHER_YOUNGER: 126,
  SISTER_OLDER: 48,
  SISTER_YOUNGER: 55,

  // Spouse relationships
  WIFE: 135,
  HUSBAND: 136
} as const;

// Relationship categories for filtering
const KINSHIP_CATEGORIES = {
  PARENTS: [KINSHIP_CODE.FATHER, KINSHIP_CODE.MOTHER],
  CHILDREN: [KINSHIP_CODE.SON, KINSHIP_CODE.DAUGHTER_1, KINSHIP_CODE.DAUGHTER_2],
  SIBLINGS: [
    KINSHIP_CODE.BROTHER_OLDER,
    KINSHIP_CODE.BROTHER_YOUNGER,
    KINSHIP_CODE.SISTER_OLDER,
    KINSHIP_CODE.SISTER_YOUNGER
  ],
  SPOUSES: [KINSHIP_CODE.WIFE, KINSHIP_CODE.HUSBAND],

  // Traditional mourning circle (五服) - close family members
  MOURNING_CIRCLE: [
    KINSHIP_CODE.FATHER, KINSHIP_CODE.MOTHER,
    KINSHIP_CODE.SON, KINSHIP_CODE.DAUGHTER_1, KINSHIP_CODE.DAUGHTER_2,
    KINSHIP_CODE.BROTHER_OLDER, KINSHIP_CODE.BROTHER_YOUNGER,
    KINSHIP_CODE.SISTER_OLDER, KINSHIP_CODE.SISTER_YOUNGER,
    KINSHIP_CODE.WIFE, KINSHIP_CODE.HUSBAND
  ]
} as const;

@Injectable()
export class PersonKinshipRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) { }

  /**
   * Get summary statistics for all kinship relations of a person
   *
   * @param personId - The CBDB person ID to get stats for
   * @returns RelationStat containing:
   *   - count: Total number of kinship relations
   *   - relatedPersonIds: Array of all related person IDs
   *   - tableName: Source table identifier ('KIN_DATA')
   *
   * @example
   * const stats = await repo.getStatsSummary(1762); // Wang Anshi
   * console.log(`${stats.count} total relations`);
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const aggregatedStats = await db
      .select({
        totalRelations: count().as('count'),
        concatenatedIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`  // SQLite-specific aggregation
      })
      .from(KIN_DATA)
      .where(eq(KIN_DATA.c_personid, personId))
      .get();

    // Parse comma-separated IDs into array
    const relatedPersonIds = aggregatedStats?.concatenatedIds
      ? aggregatedStats.concatenatedIds
        .split(',')
        .map(Number)
        .filter(Boolean)  // Remove any NaN values
      : [];

    return new RelationStat(
      aggregatedStats?.totalRelations ?? 0,
      relatedPersonIds,
      'KIN_DATA'
    );
  }

  /**
   * Get statistics grouped by kinship type (father, mother, son, etc.)
   *
   * @param personId - The CBDB person ID to analyze
   * @returns Array of RelationStat objects, one for each kinship type found
   *   Each stat includes the kinship code and Chinese description as metadata
   *
   * Query Strategy: Two-step approach for optimal performance
   *   1. Aggregate stats by kinship code (single table query)
   *   2. Fetch descriptions only for codes that exist (targeted lookup)
   *   3. Join results in memory (O(1) hashmap lookup)
   *
   * @example
   * const typeStats = await repo.getStatsByType(1762);
   * // Returns: [{ count: 3, ids: [...], tableName: 'KIN_DATA:75', kinshipType: '父' }, ...]
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    // Step 1: Aggregate kinship statistics by type code
    const kinshipStatsByCode = await db
      .select({
        kinshipCode: KIN_DATA.c_kin_code,
        occurrenceCount: count(),
        relatedPersonIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`
      })
      .from(KIN_DATA)
      .where(eq(KIN_DATA.c_personid, personId))
      .groupBy(KIN_DATA.c_kin_code)
      .all();

    if (kinshipStatsByCode.length === 0) {
      return [];
    }

    // Step 2: Extract unique codes for description lookup
    const uniqueKinshipCodes = [...new Set(kinshipStatsByCode.map(stat => stat.kinshipCode))];

    // Step 3: Fetch descriptions for only the codes we found
    const kinshipDescriptions = await db
      .select({
        code: KINSHIP_CODES.c_kincode,
        description: KINSHIP_CODES.c_kinrel_chn
      })
      .from(KINSHIP_CODES)
      .where(
        uniqueKinshipCodes.length === 1
          ? eq(KINSHIP_CODES.c_kincode, uniqueKinshipCodes[0])
          : or(...uniqueKinshipCodes.map(code => eq(KINSHIP_CODES.c_kincode, code)))
      )
      .all();

    // Step 4: Build hashmap for O(1) description lookups
    const codeToDescriptionMap = new Map(
      kinshipDescriptions.map(kinship => [kinship.code, kinship.description])
    );

    // Step 5: Combine stats with descriptions
    return kinshipStatsByCode.map(statRow => {
      // Parse concatenated person IDs
      const personIdArray = statRow.relatedPersonIds
        ? statRow.relatedPersonIds
          .split(',')
          .map(Number)
          .filter(Boolean)  // Remove invalid numbers
        : [];

      // Create stat with kinship code embedded in table identifier
      const relationStat = new RelationStat(
        statRow.occurrenceCount,
        personIdArray,
        `KIN_DATA:${statRow.kinshipCode}`  // Encodes the kinship type in tableName
      );

      // Attach metadata for client consumption
      // Safe augmentation - not domain logic, just data enrichment
      (relationStat as any).kinshipType = codeToDescriptionMap.get(statRow.kinshipCode) || null;
      (relationStat as any).kinshipCode = statRow.kinshipCode;

      return relationStat;
    });
  }

  /**
   * Get statistics filtered by generation direction
   *
   * @param personId - The CBDB person ID to analyze
   * @param direction - 'ancestors' for parents/grandparents, 'descendants' for children/grandchildren
   * @returns RelationStat for the specified generation direction
   *
   * Note: Currently only handles direct parents/children.
   * Multi-generation traversal would require recursive queries.
   *
   * @example
   * const ancestors = await repo.getStatsByGeneration(1762, 'ancestors');
   * const descendants = await repo.getStatsByGeneration(1762, 'descendants');
   */
  async getStatsByGeneration(
    personId: number,
    direction: 'ancestors' | 'descendants'
  ): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    // Select appropriate kinship codes based on direction
    const targetKinshipCodes = direction === 'ancestors'
      ? KINSHIP_CATEGORIES.PARENTS
      : KINSHIP_CATEGORIES.CHILDREN;

    // Query with filtered kinship codes
    const filteredStats = await db
      .select({
        count: count().as('count'),
        kinPersonIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`
      })
      .from(KIN_DATA)
      .where(and(
        eq(KIN_DATA.c_personid, personId),
        inArray(KIN_DATA.c_kin_code, targetKinshipCodes)
      ))
      .get();

    const ids = filteredStats?.kinPersonIds
      ? filteredStats.kinPersonIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      filteredStats?.count ?? 0,
      ids,
      `KIN_DATA:${direction}`
    );
  }

  /**
   * Get statistics for traditional mourning circle relations (五服 wǔfú)
   *
   * The mourning circle defines degrees of kinship for ritual obligations
   * in traditional Chinese culture. Includes close family members
   * within five degrees of relationship.
   *
   * @param personId - The CBDB person ID to analyze
   * @returns RelationStat for mourning circle members
   *
   * @example
   * const mourningRelations = await repo.getStatsForMourning(1762);
   * // Returns stats for parents, children, siblings, and spouses
   */
  async getStatsForMourning(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    // Query using predefined mourning circle codes
    const mourningStats = await db
      .select({
        count: count().as('count'),
        kinPersonIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`
      })
      .from(KIN_DATA)
      .where(and(
        eq(KIN_DATA.c_personid, personId),
        inArray(KIN_DATA.c_kin_code, KINSHIP_CATEGORIES.MOURNING_CIRCLE)
      ))
      .get();

    const relatedPersonIds = mourningStats?.kinPersonIds
      ? mourningStats.kinPersonIds
        .split(',')
        .map(Number)
        .filter(Boolean)
      : [];

    return new RelationStat(
      mourningStats?.count ?? 0,
      relatedPersonIds,
      'KIN_DATA:mourning'
    );
  }

  /**
   * Get statistics for blood relations only
   *
   * Filters out marriage and in-law relationships to show only
   * consanguineous (blood) relationships.
   *
   * @param personId - The CBDB person ID to analyze
   * @returns RelationStat excluding spouse and in-law relationships
   *
   * @example
   * const bloodRelations = await repo.getStatsBloodRelations(1762);
   * // Returns parents, children, siblings, but not spouses
   */
  async getStatsBloodRelations(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    // Note: Drizzle doesn't have notInArray, using SQL template
    const bloodRelationStats = await db
      .select({
        count: count().as('count'),
        kinPersonIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`
      })
      .from(KIN_DATA)
      .where(and(
        eq(KIN_DATA.c_personid, personId),
        sql`${KIN_DATA.c_kin_code} NOT IN (${KINSHIP_CATEGORIES.SPOUSES.join(', ')})`
      ))
      .get();

    const personIdArray = bloodRelationStats?.kinPersonIds
      ? bloodRelationStats.kinPersonIds
        .split(',')
        .map(Number)
        .filter(Boolean)
      : [];

    return new RelationStat(
      bloodRelationStats?.count ?? 0,
      personIdArray,
      'KIN_DATA:blood'
    );
  }

  /**
   * Get statistics for marriage and affinal relationships
   *
   * Includes spouses and potentially in-law relationships
   * (depending on available kinship codes in CBDB).
   *
   * @param personId - The CBDB person ID to analyze
   * @returns RelationStat for marriage-based relationships
   *
   * @example
   * const marriages = await repo.getStatsMarriageRelations(1762);
   * // Returns spouse relationships
   */
  async getStatsMarriageRelations(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const marriageStats = await db
      .select({
        count: count().as('count'),
        kinPersonIds: sql<string>`group_concat(${KIN_DATA.c_kin_id})`
      })
      .from(KIN_DATA)
      .where(and(
        eq(KIN_DATA.c_personid, personId),
        inArray(KIN_DATA.c_kin_code, KINSHIP_CATEGORIES.SPOUSES)
      ))
      .get();

    const spouseIds = marriageStats?.kinPersonIds
      ? marriageStats.kinPersonIds
        .split(',')
        .map(Number)
        .filter(Boolean)
      : [];

    return new RelationStat(
      marriageStats?.count ?? 0,
      spouseIds,
      'KIN_DATA:marriage'
    );
  }

  /**
   * Get direct kinship relations only (no reciprocal or derived)
   *
   * Returns only the kinship relationships where the person is the subject.
   * This matches Harvard's CBDB API behavior which only returns direct relationships.
   *
   * @param personId - The CBDB person ID to get direct relations for
   * @returns Array of KinshipWithFullRelations for direct relationships only
   *
   * @example
   * const directRelations = await repo.getDirectRelations(1762);
   * // Returns only 25 direct kinships for Wang Anshi (matching Harvard API)
   */
  async getDirectRelations(personId: number): Promise<KinshipWithFullRelations[]> {
    const db = this.cbdbConnection.getDb();

    // Only direct relationships (ego as subject)
    const directRelationships = await db
      .select({
        kinData: KIN_DATA,
        kinshipCode: KINSHIP_CODES,
        kinPerson: BIOG_MAIN,
        sourceText: TEXT_CODES
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .leftJoin(TEXT_CODES, eq(KIN_DATA.c_source, TEXT_CODES.c_textid))
      .where(eq(KIN_DATA.c_personid, personId))
      .all();

    // Map to KinshipWithFullRelations (same as full relations but without reciprocal)
    return directRelationships.map(row => {
      // Create base kinship entity with all fields (matching the full constructor)
      const kinshipEntity = new KinshipWithFullRelations(
        row.kinData.c_personid,
        row.kinData.c_kin_id,
        row.kinData.c_kin_code,
        row.kinData.c_source || null,
        row.kinData.c_pages ? String(row.kinData.c_pages) : null,
        row.kinData.c_notes ? String(row.kinData.c_notes) : null,
        row.kinData.c_autogen_notes ? String(row.kinData.c_autogen_notes) : null,
        row.kinData.c_created_by ? String(row.kinData.c_created_by) : null,
        row.kinData.c_created_date ? String(row.kinData.c_created_date) : null,
        row.kinData.c_modified_by ? String(row.kinData.c_modified_by) : null,
        row.kinData.c_modified_date ? String(row.kinData.c_modified_date) : null
      );

      // Attach kinship type metadata if available
      if (row.kinshipCode) {
        kinshipEntity.kinshipTypeInfo = new KinshipTypeInfo(
          row.kinshipCode.c_kincode || 0,
          row.kinshipCode.c_kinrel || null,
          row.kinshipCode.c_kinrel_chn || null
        );
      }

      // Attach related person biographical data if available
      if (row.kinPerson) {
        kinshipEntity.kinPersonInfo = new KinPersonInfo(
          row.kinPerson.c_personid,
          row.kinPerson.c_name || null,
          row.kinPerson.c_name_chn || null,
          row.kinPerson.c_index_year || null,
          row.kinPerson.c_birthyear || null,
          row.kinPerson.c_deathyear || null
        );
      }

      // Attach source text information if available
      if (row.sourceText) {
        kinshipEntity.sourceTextInfo = new KinshipSourceTextInfo(
          row.sourceText.c_textid,
          row.sourceText.c_title_chn ? String(row.sourceText.c_title_chn) : null,
          row.sourceText.c_title ? String(row.sourceText.c_title) : null
        );
      }

      return kinshipEntity;
    });
  }

  /**
   * Get comprehensive kinship relations with all metadata
   *
   * This method replicates Microsoft Access database behavior by returning:
   * 1. Direct relationships (person as subject)
   * 2. Reciprocal relationships (person as object) - OPTIONAL
   * 3. Derived relationships (in-laws via direct relations) - OPTIONAL
   *
   * @param personId - The CBDB person ID to get full relations for
   * @param options - Options to control which relationships to include
   * @returns Array of KinshipWithFullRelations including type info and person details
   *
   * Query Strategy: Three-part approach
   *   - Direct: WHERE c_personid = personId
   *   - Reciprocal: WHERE c_kin_id = personId (optional)
   *   - Derived: Relations of related persons (for in-laws) (optional)
   *
   * @example
   * const fullRelations = await repo.getFullRelations(1762);
   * // Returns comprehensive kinship data with all metadata
   *
   * const directOnly = await repo.getFullRelations(1762, { includeReciprocal: false, includeDerived: false });
   * // Returns only direct relationships (like Harvard API)
   */
  async getFullRelations(
    personId: number,
    options: { includeReciprocal?: boolean; includeDerived?: boolean } = {
      includeReciprocal: true,
      includeDerived: true
    }
  ): Promise<KinshipWithFullRelations[]> {
    const db = this.cbdbConnection.getDb();

    // Part 1: Direct relationships (ego as subject)
    const directRelationships = await db
      .select({
        kinData: KIN_DATA,
        kinshipCode: KINSHIP_CODES,
        kinPerson: BIOG_MAIN
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .where(eq(KIN_DATA.c_personid, personId))
      .all();

    // Part 2: Reciprocal relationships (ego as object) - OPTIONAL
    let reciprocalRelationships: typeof directRelationships = [];
    if (options.includeReciprocal !== false) {
      // These are people who claim kinship with the target person
      reciprocalRelationships = await db
        .select({
          kinData: KIN_DATA,
          kinshipCode: KINSHIP_CODES,
          kinPerson: BIOG_MAIN
        })
        .from(KIN_DATA)
        .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
        .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_personid, BIOG_MAIN.c_personid))
        .where(eq(KIN_DATA.c_kin_id, personId))
        .all();
    }

    // Part 3: Derived relationships (in-laws through direct relations) - OPTIONAL
    let derivedRelationships: typeof directRelationships = [];
    if (options.includeDerived !== false) {
      // Step 3.1: First get IDs of directly related persons
      const directlyRelatedPersons = await db
        .select({
          relatedId: KIN_DATA.c_kin_id,
          kinshipCode: KIN_DATA.c_kin_code
        })
        .from(KIN_DATA)
        .where(eq(KIN_DATA.c_personid, personId))
        .all();

      // Step 3.2: Query relationships of those directly related persons
      if (directlyRelatedPersons.length > 0) {
        // Extract valid person IDs (filter nulls)
        const validRelatedIds = directlyRelatedPersons
          .map(relation => relation.relatedId)
          .filter((id): id is number => id !== null);

        if (validRelatedIds.length > 0) {
          // Find spouses and parents of related persons (in-laws)
          // This gives us son-in-law, daughter-in-law, parents-in-law, etc.
          const inLawCodes = [
            ...KINSHIP_CATEGORIES.SPOUSES,  // Spouses of children
            ...KINSHIP_CATEGORIES.PARENTS   // Parents of spouses
          ];

          derivedRelationships = await db
            .select({
              kinData: KIN_DATA,
              kinshipCode: KINSHIP_CODES,
              kinPerson: BIOG_MAIN
            })
            .from(KIN_DATA)
            .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
            .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
            .where(and(
              inArray(KIN_DATA.c_personid, validRelatedIds),
              sql`${KIN_DATA.c_kin_id} != ${personId}`,  // Exclude circular references
              inArray(KIN_DATA.c_kin_code, inLawCodes)
            ))
            .all();
        }
      }
    }

    // Combine relationship types based on options
    const comprehensiveRelations = [
      ...directRelationships,
      ...reciprocalRelationships,
      ...derivedRelationships
    ];

    // Transform raw results to domain models
    return comprehensiveRelations.map(row => {
      // Create base kinship entity with all fields
      const kinshipEntity = new KinshipWithFullRelations(
        row.kinData.c_personid,
        row.kinData.c_kin_id,
        row.kinData.c_kin_code,
        row.kinData.c_source || null,
        row.kinData.c_pages ? String(row.kinData.c_pages) : null,
        row.kinData.c_notes ? String(row.kinData.c_notes) : null,
        row.kinData.c_autogen_notes ? String(row.kinData.c_autogen_notes) : null,
        row.kinData.c_created_by ? String(row.kinData.c_created_by) : null,
        row.kinData.c_created_date ? String(row.kinData.c_created_date) : null,
        row.kinData.c_modified_by ? String(row.kinData.c_modified_by) : null,
        row.kinData.c_modified_date ? String(row.kinData.c_modified_date) : null
      );

      // Attach kinship type metadata if available
      if (row.kinshipCode) {
        kinshipEntity.kinshipTypeInfo = new KinshipTypeInfo(
          row.kinshipCode.c_kincode || 0,
          row.kinshipCode.c_kinrel || null,
          row.kinshipCode.c_kinrel_chn || null
        );
      }

      // Attach related person biographical data if available
      if (row.kinPerson) {
        kinshipEntity.kinPersonInfo = new KinPersonInfo(
          row.kinPerson.c_personid,
          row.kinPerson.c_name || null,
          row.kinPerson.c_name_chn || null,
          row.kinPerson.c_index_year || null,
          row.kinPerson.c_birthyear || null,
          row.kinPerson.c_deathyear || null
        );
      }

      return kinshipEntity;
    });
  }

  /**
   * Get direct kinships for a person (where person is the subject)
   * Pure query method - no filtering
   */
  async getDirectKinships(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    return db
      .select({
        personId: KIN_DATA.c_personid,
        kinPersonId: KIN_DATA.c_kin_id,
        kinshipCode: KIN_DATA.c_kin_code,
        kinshipType: KINSHIP_CODES.c_kinrel,
        kinshipTypeChn: KINSHIP_CODES.c_kinrel_chn,
        name: BIOG_MAIN.c_name,
        nameChn: BIOG_MAIN.c_name_chn,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .where(eq(KIN_DATA.c_personid, personId))
      .all();
  }

  /**
   * Get reciprocal kinships (where person is the related party)
   * Returns the people who claim kinship with this person
   * Pure query method - no filtering
   */
  async getReciprocalKinships(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    return db
      .select({
        personId: KIN_DATA.c_kin_id,  // Swap these since we're looking from the other direction
        kinPersonId: KIN_DATA.c_personid,  // This is the person making the claim
        kinshipCode: KIN_DATA.c_kin_code,
        kinshipType: KINSHIP_CODES.c_kinrel,
        kinshipTypeChn: KINSHIP_CODES.c_kinrel_chn,
        name: BIOG_MAIN.c_name,
        nameChn: BIOG_MAIN.c_name_chn,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_personid, BIOG_MAIN.c_personid))  // Join on the person making the claim
      .where(eq(KIN_DATA.c_kin_id, personId))
      .all();
  }

  /**
   * Get kinships for multiple person IDs in batch
   * Efficient batch query to avoid N+1 problem
   */
  async getKinshipsByPersonIds(personIds: number[]): Promise<any[]> {
    if (personIds.length === 0) return [];

    const db = this.cbdbConnection.getDb();

    return db
      .select({
        personId: KIN_DATA.c_personid,
        kinPersonId: KIN_DATA.c_kin_id,
        kinshipCode: KIN_DATA.c_kin_code,
        kinshipType: KINSHIP_CODES.c_kinrel,
        kinshipTypeChn: KINSHIP_CODES.c_kinrel_chn,
        name: BIOG_MAIN.c_name,
        nameChn: BIOG_MAIN.c_name_chn,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .where(inArray(KIN_DATA.c_personid, personIds))
      .all();
  }

  /**
   * Get kinship relationships with related person info
   * Pure query returning raw data with joins
   */
  async getKinshipsWithPersonInfo(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    return db
      .select({
        // Kinship data
        personId: KIN_DATA.c_personid,
        kinPersonId: KIN_DATA.c_kin_id,
        kinshipCode: KIN_DATA.c_kin_code,
        source: KIN_DATA.c_source,
        pages: KIN_DATA.c_pages,
        notes: KIN_DATA.c_notes,
        // Kinship type info
        kinshipType: KINSHIP_CODES.c_kinrel,
        kinshipTypeChn: KINSHIP_CODES.c_kinrel_chn,
        // Related person info
        kinPersonName: BIOG_MAIN.c_name,
        kinPersonNameChn: BIOG_MAIN.c_name_chn,
        kinPersonBirthYear: BIOG_MAIN.c_birthyear,
        kinPersonDeathYear: BIOG_MAIN.c_deathyear,
        kinPersonDynasty: BIOG_MAIN.c_dy
      })
      .from(KIN_DATA)
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .where(eq(KIN_DATA.c_personid, personId))
      .all();
  }

  /**
   * Get all persons related through kinship to multiple persons
   * Useful for finding common relatives
   */
  async getCommonKinships(personIds: number[]): Promise<any[]> {
    if (personIds.length === 0) return [];

    const db = this.cbdbConnection.getDb();

    // Use native count() function
    return db
      .select({
        kinPersonId: KIN_DATA.c_kin_id,
        relatedToPersons: sql<string>`group_concat(${KIN_DATA.c_personid})`,  // No native equivalent
        relationshipCodes: sql<string>`group_concat(${KIN_DATA.c_kin_code})`,  // No native equivalent
        count: count().as('count')
      })
      .from(KIN_DATA)
      .where(inArray(KIN_DATA.c_personid, personIds))
      .groupBy(KIN_DATA.c_kin_id)
      .having(sql`count(*) > 1`)  // Having clause needs raw SQL
      .all();
  }

  /**
   * Find all relationship paths between two persons
   *
   * Uses breadth-first search to discover kinship chains connecting
   * two individuals. Useful for determining relationship degree.
   *
   * @param personA - Starting person ID
   * @param personB - Target person ID to find
   * @param maxDepth - Maximum relationship degrees to traverse (default: 3)
   * @returns Array of paths, each containing:
   *   - path: Array of step objects with fromPerson, toPerson, kinshipCode
   *   - distance: Number of steps in the path
   *
   * Implementation Note: Uses BFS instead of recursive CTE due to SQLite limitations.
   * Tracks visited edges to prevent cycles.
   *
   * @example
   * const paths = await repo.getKinshipPaths(1762, 1763, 3);
   * // Finds how person 1762 is related to person 1763
   */
  async getKinshipPaths(personA: number, personB: number, maxDepth: number = 3): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    // BFS implementation for path finding
    const discoveredPaths: any[] = [];
    const visitedEdges = new Set<string>();  // Track visited edges to prevent cycles

    type SearchState = {
      currentPersonId: number;
      pathTaken: Array<{
        fromPerson: number;
        toPerson: number;
        kinshipCode: number;
      }>;
    };

    // Initialize search from personA
    const searchQueue: SearchState[] = [{
      currentPersonId: personA,
      pathTaken: []
    }];

    // Breadth-first search through kinship network
    while (searchQueue.length > 0) {
      const currentState = searchQueue.shift()!;

      // Skip if we've exceeded maximum depth
      if (currentState.pathTaken.length >= maxDepth) continue;

      // Query all kinship edges from current person
      const outgoingRelations = await db
        .select({
          kinPersonId: KIN_DATA.c_kin_id,
          kinshipCode: KIN_DATA.c_kin_code
        })
        .from(KIN_DATA)
        .where(eq(KIN_DATA.c_personid, currentState.currentPersonId))
        .all();

      // Process each outgoing kinship relation
      for (const relation of outgoingRelations) {
        if (!relation.kinPersonId) continue;

        // Build the new step in the path
        const relationshipStep = {
          fromPerson: currentState.currentPersonId,
          toPerson: relation.kinPersonId,
          kinshipCode: relation.kinshipCode
        };

        const extendedPath = [...currentState.pathTaken, relationshipStep];

        // Check if we've reached the target
        if (relation.kinPersonId === personB) {
          discoveredPaths.push({
            path: extendedPath,
            distance: extendedPath.length
          });
        }

        // Continue searching if edge not visited
        const edgeIdentifier = `${currentState.currentPersonId}-${relation.kinPersonId}`;
        if (!visitedEdges.has(edgeIdentifier)) {
          visitedEdges.add(edgeIdentifier);
          searchQueue.push({
            currentPersonId: relation.kinPersonId,
            pathTaken: extendedPath
          });
        }
      }
    }

    return discoveredPaths;
  }

  /**
   * Build kinship network through breadth-first traversal
   *
   * Expands outward from a person to discover all reachable relatives
   * within a specified degree of separation. Returns raw network data
   * for the service layer to filter according to domain rules.
   *
   * @param personId - Central person (ego) to build network from
   * @param maxDepth - Maximum degrees of separation to traverse (default: 3)
   * @returns Array of network nodes containing:
   *   - personId, names, birth/death years
   *   - distance: Degrees from ego
   *   - pathFromEgo: Array of kinship codes traversed
   *   - immediateRelation: Direct connection details
   *
   * Performance: Limited to 100K nodes for safety.
   * Uses shortest-path optimization.
   *
   * @example
   * const network = await repo.getKinshipNetwork(1762, 2);
   * // Returns all relatives within 2 degrees of person 1762
   */
  async getKinshipNetwork(
    personId: number,
    maxDepth: number = 3
  ): Promise<any[]> {
    // Data structures for network building
    const processedPersons = new Set<number>();  // Track processed to avoid re-processing
    const kinshipNetwork = new Map<number, any>();  // Store network nodes by person ID

    type NetworkTraversalState = {
      personId: number;
      distanceFromEgo: number;
      kinshipPath: number[];  // Sequence of kinship codes from ego
    };

    // Initialize traversal from ego
    const traversalQueue: NetworkTraversalState[] = [{
      personId,
      distanceFromEgo: 0,
      kinshipPath: []
    }];

    // Breadth-first network expansion
    const MAX_NETWORK_SIZE = 100000;  // Safety limit to prevent runaway expansion
    while (traversalQueue.length > 0 && kinshipNetwork.size < MAX_NETWORK_SIZE) {
      const currentNode = traversalQueue.shift()!;

      // Skip already processed persons
      if (processedPersons.has(currentNode.personId)) {
        continue;
      }
      processedPersons.add(currentNode.personId);

      // Stop expanding at maximum depth
      if (currentNode.distanceFromEgo >= maxDepth) {
        continue;
      }

      // Fetch all kinship relations for current person (both directions)
      // Include direct relations (current as subject) and reciprocal relations (current as object)
      const [directRelations, reciprocalRelations] = await Promise.all([
        this.getKinshipsByPersonIds([currentNode.personId]),
        this.getReciprocalKinships(currentNode.personId)
      ]);
      const relationsFromPerson = [...directRelations, ...reciprocalRelations];

      // Process each discovered relation
      for (const relation of relationsFromPerson) {
        const connectedPersonId = relation.kinPersonId;

        // Skip invalid or self-references
        if (!connectedPersonId || connectedPersonId === currentNode.personId) continue;

        const extendedDistance = currentNode.distanceFromEgo + 1;
        const extendedPath = [...currentNode.kinshipPath, relation.kinshipCode];

        // Check for existing entry (shortest path optimization)
        const existingEntry = kinshipNetwork.get(connectedPersonId);

        // Add new node or update with shorter path
        if (!existingEntry || existingEntry.distance > extendedDistance) {
          const networkNode = {
            personId: connectedPersonId,
            personName: relation.name,
            personNameChn: relation.nameChn,
            birthYear: relation.birthYear,
            deathYear: relation.deathYear,
            distance: extendedDistance,
            pathFromEgo: extendedPath,
            immediateRelation: {
              fromPersonId: currentNode.personId,
              kinshipCode: relation.kinshipCode,
              kinshipType: relation.kinshipType,
              kinshipTypeChn: relation.kinshipTypeChn
            }
          };

          kinshipNetwork.set(connectedPersonId, networkNode);

          // Queue for further expansion if within depth limit
          if (extendedDistance < maxDepth && !processedPersons.has(connectedPersonId)) {
            traversalQueue.push({
              personId: connectedPersonId,
              distanceFromEgo: extendedDistance,
              kinshipPath: extendedPath
            });
          }
        }
      }
    }

    // Include ego node at the beginning of results
    const egoNode = {
      personId,
      personName: null,      // Will be populated by service layer if needed
      personNameChn: null,   // Will be populated by service layer if needed
      birthYear: null,       // Will be populated by service layer if needed
      deathYear: null,       // Will be populated by service layer if needed
      distance: 0,           // Ego is at distance 0 from self
      pathFromEgo: [],       // No path needed to reach self
      immediateRelation: null // No immediate relation for ego
    };

    // Return ego plus all discovered network members
    return [egoNode, ...Array.from(kinshipNetwork.values())];
  }

  /**
   * Get all kinship relations of a specific type
   *
   * @param personId - The CBDB person ID
   * @param kinshipCode - Numeric kinship type code (e.g., 75 for father)
   * @returns Array of kinship records matching the type
   *
   * @example
   * const fathers = await repo.getKinshipsByType(1762, KINSHIP_CODE.FATHER);
   * const wives = await repo.getKinshipsByType(1762, KINSHIP_CODE.WIFE);
   */
  async getKinshipsByType(personId: number, kinshipCode: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    return db
      .select({
        personId: KIN_DATA.c_personid,
        kinPersonId: KIN_DATA.c_kin_id,
        kinshipCode: KIN_DATA.c_kin_code,
        source: KIN_DATA.c_source,
        pages: KIN_DATA.c_pages,
        notes: KIN_DATA.c_notes
      })
      .from(KIN_DATA)
      .where(and(
        eq(KIN_DATA.c_personid, personId),
        eq(KIN_DATA.c_kin_code, kinshipCode)
      ))
      .all();
  }

  /**
   * Retrieve catalog of all kinship types in the database
   *
   * Returns comprehensive list of kinship codes with descriptions
   * and usage statistics, sorted by frequency of use.
   *
   * @returns Array of kinship types with:
   *   - kinshipCode: Numeric code
   *   - kinshipType: English description
   *   - kinshipTypeChn: Chinese description
   *   - usageCount: Number of records using this type
   *
   * Implementation: Uses Drizzle subquery for efficient aggregation.
   *
   * @example
   * const types = await repo.getAllKinshipTypes();
   * // Returns all relationship types ordered by usage
   */
  async getAllKinshipTypes(): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    // First, create a subquery for usage counts using native Drizzle
    const usageStats = db
      .select({
        kinCode: KIN_DATA.c_kin_code,
        usageCount: count(KIN_DATA.c_kin_code).as('usage_count')
      })
      .from(KIN_DATA)
      .groupBy(KIN_DATA.c_kin_code)
      .as('usage_stats');

    // Join with kinship codes and order by usage
    return db
      .select({
        kinshipCode: KINSHIP_CODES.c_kincode,
        kinshipType: KINSHIP_CODES.c_kinrel,
        kinshipTypeChn: KINSHIP_CODES.c_kinrel_chn,
        usageCount: sql<number>`coalesce(${usageStats.usageCount}, 0)`
      })
      .from(KINSHIP_CODES)
      .leftJoin(usageStats, eq(KINSHIP_CODES.c_kincode, usageStats.kinCode))
      .orderBy(desc(sql<number>`coalesce(${usageStats.usageCount}, 0)`))
      .all();
  }
}
