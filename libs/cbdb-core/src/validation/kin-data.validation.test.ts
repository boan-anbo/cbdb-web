/**
 * Minimal validation test for KIN_DATA table
 * Tests that the Kinship mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { KIN_DATA, KINSHIP_CODES, BIOG_MAIN } from '../schemas/schema';
import { cbdbMapper } from '../mappers';
import { eq } from 'drizzle-orm';

describe('KIN_DATA Validation', () => {
  setupValidationTest();

  test('should map KIN_DATA records to Kinship without crashing', async () => {
    const db = getTestDb();

    const records = await db
      .select()
      .from(KIN_DATA)
      .leftJoin(BIOG_MAIN, eq(KIN_DATA.c_kin_id, BIOG_MAIN.c_personid))
      .leftJoin(KINSHIP_CODES, eq(KIN_DATA.c_kin_code, KINSHIP_CODES.c_kincode))
      .limit(10);

    records.forEach((row) => {
      const record = row.KIN_DATA;

      const kinshipDataWithRelations = {
        ...record,
        kinshipCode: row.KINSHIP_CODES || undefined,
        kinPerson: row.BIOG_MAIN || undefined
      };

      const kinship = cbdbMapper.kinship.fromDb(kinshipDataWithRelations);

      // Basic sanity checks
      expect(kinship).toBeDefined();
      expect(kinship.personId).toBe(record.c_personid);
    });
  });
});