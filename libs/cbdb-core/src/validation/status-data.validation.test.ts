/**
 * Minimal validation test for STATUS_DATA table
 * Tests that the Status mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { STATUS_DATA, STATUS_CODES } from '../schemas/schema';
import { cbdbMapper } from '../mappers';
import { eq } from 'drizzle-orm';

describe('STATUS_DATA Validation', () => {
  setupValidationTest();

  test('should map STATUS_DATA records to Status without crashing', async () => {
    const db = getTestDb();

    const records = await db
      .select()
      .from(STATUS_DATA)
      .leftJoin(STATUS_CODES, eq(STATUS_DATA.c_status_code, STATUS_CODES.c_status_code))
      .limit(10);

    records.forEach((row) => {
      const record = row.STATUS_DATA;

      const statusDataWithRelations = {
        ...record,
        statusType: row.STATUS_CODES || undefined
      };

      const status = cbdbMapper.status.fromDb(statusDataWithRelations);

      // Basic sanity checks
      expect(status).toBeDefined();
      expect(status.personId).toBe(record.c_personid);
    });
  });
});