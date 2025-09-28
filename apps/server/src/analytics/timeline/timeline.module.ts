/**
 * Timeline Module
 *
 * Provides pure utility services for timeline construction and manipulation.
 * This module contains NO repository dependencies or data access logic.
 *
 * All data fetching and orchestration is handled by domain modules (e.g., PersonTimelineService).
 * This follows the same pattern as the Graph module - pure utilities only.
 */

import { Module } from '@nestjs/common';
import { TimelineBuilderService } from './services/timeline-builder.service';

@Module({
  providers: [
    TimelineBuilderService
  ],
  exports: [
    TimelineBuilderService  // Export for domain modules to use
  ]
})
export class TimelineModule {}