/**
 * Minimal validation test for POSTED_TO_OFFICE_DATA table
 * Tests that the Office mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { POSTED_TO_OFFICE_DATA, OFFICE_CODES } from '../schemas/schema';
import { cbdbMapper } from '../mappers';
import { eq } from 'drizzle-orm';

describe('POSTED_TO_OFFICE_DATA Validation', () => {
  setupValidationTest();

  test('should map POSTED_TO_OFFICE_DATA records to Office without crashing', async () => {
    const db = getTestDb();

    const records = await db
      .select()
      .from(POSTED_TO_OFFICE_DATA)
      .leftJoin(OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_office_id, OFFICE_CODES.c_office_id))
      .limit(10);

    records.forEach((row) => {
      const record = row.POSTED_TO_OFFICE_DATA;

      const officeDataWithRelations = {
        ...record,
        officeInfo: row.OFFICE_CODES || undefined
      };

      const office = cbdbMapper.office.fromDb(officeDataWithRelations);

      // Basic sanity checks
      expect(office).toBeDefined();
      expect(office.personId).toBe(record.c_personid);
    });
  });
});