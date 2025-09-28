/**
 * Repository for Person-to-Address Relations
 * Handles relationships between persons and their addresses
 * Follows the composable stats pattern established in PersonKinshipRelationRepository
 */

import { Injectable } from '@nestjs/common';
import { eq, sql, and, inArray, count } from 'drizzle-orm';
import {
  BIOG_ADDR_DATA,
  ADDR_CODES,
  BIOG_ADDR_CODES,
  cbdbMapper,
  type Address,
  type AddressDataWithRelations,
  RelationStat,
  mapToAddressWithFullRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';

@Injectable()
export class PersonAddressRelationRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Get summary stats for all address relations of a person
   * Returns single RelationStat with total count and all related address IDs
   */
  async getStatsSummary(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        addressIds: sql<string>`group_concat(${BIOG_ADDR_DATA.c_addr_id})`
      })
      .from(BIOG_ADDR_DATA)
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .get();

    const ids = results?.addressIds
      ? results.addressIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'BIOG_ADDR_DATA'
    );
  }

  /**
   * Get stats grouped by address type
   * Returns array of RelationStat, one per address type
   */
  async getStatsByType(personId: number): Promise<RelationStat[]> {
    const db = this.cbdbConnection.getDb();

    // Get aggregated stats grouped by address type
    const statsResults = await db
      .select({
        addressType: BIOG_ADDR_DATA.c_addr_type,
        count: count(),
        addressIds: sql<string>`group_concat(${BIOG_ADDR_DATA.c_addr_id})`
      })
      .from(BIOG_ADDR_DATA)
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .groupBy(BIOG_ADDR_DATA.c_addr_type)
      .all();

    if (statsResults.length === 0) {
      return [];
    }

    // Transform results into RelationStat objects
    return statsResults.map(row => {
      const ids = row.addressIds
        ? row.addressIds.split(',').map(Number).filter(Boolean)
        : [];

      const stat = new RelationStat(
        row.count,
        ids,
        `BIOG_ADDR_DATA:${row.addressType}`
      );

      // Attach address type as metadata
      (stat as any).addressType = row.addressType;

      return stat;
    });
  }

  /**
   * Get stats by time period (addresses within a date range)
   * Useful for tracking movement patterns over time
   */
  async getStatsByTimePeriod(
    personId: number,
    startYear?: number,
    endYear?: number
  ): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const whereConditions = [eq(BIOG_ADDR_DATA.c_personid, personId)];

    // Add time period filters if provided
    if (startYear !== undefined) {
      whereConditions.push(sql`${BIOG_ADDR_DATA.c_firstyear} >= ${startYear}`);
    }
    if (endYear !== undefined) {
      whereConditions.push(sql`${BIOG_ADDR_DATA.c_lastyear} <= ${endYear}`);
    }

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        addressIds: sql<string>`group_concat(${BIOG_ADDR_DATA.c_addr_id})`
      })
      .from(BIOG_ADDR_DATA)
      .where(and(...whereConditions))
      .get();

    const ids = results?.addressIds
      ? results.addressIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      `BIOG_ADDR_DATA:${startYear || 'any'}-${endYear || 'any'}`
    );
  }

  /**
   * Get stats for natal addresses only
   * Birthplace/hometown addresses are important for identity
   */
  async getStatsNatalAddresses(personId: number): Promise<RelationStat> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        count: sql<number>`count(*)`,
        addressIds: sql<string>`group_concat(${BIOG_ADDR_DATA.c_addr_id})`
      })
      .from(BIOG_ADDR_DATA)
      .where(and(
        eq(BIOG_ADDR_DATA.c_personid, personId),
        eq(BIOG_ADDR_DATA.c_natal, 1)
      ))
      .get();

    const ids = results?.addressIds
      ? results.addressIds.split(',').map(Number).filter(Boolean)
      : [];

    return new RelationStat(
      results?.count ?? 0,
      ids,
      'BIOG_ADDR_DATA:natal'
    );
  }

  /**
   * Get full address relations (for comparison with stats)
   * This is the expensive operation that stats help avoid
   */
  async getFullRelations(personId: number): Promise<any[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        addrData: BIOG_ADDR_DATA,
        addressCode: ADDR_CODES,
        addrTypeCode: BIOG_ADDR_CODES
      })
      .from(BIOG_ADDR_DATA)
      .leftJoin(ADDR_CODES, eq(BIOG_ADDR_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .leftJoin(BIOG_ADDR_CODES, eq(BIOG_ADDR_DATA.c_addr_type, BIOG_ADDR_CODES.c_addr_type))
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .all();

    // Map results with enhanced data using proper mapper
    return results.map(row => {
      // Prepare data structure for mapper
      const addressDataWithRelations: AddressDataWithRelations = {
        ...row.addrData,
        addressInfo: row.addressCode || undefined,
        addressType: row.addrTypeCode || undefined
      };

      // Use the proper mapper that includes all relations
      const fullAddress = mapToAddressWithFullRelations(addressDataWithRelations);

      // Add legacy top-level fields for backward compatibility
      const result: any = { ...fullAddress };

      if (fullAddress.addressInfo) {
        result.addrName = fullAddress.addressInfo.name;
        result.addrNameChn = fullAddress.addressInfo.nameChn;
      }

      if (fullAddress.addressTypeInfo) {
        result.addrType = fullAddress.addressTypeInfo.description;
        result.addrTypeChn = fullAddress.addressTypeInfo.descriptionChn;
      }

      // Also ensure addrTypeInfo has the right structure from BIOG_ADDR_CODES
      if (row.addrTypeCode) {
        result.addrTypeInfo = {
          code: row.addrTypeCode.c_addr_type,
          addrType: row.addrTypeCode.c_addr_desc,
          addrTypeChn: row.addrTypeCode.c_addr_desc_chn
        };
      }

      return result;
    });
  }

  /**
   * Find all addresses for a person
   * Includes address details from ADDR_CODES and BIOG_ADDR_CODES
   */
  async findByPersonId(personId: number): Promise<Address[]> {
    return this.getFullRelations(personId);
  }

  /**
   * Find people who share addresses with the given person
   * Useful for finding co-residents or people from same location
   */
  async findPeopleWithSharedAddresses(personId: number): Promise<number[]> {
    const db = this.cbdbConnection.getDb();

    // First get all addresses of the person
    const personAddresses = await db
      .select({ addressId: BIOG_ADDR_DATA.c_addr_id })
      .from(BIOG_ADDR_DATA)
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .all();

    if (personAddresses.length === 0) {
      return [];
    }

    const addressIds = personAddresses.map(a => a.addressId);

    // Find other people with same addresses
    const sharedPeople = await db
      .select({ personId: BIOG_ADDR_DATA.c_personid })
      .from(BIOG_ADDR_DATA)
      .where(and(
        inArray(BIOG_ADDR_DATA.c_addr_id, addressIds),
        sql`${BIOG_ADDR_DATA.c_personid} != ${personId}`
      ))
      .all();

    return [...new Set(sharedPeople.map(p => p.personId))];
  }

  /**
   * Get full address relations WITH coordinates from ADDR_CODES
   * Essential for geographic visualization
   */
  async getFullRelationsWithCoordinates(personId: number): Promise<AddressDataWithRelations[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        addrData: BIOG_ADDR_DATA,
        addressCode: ADDR_CODES
      })
      .from(BIOG_ADDR_DATA)
      .leftJoin(ADDR_CODES, eq(BIOG_ADDR_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .all();

    return results.map(row => ({
      ...row.addrData,
      addressInfo: row.addressCode || undefined
    }));
  }

  /**
   * Get addresses with coordinates filtered by year range
   */
  async getAddressesByTimeRange(
    personId: number,
    startYear?: number,
    endYear?: number
  ): Promise<AddressDataWithRelations[]> {
    const db = this.cbdbConnection.getDb();

    const whereConditions = [eq(BIOG_ADDR_DATA.c_personid, personId)];

    if (startYear !== undefined) {
      whereConditions.push(sql`${BIOG_ADDR_DATA.c_firstyear} >= ${startYear}`);
    }
    if (endYear !== undefined) {
      whereConditions.push(sql`${BIOG_ADDR_DATA.c_lastyear} <= ${endYear}`);
    }

    const results = await db
      .select({
        addrData: BIOG_ADDR_DATA,
        addressCode: ADDR_CODES
      })
      .from(BIOG_ADDR_DATA)
      .leftJoin(ADDR_CODES, eq(BIOG_ADDR_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(and(...whereConditions))
      .all();

    return results.map(row => ({
      ...row.addrData,
      addressInfo: row.addressCode || undefined
    }));
  }

  /**
   * Find people within geographic proximity
   * Following reference server pattern: ±0.03 for narrow, ±0.06 for broad search
   */
  async findPeopleByProximity(
    longitude: number,
    latitude: number,
    radius: number = 0.06
  ): Promise<Array<{ personId: number; addressId: number; distance: number }>> {
    const db = this.cbdbConnection.getDb();

    // Find all addresses within the proximity radius
    const nearbyAddresses = await db
      .select({
        addressId: ADDR_CODES.c_addr_id,
        longitude: ADDR_CODES.x_coord,
        latitude: ADDR_CODES.y_coord
      })
      .from(ADDR_CODES)
      .where(and(
        sql`${ADDR_CODES.x_coord} >= ${longitude - radius}`,
        sql`${ADDR_CODES.x_coord} <= ${longitude + radius}`,
        sql`${ADDR_CODES.y_coord} >= ${latitude - radius}`,
        sql`${ADDR_CODES.y_coord} <= ${latitude + radius}`
      ))
      .all();

    if (nearbyAddresses.length === 0) {
      return [];
    }

    const addressIds = nearbyAddresses.map(a => a.addressId).filter((id): id is number => id !== null);

    // Find people at these addresses
    const people = await db
      .select({
        personId: BIOG_ADDR_DATA.c_personid,
        addressId: BIOG_ADDR_DATA.c_addr_id
      })
      .from(BIOG_ADDR_DATA)
      .where(inArray(BIOG_ADDR_DATA.c_addr_id, addressIds))
      .all();

    // Calculate distances and return
    return people.map(person => {
      const addr = nearbyAddresses.find(a => a.addressId === person.addressId);
      const distance = addr ?
        this.calculateDistance(longitude, latitude, addr.longitude || 0, addr.latitude || 0) : 0;

      return {
        personId: person.personId,
        addressId: person.addressId,
        distance
      };
    });
  }

  /**
   * Batch fetch addresses for multiple persons
   * Optimized for network visualization
   */
  async batchFetchAddresses(personIds: number[]): Promise<Map<number, AddressDataWithRelations[]>> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        addrData: BIOG_ADDR_DATA,
        addressCode: ADDR_CODES
      })
      .from(BIOG_ADDR_DATA)
      .leftJoin(ADDR_CODES, eq(BIOG_ADDR_DATA.c_addr_id, ADDR_CODES.c_addr_id))
      .where(inArray(BIOG_ADDR_DATA.c_personid, personIds))
      .all();

    // Group by person ID
    const addressesByPerson = new Map<number, AddressDataWithRelations[]>();

    for (const row of results) {
      const personId = row.addrData.c_personid;
      if (!addressesByPerson.has(personId)) {
        addressesByPerson.set(personId, []);
      }

      addressesByPerson.get(personId)!.push({
        ...row.addrData,
        addressInfo: row.addressCode || undefined
      } as AddressDataWithRelations);
    }

    return addressesByPerson;
  }

  /**
   * Helper to calculate distance between two coordinates
   * Returns distance in kilometers using Haversine formula
   */
  private calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}