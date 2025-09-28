import { Injectable } from '@nestjs/common';
import { KINSHIP_CODES } from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq, inArray, like, and } from 'drizzle-orm';

/**
 * Pure domain repository for Kinship codes/types
 * Only handles kinship reference data, not person relationships
 * For person-kinship relationships, use PersonKinshipRelationRepository
 */
@Injectable()
export class KinshipRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find a kinship type by its code
   */
  async findByCode(code: number) {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select()
      .from(KINSHIP_CODES)
      .where(eq(KINSHIP_CODES.c_kincode, code))
      .get();

    return result;
  }

  /**
   * Find multiple kinship types by codes
   */
  async findByCodes(codes: number[]) {
    if (codes.length === 0) return [];

    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(KINSHIP_CODES)
      .where(inArray(KINSHIP_CODES.c_kincode, codes))
      .all();

    return results;
  }

  /**
   * Get all kinship types
   */
  async getAllKinshipTypes() {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(KINSHIP_CODES)
      .all();

    return results;
  }

  /**
   * Search kinship types by Chinese or English description
   */
  async searchByDescription(query: string) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(KINSHIP_CODES)
      .where(
        like(KINSHIP_CODES.c_kinrel_chn, `%${query}%`)
      )
      .all();

    return results;
  }

  /**
   * Get kinship types for specific generation steps
   * Used for analyzing generational relationships
   */
  async getByGenerationStep(upstep?: number, downstep?: number) {
    const db = this.cbdbConnection.getDb();

    const whereConditions: any[] = [];

    if (upstep !== undefined) {
      whereConditions.push(eq(KINSHIP_CODES.c_upstep, upstep));
    }

    if (downstep !== undefined) {
      whereConditions.push(eq(KINSHIP_CODES.c_dwnstep, downstep));
    }

    if (whereConditions.length === 0) {
      return db.select().from(KINSHIP_CODES).all();
    }

    return db
      .select()
      .from(KINSHIP_CODES)
      .where(and(...whereConditions))
      .all();
  }
}