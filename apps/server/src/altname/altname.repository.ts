/**
 * Repository for AltName domain
 * Handles database access for ALTNAME_DATA table
 */

import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  ALTNAME_DATA,
  ALTNAME_CODES,
  cbdbMapper,
  RelationStat,
  type AltName,
  type AltNameDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class AltNameRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get all alternative names for a person
   */
  async getPersonAltNames(personId: number): Promise<AltName[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        altNameData: ALTNAME_DATA,
        altNameCode: ALTNAME_CODES
      })
      .from(ALTNAME_DATA)
      .leftJoin(ALTNAME_CODES, eq(ALTNAME_DATA.c_alt_name_type_code, ALTNAME_CODES.c_name_type_code))
      .where(eq(ALTNAME_DATA.c_personid, personId));

    const altNameData: AltNameDataWithRelations[] = results.map(row => ({
      ...row.altNameData,
      altNameCode: row.altNameCode || undefined
    }));

    return cbdbMapper.altname.fromDbArray(altNameData);
  }

  /**
   * Find all alternative names for a person
   * Alias for getPersonAltNames for consistency with other repositories
   */
  async findByPersonId(personId: number): Promise<AltName[]> {
    return this.getPersonAltNames(personId);
  }

  /**
   * Get stats summary for alternative names
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({ c_sequence: ALTNAME_DATA.c_sequence })
      .from(ALTNAME_DATA)
      .where(eq(ALTNAME_DATA.c_personid, personId));

    return new RelationStat(
      results.length,
      results.map(r => r.c_sequence).filter(id => id !== null) as number[],
      'ALTNAME_DATA'
    );
  }
}