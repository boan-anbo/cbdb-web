/**
 * Address CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 */

import { Address } from '@domains/address/models/address.model';
import type {
  AddressWithAddressInfo,
  AddressWithTypeInfo,
  AddressWithFullRelations
} from '@domains/address/models/address.model.extended';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get an address by ID
 */
export class AddressGetQuery {
  constructor(
    public addressId: number,
    public includeAddressInfo?: boolean,
    public includeTypeInfo?: boolean
  ) {}
}

/**
 * Query to search addresses by text
 */
export class AddressSearchQuery {
  constructor(
    public query: string,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to list addresses with filters
 */
export class AddressListQuery {
  constructor(
    public personId?: number,
    public addressType?: number,
    public addressId?: number,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Query to get addresses for a person
 */
export class AddressListByPersonQuery {
  constructor(
    public personId: number,
    public includeAddressInfo?: boolean,
    public includeTypeInfo?: boolean,
    public limit?: number,
    public offset?: number
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
 * Result for getting a single address
 */
export class AddressGetResult {
  constructor(
    public data: Address | AddressWithAddressInfo | AddressWithTypeInfo | AddressWithFullRelations
  ) {}
}

/**
 * Result for address search operations
 */
export class AddressSearchResult {
  constructor(
    public data: Address[],
    public total: number,
    public query: string
  ) {}
}

/**
 * Filters for address list queries
 */
export class AddressListFilters {
  constructor(
    public personId?: number,
    public addressType?: number
  ) {}
}

/**
 * Result for listing addresses
 */
export class AddressListResult {
  constructor(
    public data: (Address | AddressWithAddressInfo | AddressWithTypeInfo | AddressWithFullRelations)[],
    public total: number,
    public filters?: AddressListFilters
  ) {}
}

/**
 * Pagination metadata for address queries
 */
export class AddressPagination {
  constructor(
    public total: number,
    public limit: number,
    public offset: number,
    public hasNext: boolean,
    public hasPrev: boolean
  ) {}
}

/**
 * Result for paginated address queries
 */
export class AddressPaginatedResult {
  constructor(
    public data: (Address | AddressWithAddressInfo | AddressWithTypeInfo | AddressWithFullRelations)[],
    public pagination: AddressPagination
  ) {}
}

/**
 * Address type with count information
 */
export class AddressTypeWithCount {
  constructor(
    public code: number,
    public description: string | null,
    public count: number
  ) {}
}

/**
 * Result for addresses grouped by type
 */
export class AddressByTypeResult {
  constructor(
    public data: Record<number, Address[]>,
    public types: AddressTypeWithCount[]
  ) {}
}

// ============================================================================
// Events - Domain events (for future extensibility)
// ============================================================================

// Events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet