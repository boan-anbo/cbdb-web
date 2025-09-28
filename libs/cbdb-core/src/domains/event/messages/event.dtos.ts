/**
 * Event DTOs - HTTP layer contracts
 * Requests and Responses for API communication
 */

import { Event } from '@domains/event/models/event.model';
import { EventTypeInfo, PlaceInfo } from '@domains/event/models/event.model.extended';
import { PaginationInfo } from '@/common/pagination.dto';

/**
 * Request to search events
 */
export class SearchEventRequest {
  constructor(
    public personId?: number,
    public eventCode?: number,
    public placeId?: number,
    public year?: number,
    public includeTypeInfo?: boolean,
    public includePlaceInfo?: boolean,
    public limit?: number,
    public offset?: number
  ) {}
}

/**
 * Request to get events with specific relations
 */
export class GetEventWithRelationsRequest {
  constructor(
    public personId: number,
    public eventId: number,
    public relations: ('eventTypeInfo' | 'placeInfo')[]
  ) {}
}

/**
 * HTTP response for a single event
 * What goes over the wire to clients
 */
export class EventResponse extends Event {
  // Optional nested relations (not flattened)
  public eventTypeInfo?: EventTypeInfo;
  public placeInfo?: PlaceInfo;
}

/**
 * HTTP response for a list of events
 */
export class EventListResponse {
  constructor(
    public events: EventResponse[],
    public total: number
  ) {}
}

/**
 * HTTP response for paginated event search
 */
export class PaginatedEventResponse {
  constructor(
    public data: EventResponse[],
    public pagination: PaginationInfo
  ) {}
}