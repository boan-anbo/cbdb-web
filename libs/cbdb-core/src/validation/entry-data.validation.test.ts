/**
 * Minimal validation test for ENTRY_DATA table
 * Tests that the Entry mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { ENTRY_DATA, ENTRY_CODES } from '../schemas/schema';
import { cbdbMapper } from '../mappers';
import { eq } from 'drizzle-orm';

describe('ENTRY_DATA Validation', () => {
  setupValidationTest();

  test('should map ENTRY_DATA records to Entry without crashing', async () => {
    const db = getTestDb();

    const records = await db
      .select()
      .from(ENTRY_DATA)
      .leftJoin(ENTRY_CODES, eq(ENTRY_DATA.c_entry_code, ENTRY_CODES.c_entry_code))
      .limit(10);

    records.forEach((row) => {
      const record = row.ENTRY_DATA;

      const entryDataWithRelations = {
        ...record,
        entryType: row.ENTRY_CODES || undefined
      };

      const entry = cbdbMapper.entry.fromDb(entryDataWithRelations);

      // Basic sanity checks
      expect(entry).toBeDefined();
      expect(entry.personId).toBe(record.c_personid);
    });
  });
});