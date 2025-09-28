/**
 * Example benchmark template
 * Copy this file as a starting point for new benchmarks
 */

import { describe, bench } from 'vitest';
import { getBenchmarkModule, dbBenchOptions } from '../benchmark-helpers';

/**
 * Example 1: Simple async operation benchmark
 */
describe('Simple Operations', () => {
  bench(
    'example async operation',
    async () => {
      // Always return the promise result for proper timing
      return await Promise.resolve('result');
    },
    {
      warmupIterations: 5,
      iterations: 100
    }
  );
});

/**
 * Example 2: Database operation benchmark
 */
describe('Database Operations', () => {
  bench(
    'fetch single record',
    async () => {
      const module = await getBenchmarkModule('example');
      // Get your service from the cached module
      // const service = module.get(YourService);
      // return await service.findOne(id);
      return 'placeholder';
    },
    dbBenchOptions.fast // Use preset options for DB operations
  );

  bench(
    'batch fetch records',
    async () => {
      const module = await getBenchmarkModule('example');
      // const service = module.get(YourService);
      // return await service.findMany(ids);
      return 'placeholder';
    },
    dbBenchOptions.medium
  );
});

/**
 * Example 3: Comparing implementations
 */
describe('Algorithm Comparison', () => {
  const testData = Array.from({ length: 1000 }, (_, i) => i);

  bench('original algorithm', () => {
    return testData.reduce((sum, n) => sum + n, 0);
  });

  bench('optimized algorithm', () => {
    let sum = 0;
    for (const n of testData) {
      sum += n;
    }
    return sum;
  });

  // Vitest will automatically show which is faster
});

/**
 * Example 4: Complex async operations with setup
 */
describe('Complex Operations', () => {
  // Shared data for all benchmarks in this suite
  const sharedData = {
    ids: [1, 2, 3, 4, 5],
    options: { includeRelations: true }
  };

  bench(
    'complex operation with relations',
    async () => {
      const module = await getBenchmarkModule('complex');
      // Perform complex operation
      // const service = module.get(ComplexService);
      // return await service.fetchWithRelations(sharedData.ids, sharedData.options);
      return 'result';
    },
    dbBenchOptions.slow
  );
});

/**
 * Example 5: Memory-intensive operations
 */
describe('Memory Operations', () => {
  bench(
    'large data processing',
    async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `item-${i}`
      }));

      // Process the data
      const result = largeArray.map(item => ({
        ...item,
        processed: true
      }));

      return result.length;
    },
    {
      warmupIterations: 1,
      iterations: 3 // Few iterations for memory-intensive ops
    }
  );
});