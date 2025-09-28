import { Injectable } from '@nestjs/common';
import {
  Kinship,
  Address,
  Office,
  Entry,
  Status,
  AssociationModel,
  Text,
  AltName,
  Event,
  PersonRelationStats,
  RelationStat,
  PersonFullRelations,
  // Import schemas for direct count queries
  KIN_DATA,
  BIOG_ADDR_DATA,
  POSTING_DATA,
  ENTRY_DATA,
  STATUS_DATA,
  ASSOC_DATA,
  ALTNAME_DATA,
  BIOG_TEXT_DATA,
  EVENTS_DATA,
  BIOG_MAIN
} from '@cbdb/core';
import { PersonKinshipRelationRepository } from '../kinship/person-kinship-relation.repository';
import { PersonAddressRelationRepository } from '../address/person-address-relation.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { PersonEntryRelationRepository } from '../entry/person-entry-relation.repository';
import { PersonStatusRelationRepository } from '../status/person-status-relation.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';
import { PersonTextRelationRepository } from '../text/person-text-relation.repository';
import { PersonEventRelationRepository } from '../event/person-event-relation.repository';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { eq, sql, count } from 'drizzle-orm';

/**
 * PersonRelationsRepository orchestrates fetching all relations for a person.
 * This repository delegates to individual model repositories for each relation type.
 * It acts as a facade/orchestrator for all person-related data fetching.
 */
@Injectable()
export class PersonRelationsRepository {
  constructor(
    private readonly cbdbConnection: CbdbConnectionService,
    private readonly personKinshipRelation: PersonKinshipRelationRepository,
    private readonly personAddressRelation: PersonAddressRelationRepository,
    private readonly personOfficeRelation: PersonOfficeRelationRepository,
    private readonly personEntryRelation: PersonEntryRelationRepository,
    private readonly personStatusRelation: PersonStatusRelationRepository,
    private readonly personAssociationRelation: PersonAssociationRelationRepository,
    private readonly personTextRelation: PersonTextRelationRepository,
    private readonly personEventRelation: PersonEventRelationRepository
  ) {}

  /**
   * Fetch kinship relations for a person
   * @param personId - The person ID to fetch kinships for
   * @param directOnly - If true, only return direct kinships (no reciprocal or derived)
   */
  async getKinships(personId: number, directOnly: boolean = false): Promise<Kinship[]> {
    if (directOnly) {
      return this.personKinshipRelation.getDirectRelations(personId);
    }
    return this.personKinshipRelation.getFullRelations(personId);
  }

  /**
   * Fetch addresses for a person
   */
  async getAddresses(personId: number): Promise<Address[]> {
    // TODO: Implement in PersonAddressRelationRepository
    return [];
  }

  /**
   * Fetch offices for a person
   */
  async getOffices(personId: number): Promise<Office[]> {
    // TODO: Implement in PersonOfficeRelationRepository
    return [];
  }

  /**
   * Fetch entries for a person
   */
  async getEntries(personId: number): Promise<Entry[]> {
    // TODO: Implement in PersonEntryRelationRepository
    return [];
  }

  /**
   * Fetch statuses for a person
   */
  async getStatuses(personId: number): Promise<Status[]> {
    // TODO: Implement in PersonStatusRelationRepository
    return [];
  }

  /**
   * Fetch associations for a person
   */
  async getAssociations(personId: number): Promise<AssociationModel[]> {
    // TODO: Implement in PersonAssociationRelationRepository
    return [];
  }

  /**
   * Fetch texts for a person
   */
  async getTexts(personId: number): Promise<Text[]> {
    // TODO: Implement in PersonTextRelationRepository
    return [];
  }

  /**
   * Fetch events for a person
   */
  async getEvents(personId: number): Promise<Event[]> {
    // TODO: Implement in PersonEventRelationRepository
    return [];
  }

  /**
   * Fetch alternative names for a person
   */
  async getAltNames(personId: number): Promise<AltName[]> {
    // TODO: Implement getAltNames
    return [];
  }

