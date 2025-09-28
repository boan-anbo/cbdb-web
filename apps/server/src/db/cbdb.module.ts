import { Module } from '@nestjs/common';
import { CbdbConnectionService } from './cbdb-connection.service';

/**
 * Module for CBDB database functionality
 * Provides connection management and repositories for CBDB data
 */
@Module({
  providers: [
    CbdbConnectionService,
    // Future: Add repositories here
    // BiogMainRepository,
    // DynastyRepository,
    // OfficeRepository,
    // etc.
  ],
  exports: [
    CbdbConnectionService,
    // Export repositories for use in other modules
  ],
})
export class CbdbModule {}