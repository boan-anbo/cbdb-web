import { bench, describe } from 'vitest';

describe('Simple benchmark test', () => {
  bench('fast operation', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    arr.reduce((sum, n) => sum + n, 0);
  });

  bench('slower operation', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr.reduce((sum, n) => sum + n, 0);
  });
});