  /**
   * Fetch selective relations for a person based on requested flags
   */
  async getSelectiveRelations(
    personId: number,
    relations: {
      kinship?: boolean;
      addresses?: boolean;
      offices?: boolean;
      entries?: boolean;
      statuses?: boolean;
      associations?: boolean;
      texts?: boolean;
      events?: boolean;
      altNames?: boolean;
    }
  ): Promise<{
    kinships?: Kinship[];
    addresses?: Address[];
    offices?: Office[];
    entries?: Entry[];
    statuses?: Status[];
    associations?: AssociationModel[];
    texts?: Text[];
    events?: Event[];
    altNames?: AltName[];
  }> {
    const result: any = {};

    // Fetch relations in parallel for better performance
    const promises: Promise<void>[] = [];

    if (relations.kinship) {
      promises.push(
        this.getKinships(personId).then(data => {
          result.kinships = data;
        })
      );
    }

    if (relations.addresses) {
      promises.push(
        this.getAddresses(personId).then(data => {
          result.addresses = data;
        })
      );
    }

    if (relations.offices) {
      promises.push(
        this.getOffices(personId).then(data => {
          result.offices = data;
        })
      );
    }

    if (relations.entries) {
      promises.push(
        this.getEntries(personId).then(data => {
          result.entries = data;
        })
      );
    }

    if (relations.statuses) {
      promises.push(
        this.getStatuses(personId).then(data => {
          result.statuses = data;
        })
      );
    }

    if (relations.associations) {
      promises.push(
        this.getAssociations(personId).then(data => {
          result.associations = data;
        })
      );
    }

    if (relations.texts) {
      promises.push(
        this.getTexts(personId).then(data => {
          result.texts = data;
        })
      );
    }

    if (relations.events) {
      promises.push(
        this.getEvents(personId).then(data => {
          result.events = data;
        })
      );
    }

    if (relations.altNames) {
      promises.push(
        this.getAltNames(personId).then(data => {
          result.altNames = data;
        })
      );
    }

    await Promise.all(promises);

    return result;
  }


  /**
   * Get relation counts for a person (counts only, no IDs)
   * Optimized version that doesn't fetch IDs
   * Used for quick overview and sorting operations
   */
  async getRelationCounts(personId: number): Promise<PersonRelationStats> {
    const counts = await this.getRelationCountsOnly(personId);

    // Wrap counts in PersonRelationStats structure (with empty ID arrays)
    return new PersonRelationStats(
      new RelationStat(counts.kinships, [], 'KIN_DATA'),
      new RelationStat(counts.addresses, [], 'BIOG_ADDR_DATA'),
      new RelationStat(counts.offices, [], 'POSTING_DATA'),
      new RelationStat(counts.entries, [], 'ENTRY_DATA'),
      new RelationStat(counts.statuses, [], 'STATUS_DATA'),
      new RelationStat(counts.associations, [], 'ASSOC_DATA'),
      new RelationStat(counts.texts, [], 'BIOG_TEXT_DATA'),
      new RelationStat(counts.events, [], 'EVENTS_DATA'),
      new RelationStat(counts.altNames, [], 'ALTNAME_DATA')
    );
  }

