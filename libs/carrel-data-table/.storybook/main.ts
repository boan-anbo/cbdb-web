import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../packages/react/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/react/src/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
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
        '@carrel-data-table/react': path.resolve(__dirname, '../packages/react/src'),
        '@carrel-data-table/core': path.resolve(__dirname, '../packages/core/src'),
        '@carrel-data-table/datasources': path.resolve(__dirname, '../packages/datasources/src'),
      };
    }
    return config;
  },
};

export default config;