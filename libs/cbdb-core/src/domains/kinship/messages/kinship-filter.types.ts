/**
 * Kinship filter options matching Access database functionality
 * These parameters control the depth and breadth of kinship network traversal
 */
export interface KinshipFilterOptions {
  /**
   * Maximum generations to traverse upward (ancestors)
   * Default: 3
   */
  maxAncestorGen?: number;

  /**
   * Maximum generations to traverse downward (descendants)
   * Default: 3
   */
  maxDescendGen?: number;

  /**
   * Maximum collateral steps (siblings, cousins, etc.)
   * Default: 1
   */
  maxCollateralLinks?: number;

  /**
   * Maximum marriage links to traverse (in-laws)
   * Default: 1
   */
  maxMarriageLinks?: number;

  /**
   * Maximum recursion depth for network traversal
   * Default: 10
   */
  maxLoopDepth?: number;

  /**
   * Apply traditional Chinese mourning circle (五服) filter
   * When true, limits to relationships within 5 degrees
   * Default: false
   */
  mourningCircle?: boolean;

  /**
   * Simplify complex kinship terms
   * Reduces relationship strings using pattern matching
   * Default: false
   */
  simplifyTerms?: boolean;

  /**
   * Include reciprocal relationships
   * Shows bidirectional relationships (A->B and B->A)
   * Default: true
   */
  includeReciprocal?: boolean;

  /**
   * Include derived relationships
   * Shows indirect relationships through kinship chains
   * Default: true
   */
  includeDerived?: boolean;
}

/**
 * Default filter values matching Access database
 */
export const DEFAULT_KINSHIP_FILTERS: Required<KinshipFilterOptions> = {
  maxAncestorGen: 3,
  maxDescendGen: 3,
  maxCollateralLinks: 1,
  maxMarriageLinks: 1,
  maxLoopDepth: 3,  // Optimized for ~200-300 nodes similar to Access
  mourningCircle: false,
  simplifyTerms: false,
  includeReciprocal: true,
  includeDerived: true
};

/**
 * Kinship path information tracking the relationship chain
 */
export interface KinshipPathInfo {
  /**
   * The complete relationship path from ego to relative
   * e.g., "F->B->S" = Father's Brother's Son
   */
  relationshipPath: string;

  /**
   * Simplified relationship term if available
   * e.g., "Cousin" for "F->B->S"
   */
  simplifiedTerm?: string;

  /**
   * Total generations up from ego
   */
  generationsUp: number;

  /**
   * Total generations down from ego
   */
  generationsDown: number;

  /**
   * Total collateral steps
   */
  collateralSteps: number;

  /**
   * Total marriage links in the chain
   */
  marriageLinks: number;

  /**
   * Network distance from ego (number of steps)
   */
  distance: number;

  /**
   * Whether this is a blood relation or by marriage
   */
  isBloodRelation: boolean;

  /**
   * Whether this relationship is within the mourning circle
   */
  withinMourningCircle?: boolean;
}