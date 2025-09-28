/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Storybook-specific vitest configuration
export default defineConfig({
  plugins: [
    // The storybookTest plugin will handle React JSX transformation
    storybookTest({
      configDir: path.join(dirname, '.storybook'),
    }),
  ],
  test: {
    name: 'storybook',
    globals: true,
    environment: 'jsdom',
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@render': path.resolve(dirname, './src/render'),
      '@main': path.resolve(dirname, './src/main'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});