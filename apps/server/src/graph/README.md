# Graph Module

## Overview

The Graph Module provides a pure, domain-agnostic graph data structure library for the CBDB platform. It enables graph-based analytics and visualization capabilities while maintaining complete separation from domain-specific concerns.

## Architecture Principles

1. **Pure Utility Service**: The graph module has no knowledge of CBDB domains
2. **Domain Orchestration**: Domain services use the graph module as a representation tool
3. **Type Safety**: Full TypeScript generics support throughout
4. **Fluent API**: Ergonomic builder pattern for graph construction

## Core Components

### GraphService
Low-level graph operations using the graphology library:
- Graph creation (directed, undirected, mixed)
- Node and edge management
- Metrics calculation
- Subgraph extraction

### GraphBuilder
Fluent API for constructing graphs:
- Method chaining for all operations
- Batch operations support
- Collection transformations
- Common patterns (chains, stars)

### EntityGraphBuilder
Higher-level abstraction for entity-relationship graphs:
- Entity management with type and ID
- Relationship patterns (one-to-many, many-to-many)
- Network construction helpers
- Automatic node creation

### GraphExportService
Export graphs to various formats:
- GEXF format (Gephi compatible)
- JSON format
- GraphML format (planned)
- Import capabilities

### GraphBuilderFactory
Factory for creating builder instances:
- Type-safe builder creation
- Pre-configured builders
- Dependency injection support

## Usage Examples

### Basic Graph Construction
```typescript
const graph = graphBuilder
  .directed()
  .addNode('A', { label: 'Node A' })
  .addNode('B', { label: 'Node B' })
  .addEdge('A', 'B', { weight: 1.0 })
  .build();
```

### Entity-Relationship Graph
```typescript
const graph = entityBuilder
  .directed()
  .addEntity('person', 123, { name: 'Wang Anshi' })
  .addEntity('person', 456, { name: 'Wang Ang' })
  .relate('person', 123, 'person', 456, 'brother')
  .build();
```

### Export to GEXF
```typescript
await graphExportService.exportToGEXF(graph, 'output.gexf', {
  version: '1.3',
  prettyPrint: true
});
```

## Integration with Domain Services

Domain services orchestrate graph creation:

```typescript
// In PersonService
async buildPersonNetwork(personId: number): Promise<Graph> {
  const builder = this.graphBuilderFactory.createDirectedEntity();

  // Domain logic to fetch data
  const person = await this.getPerson(personId);
  const kinships = await this.getKinships(personId);

  // Use graph builder as representation tool
  builder.addEntity('person', person.id, { name: person.name });

  kinships.forEach(k => {
    builder.addEntity('person', k.kinId, { name: k.kinName });
    builder.relate('person', personId, 'person', k.kinId, 'kinship');
  });

  return builder.build();
}
```

## Testing

The module includes comprehensive tests:
- 58 tests covering all components
- Real CBDB data integration tests
- GEXF export validation
- Type safety verification

Run tests:
```bash
npm test -- graph
```

## Dependencies

- **graphology**: Core graph data structure
- **graphology-gexf**: GEXF format support
- **graphology-types**: TypeScript type definitions

## Future Enhancements

- GraphML export support
- Additional graph algorithms
- Performance optimizations for large graphs
- Streaming export for very large graphs
- Additional visualization format support

## Best Practices

1. **Keep it pure**: Never add domain-specific logic to the graph module
2. **Use builders**: Prefer the fluent builder APIs over direct graph manipulation
3. **Type safety**: Always specify type parameters for better IDE support
4. **Batch operations**: Use collection methods for better performance
5. **Export options**: Configure exports based on target visualization tool requirements