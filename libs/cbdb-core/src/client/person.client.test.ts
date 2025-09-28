/**
 * Tests for PersonClient HTTP client
 * Tests against real backend at http://localhost:3902
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { BaseClient } from './base-client';
import { PersonClient } from './person.client';
import {
  PersonListQuery,
  PersonSearchQuery
} from '../domains/person/messages/person.cqrs';
import {
  GetPersonsByIdsRequest
} from '../domains/person/messages/person.dtos';

describe('PersonClient', () => {
  let client: PersonClient;

  beforeAll(() => {
    const baseClient = new BaseClient({ baseUrl: 'http://localhost:18019' });
    client = new PersonClient(baseClient);
  });

  describe('list', () => {
    it('should list people with name filter - exact match', async () => {
      const request: PersonListQuery = {
        name: '王安石',
        limit: "10"
      };

      const result = await client.list(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);

      // Should find 王安石
      const wangAnshi = result.data.find(p => p.nameChn === '王安石');
      expect(wangAnshi).toBeDefined();
      expect(wangAnshi?.id).toBe(1762);
    });

    it('should list people with name filter - partial match', async () => {
      const request: PersonListQuery = {
        name: '王',
        limit: "10",
        start: "0"
      };

      const result = await client.list(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(10);

      // All results should contain 王 in the name
      result.data.forEach(person => {
        const hasWang = person.nameChn?.includes('王') ||
                        person.name?.toLowerCase().includes('wang');
        expect(hasWang).toBe(true);
      });
    });

    it('should handle pagination', async () => {
      const firstRequest: PersonListQuery = {
        name: '李',
        limit: "5",
        start: "0"
      };

      const firstPage = await client.list(firstRequest);

      const secondRequest: PersonListQuery = {
        name: '李',
        limit: "5",
        start: "5"
      };

      const secondPage = await client.list(secondRequest);

      expect(firstPage.data.length).toBeLessThanOrEqual(5);
      expect(secondPage.data.length).toBeLessThanOrEqual(5);

      // Results should be different
      const firstIds = firstPage.data.map(p => p.id);
      const secondIds = secondPage.data.map(p => p.id);
      const overlap = firstIds.filter(id => secondIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('getById and getFullById', () => {
    it('should get person by ID', async () => {
      const result = await client.getById(1762);

      expect(result).toBeDefined();
      expect(result.id).toBe(1762);
      expect(result.nameChn).toBe('王安石');
    });

    it('should get person with all relations by ID', async () => {
      const result = await client.getFullById(1762);

      expect(result).toBeDefined();
      expect(result.person).toBeDefined();
      expect(result.person.id).toBe(1762);
      expect(result.person.nameChn).toBe('王安石');

      // Should include all relations
      expect(result.fullRelations).toBeDefined();
      expect(result.fullRelations.kinships).toBeDefined();
      expect(result.fullRelations.addresses).toBeDefined();
      expect(result.fullRelations.offices).toBeDefined();
    });

    it('should throw error for non-existent person', async () => {
      await expect(
        client.getById(99999999)
      ).rejects.toThrow();
    });
  });


  describe('getBirthDeathView', () => {
    it('should get person birth/death view', async () => {
      const result = await client.getBirthDeathView(1762);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data?.personId).toBe(1762);
      expect(result.data?.nameChn).toBe('王安石');

      // Check birth information
      expect(result.data?.birthYear).toBe(1021);
      expect(result.data?.birthDisplay).toContain('1021');
      expect(result.data?.birthNianHaoChn).toBe('天禧');

      // Check death information
      expect(result.data?.deathYear).toBe(1086);
      expect(result.data?.deathDisplay).toContain('1086');
      expect(result.data?.deathNianHaoChn).toBe('元祐');
      expect(result.data?.deathAge).toBe(66);
      expect(result.data?.ageDisplay).toBe('66歲');

      // Check dynasty
      expect(result.data?.dynastyChn).toBe('宋');
      expect(result.data?.dynastyPinyin).toBe('Song');

      // Check index year
      expect(result.data?.indexYear).toBe(1021);
      expect(result.data?.indexYearTypeDescChn).toBe('據生年');

      // Check additional biographical fields
      expect(result.data).toHaveProperty('choronymChn');
      expect(result.data).toHaveProperty('ethnicityChn');
      expect(result.data).toHaveProperty('householdStatusChn');
    });

    it('should handle person with floruit years', async () => {
      // Person 3702 has floruit years
      const result = await client.getBirthDeathView(3702);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data?.personId).toBe(3702);

      // Check floruit information
      expect(result.data?.floruitEarliestYear).toBe(869);
      expect(result.data?.floruitLatestYear).toBe(880);
      expect(result.data?.floruitDisplay).toBe('fl. 869-880');

      // Check year ranges (should be "約" for circa)
      expect(result.data?.birthYearRange).toBe('約');
      expect(result.data?.deathYearRange).toBe('約');
    });

    it('should handle person with minimal data', async () => {
      // Test with a person that has minimal birth/death information
      const result = await client.getBirthDeathView(1);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      // Should still have basic structure even if data is missing
      expect(result.data).toHaveProperty('birthDisplay');
      expect(result.data).toHaveProperty('deathDisplay');
      expect(result.data).toHaveProperty('ageDisplay');
    });
  });

  describe('getStatsView', () => {
    it('should get person statistics view', async () => {
      const result = await client.getStatsView(1762);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(1762);

      // Should have stats
      expect(result.stats).toBeDefined();
      expect(result.stats?.kinships).toBeDefined();
      expect(result.stats?.addresses).toBeDefined();
      expect(result.stats?.offices).toBeDefined();

      // Each stat should have count and ids
      expect(result.stats?.kinships).toHaveProperty('count');
      expect(result.stats?.kinships).toHaveProperty('ids');
    });
  });

  describe('list with filters', () => {
    it('should list people filtered by dynasty', async () => {
      // Dynasty code 15 is Song Dynasty (宋)
      const request: PersonListQuery = {
        dynastyCode: "15",
        limit: "10",
        start: "0"
      };

      const result = await client.list(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);

      // All results should be from Song Dynasty
      result.data.forEach(person => {
        expect(person.dynastyCode).toBe(15);
      });
    });
  });

  describe('list with year range', () => {
    it('should list people within year range', async () => {
      const request: PersonListQuery = {
        startYear: "1000",
        endYear: "1100",
        limit: "10",
        start: "0"
      };

      const result = await client.list(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);

      // All results should have index year in range
      result.data.forEach(person => {
        if (person.indexYear !== null) {
          expect(person.indexYear).toBeGreaterThanOrEqual(1000);
          expect(person.indexYear).toBeLessThanOrEqual(1100);
        }
      });
    });
  });

  describe('search (complex)', () => {
    it('should perform complex search with multiple filters', async () => {
      const request: PersonSearchQuery = {
        dynastyCode: "15",
        yearFrom: "1000",
        yearTo: "1100",
        gender: 'male',
        limit: "10",
        offset: "0"
      };

      const result = await client.search(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);

      // All results should match the filters
      result.data.forEach(person => {
        expect(person.dynastyCode).toBe(15);
        expect(person.female).toBe(0); // 0 = male
        if (person.indexYear !== null) {
          expect(person.indexYear).toBeGreaterThanOrEqual(1000);
          expect(person.indexYear).toBeLessThanOrEqual(1100);
        }
      });
    });
  });

  describe('batch', () => {
    it('should get multiple people by IDs', async () => {
      const ids = [1762, 3767, 5823]; // Some known person IDs
      const request = new GetPersonsByIdsRequest();
      request.ids = ids;

      const result = await client.batch(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(ids.length);

      // All returned persons should have IDs in our list
      result.data.forEach((person: any) => {
        expect(ids).toContain(person.id);
      });
    });

    it('should handle empty ID list', async () => {
      const request = new GetPersonsByIdsRequest();
      request.ids = [];

      const result = await client.batch(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
    });

    it('should handle non-existent IDs gracefully', async () => {
      const ids = [99999998, 99999999];
      const request = new GetPersonsByIdsRequest();
      request.ids = ids;

      const result = await client.batch(request);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      // Should return empty or only existing persons
      expect(result.data.length).toBeLessThanOrEqual(ids.length);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const errorClient = new BaseClient({ baseUrl: 'http://localhost:9999' });
      const personClient = new PersonClient(errorClient);

      const request: PersonListQuery = {
        name: 'test',
        limit: "10"
      };

      await expect(
        personClient.list(request)
      ).rejects.toThrow();
    });

    it('should handle invalid parameters', async () => {
      // Empty name search returns results (doesn't throw)
      // This is expected behavior from the API
      const request: PersonListQuery = {
        name: '',
        limit: "10"
      };

      const result = await client.list(request);
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should complete search within reasonable time', async () => {
      const start = Date.now();

      const request: PersonListQuery = {
        name: '王',
        limit: "10"
      };

      await client.list(request);

      const elapsed = Date.now() - start;
      // Should complete within 2 seconds for local SQLite
      expect(elapsed).toBeLessThan(2000);
    });

    it('should complete detail fetch within reasonable time', async () => {
      const start = Date.now();

      await client.getById(1762);

      const elapsed = Date.now() - start;
      // Should complete within 1 second for local SQLite
      expect(elapsed).toBeLessThan(1000);
    });
  });
});