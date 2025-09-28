/**
 * Quick test to check Wang Anshi's timeline events
 * Groups events by type and shows counts
 */

import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonTimelineService } from './person-timeline.service';

interface EventTypeSummary {
  count: number;
  examples: string[];
}

interface TimelineAnalysis {
  totalEvents: number;
  eventsByType: Record<string, EventTypeSummary>;
  personInfo: {
    name?: string;
    birthYear?: number;
    deathYear?: number;
  } | null;
}

async function checkWangAnshiTimeline(): Promise<TimelineAnalysis> {
  let module: TestingModule | null = null;

  try {
    console.log('🔍 Analyzing Wang Anshi (ID: 1762) timeline events...\n');

    // Initialize test module
    module = await getTestModule();
    const timelineService = module.get<PersonTimelineService>(PersonTimelineService);

    // Get all timeline events for Wang Anshi
    const events = await timelineService.getPersonTimelineEvents(1762);
    const personInfo = await timelineService.getPersonBasicInfo(1762);

    console.log(`📊 Total timeline events found: ${events.length}\n`);

    // Group events by type
    const eventsByType: Record<string, EventTypeSummary> = {};

    for (const event of events) {
      const type = event.eventType;

      if (!eventsByType[type]) {
        eventsByType[type] = {
          count: 0,
          examples: []
        };
      }

      eventsByType[type].count++;

      // Store first 3 examples for each type
      if (eventsByType[type].examples.length < 3) {
        let example = event.title;
        if (event.year) {
          example = `${event.year}: ${example}`;
        } else if (event.startYear || event.endYear) {
          const range = `${event.startYear || '?'}-${event.endYear || '?'}`;
          example = `${range}: ${example}`;
        }
        eventsByType[type].examples.push(example);
      }
    }

    return {
      totalEvents: events.length,
      eventsByType,
      personInfo
    };

  } finally {
    if (module) {
      await cleanupTestModule(module);
    }
  }
}

async function main() {
  try {
    const analysis = await checkWangAnshiTimeline();

    // Print person info
    if (analysis.personInfo) {
      console.log(`👤 Person: ${analysis.personInfo.name}`);
      console.log(`📅 Life: ${analysis.personInfo.birthYear}-${analysis.personInfo.deathYear}\n`);
    }

    // Print summary
    console.log(`📈 Event Type Breakdown:`);
    console.log(`${'Type'.padEnd(15)} ${'Count'.padEnd(8)} Examples`);
    console.log('─'.repeat(80));

    // Sort by count descending
    const sortedTypes = Object.entries(analysis.eventsByType)
      .sort(([,a], [,b]) => b.count - a.count);

    for (const [type, summary] of sortedTypes) {
      const examples = summary.examples.slice(0, 2).join('; ');
      console.log(`${type.padEnd(15)} ${summary.count.toString().padEnd(8)} ${examples}`);
    }

    console.log('─'.repeat(80));
    console.log(`Total: ${analysis.totalEvents} events across ${Object.keys(analysis.eventsByType).length} types`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Convert to a test instead
import { describe, it } from 'vitest';

describe('Wang Anshi Timeline Analysis', () => {
  it('should analyze Wang Anshi timeline events', async () => {
    const analysis = await checkWangAnshiTimeline();

    // Print person info
    if (analysis.personInfo) {
      console.log(`👤 Person: ${analysis.personInfo.name}`);
      console.log(`📅 Life: ${analysis.personInfo.birthYear}-${analysis.personInfo.deathYear}\n`);
    }

    // Print summary
    console.log(`📈 Event Type Breakdown:`);
    console.log(`${'Type'.padEnd(15)} ${'Count'.padEnd(8)} Examples`);
    console.log('─'.repeat(80));

    // Sort by count descending
    const sortedTypes = Object.entries(analysis.eventsByType)
      .sort(([,a], [,b]) => b.count - a.count);

    for (const [type, summary] of sortedTypes) {
      const examples = summary.examples.slice(0, 2).join('; ');
      console.log(`${type.padEnd(15)} ${summary.count.toString().padEnd(8)} ${examples}`);
    }

    console.log('─'.repeat(80));
    console.log(`Total: ${analysis.totalEvents} events across ${Object.keys(analysis.eventsByType).length} types`);
  });
});

export { checkWangAnshiTimeline, type TimelineAnalysis };