  /**
   * Get relation counts ONLY (optimized for batch operations like sorting)
   * Returns a simple count object without fetching IDs
   */
  async getRelationCountsOnly(personId: number): Promise<{
    kinships: number;
    addresses: number;
    offices: number;
    entries: number;
    statuses: number;
    associations: number;
    texts: number;
    events: number;
    altNames: number;
  }> {
    const db = this.cbdbConnection.getDb();

    // Run all counts in parallel for better performance
    const [
      kinshipCount,
      addressCount,
      officeCount,
      entryCount,
      statusCount,
      assocCount,
      textCount,
      eventCount,
      altNameCount
    ] = await Promise.all([
      db.select({ count: count() })
        .from(KIN_DATA)
        .where(eq(KIN_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(BIOG_ADDR_DATA)
        .where(eq(BIOG_ADDR_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(POSTING_DATA)
        .where(eq(POSTING_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(ENTRY_DATA)
        .where(eq(ENTRY_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(STATUS_DATA)
        .where(eq(STATUS_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(ASSOC_DATA)
        .where(eq(ASSOC_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(BIOG_TEXT_DATA)
        .where(eq(BIOG_TEXT_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(EVENTS_DATA)
        .where(eq(EVENTS_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0),

      db.select({ count: count() })
        .from(ALTNAME_DATA)
        .where(eq(ALTNAME_DATA.c_personid, personId))
        .then(r => r[0]?.count || 0)
    ]);

    return {
      kinships: kinshipCount,
      addresses: addressCount,
      offices: officeCount,
      entries: entryCount,
      statuses: statusCount,
      associations: assocCount,
      texts: textCount,
      events: eventCount,
      altNames: altNameCount
    };
  }

  /**
   * Get relation stats (counts + IDs) for a person
   * Efficient method that gets both count and IDs
   */
  async getRelationStats(personId: number): Promise<PersonRelationStats> {
    const db = this.cbdbConnection.getDb();

    // Get stats for each relation type - using direct queries for each table
    // since dynamic field access causes issues with Drizzle

    // Kinships
    const kinshipCount = await db.select({ count: count() })
      .from(KIN_DATA)
      .where(eq(KIN_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const kinshipIds = kinshipCount > 0
      ? await db.select({ id: KIN_DATA.c_kin_id })
          .from(KIN_DATA)
          .where(eq(KIN_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Addresses
    const addressCount = await db.select({ count: count() })
      .from(BIOG_ADDR_DATA)
      .where(eq(BIOG_ADDR_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const addressIds = addressCount > 0
      ? await db.select({ id: BIOG_ADDR_DATA.c_addr_id })
          .from(BIOG_ADDR_DATA)
          .where(eq(BIOG_ADDR_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Offices
    const officeCount = await db.select({ count: count() })
      .from(POSTING_DATA)
      .where(eq(POSTING_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const officeIds = officeCount > 0
      ? await db.select({ id: POSTING_DATA.c_posting_id })
          .from(POSTING_DATA)
          .where(eq(POSTING_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Entries (using c_entry_code as the ID since there's no single PK)
    const entryCount = await db.select({ count: count() })
      .from(ENTRY_DATA)
      .where(eq(ENTRY_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const entryIds = entryCount > 0
      ? await db.select({ id: ENTRY_DATA.c_entry_code })
          .from(ENTRY_DATA)
          .where(eq(ENTRY_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Statuses (using c_status_code as ID)
    const statusCount = await db.select({ count: count() })
      .from(STATUS_DATA)
      .where(eq(STATUS_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const statusIds = statusCount > 0
      ? await db.select({ id: STATUS_DATA.c_status_code })
          .from(STATUS_DATA)
          .where(eq(STATUS_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // AssociationModels
    const assocCount = await db.select({ count: count() })
      .from(ASSOC_DATA)
      .where(eq(ASSOC_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const assocIds = assocCount > 0
      ? await db.select({ id: ASSOC_DATA.c_assoc_id })
          .from(ASSOC_DATA)
          .where(eq(ASSOC_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Texts
    const textCount = await db.select({ count: count() })
      .from(BIOG_TEXT_DATA)
      .where(eq(BIOG_TEXT_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const textIds = textCount > 0
      ? await db.select({ id: BIOG_TEXT_DATA.c_textid })
          .from(BIOG_TEXT_DATA)
          .where(eq(BIOG_TEXT_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Events (using c_event_record_id as ID)
    const eventCount = await db.select({ count: count() })
      .from(EVENTS_DATA)
      .where(eq(EVENTS_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const eventIds = eventCount > 0
      ? await db.select({ id: EVENTS_DATA.c_event_record_id })
          .from(EVENTS_DATA)
          .where(eq(EVENTS_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    // Alt Names (using c_sequence as ID)
    const altNameCount = await db.select({ count: count() })
      .from(ALTNAME_DATA)
      .where(eq(ALTNAME_DATA.c_personid, personId))
      .then(r => r[0]?.count || 0);

    const altNameIds = altNameCount > 0
      ? await db.select({ id: ALTNAME_DATA.c_sequence })
          .from(ALTNAME_DATA)
          .where(eq(ALTNAME_DATA.c_personid, personId))
          .then(rows => rows.map(r => r.id).filter(id => id !== null))
      : [];

    return new PersonRelationStats(
      new RelationStat(kinshipCount, kinshipIds, 'KIN_DATA'),
      new RelationStat(addressCount, addressIds, 'BIOG_ADDR_DATA'),
      new RelationStat(officeCount, officeIds, 'POSTING_DATA'),
      new RelationStat(entryCount, entryIds, 'ENTRY_DATA'),
      new RelationStat(statusCount, statusIds, 'STATUS_DATA'),
      new RelationStat(assocCount, assocIds, 'ASSOC_DATA'),
      new RelationStat(textCount, textIds, 'BIOG_TEXT_DATA'),
      new RelationStat(eventCount, eventIds, 'EVENTS_DATA'),
      new RelationStat(altNameCount, altNameIds, 'ALTNAME_DATA')
    );
  }

  /**
   * Batch calculate importance scores for multiple persons
   * Optimized to use a single SQL query instead of N queries
   * Returns a map of personId -> importance score
   */
  async getBatchImportanceScores(personIds: number[]): Promise<Map<number, number>> {
    if (personIds.length === 0) {
      return new Map();
    }

    const db = this.cbdbConnection.getDb();

    // Build a single query that calculates all counts for all persons
    // Using subqueries in SELECT clause for each relation type
    const query = sql`
      SELECT
        p.c_personid as id,
        COALESCE((SELECT COUNT(*) FROM ${KIN_DATA} WHERE c_personid = p.c_personid), 0) * 2 as kin_score,
        COALESCE((SELECT COUNT(*) FROM ${BIOG_ADDR_DATA} WHERE c_personid = p.c_personid), 0) * 0.2 as addr_score,
        COALESCE((SELECT COUNT(*) FROM ${POSTING_DATA} WHERE c_personid = p.c_personid), 0) * 2 as office_score,
        COALESCE((SELECT COUNT(*) FROM ${ENTRY_DATA} WHERE c_personid = p.c_personid), 0) * 0.5 as entry_score,
        COALESCE((SELECT COUNT(*) FROM ${STATUS_DATA} WHERE c_personid = p.c_personid), 0) * 0.5 as status_score,
        COALESCE((SELECT COUNT(*) FROM ${ASSOC_DATA} WHERE c_personid = p.c_personid OR c_assoc_id = p.c_personid), 0) * 3 as assoc_score,
        COALESCE((SELECT COUNT(*) FROM ${BIOG_TEXT_DATA} WHERE c_personid = p.c_personid), 0) * 1.5 as text_score,
        COALESCE((SELECT COUNT(*) FROM ${EVENTS_DATA} WHERE c_personid = p.c_personid), 0) * 1 as event_score,
        COALESCE((SELECT COUNT(*) FROM ${ALTNAME_DATA} WHERE c_personid = p.c_personid), 0) * 0.1 as altname_score
      FROM ${BIOG_MAIN} p
      WHERE p.c_personid IN (${sql.join(personIds.map(id => sql`${id}`), sql`, `)})
    `;

    const results = await db.all(query);

    // Calculate total scores and build the map
    const scores = new Map<number, number>();

    for (const row of results as any[]) {
      const totalScore =
        (row.kin_score || 0) +
        (row.addr_score || 0) +
        (row.office_score || 0) +
        (row.entry_score || 0) +
        (row.status_score || 0) +
        (row.assoc_score || 0) +
        (row.text_score || 0) +
        (row.event_score || 0) +
        (row.altname_score || 0);

      scores.set(row.id, totalScore);
    }

    // Ensure all requested IDs have a score (even if 0)
    for (const id of personIds) {
      if (!scores.has(id)) {
        scores.set(id, 0);
      }
    }

    return scores;
  }

  /**
   * Fetch all relations for a person
   */
  async getAllRelations(personId: number): Promise<PersonFullRelations> {
    return this.getSelectiveRelations(personId, {
      kinship: true,
      addresses: true,
      offices: true,
      entries: true,
      statuses: true,
      associations: true,
      texts: true,
      events: true,
      altNames: true
    }) as Promise<{
      kinships: Kinship[];
      addresses: Address[];
      offices: Office[];
      entries: Entry[];
      statuses: Status[];
      associations: AssociationModel[];
      texts: Text[];
      events: Event[];
      altNames: AltName[];
    }>;
  }
}