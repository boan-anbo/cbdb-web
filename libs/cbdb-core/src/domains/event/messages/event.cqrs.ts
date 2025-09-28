/**
 * Event CQRS Messages - Service layer standard language
 * Queries: Read operations (Get, Search, List)
 * Commands: Actions that DO something (future: export, APP DB operations)
 * Results: Service operation responses with data + metadata
 * Events: Domain events (for future extensibility)
 *
 * NOTE: CBDB is read-only. All CBDB operations are Queries.
 * NOTE: "Event" here refers to historical events in CBDB, not domain events.
 */

import { Event } from '@domains/event/models/event.model';
import type {
  EventWithTypeInfo,
  EventWithPlaceInfo,
  EventWithFullRelations
} from '@domains/event/models/event.model.extended';
import {
  BaseQuery,
  SearchQuery,
  DateRangeFilter,
  ListResult,
  PaginatedResult,
  SingleResult,
  TypeInfo,
  GroupedByTypeResult
} from '@/common/query.interfaces';

// ============================================================================
// Queries - Read operations (ALL CBDB operations)
// ============================================================================

/**
 * Query to get events for a person
 */
export class EventGetByPersonQuery extends BaseQuery {
  constructor(
    public personId: number,
    public includeTypeInfo?: boolean,
    public includePlaceInfo?: boolean,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to search events by description
 */
export class EventSearchQuery extends SearchQuery {
  constructor(
    query: string,
    public eventType?: number,
    accurate?: boolean,
    start?: number,
    limit?: number
  ) {
    super(query, accurate, start, limit);
  }
}

/**
 * Query to list events with filters
 */
export class EventListQuery extends BaseQuery implements DateRangeFilter {
  constructor(
    public personId?: number,
    public eventType?: number,
    public placeId?: number,
    public startYear?: number,
    public endYear?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to get events by year range
 */
export class EventGetByYearQuery extends BaseQuery {
  constructor(
    public year: number,
    public range?: number, // +/- years around the specified year
    public eventType?: number,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
}

/**
 * Query to get events by place
 */
export class EventGetByPlaceQuery extends BaseQuery {
  constructor(
    public placeId: number,
    public eventType?: number,
    public includeTypeInfo?: boolean,
    start?: number,
    limit?: number
  ) {
    super(start, limit);
  }
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
 * Result for getting events
 */
export class EventGetResult extends SingleResult<
  Event | EventWithTypeInfo | EventWithPlaceInfo | EventWithFullRelations
> {}

/**
 * Result for event search operations
 */
export class EventSearchResult extends ListResult<
  Event | EventWithTypeInfo | EventWithPlaceInfo | EventWithFullRelations
> {
  constructor(
    data: (Event | EventWithTypeInfo | EventWithPlaceInfo | EventWithFullRelations)[],
    total: number,
    public query: string
  ) {
    super(data, total);
  }
}

/**
 * Result for listing events
 */
export class EventListResult extends ListResult<
  Event | EventWithTypeInfo | EventWithPlaceInfo | EventWithFullRelations
> {}

/**
 * Result for paginated event queries
 */
export type EventPaginatedResult = PaginatedResult<
  Event | EventWithTypeInfo | EventWithPlaceInfo | EventWithFullRelations
>;

/**
 * Event type information
 */
export class EventTypeWithCount extends TypeInfo {
  // Can add event-specific fields here if needed
}

/**
 * Result for events grouped by type
 */
export class EventByTypeResult extends GroupedByTypeResult<Event> {
  constructor(
    data: Record<number, Event[]>,
    public types: EventTypeWithCount[]
  ) {
    super(data, types);
  }
}

/**
 * Timeline entry for chronological display
 */
export class TimelineEntry {
  constructor(
    public year: number,
    public events: Event[],
    public count: number
  ) {}
}

/**
 * Result for chronological event timeline
 */
export class EventTimelineResult {
  constructor(
    public personId: number,
    public timeline: TimelineEntry[],
    public startYear: number,
    public endYear: number,
    public total: number
  ) {}
}

// ============================================================================
// Domain Events - For future event-driven architecture
// ============================================================================

// Domain events would be for app-specific actions (exports, preference changes, etc.)
// Keeping minimal for now as we don't use event-driven architecture yet