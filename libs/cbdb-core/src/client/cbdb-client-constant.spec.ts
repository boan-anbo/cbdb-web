import { describe, it, expect } from 'vitest';
import { cbdbClientManager, CbdbClientFactory } from './index';

describe('cbdbClientManager', () => {
  it('should be available as a singleton', () => {
    expect(cbdbClientManager).toBeDefined();
    expect(typeof cbdbClientManager.initialize).toBe('function');
    expect(typeof cbdbClientManager.getClientAsync).toBe('function');
  });

  it('should provide client after initialization', async () => {
    // Initialize with test configuration
    await cbdbClientManager.reconfigure('http://localhost:18019/api');

    const client = cbdbClientManager.getClient();
    expect(client).toBeDefined();
    expect(client.person).toBeDefined();
    expect(client.personOffice).toBeDefined();
    expect(client.server).toBeDefined();

    // Check methods are available
    expect(typeof client.person.list).toBe('function');
    expect(typeof client.person.getById).toBe('function');
    expect(typeof client.person.getBirthDeathView).toBe('function');
    expect(typeof client.personOffice.getPersonOffices).toBe('function');
    expect(typeof client.server.checkHealth).toBe('function');
  });
});

describe('CbdbClientFactory', () => {
  it('should create clients with different methods', () => {
    const client = CbdbClientFactory.createForWeb('http://localhost:18019/api');
    expect(client).toBeDefined();
    expect(client.person).toBeDefined();
  });
});

/**
 * Usage example for documentation:
 *
 * import { cbdbClientManager } from '@cbdb/core';
 *
 * // Initialize once
 * await cbdbClientManager.initialize();
 *
 * // Get client and use
 * const client = cbdbClientManager.getClient();
 * const person = await client.person.getById(1762);
 * const offices = await client.personOffice.getPersonOffices(1762);
 * const birthDeath = await client.person.getBirthDeathView(1762);
 *
 * // All clients are available after initialization
 * const health = await client.server.checkHealth();
 */