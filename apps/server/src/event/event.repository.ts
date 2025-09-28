/**
 * Repository for Event domain
 * Handles database access for EVENTS_DATA table
 */

import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  EVENTS_DATA,
  EVENT_CODES,
  ADDR_CODES,
  cbdbMapper,
  type Event,
  type EventDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class EventRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get all events for a person
   */
  async getPersonEvents(personId: number): Promise<Event[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        eventData: EVENTS_DATA,
        eventCode: EVENT_CODES,
        addrCode: ADDR_CODES
      })
      .from(EVENTS_DATA)
      .leftJoin(EVENT_CODES, eq(EVENTS_DATA.c_event_code, EVENT_CODES.c_event_code))
      .leftJoin(ADDR_CODES, eq(EVENTS_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(eq(EVENTS_DATA.c_personid, personId));

    const eventData: EventDataWithRelations[] = results.map(row => ({
      ...row.eventData,
      eventCode: row.eventCode || undefined,
      addrCode: row.addrCode || undefined
    }));

    return cbdbMapper.event.fromDbArray(eventData);
  }
}