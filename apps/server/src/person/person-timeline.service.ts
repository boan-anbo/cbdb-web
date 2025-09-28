/**
 * Person Timeline Service
 *
 * Orchestrates timeline data for persons by combining data from repositories
 * with timeline building capabilities from the analytics module.
 *
 * This follows the same pattern as PersonGraphService - residing in PersonModule
 * and using services from AnalyticsModule without creating circular dependencies.
 */

import { Injectable } from '@nestjs/common';
import {
  GetLifeTimelineQuery,
  GetLifeTimelineResult,
  CompareTimelinesQuery,
  CompareTimelinesResult,
  TimelineEvent,
  LifeTimeline,
  timelineMapper
} from '@cbdb/core';
import { TimelineBuilderService } from '../analytics/timeline/services/timeline-builder.service';
import { PersonDetailRepository } from './person-detail.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { PersonKinshipRelationRepository } from '../kinship/person-kinship-relation.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';
import { PersonEntryRelationRepository } from '../entry/person-entry-relation.repository';
import { PersonTextRelationRepository } from '../text/person-text-relation.repository';
import { PersonAddressRelationRepository } from '../address/person-address-relation.repository';

@Injectable()
export class PersonTimelineService {
  constructor(
    private readonly timelineBuilder: TimelineBuilderService,
    private readonly personDetailRepo: PersonDetailRepository,
    private readonly personOfficeRepo: PersonOfficeRelationRepository,
    private readonly personKinshipRepo: PersonKinshipRelationRepository,
    private readonly personAssociationRepo: PersonAssociationRelationRepository,
    private readonly personEntryRepo: PersonEntryRelationRepository,
    private readonly personTextRepo: PersonTextRelationRepository,
    private readonly personAddressRepo: PersonAddressRelationRepository
  ) {}

  /**
   * Format association event titles with proper person names
   * Handles Y replacement and formatting patterns
   */
  private formatAssociationTitle(event: TimelineEvent): TimelineEvent {
    if (event.eventType !== 'association' || !event.metadata?.assocPersonName) {
      return event;
    }

    const personName = event.metadata.assocPersonName;
    let formattedTitle = event.title;

    // Replace Y placeholder with actual person name
    if (formattedTitle.includes('Y')) {
      formattedTitle = formattedTitle.replace(/Y/g, personName);
    } else if (!formattedTitle.includes(personName) && personName !== `Person ${event.relatedEntities?.[0]?.id}`) {
      // If no Y to replace and name not already in title, add after colon
      formattedTitle = `${formattedTitle}: ${personName}`;
    }

    // Add text title if present
    if (event.metadata.textTitle) {
      formattedTitle += ` - ${event.metadata.textTitle}`;
    }

    return {
      ...event,
      title: formattedTitle,
      description: event.description || formattedTitle
    };
  }

  /**
   * Get all timeline events for a person
   */
  async getPersonTimelineEvents(personId: number): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // Fetch all data in parallel
    const [personData, birthDeathData, offices, kinships, associations, entries, texts, addresses] = await Promise.all([
      this.personDetailRepo.getPersonWithDynasty(personId),
      this.personDetailRepo.getPersonBirthDeathInfo(personId),
      this.personOfficeRepo.findOfficesByPersonId(personId),
      this.personKinshipRepo.getDirectKinships(personId),
      this.personAssociationRepo.getAsPrimaryPerson(personId), // Only get associations where person is primary
      this.personEntryRepo.findByPersonId(personId),
      this.personTextRepo.findByPersonId(personId),
      this.personAddressRepo.findByPersonId(personId)
    ]);

    // Extract enhanced birth/death events (prefer PersonBirthDeathView data if available)
    if (birthDeathData) {
      // console.log('birthDeathData:', birthDeathData); // Debug
      const birthEvent = timelineMapper.createEnhancedBirthEvent(birthDeathData);
      if (birthEvent) events.push(birthEvent);

      const deathEvent = timelineMapper.createEnhancedDeathEvent(birthDeathData);
      if (deathEvent) events.push(deathEvent);
    } else if (personData) {
      // Fallback to basic birth/death events
      const birthEvent = timelineMapper.createBirthDeathEvent(personData.person, 'birth');
      if (birthEvent) events.push(birthEvent);

      const deathEvent = timelineMapper.createBirthDeathEvent(personData.person, 'death');
      if (deathEvent) events.push(deathEvent);
    }

    // Extract office appointments
    for (const office of offices) {
      const officeEvent = timelineMapper.createOfficeEvent(office);
      if (officeEvent) events.push(officeEvent);
    }

