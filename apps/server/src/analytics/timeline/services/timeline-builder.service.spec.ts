import { describe, it, expect, beforeEach } from 'vitest';
import { TimelineBuilderService } from './timeline-builder.service';
import { TimelineEvent, LifeTimeline } from '@cbdb/core';

describe('TimelineBuilderService', () => {
  let service: TimelineBuilderService;

  beforeEach(() => {
    service = new TimelineBuilderService();
  });

  describe('buildLifeTimeline', () => {
    it('should build a life timeline from events', () => {
      const events: TimelineEvent[] = [
        new TimelineEvent({
          personId: 1762,
          year: 1086,
          eventType: 'death',
          title: 'Death'
        }),
        new TimelineEvent({
          personId: 1762,
          year: 1021,
          eventType: 'birth',
          title: 'Birth'
        }),
        new TimelineEvent({
          personId: 1762,
          startYear: 1050,
          endYear: 1060,
          eventType: 'office',
          title: 'Appointed to Office'
        })
      ];

      const timeline = service.buildLifeTimeline(1762, events, {
        name: '王安石',
        birthYear: 1021,
        deathYear: 1086
      });

      expect(timeline).toBeDefined();
      expect(timeline.personId).toBe(1762);
      expect(timeline.personName).toBe('王安石');
      expect(timeline.birthYear).toBe(1021);
      expect(timeline.deathYear).toBe(1086);
      expect(timeline.events.length).toBe(3);

      // Events should be sorted chronologically
      expect(timeline.events[0].year).toBe(1021); // Birth
      expect(timeline.events[1].startYear).toBe(1050); // Office
      expect(timeline.events[2].year).toBe(1086); // Death
    });

    it('should calculate time span correctly', () => {
      const events: TimelineEvent[] = [
        new TimelineEvent({
          personId: 1762,
          year: 1021,
          eventType: 'birth',
          title: 'Birth'
        }),
        new TimelineEvent({
          personId: 1762,
          year: 1086,
          eventType: 'death',
          title: 'Death'
        })
      ];

      const timeline = service.buildLifeTimeline(1762, events);

      expect(timeline.timeSpan).toBeDefined();
      expect(timeline.timeSpan!.earliest).toBe(1021);
      expect(timeline.timeSpan!.latest).toBe(1086);
    });
  });

  describe('filterEventsByYearRange', () => {
    it('should filter events within specified year range', () => {
      const events: TimelineEvent[] = [
        new TimelineEvent({ personId: 1, year: 1020, eventType: 'event', title: 'Event 1' }),
        new TimelineEvent({ personId: 1, year: 1050, eventType: 'event', title: 'Event 2' }),
        new TimelineEvent({ personId: 1, year: 1080, eventType: 'event', title: 'Event 3' }),
        new TimelineEvent({ personId: 1, year: 1100, eventType: 'event', title: 'Event 4' })
      ];

      const filtered = service.filterEventsByYearRange(events, 1040, 1090);

      expect(filtered.length).toBe(2);
      expect(filtered[0].year).toBe(1050);
      expect(filtered[1].year).toBe(1080);
    });

    it('should return all events when no range specified', () => {
      const events: TimelineEvent[] = [
        new TimelineEvent({ personId: 1, year: 1020, eventType: 'event', title: 'Event 1' }),
        new TimelineEvent({ personId: 1, year: 1050, eventType: 'event', title: 'Event 2' })
      ];

      const filtered = service.filterEventsByYearRange(events);

      expect(filtered.length).toBe(2);
      expect(filtered).toEqual(events);
    });
  });

  describe('filterEventsByType', () => {
    it('should filter events by specified types', () => {
      const events: TimelineEvent[] = [
        new TimelineEvent({ personId: 1, eventType: 'birth', title: 'Birth' }),
        new TimelineEvent({ personId: 1, eventType: 'office', title: 'Office' }),
        new TimelineEvent({ personId: 1, eventType: 'death', title: 'Death' }),
        new TimelineEvent({ personId: 1, eventType: 'kinship', title: 'Kinship' })
      ];

      const filtered = service.filterEventsByType(events, ['birth', 'death']);

      expect(filtered.length).toBe(2);
      expect(filtered[0].eventType).toBe('birth');
      expect(filtered[1].eventType).toBe('death');
    });
  });

  describe('findOverlappingPeriods', () => {
    it('should find overlapping periods between timelines', () => {
      const timeline1 = new LifeTimeline({
        personId: 1,
        birthYear: 1020,
        deathYear: 1080,
        events: []
      });

      const timeline2 = new LifeTimeline({
        personId: 2,
        birthYear: 1050,
        deathYear: 1100,
        events: []
      });

      const overlaps = service.findOverlappingPeriods([timeline1, timeline2]);

      expect(overlaps).toBeDefined();
      expect(overlaps.length).toBe(1);
      expect(overlaps[0].startYear).toBe(1050);
      expect(overlaps[0].endYear).toBe(1080);
      expect(overlaps[0].personIds).toContain(1);
      expect(overlaps[0].personIds).toContain(2);
    });

    it('should handle non-overlapping timelines', () => {
      const timeline1 = new LifeTimeline({
        personId: 1,
        birthYear: 1020,
        deathYear: 1050,
        events: []
      });

      const timeline2 = new LifeTimeline({
        personId: 2,
        birthYear: 1100,
        deathYear: 1150,
        events: []
      });

      const overlaps = service.findOverlappingPeriods([timeline1, timeline2]);

      expect(overlaps).toBeDefined();
      expect(overlaps.length).toBe(0);
    });
  });

  describe('findSharedEvents', () => {
    it('should find shared events between timelines', () => {
      const timeline1 = new LifeTimeline({
        personId: 1,
        events: [
          new TimelineEvent({ personId: 1, year: 1050, eventType: 'battle', title: 'Battle' })
        ]
      });

      const timeline2 = new LifeTimeline({
        personId: 2,
        events: [
          new TimelineEvent({ personId: 2, year: 1050, eventType: 'battle', title: 'Battle' })
        ]
      });

      const shared = service.findSharedEvents([timeline1, timeline2]);

      expect(shared).toBeDefined();
      expect(shared.length).toBe(1);
      expect(shared[0].year).toBe(1050);
      expect(shared[0].eventType).toBe('battle');
      expect(shared[0].personIds).toContain(1);
      expect(shared[0].personIds).toContain(2);
    });

    it('should not include events unique to one timeline', () => {
      const timeline1 = new LifeTimeline({
        personId: 1,
        events: [
          new TimelineEvent({ personId: 1, year: 1050, eventType: 'birth', title: 'Birth' })
        ]
      });

      const timeline2 = new LifeTimeline({
        personId: 2,
        events: [
          new TimelineEvent({ personId: 2, year: 1060, eventType: 'death', title: 'Death' })
        ]
      });

      const shared = service.findSharedEvents([timeline1, timeline2]);

      expect(shared).toBeDefined();
      expect(shared.length).toBe(0);
    });
  });
});