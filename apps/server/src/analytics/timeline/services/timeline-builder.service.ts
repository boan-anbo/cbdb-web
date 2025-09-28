/**
 * Timeline Builder Service
 * Utility service for constructing and processing timeline data
 */

import { Injectable } from '@nestjs/common';
import {
  TimelineEvent,
  LifeTimeline
} from '@cbdb/core';

@Injectable()
export class TimelineBuilderService {
  /**
   * Build a complete life timeline from events
   */
  buildLifeTimeline(
    personId: number,
    events: TimelineEvent[],
    personInfo?: { name?: string; birthYear?: number; deathYear?: number }
  ): LifeTimeline {
    const timeline = new LifeTimeline({
      personId,
      personName: personInfo?.name,
      birthYear: personInfo?.birthYear,
      deathYear: personInfo?.deathYear,
      events
    });

    // Sort events chronologically
    timeline.sortEvents();

    return timeline;
  }

  /**
   * Filter events by year range
   */
  filterEventsByYearRange(
    events: TimelineEvent[],
    startYear?: number,
    endYear?: number
  ): TimelineEvent[] {
    if (!startYear && !endYear) return events;

    return events.filter(event => {
      const eventYear = event.year || event.startYear;
      if (!eventYear) return false;

      if (startYear && eventYear < startYear) return false;
      if (endYear && eventYear > endYear) return false;

      return true;
    });
  }

  /**
   * Filter events by type
   */
  filterEventsByType(
    events: TimelineEvent[],
    eventTypes?: string[]
  ): TimelineEvent[] {
    if (!eventTypes || eventTypes.length === 0) return events;

    return events.filter(event =>
      eventTypes.includes(event.eventType)
    );
  }

  /**
   * Find overlapping periods between multiple timelines
   */
  findOverlappingPeriods(
    timelines: LifeTimeline[]
  ): { startYear: number; endYear: number; personIds: number[] }[] {
    const overlaps: { startYear: number; endYear: number; personIds: number[] }[] = [];

    // Get life spans for each person
    const lifeSpans = timelines.map(t => ({
      personId: t.personId,
      start: t.birthYear || t.timeSpan?.earliest,
      end: t.deathYear || t.timeSpan?.latest
    })).filter(span => span.start && span.end);

    // Find overlaps between each pair
    for (let i = 0; i < lifeSpans.length; i++) {
      for (let j = i + 1; j < lifeSpans.length; j++) {
        const span1 = lifeSpans[i];
        const span2 = lifeSpans[j];

        if (span1.start && span1.end && span2.start && span2.end) {
          const overlapStart = Math.max(span1.start, span2.start);
          const overlapEnd = Math.min(span1.end, span2.end);

          if (overlapStart <= overlapEnd) {
            // Check if this overlap already exists with other persons
            const existingOverlap = overlaps.find(o =>
              o.startYear === overlapStart && o.endYear === overlapEnd
            );

            if (existingOverlap) {
              if (!existingOverlap.personIds.includes(span1.personId)) {
                existingOverlap.personIds.push(span1.personId);
              }
              if (!existingOverlap.personIds.includes(span2.personId)) {
                existingOverlap.personIds.push(span2.personId);
              }
            } else {
              overlaps.push({
                startYear: overlapStart,
                endYear: overlapEnd,
                personIds: [span1.personId, span2.personId]
              });
            }
          }
        }
      }
    }

    return overlaps;
  }

  /**
   * Find shared events between multiple timelines
   */
  findSharedEvents(
    timelines: LifeTimeline[]
  ): { year: number; eventType: string; personIds: number[] }[] {
    const sharedEvents: { year: number; eventType: string; personIds: number[] }[] = [];
    const eventMap = new Map<string, { year: number; eventType: string; personIds: number[] }>();

    // Group events by year and type
    for (const timeline of timelines) {
      for (const event of timeline.events) {
        if (event.year) {
          const key = `${event.year}-${event.eventType}`;

          if (eventMap.has(key)) {
            const shared = eventMap.get(key)!;
            if (!shared.personIds.includes(timeline.personId)) {
              shared.personIds.push(timeline.personId);
            }
          } else {
            eventMap.set(key, {
              year: event.year,
              eventType: event.eventType,
              personIds: [timeline.personId]
            });
          }
        }
      }
    }

    // Filter to only shared events (more than one person)
    for (const shared of eventMap.values()) {
      if (shared.personIds.length > 1) {
        sharedEvents.push(shared);
      }
    }

    return sharedEvents.sort((a, b) => a.year - b.year);
  }
}