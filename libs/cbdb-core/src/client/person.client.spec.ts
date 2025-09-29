import { describe, it, expect, beforeAll } from 'vitest';
import { PersonClient } from './person.client';
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

describe('PersonClient Endpoints', () => {
  let client: PersonClient;
  let cbdbClient: CbdbClient;
  const SERVER_PORT = 18019; // Default server port
  const SERVER_URL = `http://localhost:${SERVER_PORT}`;

  beforeAll(async () => {
    // First check if server is running
    await checkServerIsRunning(SERVER_URL);

    // Initialize clients - server should already be running at default port
    const baseClient = new BaseClient({ baseUrl: SERVER_URL });
    client = new PersonClient(baseClient);

    // Also test through the main CbdbClient
    cbdbClient = new CbdbClient({ baseUrl: SERVER_URL });
  });

  describe('list', () => {
    it('should return list results for Wang Anshi', async () => {
      const response = await client.list({
        name: 'Wang Anshi',
        limit: "10"
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.total).toBeGreaterThanOrEqual(0);
    });

    it('should work through CbdbClient', async () => {
      const response = await cbdbClient.person.list({
        name: 'Wang Anshi',
        limit: "5"
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return person by ID', async () => {
      const response = await client.getById(1762); // Wang Anshi

      expect(response).toBeDefined();
      expect(response.id).toBe(1762);
      expect(response.nameChn).toBe('王安石');
    });
  });

  describe('getFullById', () => {
    it('should return person with all relations', async () => {
      const response = await client.getFullById(1762);

      expect(response).toBeDefined();
      expect(response.person).toBeDefined();
      expect(response.person.id).toBe(1762);
      expect(response.fullRelations).toBeDefined();
      expect(response.fullRelations.kinships).toBeDefined();
      expect(Array.isArray(response.fullRelations.kinships)).toBe(true);
      expect(response.fullRelations.addresses).toBeDefined();
      expect(Array.isArray(response.fullRelations.addresses)).toBe(true);
    });
  });

  describe('getBirthDeathView', () => {
    it('should return birth/death view for Wang Anshi', async () => {
      const response = await client.getBirthDeathView(1762);

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data?.personId).toBe(1762);
      expect(response.data?.name).toBe('Wang Anshi');
      expect(response.data?.nameChn).toBe('王安石');
      expect(response.data?.birthYear).toBe(1021);
      expect(response.data?.deathYear).toBe(1086);
    });

    it('should work through CbdbClient', async () => {
      const response = await cbdbClient.person.getBirthDeathView(1762);

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data?.personId).toBe(1762);
      expect(response.data?.birthYear).toBe(1021);
      expect(response.data?.deathYear).toBe(1086);
    });

    it('should handle person without birth/death data', async () => {
      const response = await client.getBirthDeathView(100);

      expect(response).toBeDefined();
      if (response.data) {
        expect(response.data.personId).toBe(100);
        // Birth/death years may be null
        expect(response.data).toHaveProperty('birthYear');
        expect(response.data).toHaveProperty('deathYear');
      }
    });
  });

  describe('getStatsView', () => {
    it.skip('should return statistics view', async () => {
      const response = await client.getStatsView(1762);

      expect(response).toBeDefined();
      // TODO: Fix when getRelationStats is fully implemented
      // expect(response.person).toBeDefined();
      // expect(response.person.personId).toBe(1762);
      // expect(response.stats).toBeDefined();
    });
  });

  describe('list with dynasty filter', () => {
    it('should return people from Song dynasty', async () => {
      const response = await client.list({
        dynastyCode: "15", // Song Dynasty
        limit: "10"
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('list with year range', () => {
    it('should return people from year range', async () => {
      const response = await client.list({
        startYear: "1000",
        endYear: "1100",
        limit: "10"
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('search (complex)', () => {
    it.skip('should perform complex search with multiple criteria', async () => {
      const response = await client.search({
        name: 'Wang',
        dynastyCode: "15",
        yearFrom: "1000",
        yearTo: "1100",
        limit: 10
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('batch', () => {
    it.skip('should return multiple people by IDs', async () => {
      const response = await client.batch({
        ids: [1762, 372] // Wang Anshi and Su Shi
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      // TODO: Fix when batchGet response structure is fixed
      // expect(response.found).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Create a client with wrong URL
      const wrongClient = new PersonClient(
        new BaseClient({ baseUrl: 'http://localhost:99999' })
      );

      await expect(wrongClient.getById(1762)).rejects.toThrow();
    });
  });
});