/**
 * Service for Person-Kinship operations
 * Provides business logic for kinship queries
 */

import { Injectable } from '@nestjs/common';
import {
  PersonKinshipsQuery,
  PersonKinshipsResult,
  KinshipResponse,
  PersonKinshipNetworkQuery,
  PersonKinshipNetworkResult,
  KinshipNetworkNode,
  KinshipFilterOptions
} from '@cbdb/core';
import { PersonKinshipRelationRepository } from './person-kinship-relation.repository';
import { PersonRepository } from '../person/person.repository';

@Injectable()
export class PersonKinshipService {
  constructor(
    private readonly personKinshipRelationRepository: PersonKinshipRelationRepository,
    private readonly personRepository: PersonRepository
  ) { }

  /**
   * Get all kinships for a person
   * @param query The query with personId
   * @returns PersonKinshipsResult with all kinship relations
   */
  async getPersonKinships(query: PersonKinshipsQuery): Promise<PersonKinshipsResult | null> {
    // First get the person basic info
    const person = await this.personRepository.findModelById(query.personId);
    if (!person) {
      return null;
    }

    // Get all kinships with full relations
    const kinships = await this.personKinshipRelationRepository.getFullRelations(query.personId);

    // Convert to KinshipResponse format - kinships already have all the relations
    const kinshipResponses: KinshipResponse[] = kinships.map(kinship => {
      // Create a new KinshipResponse with base Kinship fields
      const response = new KinshipResponse(
        kinship.personId,
        kinship.kinPersonId,
        kinship.kinshipCode,
        kinship.source,
        kinship.pages,
        kinship.notes,
        kinship.autogenNotes,
        kinship.createdBy,
        kinship.createdDate,
        kinship.modifiedBy,
        kinship.modifiedDate
      );

      // Add the optional nested relations (not flattened)
      response.kinshipTypeInfo = kinship.kinshipTypeInfo;
      response.kinPersonInfo = kinship.kinPersonInfo;

      return response;
    });

    return new PersonKinshipsResult(
      query.personId,
      person.name,
      person.nameChn,
      kinshipResponses,
      kinshipResponses.length
    );
  }

  /**
   * Get kinship network with advanced filtering
   * Applies domain logic on top of repository data
   * @param query The query with personId and filters
   * @returns PersonKinshipNetworkResult with filtered kinship network
   */
  async getPersonKinshipNetwork(query: PersonKinshipNetworkQuery): Promise<PersonKinshipNetworkResult | null> {
    const startTime = Date.now();

    // Check if person exists
    const person = await this.personRepository.findModelById(query.personId);
    if (!person) {
      return null;
    }

    // Get raw network from repository (data layer)
    const maxDepth = query.filters.maxLoopDepth || 3;
    const rawNetwork = await this.personKinshipRelationRepository.getKinshipNetwork(
      query.personId,
      maxDepth
    );

    // Apply domain filters (business logic belongs in service)
    const filteredNodes = this.applyKinshipFilters(rawNetwork, query.filters);

    // Transform to domain model
    const nodes = filteredNodes.map(node => this.transformToNetworkNode(node));

    // Count direct vs derived relationships
    let directCount = 0;
    let derivedCount = 0;

    nodes.forEach(node => {
      if (node.pathInfo.distance === 0) {
        directCount++;
      } else {
        derivedCount++;
      }
    });

    const processingTime = Date.now() - startTime;

    return new PersonKinshipNetworkResult(
      query.personId,
      nodes,
      directCount,
      derivedCount,
      nodes.length,
      query.filters,
      processingTime
    );
  }

  /**
   * Apply kinship filters based on domain rules
   * This is where business logic belongs, not in repository
   */
  private applyKinshipFilters(nodes: any[], filters: KinshipFilterOptions): any[] {
    const {
      maxAncestorGen = 3,
      maxDescendGen = 3,
      maxCollateralLinks = 1,
      maxMarriageLinks = 1,
      mourningCircle = false,
      includeReciprocal = true,
      includeDerived = true
    } = filters;

    return nodes.filter(node => {
      // Ego node always included
      if (node.distance === 0) return true;

      // If not including derived, only keep direct relationships
      if (!includeDerived && node.distance > 1) return false;

      // Calculate metrics from path
      const metrics = this.calculatePathMetrics(node.pathFromEgo);

      // Apply generation filters
      if (metrics.generationsUp > maxAncestorGen) return false;
      if (metrics.generationsDown > maxDescendGen) return false;
      if (metrics.collateralSteps > maxCollateralLinks) return false;
      if (metrics.marriageLinks > maxMarriageLinks) return false;

      // Apply mourning circle if enabled
      if (mourningCircle) {
        const totalGenerations = metrics.generationsUp + metrics.generationsDown;
        if (totalGenerations > 4) return false;
      }

      return true;
    });
  }

  /**
   * Calculate generation metrics from a path of kinship codes
   * This is domain knowledge that belongs in the service layer
   */
  private calculatePathMetrics(path: number[]): {
    generationsUp: number;
    generationsDown: number;
    collateralSteps: number;
    marriageLinks: number;
  } {
    let generationsUp = 0;
    let generationsDown = 0;
    let collateralSteps = 0;
    let marriageLinks = 0;

    for (const code of path) {
      const step = this.getKinshipStepMetrics(code);
      generationsUp += step.generationsUp;
      generationsDown += step.generationsDown;
      collateralSteps += step.collateralSteps;
      marriageLinks += step.marriageLinks;
    }

    return { generationsUp, generationsDown, collateralSteps, marriageLinks };
  }

  /**
   * Get metrics for a single kinship code
   * Domain knowledge about kinship relationships
   */
  private getKinshipStepMetrics(code: number): {
    generationsUp: number;
    generationsDown: number;
    collateralSteps: number;
    marriageLinks: number;
  } {
    // This mapping represents domain knowledge about kinship relationships
    // Could be externalized to a configuration or database table
    const metrics = {
      generationsUp: 0,
      generationsDown: 0,
      collateralSteps: 0,
      marriageLinks: 0
    };

    // Parent generation
    if ([75, 111].includes(code)) {
      metrics.generationsUp = 1;
    }
    // Child generation
    else if ([180, 327, 328].includes(code)) {
      metrics.generationsDown = 1;
    }
    // Siblings
    else if ([125, 126, 48, 55].includes(code)) {
      metrics.collateralSteps = 1;
    }
    // Spouse
    else if ([135, 136].includes(code)) {
      metrics.marriageLinks = 1;
    }
    // Add more mappings as needed

    return metrics;
  }

  /**
   * Transform raw data to domain model
   */
  private transformToNetworkNode(raw: any): KinshipNetworkNode {
    const pathInfo = {
      relationshipPath: raw.pathFromEgo.join('->') || 'SELF',
      simplifiedTerm: raw.immediateRelation?.kinshipTypeChn || 'Self',
      distance: raw.distance,
      ...this.calculatePathMetrics(raw.pathFromEgo),
      isBloodRelation: !raw.pathFromEgo.some(code => [135, 136].includes(code)),
      withinMourningCircle: undefined
    };

    return new KinshipNetworkNode(
      raw.personId,
      raw.personName,
      raw.personNameChn,
      raw.birthYear,
      raw.deathYear,
      pathInfo
    );
  }
}
