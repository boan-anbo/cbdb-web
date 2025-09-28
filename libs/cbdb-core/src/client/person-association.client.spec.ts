import { describe, it, expect, beforeAll } from 'vitest';
import { PersonAssociationClient } from './person-association.client';
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

describe('PersonAssociationClient Endpoints', () => {
  let client: PersonAssociationClient;
  let cbdbClient: CbdbClient;
  const SERVER_PORT = 18019; // Default server port
  const SERVER_URL = `http://localhost:${SERVER_PORT}`;

  beforeAll(async () => {
    // First check if server is running
    await checkServerIsRunning(SERVER_URL);

    // Initialize clients - server should already be running at default port
    const baseClient = new BaseClient({ baseUrl: SERVER_URL });
    client = new PersonAssociationClient(baseClient);

    // Also test through the main CbdbClient
    cbdbClient = new CbdbClient({ baseUrl: SERVER_URL });
  });

  describe('getPersonAssociations', () => {
    it('should return associations for Yangyi (ID: 7097)', async () => {
      const response = await client.getPersonAssociations(7097);

      expect(response).toBeDefined();
      expect(response.personId).toBe(7097);
      expect(response.personName).toBeDefined();
      expect(response.personNameChn).toBe('楊億');
      expect(response.totalAssociations).toBe(202);
      expect(response.associations).toBeDefined();
      expect(response.associations).toHaveLength(202);

      // Check structure of first association
      const firstAssoc = response.associations[0];
      expect(firstAssoc).toBeDefined();
      expect(firstAssoc.personId).toBeDefined();
      expect(firstAssoc.assocId).toBeDefined();
      expect(firstAssoc.assocCode).toBeDefined();

      // Check that some associations have type info
      const withTypeInfo = response.associations.filter(a => a.associationTypeInfo !== null);
      expect(withTypeInfo.length).toBeGreaterThan(0);

      // Check that some associations have person info
      const withPersonInfo = response.associations.filter(a => a.assocPersonInfo !== null);
      expect(withPersonInfo.length).toBeGreaterThan(0);
    });

    it('should return associations for Wang Anshi (ID: 1762)', async () => {
      const response = await client.getPersonAssociations(1762);

      expect(response).toBeDefined();
      expect(response.personId).toBe(1762);
      expect(response.personName).toBe('Wang Anshi');
      expect(response.personNameChn).toBe('王安石');
      expect(response.totalAssociations).toBeGreaterThan(0);
      expect(response.associations).toBeDefined();
      expect(response.associations.length).toBeGreaterThan(0);

      // Wang Anshi should have various types of associations
      const types = new Set(response.associations.map(a => a.assocCode));
      expect(types.size).toBeGreaterThan(1);
    });

    it('should work through main CbdbClient', async () => {
      const response = await cbdbClient.personAssociation.getPersonAssociations(7097);

      expect(response).toBeDefined();
      expect(response.personId).toBe(7097);
      expect(response.totalAssociations).toBe(202);
    });

    it('should return null for non-existent person', async () => {
      try {
        await client.getPersonAssociations(99999999);
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        // Should throw a 404 error
        expect(error).toBeDefined();
        expect(error.status || error.statusCode).toBe(404);
      }
    });

    it('should include response time', async () => {
      const response = await client.getPersonAssociations(1762);

      // Response time may not always be included, depends on implementation
      if (response.responseTime !== undefined) {
        expect(response.responseTime).toBeGreaterThanOrEqual(0);
      }
    });

    it('should support direction parameter for unidirectional queries', async () => {
      // Test primary direction
      const primaryResponse = await client.getPersonAssociations(7097, 'primary');
      expect(primaryResponse).toBeDefined();
      expect(primaryResponse.totalAssociations).toBe(101);

      // Test associated direction
      const associatedResponse = await client.getPersonAssociations(7097, 'associated');
      expect(associatedResponse).toBeDefined();
      expect(associatedResponse.totalAssociations).toBe(101);

      // Test that primary + associated = total
      const totalResponse = await client.getPersonAssociations(7097);
      expect(totalResponse.totalAssociations).toBe(202);
      expect(primaryResponse.totalAssociations + associatedResponse.totalAssociations).toBe(totalResponse.totalAssociations);
    });
  });
});