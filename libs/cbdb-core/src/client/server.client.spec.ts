import { describe, it, expect, beforeAll } from 'vitest';
import { ServerClient } from './server.client';
import { BaseClient } from './base-client';
import { CbdbClient } from './index';

/**
 * Check if the server is running at the specified URL
 */
async function checkServerIsRunning(url: string): Promise<void> {
  try {
    const response = await fetch(`${url}/api/health/ping`);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Server is not running at ${url}. Please start the server with: cd apps/server && npm run start:dev\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

describe('ServerClient Health Endpoints', () => {
  let client: ServerClient;
  let cbdbClient: CbdbClient;
  const SERVER_PORT = 18019; // Default server port
  const SERVER_URL = `http://localhost:${SERVER_PORT}`;

  beforeAll(async () => {
    // First check if server is running
    await checkServerIsRunning(SERVER_URL);

    // Initialize clients - server should already be running at default port
    const baseClient = new BaseClient({ baseUrl: SERVER_URL });
    client = new ServerClient(baseClient);

    // Also test through the main CbdbClient
    cbdbClient = new CbdbClient({ baseUrl: SERVER_URL });
  });

  describe('Health Check Endpoint', () => {
    it('should return successful health status through ServerClient', async () => {
      const response = await client.checkHealth();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
      expect(response.uptime).toBeGreaterThan(0);
      expect(response.environment).toBeDefined();
    });

    it('should return successful health status through CbdbClient', async () => {
      const response = await cbdbClient.server.checkHealth();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.timestamp).toBeDefined();
      expect(response.uptime).toBeGreaterThan(0);
    });
  });

  describe('Ping Endpoint', () => {
    it('should return pong response through ServerClient', async () => {
      const response = await client.ping();

      expect(response).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });

    it('should return pong response through CbdbClient', async () => {
      const response = await cbdbClient.server.ping();

      expect(response).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('Health Details Endpoint', () => {
    it('should return detailed health information', async () => {
      const response = await client.getHealthDetails({
        includeServices: true,
        includeResources: true
      });

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.services).toBeDefined();
      expect(response.services?.cbdbDatabase).toBeDefined();
      expect(response.resources).toBeDefined();
    });

    it('should return basic health info when no options provided', async () => {
      const response = await client.getHealthDetails();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      // When no options provided, services and resources might be undefined
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Create a client with wrong URL
      const wrongClient = new ServerClient(
        new BaseClient({ baseUrl: 'http://localhost:99999' })
      );

      await expect(wrongClient.checkHealth()).rejects.toThrow();
    });
  });
});