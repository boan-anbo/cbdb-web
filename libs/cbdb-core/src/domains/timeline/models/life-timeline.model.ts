/**
 * Life Timeline Model
 * Represents a person's complete life timeline with all events
 */

import { TimelineEvent } from './timeline-event.model';

export class LifeTimeline {
  personId: number;
  personName?: string;
  birthYear?: number;
  deathYear?: number;
  events: TimelineEvent[];
  totalEvents: number;
  timeSpan?: {
    earliest: number;
    latest: number;
  };

  constructor(data: Partial<LifeTimeline>) {
    this.personId = data.personId!;
    this.personName = data.personName;
    this.birthYear = data.birthYear;
    this.deathYear = data.deathYear;
    this.events = data.events || [];
    this.totalEvents = this.events.length;

    // Calculate time span from events
    if (this.events.length > 0) {
      const years = this.events
        .map(e => [e.year, e.startYear, e.endYear])
        .flat()
        .filter(y => y !== undefined && y !== null) as number[];

      if (years.length > 0) {
        this.timeSpan = {
          earliest: Math.min(...years),
          latest: Math.max(...years)
        };
      }
    }
  }

  /**
   * Sort events chronologically with special ordering for same-year events
   * Birth events come first, death events come last within the same year
   */
  sortEvents(): void {
    // Define event type priority (lower = earlier, higher = later)
    const eventPriority: Record<string, number> = {
      'birth': 1,        // Birth always first
      'entry': 2,        // Examinations/entries early
      'office': 3,       // Office appointments
      'association': 4,  // Associations
      'kinship': 5,      // Kinship relations
      'text': 6,         // Text authorship
      'address': 7,      // Address changes
      'death': 999       // Death always last
    };

    this.events.sort((a, b) => {
      const yearA = a.year || a.startYear || 0;
      const yearB = b.year || b.startYear || 0;

      // Different years: sort by year
      if (yearA !== yearB) {
        return yearA - yearB;
      }

      // Same year: sort by event type priority
      const priorityA = eventPriority[a.eventType] || 50;  // Default middle priority
      const priorityB = eventPriority[b.eventType] || 50;

      return priorityA - priorityB;
    });
  }

  /**
   * Filter events by type
   */
  filterByType(eventType: string): TimelineEvent[] {
    return this.events.filter(e => e.eventType === eventType);
  }

  /**
   * Filter events by year range
   */
  filterByYearRange(startYear: number, endYear: number): TimelineEvent[] {
    return this.events.filter(e => {
      const eventYear = e.year || e.startYear;
      if (!eventYear) return false;
      return eventYear >= startYear && eventYear <= endYear;
    });
  }
}