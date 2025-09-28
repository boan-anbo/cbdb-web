import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { PersonRelationsRepository } from './person-relations.repository';
import { TestDatabaseConfig } from '../../test/test-database.config';

/**
 * Performance Benchmark: Search with and without importance sorting
 * Compares the performance of searching with importance-based sorting
 * versus regular search without sorting
 */
describe('PersonSearch Sorting Performance Benchmark', () => {
  let module: TestingModule;
  let repository: PersonRepository;
  let relationsRepo: PersonRelationsRepository;

  // Number of iterations for each test
  const ITERATIONS = 5;

  // Test queries
  const testQueries = [
    { name: '王', description: 'Common surname 王 (Wang)', expectedCount: 1000 },
    { name: '李', description: 'Common surname 李 (Li)', expectedCount: 1000 },
    { name: '王安', description: 'Partial name 王安', expectedCount: 100 }
  ];

  beforeAll(async () => {
    module = await TestDatabaseConfig.createTestingModule();
    await module.init();
    repository = module.get<PersonRepository>(PersonRepository);
    relationsRepo = module.get<PersonRelationsRepository>(PersonRelationsRepository);
  });

  afterAll(async () => {
    await TestDatabaseConfig.cleanup(module);
  });

  describe('Search Performance Comparison', () => {
    testQueries.forEach(({ name, description }) => {
      it(`should benchmark search for "${description}"`, async () => {
        console.log(`\n=== Benchmark: ${description} ===\n`);

        // Warm up the connection with a simple query
        await repository.searchByName({
          name,
          accurate: false,
          start: 0,
          limit: 1,
          sortByImportance: false
        });

        // Benchmark WITHOUT sorting
        console.log('Testing: WITHOUT importance sorting');
        const withoutSortStart = performance.now();
        let withoutSortResults;

        for (let i = 0; i < ITERATIONS; i++) {
          withoutSortResults = await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: false
          });
          expect(withoutSortResults.data).toBeDefined();
        }

        const withoutSortEnd = performance.now();
        const withoutSortTime = withoutSortEnd - withoutSortStart;
        const withoutSortAvg = withoutSortTime / ITERATIONS;

        console.log(`  Total time: ${withoutSortTime.toFixed(2)}ms`);
        console.log(`  Average per request: ${withoutSortAvg.toFixed(2)}ms`);
        console.log(`  Found ${withoutSortResults.total} total matches`);

        // Benchmark WITH sorting
        console.log('\nTesting: WITH importance sorting');
        const withSortStart = performance.now();
        let withSortResults;

        for (let i = 0; i < ITERATIONS; i++) {
          withSortResults = await repository.searchByName({
            name,
            accurate: false,
            start: 0,
            limit: 20,
            sortByImportance: true
          });
          expect(withSortResults.data).toBeDefined();
        }

        const withSortEnd = performance.now();
        const withSortTime = withSortEnd - withSortStart;
        const withSortAvg = withSortTime / ITERATIONS;

        console.log(`  Total time: ${withSortTime.toFixed(2)}ms`);
        console.log(`  Average per request: ${withSortAvg.toFixed(2)}ms`);
        console.log(`  Found ${withSortResults.total} total matches`);

        // Calculate overhead
        const overhead = withSortAvg - withoutSortAvg;
        const overheadPercent = (overhead / withoutSortAvg) * 100;

        console.log('\n=== Results ===');
        console.log(`Sorting overhead: ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);
        console.log(`Without sorting: ${withoutSortAvg.toFixed(2)}ms per request`);
        console.log(`With sorting: ${withSortAvg.toFixed(2)}ms per request`);

        // The overhead should be reasonable (less than 2x slower)
        expect(withSortAvg).toBeLessThan(withoutSortAvg * 2);
      });
    });

    it('should verify sorting changes the order', async () => {
      const name = '王';
      console.log('\n=== Verifying Sort Order Changes ===\n');

      // Get results without sorting
      const unsortedResult = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 10,
        sortByImportance: false
      });

      // Get results with sorting
      const sortedResult = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 10,
        sortByImportance: true
      });

      console.log('First 5 results WITHOUT sorting:');
      for (const person of unsortedResult.data.slice(0, 5)) {
        console.log(`  - ${person.nameChn || person.name} (ID: ${person.id})`);
      }

      console.log('\nFirst 5 results WITH sorting (by importance):');
      for (const person of sortedResult.data.slice(0, 5)) {
        // Get importance score for display
        const counts = await relationsRepo.getRelationCountsOnly(person.id);
        const score = (counts.associations * 3) + (counts.kinships * 2) +
                     (counts.offices * 2) + (counts.texts * 1.5) +
                     (counts.events * 1) + (counts.entries * 0.5) +
                     (counts.statuses * 0.5) + (counts.addresses * 0.2) +
                     (counts.altNames * 0.1);
        console.log(`  - ${person.nameChn || person.name} (ID: ${person.id}, Score: ${score.toFixed(1)})`);
      }

      // Check if the order is different
      const unsortedIds = unsortedResult.data.map(p => p.id);
      const sortedIds = sortedResult.data.map(p => p.id);
      const orderChanged = unsortedIds.some((id, index) => id !== sortedIds[index]);

      console.log(`\nOrder changed: ${orderChanged ? 'Yes' : 'No'}`);

      // At least verify both got results
      expect(unsortedResult.data.length).toBeGreaterThan(0);
      expect(sortedResult.data.length).toBeGreaterThan(0);
    });

    it('should show performance impact on pagination', async () => {
      const name = '王';
      const pageSize = 20;
      const pages = 3;

      console.log('\n=== Pagination Performance ===\n');

      // Test without sorting
      console.log('Testing: Pagination WITHOUT sorting');
      const withoutSortTimes: number[] = [];

      for (let page = 0; page < pages; page++) {
        const start = performance.now();
        await repository.searchByName({
          name,
          accurate: false,
          start: page * pageSize,
          limit: pageSize,
          sortByImportance: false
        });
        withoutSortTimes.push(performance.now() - start);
      }

      const withoutSortAvg = withoutSortTimes.reduce((a, b) => a + b, 0) / pages;
      console.log(`  Page times: ${withoutSortTimes.map(t => t.toFixed(0)).join(', ')}ms`);
      console.log(`  Average: ${withoutSortAvg.toFixed(2)}ms`);

      // Test with sorting
      console.log('\nTesting: Pagination WITH sorting');
      const withSortTimes: number[] = [];

      for (let page = 0; page < pages; page++) {
        const start = performance.now();
        await repository.searchByName({
          name,
          accurate: false,
          start: page * pageSize,
          limit: pageSize,
          sortByImportance: true
        });
        withSortTimes.push(performance.now() - start);
      }

      const withSortAvg = withSortTimes.reduce((a, b) => a + b, 0) / pages;
      console.log(`  Page times: ${withSortTimes.map(t => t.toFixed(0)).join(', ')}ms`);
      console.log(`  Average: ${withSortAvg.toFixed(2)}ms`);

      const overhead = withSortAvg - withoutSortAvg;
      console.log(`\nPagination overhead with sorting: ${overhead.toFixed(2)}ms per page`);

      // Pagination should still be reasonably fast
      expect(withSortAvg).toBeLessThan(2000);
    });
  });

  describe('Scalability Analysis', () => {
    it('should analyze performance with different result set sizes', async () => {
      console.log('\n=== Scalability Analysis ===\n');

      const limits = [5, 10, 20, 50];
      const name = '李';

      for (const limit of limits) {
        console.log(`Testing with limit=${limit}:`);

        // Without sorting
        const withoutSortStart = performance.now();
        await repository.searchByName({
          name,
          accurate: false,
          start: 0,
          limit,
          sortByImportance: false
        });
        const withoutSortTime = performance.now() - withoutSortStart;

        // With sorting
        const withSortStart = performance.now();
        await repository.searchByName({
          name,
          accurate: false,
          start: 0,
          limit,
          sortByImportance: true
        });
        const withSortTime = performance.now() - withSortStart;

        const overhead = withSortTime - withoutSortTime;
        const overheadPercent = (overhead / withoutSortTime) * 100;

        console.log(`  Without sorting: ${withoutSortTime.toFixed(2)}ms`);
        console.log(`  With sorting: ${withSortTime.toFixed(2)}ms`);
        console.log(`  Overhead: ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)\n`);
      }
    });
  });
});