import { Injectable } from '@nestjs/common';
import {
  cbdbMapper,
  BIOG_MAIN,
  DYNASTIES,
  NIAN_HAO,
  ETHNICITY_TRIBE_CODES,
  CHORONYM_CODES,
  HOUSEHOLD_STATUS_CODES,
  INDEXYEAR_TYPE_CODES,
  BIOG_ADDR_CODES,
  YEAR_RANGE_CODES,
  GANZHI_CODES,
  ADDR_CODES,
  ALTNAME_DATA,
  PersonTableModel,
  PersonModel,
  PersonDenormExtraDataView,
  PersonDenormExtraDataViewSchema,
  PersonSuggestionDataView,
  PersonFullExtendedModel,
  PersonOptionalExtendedModel,
  PersonOptionalRelations,
  PersonFullRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { PersonRelationsRepository } from './person-relations.repository';
import { PersonBatchFetcherService } from './person-batch-fetcher.service';
import { eq, sql, and, isNotNull, gte, lte, or, like } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { validatePagination } from '../common/utils/repository-guards';
import { toStringOrNull } from '@cbdb/core';

/**
 * Repository for accessing Person data from CBDB
 * Maps between CBDB database schema and shared PersonModel
 *
 * Performance note: For batch operations (findModelsByIds), uses optimized
 * batch fetching that eliminates N+1 queries, achieving 20-30x performance improvement
 */
@Injectable()
export class PersonRepository {
  private batchFetcher: PersonBatchFetcherService;

  constructor(
    private readonly cbdbConnection: CbdbConnectionService,
    private readonly personRelationsRepository: PersonRelationsRepository
  ) {
    // Initialize batch fetcher with the connection
    this.batchFetcher = new PersonBatchFetcherService(cbdbConnection);
  }


  /**
   * Lightweight search for autocomplete suggestions
   * Only fetches minimal data needed for display (ID, names, years, dynasty)
   * Optimized for sub-100ms response time
   * Returns PersonSuggestionDataView - a purpose-specific projection for autocomplete
   */
  async searchSuggestionsLightweight(params: {
    query: string;
    limit?: number;
    sortByImportance?: boolean;
  }): Promise<{ suggestions: PersonSuggestionDataView[]; total: number }> {
    const db = this.cbdbConnection.getDb();
    const { query, limit = 10, sortByImportance = false } = params;

    // Parse query as number for ID search (but still search other fields too)
    const queryAsNumber = parseInt(query, 10);
    const isValidNumber = !isNaN(queryAsNumber) && queryAsNumber > 0;

    // Always use prefix search for better index utilization
    // For Chinese characters, prefix search is usually what users expect anyway
    const searchPattern = `${query}%`;
    const containsPattern = `%${query}%`;

    // Fetch more results if we need to sort by importance
    // (since importance sorting happens after fetching)
    const fetchLimit = sortByImportance ? Math.min(limit * 3, 500) : limit;

    // Build where conditions - search ALL fields
    const conditions = [
      like(BIOG_MAIN.c_name_chn, searchPattern),
      like(BIOG_MAIN.c_name, searchPattern),
      // Also search dynasty names (both English and Chinese)
      like(DYNASTIES.c_dynasty, containsPattern),
      like(DYNASTIES.c_dynasty_chn, containsPattern),
      // Search by ID if query could be a number
      sql`CAST(${BIOG_MAIN.c_personid} AS TEXT) LIKE ${searchPattern}`
    ];

    // Add exact ID match if query is a valid number
    if (isValidNumber) {
      conditions.push(eq(BIOG_MAIN.c_personid, queryAsNumber));
    }

    const whereCondition = or(...conditions);

    // Use proper Drizzle syntax with select/from/leftJoin/orderBy
    // DYNASTIES is a small lookup table with PrimaryKey index on c_dy
    const results = await db
      .select({
        id: BIOG_MAIN.c_personid,
        name: BIOG_MAIN.c_name,
        nameChn: BIOG_MAIN.c_name_chn,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear,
        indexYear: BIOG_MAIN.c_index_year,
        dynastyCode: BIOG_MAIN.c_dy,
        dynasty: DYNASTIES.c_dynasty,
        dynastyChn: DYNASTIES.c_dynasty_chn,
      })
      .from(BIOG_MAIN)
      .leftJoin(DYNASTIES, eq(BIOG_MAIN.c_dy, DYNASTIES.c_dy))
      .where(whereCondition)
      .orderBy(
        // First priority: exact matches
        sql`CASE
          WHEN ${isValidNumber ? sql`${BIOG_MAIN.c_personid} = ${queryAsNumber}` : sql`0=1`} THEN 0
          WHEN ${BIOG_MAIN.c_name_chn} = ${query} THEN 0
          WHEN ${BIOG_MAIN.c_name} = ${query} THEN 0
          WHEN ${BIOG_MAIN.c_name_chn} LIKE ${searchPattern} THEN 1
          WHEN ${BIOG_MAIN.c_name} LIKE ${searchPattern} THEN 1
          WHEN CAST(${BIOG_MAIN.c_personid} AS TEXT) LIKE ${searchPattern} THEN 1
          WHEN ${DYNASTIES.c_dynasty} LIKE ${containsPattern} THEN 2
          WHEN ${DYNASTIES.c_dynasty_chn} LIKE ${containsPattern} THEN 2
          ELSE 3
        END`,
        // Second priority: sort by English name for consistency
        // This ensures all "Wang Ming" entries are grouped together
        BIOG_MAIN.c_name,
        // Third priority: by person ID for stable ordering (will be replaced by importance if enabled)
        BIOG_MAIN.c_personid
      )
      .limit(fetchLimit);

    // If importance sorting is requested, calculate scores and re-sort
    let finalResults = results;
    if (sortByImportance && results.length > 0) {
      const ids = results.map(r => r.id);
      const importanceScores = await this.getImportanceScores(ids);

      // Sort results by: 1) match type, 2) English name, 3) importance score
      finalResults = [...results].sort((a, b) => {
        // First check exact match priority
        const aExact = (a.nameChn === query || a.name === query) ? 0 : 1;
        const bExact = (b.nameChn === query || b.name === query) ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        // Then group by English name
        const nameCompare = (a.name || '').localeCompare(b.name || '');
        if (nameCompare !== 0) return nameCompare;

        // Within same English name, sort by importance
        const scoreA = importanceScores.get(a.id) || 0;
        const scoreB = importanceScores.get(b.id) || 0;
        return scoreB - scoreA; // Higher importance first
      });

      // Trim to requested limit
      finalResults = finalResults.slice(0, limit);
    }

    // Map results to PersonSuggestionDataView
    const suggestions = finalResults.map(r => new PersonSuggestionDataView({
      id: r.id,
      name: r.name,
      nameChn: r.nameChn,
      birthYear: r.birthYear,
      deathYear: r.deathYear,
      indexYear: r.indexYear,
      dynastyCode: r.dynastyCode,
      dynasty: r.dynasty,
      dynastyChn: r.dynastyChn,
    }));

    return {
      suggestions,
      total: suggestions.length // For autocomplete, we don't need exact total count
    };
  }

  /**
   * Search for people by name
   * Searches in: 1) Primary names (Chinese/English), 2) Alternative names
   * Uses native SQL UNION with LIMIT/OFFSET for efficient pagination
   */
  async searchByName(params: {
    name: string;
    accurate?: boolean;
    start?: number;
    limit?: number;
    sortByImportance?: boolean;
  }): Promise<{ total: number; data: PersonModel[] }> {
    const db = this.cbdbConnection.getDb();
    const { name, accurate = false, sortByImportance = false } = params;
    const { start, limit } = validatePagination(params);

    // Build search pattern
    const searchPattern = accurate ? name : `%${name}%`;

    // Use native SQL with UNION to combine primary and alternative name searches
    // Priority: exact matches > primary names > alternative names
    const searchQuery = sql`
      WITH combined_search AS (
        -- Primary name matches with priority 1
        SELECT c_personid as id, 1 as priority
        FROM ${BIOG_MAIN}
        WHERE ${accurate ? sql`
          (c_name_chn = ${name} OR c_name = ${name})
        ` : sql`
          (c_name_chn LIKE ${searchPattern} OR c_name LIKE ${searchPattern})
        `}

        UNION

        -- Alternative name matches with priority 2
        SELECT c_personid as id, 2 as priority
        FROM ${ALTNAME_DATA}
        WHERE ${accurate ? sql`
          (c_alt_name_chn = ${name} OR c_alt_name = ${name})
        ` : sql`
          (c_alt_name_chn LIKE ${searchPattern} OR c_alt_name LIKE ${searchPattern})
        `}
      ),
      prioritized AS (
        SELECT id, MIN(priority) as min_priority
        FROM combined_search
        GROUP BY id
      )
      SELECT id
      FROM prioritized
      ORDER BY min_priority, id
      LIMIT ${limit}
      OFFSET ${start}
    `;

    // Get total count using a separate query
    const countQuery = sql`
      WITH combined_search AS (
        SELECT c_personid as id
        FROM ${BIOG_MAIN}
        WHERE ${accurate ? sql`
          (c_name_chn = ${name} OR c_name = ${name})
        ` : sql`
          (c_name_chn LIKE ${searchPattern} OR c_name LIKE ${searchPattern})
        `}

        UNION

        SELECT c_personid as id
        FROM ${ALTNAME_DATA}
        WHERE ${accurate ? sql`
          (c_alt_name_chn = ${name} OR c_alt_name = ${name})
        ` : sql`
          (c_alt_name_chn LIKE ${searchPattern} OR c_alt_name LIKE ${searchPattern})
        `}
      )
      SELECT COUNT(DISTINCT id) as count
      FROM combined_search
    `;

    // Execute queries in parallel for better performance
    const [idResults, countResult] = await Promise.all([
      db.all(searchQuery),
      db.get(countQuery) as Promise<{ count: number } | undefined>
    ]);

    const total = Number(countResult?.count || 0);
    const paginatedIds = idResults.map((row: any) => row.id);

    if (paginatedIds.length === 0) {
      return { total, data: [] };
    }

    // If importance sorting is requested, reorder the paginated results
    let finalIds = paginatedIds;
    if (sortByImportance && paginatedIds.length > 0) {
      // Get importance scores only for the paginated IDs
      const importanceScores = await this.getImportanceScores(paginatedIds);

      // Sort by importance score
      finalIds = [...paginatedIds].sort((a, b) => {
        const scoreA = importanceScores.get(a) || 0;
        const scoreB = importanceScores.get(b) || 0;
        return scoreB - scoreA; // Descending order
      });
    }

    // Batch fetch full models with denorm data
    const data = await this.findModelsByIds(finalIds);

    return { total, data };
  }

  /**
   * Get importance scores for multiple person IDs
   * Used for sorting search results by importance
   * Returns a map of personId -> importance score
   *
   * Optimized to use a single batched SQL query instead of N individual queries
   */
  private async getImportanceScores(personIds: number[]): Promise<Map<number, number>> {
    // Use the new batch method from PersonRelationsRepository
    // This executes a single SQL query with subqueries for all counts
    // instead of making N separate queries (one per person)
    return this.personRelationsRepository.getBatchImportanceScores(personIds);
  }

  /**
   * Find a person by ID - returns raw table model (no joins)
   */
  async findTableModelById(id: number): Promise<PersonTableModel | null> {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select()
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_personid, id))
      .limit(1);

    return result[0] ? cbdbMapper.person.toTableModel(result[0]) : null;
  }

  /**
   * Find multiple people by IDs - returns raw table models (no joins)
   * Efficient batch fetch without any joins
   */
  async findTableModelsByIds(ids: number[]): Promise<PersonTableModel[]> {
    if (ids.length === 0) {
      return [];
    }

    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(BIOG_MAIN)
      .where(sql`${BIOG_MAIN.c_personid} IN ${ids}`);

    return results.map(row => cbdbMapper.person.toTableModel(row));
  }

  /**
   * Fetch denormalized extra data for a person using a single query with leftJoins
   * This returns the human-readable values from code tables
   */
  async fetchPersonDenormExtraById(personId: number): Promise<PersonDenormExtraDataView | null> {
    const db = this.cbdbConnection.getDb();

    // Create aliases for tables that need multiple joins
    const birthNianHao = alias(NIAN_HAO, 'birthNianHao');
    const deathNianHao = alias(NIAN_HAO, 'deathNianHao');
    const flourishedStartNianHao = alias(NIAN_HAO, 'flourishedStartNianHao');
    const flourishedEndNianHao = alias(NIAN_HAO, 'flourishedEndNianHao');
    const birthYearRange = alias(YEAR_RANGE_CODES, 'birthYearRange');
    const deathYearRange = alias(YEAR_RANGE_CODES, 'deathYearRange');
    const birthDayGanzhi = alias(GANZHI_CODES, 'birthDayGanzhi');
    const deathDayGanzhi = alias(GANZHI_CODES, 'deathDayGanzhi');

    // Single query with all leftJoins
    const result = await db
      .select({
        // Person base data
        person: BIOG_MAIN,
        // Dynasty
        dynasty: DYNASTIES,
        // Nian Hao codes (4 different joins)
        birthNh: birthNianHao,
        deathNh: deathNianHao,
        flourishedStartNh: flourishedStartNianHao,
        flourishedEndNh: flourishedEndNianHao,
        // Ethnicity
        ethnicity: ETHNICITY_TRIBE_CODES,
        // Choronym
        choronym: CHORONYM_CODES,
        // Household status
        householdStatus: HOUSEHOLD_STATUS_CODES,
        // Index year type
        indexYearType: INDEXYEAR_TYPE_CODES,
        // Index address type
        indexAddrType: BIOG_ADDR_CODES,
        // Index address
        indexAddr: ADDR_CODES,
        // Year ranges
        birthRange: birthYearRange,
        deathRange: deathYearRange,
        // Ganzhi codes
        birthGz: birthDayGanzhi,
        deathGz: deathDayGanzhi
      })
      .from(BIOG_MAIN)
      .leftJoin(DYNASTIES, eq(BIOG_MAIN.c_dy, DYNASTIES.c_dy))
      .leftJoin(birthNianHao, eq(BIOG_MAIN.c_by_nh_code, birthNianHao.c_nianhao_id))
      .leftJoin(deathNianHao, eq(BIOG_MAIN.c_dy_nh_code, deathNianHao.c_nianhao_id))
      .leftJoin(flourishedStartNianHao, eq(BIOG_MAIN.c_fl_ey_nh_code, flourishedStartNianHao.c_nianhao_id))
      .leftJoin(flourishedEndNianHao, eq(BIOG_MAIN.c_fl_ly_nh_code, flourishedEndNianHao.c_nianhao_id))
      .leftJoin(ETHNICITY_TRIBE_CODES, eq(BIOG_MAIN.c_ethnicity_code, ETHNICITY_TRIBE_CODES.c_ethnicity_code))
      .leftJoin(CHORONYM_CODES, eq(BIOG_MAIN.c_choronym_code, CHORONYM_CODES.c_choronym_code))
      .leftJoin(HOUSEHOLD_STATUS_CODES, eq(BIOG_MAIN.c_household_status_code, HOUSEHOLD_STATUS_CODES.c_household_status_code))
      .leftJoin(INDEXYEAR_TYPE_CODES, eq(BIOG_MAIN.c_index_year_type_code, INDEXYEAR_TYPE_CODES.c_index_year_type_code))
      .leftJoin(BIOG_ADDR_CODES, eq(BIOG_MAIN.c_index_addr_type_code, BIOG_ADDR_CODES.c_addr_type))
      .leftJoin(ADDR_CODES, eq(BIOG_MAIN.c_index_addr_id, ADDR_CODES.c_addr_id))
      .leftJoin(birthYearRange, eq(BIOG_MAIN.c_by_range, birthYearRange.c_range_code))
      .leftJoin(deathYearRange, eq(BIOG_MAIN.c_dy_range, deathYearRange.c_range_code))
      .leftJoin(birthDayGanzhi, eq(BIOG_MAIN.c_by_day_gz, birthDayGanzhi.c_ganzhi_code))
      .leftJoin(deathDayGanzhi, eq(BIOG_MAIN.c_dy_day_gz, deathDayGanzhi.c_ganzhi_code))
      .where(eq(BIOG_MAIN.c_personid, personId))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    // Use mapper to convert the schema result to PersonDenormExtraDataView
    // Need to rename some fields to match the schema type expected by the mapper
    const schemaResult = {
      person: result[0].person,
      dynasty: result[0].dynasty,
      birthNh: result[0].birthNh,
      deathNh: result[0].deathNh,
      flourishedStartNh: result[0].flourishedStartNh,
      flourishedEndNh: result[0].flourishedEndNh,
      ethnicity: result[0].ethnicity,
      choronym: result[0].choronym,
      householdStatus: result[0].householdStatus,
      indexYearType: result[0].indexYearType,
      indexAddrType: result[0].indexAddrType,
      birthYearRange: result[0].birthRange,
      deathYearRange: result[0].deathRange,
      birthYearDayGanzhi: result[0].birthGz,
      deathYearDayGanzhi: result[0].deathGz,
      indexAddr: result[0].indexAddr
    } satisfies PersonDenormExtraDataViewSchema;

    return cbdbMapper.person.toDenormExtraDataView(schemaResult);
  }

  /**
   * Find a person by ID - returns model with trivial joins (DEFAULT)
   */
  async findModelById(id: number): Promise<PersonModel | null> {
    const db = this.cbdbConnection.getDb();

    // Fetch the base person data
    const result = await db
      .select()
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_personid, id))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    // Fetch denormalized extra data
    const denormData = await this.fetchPersonDenormExtraById(id);

    if (!denormData) {
      return null;
    }

    // Use cbdbMapper to properly compose the PersonModel
    return cbdbMapper.person.toModel(result[0], denormData);
  }


  /**
   * Find multiple people by IDs - returns Models with denorm data
   * Uses optimized batch fetching to eliminate N+1 queries
   *
   * Performance characteristics:
   * - Original: N+1 queries (1 for persons + N for denorm data)
   * - Optimized: ~11 constant queries regardless of batch size
   * - Improvement: 20-30x faster for typical batch sizes
   *
   * Single record fetches continue to use findModelById for simplicity
   */
  async findModelsByIds(ids: number[]): Promise<PersonModel[]> {
    if (ids.length === 0) {
      return [];
    }

    // Use optimized batch fetcher for multiple records
    return this.batchFetcher.findModelsByIdsOptimized(ids);
  }

  /**
   * Search by dynasty
   */
  async searchByDynasty(params: {
    dynastyCode: number;
    start?: number;
    limit?: number;
  }): Promise<{ total: number; data: PersonModel[] }> {
    const db = this.cbdbConnection.getDb();
    const { dynastyCode } = params;
    const { start, limit } = validatePagination(params);

    const whereClause = eq(BIOG_MAIN.c_dy, dynastyCode);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(BIOG_MAIN)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated IDs then batch fetch
    const idResults = await db
      .select({ id: BIOG_MAIN.c_personid })
      .from(BIOG_MAIN)
      .where(whereClause)
      .limit(limit)
      .offset(start);

    const ids = idResults.map(row => row.id);
    const data = await this.findModelsByIds(ids);

    return { total, data };
  }

  /**
   * Search by year range
   */
  async searchByYearRange(params: {
    startYear: number;
    endYear: number;
    start?: number;
    limit?: number;
  }): Promise<{ total: number; data: PersonModel[] }> {
    const db = this.cbdbConnection.getDb();
    const { startYear, endYear } = params;
    const { start, limit } = validatePagination(params);

    const whereClause = and(
      isNotNull(BIOG_MAIN.c_index_year),
      gte(BIOG_MAIN.c_index_year, startYear),
      lte(BIOG_MAIN.c_index_year, endYear)
    );

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(BIOG_MAIN)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated IDs then batch fetch
    const idResults = await db
      .select({ id: BIOG_MAIN.c_personid })
      .from(BIOG_MAIN)
      .where(whereClause)
      .orderBy(BIOG_MAIN.c_index_year)
      .limit(limit)
      .offset(start);

    const ids = idResults.map(row => row.id);
    const data = await this.findModelsByIds(ids);

    return { total, data };
  }

  /**
   * Search by name with additional filters
   * Combines name search (using LIKE for Chinese and English names) with other filters
   * Uses proper Drizzle operators for SQLite queries
   */
  async searchByNameWithFilters(params: {
    name: string;
    accurate?: boolean;
    dynastyCode?: number;
    startYear?: number;
    endYear?: number;
    gender?: 'male' | 'female';
    start?: number;
    limit?: number;
  }): Promise<{ total: number; data: PersonModel[] }> {
    const db = this.cbdbConnection.getDb();
    const { name, accurate = false, dynastyCode, startYear, endYear, gender } = params;
    const { start, limit } = validatePagination(params);

    // Build where conditions array
    const conditions: any[] = [];

    // Add name filter using OR for Chinese and English names
    if (name) {
      const searchPattern = accurate ? name : `%${name}%`;
      conditions.push(
        or(
          accurate ? eq(BIOG_MAIN.c_name_chn, name) : sql`${BIOG_MAIN.c_name_chn} LIKE ${searchPattern}`,
          accurate ? eq(BIOG_MAIN.c_name, name) : sql`${BIOG_MAIN.c_name} LIKE ${searchPattern}`
        )
      );
    }

    // Add dynasty filter if provided
    if (dynastyCode !== undefined) {
      conditions.push(eq(BIOG_MAIN.c_dy, dynastyCode));
    }

    // Add year range filter if provided
    if (startYear !== undefined && endYear !== undefined) {
      conditions.push(
        isNotNull(BIOG_MAIN.c_index_year),
        gte(BIOG_MAIN.c_index_year, startYear),
        lte(BIOG_MAIN.c_index_year, endYear)
      );
    }

    // Add gender filter if provided
    if (gender !== undefined) {
      conditions.push(eq(BIOG_MAIN.c_female, gender === 'female' ? '1' : '0'));
    }

    // Build the where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(BIOG_MAIN)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const results = await db
      .select()
      .from(BIOG_MAIN)
      .where(whereClause)
      .limit(limit)
      .offset(start)
      .orderBy(BIOG_MAIN.c_personid);

    if (results.length === 0) {
      return { total, data: [] };
    }

    // Fetch models with denorm data
    const personIds = results.map(r => r.c_personid as number);
    const data = await this.findModelsByIds(personIds);

    return { total, data };
  }

  /**
   * Search with combined filters - supports dynasty AND year range
   * Uses Drizzle's and() operator to combine conditions in SQLite
   */
  async searchWithFilters(params: {
    dynastyCode?: number;
    startYear?: number;
    endYear?: number;
    gender?: 'male' | 'female';
    start?: number;
    limit?: number;
  }): Promise<{ total: number; data: PersonModel[] }> {
    const db = this.cbdbConnection.getDb();
    const { dynastyCode, startYear, endYear, gender } = params;
    const { start, limit } = validatePagination(params);

    // Build where conditions array - use proper Drizzle operators
    const conditions: any[] = [];

    // Add dynasty filter if provided
    if (dynastyCode !== undefined) {
      conditions.push(eq(BIOG_MAIN.c_dy, dynastyCode));
    }

    // Add year range filter if provided using proper Drizzle operators
    if (startYear !== undefined && endYear !== undefined) {
      conditions.push(
        isNotNull(BIOG_MAIN.c_index_year),
        gte(BIOG_MAIN.c_index_year, startYear),
        lte(BIOG_MAIN.c_index_year, endYear)
      );
    }

    // Add gender filter if provided
    if (gender !== undefined) {
      conditions.push(eq(BIOG_MAIN.c_female, gender === 'female' ? '1' : '0'));
    }

    // Build the where clause - if no conditions, don't filter
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(BIOG_MAIN)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated IDs then batch fetch
    const query = db
      .select({ id: BIOG_MAIN.c_personid })
      .from(BIOG_MAIN);

    if (whereClause) {
      query.where(whereClause);
    }

    const idResults = await query
      .orderBy(BIOG_MAIN.c_index_year)
      .limit(limit)
      .offset(start);

    const ids = idResults.map(row => row.id);
    const data = await this.findModelsByIds(ids);

    return { total, data };
  }


  /**
   * Find person with selective relations - returns PersonOptionalExtendedModel
   */
  async findOptionalExtendedModelById(
    id: number,
    relations: {
      kinship?: boolean;
      addresses?: boolean;
      offices?: boolean;
      entries?: boolean;
      statuses?: boolean;
      associations?: boolean;
      texts?: boolean;
      events?: boolean;
    }
  ): Promise<PersonOptionalExtendedModel | null> {
    // Get table model and denorm data
    const tableModel = await this.findTableModelById(id);
    if (!tableModel) {
      return null;
    }

    const denormData = await this.fetchPersonDenormExtraById(id);
    if (!denormData) {
      return null;
    }

    // Create PersonModel from table model and denorm data
    // First get the raw schema data
    const db = this.cbdbConnection.getDb();
    const result = await db
      .select()
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_personid, id))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const personModel = cbdbMapper.person.toModel(result[0], denormData);

    // Delegate to PersonRelationsRepository for fetching relations
    const relationsData = await this.personRelationsRepository.getSelectiveRelations(id, relations);

    // Create PersonOptionalExtendedModel with the person model and optional relations
    const optionalRelations: PersonOptionalRelations = {};

    // Assign fetched relations
    if (relations.kinship && relationsData.kinships) {
      optionalRelations.kinships = relationsData.kinships;
    }
    if (relations.addresses && relationsData.addresses) {
      optionalRelations.addresses = relationsData.addresses;
    }
    if (relations.offices && relationsData.offices) {
      optionalRelations.offices = relationsData.offices;
    }
    if (relations.entries && relationsData.entries) {
      optionalRelations.entries = relationsData.entries;
    }
    if (relations.statuses && relationsData.statuses) {
      optionalRelations.statuses = relationsData.statuses;
    }
    if (relations.associations && relationsData.associations) {
      optionalRelations.associations = relationsData.associations;
    }
    if (relations.texts && relationsData.texts) {
      optionalRelations.texts = relationsData.texts;
    }
    if (relations.events && relationsData.events) {
      optionalRelations.events = relationsData.events;
    }

    const extended = new PersonOptionalExtendedModel(personModel, optionalRelations);

    return extended;
  }

  /**
   * Find person with all relations - returns PersonFullExtendedModel
   */
  async findFullExtendedModelById(id: number): Promise<PersonFullExtendedModel | null> {
    const personModel = await this.findModelById(id);

    if (!personModel) {
      return null;
    }

    // Delegate to PersonRelationsRepository for fetching all relations
    const relationsData = await this.personRelationsRepository.getAllRelations(id);

    return new PersonFullExtendedModel(personModel, relationsData);
  }
}