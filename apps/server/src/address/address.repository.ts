import { Injectable } from '@nestjs/common';
import { ADDR_CODES, BIOG_ADDR_CODES } from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq, inArray, like, and, gte, lte } from 'drizzle-orm';

/**
 * Pure domain repository for Address codes/locations
 * Only handles address reference data, not person relationships
 * For person-address relationships, use PersonAddressRelationRepository
 */
@Injectable()
export class AddressRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find an address by its ID
   */
  async findById(addressId: number) {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select()
      .from(ADDR_CODES)
      .where(eq(ADDR_CODES.c_addr_id, addressId))
      .get();

    return result;
  }

  /**
   * Find multiple addresses by IDs
   */
  async findByIds(addressIds: number[]) {
    if (addressIds.length === 0) return [];

    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ADDR_CODES)
      .where(inArray(ADDR_CODES.c_addr_id, addressIds))
      .all();

    return results;
  }

  /**
   * Search addresses by name (Chinese or English)
   */
  async searchByName(query: string) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ADDR_CODES)
      .where(
        like(ADDR_CODES.c_name_chn, `%${query}%`)
      )
      .all();

    return results;
  }

  /**
   * Find addresses by coordinates (within a bounding box)
   */
  async findByCoordinates(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ADDR_CODES)
      .where(and(
        gte(ADDR_CODES.y_coord, minLat),
        lte(ADDR_CODES.y_coord, maxLat),
        gte(ADDR_CODES.x_coord, minLng),
        lte(ADDR_CODES.x_coord, maxLng)
      ))
      .all();

    return results;
  }

  /**
   * Find addresses by administrative type
   */
  async findByAdminType(adminType: string) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ADDR_CODES)
      .where(eq(ADDR_CODES.c_admin_type, adminType))
      .all();

    return results;
  }

  /**
   * Get all address types from BIOG_ADDR_CODES
   */
  async getAllAddressTypes() {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(BIOG_ADDR_CODES)
      .all();

    return results;
  }

  /**
   * Find addresses active during a specific time period
   */
  async findByTimePeriod(startYear: number, endYear: number) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ADDR_CODES)
      .where(and(
        lte(ADDR_CODES.c_firstyear, endYear),
        gte(ADDR_CODES.c_lastyear, startYear)
      ))
      .all();

    return results;
  }
}