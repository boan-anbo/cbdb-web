import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePluginDoubleshot } from 'vite-plugin-doubleshot'
import { compileDesktopWorkersPlugin } from './vite-plugin-desktop-workers'
import { copyServerWorkersPlugin } from './vite-plugin-copy-server-workers'

// https://vitejs.dev/config/
export default defineConfig({
  root: join(__dirname, 'src/render'),
  publicDir: join(__dirname, 'public'),
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.VITE_UI_ONLY === 'true'
      ? []
      : [
          compileDesktopWorkersPlugin(),
          copyServerWorkersPlugin(),
          VitePluginDoubleshot({
          type: 'electron',
          main: 'dist/main/index.js',
          entry: 'src/main/index.ts',
          outDir: 'dist/main',
          external: ['electron', 'class-transformer/storage', '@libsql/client'],
          electron: {
            build: {
              config: './electron-builder.config.js',
            },
            preload: {
              entry: 'src/preload/index.ts',
              outDir: 'dist/preload',
              external: ['electron'],
            },
          },
        }),
      ]),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      // Let Vite resolve @cbdb/core naturally from node_modules
    },
  },
  base: './',
  build: {
    outDir: join(__dirname, 'dist/render'),
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    exclude: ['@cbdb/core'],
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
})
