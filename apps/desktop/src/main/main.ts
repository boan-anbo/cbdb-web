import { app } from 'electron';
import {
  loadServerEnvironment,
  setupEnvironment,
  initializeElectronApp
} from './modules/app-init';
import { initializeDatabase } from './database-init';
import { setupIpcHandlers } from './ipc-handlers';

/**
 * Main bootstrap function for the Electron + NestJS application.
 *
 * CRITICAL BOOTSTRAP ORDER:
 * 1. Load server environment variables BEFORE any server imports
 * 2. Set up Electron environment (ports, paths)
 * 3. Initialize Electron app
 * 4. Initialize database
 * 5. Set up IPC handlers
 * 6. Bootstrap NestJS via dynamic import (after env vars are loaded)
 *
 * The dynamic import for NestJS is essential to prevent the server's
 * env.config.ts from running before environment variables are set.
 */
async function bootstrap() {
  try {
    // Step 1: Load server environment BEFORE any server code runs
    loadServerEnvironment();

    // Step 2: Set up environment variables (including port resolution)
    await setupEnvironment();

    // Step 3: Initialize Electron app
    await initializeElectronApp();

    // Step 4: Initialize the CBDB database
    // This will extract on first run if needed
    await initializeDatabase().catch(err => {
      console.error('Failed to initialize database:', err);
      // Continue anyway - app might work with manual config
    });

    // Step 5: Set up IPC handlers for database operations
    setupIpcHandlers();

    // Step 6: Bootstrap NestJS using dynamic import
    // CRITICAL: We use dynamic import here instead of static import at the top
    // because the server's env.config.ts loads environment variables at import time.
    // By using dynamic import AFTER setting up the environment, we ensure
    // CBDB_PATH and other env vars are available when the server initializes.
    const { bootstrapNestJS } = await import('./modules/nestjs-bootstrap');
    await bootstrapNestJS();

    // Application successfully started
    console.log('✅ Application bootstrap completed successfully');

  } catch (error) {
    console.error('❌ Bootstrap error:', error);
    app.quit();
  }
}

// Start the application
bootstrap();