
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/render/**/*.mdx',
    '../src/render/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  viteFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        '@render': path.resolve(__dirname, '../src/render'),
        '@main': path.resolve(__dirname, '../src/main'),
      };
    }
    // Configure @libsql/client to use Node.js version
    if (config.optimizeDeps) {
      config.optimizeDeps.exclude = [...(config.optimizeDeps.exclude || []), '@libsql/client'];
    } else {
      config.optimizeDeps = { exclude: ['@libsql/client'] };
    }

    // Make sure we're targeting Node environment for libSQL
    if (!config.build) config.build = {};
    if (!config.build.rollupOptions) config.build.rollupOptions = {};
    if (!config.build.rollupOptions.external) config.build.rollupOptions.external = [];

    return config;
  },
};

export default config;