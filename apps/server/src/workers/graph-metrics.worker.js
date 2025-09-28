/**
 * Worker for parallel graph metrics computation
 * Uses workerpool to offload CPU-intensive graph calculations
 */

const workerpool = require('workerpool');

/**
 * Calculate density of a graph
 * @param {number} nodeCount Number of nodes
 * @param {number} edgeCount Number of edges
 * @returns {number} Graph density
 */
function calculateDensity(nodeCount, edgeCount) {
  if (nodeCount <= 1) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return edgeCount / maxEdges;
}

/**
 * Calculate average degree
 * @param {number} nodeCount Number of nodes
 * @param {number} edgeCount Number of edges
 * @returns {number} Average degree
 */
function calculateAvgDegree(nodeCount, edgeCount) {
  if (nodeCount === 0) return 0;
  return (2 * edgeCount) / nodeCount;
}

/**
 * Calculate clustering coefficient for a node
 * @param {Array} neighbors Array of neighbor node IDs
 * @param {Array} edges Array of all edges
 * @returns {number} Clustering coefficient for the node
 */
function calculateNodeClustering(neighbors, edges) {
  if (neighbors.length < 2) return 0;

  const neighborSet = new Set(neighbors);
  let triangles = 0;

  // Count edges between neighbors
  for (const edge of edges) {
    if (neighborSet.has(edge.source) && neighborSet.has(edge.target)) {
      triangles++;
    }
  }

  const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2;
  return triangles / possibleTriangles;
}

/**
 * Calculate global clustering coefficient
 * @param {Object} graphData Graph data with nodes and edges
 * @returns {number} Global clustering coefficient
 */
function calculateClusteringCoefficient(graphData) {
  const { nodes, edges } = graphData;

  // Build adjacency list
  const adjacency = new Map();
  for (const node of nodes) {
    adjacency.set(node.key, new Set());
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  // Calculate clustering for each node
  let totalClustering = 0;
  let nodeCount = 0;

  for (const [nodeId, neighbors] of adjacency) {
    const neighborArray = Array.from(neighbors);
    if (neighborArray.length >= 2) {
      const nodeClustering = calculateNodeClustering(neighborArray, edges);
      totalClustering += nodeClustering;
      nodeCount++;
    }
  }

  return nodeCount > 0 ? totalClustering / nodeCount : 0;
}

/**
 * Calculate degree distribution
 * @param {Object} graphData Graph data with nodes and edges
 * @returns {Object} Degree distribution statistics
 */
function calculateDegreeDistribution(graphData) {
  const { nodes, edges } = graphData;

  // Calculate degree for each node
  const degrees = new Map();
  for (const node of nodes) {
    degrees.set(node.key, 0);
  }

  for (const edge of edges) {
    degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
  }

  const degreeValues = Array.from(degrees.values());
  degreeValues.sort((a, b) => a - b);

  return {
    min: degreeValues[0] || 0,
    max: degreeValues[degreeValues.length - 1] || 0,
    median: degreeValues[Math.floor(degreeValues.length / 2)] || 0,
    mean: degreeValues.reduce((sum, d) => sum + d, 0) / degreeValues.length || 0
  };
}

/**
 * Find connected components
 * @param {Object} graphData Graph data with nodes and edges
 * @returns {Array} Array of component sizes
 */
function findConnectedComponents(graphData) {
  const { nodes, edges } = graphData;

  // Build adjacency list
  const adjacency = new Map();
  for (const node of nodes) {
    adjacency.set(node.key, new Set());
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const visited = new Set();
  const components = [];

  // DFS to find components
  function dfs(nodeId, component) {
    visited.add(nodeId);
    component.add(nodeId);

    const neighbors = adjacency.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.key)) {
      const component = new Set();
      dfs(node.key, component);
      components.push(component.size);
    }
  }

  return components;
}

/**
 * Calculate all graph metrics in parallel
 * @param {Object} graphData Graph data with nodes and edges
 * @returns {Object} Complete metrics object
 */
function calculateAllMetrics(graphData) {
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;

  // Basic metrics
  const density = calculateDensity(nodeCount, edgeCount);
  const avgDegree = calculateAvgDegree(nodeCount, edgeCount);

  // Advanced metrics
  const clusteringCoefficient = calculateClusteringCoefficient(graphData);
  const degreeDistribution = calculateDegreeDistribution(graphData);
  const components = findConnectedComponents(graphData);

  return {
    nodeCount,
    edgeCount,
    density,
    avgDegree,
    clusteringCoefficient,
    degreeDistribution,
    componentCount: components.length,
    largestComponentSize: Math.max(...components, 0),
    isConnected: components.length === 1
  };
}

/**
 * Calculate betweenness centrality for nodes (simplified version)
 * @param {Object} graphData Graph data with nodes and edges
 * @param {Array} sampleNodes Optional subset of nodes to calculate for
 * @returns {Map} Node ID to betweenness centrality score
 */
function calculateBetweennessCentrality(graphData, sampleNodes = null) {
  // For large graphs, this can be very expensive
  // Consider sampling or approximation algorithms
  const { nodes, edges } = graphData;

  // Build adjacency list
  const adjacency = new Map();
  for (const node of nodes) {
    adjacency.set(node.key, new Set());
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const centrality = new Map();
  const nodesToProcess = sampleNodes || nodes.map(n => n.key);

  // Simplified betweenness (would need proper shortest path algorithm for accuracy)
  for (const nodeId of nodesToProcess) {
    const neighbors = adjacency.get(nodeId) || new Set();
    centrality.set(nodeId, neighbors.size);
  }

  return Array.from(centrality.entries());
}

// Register worker functions
workerpool.worker({
  calculateDensity,
  calculateAvgDegree,
  calculateClusteringCoefficient,
  calculateDegreeDistribution,
  findConnectedComponents,
  calculateAllMetrics,
  calculateBetweennessCentrality
});