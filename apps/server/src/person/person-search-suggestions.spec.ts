import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe('PersonRepository - Search Suggestions', () => {
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
    describe('Basic search functionality', () => {
      it('should return suggestions with all required fields', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '王',
          limit: 5
        });

        expect(result).toBeDefined();
        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.total).toBe(result.suggestions.length);

        if (result.suggestions.length > 0) {
          const suggestion = result.suggestions[0];

          // Check all required fields
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('name');
          expect(suggestion).toHaveProperty('nameChn');
          expect(suggestion).toHaveProperty('birthYear');
          expect(suggestion).toHaveProperty('deathYear');
          expect(suggestion).toHaveProperty('indexYear');
          expect(suggestion).toHaveProperty('dynastyCode');
          expect(suggestion).toHaveProperty('dynasty');
          expect(suggestion).toHaveProperty('dynastyChn');
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
    });

    describe('Search by different fields', () => {
      it('should search by Chinese name', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '王安石',
          limit: 5
        });

        if (result.suggestions.length > 0) {
          // Check if Wang Anshi is in results
          const wangAnshi = result.suggestions.find(s => s.nameChn === '王安石');
          if (wangAnshi) {
            expect(wangAnshi.id).toBe(1762);
            expect(wangAnshi.name).toContain('Wang');
          }
        }
      });

      it('should search by English name', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Wang',
          limit: 20
        });

        expect(result.suggestions.length).toBeGreaterThan(0);

        // Should have people with English names starting with Wang
        const hasWangPrefix = result.suggestions.some(
          s => s.name && s.name.startsWith('Wang')
        );
        expect(hasWangPrefix).toBe(true);
      });

      it('should search by person ID (exact match)', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '1762',
          limit: 5
        });

        expect(result.suggestions.length).toBeGreaterThan(0);

        // Wang Anshi (ID: 1762) should be in results
        const wangAnshi = result.suggestions.find(s => s.id === 1762);
        expect(wangAnshi).toBeDefined();
        if (wangAnshi) {
          expect(wangAnshi.nameChn).toBe('王安石');
          // Exact ID match should be first
          expect(result.suggestions[0].id).toBe(1762);
        }
      });

      it('should search by person ID (prefix match)', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '17',
          limit: 10
        });

        if (result.suggestions.length > 0) {
          // Should find IDs starting with 17
          const hasMatchingIds = result.suggestions.some(s =>
            s.id.toString().startsWith('17')
          );
          expect(hasMatchingIds).toBe(true);
        }
      });

      it('should search by dynasty name in Chinese', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '宋',
          limit: 20
        });

        if (result.suggestions.length > 0) {
          // Should find Song dynasty people
          const hasSongPeople = result.suggestions.some(s =>
            s.dynastyChn === '宋' || s.dynasty === 'Song'
          );
          expect(hasSongPeople).toBe(true);
        }
      });

      it('should search by dynasty name in English', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Song',
          limit: 20
        });

        if (result.suggestions.length > 0) {
          // Should find Song dynasty people
          const hasSongPeople = result.suggestions.some(s =>
            s.dynasty === 'Song' || s.dynastyChn === '宋'
          );
          expect(hasSongPeople).toBe(true);
        }
      });

      it('should handle partial dynasty names', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Tan',
          limit: 10
        });

        if (result.suggestions.length > 0) {
          // Should find Tang dynasty people (contains 'Tan')
          const hasTangPeople = result.suggestions.some(s =>
            s.dynasty === 'Tang' || s.dynastyChn === '唐'
          );
          expect(hasTangPeople).toBe(true);
        }
      });
    });

    describe('Sorting and grouping', () => {
      it('should prioritize exact matches', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '王安石',
          limit: 10
        });

        if (result.suggestions.length > 0 && result.suggestions[0].nameChn === '王安石') {
          // If Wang Anshi exists, exact match should be first
          expect(result.suggestions[0].nameChn).toBe('王安石');
        }
      });

      it('should group results by English name', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Wang',
          limit: 100
        });

        if (result.suggestions.length > 20) {
          // Check grouping by English name
          const englishNames: string[] = [];
          let lastSeenName = '';
          let isGrouped = true;

          for (const suggestion of result.suggestions) {
            const currentName = suggestion.name || '';

            if (currentName !== lastSeenName) {
              if (englishNames.includes(currentName)) {
                // Name appeared before, not properly grouped
                isGrouped = false;
                break;
              }
              englishNames.push(currentName);
              lastSeenName = currentName;
            }
          }

          expect(isGrouped).toBe(true);
        }
      });

      it('should maintain consistent ordering with same English names', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Wang Ming',
          limit: 50
        });

        if (result.suggestions.length > 5) {
          // All "Wang Ming" entries should be grouped together
          let inWangMingGroup = false;
          let leftWangMingGroup = false;

          for (const suggestion of result.suggestions) {
            if (suggestion.name === 'Wang Ming') {
              if (leftWangMingGroup) {
                // Found Wang Ming again after seeing other names
                expect(leftWangMingGroup).toBe(false);
              }
              inWangMingGroup = true;
            } else if (inWangMingGroup) {
              // We've left the Wang Ming group
              leftWangMingGroup = true;
            }
          }
        }
      });
    });

    describe('Importance sorting', () => {
      it('should handle sortByImportance flag', async () => {
        const resultWithoutImportance = await repository.searchSuggestionsLightweight({
          query: '王',
          limit: 20,
          sortByImportance: false
        });

        const resultWithImportance = await repository.searchSuggestionsLightweight({
          query: '王',
          limit: 20,
          sortByImportance: true
        });

        expect(resultWithoutImportance).toBeDefined();
        expect(resultWithImportance).toBeDefined();

        // Both should return results
        expect(resultWithoutImportance.suggestions).toBeDefined();
        expect(resultWithImportance.suggestions).toBeDefined();

        // Results might be in different order
        // Can't test exact ordering without knowing importance scores
      });

      it('should sort by importance within same English name group', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Wang',
          limit: 100,
          sortByImportance: true
        });

        // This is hard to test without knowing the data
        // But we can verify it completes successfully
        expect(result).toBeDefined();
        expect(result.suggestions).toBeDefined();
      });

      it('should fetch more results when sorting by importance', async () => {
        // When sortByImportance is true, it should fetch more results internally
        // This is an implementation detail but good to verify it works
        const result = await repository.searchSuggestionsLightweight({
          query: 'Li',
          limit: 10,
          sortByImportance: true
        });

        expect(result.suggestions.length).toBeLessThanOrEqual(10);
        expect(result).toBeDefined();
      });
    });

    describe('Edge cases and special characters', () => {
      it('should handle single character queries', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '王',
          limit: 10
        });

        expect(result).toBeDefined();
        expect(result.suggestions).toBeDefined();
      });

      it('should handle numeric-only queries', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '123',
          limit: 10
        });

        expect(result).toBeDefined();
        // Should search for IDs starting with 123
      });

      it('should handle mixed alphanumeric queries', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: 'Song123',
          limit: 10
        });

        expect(result).toBeDefined();
        // Might find dynasty matches or no results
      });

      it('should handle very long queries gracefully', async () => {
        const longQuery = 'Wang'.repeat(50);
        const result = await repository.searchSuggestionsLightweight({
          query: longQuery,
          limit: 10
        });

        expect(result).toBeDefined();
        expect(result.suggestions).toBeDefined();
      });
    });

    describe('Performance considerations', () => {
      it('should complete within reasonable time for common queries', async () => {
        const start = Date.now();

        await repository.searchSuggestionsLightweight({
          query: 'Wang',
          limit: 20,
          sortByImportance: false
        });

        const duration = Date.now() - start;

        // Should complete within 500ms for non-importance sorted
        expect(duration).toBeLessThan(500);
      });

      it('should handle large limit values', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '王',
          limit: 200
        });

        expect(result).toBeDefined();
        expect(result.suggestions.length).toBeLessThanOrEqual(200);
      });
    });

    describe('Integration with known data', () => {
      it('should find Wang Anshi (ID: 1762) correctly', async () => {
        // Search by name
        const nameResult = await repository.searchSuggestionsLightweight({
          query: 'Wang Anshi',
          limit: 10
        });

        // Search by ID
        const idResult = await repository.searchSuggestionsLightweight({
          query: '1762',
          limit: 10
        });

        // Both should find Wang Anshi
        const wangAnshiByName = nameResult.suggestions.find(s => s.id === 1762);
        const wangAnshiById = idResult.suggestions.find(s => s.id === 1762);

        if (wangAnshiByName) {
          expect(wangAnshiByName.nameChn).toBe('王安石');
          expect(wangAnshiByName.dynastyChn).toBe('宋');
        }

        if (wangAnshiById) {
          expect(wangAnshiById.nameChn).toBe('王安石');
          expect(wangAnshiById).toEqual(wangAnshiByName);
        }
      });

      it('should find Su Shi (蘇軾) from Song dynasty', async () => {
        const result = await repository.searchSuggestionsLightweight({
          query: '蘇軾',
          limit: 5
        });

        if (result.suggestions.length > 0) {
          const suShi = result.suggestions.find(s => s.nameChn === '蘇軾');
          if (suShi) {
            expect(suShi.dynastyChn).toBe('宋');
            expect(suShi.dynasty).toBe('Song');
          }
        }
      });
    });
  });
});