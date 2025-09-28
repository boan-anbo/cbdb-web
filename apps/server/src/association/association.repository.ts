/**
 * Repository for Association domain
 * Handles database access for ASSOC_DATA table
 */

import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import {
  ASSOC_DATA,
  ASSOC_CODES,
  BIOG_MAIN,
  ADDR_CODES,
  cbdbMapper,
  type AssociationModel,
  type AssociationDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class AssociationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get all associations for a person
   * Includes related association type, person, and address data
   */
  async getPersonAssociations(personId: number): Promise<AssociationModel[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        assocData: ASSOC_DATA,
        assocCode: ASSOC_CODES,
        assocPerson: BIOG_MAIN,
        addrCode: ADDR_CODES
      })
      .from(ASSOC_DATA)
      .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
      .leftJoin(BIOG_MAIN, eq(ASSOC_DATA.c_assoc_id, BIOG_MAIN.c_personid))
      .leftJoin(ADDR_CODES, eq(ASSOC_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(eq(ASSOC_DATA.c_personid, personId));

    const assocData: AssociationDataWithRelations[] = results.map(row => ({
      ...row.assocData,
      assocCode: row.assocCode || undefined,
      assocPerson: row.assocPerson || undefined,
      addrCode: row.addrCode || undefined
    }));

    return assocData.map(data => cbdbMapper.association.toModel(data, data.assocCode));
  }

  /**
   * Get count of associations for a person
   */
  async getAssociationCount(personId: number): Promise<number> {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(ASSOC_DATA)
      .where(eq(ASSOC_DATA.c_personid, personId))
      .get();

    return result?.count ?? 0;
  }

  /**
   * Get associations by type for a person
   */
  async getPersonAssociationsByType(
    personId: number,
    assocCode: number
  ): Promise<AssociationModel[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        assocData: ASSOC_DATA,
        assocCode: ASSOC_CODES,
        assocPerson: BIOG_MAIN,
        addrCode: ADDR_CODES
      })
      .from(ASSOC_DATA)
      .leftJoin(ASSOC_CODES, eq(ASSOC_DATA.c_assoc_code, ASSOC_CODES.c_assoc_code))
      .leftJoin(BIOG_MAIN, eq(ASSOC_DATA.c_assoc_id, BIOG_MAIN.c_personid))
      .leftJoin(ADDR_CODES, eq(ASSOC_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(
        sql`${ASSOC_DATA.c_personid} = ${personId} AND ${ASSOC_DATA.c_assoc_code} = ${assocCode}`
      );

    const assocData: AssociationDataWithRelations[] = results.map(row => ({
      ...row.assocData,
      assocCode: row.assocCode || undefined,
      assocPerson: row.assocPerson || undefined,
      addrCode: row.addrCode || undefined
    }));

    return assocData.map(data => cbdbMapper.association.toModel(data, data.assocCode));
  }
}