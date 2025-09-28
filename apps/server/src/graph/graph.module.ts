/**
 * Graph Module
 * Provides pure graph algorithms and utilities
 * Domain-agnostic module for graph operations
 *
 * This module is part of the Service and Algorithm levels of the Graph System.
 * It provides utilities that can be used by domain modules for their
 * graph analysis needs.
 */

import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { WorkerPathResolverService } from '../workers/worker-path-resolver.service';

// Core services
import { GraphBuilder } from './core/builders/graph-builder.service';
import { GraphExportService } from './core/export/graph-export.service';
import { GraphCacheService } from './core/cache/graph-cache.service';
import { GraphCoordinateService } from './services/graph-coordinate.service';

// Serialization service (pure utility)
import { GraphSerializationService } from './core/graph-serialization.service';

// Algorithm services
import { AlgorithmOrchestratorService } from './core/algorithms/algorithm-orchestrator.service';
import { NetworkExplorationService } from './core/algorithms/network-exploration.service';
import { GraphologyPathfindingAlgorithm } from './core/algorithms/graphology/pathfinding.algorithm';
import { GraphologyTraversalAlgorithm } from './core/algorithms/graphology/traversal.algorithm';
import { GraphologyMetricsAlgorithm } from './core/algorithms/graphology/metrics.algorithm';
import { GraphologyCommunityAlgorithm } from './core/algorithms/graphology/community.algorithm';
import { GraphologyLayoutAlgorithm } from './core/algorithms/graphology/layout.algorithm';

@Module({
  providers: [
    // Worker path resolution
    WorkerPathResolverService,

    // Core graph services
    GraphService,
    GraphBuilder,
    GraphExportService,
    GraphCacheService,
    GraphCoordinateService,
    GraphSerializationService,

    // Algorithm services
    AlgorithmOrchestratorService,
    NetworkExplorationService,
    GraphologyPathfindingAlgorithm,
    GraphologyTraversalAlgorithm,
    GraphologyMetricsAlgorithm,
    GraphologyCommunityAlgorithm,
    GraphologyLayoutAlgorithm
  ],
  exports: [
    // Core services for external use
    GraphService,
    GraphExportService,
    GraphCacheService,
    GraphCoordinateService,
    GraphSerializationService,

    // Algorithm services for external use
    AlgorithmOrchestratorService,
    NetworkExplorationService,
    GraphologyPathfindingAlgorithm,
    GraphologyTraversalAlgorithm,
    GraphologyMetricsAlgorithm,
    GraphologyCommunityAlgorithm,
    GraphologyLayoutAlgorithm
  ]
  // NO controllers - graph module has no REST endpoints
  // NO domain repositories - graph module is domain-agnostic
})
export class GraphModule {}