/**
 * Repository for Person-to-Office Relations
 * Handles relationships between persons and their official positions
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, count, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import {
  BIOG_INST_DATA,
  OFFICE_CODES,
  POSTED_TO_OFFICE_DATA,
  POSTED_TO_ADDR_DATA,
  ADDR_CODES,
  APPOINTMENT_CODES,
  ASSUME_OFFICE_CODES,
  NIAN_HAO,
  YEAR_RANGE_CODES,
  TEXT_CODES,
  RelationStat,
  OfficeWithFullRelations,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonOfficeRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find all office appointments for a person with full relations
   * Loads all related lookup tables for complete display
   */
  async findOfficesByPersonId(personId: number): Promise<OfficeWithFullRelations[]> {
    const db = this.cbdbConnection.getDb();

    // Create aliases for tables that are joined multiple times
    const firstYearNianHao = alias(NIAN_HAO, 'firstYearNianHao');
    const lastYearNianHao = alias(NIAN_HAO, 'lastYearNianHao');
    const firstYearRange = alias(YEAR_RANGE_CODES, 'firstYearRange');
    const lastYearRange = alias(YEAR_RANGE_CODES, 'lastYearRange');

    // Query with all necessary joins using Drizzle aliases
    const results = await db
      .select({
        // Office record
        office: POSTED_TO_OFFICE_DATA,
        // Office details
        officeCode: OFFICE_CODES,
        // Appointment type
        appointmentCode: APPOINTMENT_CODES,
        // Assume office type
        assumeOfficeCode: ASSUME_OFFICE_CODES,
        // Posting address via join
        postingAddr: POSTED_TO_ADDR_DATA,
        address: ADDR_CODES,
        // Nian Hao (reign periods) using aliases
        firstYearNianHao: firstYearNianHao,
        lastYearNianHao: lastYearNianHao,
        // Year ranges using aliases
        firstYearRange: firstYearRange,
        lastYearRange: lastYearRange,
        // Source text
        sourceText: TEXT_CODES,
      })
      .from(POSTED_TO_OFFICE_DATA)
      .leftJoin(OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_office_id, OFFICE_CODES.c_office_id))
      .leftJoin(APPOINTMENT_CODES, eq(POSTED_TO_OFFICE_DATA.c_appt_code, APPOINTMENT_CODES.c_appt_code))
      .leftJoin(ASSUME_OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_assume_office_code, ASSUME_OFFICE_CODES.c_assume_office_code))
      .leftJoin(POSTED_TO_ADDR_DATA, and(
        eq(POSTED_TO_OFFICE_DATA.c_posting_id, POSTED_TO_ADDR_DATA.c_posting_id),
        eq(POSTED_TO_OFFICE_DATA.c_office_id, POSTED_TO_ADDR_DATA.c_office_id)
      ))
      .leftJoin(ADDR_CODES, eq(POSTED_TO_ADDR_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .leftJoin(firstYearNianHao, eq(POSTED_TO_OFFICE_DATA.c_fy_nh_code, firstYearNianHao.c_nianhao_id))
      .leftJoin(lastYearNianHao, eq(POSTED_TO_OFFICE_DATA.c_ly_nh_code, lastYearNianHao.c_nianhao_id))
      .leftJoin(firstYearRange, eq(POSTED_TO_OFFICE_DATA.c_fy_range, firstYearRange.c_range_code))
      .leftJoin(lastYearRange, eq(POSTED_TO_OFFICE_DATA.c_ly_range, lastYearRange.c_range_code))
      .leftJoin(TEXT_CODES, eq(POSTED_TO_OFFICE_DATA.c_source, TEXT_CODES.c_textid))
      .where(eq(POSTED_TO_OFFICE_DATA.c_personid, personId))
      .orderBy(asc(POSTED_TO_OFFICE_DATA.c_firstyear), asc(POSTED_TO_OFFICE_DATA.c_sequence))
      .all();

    // Map results to OfficeWithFullRelations
    return results.map(row => {
      return cbdbMapper.office.withFullRelations(
        row.office,
        row.officeCode,
        row.appointmentCode,
        row.assumeOfficeCode,
        row.address,
        row.firstYearNianHao,
        row.lastYearNianHao,
        row.firstYearRange,
        row.lastYearRange,
        row.sourceText
      );
    });
  }

  /**
   * Get summary stats for all institution relations of a person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        instCodes: sql<string>`group_concat(${BIOG_INST_DATA.c_inst_code})`
      })
      .from(BIOG_INST_DATA)
      .where(eq(BIOG_INST_DATA.c_personid, personId))
      .get();

    const ids = results?.instCodes
      ? results.instCodes.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'BIOG_INST_DATA'
    );
  }

  /**
   * Get stats by institution role
   */
  async getStatsByRole(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        roleCode: BIOG_INST_DATA.c_bi_role_code,
        count: count(),
        instCodes: sql<string>`group_concat(${BIOG_INST_DATA.c_inst_code})`
      })
      .from(BIOG_INST_DATA)
      .where(eq(BIOG_INST_DATA.c_personid, personId))
      .groupBy(BIOG_INST_DATA.c_bi_role_code)
      .all();

    return statsResults.map(row => {
      const ids = row.instCodes
        ? row.instCodes.split(',').map(Number).filter(Boolean)
        : [];

      const stat = new RelationStat(
        row.count,
        ids,
        `BIOG_INST_DATA:role-${row.roleCode}`
      );

      (stat as any).roleCode = row.roleCode;
      return stat;
    });
  }

  /**
   * Get stats for institutions within a time period
   */
  async getStatsByTimePeriod(
    personId: number,
    startYear?: number,
    endYear?: number
  ): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const whereConditions = [eq(BIOG_INST_DATA.c_personid, personId)];

    if (startYear !== undefined) {
      whereConditions.push(sql`${BIOG_INST_DATA.c_bi_begin_year} >= ${startYear}`);
    }
    if (endYear !== undefined) {
      whereConditions.push(sql`${BIOG_INST_DATA.c_bi_end_year} <= ${endYear}`);
    }

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        instCodes: sql<string>`group_concat(${BIOG_INST_DATA.c_inst_code})`
      })
      .from(BIOG_INST_DATA)
      .where(and(...whereConditions))
      .get();

    const ids = results?.instCodes
      ? results.instCodes.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      `BIOG_INST_DATA:${startYear || 'any'}-${endYear || 'any'}`
    );
  }
}