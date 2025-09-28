import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    watch: false,  // Disable watch mode by default
    silent: true,  // Suppress console output in tests
    reporters: ['basic'],  // Use basic reporter for minimal output
    logHeapUsage: false,  // Don't show heap usage
    hideSkippedTests: true,  // Hide skipped tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      silent: true,
    },
  },
  benchmark: {
    include: ['**/*.bench.ts'],
    exclude: ['node_modules', 'dist'],
    reporters: ['default', 'json'],
    outputFile: './benchmark-results.json',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});