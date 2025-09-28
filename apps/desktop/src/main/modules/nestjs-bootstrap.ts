/**
 * NestJS Bootstrap Module
 *
 * CRITICAL: This module MUST be loaded via dynamic import(), not static import!
 *
 * Why dynamic import is required:
 * 1. The server's env.config.ts loads environment variables at module import time
 * 2. JavaScript hoists all static imports to execute before any code in the file
 * 3. If we use static import, env.config.ts runs before we can set CBDB_PATH
 * 4. Dynamic import() delays module loading until explicitly called
 *
 * This allows the main process to:
 * 1. Load the server's .env file first
 * 2. Set environment variables like CBDB_PATH
 * 3. THEN load this module and the server code
 *
 * Usage:
 * ```typescript
 * // In main.ts - AFTER setting up environment
 * const { bootstrapNestJS } = await import('./modules/nestjs-bootstrap');
 * await bootstrapNestJS();
 * ```
 */

import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ElectronIpcTransport } from '@doubleshot/nest-electron';
import { AppElectronModule } from '../../../../server/src/app.module.electron';
import { setupCommonAppFeatures } from '../../../../server/src/common/bootstrap/app-bootstrap';
import { ServerInfoService } from '../../../../server/src/server/server-info.service';
import { portManager } from './port-manager';

export interface NestApplication {
  app: INestApplication;
  port: number;
}

/**
 * Bootstrap NestJS hybrid application (HTTP + IPC)
 */
export async function bootstrapNestJS(): Promise<NestApplication> {
  // Create the module with Electron support
  const AppModule = AppElectronModule.forRoot({ isElectron: true });

  // Create hybrid application with both HTTP and IPC
  const result = await createHybridApplication(AppModule);

  return result;
}

/**
 * Create and configure the hybrid application (HTTP + IPC)
 *
 * The port has already been resolved in setupEnvironment() and stored in process.env.PORT.
 * This ensures envConfig in the NestJS modules reads the correct port value.
 */
async function createHybridApplication(AppModule: any): Promise<NestApplication> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Read the port that was already resolved in setupEnvironment()
  // This port is guaranteed to be available (or we're using fallback)
  const port = parseInt(process.env.PORT || '18019', 10);

  // Ensure PortManager has the port for IPC queries
  // (It should already be set by setupEnvironment, but this ensures consistency)
  if (portManager.getPort() !== port) {
    console.warn(`Port mismatch detected. Updating PortManager to ${port}`);
    portManager.setPort(port);
  }

  // Apply common bootstrap configuration (filters, pipes, docs, etc.)
  // Pass the port so Swagger uses the correct server URL
  setupCommonAppFeatures(app, port);

  // Connect IPC microservice to the same app instance
  app.connectMicroservice<MicroserviceOptions>({
    strategy: new ElectronIpcTransport('IpcTransport'),
  });

  // Start all microservices
  await app.startAllMicroservices();
  console.log('IPC transport is running');

  // Start HTTP server on the pre-resolved port
  await app.listen(port);

  // Success! Log all server URLs with the correct port
  console.log('Hybrid application is running:');
  console.log(`  - HTTP server: http://localhost:${port}`);
  console.log('  - IPC transport: Active');

  // Use consistent logging for documentation URLs
  console.log(`API Documentation available at: http://localhost:${port}/docs`);
  console.log(`  - Scalar UI: http://localhost:${port}/docs/scalar`);
  console.log(`  - Swagger UI: http://localhost:${port}/docs/swagger`);
  console.log(`  - OpenAPI JSON: http://localhost:${port}/docs/openapi.json`);
  console.log(`  - OpenAPI YAML: http://localhost:${port}/docs/openapi.yaml`);
  console.log(`  - OpenAPI Markdown: http://localhost:${port}/docs/openapi.md`)

  // Pass the port to the server-info service if it exists
  // ServerModule is now included in AppElectronModule, so this should work
  try {
    const serverInfoService = app.get(ServerInfoService);
    serverInfoService.setPort(port);
    console.log(`ServerInfoService updated with port ${port}`);
  } catch (e) {
    // ServerInfoService not available - log for debugging
    console.debug('ServerInfoService not available in Electron mode:', e);
  }

  return { app, port };
}