/**
 * Graph Coordinate Worker
 *
 * Worker thread for populating x,y coordinates in graph data.
 * This ensures all nodes have valid positions for Sigma.js visualization.
 */

const workerpool = require('workerpool');

/**
 * Populate x,y coordinates for nodes in graph data
 * @param {Object} graphData - CbdbGraphData object with nodes and edges
 * @returns {Object} Graph data with populated coordinates
 */
function populateCoordinates(graphData) {
  if (!graphData || !graphData.nodes) {
    return graphData;
  }

  // Process nodes and ensure they have x,y coordinates
  const processedNodes = graphData.nodes.map(node => {
    // If node already has valid x,y coordinates, keep them
    if (node.attributes &&
        typeof node.attributes.x === 'number' &&
        typeof node.attributes.y === 'number') {
      return node;
    }

    // Otherwise, assign random positions
    // Using a larger spread for better initial distribution
    return {
      ...node,
      attributes: {
        ...(node.attributes || {}),
        x: node.attributes?.x ?? Math.random() * 1000 - 500,  // -500 to 500
        y: node.attributes?.y ?? Math.random() * 1000 - 500   // -500 to 500
      }
    };
  });

  return {
    ...graphData,
    nodes: processedNodes
  };
}

/**
 * Populate coordinates for multiple graph data objects
 * @param {Array<Object>} graphDataArray - Array of graph data objects
 * @returns {Array<Object>} Array of graph data with populated coordinates
 */
function populateCoordinatesBatch(graphDataArray) {
  return graphDataArray.map(populateCoordinates);
}

/**
 * Advanced coordinate population with layout hints
 * @param {Object} graphData - Graph data
 * @param {Object} options - Layout options (e.g., layoutType, seed)
 * @returns {Object} Graph data with coordinates
 */
function populateCoordinatesWithLayout(graphData, options = {}) {
  if (!graphData || !graphData.nodes) {
    return graphData;
  }

  const { layoutType = 'random', seed = Date.now() } = options;

  // Simple seeded random for reproducible layouts
  let random = seed;
  const seededRandom = () => {
    random = (random * 1103515245 + 12345) % 2147483648;
    return random / 2147483648;
  };

  const nodeCount = graphData.nodes.length;
  const processedNodes = graphData.nodes.map((node, index) => {
    // If coordinates exist, keep them
    if (node.attributes?.x !== undefined && node.attributes?.y !== undefined) {
      return node;
    }

    let x, y;

    switch (layoutType) {
      case 'circle':
        // Arrange nodes in a circle
        const angle = (2 * Math.PI * index) / nodeCount;
        const radius = 400;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        break;

      case 'grid':
        // Arrange nodes in a grid
        const cols = Math.ceil(Math.sqrt(nodeCount));
        const row = Math.floor(index / cols);
        const col = index % cols;
        x = (col - cols / 2) * 100;
        y = (row - cols / 2) * 100;
        break;

      case 'random':
      default:
        // Random distribution with seed
        x = seededRandom() * 1000 - 500;
        y = seededRandom() * 1000 - 500;
        break;
    }

    return {
      ...node,
      attributes: {
        ...(node.attributes || {}),
        x,
        y
      }
    };
  });

  return {
    ...graphData,
    nodes: processedNodes
  };
}

// Register worker functions
workerpool.worker({
  populateCoordinates,
  populateCoordinatesBatch,
  populateCoordinatesWithLayout
});