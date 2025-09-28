/**
 * AnalyticsModule - Umbrella module for all analytics capabilities
 *
 * This module serves as the central hub for analytics-related functionality,
 * providing a unified interface for various analytical tools and services.
 *
 * Current capabilities:
 * - Graph analysis and visualization (via GraphModule)
 *
 * Future capabilities:
 * - Statistical analysis
 * - Machine learning models
 * - Data mining algorithms
 * - Pattern recognition
 * - Predictive analytics
 *
 * Architecture:
 * - Each analytics subdomain is its own module
 * - AnalyticsModule re-exports all analytics capabilities
 * - Domain modules import AnalyticsModule to access any analytics feature
 * - Allows easy extension with new analytics modules
 */

import { Module } from '@nestjs/common';
import { GraphModule } from '../graph/graph.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    GraphModule, // Graph algorithms and visualization
    TimelineModule, // Timeline analytics and life events
    // Future: StatisticsModule,
    // Future: MachineLearningModule,
    // Future: DataMiningModule,
  ],
  exports: [
    GraphModule, // Re-export for domain modules to use
    TimelineModule, // Re-export for domain modules to use
    // Future: StatisticsModule,
    // Future: MachineLearningModule,
    // Future: DataMiningModule,
  ],
})
export class AnalyticsModule {}