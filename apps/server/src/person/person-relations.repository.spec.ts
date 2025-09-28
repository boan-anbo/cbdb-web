import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRelationsRepository } from './person-relations.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

/**
 * PersonRelationsRepository Tests
 * Tests the repository responsible for fetching relation stats
 */
describe('PersonRelationsRepository', () => {
  let module: TestingModule;
  let repository: PersonRelationsRepository;

  beforeAll(async () => {
    module = await getTestModule();
    repository = module.get<PersonRelationsRepository>(PersonRelationsRepository);
  });

  afterAll(async () => {
    await cleanupTestModule(module);
  });

  describe('getRelationStats', () => {
    it('should get relation stats for Wang Anshi', async () => {
      const stats = await repository.getRelationStats(1762);

      expect(stats).toBeDefined();

      // Check kinships
      expect(stats.kinships).toBeDefined();
      expect(stats.kinships.count).toBe(25);
      expect(stats.kinships.ids).toBeDefined();
      expect(stats.kinships.ids.length).toBe(25);
      expect(stats.kinships.tableName).toBe('KIN_DATA');

      // Check addresses
      expect(stats.addresses).toBeDefined();
      expect(stats.addresses.count).toBe(2);
      expect(stats.addresses.ids.length).toBe(2);
      expect(stats.addresses.tableName).toBe('BIOG_ADDR_DATA');

      // Check offices
      expect(stats.offices).toBeDefined();
      expect(stats.offices.count).toBe(41);
      expect(stats.offices.ids.length).toBe(41);
      expect(stats.offices.tableName).toBe('POSTING_DATA');

      // Verify all relation types are present
      expect(stats.entries).toBeDefined();
      expect(stats.statuses).toBeDefined();
      expect(stats.associations).toBeDefined();
      expect(stats.texts).toBeDefined();
      expect(stats.events).toBeDefined();
      expect(stats.altNames).toBeDefined();
    });

    it('should handle person with no relations', async () => {
      // Find a person with minimal relations
      const stats = await repository.getRelationStats(999999);

      expect(stats).toBeDefined();

      // All stats should be present but with 0 counts
      expect(stats.kinships.count).toBe(0);
      expect(stats.kinships.ids).toEqual([]);
      expect(stats.addresses.count).toBe(0);
      expect(stats.addresses.ids).toEqual([]);
    });

    it('should return unique IDs in stats', async () => {
      const stats = await repository.getRelationStats(1762);

      // Check that IDs are unique within each relation type
      const kinshipIds = stats.kinships.ids;
      const uniqueKinshipIds = [...new Set(kinshipIds)];
      expect(kinshipIds.length).toBe(uniqueKinshipIds.length);

      const officeIds = stats.offices.ids;
      const uniqueOfficeIds = [...new Set(officeIds)];
      expect(officeIds.length).toBe(uniqueOfficeIds.length);
    });
  });

  describe('getSelectiveRelations', () => {
    it.skip('should fetch only requested relations - TODO: Finalize expected counts', async () => {
      const relations = await repository.getSelectiveRelations(1762, {
        kinship: true,
        addresses: false,
        offices: true,
        entries: false,
        statuses: false,
        associations: false,
        texts: false,
        events: false,
        altNames: false
      });

      expect(relations.kinships).toBeDefined();
      expect(relations.kinships?.length).toBe(25);

      expect(relations.offices).toBeDefined();
      expect(relations.offices?.length).toBe(41);

      // These should not be present
      expect(relations.addresses).toBeUndefined();
      expect(relations.entries).toBeUndefined();
      expect(relations.statuses).toBeUndefined();
    });

    it('should handle empty relation request', async () => {
      const relations = await repository.getSelectiveRelations(1762, {});

      // No relations should be fetched
      expect(relations.kinships).toBeUndefined();
      expect(relations.addresses).toBeUndefined();
      expect(relations.offices).toBeUndefined();
      expect(relations.entries).toBeUndefined();
      expect(relations.statuses).toBeUndefined();
      expect(relations.associations).toBeUndefined();
      expect(relations.texts).toBeUndefined();
      expect(relations.events).toBeUndefined();
      expect(relations.altNames).toBeUndefined();
    });
  });

  describe('getAllRelations', () => {
    it.skip('should fetch all relations for a person - TODO: Finalize expected counts', async () => {
      const relations = await repository.getAllRelations(1762);

      expect(relations).toBeDefined();

      // All relation arrays should be defined (not undefined)
      expect(relations.kinships).toBeDefined();
      expect(relations.addresses).toBeDefined();
      expect(relations.offices).toBeDefined();
      expect(relations.entries).toBeDefined();
      expect(relations.statuses).toBeDefined();
      expect(relations.associations).toBeDefined();
      expect(relations.texts).toBeDefined();
      expect(relations.events).toBeDefined();
      expect(relations.altNames).toBeDefined();

      // Check actual counts
      expect(relations.kinships.length).toBe(25);
      expect(relations.addresses.length).toBe(2);
      expect(relations.offices.length).toBe(41);
      expect(relations.associations.length).toBe(705);
    });
  });
});