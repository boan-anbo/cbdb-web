/**
 * Benchmark helpers for Vitest async database benchmarks
 * Helps avoid NaN timing issues with proper async handling
 */

import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from './get-test-module';

// Cache for shared module instances per benchmark file
const moduleCache = new Map<string, TestingModule>();

/**
 * Get or create a shared test module for benchmarks
 * Avoids creating new connections for each benchmark iteration
 */
export async function getBenchmarkModule(cacheKey: string = 'default'): Promise<TestingModule> {
  let module = moduleCache.get(cacheKey);

  if (!module) {
    module = await getTestModule();
    moduleCache.set(cacheKey, module);

    // Register cleanup on process exit
    process.once('beforeExit', async () => {
      const moduleToClean = moduleCache.get(cacheKey);
      if (moduleToClean) {
        await cleanupTestModule(moduleToClean);
        moduleCache.delete(cacheKey);
      }
    });
  }

  return module;
}

/**
 * Wrapper for async benchmark functions to ensure proper timing
 * Returns a properly structured async function for Vitest bench
 */
export function benchAsync<T>(
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    // Ensure the promise is properly returned
    const result = await fn();
    return result;
  };
}

/**
 * Default benchmark options for database operations
 */
export const dbBenchOptions = {
  // For fast operations (< 10ms)
  fast: {
    warmupIterations: 3,
    iterations: 20,
    warmupTime: 100,
    time: 1000
  },

  // For medium operations (10-100ms)
  medium: {
    warmupIterations: 2,
    iterations: 10,
    warmupTime: 200,
    time: 2000
  },

  // For slow operations (> 100ms)
  slow: {
    warmupIterations: 1,
    iterations: 5,
    warmupTime: 500,
    time: 5000
  },

  // For very slow operations (> 1s)
  verySlow: {
    warmupIterations: 1,
    iterations: 3,
    warmupTime: 1000,
    time: 10000
  }
};

/**
 * Clean up all benchmark modules
 * Call this in afterAll() if needed
 */
export async function cleanupAllBenchmarkModules(): Promise<void> {
  const cleanupPromises = Array.from(moduleCache.entries()).map(
    async ([key, module]) => {
      await cleanupTestModule(module);
      moduleCache.delete(key);
    }
  );

  await Promise.all(cleanupPromises);
}