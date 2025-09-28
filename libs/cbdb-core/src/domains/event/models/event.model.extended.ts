/**
 * Extended Event models with nested relations
 * These models include related data from joined tables
 * All arrays are required (use [] for empty, never undefined)
 */

import { Event } from './event.model';

/**
 * Event type information from EVENT_CODES table
 */
export class EventTypeInfo {
  constructor(
    public code: number,
    public eventName: string | null,
    public eventNameChn: string | null
  ) {}
}

/**
 * Place information from ADDRESSES table
 */
export class PlaceInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public adminType: string | null,
    public xCoord: number | null,
    public yCoord: number | null
  ) {}
}

/**
 * Event with type information
 * Includes data from EVENT_CODES join
 */
export class EventWithTypeInfo extends Event {
  public eventTypeInfo: EventTypeInfo = new EventTypeInfo(0, null, null);
}

/**
 * Event with place information
 * Includes data from ADDRESSES join
 */
export class EventWithPlaceInfo extends Event {
  public placeInfo: PlaceInfo = new PlaceInfo(0, null, null, null, null, null);
}

/**
 * Event with all relations loaded
 * Includes both EVENT_CODES and ADDRESSES data
 */
export class EventWithFullRelations extends Event {
  public eventTypeInfo: EventTypeInfo = new EventTypeInfo(0, null, null);
  public placeInfo: PlaceInfo = new PlaceInfo(0, null, null, null, null, null);
}