/**
 * Mapper functions for Event domain
 * Transforms database records to domain models
 */

import type { Event } from './models/event.model';
import type { EventDataWithRelations } from '../../schemas/extended/event.extended';

/**
 * Maps EVENTS_DATA table record to Event domain model
 */
export function mapEventDataToEvent(data: EventDataWithRelations): Event {
  return {
    personId: data.c_personid ?? 0,
    eventId: data.c_event_record_id ?? 0,
    eventCode: data.c_event_code ?? 0,
    year: data.c_year ?? null,
    month: data.c_month ?? null,
    day: data.c_day ?? null,
    placeId: data.c_addr_id ?? null,
    notes: data.c_role ?? null, // c_role contains notes/role description
    sequence: data.c_sequence ?? null
  };
}

/**
 * Maps array of database records to Event domain models
 */
export function mapEventDataArrayToEvent(data: EventDataWithRelations[]): Event[] {
  return data.map(mapEventDataToEvent);
}