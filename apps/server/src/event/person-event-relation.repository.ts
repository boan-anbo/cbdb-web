/**
 * Repository for Person-to-Event Relations
 * Handles relationships between persons and historical events
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, count } from 'drizzle-orm';
import {
  EVENTS_DATA,
  EVENT_CODES,
  RelationStat,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonEventRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all event relations of a person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        eventCodes: sql<string>`group_concat(${EVENTS_DATA.c_event_code})`
      })
      .from(EVENTS_DATA)
      .where(eq(EVENTS_DATA.c_personid, personId))
      .get();

    const ids = results?.eventCodes
      ? results.eventCodes.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'EVENTS_DATA'
    );
  }

  /**
   * Get stats by event type
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        eventCode: EVENTS_DATA.c_event_code,
        count: count()
      })
      .from(EVENTS_DATA)
      .where(eq(EVENTS_DATA.c_personid, personId))
      .groupBy(EVENTS_DATA.c_event_code)
      .all();

    return statsResults.map(row => {
      const stat = new RelationStat(
        row.count,
        row.eventCode ? [row.eventCode] : [],
        `EVENTS_DATA:${row.eventCode}`
      );

      (stat as any).eventCode = row.eventCode;
      return stat;
    });
  }

  /**
   * Get stats by time period
   */
  async getStatsByTimePeriod(
    personId: number,
    startYear?: number,
    endYear?: number
  ): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const whereConditions = [eq(EVENTS_DATA.c_personid, personId)];

    if (startYear !== undefined) {
      whereConditions.push(sql`${EVENTS_DATA.c_year} >= ${startYear}`);
    }
    if (endYear !== undefined) {
      whereConditions.push(sql`${EVENTS_DATA.c_year} <= ${endYear}`);
    }

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        eventCodes: sql<string>`group_concat(${EVENTS_DATA.c_event_code})`
      })
      .from(EVENTS_DATA)
      .where(and(...whereConditions))
      .get();

    const ids = results?.eventCodes
      ? results.eventCodes.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      `EVENTS_DATA:${startYear || 'any'}-${endYear || 'any'}`
    );
  }

  /**
   * Find all events for a person
   * Returns array of Event records
   */
  async findByPersonId(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(EVENTS_DATA)
      .where(eq(EVENTS_DATA.c_personid, personId))
      .all();

    // Map to Event model using cbdbMapper
    return results.map(row => cbdbMapper.event.fromDb(row));
  }
}