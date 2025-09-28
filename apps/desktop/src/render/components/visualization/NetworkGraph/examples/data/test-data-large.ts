/**
 * Large test data for NetworkGraph component - 100 nodes with relationships
 */

import { GraphData, GraphNode, GraphEdge } from '@cbdb/core';

// Generate 100 nodes
const nodes: GraphNode[] = [];
for (let i = 0; i < 100; i++) {
  nodes.push({
    key: `person:${i}`,
    attributes: {
      label: `Person ${i}`,
      color: i === 0 ? '#ff6b6b' : '#95e77e', // First node red, others green
      size: i === 0 ? 25 : 10, // First node larger
      x: 0, // All start at origin, layout will position them
      y: 0,
    },
  });
}

// Generate edges with various relationship patterns
const edges: GraphEdge[] = [];

// 1. Star pattern - first node connects to some others
for (let i = 1; i < 20; i += 2) {
  edges.push({
    key: `star-0-${i}`,  // Unique key
    source: 'person:0',
    target: `person:${i}`,
    attributes: {
      label: '中心關係',
    },
  });
}

// 2. Ring connections - each node connects to its neighbors
for (let i = 0; i < 100; i++) {
  const next = (i + 1) % 100;
  edges.push({
    key: `ring-${i}-${next}`,  // Unique key for multi-graph
    source: `person:${i}`,
    target: `person:${next}`,
    attributes: {
      label: '鄰居',
    },
  });
}

// 3. Cross connections - some random relationships
for (let i = 5; i < 95; i += 10) {
  edges.push({
    key: `friend-${i}-${i + 5}`,
    source: `person:${i}`,
    target: `person:${i + 5}`,
    attributes: {
      label: '朋友',
    },
  });
}

// 4. Long-distance connections
for (let i = 10; i < 50; i += 15) {
  edges.push({
    key: `distant-${i}-${i + 40}`,
    source: `person:${i}`,
    target: `person:${i + 40}`,
    attributes: {
      label: '遠親',
    },
  });
}

// 5. Cluster connections - groups of nodes that know each other
// Cluster 1: nodes 20-25
for (let i = 20; i < 25; i++) {
  for (let j = i + 1; j <= 25; j++) {
    edges.push({
      key: `colleague-${i}-${j}`,
      source: `person:${i}`,
      target: `person:${j}`,
      attributes: {
        label: '同事',
      },
    });
  }
}

// Cluster 2: nodes 60-65
for (let i = 60; i < 65; i++) {
  for (let j = i + 1; j <= 65; j++) {
    edges.push({
      key: `family-${i}-${j}`,
      source: `person:${i}`,
      target: `person:${j}`,
      attributes: {
        label: '家族',
      },
    });
  }
}

export const testLargeGraphData: GraphData = {
  nodes,
  edges,
};