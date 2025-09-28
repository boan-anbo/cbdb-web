/**
 * Minimal validation test for BIOG_ADDR_DATA table
 * Tests that the Address mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { BIOG_ADDR_DATA } from '../schemas/schema';
import { cbdbMapper } from '../mappers';

describe('BIOG_ADDR_DATA Validation', () => {
  setupValidationTest();

  test('should map BIOG_ADDR_DATA records to Address without crashing', async () => {
    const db = getTestDb();

    const records = await db
      .select()
      .from(BIOG_ADDR_DATA)
      .limit(10);

    records.forEach((record) => {
      // For now, just test with the base record without joins
      // This avoids the type mismatch issues with ADDRESSES table
      const address = cbdbMapper.address.fromDb(record);

      // Basic sanity checks
      expect(address).toBeDefined();
      expect(address.personId).toBe(record.c_personid);
    });
  });
});