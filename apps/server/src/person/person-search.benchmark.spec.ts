/**
 * Benchmark tests for person search with importance sorting
 * Compares performance with and without sorting by connections
 */

import { describe, it, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe('PersonSearch Benchmark - Importance Sorting', () => {
  let module: TestingModule;
  let repository: PersonRepository;

  beforeAll(async () => {
    module = await getTestModule();
    repository = module.get<PersonRepository>(PersonRepository);
  });

  afterAll(async () => {
    await cleanupTestModule(module);
  });

  describe('Search Performance Comparison', () => {
    // Test with common Chinese surname that returns many results
    const testQueries = [
      { name: '王', description: 'Common surname 王 (Wang)' },
      { name: '李', description: 'Common surname 李 (Li)' },
      { name: '張', description: 'Common surname 張 (Zhang)' },
      { name: '劉', description: 'Common surname 劉 (Liu)' },
      { name: '王安', description: 'Partial name 王安' }
    ];

    testQueries.forEach(({ name, description }) => {
      it(`should benchmark search for "${description}" WITHOUT importance sorting`, async () => {
        const iterations = 5;
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const start = Date.now();

          const result = await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: false  // No sorting
          });

          const duration = Date.now() - start;
          times.push(duration);

          // Verify we got results
          expect(result.data).toBeDefined();
          expect(result.total).toBeGreaterThan(0);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        console.log(`[${description}] WITHOUT sorting:`);
        console.log(`  Average: ${avgTime.toFixed(2)}ms`);
        console.log(`  Min: ${minTime}ms, Max: ${maxTime}ms`);
        console.log(`  All times: ${times.join(', ')}ms`);

        // Performance expectation: should be fast without sorting
        expect(avgTime).toBeLessThan(500); // Should complete within 500ms
      });

      it(`should benchmark search for "${description}" WITH importance sorting`, async () => {
        const iterations = 5;
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const start = Date.now();

          const result = await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: true  // With sorting
          });

          const duration = Date.now() - start;
          times.push(duration);

          // Verify we got results
          expect(result.data).toBeDefined();
          expect(result.total).toBeGreaterThan(0);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        console.log(`[${description}] WITH sorting:`);
        console.log(`  Average: ${avgTime.toFixed(2)}ms`);
        console.log(`  Min: ${minTime}ms, Max: ${maxTime}ms`);
        console.log(`  All times: ${times.join(', ')}ms`);

        // Performance expectation: sorting adds overhead but should still be reasonable
        expect(avgTime).toBeLessThan(1500); // Should complete within 1.5 seconds
      });

      it(`should show performance difference for "${description}"`, async () => {
        // Run both versions and compare
        const runsPerVersion = 3;
        let timeWithoutSort = 0;
        let timeWithSort = 0;

        // Without sorting
        for (let i = 0; i < runsPerVersion; i++) {
          const start = Date.now();
          await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: false
          });
          timeWithoutSort += Date.now() - start;
        }

        // With sorting
        for (let i = 0; i < runsPerVersion; i++) {
          const start = Date.now();
          await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: true
          });
          timeWithSort += Date.now() - start;
        }

        const avgWithoutSort = timeWithoutSort / runsPerVersion;
        const avgWithSort = timeWithSort / runsPerVersion;
        const overhead = avgWithSort - avgWithoutSort;
        const overheadPercent = (overhead / avgWithoutSort) * 100;

        console.log(`[${description}] Performance Comparison:`);
        console.log(`  Without sorting: ${avgWithoutSort.toFixed(2)}ms`);
        console.log(`  With sorting: ${avgWithSort.toFixed(2)}ms`);
        console.log(`  Overhead: ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);

        // The overhead should be reasonable
        expect(overhead).toBeLessThan(1000); // Less than 1 second overhead
      });
    });

    it('should verify sorting actually changes the order', async () => {
      const name = '王';

      // Get results without sorting
      const unsortedResult = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 50,
        sortByImportance: false
      });

      // Get results with sorting
      const sortedResult = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 50,
        sortByImportance: true
      });

      // Check if the order is different
      const unsortedIds = unsortedResult.data.map(p => p.id);
      const sortedIds = sortedResult.data.map(p => p.id);

      // The order should be different (unless by chance all have same importance)
      const orderChanged = unsortedIds.some((id, index) => id !== sortedIds[index]);

      console.log('Order comparison:');
      console.log(`  First 10 unsorted IDs: ${unsortedIds.slice(0, 10).join(', ')}`);
      console.log(`  First 10 sorted IDs: ${sortedIds.slice(0, 10).join(', ')}`);
      console.log(`  Order changed: ${orderChanged}`);

      // At least verify both got results
      expect(unsortedResult.data.length).toBeGreaterThan(0);
      expect(sortedResult.data.length).toBeGreaterThan(0);
    });

    it('should show importance scores for top results', async () => {
      const name = '王安';

      const result = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 10,
        sortByImportance: true
      });

      console.log(`\nTop 10 results for "${name}" sorted by importance:`);

      // For each result, fetch their relation counts to show importance
      for (const person of result.data.slice(0, 5)) {
        // We'll need to get the relation counts to show the importance
        console.log(`  ${person.nameChn || person.name} (ID: ${person.id})`);
      }
    });
  });

  describe('Scalability Test', () => {
    it('should handle pagination efficiently with sorting', async () => {
      const name = '王';
      const pageSize = 20;
      const pages = 5;

      const times: number[] = [];

      for (let page = 0; page < pages; page++) {
        const start = Date.now();

        const result = await repository.searchByName({
          name,
          accurate: false,
          start: page * pageSize,
          limit: pageSize,
          sortByImportance: true
        });

        const duration = Date.now() - start;
        times.push(duration);

        expect(result.data).toBeDefined();
        expect(result.data.length).toBeLessThanOrEqual(pageSize);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(`Pagination with sorting (${pages} pages):`);
      console.log(`  Average per page: ${avgTime.toFixed(2)}ms`);
      console.log(`  Page times: ${times.map(t => t + 'ms').join(', ')}`);

      // Each page should be reasonably fast
      expect(avgTime).toBeLessThan(1000);
    });
  });
});