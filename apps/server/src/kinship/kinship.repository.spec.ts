import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { KinshipRepository } from './kinship.repository';
import { TestDatabaseConfig } from '../../test/test-database.config';

/**
 * KinshipRepository Integration Tests
 * Tests for the pure domain repository that handles kinship codes/types
 * This does NOT test person-kinship relationships (see person-kinship-relation.repository.spec.ts)
 */
describe('KinshipRepository (Real Database)', () => {
  let module: TestingModule;
  let repository: KinshipRepository;

  beforeAll(async () => {
    module = await TestDatabaseConfig.createTestingModule();

    // Initialize all modules (triggers onModuleInit)
    await module.init();

    repository = module.get<KinshipRepository>(KinshipRepository);
  });

  afterAll(async () => {
    await TestDatabaseConfig.cleanup(module);
  });

  describe('KinshipRepository methods', () => {
    it('should have getAllKinshipTypes method', async () => {
      const allTypes = await repository.getAllKinshipTypes();

      expect(allTypes).toBeDefined();
      expect(Array.isArray(allTypes)).toBe(true);
      // Should have kinship types in the database
      expect(allTypes.length).toBeGreaterThan(0);

      // Check structure if we have data
      if (allTypes.length > 0) {
        const type = allTypes[0];
        expect(type).toHaveProperty('c_kincode');
        expect(type).toHaveProperty('c_kinrel_chn');
      }
    });

    it('should find kinship type by code', async () => {
      // First get all types to find a valid code
      const allTypes = await repository.getAllKinshipTypes();

      if (allTypes.length > 0) {
        const testCode = allTypes[0].c_kincode;
        const kinshipType = await repository.findByCode(testCode);

        expect(kinshipType).toBeDefined();
        expect(kinshipType?.c_kincode).toBe(testCode);
      }
    });

    it('should find multiple kinship types by codes', async () => {
      // Get all types to find valid codes
      const allTypes = await repository.getAllKinshipTypes();

      if (allTypes.length >= 2) {
        const testCodes = [allTypes[0].c_kincode, allTypes[1].c_kincode];
        const kinshipTypes = await repository.findByCodes(testCodes);

        expect(kinshipTypes).toBeDefined();
        expect(Array.isArray(kinshipTypes)).toBe(true);
        expect(kinshipTypes.length).toBe(2);
      }
    });

    it.skip('should search kinship types by Chinese name - TODO: Implement searchByName method', async () => {
      // const results = await repository.searchByName('父');
      // expect(results).toBeDefined();
      // expect(Array.isArray(results)).toBe(true);
    });
  });

  describe.skip('Person-kinship relationship tests', () => {
    it('Note: Person-kinship relationship tests should be in person-kinship-relation.repository.spec.ts', () => {
      // Tests for findByPersonId, findKinshipBetween, findRelatedPeople etc.
      // belong in PersonKinshipRelationRepository tests, not here.
      // This repository only handles kinship codes/types, not person relationships.
    });
  });
});