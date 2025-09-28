/**
 * Tests for PersonTextRelationRepository
 * Validates text relations with proper trivial joins for text codes and role codes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonTextRelationRepository } from './person-text-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { RelationStat } from '@cbdb/core';

describe('PersonTextRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonTextRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonTextRelationRepository>(
      PersonTextRelationRepository
    );
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('findByPersonId with trivial joins', () => {
    it('should return texts with text code info and role code info', async () => {
      // Test with person 65773 who has many texts
      const testPersonId = 65773;
      const texts = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(texts)).toBe(true);
      expect(texts.length).toBeGreaterThan(0);

      // Check first text has proper structure
      const firstText = texts[0];
      expect(firstText).toBeDefined();

      // Check for base text fields
      expect(firstText.personId).toBe(testPersonId);
      expect(firstText.textId).toBeDefined();

      // Check for text code info (from TEXT_CODES join)
      if (firstText.textCodeInfo) {
        expect(firstText.textCodeInfo).toHaveProperty('id');
        expect(firstText.textCodeInfo).toHaveProperty('title');
        expect(firstText.textCodeInfo).toHaveProperty('titleChn');
        expect(firstText.textCodeInfo).toHaveProperty('textType');
      }

      // Check for backward compatibility fields
      if (firstText.textName || firstText.textNameChn) {
        expect(typeof firstText.textName === 'string' || firstText.textName === null).toBe(true);
        expect(typeof firstText.textNameChn === 'string' || firstText.textNameChn === null).toBe(true);
      }

      // Check for role code info (from TEXT_ROLE_CODES join)
      if (firstText.roleCodeInfo) {
        expect(firstText.roleCodeInfo).toHaveProperty('id');
        expect(firstText.roleCodeInfo).toHaveProperty('roleName');
        expect(firstText.roleCodeInfo).toHaveProperty('roleNameChn');
      }

      // Check for backward compatibility role fields
      if (firstText.textRole || firstText.textRoleChn) {
        expect(typeof firstText.textRole === 'string' || firstText.textRole === null).toBe(true);
        expect(typeof firstText.textRoleChn === 'string' || firstText.textRoleChn === null).toBe(true);
      }
    });

    it('should handle persons with no texts', async () => {
      // Test with a person ID that likely has no texts
      const testPersonId = 999999;
      const texts = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(texts)).toBe(true);
      expect(texts).toHaveLength(0);
    });

    it('should return proper text descriptions for authored texts', async () => {
      // Test with person 65773 who authored many texts
      const testPersonId = 65773;
      const texts = await repository.findByPersonId(testPersonId);

      // Find authored texts (role_id = 1)
      const authoredTexts = texts.filter((t: any) => t.roleId === 1);
      expect(authoredTexts.length).toBeGreaterThan(0);

      const firstAuthoredText = authoredTexts[0];

      // Should have role info for "author" (lowercase in database)
      if (firstAuthoredText.roleCodeInfo) {
        expect(firstAuthoredText.roleCodeInfo.roleName).toContain('author');
      }
      // Or backward compatible field
      if (firstAuthoredText.textRole) {
        expect(firstAuthoredText.textRole).toContain('author');
      }
    });
  });

  describe('stats methods', () => {
    const testPersonId = 65773; // Person with many texts

    it('should get summary stats', async () => {
      const stats = await repository.getStatsSummary(testPersonId);

      expect(stats).toBeInstanceOf(RelationStat);
      expect(stats.count).toBeGreaterThan(0);
      expect(Array.isArray(stats.ids)).toBe(true);
      expect(stats.tableName).toBe('BIOG_TEXT_DATA');
    });

    it('should get stats by role', async () => {
      const statsByRole = await repository.getStatsByRole(testPersonId);

      expect(Array.isArray(statsByRole)).toBe(true);
      expect(statsByRole.length).toBeGreaterThan(0);

      // Each stat should have roleId metadata
      statsByRole.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect((stat as any).roleId).toBeDefined();
        expect(stat.tableName).toMatch(/^BIOG_TEXT_DATA:role-\d+$/);
      });
    });

    it('should get stats for authored texts only', async () => {
      const authoredStats = await repository.getStatsAuthoredTexts(testPersonId);

      expect(authoredStats).toBeInstanceOf(RelationStat);
      expect(authoredStats.tableName).toBe('BIOG_TEXT_DATA:authored');

      // Wang Anshi should have authored texts
      expect(authoredStats.count).toBeGreaterThan(0);
      expect(authoredStats.ids.length).toBe(authoredStats.count);
    });
  });
});