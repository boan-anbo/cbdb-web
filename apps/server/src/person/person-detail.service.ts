/**
 * PersonDetailService - Refactored to use modular repositories
 * No backward compatibility - clean design using latest patterns
 */

import { Injectable } from '@nestjs/common';
import {
  PersonModel,
  PersonDetailResult,
  PersonRelationStats,
  cbdbMapper
} from '@cbdb/core';
import { PersonRepository } from './person.repository';
import { PersonKinshipRelationRepository } from '../kinship/person-kinship-relation.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { PersonAddressRelationRepository } from '../address/person-address-relation.repository';
import { PersonEntryRelationRepository } from '../entry/person-entry-relation.repository';
import { PersonStatusRelationRepository } from '../status/person-status-relation.repository';
import { PersonTextRelationRepository } from '../text/person-text-relation.repository';
import { PersonEventRelationRepository } from '../event/person-event-relation.repository';
import { AltNameRepository } from '../altname/altname.repository';
import { HarvardAPIMapper } from './mappers/harvard-api.mapper';
import { HarvardAPIResponseDataView } from './dataviews/harvard-api-response.dataview';

@Injectable()
export class PersonDetailService {
  constructor(
    // Core person repository
    private readonly personRepository: PersonRepository,

    // All relation repositories
    private readonly kinshipRepo: PersonKinshipRelationRepository,
    private readonly associationRepo: PersonAssociationRelationRepository,
    private readonly officeRepo: PersonOfficeRelationRepository,
    private readonly addressRepo: PersonAddressRelationRepository,
    private readonly entryRepo: PersonEntryRelationRepository,
    private readonly statusRepo: PersonStatusRelationRepository,
    private readonly textRepo: PersonTextRelationRepository,
    private readonly eventRepo: PersonEventRelationRepository,
    private readonly altNameRepo: AltNameRepository
  ) {}

  /**
   * Get comprehensive person details using modular repositories
   * Clean implementation with parallel fetching
   */
  async getPersonDetail(personId: number): Promise<PersonDetailResult | null> {

    // Fetch person basic info
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      return null;
    }

    // Parallel fetch all relations and additional data
    const [
      kinships,
      associations,
      offices,
      addresses,
      entries,
      statuses,
      texts,
      events,
      alternativeNames,
      stats
    ] = await Promise.all([
      this.kinshipRepo.getDirectRelations(personId),
      this.associationRepo.getWithFullRelations(personId),
      this.officeRepo.findOfficesByPersonId(personId),
      this.addressRepo.findByPersonId(personId),
      this.entryRepo.findByPersonId(personId),
      this.statusRepo.findByPersonId(personId),
      this.textRepo.findByPersonId(personId),
      this.eventRepo.findByPersonId(personId),
      this.altNameRepo.findByPersonId(personId),
      this.getRelationStats(personId)
    ]);

