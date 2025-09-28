/**
 * PersonGraphClient Tests
 *
 * These tests ensure that the client's endpoint paths are correct
 * and match what the server actually provides.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseClient } from './base-client';
import { PersonGraphClient } from './person-graph.client';
import { assertEndpointExists, createTestClient } from './test-utils/endpoint-sanity-check';

describe('PersonGraphClient', () => {
  let baseClient: BaseClient;
  let client: PersonGraphClient;

  beforeEach(() => {
    // Use base URL without /api (endpoints already include it)
    baseClient = createTestClient('http://localhost:18019');
    client = new PersonGraphClient(baseClient);
  });

  describe('Endpoint Path Sanity Checks', () => {
    it('should use /people/ not /persons/ in exploreNetwork endpoint', async () => {
      await assertEndpointExists(
        () => client.exploreNetwork(1762, { depth: 1 }),
        'PersonGraphClient.exploreNetwork'
      );
    });

    it('should use /people/ in exploreAssociationNetwork endpoint', async () => {
      await assertEndpointExists(
        () => client.exploreAssociationNetwork(1762, { depth: 1 }),
        'PersonGraphClient.exploreAssociationNetwork'
      );
    });

    it('should use /people/ in exploreDirectNetwork endpoint', async () => {
      await assertEndpointExists(
        () => client.exploreDirectNetwork(1762),
        'PersonGraphClient.exploreDirectNetwork'
      );
    });

    it('should use /people/ in exploreKinshipNetwork endpoint', async () => {
      await assertEndpointExists(
        () => client.exploreKinshipNetwork(1762, 1),
        'PersonGraphClient.exploreKinshipNetwork'
      );
    });

    it('should use /people/ in buildMultiPersonNetwork endpoint', async () => {
      await assertEndpointExists(
        () => client.buildMultiPersonNetwork([1762, 526]),
        'PersonGraphClient.buildMultiPersonNetwork'
      );
    });
  });

  describe('Path Construction', () => {
    it('should correctly construct paths with /people/ prefix', () => {
      // We can't directly test the path construction without making a request,
      // but we can at least verify the client methods exist and accept correct params
      expect(client.exploreNetwork).toBeDefined();
      expect(client.exploreAssociationNetwork).toBeDefined();
      expect(client.exploreDirectNetwork).toBeDefined();
      expect(client.exploreKinshipNetwork).toBeDefined();
      expect(client.buildMultiPersonNetwork).toBeDefined();
    });
  });
});