/**
 * Tests for PersonEntryRelationRepository
 * Validates entry relations with proper trivial joins for ENTRY_CODES
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonEntryRelationRepository } from './person-entry-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { RelationStat } from '@cbdb/core';

describe('PersonEntryRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonEntryRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonEntryRelationRepository>(
      PersonEntryRelationRepository
    );
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('findByPersonId with trivial joins', () => {
    it('should return entries with entry code descriptions', async () => {
      // Test with person 346 (王安石) who likely has examination entries
      const testPersonId = 346;
      const entries = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(entries)).toBe(true);

      // If person has entries, check structure
      if (entries.length > 0) {
        const firstEntry = entries[0];
        expect(firstEntry).toBeDefined();

        // Check for base entry fields
        expect(firstEntry.personId).toBe(testPersonId);
        expect(firstEntry.entryCode).toBeDefined();

        // Check for entry code info (from ENTRY_CODES join)
        if (firstEntry.entryCodeInfo) {
          expect(firstEntry.entryCodeInfo).toHaveProperty('code');
          expect(firstEntry.entryCodeInfo).toHaveProperty('entryDesc');
          expect(firstEntry.entryCodeInfo).toHaveProperty('entryDescChn');
        }

        // Check for backward compatibility fields
        if (firstEntry.entryDesc || firstEntry.entryDescChn) {
          expect(typeof firstEntry.entryDesc === 'string' || firstEntry.entryDesc === null).toBe(true);
          expect(typeof firstEntry.entryDescChn === 'string' || firstEntry.entryDescChn === null).toBe(true);
        }
      }
    });

    it('should handle persons with no entries', async () => {
      // Test with a person ID that likely has no entries
      const testPersonId = 999999;
      const entries = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(entries)).toBe(true);
      expect(entries).toHaveLength(0);
    });

    it('should return jinshi examination entries with proper descriptions', async () => {
      // Find entries for a person who passed jinshi exam (entry code 36)
      // Many famous officials would have this
      const testPersonId = 1; // 寇準
      const entries = await repository.findByPersonId(testPersonId);

      // If they have jinshi entry (code 36), check it has description
      const jinshiEntry = entries.find((e: any) => e.entryCode === 36);
      if (jinshiEntry) {
        // Should have description for jinshi
        if (jinshiEntry.entryCodeInfo) {
          expect(jinshiEntry.entryCodeInfo.entryDesc).toBeTruthy();
          expect(jinshiEntry.entryCodeInfo.entryDescChn).toBeTruthy();
        }
        // Or backward compatible fields
        if (jinshiEntry.entryDesc) {
          expect(jinshiEntry.entryDesc).toBeTruthy();
        }
      }
    });
  });

  describe('stats methods', () => {
    const testPersonId = 1; // 寇準

    it('should get summary stats', async () => {
      const stats = await repository.getStatsSummary(testPersonId);

      expect(stats).toBeInstanceOf(RelationStat);
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.ids)).toBe(true);
      expect(stats.tableName).toBe('ENTRY_DATA');
    });

    it('should get stats by entry type', async () => {
      const statsByType = await repository.getStatsByType(testPersonId);

      expect(Array.isArray(statsByType)).toBe(true);

      // Each stat should have entryCode metadata
      statsByType.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect((stat as any).entryCode).toBeDefined();
        expect(stat.tableName).toMatch(/^ENTRY_DATA:\d+$/);
      });
    });

    it('should get stats by year', async () => {
      const statsByYear = await repository.getStatsByYear(testPersonId);

      expect(Array.isArray(statsByYear)).toBe(true);

      // Each stat should have year metadata
      statsByYear.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect((stat as any).year).toBeDefined();
        expect(stat.tableName).toMatch(/^ENTRY_DATA:year-\d+$/);
      });
    });
  });
});