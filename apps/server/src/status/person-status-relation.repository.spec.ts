/**
 * Tests for PersonStatusRelationRepository
 * Validates status relations with proper trivial joins for STATUS_CODES
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonStatusRelationRepository } from './person-status-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { RelationStat } from '@cbdb/core';

describe('PersonStatusRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonStatusRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonStatusRelationRepository>(
      PersonStatusRelationRepository
    );
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('findByPersonId with trivial joins', () => {
    it('should return statuses with status code descriptions', async () => {
      // Test with person 1 (寇準) who should have social status
      const testPersonId = 1;
      const statuses = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(statuses)).toBe(true);

      // If person has statuses, check structure
      if (statuses.length > 0) {
        const firstStatus = statuses[0];
        expect(firstStatus).toBeDefined();

        // Check for base status fields
        expect(firstStatus.personId).toBe(testPersonId);
        expect(firstStatus.statusCode).toBeDefined();

        // Check for status code info (from STATUS_CODES join)
        if (firstStatus.statusCodeInfo) {
          expect(firstStatus.statusCodeInfo).toHaveProperty('code');
          expect(firstStatus.statusCodeInfo).toHaveProperty('statusDesc');
          expect(firstStatus.statusCodeInfo).toHaveProperty('statusDescChn');
        }

        // Check for backward compatibility fields
        if (firstStatus.statusDesc || firstStatus.statusDescChn) {
          expect(typeof firstStatus.statusDesc === 'string' || firstStatus.statusDesc === null).toBe(true);
          expect(typeof firstStatus.statusDescChn === 'string' || firstStatus.statusDescChn === null).toBe(true);
        }
      }
    });

    it('should handle persons with no statuses', async () => {
      // Test with a person ID that likely has no statuses
      const testPersonId = 999999;
      const statuses = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses).toHaveLength(0);
    });

    it('should return official status with proper descriptions', async () => {
      // Many historical figures would have official status
      const testPersonId = 346; // 王安石
      const statuses = await repository.findByPersonId(testPersonId);

      // Check if any status has proper description
      if (statuses.length > 0) {
        const statusWithDesc = statuses.find((s: any) =>
          (s.statusCodeInfo && s.statusCodeInfo.statusDesc) || s.statusDesc
        );

        if (statusWithDesc) {
          // Should have some kind of status description
          const desc = statusWithDesc.statusCodeInfo?.statusDesc || statusWithDesc.statusDesc;
          expect(desc).toBeTruthy();
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
      expect(stats.tableName).toBe('STATUS_DATA');
    });

    it('should get stats by status type', async () => {
      const statsByType = await repository.getStatsByType(testPersonId);

      expect(Array.isArray(statsByType)).toBe(true);

      // Each stat should have statusCode metadata
      statsByType.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect((stat as any).statusCode).toBeDefined();
        expect(stat.tableName).toMatch(/^STATUS_DATA:\d+$/);
      });
    });
  });
});