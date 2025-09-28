import { describe, it, expect, beforeAll } from 'vitest';
import { PersonOfficeClient } from './person-office.client';
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

describe('PersonOfficeClient Endpoints', () => {
  let client: PersonOfficeClient;
  let cbdbClient: CbdbClient;
  const SERVER_PORT = 18019; // Default server port
  const SERVER_URL = `http://localhost:${SERVER_PORT}`;

  beforeAll(async () => {
    // First check if server is running
    await checkServerIsRunning(SERVER_URL);

    // Initialize clients - server should already be running at default port
    const baseClient = new BaseClient({ baseUrl: SERVER_URL });
    client = new PersonOfficeClient(baseClient);

    // Also test through the main CbdbClient
    cbdbClient = new CbdbClient({ baseUrl: SERVER_URL });
  });

  describe('getPersonOffices', () => {
    it('should return office appointments for Wang Anshi', async () => {
      const response = await client.getPersonOffices(1762);

      expect(response).toBeDefined();
      expect(response.personId).toBe(1762);
      expect(response.personName).toBe('Wang Anshi');
      expect(response.personNameChn).toBe('王安石');
      expect(response.totalOffices).toBe(41);
      expect(response.offices).toBeDefined();
      expect(Array.isArray(response.offices)).toBe(true);
      expect(response.offices).toHaveLength(41);
    });

    it('should work through CbdbClient', async () => {
      const response = await cbdbClient.personOffice.getPersonOffices(1762);

      expect(response).toBeDefined();
      expect(response.personId).toBe(1762);
      expect(response.totalOffices).toBe(41);
      expect(response.offices).toHaveLength(41);
    });

    it('should include office relations', async () => {
      const response = await client.getPersonOffices(1762);

      expect(response).toBeDefined();
      const firstOffice = response.offices[0];
      expect(firstOffice).toBeDefined();
      expect(firstOffice.personId).toBe(1762);
      expect(firstOffice.officeId).toBeDefined();

      // Check for extended relations
      if (firstOffice.officeInfo) {
        expect(firstOffice.officeInfo.id).toBe(firstOffice.officeId);
        expect(firstOffice.officeInfo.nameChn).toBeDefined();
      }
    });

    it('should handle non-existent person with error', async () => {
      // The API returns 404 error for non-existent person
      await expect(client.getPersonOffices(999999999)).rejects.toThrow();
    });

    it('should return offices ordered chronologically', async () => {
      const response = await client.getPersonOffices(1762);

      expect(response).toBeDefined();
      const officesWithYear = response.offices.filter(o => o.firstYear !== null);

      // Verify ordering for offices with years
      for (let i = 1; i < officesWithYear.length; i++) {
        const prev = officesWithYear[i - 1];
        const curr = officesWithYear[i];

        // Earlier year should come first
        if (prev.firstYear !== null && curr.firstYear !== null) {
          expect(prev.firstYear).toBeLessThanOrEqual(curr.firstYear);
        }
      }
    });

    it('should include appointment type information', async () => {
      const response = await client.getPersonOffices(1762);

      expect(response).toBeDefined();
      const officesWithAppointment = response.offices.filter(o => o.appointmentInfo !== null);
      expect(officesWithAppointment.length).toBeGreaterThan(0);

      // Check appointment types include expected values
      const appointmentTypes = new Set(
        officesWithAppointment
          .map(o => o.appointmentInfo?.nameChn)
          .filter(Boolean)
      );
      expect(appointmentTypes.size).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Create a client with wrong URL
      const wrongClient = new PersonOfficeClient(
        new BaseClient({ baseUrl: 'http://localhost:99999' })
      );

      await expect(wrongClient.getPersonOffices(1762)).rejects.toThrow();
    });
  });
});