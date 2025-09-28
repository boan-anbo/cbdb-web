/**
 * Repository for Kinship Codes reference data
 * Provides access to KINSHIP_CODES lookup table
 */

import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { KINSHIP_CODES, cbdbMapper } from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import type { KinshipCode } from '@cbdb/core';

@Injectable()
export class KinshipCodesRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get all kinship codes from the database
   * Used for caching reference data in frontend
   */
  async getAllKinshipCodes(): Promise<KinshipCode[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(KINSHIP_CODES)
      .orderBy(KINSHIP_CODES.c_kincode)
      .all();

    return cbdbMapper.kinshipCode.fromDbArray(results);
  }

  /**
   * Get a specific kinship code by ID
   */
  async getKinshipCode(code: number): Promise<KinshipCode | null> {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select()
      .from(KINSHIP_CODES)
      .where(eq(KINSHIP_CODES.c_kincode, code))
      .get();

    if (!result) {
      return null;
    }

    return cbdbMapper.kinshipCode.fromDb(result);
  }

  /**
   * Get multiple kinship codes by IDs
   * Useful for batch lookups
   */
  async getKinshipCodes(codes: number[]): Promise<Map<number, KinshipCode>> {
    if (codes.length === 0) {
      return new Map();
    }

    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(KINSHIP_CODES)
      .where(inArray(KINSHIP_CODES.c_kincode, codes))
      .all();

    const kinshipCodes = cbdbMapper.kinshipCode.fromDbArray(results);

    // Return as map for easy lookup
    const codeMap = new Map<number, KinshipCode>();
    kinshipCodes.forEach(kc => {
      codeMap.set(kc.code, kc);
    });

    return codeMap;
  }
}