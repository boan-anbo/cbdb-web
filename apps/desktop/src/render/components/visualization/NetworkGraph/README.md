# NetworkGraph Component

A powerful, data-agnostic network visualization component built on React Sigma and Graphology.

## Features

- 🎨 **Data-agnostic**: Works with any graph data following the GraphData structure
- 🔄 **Multiple relationships**: Supports multiple edges between same nodes with automatic curve calculation
- 🎯 **Interactive hover**: Highlight nodes and their neighbors on hover
- 🔧 **Composable reducers**: Extensible system for visual transformations
- 📊 **Typed API**: Full TypeScript support with comprehensive types

## Basic Usage

```tsx
import { NetworkGraph, GraphData, EDGE_SIZE_GUIDELINES } from './NetworkGraph';

const data: GraphData = {
  nodes: [
    { key: 'node1', attributes: { label: 'Node 1', color: '#ff0000' } },
    { key: 'node2', attributes: { label: 'Node 2', color: '#00ff00' } }
  ],
  edges: [
    {
      source: 'node1',
      target: 'node2',
      attributes: {
        label: 'Connection',
        size: EDGE_SIZE_GUIDELINES.MODERATE
      }
    }
  ]
};

<NetworkGraph data={data} />
```

## GraphData Structure

### Nodes

```typescript
interface GraphNode {
  key: string;  // Unique identifier
  attributes?: {
    label?: string;      // Display label
    size?: number;       // Visual size (pixels)
    color?: string;      // Hex or CSS color
    x?: number;          // X position
    y?: number;          // Y position
    type?: string;       // Node rendering type
    hidden?: boolean;    // Visibility
    // Custom attributes
    [key: string]: any;
  };
}
```

### Edges

```typescript
interface GraphEdge {
  key?: string;        // Optional unique identifier
  source: string;      // Source node key
  target: string;      // Target node key
  attributes?: {
    label?: string;    // Display label
    size?: number;     // Visual thickness
    color?: string;    // Hex or CSS color
    type?: 'straight' | 'curved';  // Rendering type (NOT semantic type)
    relationshipType?: string;      // Your semantic relationship type
    strength?: number;              // 0-1 for calculating size
    // Custom attributes
    [key: string]: any;
  };
}
```

## Edge Size Guidelines

Use consistent edge sizes to represent relationship significance:

```typescript
import { EDGE_SIZE_GUIDELINES } from './NetworkGraph';

// Pre-defined constants
EDGE_SIZE_GUIDELINES.MINIMAL     // 1px - Minimal relationships
EDGE_SIZE_GUIDELINES.WEAK        // 2px - Weak relationships
EDGE_SIZE_GUIDELINES.MODERATE    // 3px - Moderate relationships
EDGE_SIZE_GUIDELINES.STRONG      // 5px - Strong relationships
EDGE_SIZE_GUIDELINES.VERY_STRONG // 7px - Very strong relationships
EDGE_SIZE_GUIDELINES.MAXIMUM     // 10px - Maximum relationships

// Or calculate dynamically
import { calculateEdgeSize } from './NetworkGraph';

const size = calculateEdgeSize(0.8);  // 80% strength
```

## Reducer System

The NetworkGraph uses a powerful reducer system for dynamic visual transformations without modifying the underlying data.

### What are Reducers?

Reducers are functions that transform node and edge attributes right before rendering. They enable:
- Dynamic visual effects (hover, search, filter)
- Conditional styling based on data
- Interactive transformations
- Composable visual behaviors

### Using Built-in Reducers

#### Hover Highlight

```tsx
import { HoverHighlightV2 } from './NetworkGraph';

<NetworkGraph data={data}>
  <HoverHighlightV2
    showNeighborEdges={false}  // Hide edges between neighbors
    fadeInsteadOfHide={false}  // Hide vs fade non-relevant nodes
  />
</NetworkGraph>
```

#### Custom Reducer Composition

```tsx
import { GraphReducers, createHoverHighlightReducer, createSearchHighlightReducer } from './NetworkGraph';

function MyGraph() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const reducers = [
    createHoverHighlightReducer({ hoveredNode }),
    createSearchHighlightReducer({
      query: searchQuery,
      highlightColor: '#ff0000'
    })
  ];

  return (
    <NetworkGraph data={data}>
      <GraphReducers reducers={reducers} />
    </NetworkGraph>
  );
}
```

### Creating Custom Reducers

```typescript
import { GraphReducer } from './NetworkGraph';

const myCustomReducer: GraphReducer = {
  id: 'my-reducer',
  enabled: true,

  nodeReducer: (node, attributes, context) => {
    // Transform node attributes
    if (attributes.type === 'special') {
      return {
        ...attributes,
        color: '#ff0000',
        size: 20
      };
    }
    return attributes;
  },

  edgeReducer: (edge, attributes, context) => {
    // Transform edge attributes
    const { graph } = context;
    const [source, target] = graph.extremities(edge);

    if (attributes.relationshipType === 'important') {
      return {
        ...attributes,
        size: 5,
        color: '#000000'
      };
    }
    return attributes;
  }
};
```

