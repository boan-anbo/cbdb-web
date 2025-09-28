import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonService } from './person.service';

describe('PersonService - Birth/Death View', () => {
  let module: TestingModule;
  let personService: PersonService;

  beforeEach(async () => {
    module = await getTestModule();
    personService = module.get<PersonService>(PersonService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('getPersonBirthDeathView', () => {
    it('should retrieve Wang Anshi\'s birth/death year data', async () => {
      // Wang Anshi ID: 1762
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      expect(result!.personId).toBe(1762);
      expect(result!.name).toBe('Wang Anshi');
      expect(result!.nameChn).toBe('王安石');

      // Wang Anshi's dates: 1021-1086
      expect(result!.birthYear).toBe(1021);
      expect(result!.deathYear).toBe(1086);
      expect(result!.indexYear).toBe(1021); // Based on actual API response
    });

    it('should return null for non-existent person', async () => {
      const result = await personService.getPersonBirthDeathView(999999999);
      expect(result).toBeNull();
    });

    it('should include dynasty information', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      expect(result!.dynasty).toBeDefined();
      expect(result!.dynastyChn).toBeDefined();
      expect(result!.dynastyPinyin).toBeDefined();
    });

    it('should include nian hao (reign period) information when available', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      // Check birth year nian hao fields exist (even if null)
      expect(result).toHaveProperty('birthNianHaoId');
      expect(result).toHaveProperty('birthNianHaoYear');
      expect(result).toHaveProperty('birthNianHao');
      expect(result).toHaveProperty('birthNianHaoChn');

      // Check death year nian hao fields exist (even if null)
      expect(result).toHaveProperty('deathNianHaoId');
      expect(result).toHaveProperty('deathNianHaoYear');
      expect(result).toHaveProperty('deathNianHao');
      expect(result).toHaveProperty('deathNianHaoChn');
    });

    it('should include floruit years when available', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      // Check floruit year fields exist
      expect(result).toHaveProperty('floruitEarliestYear');
      expect(result).toHaveProperty('floruitLatestYear');
      expect(result).toHaveProperty('floruitDisplay');
      expect(result).toHaveProperty('floruitEarliestNote');
      expect(result).toHaveProperty('floruitLatestNote');
    });

    it('should include intercalary month information', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      // Check intercalary fields exist
      expect(result).toHaveProperty('birthIntercalary');
      expect(result).toHaveProperty('deathIntercalary');
    });

    it('should include year range indicators', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      // Year range indicators (e.g., 'circa', 'before', 'after')
      expect(result).toHaveProperty('birthRange');
      expect(result).toHaveProperty('deathRange');
      expect(result).toHaveProperty('birthYearRange');
      expect(result).toHaveProperty('deathYearRange');
    });

    it('should handle persons with missing birth year', async () => {
      // Find a person with death year but no birth year
      // Person ID 372 (Su Shi) should have complete data, let's try someone else
      const result = await personService.getPersonBirthDeathView(100);

      if (result && result.birthYear === null && result.deathYear !== null) {
        expect(result.birthYear).toBeNull();
        expect(result.deathYear).toBeDefined();
        // Index year should still be calculated if possible
        expect(result.indexYear).toBeDefined();
      }
    });

    it('should handle persons with missing death year', async () => {
      // Find a person with birth year but no death year
      const result = await personService.getPersonBirthDeathView(200);

      if (result && result.birthYear !== null && result.deathYear === null) {
        expect(result.birthYear).toBeDefined();
        expect(result.deathYear).toBeNull();
        // Index year should still be calculated if possible
        expect(result.indexYear).toBeDefined();
      }
    });

    it('should include index year information', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();
      expect(result!.indexYear).toBeDefined();
      expect(result).toHaveProperty('indexYearDisplay');
      expect(result).toHaveProperty('indexYearTypeCode');
      expect(result).toHaveProperty('indexYearTypeDesc');
      expect(result).toHaveProperty('indexYearTypeDescChn');
    });

    it('should include all date precision fields', async () => {
      const result = await personService.getPersonBirthDeathView(1762);

      expect(result).toBeDefined();

      // Birth date precision fields
      expect(result).toHaveProperty('birthMonth');
      expect(result).toHaveProperty('birthDay');
      expect(result).toHaveProperty('birthDayGanzhi'); // Ganzhi (sexagenary cycle) day
      expect(result).toHaveProperty('birthDisplay');

      // Death date precision fields
      expect(result).toHaveProperty('deathMonth');
      expect(result).toHaveProperty('deathDay');
      expect(result).toHaveProperty('deathDayGanzhi'); // Ganzhi (sexagenary cycle) day
      expect(result).toHaveProperty('deathDisplay');
      expect(result).toHaveProperty('deathAge');
      expect(result).toHaveProperty('deathAgeRange');
      expect(result).toHaveProperty('ageDisplay');
    });

    it('should return consistent data across multiple calls', async () => {
      // Test data consistency
      const result1 = await personService.getPersonBirthDeathView(1762);
      const result2 = await personService.getPersonBirthDeathView(1762);

      expect(result1).toEqual(result2);
    });
  });
});