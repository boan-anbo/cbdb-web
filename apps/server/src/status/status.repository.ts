import { Injectable } from '@nestjs/common';
import {
  Status,
  cbdbMapper,
  STATUS_DATA,
  STATUS_CODES,
  type StatusDataWithRelations
} from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq } from 'drizzle-orm';

/**
 * Repository for accessing Status (social/economic) data from CBDB
 */
@Injectable()
export class StatusRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) {}

  /**
   * Find all status records for a person
   */
  async findByPersonId(personId: number): Promise<Status[]> {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select({
        status: STATUS_DATA,
        statusType: STATUS_CODES
      })
      .from(STATUS_DATA)
      .leftJoin(STATUS_CODES, eq(STATUS_DATA.c_status_code, STATUS_CODES.c_status_code))
      .where(eq(STATUS_DATA.c_personid, personId))
      .orderBy(STATUS_DATA.c_firstyear, STATUS_DATA.c_sequence);

    const statusData: StatusDataWithRelations[] = results.map(row => ({
      ...row.status,
      statusCode: row.statusType || undefined
    }));

    return cbdbMapper.status.fromDbArray(statusData);
  }
}