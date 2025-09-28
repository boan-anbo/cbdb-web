import { Injectable } from '@nestjs/common';
import {
  Entry,
  cbdbMapper,
  ENTRY_DATA,
  ENTRY_CODES,
  type EntryDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq } from 'drizzle-orm';

/**
 * Repository for accessing Entry (government service) data from CBDB
 */
@Injectable()
export class EntryRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find all entry records for a person
   */
  async findByPersonId(personId: number): Promise<Entry[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        entry: ENTRY_DATA,
        entryType: ENTRY_CODES
      })
      .from(ENTRY_DATA)
      .leftJoin(ENTRY_CODES, eq(ENTRY_DATA.c_entry_code, ENTRY_CODES.c_entry_code))
      .where(eq(ENTRY_DATA.c_personid, personId))
      .orderBy(ENTRY_DATA.c_year, ENTRY_DATA.c_sequence);

    const entryData: EntryDataWithRelations[] = results.map(row => ({
      ...row.entry,
      entryCode: row.entryType || undefined
    }));

    return cbdbMapper.entry.fromDbArray(entryData);
  }
}