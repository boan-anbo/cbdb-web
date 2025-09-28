import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonTimelineService } from './person-timeline.service';
import { GetLifeTimelineQuery, CompareTimelinesQuery } from '@cbdb/core';

describe('PersonTimelineService', () => {
  let module: TestingModule;
  let service: PersonTimelineService;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonTimelineService>(PersonTimelineService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('getLifeTimeline', () => {
    it('should retrieve complete life timeline for Wang Anshi (ID: 1762)', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        includeRelatedEntities: true,
        includeLocations: true
      });

      const result = await service.getLifeTimeline(query);

      expect(result).toBeDefined();
      expect(result.timeline).toBeDefined();
      expect(result.timeline.personId).toBe(1762);
      expect(result.timeline.personName).toContain('王安石');
      expect(result.timeline.birthYear).toBe(1021);
      expect(result.timeline.deathYear).toBe(1086);

      // Check events are present
      expect(result.timeline.events).toBeDefined();
      expect(result.timeline.events.length).toBeGreaterThan(0);

      // Check for birth and death events
      const birthEvent = result.timeline.events.find(e => e.eventType === 'birth');
      expect(birthEvent).toBeDefined();
      expect(birthEvent!.year).toBe(1021);

      const deathEvent = result.timeline.events.find(e => e.eventType === 'death');
      expect(deathEvent).toBeDefined();
      expect(deathEvent!.year).toBe(1086);

      // Check for office events - Wang Anshi held many offices
      const officeEvents = result.timeline.events.filter(e => e.eventType === 'office');
      expect(officeEvents.length).toBeGreaterThan(0);

      // Check that office events have proper descriptions (not just codes)
      officeEvents.forEach(event => {
        expect(event.title).toBeDefined();
        expect(event.description).toBeDefined();
        // Office titles should not be just numbers
        expect(event.title).not.toMatch(/^Appointed to \d+$/);
        // Description should contain actual office name, not just code
        expect(event.description).not.toMatch(/^Office ID: \d+$/);
        console.log('Office event:', { title: event.title, description: event.description });
      });

      // Check for association events if present
      const associationEvents = result.timeline.events.filter(e => e.eventType === 'association');
      if (associationEvents.length > 0) {
        associationEvents.forEach(event => {
          expect(event.title).toBeDefined();
          expect(event.description).toBeDefined();
          // Associations should not show [n/a] or just codes
          expect(event.title).not.toContain('[n/a]');
          expect(event.description).not.toContain('[n/a]');
          console.log('Association event:', { title: event.title, description: event.description });
        });
      }

      // Check metadata
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.dataSourcesUsed).toBeDefined();
      expect(result.metadata!.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should filter events by year range', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        startYear: 1040,
        endYear: 1070
      });

      const result = await service.getLifeTimeline(query);

      expect(result).toBeDefined();

      // All events should be within the specified range
      result.timeline.events.forEach(event => {
        const eventYear = event.year || event.startYear;
        if (eventYear) {
          expect(eventYear).toBeGreaterThanOrEqual(1040);
          expect(eventYear).toBeLessThanOrEqual(1070);
        }
      });
    });

    it('should filter events by type', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['birth', 'death']
      });

      const result = await service.getLifeTimeline(query);

      expect(result).toBeDefined();

      // Should only have birth and death events
      result.timeline.events.forEach(event => {
        expect(['birth', 'death']).toContain(event.eventType);
      });

      // Should have exactly 2 events (birth and death)
      expect(result.timeline.events.length).toBe(2);
    });

    it('should handle non-existent person gracefully', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 999999999
      });

      const result = await service.getLifeTimeline(query);

      expect(result).toBeDefined();
      expect(result.timeline).toBeDefined();
      expect(result.timeline.events.length).toBe(0);
      expect(result.timeline.personName).toBeUndefined();
    });
  });

  describe('compareTimelines', () => {
    it('should compare multiple persons timelines', async () => {
      const query = new CompareTimelinesQuery({
        personIds: [1762, 1763] // Wang Anshi and another person
      });

      const result = await service.compareTimelines(query);

      expect(result).toBeDefined();
      expect(result.timelines).toBeDefined();
      expect(result.timelines.length).toBe(2);

      // Check Wang Anshi's timeline is included
      const wangAnshiTimeline = result.timelines.find(t => t.personId === 1762);
      expect(wangAnshiTimeline).toBeDefined();
      expect(wangAnshiTimeline!.personName).toContain('王安石');
      expect(wangAnshiTimeline!.birthYear).toBe(1021);
      expect(wangAnshiTimeline!.deathYear).toBe(1086);
    });

    it('should handle empty person ID array', async () => {
      const query = new CompareTimelinesQuery({
        personIds: []
      });

      const result = await service.compareTimelines(query);

      expect(result).toBeDefined();
      expect(result.timelines).toBeDefined();
      expect(result.timelines.length).toBe(0);
    });
  });

  describe('getPersonTimelineEvents', () => {
    it('should retrieve all timeline events for Wang Anshi', async () => {
      const events = await service.getPersonTimelineEvents(1762);

      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);

      // All events should belong to person 1762
      const wrongPersonEvents = events.filter(e => e.personId !== 1762);
      if (wrongPersonEvents.length > 0) {
        console.log('Events with wrong personId:', wrongPersonEvents.map(e => ({
          personId: e.personId,
          type: e.eventType,
          title: e.title
        })));
      }
      events.forEach(event => {
        expect(event.personId).toBe(1762);
      });

      // Should have birth and death events
      const eventTypes = events.map(e => e.eventType);
      expect(eventTypes).toContain('birth');
      expect(eventTypes).toContain('death');
      expect(eventTypes).toContain('office');

      // Count events by type
      const eventCounts: Record<string, number> = {};
      events.forEach(event => {
        eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
      });

      console.log(`\nWang Anshi Timeline Summary (Total: ${events.length} events):`);
      console.log('================================');
      Object.entries(eventCounts).sort().forEach(([type, count]) => {
        console.log(`${type}: ${count}`);
      });
    });
  });

  describe('association person name replacement', () => {
    it('should replace Y placeholder with actual person name', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['association']
      });

      const result = await service.getLifeTimeline(query);

      // Find associations that should have Y replaced
      const associationsWithY = result.timeline.events.filter(event =>
        event.eventType === 'association'
      );

      associationsWithY.forEach(event => {
        // Title should not contain 'Y' placeholder
        expect(event.title).toBeDefined();
        expect(event.title).not.toContain('Y');

        // Should contain actual person names instead
        if (event.title.includes('是') && event.title.includes('的恩主')) {
          // Pattern: "是Y的恩主" should become "是[PersonName]的恩主"
          expect(event.title).toMatch(/^是.+的恩主$/);
          expect(event.title).not.toBe('是Y的恩主');
        }

        if (event.title.includes('被') && event.title.includes('推薦')) {
          // Pattern: "被Y推薦" should become "被[PersonName]推薦"
          expect(event.title).toMatch(/^被.+推薦$/);
          expect(event.title).not.toBe('被Y推薦');
        }
      });
    });

    it('should add person name after colon for associations without Y', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['association']
      });

      const result = await service.getLifeTimeline(query);

      // Find simple associations like "推薦", "友"
      const simpleAssociations = result.timeline.events.filter(event =>
        event.eventType === 'association'
      );

      simpleAssociations.forEach(event => {
        // If title is simple type without Y (like "推薦"), should have colon and name
        if (event.title.startsWith('推薦') || event.title.startsWith('友')) {
          expect(event.title).toMatch(/^(推薦|友): .+$/);
          // Should have person name after colon
          const parts = event.title.split(': ');
          expect(parts.length).toBeGreaterThanOrEqual(2);
          expect(parts[1]).not.toBe('');
          expect(parts[1]).not.toContain('Person ');  // Not generic placeholder
        }
      });
    });

    it('should handle mixed patterns correctly', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['association'],
        startYear: 1080,
        endYear: 1080
      });

      const result = await service.getLifeTimeline(query);

      // Test specific patterns we know exist
      const patterns = {
        'withY': ['是Y的恩主', '被Y推薦', '為Y之學生', '學生為Y'],
        'withoutY': ['推薦', '友', '同年友']
      };

      result.timeline.events.forEach(event => {
        const title = event.title;

        // Check no Y remains
        expect(title).not.toContain('Y');

        // Check proper formatting
        if (title.includes('的恩主')) {
          // Should be: "是[Name]的恩主"
          expect(title).toMatch(/^是.+的恩主$/);
        } else if (title.includes('被') && title.includes('推薦')) {
          // Should be: "被[Name]推薦"
          expect(title).toMatch(/^被.+推薦$/);
        } else if (title.startsWith('推薦')) {
          // Should be: "推薦: [Name]"
          expect(title).toMatch(/^推薦: .+$/);
        }
      });
    });
  });

  describe('event descriptions quality', () => {
    it('should provide meaningful descriptions for office events', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['office']
      });

      const result = await service.getLifeTimeline(query);

      expect(result.timeline.events.length).toBeGreaterThan(0);

      result.timeline.events.forEach(event => {
        console.log('Testing office event:', event.title, '|', event.description);

        // Title should contain office name, not just code
        expect(event.title).toBeDefined();
        expect(event.title).not.toMatch(/^Appointed to \d+$/);
        expect(event.title).not.toContain('undefined');
        expect(event.title).not.toContain('null');

        // Description should be meaningful
        expect(event.description).toBeDefined();
        expect(event.description).not.toMatch(/^Office ID: \d+$/);
        expect(event.description).not.toContain('[n/a]');

        // Should contain Chinese office title if available
        // Example: Should show "宰相" not "5342"
      });
    });

    it('should provide meaningful descriptions for association events', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['association']
      });

      const result = await service.getLifeTimeline(query);

      if (result.timeline.events.length > 0) {
        result.timeline.events.forEach(event => {
          console.log('Testing association event:', event.title, '|', event.description);

          // Title should describe the association type
          expect(event.title).toBeDefined();
          expect(event.title).not.toContain('[n/a]');
          expect(event.title).not.toContain('undefined');

          // Description should include related person name
          expect(event.description).toBeDefined();
          expect(event.description).not.toContain('[n/a]');

          // Should show association type like "teacher-student" not code
        });
      }
    });

    it('should provide meaningful descriptions for kinship events', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,
        eventTypes: ['kinship']
      });

      const result = await service.getLifeTimeline(query);

      if (result.timeline.events.length > 0) {
        result.timeline.events.forEach(event => {
          console.log('Testing kinship event:', event.title, '|', event.description);

          // Title should describe the relationship
          expect(event.title).toBeDefined();
          expect(event.title).not.toContain('[n/a]');

          // Description should include related person name
          expect(event.description).toBeDefined();
          expect(event.description).not.toContain('undefined');
        });
      }
    });
  });

  describe('date validation', () => {
    it('should filter out unrealistic ancient dates like -9999', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1488, // Sima Guang who has -9999 dates
        includeRelatedEntities: true
      });

      const result = await service.getLifeTimeline(query);

      // Check that no events have unrealistic dates
      result.timeline.events.forEach(event => {
        if (event.year) {
          expect(event.year).toBeGreaterThan(-3000);  // No dates before 3000 BCE
          expect(event.year).toBeLessThan(2100);       // No dates after 2100 CE
        }
        if (event.startYear) {
          expect(event.startYear).toBeGreaterThan(-3000);
          expect(event.startYear).toBeLessThan(2100);
        }
        if (event.endYear) {
          expect(event.endYear).toBeGreaterThan(-3000);
          expect(event.endYear).toBeLessThan(2100);
        }
      });

      // Specifically check that -9999 dates are filtered out
      const ancientEvents = result.timeline.events.filter(e =>
        e.year === -9999 || e.startYear === -9999 || e.endYear === -9999
      );
      expect(ancientEvents.length).toBe(0);
    });

    it('should apply consistent date validation across all event types', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1488,
        includeRelatedEntities: true
      });

      const result = await service.getLifeTimeline(query);

      // Count how many events were kept
      const validEventCount = result.timeline.events.length;

      // All events should pass the date validation
      const invalidDates = result.timeline.events.filter(event => {
        const year = event.year || event.startYear;
        return year && (year < -3000 || year > 2100);
      });

      expect(invalidDates.length).toBe(0);
      console.log(`Sima Guang: ${validEventCount} valid events after date filtering`);
    });
  });

  describe('getPersonBasicInfo', () => {
    it('should retrieve basic info for Wang Anshi', async () => {
      const info = await service.getPersonBasicInfo(1762);

      expect(info).toBeDefined();
      expect(info).not.toBeNull();
      expect(info!.name).toBeDefined();
      expect(info!.name).toContain('王安石');
      expect(info!.birthYear).toBe(1021);
      expect(info!.deathYear).toBe(1086);
    });

    it('should return null for non-existent person', async () => {
      const info = await service.getPersonBasicInfo(999999999);
      expect(info).toBeNull();
    });
  });

  describe('Event ordering within same year', () => {
    it('should place death events at the end of the year', async () => {
      // Xin Qiji died in 1207, but had other events that year
      const query = new GetLifeTimelineQuery({
        personId: 30359,  // Xin Qiji
        startYear: 1207,
        endYear: 1207
      });

      const result = await service.getLifeTimeline(query);

      // Get all events in 1207
      const events1207 = result.timeline.events;

      if (events1207.length > 1) {
        // Find death event
        const deathEventIndex = events1207.findIndex(e => e.eventType === 'death');

        if (deathEventIndex !== -1) {
          // Death event should be at the end
          expect(deathEventIndex).toBe(events1207.length - 1);
          console.log('Events in 1207 for Xin Qiji:', events1207.map(e => ({
            type: e.eventType,
            title: e.title
          })));
        }
      }
    });

    it('should place birth events at the beginning of the year', async () => {
      // Find someone with birth and other events in same year
      const query = new GetLifeTimelineQuery({
        personId: 1762,  // Wang Anshi
        startYear: 1021,
        endYear: 1021
      });

      const result = await service.getLifeTimeline(query);

      // Get all events in birth year
      const birthYearEvents = result.timeline.events;

      if (birthYearEvents.length > 0) {
        // Birth event should be first if present
        const birthEvent = birthYearEvents.find(e => e.eventType === 'birth');
        if (birthEvent) {
          expect(birthYearEvents[0].eventType).toBe('birth');
        }
      }
    });

    it('should maintain consistent ordering for same-year events', async () => {
      const query = new GetLifeTimelineQuery({
        personId: 1762,  // Wang Anshi - has many events
        includeRelatedEntities: true
      });

      const result = await service.getLifeTimeline(query);

      // Group events by year
      const eventsByYear = new Map<number, TimelineEvent[]>();
      result.timeline.events.forEach(event => {
        const year = event.year || event.startYear || 0;
        if (!eventsByYear.has(year)) {
          eventsByYear.set(year, []);
        }
        eventsByYear.get(year)!.push(event);
      });

      // Check ordering within each year
      eventsByYear.forEach((events, year) => {
        if (events.length > 1) {
          // Check birth is first if present
          const birthIndex = events.findIndex(e => e.eventType === 'birth');
          if (birthIndex !== -1) {
            expect(birthIndex).toBe(0);
          }

          // Check death is last if present
          const deathIndex = events.findIndex(e => e.eventType === 'death');
          if (deathIndex !== -1) {
            expect(deathIndex).toBe(events.length - 1);
          }

          // Log years with multiple events for debugging
          if (events.length > 2) {
            console.log(`Year ${year}: ${events.map(e => e.eventType).join(', ')}`);
          }
        }
      });
    });
  });

  describe('NH year (reign year) filtering', () => {
    it('should not use NH years as absolute years for Xin Qiji', async () => {
      // Xin Qiji (辛棄疾) lived 1140-1207 CE
      // Had office with c_fy_nh_year=32 which was incorrectly being used as year 32 CE
      const query = new GetLifeTimelineQuery({
        personId: 30359,  // Xin Qiji
        eventTypes: ['office']
      });

      const result = await service.getLifeTimeline(query);

      // No events should be before 1100 CE (Xin Qiji born 1140)
      const ancientOffices = result.timeline.events.filter(event => {
        const year = event.year || event.startYear;
        return year && year < 1100;
      });

      if (ancientOffices.length > 0) {
        console.log('Ancient offices found:', ancientOffices.map(o => ({
          title: o.title,
          year: o.year || o.startYear
        })));
      }

      expect(ancientOffices.length).toBe(0);

      // Should have office for 簽書節度判官廳公事 at correct year (1162)
      const qianshuOffice = result.timeline.events.find(e =>
        e.title && e.title.includes('簽書') && e.title.includes('節度')
      );

      if (qianshuOffice) {
        expect(qianshuOffice.startYear).toBeGreaterThanOrEqual(1162);
        expect(qianshuOffice.startYear).toBeLessThanOrEqual(1164);
      }
    });
  });
});