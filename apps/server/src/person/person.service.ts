import { Injectable, BadRequestException } from '@nestjs/common';
import {
  PersonModel,
  PersonGetQuery,
  PersonGetResult,
  PersonBatchGetQuery,
  PersonBatchGetResult,
  PersonListQuery,
  PersonListResult,
  PersonWithStatsResult,
  PersonDetailResponse,
  PersonDetailResult,
  PersonBirthDeathView,
  PersonSuggestionsQuery,
  PersonSuggestionsResult,
  PersonOfficesResult,
  PersonAssociationsResult,
  PersonPaginatedResult,
  GetPersonDetailRequest,
  PersonSearchQuery,
  PersonSearchResult,
  cbdbMapper,
  PaginatedResult,
  SingleResult,
  BatchResult
} from '@cbdb/core';
import { PersonRepository } from './person.repository';
import { PersonDetailRepository } from './person-detail.repository';
import { PersonRelationsRepository } from './person-relations.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';

// Pagination security constants
const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,
  MAX_BATCH_SIZE: 500,
  MAX_SUGGESTIONS: 200
};

/**
 * Service layer for Person operations
 * Handles business logic and uses PersonRepository for data access
 */
@Injectable()
export class PersonService {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly personDetailRepository: PersonDetailRepository,
    private readonly personRelationsRepository: PersonRelationsRepository,
    private readonly personOfficeRelationRepository: PersonOfficeRelationRepository,
    private readonly personAssociationRelationRepository: PersonAssociationRelationRepository
  ) { }

  /**
   * List suggestions for autocomplete
   * Optimized for typeahead performance
   * Returns PersonSuggestionDataView - lightweight projection for autocomplete
   */
  async listSuggestions(query: PersonSuggestionsQuery): Promise<PersonSuggestionsResult> {
    const { query: searchQuery = '', limit = 10, sortByImportance = false } = query;

    // Cap the limit to a reasonable maximum (defensive programming)
    const limitNum = limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT;
    const safeLimit = Math.min(limitNum, PAGINATION_DEFAULTS.MAX_SUGGESTIONS);  // Max 200 for suggestions

    // Use the lightweight search specifically designed for autocomplete
    const result = await this.personRepository.searchSuggestionsLightweight({
      query: searchQuery,
      limit: safeLimit,
      sortByImportance: sortByImportance
    });

    return new PersonSuggestionsResult(
      result.suggestions,
      result.total,
      searchQuery
    );
  }

  /**
   * Find a person by their ID
   * Uses PersonGetQuery from CQRS pattern
   */
  async findById(query: PersonGetQuery): Promise<PersonGetResult> {
    const person = await this.personRepository.findModelById(query.id);
    return new SingleResult(person);
  }

  /**
   * Find multiple people by their IDs
   * Uses PersonBatchGetQuery from CQRS pattern
   */
  async findByIds(query: PersonBatchGetQuery): Promise<PersonBatchGetResult> {
    // Defensive check for batch size (in case DTO validation is bypassed)
    if (query.ids.length > PAGINATION_DEFAULTS.MAX_BATCH_SIZE) {
      throw new BadRequestException(
        `Batch size ${query.ids.length} exceeds maximum of ${PAGINATION_DEFAULTS.MAX_BATCH_SIZE}`
      );
    }

    const persons = await this.personRepository.findModelsByIds(query.ids);
    return new BatchResult(
      persons,
      query.ids.filter(id => persons.some(p => p.id === id)),
      query.ids.filter(id => !persons.some(p => p.id === id))
    );
  }

  /**
   * Search for people by name
   * Uses PersonSearchQuery from CQRS pattern
   */
  async searchByName(query: PersonSearchQuery): Promise<PersonSearchResult> {
    const { offset = '0', limit = 100, name = '', accurate } = query;

    // Defensive checks (in case DTO validation is bypassed)
    const startNum = Math.max(0, parseInt(offset, 10) || 0);
    const limitNum = Math.min(
      limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );

    const result = await this.personRepository.searchByName({
      name,
      accurate,
      start: startNum,
      limit: limitNum
    });

    return new PersonSearchResult(
      result.data,
      result.total,
      name
    );
  }

  /**
   * Search by dynasty
   */
  async searchByDynasty(params: {
    dynastyCode: number;
    start?: number;
    limit?: number;
  }): Promise<PersonPaginatedResult> {
    // Defensive checks for pagination
    const safeStart = Math.max(0, params.start || 0);
    const safeLimit = Math.min(
      params.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );

    const result = await this.personRepository.searchByDynasty({
      ...params,
      start: safeStart,
      limit: safeLimit
    });

    return new PaginatedResult(
      result.data,
      {
        total: result.total,
        limit: safeLimit,
        offset: safeStart,
        hasNext: safeStart + safeLimit < result.total,
        hasPrev: safeStart > 0
      }
    );
  }

  /**
   * Search by year range
   */
  async searchByYearRange(params: {
    startYear: number;
    endYear: number;
    start?: number;
    limit?: number;
  }): Promise<PersonPaginatedResult> {
    // Defensive checks for pagination
    const safeStart = Math.max(0, params.start || 0);
    const safeLimit = Math.min(
      params.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );

    const result = await this.personRepository.searchByYearRange({
      ...params,
      start: safeStart,
      limit: safeLimit
    });

    return new PaginatedResult(
      result.data,
      {
        total: result.total,
        limit: safeLimit,
        offset: safeStart,
        hasNext: safeStart + safeLimit < result.total,
        hasPrev: safeStart > 0
      }
    );
  }

  /**
   * List persons with filters
   * Uses PersonListQuery from CQRS pattern
   */
  async list(query: PersonListQuery): Promise<PersonListResult> {
    const {
      name,
      accurate = false,
      dynastyCode,
      startYear,
      endYear,
      gender,
      start = '0',
      limit = '100'
    } = query;
    const startNum = Math.max(0, parseInt(start, 10) || 0);
    const limitNum = Math.min(
      parseInt(limit || '100', 10) || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const dynastyNum = dynastyCode ? parseInt(dynastyCode, 10) : undefined;
    const startYearNum = startYear ? parseInt(startYear, 10) : undefined;
    const endYearNum = endYear ? parseInt(endYear, 10) : undefined;

    // If searching by name with additional filters, use the combined method
    if (name && (dynastyNum !== undefined || (startYearNum !== undefined && endYearNum !== undefined) || gender !== undefined)) {
      const result = await this.personRepository.searchByNameWithFilters({
        name,
        accurate,
        dynastyCode: dynastyNum,
        startYear: startYearNum,
        endYear: endYearNum,
        gender,
        start: startNum,
        limit: limitNum
      });

      return new PersonListResult(
        result.data,
        result.total,
        {
          name,
          dynastyCode: dynastyNum,
          startYear: startYearNum,
          endYear: endYearNum,
          gender
        }
      );
    }

    // If searching by name only
    if (name) {
      const result = await this.personRepository.searchByName({
        name,
        accurate,
        start: startNum,
        limit: limitNum
      });

      return new PersonListResult(
        result.data,
        result.total
      );
    }

    // If searching by dynasty and/or year range and/or gender (no name), use the filter method
    if (dynastyNum !== undefined || (startYearNum !== undefined && endYearNum !== undefined) || gender !== undefined) {
      const result = await this.personRepository.searchWithFilters({
        dynastyCode: dynastyNum,
        startYear: startYearNum,
        endYear: endYearNum,
        gender,
        start: startNum,
        limit: limitNum
      });

      return new PersonListResult(
        result.data,
        result.total,
        {
          dynastyCode: dynastyNum,
          startYear: startYearNum,
          endYear: endYearNum,
          gender
        }
      );
    }

    // Default: return all persons with pagination
    const result = await this.personRepository.searchByName({
      name: '',
      start: startNum,
      limit: limitNum
    });

    return new PersonListResult(
      result.data,
      result.total
    );
  }

  /**
   * Get comprehensive person details
   * Similar to Harvard CBDB API: /cbdbapi/person.php?id=1762
   * Returns complete information about a person including:
   * - Basic biographical data
   * - Alternative names
   * - Kinship relations
   * - Addresses
   * - Offices held
   * - Associations
   * - Texts
   * - Entry into service
   */
  async getPersonDetail(query: GetPersonDetailRequest): Promise<PersonDetailResponse | null> {
    if (!query.id) {
      throw new Error('ID must be provided');
    }

    const personId = parseInt(query.id, 10);
    if (isNaN(personId)) {
      throw new Error('Invalid person ID');
    }

    const rawData = await this.personDetailRepository.getPersonDetail(personId);

    if (!rawData) {
      return null;
    }

    // Map the person using cbdbMapper - pass null for denormData if not present
    const person = cbdbMapper.person.toModel(rawData.person, null as any);

    // Map alternative names if available
    const alternativeNames = rawData.alternativeNames?.map(alt =>
      cbdbMapper.altname.fromDb(alt.alternativeName)
    );

    // Build the PersonDetailResult
    const detailResult = new PersonDetailResult({
      person,
      alternativeNames
    });

    // Build the response
    const response = new PersonDetailResponse(detailResult);

    return response;
  }

  /**
   * Get person with selective relations
   * Allows clients to specify which relations they need
   */
  async getPersonWithRelations(
    id: number,
    relations: {
      kinship?: boolean;
      addresses?: boolean;
      offices?: boolean;
      entries?: boolean;
      statuses?: boolean;
      associations?: boolean;
      texts?: boolean;
      events?: boolean;
    }
  ): Promise<any | null> {
    // Get the person
    const person = await this.personRepository.findModelById(id);
    if (!person) {
      return null;
    }

    // Get requested relations
    const relationsData = await this.personRelationsRepository.getSelectiveRelations(id, relations);

    return {
      person,
      relations: relationsData
    };
  }

  /**
   * Get person with all relations
   * Returns complete information about a person
   */
  async getPersonWithAllRelations(id: number): Promise<any | null> {
    // Get the person
    const person = await this.personRepository.findModelById(id);
    if (!person) {
      return null;
    }

    // Get all relations
    const fullRelations = await this.personRelationsRepository.getAllRelations(id);

    return {
      person,
      fullRelations
    };
  }

  /**
   * Get person with relation stats (counts + IDs)
   * Returns summary information without loading full relation details
   */
  async getPersonWithStats(id: number): Promise<PersonWithStatsResult> {
    const person = await this.personRepository.findModelById(id);
    if (!person) {
      return new PersonWithStatsResult(null);
    }
    // TODO: Get stats from PersonRelationsRepository
    const result = { person, stats: undefined };
    if (!result) {
      return new PersonWithStatsResult(null);
    }
    return new PersonWithStatsResult(result.person, result.stats);
  }

  /**
   * Get person birth/death year view data
   * Organized by Access form: Person Browser Birth/Death tab
   */
  async getPersonBirthDeathView(id: number): Promise<PersonBirthDeathView | null> {
    return this.personDetailRepository.getPersonBirthDeathView(id);
  }

  /**
   * Get person's office appointments with full relations
   */
  async getPersonOffices(personId: number): Promise<PersonOfficesResult | null> {
    // First get the person basic info
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      return null;
    }

    // Get all offices with full relations
    const offices = await this.personOfficeRelationRepository.findOfficesByPersonId(personId);

    return new PersonOfficesResult(
      personId,
      person.name,
      person.nameChn,
      offices,
      offices.length
    );
  }

  /**
   * Get person's associations with full relations
   * @param personId The person ID
   * @param direction Optional: 'primary' (person is c_personid), 'associated' (person is c_assoc_id), or undefined (both)
   */
  async getPersonAssociations(
    personId: number,
    direction?: 'primary' | 'associated'
  ): Promise<PersonAssociationsResult | null> {
    // First get the person basic info
    const person = await this.personRepository.findModelById(personId);
    if (!person) {
      return null;
    }

    // Get all associations with full relations
    const associations = await this.personAssociationRelationRepository.getWithFullRelations(personId, direction);

    return new PersonAssociationsResult(
      personId,
      person.name,
      person.nameChn,
      associations,
      associations.length
    );
  }
}