/**
 * Repository for Person-to-Entry Relations
 * Handles relationships between persons and their examination/entry records
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, count } from 'drizzle-orm';
import {
  ENTRY_DATA,
  ENTRY_CODES,
  RelationStat,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonEntryRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all entry relations of a person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        entryIds: sql<string>`group_concat(${ENTRY_DATA.c_entry_code})`
      })
      .from(ENTRY_DATA)
      .where(eq(ENTRY_DATA.c_personid, personId))
      .get();

    const ids = results?.entryIds
      ? results.entryIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'ENTRY_DATA'
    );
  }

  /**
   * Get stats by entry type (examination type)
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        entryCode: ENTRY_DATA.c_entry_code,
        count: count()
      })
      .from(ENTRY_DATA)
      .where(eq(ENTRY_DATA.c_personid, personId))
      .groupBy(ENTRY_DATA.c_entry_code)
      .all();

    return statsResults.map(row => {
      const stat = new RelationStat(
        row.count,
        [row.entryCode],
        `ENTRY_DATA:${row.entryCode}`
      );

      (stat as any).entryCode = row.entryCode;
      return stat;
    });
  }

  /**
   * Get stats by year of entry
   */
  async getStatsByYear(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        year: ENTRY_DATA.c_year,
        count: count(),
        entryIds: sql<string>`group_concat(${ENTRY_DATA.c_entry_code})`
      })
      .from(ENTRY_DATA)
      .where(and(
        eq(ENTRY_DATA.c_personid, personId),
        sql`${ENTRY_DATA.c_year} IS NOT NULL`
      ))
      .groupBy(ENTRY_DATA.c_year)
      .all();

    return statsResults.map(row => {
      const ids = row.entryIds
        ? row.entryIds.split(',').map(Number).filter(Boolean)
        : [];

      const stat = new RelationStat(
        row.count,
        ids,
        `ENTRY_DATA:year-${row.year}`
      );

      (stat as any).year = row.year;
      return stat;
    });
  }

  /**
   * Find all entries for a person with code descriptions
   * Returns array of Entry records with trivial joins included
   */
  async findByPersonId(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        entry: ENTRY_DATA,
        entryCode: ENTRY_CODES
      })
      .from(ENTRY_DATA)
      .leftJoin(ENTRY_CODES, eq(ENTRY_DATA.c_entry_code, ENTRY_CODES.c_entry_code))
      .where(eq(ENTRY_DATA.c_personid, personId))
      .all();

    // Map to Entry model with code info
    return results.map(row => {
      const entry = cbdbMapper.entry.fromDb(row.entry);

      // Add entry code info if available
      if (row.entryCode) {
        (entry as any).entryCodeInfo = {
          code: row.entryCode.c_entry_code,
          entryDesc: row.entryCode.c_entry_desc,
          entryDescChn: row.entryCode.c_entry_desc_chn
        };
        // Also set top-level fields for backward compatibility
        (entry as any).entryDesc = row.entryCode.c_entry_desc;
        (entry as any).entryDescChn = row.entryCode.c_entry_desc_chn;
      }

      return entry;
    });
  }
}