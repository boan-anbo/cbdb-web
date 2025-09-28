/// <reference types="vitest/config" />
import { defineConfig, defineProject } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    projects: [
      defineProject({
        extends: false,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            // Use npm run storybook with --ci flag
            storybookScript: 'npm run storybook -- --ci',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
            '@render': path.resolve(dirname, './src/render'),
            '@main': path.resolve(dirname, './src/main'),
          },
        },
      }),
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@render': path.resolve(dirname, './src/render'),
      '@main': path.resolve(dirname, './src/main'),
    },
  },
});
