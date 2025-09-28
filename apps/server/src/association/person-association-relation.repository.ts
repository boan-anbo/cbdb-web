/**
 * Repository for Person-to-Association Relations
 * Handles complex multi-dimensional associations between persons
 * Associations can involve kinship context and tertiary persons
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, or, count } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import {
  ASSOC_DATA,
  ASSOC_CODES,
  BIOG_MAIN,
  ADDRESSES,
  NIAN_HAO,
  TEXT_CODES,
  KINSHIP_CODES,
  YEAR_RANGE_CODES,
  RelationStat,
  AssociationFullExtendedModel,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonAssociationRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all association relations of a person
   * Includes both as primary person and as associated person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        assocIds: sql<string>`group_concat(CASE
          WHEN ${ASSOC_DATA.c_personid} = ${personId} THEN ${ASSOC_DATA.c_assoc_id}
          ELSE ${ASSOC_DATA.c_personid}
        END)`
      })
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .get();

    const ids = results?.assocIds
      ? results.assocIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'ASSOC_DATA'
    );
  }

  /**
   * Get stats by association type
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        assocCode: ASSOC_DATA.c_assoc_code,
        count: count(),
        assocIds: sql<string>`group_concat(CASE
          WHEN ${ASSOC_DATA.c_personid} = ${personId} THEN ${ASSOC_DATA.c_assoc_id}
          ELSE ${ASSOC_DATA.c_personid}
        END)`
      })
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .groupBy(ASSOC_DATA.c_assoc_code)
      .all();

    return statsResults.map(row => {
      const ids = row.assocIds
        ? row.assocIds.split(',').map(Number).filter(Boolean)
        : [];

      const stat = new RelationStat(
        row.count,
        ids,
        `ASSOC_DATA:${row.assocCode}`
      );

      (stat as any).assocCode = row.assocCode;
      return stat;
    });
  }

  /**
   * Get stats for associations with kinship context
   * Some associations include kinship relationships between parties
   */
  async getStatsWithKinshipContext(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
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
        ),
        sql`${ASSOC_DATA.c_assoc_kin_code} IS NOT NULL`
      ))
      .get();

    const ids = results?.assocIds
      ? results.assocIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'ASSOC_DATA:with-kinship'
    );
  }

  /**
   * Get stats by direction (as primary vs as associated)
   */
  async getStatsByDirection(personId: number, direction: 'primary' | 'associated'): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const whereClause = direction === 'primary'
      ? eq(ASSOC_DATA.c_personid, personId)
      : eq(ASSOC_DATA.c_assoc_id, personId);

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        personIds: sql<string>`group_concat(${
          direction === 'primary' ? ASSOC_DATA.c_assoc_id : ASSOC_DATA.c_personid
        })`
      })
      .from(ASSOC_DATA)
      .where(whereClause)
      .get();

    const ids = results?.personIds
      ? results.personIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      `ASSOC_DATA:${direction}`
    );
  }

  /**
   * Get all associations for a person (as primary or associated person)
   */
  async getByPersonId(personId: number): Promise<AssociationFullExtendedModel[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ASSOC_DATA)
      .where(or(
        eq(ASSOC_DATA.c_personid, personId),
        eq(ASSOC_DATA.c_assoc_id, personId)
      ))
      .all();

    return results.map(row => cbdbMapper.association.toModel(row, null) as AssociationFullExtendedModel);
  }

  /**
   * Get associations where the person is the primary person - TableModel level (raw, no joins)
   * Only returns associations where personId = c_personid
   * @deprecated Use getAssociationModelAsPrimary for timeline display (includes descriptions)
   */
  async getAssociationTableModelAsPrimary(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ASSOC_DATA)
      .where(eq(ASSOC_DATA.c_personid, personId))
      .all();

    return results.map(row => cbdbMapper.association.toTableModel(row));
  }

  /**
   * Get associations where the person is the primary person - Model level (with trivial joins)
   * Includes ASSOC_CODES for human-readable descriptions
   * This is the DEFAULT method for fetching associations for display
   */
  async getAssociationModelAsPrimary(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    // Composable approach: first get TableModel data with associated person names
    const associations = await db
      .select({
        assoc: ASSOC_DATA,
        assocCode: ASSOC_CODES,
        assocPerson: BIOG_MAIN
      })
      .from(ASSOC_DATA)
      .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
      .leftJoin(BIOG_MAIN, eq(ASSOC_DATA.c_assoc_id, BIOG_MAIN.c_personid))
      .where(eq(ASSOC_DATA.c_personid, personId))
      .all();

    return associations.map(row => cbdbMapper.association.toModel(row.assoc, row.assocCode, row.assocPerson));
  }

  /**
   * Legacy alias for backward compatibility
   * @deprecated Use getAssociationModelAsPrimary instead
   */
  async getAsPrimaryPerson(personId: number): Promise<any[]> {
    return this.getAssociationModelAsPrimary(personId);
  }

  /**
   * Get associations with full relations for a person
   * Includes all joined data from related tables
   * @param personId The person ID
   * @param direction Optional: 'primary' (person is c_personid), 'associated' (person is c_assoc_id), or undefined (both)
   */
  async getWithFullRelations(
    personId: number,
    direction?: 'primary' | 'associated'
  ): Promise<AssociationFullExtendedModel[]> {
    const db = this.cbdbConnection.getDb();

    // Use raw SQL with CASE statements to handle self-references properly at query level
    // This avoids the "monkey patching" approach and handles the data correctly from the source
    const query = sql`
      SELECT
        assoc.*,
        assoc_codes.c_assoc_code as assoc_type_code,
        assoc_codes.c_assoc_desc as assoc_type_desc,
        assoc_codes.c_assoc_desc_chn as assoc_type_desc_chn,

        -- Main person (c_personid)
        main_person.c_personid as main_person_id,
        main_person.c_name as main_person_name,
        main_person.c_name_chn as main_person_name_chn,

        -- Associated person (c_assoc_id)
        assoc_person.c_personid as assoc_person_id,
        assoc_person.c_name as assoc_person_name,
        assoc_person.c_name_chn as assoc_person_name_chn,

        -- Kin person with self-reference handling
        CASE
          WHEN assoc.c_kin_id = ${personId} OR assoc.c_kin_id = 0 THEN 0
          ELSE assoc.c_kin_id
        END as kin_person_id,
        CASE
          WHEN assoc.c_kin_id = ${personId} OR assoc.c_kin_id = 0 THEN 'Wei Xiang'
          ELSE kin_person.c_name
        END as kin_person_name,
        CASE
          WHEN assoc.c_kin_id = ${personId} OR assoc.c_kin_id = 0 THEN '未詳'
          ELSE kin_person.c_name_chn
        END as kin_person_name_chn,

        -- Associated kin person with self-reference handling
        CASE
          WHEN assoc.c_assoc_kin_id = ${personId} OR assoc.c_assoc_kin_id = 0 THEN 0
          ELSE assoc.c_assoc_kin_id
        END as assoc_kin_person_id,
        CASE
          WHEN assoc.c_assoc_kin_id = ${personId} OR assoc.c_assoc_kin_id = 0 THEN 'Wei Xiang'
          ELSE assoc_kin_person.c_name
        END as assoc_kin_person_name,
        CASE
          WHEN assoc.c_assoc_kin_id = ${personId} OR assoc.c_assoc_kin_id = 0 THEN '未詳'
          ELSE assoc_kin_person.c_name_chn
        END as assoc_kin_person_name_chn,

        -- Other persons
        tertiary_person.c_personid as tertiary_person_id,
        tertiary_person.c_name as tertiary_person_name,
        tertiary_person.c_name_chn as tertiary_person_name_chn,

        claimer_person.c_personid as claimer_person_id,
        claimer_person.c_name as claimer_person_name,
        claimer_person.c_name_chn as claimer_person_name_chn,

        -- Kinship types
        kin_type.c_kincode as kin_type_code,
        kin_type.c_kinrel as kin_type_rel,
        kin_type.c_kinrel_chn as kin_type_rel_chn,

        assoc_kin_type.c_kincode as assoc_kin_type_code,
        assoc_kin_type.c_kinrel as assoc_kin_type_rel,
        assoc_kin_type.c_kinrel_chn as assoc_kin_type_rel_chn,

        -- Address
        addresses.*,

        -- Year info
        first_year_nh.c_nianhao_id as first_year_nh_id,
        first_year_nh.c_nianhao_chn as first_year_nh_chn,
        first_year_nh.c_dynasty_chn as first_year_nh_dynasty,

        last_year_nh.c_nianhao_id as last_year_nh_id,
        last_year_nh.c_nianhao_chn as last_year_nh_chn,
        last_year_nh.c_dynasty_chn as last_year_nh_dynasty,

        first_year_range.c_range as first_year_range_val,
        first_year_range.c_range_chn as first_year_range_chn,

        last_year_range.c_range as last_year_range_val,
        last_year_range.c_range_chn as last_year_range_chn,

        -- Source text
        text_codes.c_textid as source_text_id,
        text_codes.c_title as source_text_title,
        text_codes.c_title_chn as source_text_title_chn

      FROM ASSOC_DATA assoc
      LEFT JOIN ASSOC_CODES assoc_codes ON assoc.c_assoc_code = assoc_codes.c_assoc_code
      LEFT JOIN BIOG_MAIN main_person ON assoc.c_personid = main_person.c_personid
      LEFT JOIN BIOG_MAIN assoc_person ON assoc.c_assoc_id = assoc_person.c_personid
      LEFT JOIN BIOG_MAIN kin_person ON assoc.c_kin_id = kin_person.c_personid AND assoc.c_kin_id != ${personId} AND assoc.c_kin_id != 0
      LEFT JOIN BIOG_MAIN assoc_kin_person ON assoc.c_assoc_kin_id = assoc_kin_person.c_personid AND assoc.c_assoc_kin_id != ${personId} AND assoc.c_assoc_kin_id != 0
      LEFT JOIN BIOG_MAIN tertiary_person ON assoc.c_tertiary_personid = tertiary_person.c_personid
      LEFT JOIN BIOG_MAIN claimer_person ON assoc.c_assoc_claimer_id = claimer_person.c_personid
      LEFT JOIN KINSHIP_CODES kin_type ON assoc.c_kin_code = kin_type.c_kincode
      LEFT JOIN KINSHIP_CODES assoc_kin_type ON assoc.c_assoc_kin_code = assoc_kin_type.c_kincode
      LEFT JOIN ADDRESSES addresses ON assoc.c_addr_id = addresses.c_addr_id
      LEFT JOIN NIAN_HAO first_year_nh ON assoc.c_assoc_fy_nh_code = first_year_nh.c_nianhao_id
      LEFT JOIN NIAN_HAO last_year_nh ON assoc.c_assoc_ly_nh_code = last_year_nh.c_nianhao_id
      LEFT JOIN YEAR_RANGE_CODES first_year_range ON assoc.c_assoc_fy_range = first_year_range.c_range_code
      LEFT JOIN YEAR_RANGE_CODES last_year_range ON assoc.c_assoc_ly_range = last_year_range.c_range_code
      LEFT JOIN TEXT_CODES text_codes ON assoc.c_source = text_codes.c_textid
      WHERE ${
        direction === 'primary'
          ? sql`assoc.c_personid = ${personId}`
          : direction === 'associated'
          ? sql`assoc.c_assoc_id = ${personId}`
          : sql`(assoc.c_personid = ${personId} OR assoc.c_assoc_id = ${personId})`
      }
    `;

    const results = await db.all(query);

    // Use the new mapper that handles flat SQL results with perspective-aware CASE statements
    // Pass the personId so the mapper can handle perspective swapping correctly
    // Using any for now - full type safety would require updating SQL column names
    return results.map((row) =>
      cbdbMapper.association.toFullExtendedModelFromFlatPerspective(row as any, personId)
    );
  }
}