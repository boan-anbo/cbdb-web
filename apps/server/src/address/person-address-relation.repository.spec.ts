/**
 * Tests for PersonAddressRelationRepository
 * Validates address relations with proper trivial joins for ADDR_CODES and BIOG_ADDR_CODES
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonAddressRelationRepository } from './person-address-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { RelationStat } from '@cbdb/core';

describe('PersonAddressRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonAddressRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonAddressRelationRepository>(
      PersonAddressRelationRepository
    );
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('findByPersonId with trivial joins', () => {
    it('should return addresses with place names and type descriptions', async () => {
      // Test with person 5 who has 3 addresses
      const testPersonId = 5;
      const addresses = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(addresses)).toBe(true);
      expect(addresses.length).toBeGreaterThan(0);

      // Check first address has proper structure
      const firstAddress = addresses[0];
      expect(firstAddress).toBeDefined();

      // Check for base address fields
      expect(firstAddress.personId).toBe(testPersonId);
      expect(firstAddress.addressId).toBeDefined();
      expect(firstAddress.addressType).toBeDefined();

      // Check for address info (from ADDR_CODES join)
      if (firstAddress.addressInfo) {
        expect(firstAddress.addressInfo).toHaveProperty('id');
        expect(firstAddress.addressInfo).toHaveProperty('name');
        expect(firstAddress.addressInfo).toHaveProperty('nameChn');
        expect(firstAddress.addressInfo).toHaveProperty('xCoord');
        expect(firstAddress.addressInfo).toHaveProperty('yCoord');
      }

      // Check for backward compatibility fields
      if (firstAddress.addrName || firstAddress.addrNameChn) {
        expect(typeof firstAddress.addrName === 'string' || firstAddress.addrName === null).toBe(true);
        expect(typeof firstAddress.addrNameChn === 'string' || firstAddress.addrNameChn === null).toBe(true);
      }

      // Check for address type info (from BIOG_ADDR_CODES join)
      if (firstAddress.addressTypeInfo) {
        expect(firstAddress.addressTypeInfo).toHaveProperty('code');
        expect(firstAddress.addressTypeInfo).toHaveProperty('description');
        expect(firstAddress.addressTypeInfo).toHaveProperty('descriptionChn');
      }

      // Check for backward compatibility type fields
      if (firstAddress.addrType || firstAddress.addrTypeChn) {
        expect(typeof firstAddress.addrType === 'string' || firstAddress.addrType === null).toBe(true);
        expect(typeof firstAddress.addrTypeChn === 'string' || firstAddress.addrTypeChn === null).toBe(true);
      }
    });

    it('should handle persons with no addresses', async () => {
      // Test with a person ID that likely has no addresses
      const testPersonId = 999999;
      const addresses = await repository.findByPersonId(testPersonId);

      expect(Array.isArray(addresses)).toBe(true);
      expect(addresses).toHaveLength(0);
    });

    it('should include coordinates when available', async () => {
      // Test with person 346 (王安石) who should have addresses with coordinates
      const testPersonId = 346;
      const addresses = await repository.findByPersonId(testPersonId);

      expect(addresses.length).toBeGreaterThan(0);

      // Find addresses with coordinates
      const addressesWithCoords = addresses.filter((addr: any) =>
        addr.addressInfo &&
        (addr.addressInfo.xCoord !== null || addr.addressInfo.yCoord !== null)
      );

      // At least some addresses should have coordinates
      if (addressesWithCoords.length > 0) {
        const firstWithCoords = addressesWithCoords[0];
        expect(typeof firstWithCoords.addressInfo.xCoord === 'number' ||
               firstWithCoords.addressInfo.xCoord === null).toBe(true);
        expect(typeof firstWithCoords.addressInfo.yCoord === 'number' ||
               firstWithCoords.addressInfo.yCoord === null).toBe(true);
      }
    });
  });

  describe('getFullRelations', () => {
    it('should return fully mapped addresses with all relations', async () => {
      const testPersonId = 1;
      const addresses = await repository.getFullRelations(testPersonId);

      expect(Array.isArray(addresses)).toBe(true);

      if (addresses.length > 0) {
        const firstAddress = addresses[0];

        // Should have addressInfo structure
        if (firstAddress.addressInfo) {
          expect(firstAddress.addressInfo).toHaveProperty('id');
          expect(firstAddress.addressInfo).toHaveProperty('name');
          expect(firstAddress.addressInfo).toHaveProperty('nameChn');
        }

        // Should have addressTypeInfo structure
        if (firstAddress.addressTypeInfo) {
          expect(firstAddress.addressTypeInfo).toHaveProperty('code');
          expect(firstAddress.addressTypeInfo).toHaveProperty('description');
          expect(firstAddress.addressTypeInfo).toHaveProperty('descriptionChn');
        }

        // Should have legacy top-level fields for backward compatibility
        if (firstAddress.addressInfo && firstAddress.addressInfo.name) {
          expect(firstAddress.addrName).toBe(firstAddress.addressInfo.name);
          expect(firstAddress.addrNameChn).toBe(firstAddress.addressInfo.nameChn);
        }

        if (firstAddress.addressTypeInfo && firstAddress.addressTypeInfo.description) {
          expect(firstAddress.addrType).toBe(firstAddress.addressTypeInfo.description);
          expect(firstAddress.addrTypeChn).toBe(firstAddress.addressTypeInfo.descriptionChn);
        }
      }
    });
  });

  describe('stats methods', () => {
    const testPersonId = 1; // 寇準

    it('should get summary stats', async () => {
      const stats = await repository.getStatsSummary(testPersonId);

      expect(stats).toBeInstanceOf(RelationStat);
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.ids)).toBe(true);
      expect(stats.tableName).toBe('BIOG_ADDR_DATA');
    });

    it('should get stats by address type', async () => {
      const statsByType = await repository.getStatsByType(testPersonId);

      expect(Array.isArray(statsByType)).toBe(true);

      // Each stat should have addressType metadata
      statsByType.forEach(stat => {
        expect(stat).toBeInstanceOf(RelationStat);
        expect((stat as any).addressType).toBeDefined();
        expect(stat.tableName).toMatch(/^BIOG_ADDR_DATA:\d+$/);
      });
    });

    it('should get stats for natal addresses only', async () => {
      const natalStats = await repository.getStatsNatalAddresses(testPersonId);

      expect(natalStats).toBeInstanceOf(RelationStat);
      expect(natalStats.tableName).toBe('BIOG_ADDR_DATA:natal');
      expect(natalStats.count).toBeGreaterThanOrEqual(0);
    });

    it('should get stats by time period', async () => {
      const stats = await repository.getStatsByTimePeriod(testPersonId, 960, 1000);

      expect(stats).toBeInstanceOf(RelationStat);
      expect(stats.tableName).toBe('BIOG_ADDR_DATA:960-1000');
      expect(stats.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFullRelationsWithCoordinates', () => {
    it('should return addresses with coordinate information', async () => {
      const testPersonId = 346; // 王安石
      const addresses = await repository.getFullRelationsWithCoordinates(testPersonId);

      expect(Array.isArray(addresses)).toBe(true);

      if (addresses.length > 0) {
        const firstAddress = addresses[0];

        // Should have base address data
        expect(firstAddress.c_personid).toBe(testPersonId);
        expect(firstAddress.c_addr_id).toBeDefined();

        // Should have addressInfo if ADDR_CODES join found a match
        if (firstAddress.addressInfo) {
          expect(firstAddress.addressInfo).toHaveProperty('c_addr_id');
          expect(firstAddress.addressInfo).toHaveProperty('c_name');
          expect(firstAddress.addressInfo).toHaveProperty('c_name_chn');
          expect(firstAddress.addressInfo).toHaveProperty('x_coord');
          expect(firstAddress.addressInfo).toHaveProperty('y_coord');
        }
      }
    });
  });
});