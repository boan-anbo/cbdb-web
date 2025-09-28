/**
 * Repository for Person-to-Text Relations
 * Handles relationships between persons and texts (writings, publications)
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, count } from 'drizzle-orm';
import {
  BIOG_TEXT_DATA,
  TEXT_CODES,
  TEXT_ROLE_CODES,
  RelationStat,
  cbdbMapper
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonTextRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all text relations of a person
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        textIds: sql<string>`group_concat(${BIOG_TEXT_DATA.c_textid})`
      })
      .from(BIOG_TEXT_DATA)
      .where(eq(BIOG_TEXT_DATA.c_personid, personId))
      .get();

    const ids = results?.textIds
      ? results.textIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'BIOG_TEXT_DATA'
    );
  }

  /**
   * Get stats by text role (author, editor, etc.)
   */
  async getStatsByRole(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    const statsResults = await db
      .select({
        roleId: BIOG_TEXT_DATA.c_role_id,
        count: count(),
        textIds: sql<string>`group_concat(${BIOG_TEXT_DATA.c_textid})`
      })
      .from(BIOG_TEXT_DATA)
      .where(eq(BIOG_TEXT_DATA.c_personid, personId))
      .groupBy(BIOG_TEXT_DATA.c_role_id)
      .all();

    return statsResults.map(row => {
      const ids = row.textIds
        ? row.textIds.split(',').map(Number).filter(Boolean)
        : [];

      const stat = new RelationStat(
        row.count,
        ids,
        `BIOG_TEXT_DATA:role-${row.roleId}`
      );

      (stat as any).roleId = row.roleId;
      return stat;
    });
  }

  /**
   * Get stats for authored texts only (role_id = 1)
   */
  async getStatsAuthoredTexts(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        textIds: sql<string>`group_concat(${BIOG_TEXT_DATA.c_textid})`
      })
      .from(BIOG_TEXT_DATA)
      .where(and(
        eq(BIOG_TEXT_DATA.c_personid, personId),
        eq(BIOG_TEXT_DATA.c_role_id, 1) // Author role
      ))
      .get();

    const ids = results?.textIds
      ? results.textIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'BIOG_TEXT_DATA:authored'
    );
  }

  /**
   * Find all texts for a person with code descriptions
   * Returns array of Text records with trivial joins included
   */
  async findByPersonId(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        text: BIOG_TEXT_DATA,
        textCode: TEXT_CODES,
        roleCode: TEXT_ROLE_CODES
      })
      .from(BIOG_TEXT_DATA)
      .leftJoin(TEXT_CODES, eq(BIOG_TEXT_DATA.c_textid, TEXT_CODES.c_textid))
      .leftJoin(TEXT_ROLE_CODES, eq(BIOG_TEXT_DATA.c_role_id, TEXT_ROLE_CODES.c_role_id))
      .where(eq(BIOG_TEXT_DATA.c_personid, personId))
      .all();

    // Map to Text model with code info
    return results.map(row => {
      const text = cbdbMapper.text.fromDb(row.text);

      // Add text code info if available
      if (row.textCode) {
        (text as any).textCodeInfo = {
          id: row.textCode.c_textid,
          title: row.textCode.c_title,
          titleChn: row.textCode.c_title_chn,
          textType: row.textCode.c_text_type_id
        };
        // Also set top-level fields for backward compatibility
        (text as any).textName = row.textCode.c_title;
        (text as any).textNameChn = row.textCode.c_title_chn;
        (text as any).textType = row.textCode.c_text_type_id;
      }

      // Add role code info if available
      if (row.roleCode) {
        (text as any).roleCodeInfo = {
          id: row.roleCode.c_role_id,
          roleName: row.roleCode.c_role_desc,
          roleNameChn: row.roleCode.c_role_desc_chn
        };
        // Also set top-level fields for backward compatibility
        (text as any).textRole = row.roleCode.c_role_desc;
        (text as any).textRoleChn = row.roleCode.c_role_desc_chn;
      }

      return text;
    });
  }
}