    // Extract kinship events (if they have temporal data)
    for (const kinship of kinships) {
      const kinshipEvent = timelineMapper.createKinshipEvent(kinship);
      if (kinshipEvent) events.push(kinshipEvent);
    }

    // Extract association events (if they have temporal data)
    for (const association of associations) {
      const associationEvent = timelineMapper.createAssociationEvent(association);
      if (associationEvent) {
        // Format the title with proper person names
        const formattedEvent = this.formatAssociationTitle(associationEvent);
        events.push(formattedEvent);
      }
    }

    // Extract entry/examination events
    for (const entry of entries) {
      const entryEvent = timelineMapper.createEntryEvent(entry);
      if (entryEvent) events.push(entryEvent);
    }

    // Extract text composition events
    for (const text of texts) {
      const textEvent = timelineMapper.createTextEvent(text);
      if (textEvent) events.push(textEvent);
    }

    // Extract address/residence events
    for (const address of addresses) {
      const addressEvent = timelineMapper.createAddressEvent(address);
      if (addressEvent) events.push(addressEvent);
    }

    return events;
  }

  /**
   * Get person's basic info for timeline context
   */
  async getPersonBasicInfo(personId: number): Promise<{ name?: string; birthYear?: number; deathYear?: number } | null> {
    const personData = await this.personDetailRepo.getPersonWithDynasty(personId);

    if (!personData) return null;

    return {
      name: personData.person.c_name_chn || personData.person.c_name || undefined,
      birthYear: personData.person.c_birthyear || undefined,
      deathYear: personData.person.c_deathyear || undefined
    };
  }

  /**
   * Get a person's complete life timeline
   */
  async getLifeTimeline(query: GetLifeTimelineQuery): Promise<GetLifeTimelineResult> {
    const startTime = Date.now();

    // Fetch all timeline events
    const events = await this.getPersonTimelineEvents(query.personId);

    // Get person basic info
    const personInfo = await this.getPersonBasicInfo(query.personId);

    // Apply filters if specified
    let filteredEvents = events;

    if (query.startYear || query.endYear) {
      filteredEvents = this.timelineBuilder.filterEventsByYearRange(
        filteredEvents,
        query.startYear,
        query.endYear
      );
    }

    if (query.eventTypes && query.eventTypes.length > 0) {
      filteredEvents = this.timelineBuilder.filterEventsByType(
        filteredEvents,
        query.eventTypes
      );
    }

    // Remove related entities if not requested
    if (!query.includeRelatedEntities) {
      filteredEvents = filteredEvents.map(event => ({
        ...event,
        relatedEntities: undefined
      }));
    }

    // Remove locations if not requested
    if (!query.includeLocations) {
      filteredEvents = filteredEvents.map(event => ({
        ...event,
        location: undefined
      }));
    }

    // Build the timeline
    const timeline = this.timelineBuilder.buildLifeTimeline(
      query.personId,
      filteredEvents,
      personInfo || undefined
    );

    // Calculate metadata
    const incompleteDates = events.filter(e =>
      !e.year && (!e.startYear || !e.endYear)
    ).length;

    return new GetLifeTimelineResult({
      timeline,
      metadata: {
        dataSourcesUsed: [
          'BIOG_MAIN',
          'PersonBirthDeathView',
          'POSTED_TO_OFFICE_DATA',
          'Kinship Relations',
          'Association Relations',
          'ENTRY_DATA',
          'BIOG_TEXT_DATA',
          'BIOG_ADDR_DATA'
        ],
        processingTimeMs: Date.now() - startTime,
        incompleteDates
      }
    });
  }

  /**
   * Compare multiple persons' timelines
   */
  async compareTimelines(query: CompareTimelinesQuery): Promise<CompareTimelinesResult> {
    const timelines: LifeTimeline[] = [];

    // Get timeline for each person
    for (const personId of query.personIds) {
      const result = await this.getLifeTimeline(
        new GetLifeTimelineQuery({
          personId,
          startYear: query.startYear,
          endYear: query.endYear,
          eventTypes: query.eventTypes,
          includeRelatedEntities: true,
          includeLocations: true
        })
      );
      timelines.push(result.timeline);
    }

    // Find overlapping periods and shared events
    const overlappingPeriods = this.timelineBuilder.findOverlappingPeriods(timelines);
    const sharedEvents = this.timelineBuilder.findSharedEvents(timelines);

    return new CompareTimelinesResult({
      timelines,
      overlappingPeriods,
      sharedEvents
    });
  }
}