/**
 * Person Controller API Definition
 * Centralized endpoint definitions for person-related operations
 *
 * Clean API Pattern - No Backward Compatibility
 * Controller path is 'people' (without /api prefix which is global)
 */

export const PersonControllerAPI = {
  CONTROLLER_PATH: 'people',

  // ============================================
  // Core Person Operations
  // ============================================

  /**
   * Get person by ID - returns PersonModel
   */
  GET_BY_ID: {
    relativePath: ':id',
    method: 'GET' as const,
    description: 'Get person by ID'
  },

  /**
   * Get full person with all relations - returns PersonFullExtendedModel
   */
  GET_FULL_BY_ID: {
    relativePath: ':id/full',
    method: 'GET' as const,
    description: 'Get person with all relations'
  },

  /**
   * List persons with filters
   */
  LIST: {
    relativePath: 'list',
    method: 'GET' as const,
    description: 'List persons with filters'
  },

  /**
   * Search persons (complex)
   */
  SEARCH: {
    relativePath: 'search',
    method: 'POST' as const,
    description: 'Search persons with complex filters'
  },

  /**
   * Get persons by IDs (batch)
   */
  GET_BATCH: {
    relativePath: 'batch',
    method: 'POST' as const,
    description: 'Get multiple persons by IDs'
  },

  // ============================================
  // Views (Read-only projections)
  // ============================================

  /**
   * Get birth/death view
   */
  GET_BIRTH_DEATH_VIEW: {
    relativePath: ':id/views/birth-death',
    method: 'GET' as const,
    description: 'Get person birth/death information'
  },

  /**
   * Get timeline view
   */
  GET_TIMELINE_VIEW: {
    relativePath: ':id/views/timeline',
    method: 'GET' as const,
    description: 'Get person timeline events'
  },

  /**
   * Get stats view
   */
  GET_STATS_VIEW: {
    relativePath: ':id/views/stats',
    method: 'GET' as const,
    description: 'Get person statistics'
  },

  // ============================================
  // Relations
  // ============================================

  /**
   * Get person's kinships
   */
  GET_KINSHIPS: {
    relativePath: ':id/kinships',
    method: 'GET' as const,
    description: 'Get person kinship relations'
  },

  /**
   * Get person's associations
   */
  GET_ASSOCIATIONS: {
    relativePath: ':id/associations',
    method: 'GET' as const,
    description: 'Get person associations'
  },

  /**
   * Get person's offices
   */
  GET_OFFICES: {
    relativePath: ':id/offices',
    method: 'GET' as const,
    description: 'Get person office appointments'
  },

  /**
   * Get person's addresses
   */
  GET_ADDRESSES: {
    relativePath: ':id/addresses',
    method: 'GET' as const,
    description: 'Get person addresses'
  },

  // ============================================
  // Analytics
  // ============================================

  /**
   * Analyze person network
   */
  ANALYZE_NETWORK: {
    relativePath: ':id/analytics/network',
    method: 'POST' as const,
    description: 'Analyze person relationship network'
  },

  /**
   * Analyze person timeline
   */
  ANALYZE_TIMELINE: {
    relativePath: 'analytics/timeline',
    method: 'POST' as const,
    description: 'Analyze timeline for multiple persons'
  },

  /**
   * Analyze multi-person network
   */
  ANALYZE_MULTI_NETWORK: {
    relativePath: 'analytics/network',
    method: 'POST' as const,
    description: 'Analyze network for multiple persons'
  },

  // ============================================
  // Graph/Network Operations
  // ============================================

  /**
   * Get kinship network
   */
  GET_KINSHIP_NETWORK: {
    relativePath: ':id/network/kinship',
    method: 'GET' as const,
    description: 'Get kinship network graph data'
  },

  /**
   * Explore person network
   */
  EXPLORE_NETWORK: {
    relativePath: 'network/explore',
    method: 'POST' as const,
    description: 'Explore person network with options'
  },

  /**
   * Export network
   */
  EXPORT_NETWORK: {
    relativePath: 'network/export',
    method: 'POST' as const,
    description: 'Export network in various formats'
  }
} as const;