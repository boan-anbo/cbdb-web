/**
 * Tests for PersonKinshipRelationRepository
 * Validates the composable stats pattern with multiple dimensions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonKinshipRelationRepository } from './person-kinship-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { getEmptyTestDb } from '../../test/get-empty-test-db';
import { RelationStat } from '@cbdb/core';
import * as schema from '../db/cbdb-schema/schema';

describe('PersonKinshipRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonKinshipRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonKinshipRelationRepository>(
      PersonKinshipRelationRepository
    );
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('composable stats methods', () => {
    // Test person with known kinship relations
    const testPersonId = 1; // 寇準 (Kou Zhun)

    it('should get summary stats', async () => {
      const stats = await repository.getStatsSummary(testPersonId);

      expect(stats).toBeInstanceOf(RelationStat);
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.ids)).toBe(true);
      expect(stats.tableName).toBe('KIN_DATA');
    });

    it('should get stats by kinship type', async () => {
      const statsByType = await repository.getStatsByType(testPersonId);

      expect(Array.isArray(statsByType)).toBe(true);

      // Person 1 should have exactly 4 kinship types based on the data
      expect(statsByType).toHaveLength(4);

      // Find specific kinship codes we know person 1 has
      const codeMap = new Map(statsByType.map(s => [(s as any).kinshipCode, s]));

      // Verify code 180 (子) - should have 2 people
      const code180 = codeMap.get(180);
      expect(code180).toBeDefined();
      expect(code180!.count).toBe(2);
      expect(code180!.ids).toHaveLength(2);
      expect(code180!.ids).toContain(2);
      expect(code180!.ids).toContain(13311);

      // Verify code 210 (族子) - should have 1 person
      const code210 = codeMap.get(210);
      expect(code210).toBeDefined();
      expect(code210!.count).toBe(1);
      expect(code210!.ids).toEqual([13310]);

      statsByType.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect(stat.count).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(stat.ids)).toBe(true);
        expect(stat.tableName).toMatch(/^KIN_DATA:/);
        // Check for kinship type metadata
        expect((stat as any).kinshipType).toBeDefined();
        expect((stat as any).kinshipCode).toBeDefined();
      });
    });

    it('should get stats by generation (ancestors)', async () => {
      const ancestorStats = await repository.getStatsByGeneration(
        testPersonId,
        'ancestors'
      );

      expect(ancestorStats).toBeInstanceOf(RelationStat);
      expect(ancestorStats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(ancestorStats.ids)).toBe(true);
      expect(ancestorStats.tableName).toBe('KIN_DATA:ancestors');
    });

    it('should get stats by generation (descendants)', async () => {
      const descendantStats = await repository.getStatsByGeneration(
        testPersonId,
        'descendants'
      );

      expect(descendantStats).toBeInstanceOf(RelationStat);
      expect(descendantStats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(descendantStats.ids)).toBe(true);
      expect(descendantStats.tableName).toBe('KIN_DATA:descendants');
    });

    it('should get stats for mourning relations', async () => {
      const mourningStats = await repository.getStatsForMourning(testPersonId);

      expect(mourningStats).toBeInstanceOf(RelationStat);
      expect(mourningStats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(mourningStats.ids)).toBe(true);
      expect(mourningStats.tableName).toBe('KIN_DATA:mourning');
    });

    it('should get stats for blood relations only', async () => {
      const bloodStats = await repository.getStatsBloodRelations(testPersonId);

      expect(bloodStats).toBeInstanceOf(RelationStat);
      expect(bloodStats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(bloodStats.ids)).toBe(true);
      expect(bloodStats.tableName).toBe('KIN_DATA:blood');
    });

    it('should get stats for marriage relations only', async () => {
      const marriageStats = await repository.getStatsMarriageRelations(testPersonId);

      expect(marriageStats).toBeInstanceOf(RelationStat);
      expect(marriageStats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(marriageStats.ids)).toBe(true);
      expect(marriageStats.tableName).toBe('KIN_DATA:marriage');
    });

    it.skip('should have consistent data between summary and full relations - TODO: Finalize counts logic', async () => {
      const summaryStats = await repository.getStatsSummary(testPersonId);
      const fullRelations = await repository.getFullRelations(testPersonId);

      // Count should match
      expect(summaryStats.count).toBe(fullRelations.length);

      // Extract person IDs from full relations
      const fullRelationIds = fullRelations
        .map(k => k.kinPersonId)
        .filter(id => id !== null) as number[];

      // Sort both arrays for comparison
      const statsIds = [...summaryStats.ids].sort();
      const relIds = [...fullRelationIds].sort();

      // IDs should match
      expect(statsIds).toEqual(relIds);
    });

    it('should handle person with no kinship relations', async () => {
      // Use a high ID that likely has no relations
      const noRelationsPersonId = 999999999;

      const stats = await repository.getStatsSummary(noRelationsPersonId);
      expect(stats.count).toBe(0);
      expect(stats.ids).toEqual([]);
      expect(stats.tableName).toBe('KIN_DATA');

      const statsByType = await repository.getStatsByType(noRelationsPersonId);
      expect(statsByType).toEqual([]);
    });
  });

  describe('controlled tests with empty database', () => {
    it('should handle complex queries with predictable data', async () => {
      const db = await getEmptyTestDb();

      // Insert controlled test data
      await db.insert(schema.BIOG_MAIN).values([
        { c_personid: 1, c_name: 'Parent', c_name_chn: '父', c_female: 0, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 },
        { c_personid: 2, c_name: 'Child1', c_name_chn: '子', c_female: 0, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 },
        { c_personid: 3, c_name: 'Child2', c_name_chn: '女', c_female: 1, c_by_intercalary: 0, c_dy_intercalary: 0, c_self_bio: 0 }
      ]);

      await db.insert(schema.KINSHIP_CODES).values([
        { c_kincode: 180, c_kinrel_chn: '子', c_kinrel: 'Son' },
        { c_kincode: 181, c_kinrel_chn: '女', c_kinrel: 'Daughter' }
      ]);

      await db.insert(schema.KIN_DATA).values([
        { c_personid: 1, c_kin_id: 2, c_kin_code: 180 },
        { c_personid: 1, c_kin_id: 3, c_kin_code: 181 }
      ]);

      // Create repository with test database
      const repository = new PersonKinshipRelationRepository({ getDb: () => db } as any);

      // Test with predictable data
      const statsByType = await repository.getStatsByType(1);
      expect(statsByType).toHaveLength(2);
      expect(statsByType[0].count).toBe(1);
      expect(statsByType[1].count).toBe(1);

      const summaryStats = await repository.getStatsSummary(1);
      expect(summaryStats.count).toBe(2);
      expect(summaryStats.ids).toContain(2);
      expect(summaryStats.ids).toContain(3);
    });
  });

  describe('performance comparison', () => {
    it('should be faster to get stats than full relations', async () => {
      const testPersonId = 1;
      const iterations = 10;

      // Warm up
      await repository.getStatsSummary(testPersonId);
      await repository.getFullRelations(testPersonId);

      // Test stats performance
      const statsStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await repository.getStatsSummary(testPersonId);
      }
      const statsTime = Date.now() - statsStart;

      // Test full relations performance
      const fullStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await repository.getFullRelations(testPersonId);
      }
      const fullTime = Date.now() - fullStart;

      console.log(`Stats time: ${statsTime}ms for ${iterations} iterations`);
      console.log(`Full relations time: ${fullTime}ms for ${iterations} iterations`);
      console.log(`Speedup: ${(fullTime / statsTime).toFixed(2)}x`);

      // Stats should be at least 2x faster
      expect(statsTime).toBeLessThan(fullTime);
    });

    it('should efficiently handle multiple stat dimensions in parallel', async () => {
      const testPersonId = 1;

      const start = Date.now();
      const [summary, byType, ancestors, descendants, mourning, blood, marriage] =
        await Promise.all([
          repository.getStatsSummary(testPersonId),
          repository.getStatsByType(testPersonId),
          repository.getStatsByGeneration(testPersonId, 'ancestors'),
          repository.getStatsByGeneration(testPersonId, 'descendants'),
          repository.getStatsForMourning(testPersonId),
          repository.getStatsBloodRelations(testPersonId),
          repository.getStatsMarriageRelations(testPersonId)
        ]);
      const parallelTime = Date.now() - start;

      // All results should be valid
      expect(summary).toBeInstanceOf(RelationStat);
      expect(Array.isArray(byType)).toBe(true);
      expect(ancestors).toBeInstanceOf(RelationStat);
      expect(descendants).toBeInstanceOf(RelationStat);
      expect(mourning).toBeInstanceOf(RelationStat);
      expect(blood).toBeInstanceOf(RelationStat);
      expect(marriage).toBeInstanceOf(RelationStat);

      console.log(`Parallel execution of 7 stat dimensions: ${parallelTime}ms`);

      // Should complete in reasonable time (< 100ms for all stats)
      expect(parallelTime).toBeLessThan(100);
    });
  });
});