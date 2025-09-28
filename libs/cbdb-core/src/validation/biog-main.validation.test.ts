/**
 * Minimal validation test for BIOG_MAIN table
 * Tests that the Person mapper works without crashing
 */

import { describe, test, expect } from 'vitest';
import { getTestDb, setupValidationTest } from './test-setup';
import { BIOG_MAIN } from '../schemas/schema';
import { cbdbMapper } from '../mappers';

describe('BIOG_MAIN Validation', () => {
  setupValidationTest();

  test('should map BIOG_MAIN records to Person without crashing', async () => {
    const db = getTestDb();
    const records = await db.select().from(BIOG_MAIN).limit(10);

    records.forEach((record) => {
      const person = cbdbMapper.person.toTableModel(record);

      // Basic sanity checks
      expect(person).toBeDefined();
      expect(person.id).toBe(record.c_personid);
    });
  });
});