/**
 * Utility functions for consistent server logging
 */

/**
 * Log server startup information including documentation URLs
 * @param port The port number the server is running on
 * @param includeIpc Whether to include IPC transport info (for Electron)
 */
export function logServerStartup(port: number, includeIpc = false): void {
  console.log(`✅ Application is running on: http://localhost:${port}`);

  if (includeIpc) {
    console.log('  - IPC transport: Active');
  }

  logDocumentationUrls(port);
}

/**
 * Log API documentation URLs
 * @param port The port number for the documentation URLs
 */
export function logDocumentationUrls(port: number): void {
  console.log(`API Documentation available at: http://localhost:${port}/docs`);
  console.log(`  - Scalar UI: http://localhost:${port}/docs/scalar`);
  console.log(`  - Swagger UI: http://localhost:${port}/docs/swagger`);
  console.log(`  - OpenAPI JSON: http://localhost:${port}/docs/openapi.json`);
  console.log(`  - OpenAPI YAML: http://localhost:${port}/docs/openapi.yaml`);
  console.log(`  - OpenAPI Markdown: http://localhost:${port}/docs/openapi.md`);
}

/**
 * Log port conflict and resolution
 * @param preferredPort The originally requested port
 * @param actualPort The port actually being used
 */
export function logPortResolution(preferredPort: number, actualPort: number): void {
  if (actualPort !== preferredPort) {
    console.log(`⚠️  Port ${preferredPort} is already in use`);
    console.log(`✅ Using alternative port: ${actualPort}`);
  } else {
    console.log(`✅ Using preferred port: ${preferredPort}`);
  }
}