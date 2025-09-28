/**
 * Repository for Person-to-Status Relations
 * Handles relationships between persons and their social/official statuses
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, count } from 'drizzle-orm';
import {
  STATUS_DATA,
  STATUS_CODES,
  RelationStat,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonStatusRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all status relations of a person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        statusCodes: sql<string>`group_concat(${STATUS_DATA.c_status_code})`
      })
      .from(STATUS_DATA)
      .where(eq(STATUS_DATA.c_personid, personId))
      .get();

    const ids = results?.statusCodes
      ? results.statusCodes.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'STATUS_DATA'
    );
  }

  /**
   * Get stats grouped by status type
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        statusCode: STATUS_DATA.c_status_code,
        count: count()
      })
      .from(STATUS_DATA)
      .where(eq(STATUS_DATA.c_personid, personId))
      .groupBy(STATUS_DATA.c_status_code)
      .all();

    return statsResults.map(row => {
      const stat = new RelationStat(
        row.count,
        [row.statusCode],
        `STATUS_DATA:${row.statusCode}`
      );

      (stat as any).statusCode = row.statusCode;
      return stat;
    });
  }

  /**
   * Find all statuses for a person with code descriptions
   * Returns array of Status records with trivial joins included
   */
  async findByPersonId(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        status: STATUS_DATA,
        statusCode: STATUS_CODES
      })
      .from(STATUS_DATA)
      .leftJoin(STATUS_CODES, eq(STATUS_DATA.c_status_code, STATUS_CODES.c_status_code))
      .where(eq(STATUS_DATA.c_personid, personId))
      .all();

    // Map to Status model with code info
    return results.map(row => {
      const status = cbdbMapper.status.fromDb(row.status);

      // Add status code info if available
      if (row.statusCode) {
        (status as any).statusCodeInfo = {
          code: row.statusCode.c_status_code,
          statusDesc: row.statusCode.c_status_desc,
          statusDescChn: row.statusCode.c_status_desc_chn
        };
        // Also set top-level fields for backward compatibility
        (status as any).statusDesc = row.statusCode.c_status_desc;
        (status as any).statusDescChn = row.statusCode.c_status_desc_chn;
      }

      return status;
    });
  }
}