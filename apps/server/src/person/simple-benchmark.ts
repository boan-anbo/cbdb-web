/**
 * Simple benchmark script to compare search performance
 * Run with: npx tsx simple-benchmark.ts
 */

import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { PersonModule } from './person.module';
import { PersonRepository } from './person.repository';

async function runBenchmark() {
  console.log('Starting simple benchmark for person search...\n');

  // Create test module
  const moduleRef = await Test.createTestingModule({
    imports: [PersonModule]
  }).compile();

  const repository = moduleRef.get<PersonRepository>(PersonRepository);

  const testCases = [
    { name: '王', description: 'Common surname Wang' },
    { name: '李', description: 'Common surname Li' },
    { name: '王安', description: 'Partial name Wang An' }
  ];

  for (const { name, description } of testCases) {
    console.log(`\nBenchmarking: ${description} ("${name}")`);
    console.log('='.repeat(50));

    // Test WITHOUT sorting
    const timesWithoutSort: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const result = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 20,
        sortByImportance: false
      });
      const duration = Date.now() - start;
      timesWithoutSort.push(duration);

      if (i === 0) {
        console.log(`  Found ${result.total} total matches`);
        console.log(`  Returned ${result.data.length} results`);
      }
    }

    // Test WITH sorting
    const timesWithSort: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const result = await repository.searchByName({
        name,
        accurate: false,
        start: 0,
        limit: 20,
        sortByImportance: true
      });
      const duration = Date.now() - start;
      timesWithSort.push(duration);
    }

    // Calculate statistics
    const avgWithoutSort = timesWithoutSort.reduce((a, b) => a + b, 0) / timesWithoutSort.length;
    const avgWithSort = timesWithSort.reduce((a, b) => a + b, 0) / timesWithSort.length;
    const overhead = avgWithSort - avgWithoutSort;
    const overheadPercent = (overhead / avgWithoutSort) * 100;

    console.log('\n  Results:');
    console.log(`    WITHOUT sorting: ${avgWithoutSort.toFixed(2)}ms (${timesWithoutSort.join(', ')}ms)`);
    console.log(`    WITH sorting:    ${avgWithSort.toFixed(2)}ms (${timesWithSort.join(', ')}ms)`);
    console.log(`    Overhead:        ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);
  }

  // Test to verify sorting changes order
  console.log('\n\nVerifying sort order changes:');
  console.log('='.repeat(50));

  const unsorted = await repository.searchByName({
    name: '王',
    accurate: false,
    start: 0,
    limit: 10,
    sortByImportance: false
  });

  const sorted = await repository.searchByName({
    name: '王',
    accurate: false,
    start: 0,
    limit: 10,
    sortByImportance: true
  });

  console.log('\n  First 5 results WITHOUT sorting:');
  unsorted.data.slice(0, 5).forEach(p => {
    console.log(`    - ${p.nameChn || p.name} (ID: ${p.id})`);
  });

  console.log('\n  First 5 results WITH sorting (by importance):');
  sorted.data.slice(0, 5).forEach(p => {
    console.log(`    - ${p.nameChn || p.name} (ID: ${p.id})`);
  });

  await moduleRef.close();
  console.log('\nBenchmark complete!');
}

runBenchmark().catch(console.error);