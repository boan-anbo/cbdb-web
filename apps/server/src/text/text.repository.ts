/**
 * Repository for Text domain
 * Handles database access for BIOG_TEXT_DATA table
 */

import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import {
  BIOG_TEXT_DATA,
  TEXT_CODES,
  TEXT_ROLE_CODES,
  cbdbMapper,
  type Text,
  type BiogTextDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class TextRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get all text relationships for a person
   * Includes text information and role descriptions
   */
  async getPersonTexts(personId: number): Promise<Text[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        textData: BIOG_TEXT_DATA,
        textCode: TEXT_CODES,
        roleCode: TEXT_ROLE_CODES
      })
      .from(BIOG_TEXT_DATA)
      .leftJoin(TEXT_CODES, eq(BIOG_TEXT_DATA.c_textid, TEXT_CODES.c_textid))
      .leftJoin(TEXT_ROLE_CODES, eq(BIOG_TEXT_DATA.c_role_id, TEXT_ROLE_CODES.c_role_id))
      .where(eq(BIOG_TEXT_DATA.c_personid, personId));

    const textData: BiogTextDataWithRelations[] = results.map(row => ({
      ...row.textData,
      textCode: row.textCode || undefined,
      roleCode: row.roleCode || undefined
    }));

    return cbdbMapper.text.fromDbArray(textData);
  }

  /**
   * Get count of texts for a person
   */
  async getTextCount(personId: number): Promise<number> {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(BIOG_TEXT_DATA)
      .where(eq(BIOG_TEXT_DATA.c_personid, personId))
      .get();

    return result?.count ?? 0;
  }

  /**
   * Get texts by role for a person
   * @param personId Person ID
   * @param roleId Role ID (1=author, 2=editor, 3=compiler, etc.)
   */
  async getPersonTextsByRole(personId: number, roleId: number): Promise<Text[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        textData: BIOG_TEXT_DATA,
        textCode: TEXT_CODES,
        roleCode: TEXT_ROLE_CODES
      })
      .from(BIOG_TEXT_DATA)
      .leftJoin(TEXT_CODES, eq(BIOG_TEXT_DATA.c_textid, TEXT_CODES.c_textid))
      .leftJoin(TEXT_ROLE_CODES, eq(BIOG_TEXT_DATA.c_role_id, TEXT_ROLE_CODES.c_role_id))
      .where(
        sql`${BIOG_TEXT_DATA.c_personid} = ${personId} AND ${BIOG_TEXT_DATA.c_role_id} = ${roleId}`
      );

    const textData: BiogTextDataWithRelations[] = results.map(row => ({
      ...row.textData,
      textCode: row.textCode || undefined,
      roleCode: row.roleCode || undefined
    }));

    return cbdbMapper.text.fromDbArray(textData);
  }

  /**
   * Get all authors of a specific text
   */
  async getTextAuthors(textId: number): Promise<Text[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        textData: BIOG_TEXT_DATA,
        textCode: TEXT_CODES,
        roleCode: TEXT_ROLE_CODES
      })
      .from(BIOG_TEXT_DATA)
      .leftJoin(TEXT_CODES, eq(BIOG_TEXT_DATA.c_textid, TEXT_CODES.c_textid))
      .leftJoin(TEXT_ROLE_CODES, eq(BIOG_TEXT_DATA.c_role_id, TEXT_ROLE_CODES.c_role_id))
      .where(eq(BIOG_TEXT_DATA.c_textid, textId));

    const textData: BiogTextDataWithRelations[] = results.map(row => ({
      ...row.textData,
      textCode: row.textCode || undefined,
      roleCode: row.roleCode || undefined
    }));

    return cbdbMapper.text.fromDbArray(textData);
  }
}