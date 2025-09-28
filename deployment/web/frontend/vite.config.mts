import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Web-specific Vite config without Electron
export default defineConfig({
  root: '../../apps/desktop/src/render',
  publicDir: '../../public',  // Point to the public directory
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, '../../apps/desktop/src'),
      // Force ESM version for browser compatibility
      '@cbdb/core': join(__dirname, '../../libs/cbdb-core/dist/index.mjs'),
    },
  },
  // Base path for assets when served under /cbdb
  base: '/cbdb/',
  build: {
    outDir: join(__dirname, '../../apps/desktop/dist/render'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'table-vendor': ['@tanstack/react-table', '@tanstack/react-virtual'],
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:18019',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Remove any Electron-specific globals
    'window.electron': 'undefined',
  },
})