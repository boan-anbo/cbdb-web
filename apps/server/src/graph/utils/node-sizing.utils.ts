/**
 * Node Sizing Utilities
 *
 * Centralized module for managing node importance and sizing in graph visualizations.
 * Uses a 5-level importance system with bell curve distribution.
 */

/**
 * Node importance levels (1-5) and their corresponding sizes
 * Using a bell curve distribution: fewer nodes at extremes, most in middle
 */
export const NODE_IMPORTANCE_SIZES = {
  1: 0,   // Least important (smallest, few nodes)
  2: 4,   // Less important (more nodes)
  3: 7,   // Medium importance (most nodes - bell curve peak)
  4: 10,  // More important (fewer nodes)
  5: 28   // Most important (largest, few nodes)
} as const;

/**
 * Node importance levels enum for type safety
 */
export enum NodeImportance {
  MINIMAL = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  HIGHEST = 5
}

/**
 * Get node importance based on depth and type
 *
 * Distribution follows bell curve principle:
 * - Level 5: Unused (reserved for special cases)
 * - Level 4: Central person (very few)
 * - Level 3: Direct kinship (few)
 * - Level 2: Direct associations/offices (many)
 * - Level 1: Second-degree+ connections (many)
 *
 * @param depth - Distance from central node (0 = central, 1 = direct, etc.)
 * @param nodeType - Type of relationship ('kinship', 'association', 'office', etc.)
 * @returns Importance level from 1-5
 */
export function getNodeImportance(depth: number, nodeType?: string): number {
  // Central node gets level 4 (leaving level 5 unused)
  if (depth === 0) return NodeImportance.HIGH;

  // Direct connections (depth 1) - differentiate by type
  if (depth === 1) {
    // Kinship is more important than other relationships
    return nodeType === 'kinship' ? NodeImportance.MEDIUM : NodeImportance.LOW;
  }

  // Second-degree connections get minimal importance
  if (depth === 2) return NodeImportance.MINIMAL;

  // Third-degree and beyond also get minimal (same as depth 2)
  return NodeImportance.MINIMAL;
}

/**
 * Get actual node size from importance level
 *
 * @param importance - Importance level (1-5)
 * @returns Pixel size for the node
 */
export function getNodeSize(importance: number): number {
  // Clamp to valid range
  const level = Math.min(5, Math.max(1, Math.round(importance)));
  return NODE_IMPORTANCE_SIZES[level as keyof typeof NODE_IMPORTANCE_SIZES];
}

/**
 * Calculate node size directly from depth and type
 * Convenience function combining importance calculation and size mapping
 *
 * @param depth - Distance from central node
 * @param nodeType - Type of relationship
 * @returns Pixel size for the node
 */
export function calculateNodeSize(depth: number, nodeType?: string): number {
  const importance = getNodeImportance(depth, nodeType);
  return getNodeSize(importance);
}

/**
 * Configuration for custom sizing (for future extensibility)
 */
export interface NodeSizingConfig {
  sizes?: Partial<typeof NODE_IMPORTANCE_SIZES>;
  importanceMapper?: (depth: number, nodeType?: string) => number;
}

/**
 * Create a custom node sizing function with configurable parameters
 * Allows domains to customize sizing while maintaining the importance system
 *
 * @param config - Custom configuration
 * @returns Function to calculate node size
 */
export function createNodeSizer(config?: NodeSizingConfig) {
  const sizes = { ...NODE_IMPORTANCE_SIZES, ...config?.sizes };
  const getImportance = config?.importanceMapper || getNodeImportance;

  return (depth: number, nodeType?: string): number => {
    const importance = getImportance(depth, nodeType);
    const level = Math.min(5, Math.max(1, Math.round(importance))) as 1 | 2 | 3 | 4 | 5;
    return sizes[level];
  };
}