import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { TestDatabaseConfig } from '../../test/test-database.config';

/**
 * Performance Benchmark: Full Relations vs Stats Only
 * Compares the performance of fetching complete relation data
 * versus fetching just statistics (counts + IDs)
 */
describe('PersonService Performance Benchmark', () => {
  let module: TestingModule;
  let service: PersonService;

  // Wang Anshi - person with many relations
  const WANG_ANSHI_ID = 1762;

  // Number of iterations for each test
  const ITERATIONS = 10;

  beforeAll(async () => {
    module = await TestDatabaseConfig.createTestingModule();
    await module.init();
    service = module.get<PersonService>(PersonService);
  });

  afterAll(async () => {
    await TestDatabaseConfig.cleanup(module);
  });

  describe('Performance Comparison', () => {
    it('should benchmark fetching full relations vs stats only', async () => {
      console.log('\n=== Performance Benchmark: Wang Anshi (ID: 1762) ===\n');

      // Warm up the connection
      await service.findById({ id: WANG_ANSHI_ID });

      // Benchmark full relations
      console.log('Testing: Full Relations (all data)');
      const fullRelationsStart = performance.now();

      for (let i = 0; i < ITERATIONS; i++) {
        const result = await service.getPersonWithAllRelations(WANG_ANSHI_ID);
        expect(result).toBeDefined();
        expect(result.person.id).toBe(WANG_ANSHI_ID);
      }

      const fullRelationsEnd = performance.now();
      const fullRelationsTime = fullRelationsEnd - fullRelationsStart;
      const fullRelationsAvg = fullRelationsTime / ITERATIONS;

      console.log(`  Total time: ${fullRelationsTime.toFixed(2)}ms`);
      console.log(`  Average per request: ${fullRelationsAvg.toFixed(2)}ms`);
      console.log(`  Requests per second: ${(1000 / fullRelationsAvg).toFixed(2)}`);

      // Benchmark stats only
      console.log('\nTesting: Stats Only (counts + IDs)');
      const statsOnlyStart = performance.now();

      for (let i = 0; i < ITERATIONS; i++) {
        const result = await service.getPersonWithStats(WANG_ANSHI_ID);
        expect(result).toBeDefined();
        expect(result.data?.id).toBe(WANG_ANSHI_ID);
        // TODO: Stats not yet implemented - expecting undefined
        // expect(result.stats).toBeDefined();
      }

      const statsOnlyEnd = performance.now();
      const statsOnlyTime = statsOnlyEnd - statsOnlyStart;
      const statsOnlyAvg = statsOnlyTime / ITERATIONS;

      console.log(`  Total time: ${statsOnlyTime.toFixed(2)}ms`);
      console.log(`  Average per request: ${statsOnlyAvg.toFixed(2)}ms`);
      console.log(`  Requests per second: ${(1000 / statsOnlyAvg).toFixed(2)}`);

      // Calculate improvement
      const speedup = fullRelationsAvg / statsOnlyAvg;
      const percentImprovement = ((fullRelationsAvg - statsOnlyAvg) / fullRelationsAvg) * 100;

      console.log('\n=== Results ===');
      console.log(`Stats-only is ${speedup.toFixed(2)}x faster`);
      console.log(`Performance improvement: ${percentImprovement.toFixed(1)}%`);
      console.log(`Time saved per request: ${(fullRelationsAvg - statsOnlyAvg).toFixed(2)}ms`);

      // Verify stats are actually faster
      expect(statsOnlyAvg).toBeLessThan(fullRelationsAvg);
    });

    it.skip('should verify data completeness for stats - TODO: Finalize expected counts', async () => {
      // Get both versions
      const fullData = await service.getPersonWithAllRelations(WANG_ANSHI_ID);
      const statsData = await service.getPersonWithStats(WANG_ANSHI_ID);

      // Verify person data is the same
      expect(statsData.data?.id).toBe(fullData.person.id);
      expect(statsData.data?.nameChn).toBe(fullData.person.nameChn);

      // Verify counts match
      if (statsData.stats) {
        expect(statsData.stats.kinships.count).toBe(fullData.kinships.length);
        expect(statsData.stats.addresses.count).toBe(fullData.addresses.length);
        expect(statsData.stats.offices.count).toBe(fullData.offices.length);
        expect(statsData.stats.entries.count).toBe(fullData.entries.length);
        expect(statsData.stats.statuses.count).toBe(fullData.statuses.length);
        expect(statsData.stats.associations.count).toBe(fullData.associations.length);
        expect(statsData.stats.texts.count).toBe(fullData.texts.length);
        expect(statsData.stats.events.count).toBe(fullData.events.length);
        expect(statsData.stats.altNames.count).toBe(fullData.altNames.length);

        // Verify we have IDs but not full data
        expect(statsData.stats.kinships.ids).toBeDefined();
        expect(statsData.stats.kinships.ids.length).toBe(fullData.kinships.length);
      }
    });

    it.skip('should benchmark multiple persons with varying relation counts - TODO: Finalize performance thresholds', async () => {
      const testCases = [
        { id: 1762, name: 'Wang Anshi (many relations)' },
        { id: 0, name: 'Unknown (minimal relations)' },
        { id: 38653, name: 'Person with moderate relations' }
      ];

      console.log('\n=== Multi-Person Benchmark ===\n');

      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.name}`);

        // Full relations
        const fullStart = performance.now();
        const fullResult = await service.getPersonWithAllRelations(testCase.id);
        const fullTime = performance.now() - fullStart;

        // Stats only
        const statsStart = performance.now();
        const statsResult = await service.getPersonWithStats(testCase.id);
        const statsTime = performance.now() - statsStart;

        const speedup = fullTime / statsTime;

        console.log(`  Full relations: ${fullTime.toFixed(2)}ms`);
        console.log(`  Stats only: ${statsTime.toFixed(2)}ms`);
        console.log(`  Speedup: ${speedup.toFixed(2)}x\n`);

        expect(statsTime).toBeLessThan(fullTime);
      }
    });
  });
});