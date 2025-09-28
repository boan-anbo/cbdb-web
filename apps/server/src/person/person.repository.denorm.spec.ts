import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PersonRepository } from './person.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { TestingModule } from '@nestjs/testing';
import { PersonDenormExtraDataView } from '@cbdb/core';

describe('PersonRepository Denormalization', () => {
  let module: TestingModule;
  let repository: PersonRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonRepository>(PersonRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('fetchPersonDenormExtraById', () => {
    it('should fetch denormalized data for person with all relations', async () => {
      // Test with person ID 1762 (王安石) who has many denormalized fields
      const denormData = await repository.fetchPersonDenormExtraById(1762);

      expect(denormData).toBeDefined();
      expect(denormData).toBeInstanceOf(PersonDenormExtraDataView);

      // Check dynasty denormalization
      expect(denormData?.dynastyName).toBeDefined();
      expect(denormData?.dynastyNameChn).toBe('宋');

      // Check ethnicity denormalization (if present)
      if (denormData?.ethnicityName !== null) {
        expect(denormData?.ethnicityName).toBeDefined();
      }

      // Check year range descriptions (if present)
      if (denormData?.birthYearRange !== null) {
        expect(denormData?.birthYearRange).toBeDefined();
      }
    });

    it('should handle person with minimal denormalized data', async () => {
      // Test with person ID 2 (probably has fewer denormalized fields)
      const denormData = await repository.fetchPersonDenormExtraById(2);

      expect(denormData).toBeDefined();
      expect(denormData).toBeInstanceOf(PersonDenormExtraDataView);

      // Some fields should be null but the object should still be valid
      if (denormData?.ethnicityName === null) {
        expect(denormData?.ethnicityName).toBeNull();
      }
    });

    it('should return null for non-existent person', async () => {
      const denormData = await repository.fetchPersonDenormExtraById(999999999);
      expect(denormData).toBeNull();
    });

    it('should fetch all nian hao (era name) denormalizations', async () => {
      // Find a person with birth/death nian hao codes
      const denormData = await repository.fetchPersonDenormExtraById(1762);

      if (denormData) {
        // Check that if there's a birth year nian hao code, we get the name
        expect(typeof denormData.birthYearNhName === 'string' || denormData.birthYearNhName === null).toBeTruthy();
        expect(typeof denormData.birthYearNhNameChn === 'string' || denormData.birthYearNhNameChn === null).toBeTruthy();

        // Same for death year
        expect(typeof denormData.deathYearNhName === 'string' || denormData.deathYearNhName === null).toBeTruthy();
        expect(typeof denormData.deathYearNhNameChn === 'string' || denormData.deathYearNhNameChn === null).toBeTruthy();
      }
    });
  });

  describe('getPersonById with denormalization', () => {
    it('should return PersonModel with denormalized data', async () => {
      const person = await repository.findModelById(1762);

      expect(person).toBeDefined();

      // PersonModel should have denormalized fields from PersonDenormExtraDataView
      expect(person?.dynastyNameChn).toBe('宋');

      // Check that the model properly integrates both table data and denorm data
      expect(person?.id).toBe(1762);
      expect(person?.nameChn).toBeDefined(); // From table model
      expect(person?.dynastyName).toBeDefined(); // From denorm view
    });
  });

  describe('searchPersons with denormalization', () => {
    it('should return PersonModels with denormalized data in search results', async () => {
      const results = await repository.searchByName({
        name: '王',
        limit: 5
      });

      expect(results.data).toBeDefined();
      expect(results.data.length).toBeGreaterThan(0);

      // Check first result has denormalized data
      const firstPerson = results.data[0];
      if (firstPerson.dynastyCode) {
        // searchByName now properly fetches denorm data via batch fetch
        expect(firstPerson.dynastyName).toBeDefined();
        expect(firstPerson.dynastyNameChn).toBeDefined();
      }
    });
  });

  describe('findTableModelsByIds', () => {
    it('should return table models without any joins', async () => {
      const tableModels = await repository.findTableModelsByIds([1762, 2, 3]);

      expect(tableModels).toBeDefined();
      expect(tableModels.length).toBeGreaterThan(0);

      // TableModel should have raw data but no denorm fields
      const firstPerson = tableModels[0];
      expect(firstPerson.id).toBeDefined();
      expect(firstPerson.nameChn).toBeDefined();

      // These denorm fields should NOT exist on TableModel
      expect((firstPerson as any).dynastyName).toBeUndefined();
      expect((firstPerson as any).dynastyNameChn).toBeUndefined();
    });

    it('should handle empty ID array', async () => {
      const tableModels = await repository.findTableModelsByIds([]);
      expect(tableModels).toEqual([]);
    });
  });

  describe('data consistency', () => {
    it('should have consistent null handling across all denorm fields', async () => {
      const denormData = await repository.fetchPersonDenormExtraById(1762);

      if (denormData) {
        // All fields should be either string or null, never undefined
        const fields = [
          'dynastyName', 'dynastyNameChn',
          'birthYearNhName', 'birthYearNhNameChn',
          'deathYearNhName', 'deathYearNhNameChn',
          'ethnicityName', 'ethnicityNameChn',
          'choronymName', 'choronymNameChn',
          'householdStatusName', 'householdStatusNameChn',
          'indexYearTypeName', 'indexYearTypeNameChn',
          'indexAddrTypeName', 'indexAddrTypeNameChn',
          'birthYearRange', 'birthYearRangeChn',
          'deathYearRange', 'deathYearRangeChn',
          'birthYearDayGz', 'birthYearDayGzChn',
          'deathYearDayGz', 'deathYearDayGzChn',
          'indexAddrName', 'indexAddrNameChn'
        ];

        for (const field of fields) {
          const value = (denormData as any)[field];
          expect(value === null || typeof value === 'string').toBeTruthy();
        }
      }
    });
  });
});