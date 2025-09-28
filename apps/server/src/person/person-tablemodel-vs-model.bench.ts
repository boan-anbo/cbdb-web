import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

/**
 * Benchmark comparing TableModel vs Model performance
 *
 * TableModel: Raw database table, no joins
 * Model: TableModel + trivial joins (denormalized data from lookup tables)
 */
describe('TableModel vs Model Performance Benchmark', () => {
  let module: TestingModule;
  let repository: PersonRepository;

  beforeAll(async () => {
    module = await getTestModule();
    repository = module.get<PersonRepository>(PersonRepository);
  });

  afterAll(async () => {
    await cleanupTestModule(module);
  });

  describe('Single Record Performance', () => {
    it('should compare single record fetch performance', async () => {
      const personId = 1762; // Wang Anshi
      const iterations = 100;

      console.log('\n=== Single Record Fetch Benchmark ===');
      console.log(`Fetching person ID: ${personId}, Iterations: ${iterations}`);

      // Warm up caches
      await repository.findTableModelById(personId);
      await repository.findModelById(personId);

      // Benchmark TableModel
      console.log('\n1. TableModel (no joins):');
      const tableModelStart = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = await repository.findTableModelById(personId);
        expect(result).toBeDefined();
        expect(result?.id).toBe(personId);
      }

      const tableModelEnd = performance.now();
      const tableModelTime = tableModelEnd - tableModelStart;
      const tableModelAvg = tableModelTime / iterations;

      console.log(`  Total time: ${tableModelTime.toFixed(2)}ms`);
      console.log(`  Average per query: ${tableModelAvg.toFixed(3)}ms`);
      console.log(`  Queries per second: ${(1000 / tableModelAvg).toFixed(0)}`);

      // Benchmark Model (with denorm data)
      console.log('\n2. Model (with denormalized data):');
      const modelStart = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = await repository.findModelById(personId);
        expect(result).toBeDefined();
        expect(result?.id).toBe(personId);
        // Model should have denormalized fields
        expect(result?.dynastyName).toBeDefined();
      }

      const modelEnd = performance.now();
      const modelTime = modelEnd - modelStart;
      const modelAvg = modelTime / iterations;

      console.log(`  Total time: ${modelTime.toFixed(2)}ms`);
      console.log(`  Average per query: ${modelAvg.toFixed(3)}ms`);
      console.log(`  Queries per second: ${(1000 / modelAvg).toFixed(0)}`);

      // Performance comparison
      const overhead = ((modelAvg - tableModelAvg) / tableModelAvg) * 100;
      const slowdown = modelAvg / tableModelAvg;

      console.log('\n=== Performance Comparison ===');
      console.log(`  Denormalization overhead: ${overhead.toFixed(1)}%`);
      console.log(`  Slowdown factor: ${slowdown.toFixed(2)}x`);
      console.log(`  Additional time per query: ${(modelAvg - tableModelAvg).toFixed(3)}ms`);

      // Model should be slower due to additional joins
      expect(modelAvg).toBeGreaterThan(tableModelAvg);
    });
  });

  describe('Batch Fetch Performance', () => {
    it('should compare batch fetch performance with varying sizes', async () => {
      const batchSizes = [10, 50, 100, 200];

      console.log('\n=== Batch Fetch Benchmark ===');

      for (const batchSize of batchSizes) {
        console.log(`\nBatch size: ${batchSize}`);

        // Get random person IDs for testing
        const personIds: number[] = [];
        for (let i = 0; i < batchSize; i++) {
          personIds.push(1000 + i); // Sequential IDs starting from 1000
        }

        const iterations = Math.max(10, Math.floor(500 / batchSize)); // Adjust iterations based on batch size

        // Warm up
        await repository.findTableModelsByIds(personIds.slice(0, 5));
        await repository.findModelsByIds(personIds.slice(0, 5));

        // Benchmark TableModels batch
        console.log(`  TableModels (${iterations} iterations):`);
        const tableModelsStart = performance.now();

        for (let i = 0; i < iterations; i++) {
          const results = await repository.findTableModelsByIds(personIds);
          expect(results).toBeDefined();
          expect(results.length).toBeGreaterThan(0);
        }

        const tableModelsEnd = performance.now();
        const tableModelsTime = tableModelsEnd - tableModelsStart;
        const tableModelsAvg = tableModelsTime / iterations;
        const tableModelsPerRecord = tableModelsAvg / batchSize;

        console.log(`    Total: ${tableModelsTime.toFixed(2)}ms`);
        console.log(`    Avg per batch: ${tableModelsAvg.toFixed(2)}ms`);
        console.log(`    Avg per record: ${tableModelsPerRecord.toFixed(3)}ms`);

        // Benchmark Models batch (with denorm)
        console.log(`  Models with denorm (${iterations} iterations):`);
        const modelsStart = performance.now();

        for (let i = 0; i < iterations; i++) {
          const results = await repository.findModelsByIds(personIds);
          expect(results).toBeDefined();
          expect(results.length).toBeGreaterThan(0);
          // Check denormalized data is present
          if (results.length > 0) {
            expect(results[0].dynastyName !== undefined).toBe(true);
          }
        }

        const modelsEnd = performance.now();
        const modelsTime = modelsEnd - modelsStart;
        const modelsAvg = modelsTime / iterations;
        const modelsPerRecord = modelsAvg / batchSize;

        console.log(`    Total: ${modelsTime.toFixed(2)}ms`);
        console.log(`    Avg per batch: ${modelsAvg.toFixed(2)}ms`);
        console.log(`    Avg per record: ${modelsPerRecord.toFixed(3)}ms`);

        // Comparison
        const overhead = ((modelsAvg - tableModelsAvg) / tableModelsAvg) * 100;
        const slowdown = modelsAvg / tableModelsAvg;

        console.log(`  Performance Impact:`);
        console.log(`    Overhead: ${overhead.toFixed(1)}%`);
        console.log(`    Slowdown: ${slowdown.toFixed(2)}x`);
        console.log(`    Extra time per batch: ${(modelsAvg - tableModelsAvg).toFixed(2)}ms`);
        console.log(`    Extra time per record: ${(modelsPerRecord - tableModelsPerRecord).toFixed(3)}ms`);
      }
    });
  });

  describe('Memory Usage Analysis', () => {
    it('should analyze memory impact of denormalization', async () => {
      const testSize = 500;
      const personIds: number[] = [];
      for (let i = 0; i < testSize; i++) {
        personIds.push(1000 + i * 10); // Spread out IDs
      }

      console.log('\n=== Memory Usage Analysis ===');
      console.log(`Loading ${testSize} records...`);

      // Measure memory before
      if (global.gc) {
        global.gc(); // Force garbage collection if available
      }
      const memBefore = process.memoryUsage();

      // Load TableModels
      const tableModels = await repository.findTableModelsByIds(personIds);
      const tableModelsCount = tableModels.length;

      const memAfterTableModels = process.memoryUsage();
      const tableModelsMemory = memAfterTableModels.heapUsed - memBefore.heapUsed;

      console.log(`\nTableModels:`);
      console.log(`  Records loaded: ${tableModelsCount}`);
      console.log(`  Memory used: ${(tableModelsMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Per record: ${(tableModelsMemory / tableModelsCount / 1024).toFixed(2)} KB`);

      // Clear and measure Models
      if (global.gc) {
        global.gc();
      }
      const memBeforeModels = process.memoryUsage();

      const models = await repository.findModelsByIds(personIds);
      const modelsCount = models.length;

      const memAfterModels = process.memoryUsage();
      const modelsMemory = memAfterModels.heapUsed - memBeforeModels.heapUsed;

      console.log(`\nModels with denorm:`);
      console.log(`  Records loaded: ${modelsCount}`);
      console.log(`  Memory used: ${(modelsMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Per record: ${(modelsMemory / modelsCount / 1024).toFixed(2)} KB`);

      // Comparison
      const memoryOverhead = ((modelsMemory - tableModelsMemory) / tableModelsMemory) * 100;
      const memoryRatio = modelsMemory / tableModelsMemory;

      console.log(`\nMemory Comparison:`);
      console.log(`  Additional memory: ${((modelsMemory - tableModelsMemory) / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Overhead: ${memoryOverhead.toFixed(1)}%`);
      console.log(`  Memory ratio: ${memoryRatio.toFixed(2)}x`);
      console.log(`  Extra per record: ${((modelsMemory - tableModelsMemory) / modelsCount / 1024).toFixed(2)} KB`);
    });
  });

  describe('Real-World Query Patterns', () => {
    it('should benchmark common search patterns', async () => {
      console.log('\n=== Real-World Query Patterns ===');

      // Pattern 1: Search by name (returns multiple results)
      const searchQuery = '王';
      const iterations = 20;

      console.log(`\n1. Search by name "${searchQuery}" (${iterations} iterations):`);

      // This uses the searchByName method which already uses findModelsByIds internally
      const searchStart = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = await repository.searchByName({
          name: searchQuery,
          start: 0,
          limit: 100
        });
        expect(result.data).toBeDefined();
        expect(result.data.length).toBeGreaterThan(0);
      }

      const searchEnd = performance.now();
      const searchTime = searchEnd - searchStart;
      const searchAvg = searchTime / iterations;

      console.log(`  Total: ${searchTime.toFixed(2)}ms`);
      console.log(`  Average: ${searchAvg.toFixed(2)}ms`);
      console.log(`  Searches per second: ${(1000 / searchAvg).toFixed(1)}`);

      // Pattern 2: Dynasty search
      const dynastyCode = 15; // Song Dynasty
      console.log(`\n2. Search by dynasty (code ${dynastyCode}, ${iterations} iterations):`);

      const dynastyStart = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = await repository.searchByDynasty({
          dynastyCode,
          start: 0,
          limit: 50
        });
        expect(result.data).toBeDefined();
      }

      const dynastyEnd = performance.now();
      const dynastyTime = dynastyEnd - dynastyStart;
      const dynastyAvg = dynastyTime / iterations;

      console.log(`  Total: ${dynastyTime.toFixed(2)}ms`);
      console.log(`  Average: ${dynastyAvg.toFixed(2)}ms`);
      console.log(`  Searches per second: ${(1000 / dynastyAvg).toFixed(1)}`);
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('Scaling Analysis', () => {
    it('should analyze how performance scales with data size', async () => {
      const sizes = [1, 5, 10, 25, 50, 100, 250, 500];
      const tableModelTimes: number[] = [];
      const modelTimes: number[] = [];

      console.log('\n=== Scaling Analysis ===');
      console.log('Size\tTableModel(ms)\tModel(ms)\tOverhead(%)');
      console.log('----\t--------------\t---------\t-----------');

      for (const size of sizes) {
        const personIds: number[] = [];
        for (let i = 0; i < size; i++) {
          personIds.push(1000 + i * 5);
        }

        // Measure TableModels
        const tmStart = performance.now();
        await repository.findTableModelsByIds(personIds);
        const tmTime = performance.now() - tmStart;
        tableModelTimes.push(tmTime);

        // Measure Models
        const mStart = performance.now();
        await repository.findModelsByIds(personIds);
        const mTime = performance.now() - mStart;
        modelTimes.push(mTime);

        const overhead = ((mTime - tmTime) / tmTime) * 100;

        console.log(`${size}\t${tmTime.toFixed(2)}\t\t${mTime.toFixed(2)}\t\t${overhead.toFixed(1)}`);
      }

      // Calculate scaling factors
      console.log('\n=== Scaling Characteristics ===');

      // Compare first and last measurements
      const tmScaling = tableModelTimes[tableModelTimes.length - 1] / tableModelTimes[0];
      const mScaling = modelTimes[modelTimes.length - 1] / modelTimes[0];
      const sizeScaling = sizes[sizes.length - 1] / sizes[0];

      console.log(`Data size increased: ${sizeScaling}x`);
      console.log(`TableModel time increased: ${tmScaling.toFixed(2)}x`);
      console.log(`Model time increased: ${mScaling.toFixed(2)}x`);

      // Check if scaling is linear
      const tmLinearityScore = Math.abs(1 - (tmScaling / sizeScaling));
      const mLinearityScore = Math.abs(1 - (mScaling / sizeScaling));

      console.log(`\nLinearity analysis (0 = perfectly linear):`);
      console.log(`TableModel: ${tmLinearityScore.toFixed(3)}`);
      console.log(`Model: ${mLinearityScore.toFixed(3)}`);

      if (mLinearityScore > tmLinearityScore * 1.5) {
        console.log('⚠️  Model scaling is significantly worse than TableModel');
      } else {
        console.log('✓  Both scale similarly');
      }
    });
  });
});