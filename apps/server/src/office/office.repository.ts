import { Injectable } from '@nestjs/common';
import {
  Office,
  cbdbMapper,
  POSTED_TO_OFFICE_DATA,
  OFFICE_CODES,
  type OfficeDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * Repository for accessing Office data from CBDB
 * Uses core schemas and mappers from @cbdb/core
 */
@Injectable()
export class OfficeRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find all offices held by a person
   */
  async findByPersonId(personId: number): Promise<Office[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        posting: POSTED_TO_OFFICE_DATA,
        officeInfo: OFFICE_CODES
      })
      .from(POSTED_TO_OFFICE_DATA)
      .leftJoin(OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_office_id, OFFICE_CODES.c_office_id))
      .where(eq(POSTED_TO_OFFICE_DATA.c_personid, personId))
      .orderBy(POSTED_TO_OFFICE_DATA.c_firstyear, POSTED_TO_OFFICE_DATA.c_sequence);

    const officeData: OfficeDataWithRelations[] = results.map(row => ({
      ...row.posting,
      office: row.officeInfo || undefined,
      appointmentType: undefined, // Would need join with APPOINTMENT_CODES
      postedToAddresses: [] // Would need join with POSTED_TO_ADDR_DATA
    }));

    return cbdbMapper.office.fromDbArray(officeData);
  }

  /**
   * Find offices held by a person within a year range
   */
  async findByPersonIdAndYearRange(
    personId: number,
    startYear?: number,
    endYear?: number
  ): Promise<Office[]> {
    const db = this.cbdbConnection.getDb();

    let whereClause = eq(POSTED_TO_OFFICE_DATA.c_personid, personId);

    if (startYear || endYear) {
      const conditions = [whereClause];

      if (startYear) {
        conditions.push(
          gte(POSTED_TO_OFFICE_DATA.c_lastyear, startYear)
        );
      }

      if (endYear) {
        conditions.push(
          lte(POSTED_TO_OFFICE_DATA.c_firstyear, endYear)
        );
      }

      whereClause = and(...conditions) as any;
    }

    const results = await db
      .select({
        posting: POSTED_TO_OFFICE_DATA,
        officeInfo: OFFICE_CODES
      })
      .from(POSTED_TO_OFFICE_DATA)
      .leftJoin(OFFICE_CODES, eq(POSTED_TO_OFFICE_DATA.c_office_id, OFFICE_CODES.c_office_id))
      .where(whereClause)
      .orderBy(POSTED_TO_OFFICE_DATA.c_firstyear, POSTED_TO_OFFICE_DATA.c_sequence);

    const officeData: OfficeDataWithRelations[] = results.map(row => ({
      ...row.posting,
      office: row.officeInfo || undefined,
      appointmentType: undefined, // Would need join with APPOINTMENT_CODES
      postedToAddresses: [] // Would need join with POSTED_TO_ADDR_DATA
    }));

    return cbdbMapper.office.fromDbArray(officeData);
  }
}