/**
 * Kinship CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Kinship } from '@domains/kinship/models/kinship.model';
import { KinshipCode } from '@domains/kinship/models/kinship-code.model';
import type {
  KinshipWithTypeInfo,
  KinshipWithPersonInfo,
  KinshipWithFullRelations
} from '@domains/kinship/models/kinship.model.extended';
import type { KinshipFilterOptions, KinshipPathInfo } from './kinship-filter.types';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get kinships for a person
 */
export class KinshipGetByPersonQuery {
  constructor(
    public personId: number,
    public includeTypeInfo?: boolean,
    public includePersonInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to list kinships with filters
 */
export class KinshipListQuery {
  constructor(
    public kinType?: number,
    public personId?: number,
    public kinPersonId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to get kinship tree for a person
 */
export class KinshipTreeQuery {
  constructor(
    public personId: number,
    public depth?: number,
    public includePersonInfo?: boolean
  ) {}
}

/**
 * Query to get all kinship codes
 * Used for caching reference data in frontend
 */
export class KinshipCodeListQuery {
  constructor() {}
}

/**
 * Query to get a specific kinship code by ID
 */
export class KinshipCodeGetQuery {
  constructor(
    public code: number
  ) {}
}

/**
 * Query to get all kinships for a person
 * Returns all kinship relations with full info
 */
export class PersonKinshipsQuery {
  constructor(
    public personId: number
  ) {}
}

/**
 * Query to get kinship network with advanced filtering
 * Replicates Access database functionality with generation limits,
 * collateral/marriage links, and mourning circle support
 */
export class PersonKinshipNetworkQuery {
  constructor(
    public personId: number,
    public filters: KinshipFilterOptions = {}
  ) {}
}

// ============================================================================
// Commands - Actions (Future: exports, APP DB operations)
// ============================================================================

// Commands will be added when we implement:
// - Export functionality
// - APP DB operations (user preferences, bookmarks, etc.)
// - System operations

// ============================================================================
// Results - Service operation responses
// ============================================================================

/**
 * Result for getting kinships
 */
export class KinshipGetResult {
  constructor(
    public data: Kinship | KinshipWithTypeInfo | KinshipWithPersonInfo | KinshipWithFullRelations
  ) {}
}

/**
 * Filters for kinship list queries
 */
export class KinshipListFilters {
  constructor(
    public kinType?: number,
    public personId?: number,
    public kinPersonId?: number
  ) {}
}

/**
 * Result for listing kinships
 */
export class KinshipListResult {
  constructor(
    public data: (Kinship | KinshipWithTypeInfo | KinshipWithPersonInfo | KinshipWithFullRelations)[],
    public total: number,
    public filters?: KinshipListFilters
  ) {}
}

/**
 * Pagination metadata for kinship queries
 */
export class KinshipPagination {
  constructor(
    public total: number,
    public limit: number,
    public offset: number,
    public hasNext: boolean,
    public hasPrev: boolean
  ) {}
}

/**
 * Result for paginated kinship queries
 */
export class KinshipPaginatedResult {
  constructor(
    public data: (Kinship | KinshipWithTypeInfo | KinshipWithPersonInfo | KinshipWithFullRelations)[],
    public pagination: KinshipPagination
  ) {}
}

/**
 * Kinship tree data structure
 */
export class KinshipTreeData {
  constructor(
    public person: Kinship['personId'],
    public parents: KinshipWithPersonInfo[],
    public children: KinshipWithPersonInfo[],
    public siblings: KinshipWithPersonInfo[],
    public spouses: KinshipWithPersonInfo[]
  ) {}
}

/**
 * Result for kinship tree queries
 */
export class KinshipTreeResult {
  constructor(
    public data: KinshipTreeData,
    public depth: number
  ) {}
}

/**
 * Result for getting all kinship codes
 */
export class KinshipCodeListResult {
  constructor(
    public data: KinshipCode[],
    public total: number
  ) {}
}

/**
 * Result for getting a specific kinship code
 */
export class KinshipCodeGetResult {
  constructor(
    public data: KinshipCode | null
  ) {}
}

/**
 * Result for getting person's kinships
 * Contains all kinship relations for a person with metadata
 */
export class PersonKinshipsResult {
  constructor(
    public personId: number,
    public personName: string | null,
    public personNameChn: string | null,
    public kinships: any[],  // Will be KinshipResponse[] from DTOs
    public totalKinships: number
  ) {}
}

/**
 * Kinship network node representing a person in the network
 */
export class KinshipNetworkNode {
  constructor(
    public personId: number,
    public personName: string | null,
    public personNameChn: string | null,
    public birthYear: number | null,
    public deathYear: number | null,
    public pathInfo: KinshipPathInfo
  ) {}
}

/**
 * Result for kinship network query with advanced filtering
 * Includes all relationships that pass the filter criteria
 */
export class PersonKinshipNetworkResult {
  constructor(
    public personId: number,
    public nodes: KinshipNetworkNode[],
    public directCount: number,
    public derivedCount: number,
    public totalCount: number,
    public filters: KinshipFilterOptions,
    public processingTime: number
  ) {}
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet