# Analytics Module

## Overview

The Analytics Module serves as an umbrella module that aggregates all analytical capabilities in the CBDB application. It provides a centralized interface for various analytical tools, algorithms, and services.

## Architecture

```
analytics/
├── analytics.module.ts    # Main umbrella module
├── index.ts               # Public API exports
└── README.md             # This file

Submodules (imported):
├── graph/                 # Graph algorithms and visualization
├── statistics/           # (Future) Statistical analysis
├── machine-learning/     # (Future) ML models
└── data-mining/         # (Future) Pattern discovery
```

## Purpose

1. **Centralization**: Single point of import for all analytics capabilities
2. **Modularity**: Each analytics type is its own module
3. **Extensibility**: Easy to add new analytics modules
4. **Decoupling**: Domain modules don't need to know about specific analytics implementations

## Current Capabilities

### Graph Analysis (via GraphModule)
- Graph building and serialization
- Path finding algorithms
- Network metrics calculation
- Community detection
- Centrality analysis
- Graph visualization support

## Usage

Domain modules should import AnalyticsModule instead of individual analytics modules:

```typescript
// Instead of:
import { GraphModule } from '../graph/graph.module';

// Use:
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    AnalyticsModule, // Get all analytics capabilities
    // ...
  ],
  // ...
})
export class PersonModule {}
```

## Future Extensions

The module is designed to accommodate future analytics capabilities:

### Statistical Analysis Module
- Descriptive statistics
- Time series analysis
- Correlation analysis
- Hypothesis testing

### Machine Learning Module
- Classification models
- Clustering algorithms
- Recommendation systems
- Natural language processing

### Data Mining Module
- Association rule mining
- Anomaly detection
- Pattern recognition
- Sequential pattern mining

## Design Principles

1. **Domain Agnostic**: Analytics modules should not have domain knowledge
2. **Pure Utilities**: Focus on algorithms and mathematical operations
3. **Reusable**: Services should be generic and reusable across domains
4. **Composable**: Small, focused services that can be combined

## Adding New Analytics Modules

To add a new analytics capability:

1. Create the module in its own directory (e.g., `src/statistics/`)
2. Import it in `analytics.module.ts`
3. Export it from `analytics.module.ts`
4. Add public API exports to `index.ts`
5. Update this README with the new capability

## Dependencies

- GraphModule: Core graph algorithms and utilities
- (Future modules will be listed here)