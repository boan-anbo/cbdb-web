import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    watch: false,  // Disable watch mode by default
    silent: true,  // Suppress console output
    reporters: ['basic'],  // Use basic reporter for minimal output
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});