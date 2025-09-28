import { defineConfig } from 'tsdown'
import path from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'], // Need both for NestJS (CJS) and React (ESM)
  dts: true,
  clean: true,
  outDir: 'dist',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  platform: 'neutral', // Build for both node and browser
  target: 'es2020',
  external: [
    // Mark Node-specific modules as external
    'fs',
    'path',
    'crypto',
  ],
})