### Available Built-in Reducers

#### 1. Hover Highlight Reducer
Shows only hovered node and its neighbors.

```typescript
createHoverHighlightReducer({
  hoveredNode: string | null,
  showNeighborEdges?: boolean,
  fadeInsteadOfHide?: boolean,
  fadeColor?: string
})
```

#### 2. Node Filter Reducer
Filters nodes based on custom criteria.

```typescript
createNodeFilterReducer({
  filterFn: (nodeId, attrs) => boolean,
  hideConnectedEdges?: boolean
})
```

#### 3. Edge Weight Reducer
Adjusts edge appearance based on weight/strength.

```typescript
createEdgeWeightReducer({
  minSize?: number,
  maxSize?: number,
  adjustOpacity?: boolean,
  hideThreshold?: number
})
```

#### 4. Search Highlight Reducer
Highlights elements matching a search query.

```typescript
createSearchHighlightReducer({
  query: string,
  searchFields?: string[],
  caseSensitive?: boolean,
  highlightColor?: string,
  hideNonMatches?: boolean
})
```

### Reducer Composition

Reducers can be composed to create complex visual behaviors:

```typescript
const reducers = [
  // First filter by type
  createNodeFilterReducer({
    filterFn: (id, attrs) => attrs.type === 'person'
  }),

  // Then apply hover highlight to visible nodes
  createHoverHighlightReducer({
    hoveredNode: hoveredId
  }),

  // Finally highlight search matches
  createSearchHighlightReducer({
    query: searchTerm,
    highlightColor: '#ffff00'
  })
];

<GraphReducers reducers={reducers} />
```

## Component Props

```typescript
interface NetworkGraphProps {
  data: GraphData;                    // Graph data
  layout?: LayoutType;                // 'circular' | 'force' | 'random' | 'grid'
  layoutConfig?: LayoutConfig;        // Layout-specific options
  renderEdgeLabels?: boolean;         // Show edge labels (default: true)
  defaultEdgeColor?: string;          // Default edge color
  defaultNodeColor?: string;          // Default node color
  defaultEdgeSize?: number;           // Default edge thickness
  minEdgeSize?: number;               // Minimum edge size
  maxEdgeSize?: number;               // Maximum edge size
  width?: string | number;            // Container width
  height?: string | number;           // Container height
  enableHoverHighlight?: boolean;     // Enable hover effects (default: true)
  edgeCurveMode?: EdgeCurveMode;     // How to handle multiple edges (default: 'auto')
  sigmaSettings?: Record<string, any>; // Additional Sigma settings
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  onBackgroundClick?: () => void;
}
```

### Edge Curve Modes

Control how multiple edges between the same nodes are rendered:

- **`'auto'`** (default): Automatically curves parallel edges when multiple exist
- **`'always-straight'`**: Forces all edges to be straight lines
- **`'always-curved'`**: Forces all edges to have some curvature

```tsx
// Auto mode - curves only when needed
<NetworkGraph data={data} edgeCurveMode="auto" />

// Force straight edges
<NetworkGraph data={data} edgeCurveMode="always-straight" />

// Force curved edges
<NetworkGraph data={data} edgeCurveMode="always-curved" />
```

## Best Practices

1. **Edge Types**: Use `type` for rendering ('straight', 'curved'), use custom attributes for semantic types
2. **Edge Sizes**: Use EDGE_SIZE_GUIDELINES constants for consistency
3. **Performance**: For large graphs, consider using reducers to hide elements rather than delete them
4. **Accessibility**: Always provide meaningful labels for nodes and edges
5. **Colors**: Use high contrast colors for better visibility

## Examples

### Multiple Relationships

```tsx
const multiRelationData: GraphData = {
  nodes: [
    { key: 'p1', attributes: { label: 'Person 1' } },
    { key: 'p2', attributes: { label: 'Person 2' } }
  ],
  edges: [
    {
      key: 'friend',
      source: 'p1',
      target: 'p2',
      attributes: {
        label: 'Friend',
        size: EDGE_SIZE_GUIDELINES.MODERATE,
        color: '#3498db',
        relationshipType: 'friendship'
      }
    },
    {
      key: 'colleague',
      source: 'p1',
      target: 'p2',
      attributes: {
        label: 'Colleague',
        size: EDGE_SIZE_GUIDELINES.WEAK,
        color: '#9b59b6',
        relationshipType: 'professional'
      }
    }
  ]
};
```

### Dynamic Filtering

```tsx
function FilterableGraph() {
  const [minSize, setMinSize] = useState(10);

  const sizeFilter = createNodeFilterReducer({
    filterFn: (id, attrs) => attrs.size >= minSize
  });

  return (
    <>
      <input
        type="range"
        value={minSize}
        onChange={(e) => setMinSize(Number(e.target.value))}
      />
      <NetworkGraph data={data}>
        <GraphReducers reducers={[sizeFilter]} />
      </NetworkGraph>
    </>
  );
}
```