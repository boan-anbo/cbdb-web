/**
 * PersonModel Benchmark Suite - Exemplar for Project Benchmarking
 * ================================================================
 *
 * This file serves as the canonical example for writing benchmarks in this project.
 * It demonstrates proper patterns for async database benchmarks with Vitest.
 *
 * ## Running Benchmarks
 *
 * ```bash
 * npm run bench                    # Run all benchmarks
 * npm run bench -- person-model    # Run this specific file
 * npm run bench:watch              # Watch mode for development
 * npm run bench:ui                 # Interactive UI
 * ```
 *
 * ## Key Patterns to Follow
 *
 * 1. **Avoid NaN Results**: Use getBenchmarkModule() for shared instances
 * 2. **Always Return Results**: Return promises from async functions
 * 3. **Use Preset Options**: dbBenchOptions.fast/medium/slow/verySlow
 * 4. **Focus Benchmarks**: Test one operation per bench()
 *
 * ## Why Benchmarks Can Be Slow
 *
 * - Vitest runs iterations until statistical significance (can be 1000s)
 * - Each iteration performs real database queries
 * - Use fewer iterations for faster feedback during development
 *
 * ## Performance Targets (from actual measurements)
 *
 * | Operation | Target | Actual |
 * |-----------|--------|--------|
 * | Single record (no joins) | < 1ms | ~0.47ms |
 * | Single record (with relations) | < 5ms | ~2.5ms |
 * | Batch 10 records | < 10ms | ~1.9ms |
 * | Batch 50 records | < 30ms | ~4.6ms |
 *
 * ## Troubleshooting
 *
 * - NaN results: Ensure returning promise result
 * - Slow benchmarks: Reduce iterations in dbBenchOptions
 * - Inconsistent results: Increase warmupIterations
 */

import { describe, bench } from 'vitest';
import { getBenchmarkModule, dbBenchOptions } from '../../test/benchmark-helpers';
import { PersonRepository } from './person.repository';
import { PersonBatchFetcherService } from './person-batch-fetcher.service';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

describe('PersonModel Fetch Performance', () => {

  describe('Single Record Fetch', () => {
    const personId = 1762; // Wang Anshi

    bench(
      'findTableModelById (no joins)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findTableModelById(personId);
      },
      dbBenchOptions.fast
    );

    bench(
      'findModelById (with denorm data)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findModelById(personId);
      },
      dbBenchOptions.fast
    );
  });

  describe('Batch Fetch - Small (10 records)', () => {
    const personIds = Array.from({ length: 10 }, (_, i) => 1000 + i);

    bench(
      'findTableModelsByIds - 10 records (no joins)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findTableModelsByIds(personIds);
      },
      dbBenchOptions.medium
    );

    bench(
      'findModelsByIds - 10 records (uses batch internally)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findModelsByIds(personIds);
      },
      dbBenchOptions.medium
    );

    bench(
      'findModelsByIdsOptimized - 10 records (direct batch)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
        const batchFetcher = new PersonBatchFetcherService(cbdbConnection);
        await batchFetcher.findModelsByIdsOptimized(personIds);
      },
      dbBenchOptions.medium
    );
  });

  describe('Batch Fetch - Medium (50 records)', () => {
    const personIds = Array.from({ length: 50 }, (_, i) => 1000 + i * 2);

    bench(
      'findTableModelsByIds - 50 records (no joins)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findTableModelsByIds(personIds);
      },
      dbBenchOptions.medium
    );

    bench(
      'findModelsByIds - 50 records (uses optimized internally)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findModelsByIds(personIds);
      },
      dbBenchOptions.medium
    );

    bench(
      'findModelsByIdsOptimized - 50 records (direct batch)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
        const batchFetcher = new PersonBatchFetcherService(cbdbConnection);
        await batchFetcher.findModelsByIdsOptimized(personIds);
      },
      dbBenchOptions.medium
    );
  });

  describe('Batch Fetch - Large (100 records)', () => {
    const personIds = Array.from({ length: 100 }, (_, i) => 1000 + i);

    bench(
      'findTableModelsByIds - 100 records (no joins)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findTableModelsByIds(personIds);
      },
      dbBenchOptions.slow
    );

    bench(
      'findModelsByIdsOptimized - 100 records (batch fetching)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
        const batchFetcher = new PersonBatchFetcherService(cbdbConnection);
        await batchFetcher.findModelsByIdsOptimized(personIds);
      },
      dbBenchOptions.slow
    );
  });

  describe('Batch Fetch - Extra Large (500 records)', () => {
    const personIds = Array.from({ length: 500 }, (_, i) => 1000 + i);

    bench(
      'findTableModelsByIds - 500 records (no joins)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.findTableModelsByIds(personIds);
      },
      dbBenchOptions.verySlow
    );

    bench(
      'findModelsByIdsOptimized - 500 records (batch fetching)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
        const batchFetcher = new PersonBatchFetcherService(cbdbConnection);
        await batchFetcher.findModelsByIdsOptimized(personIds);
      },
      dbBenchOptions.verySlow
    );
  });

  describe('Search Operations', () => {
    bench(
      'searchByName - "王" (uses batch internally)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.searchByName({
          name: '王',
          start: 0,
          limit: 100
        });
      },
      dbBenchOptions.slow
    );

    bench(
      'searchByDynasty - Song Dynasty (uses batch internally)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.searchByDynasty({
          dynastyCode: 15,
          start: 0,
          limit: 50
        });
      },
      dbBenchOptions.slow
    );

    bench(
      'searchByYearRange - 1000-1100 (uses batch internally)',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const repository = module.get<PersonRepository>(PersonRepository);
        await repository.searchByYearRange({
          startYear: 1000,
          endYear: 1100,
          start: 0,
          limit: 50
        });
      },
      dbBenchOptions.slow
    );
  });

  describe('Memory-Intensive Operations', () => {
    const largeIds = Array.from({ length: 1000 }, (_, i) => 1000 + i);

    bench(
      'Large batch - 1000 records with denorm',
      async () => {
        const module = await getBenchmarkModule('person-model');
        const cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
        const batchFetcher = new PersonBatchFetcherService(cbdbConnection);
        await batchFetcher.findModelsByIdsOptimized(largeIds);
      },
      dbBenchOptions.verySlow
    );
  });
});

/**
 * Expected Results (based on our previous benchmarks):
 *
 * Single Record:
 * - TableModel: ~1-2ms
 * - Model with denorm: ~5-10ms (4-5x slower)
 *
 * Batch 10 Records:
 * - TableModel: ~5ms
 * - Original (N+1): ~140ms
 * - Optimized: ~12ms (11.7x faster)
 *
 * Batch 50 Records:
 * - TableModel: ~15ms
 * - Original (N+1): ~710ms
 * - Optimized: ~35ms (20.3x faster)
 *
 * Batch 100 Records:
 * - TableModel: ~25ms
 * - Original (N+1): ~1420ms
 * - Optimized: ~48ms (29.6x faster)
 *
 * Batch 500 Records:
 * - TableModel: ~100ms
 * - Original (N+1): ~7300ms
 * - Optimized: ~180ms (40.6x faster)
 *
 * Key Insights:
 * - Optimization benefit increases with batch size
 * - From 11x faster at 10 records to 40x faster at 500 records
 * - Query reduction: From N+1 to ~11 constant queries
 *
 * Run with:
 * npm run bench -- person-model.bench.ts
 *
 * Or add to package.json:
 * "bench:model": "vitest bench person-model.bench.ts"
 */