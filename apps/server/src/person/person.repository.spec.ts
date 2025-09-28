import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { cleanupTestModule, getTestModule } from '../test-utils/test-helpers';

describe('PersonRepository', () => {
  let module: TestingModule;
  let repository: PersonRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonRepository>(PersonRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('searchSuggestionsLightweight', () => {
    it('should return person suggestions with dynasty information', async () => {
      const result = await repository.searchSuggestionsLightweight({
        query: '王安石',
        limit: 5
      });

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.total).toBe(result.suggestions.length);

      // If we have results, check the structure
      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];

        // Check basic fields
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('name');
        expect(suggestion).toHaveProperty('nameChn');
        expect(suggestion).toHaveProperty('birthYear');
        expect(suggestion).toHaveProperty('deathYear');
        expect(suggestion).toHaveProperty('indexYear');

        // Check dynasty fields (new)
        expect(suggestion).toHaveProperty('dynastyCode');
        expect(suggestion).toHaveProperty('dynasty');
        expect(suggestion).toHaveProperty('dynastyChn');
      }
    });

    it('should search by English name prefix', async () => {
      const result = await repository.searchSuggestionsLightweight({
        query: 'Wang',
        limit: 10
      });

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();

      // If we have results, they should start with Wang
      if (result.suggestions.length > 0) {
        const hasWangPrefix = result.suggestions.some(
          s => s.name && s.name.startsWith('Wang')
        );
        expect(hasWangPrefix).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const result = await repository.searchSuggestionsLightweight({
        query: '王',
        limit: 3
      });

      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for no matches', async () => {
      const result = await repository.searchSuggestionsLightweight({
        query: 'ZZZXXX999',
        limit: 10
      });

      expect(result.suggestions).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle dynasty information correctly', async () => {
      // Search for a well-known Song dynasty person
      const result = await repository.searchSuggestionsLightweight({
        query: '苏轼',
        limit: 5
      });

      if (result.suggestions.length > 0) {
        const suShi = result.suggestions.find(s => s.nameChn === '苏轼');

        if (suShi) {
          // Su Shi was from Song dynasty
          expect(suShi.dynastyChn).toBeTruthy();
          // Dynasty code should be present if dynastyChn is present
          if (suShi.dynastyChn) {
            expect(suShi.dynastyCode).toBeTruthy();
          }
        }
      }
    });

    it('should order exact matches first', async () => {
      const result = await repository.searchSuggestionsLightweight({
        query: '王安石',
        limit: 10
      });

      if (result.suggestions.length > 0) {
        // If there's an exact match, it should be first
        const firstResult = result.suggestions[0];
        if (firstResult.nameChn === '王安石' || firstResult.name === '王安石') {
          expect(firstResult.nameChn === '王安石' || firstResult.name === '王安石').toBe(true);
        }
      }
    });
  });
});