    // Build comprehensive result
    return new PersonDetailResult({
      person,
      kinships,
      associations,
      offices,
      addresses,
      entries,
      statuses,
      texts,
      events,
      alternativeNames,
      stats
    });
  }

  /**
   * Get statistics for all relation types
   */
  private async getRelationStats(personId: number): Promise<PersonRelationStats> {
    const [
      kinshipStats,
      associationStats,
      officeStats,
      addressStats,
      entryStats,
      statusStats,
      textStats,
      eventStats,
      altNameStats
    ] = await Promise.all([
      this.kinshipRepo.getStatsSummary(personId),
      this.associationRepo.getStatsSummary(personId),
      this.officeRepo.getStatsSummary(personId),
      this.addressRepo.getStatsSummary(personId),
      this.entryRepo.getStatsSummary(personId),
      this.statusRepo.getStatsSummary(personId),
      this.textRepo.getStatsSummary(personId),
      this.eventRepo.getStatsSummary(personId),
      this.altNameRepo.getStatsSummary(personId)
    ]);

    // Return PersonRelationStats with RelationStat objects
    return new PersonRelationStats(
      kinshipStats,
      addressStats,
      officeStats,
      entryStats,
      statusStats,
      associationStats,
      textStats,
      eventStats,
      altNameStats
    );
  }

  /**
   * Get person detail in Harvard API format
   * Returns data matching the official CBDB API structure
   * Uses only direct kinships (no reciprocal) to match Harvard's data exactly
   */
  async getOfficialAPIDetail(personId: number): Promise<HarvardAPIResponseDataView | null> {
    // Fetch person basic info
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      return null;
    }

    // Parallel fetch all relations - use DIRECT kinships only for Harvard format
    const [
      kinships,
      associations,
      offices,
      addresses,
      entries,
      statuses,
      texts,
      events,
      alternativeNames
    ] = await Promise.all([
      this.kinshipRepo.getDirectRelations(personId), // Direct only, no reciprocal
      this.associationRepo.getWithFullRelations(personId, 'primary'), // Primary only for Harvard compatibility
      this.officeRepo.findOfficesByPersonId(personId),
      this.addressRepo.findByPersonId(personId),
      this.entryRepo.findByPersonId(personId),
      this.statusRepo.findByPersonId(personId),
      this.textRepo.findByPersonId(personId),
      this.eventRepo.findByPersonId(personId),
      this.altNameRepo.findByPersonId(personId)
    ]);

    // Build result matching Harvard's data structure
    const detail = new PersonDetailResult({
      person,
      kinships,
      associations,
      offices,
      addresses,
      entries,
      statuses,
      texts,
      events,
      alternativeNames
    });

    // Transform to Harvard API format
    const mapper = new HarvardAPIMapper();
    return mapper.toHarvardAPIResponse(detail);
  }

  /**
   * Get person with selective relations
   * Allows clients to specify which relations they need
   */
  async getPersonWithRelations(
    personId: number,
    options: {
      includeKinship?: boolean;
      includeAssociations?: boolean;
      includeOffices?: boolean;
      includeAddresses?: boolean;
      includeEntries?: boolean;
      includeStatuses?: boolean;
      includeTexts?: boolean;
      includeEvents?: boolean;
      includeAlternativeNames?: boolean;
    } = {}
  ): Promise<PersonDetailResult | null> {
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      return null;
    }

    // Build promises array based on options
    const promises: Promise<any>[] = [];
    const includeFlags: string[] = [];

    if (options.includeKinship) {
      promises.push(this.kinshipRepo.getDirectRelations(personId));
      includeFlags.push('kinships');
    }
    if (options.includeAssociations) {
      promises.push(this.associationRepo.getWithFullRelations(personId));
      includeFlags.push('associations');
    }
    if (options.includeOffices) {
      promises.push(this.officeRepo.findOfficesByPersonId(personId));
      includeFlags.push('offices');
    }
    if (options.includeAddresses) {
      promises.push(this.addressRepo.findByPersonId(personId));
      includeFlags.push('addresses');
    }
    if (options.includeEntries) {
      promises.push(this.entryRepo.findByPersonId(personId));
      includeFlags.push('entries');
    }
    if (options.includeStatuses) {
      promises.push(this.statusRepo.findByPersonId(personId));
      includeFlags.push('statuses');
    }
    if (options.includeTexts) {
      promises.push(this.textRepo.findByPersonId(personId));
      includeFlags.push('texts');
    }
    if (options.includeEvents) {
      promises.push(this.eventRepo.findByPersonId(personId));
      includeFlags.push('events');
    }
    if (options.includeAlternativeNames) {
      promises.push(this.altNameRepo.findByPersonId(personId));
      includeFlags.push('alternativeNames');
    }

    const results = await Promise.all(promises);

    // Map results back to proper fields
    const relationData: any = { person };
    includeFlags.forEach((flag, index) => {
      relationData[flag] = results[index];
    });

    return new PersonDetailResult(relationData);
  }
}