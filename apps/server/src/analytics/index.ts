/**
 * Analytics Module Public API
 *
 * Exports all analytics capabilities for use by domain modules.
 * This provides a single entry point for all analytics-related imports.
 */

// Module exports
export { AnalyticsModule } from './analytics.module';

// Re-export graph module
export { GraphModule } from '../graph/graph.module';

// Re-export core graph services that domains might need
export { GraphService } from '../graph/graph.service';
export { GraphBuilder } from '../graph/core/builders/graph-builder.service';
export { GraphExportService } from '../graph/core/export/graph-export.service';
export { GraphCacheService } from '../graph/core/cache/graph-cache.service';
export { GraphSerializationService } from '../graph/core/graph-serialization.service';
export { AlgorithmOrchestratorService } from '../graph/core/algorithms/algorithm-orchestrator.service';

// Future exports will be added here:
// export * from './statistics';
// export * from './machine-learning';
// export * from './data-mining';