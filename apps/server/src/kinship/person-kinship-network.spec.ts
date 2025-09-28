/**
 * Tests for Person Kinship Network functionality
 * Verifying that we can replicate Access database kinship queries
 */

import { TestingModule } from '@nestjs/testing';
import { PersonKinshipRelationRepository } from './person-kinship-relation.repository';
import { PersonKinshipService } from './person-kinship.service';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import {
  PersonKinshipNetworkQuery,
  KinshipFilterOptions,
  DEFAULT_KINSHIP_FILTERS
} from '@cbdb/core';

describe('PersonKinshipRepository - Pure Query Methods', () => {
  let module: TestingModule;
  let repository: PersonKinshipRelationRepository;
  let service: PersonKinshipService;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonKinshipRelationRepository>(PersonKinshipRelationRepository);
    service = module.get<PersonKinshipService>(PersonKinshipService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('Composable Query Methods', () => {
    const WANG_ANSHI_ID = 1762;

    it('should get direct kinship relationships', async () => {
      const result = await repository.getDirectKinships(WANG_ANSHI_ID);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Verify data structure
      const first = result[0];
      expect(first).toHaveProperty('personId');
      expect(first).toHaveProperty('kinPersonId');
      expect(first).toHaveProperty('kinshipCode');
    });

    it('should get reciprocal kinship relationships', async () => {
      const result = await repository.getReciprocalKinships(WANG_ANSHI_ID);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get kinships with person info', async () => {
      const result = await repository.getKinshipsWithPersonInfo(WANG_ANSHI_ID);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Verify enriched data
      const first = result[0];
      expect(first).toHaveProperty('kinPersonName');
      expect(first).toHaveProperty('kinPersonBirthYear');
      expect(first).toHaveProperty('kinshipTypeChn');
    });

    it('should get kinships by type code', async () => {
      const FATHER_CODE = 75;
      const result = await repository.getKinshipsByType(WANG_ANSHI_ID, FATHER_CODE);

      // Should return only father relationships
      result.forEach(kin => {
        expect(kin.kinshipCode).toBe(FATHER_CODE);
      });
    });

    it('should batch query kinships for multiple persons', async () => {
      const personIds = [WANG_ANSHI_ID, 1763, 1764];
      const result = await repository.getKinshipsByPersonIds(personIds);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Should return kinships for all requested persons
      const uniquePersonIds = [...new Set(result.map(r => r.personId))];
      expect(uniquePersonIds.length).toBeGreaterThanOrEqual(1);
    });

    it('should get kinship network with pure data', async () => {
      const depth = 2;
      const nodes = await repository.getKinshipNetwork(WANG_ANSHI_ID, depth);

      expect(nodes).toBeDefined();
      expect(nodes.length).toBeGreaterThan(0);

      // Verify data structure - no domain logic
      const first = nodes.find(n => n.distance > 0);
      if (first) {
        expect(first).toHaveProperty('personId');
        expect(first).toHaveProperty('distance');
        expect(first).toHaveProperty('pathFromEgo');
        expect(Array.isArray(first.pathFromEgo)).toBe(true);
      }

      // Should not exceed max depth
      const maxDistance = Math.max(...nodes.map(n => n.distance));
      expect(maxDistance).toBeLessThanOrEqual(depth);
    });

    it('should find kinship paths between two persons', async () => {
      // Find paths between Wang Anshi and a known relative
      const targetPerson = 1763; // Example relative ID
      const paths = await repository.getKinshipPaths(WANG_ANSHI_ID, targetPerson, 3);

      if (paths.length > 0) {
        // Verify path structure
        const firstPath = paths[0];
        expect(firstPath).toHaveProperty('path');
        expect(firstPath).toHaveProperty('distance');
        expect(Array.isArray(firstPath.path)).toBe(true);
      }
    });

    it('should find common kinships between multiple persons', async () => {
      const personIds = [WANG_ANSHI_ID, 1763];
      const common = await repository.getCommonKinships(personIds);

      // If there are common relatives
      if (common.length > 0) {
        const first = common[0];
        expect(first).toHaveProperty('kinPersonId');
        expect(first).toHaveProperty('relatedToPersons');
        expect(first).toHaveProperty('count');
        expect(first.count).toBeGreaterThan(1);
      }
    });

    it('should get all kinship types with usage stats', async () => {
      const types = await repository.getAllKinshipTypes();

      expect(types).toBeDefined();
      expect(types.length).toBeGreaterThan(0);

      // Verify structure
      const first = types[0];
      expect(first).toHaveProperty('kinshipCode');
      expect(first).toHaveProperty('kinshipType');
      expect(first).toHaveProperty('kinshipTypeChn');
      expect(first).toHaveProperty('usageCount');

      // Should be sorted by usage
      if (types.length > 1) {
        expect(first.usageCount).toBeGreaterThanOrEqual(types[1].usageCount);
      }
    });

    it('should provide data for service layer filtering', async () => {
      // Repository just returns raw data at different depths
      const depth1 = await repository.getKinshipNetwork(WANG_ANSHI_ID, 1);
      const depth2 = await repository.getKinshipNetwork(WANG_ANSHI_ID, 2);
      const depth3 = await repository.getKinshipNetwork(WANG_ANSHI_ID, 3);

      // Data should expand with depth
      expect(depth1.length).toBeLessThan(depth2.length);
      expect(depth2.length).toBeLessThan(depth3.length);

      // Service layer will apply domain filters
      console.log('Repository provides raw data:');
      console.log(`Depth 1: ${depth1.length} nodes`);
      console.log(`Depth 2: ${depth2.length} nodes`);
      console.log(`Depth 3: ${depth3.length} nodes`);

      // Repository is agnostic about Access behavior
      expect(depth3.length).toBeGreaterThan(100);
    });

    it('should handle network expansion efficiently', async () => {
      // Test performance with different depths
      const startTime1 = Date.now();
      await repository.getKinshipNetwork(WANG_ANSHI_ID, 1);
      const time1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await repository.getKinshipNetwork(WANG_ANSHI_ID, 2);
      const time2 = Date.now() - startTime2;

      // Deeper queries take longer but should be reasonable
      expect(time1).toBeLessThan(1000); // Under 1 second
      expect(time2).toBeLessThan(3000); // Under 3 seconds
    });

    it('should apply domain filters in service layer', async () => {
      // Service applies business logic on top of repository data
      const query = new PersonKinshipNetworkQuery(WANG_ANSHI_ID, {
        maxAncestorGen: 2,
        maxDescendGen: 2,
        maxCollateralLinks: 1,
        maxMarriageLinks: 0,
        maxLoopDepth: 3
      });

      const result = await service.getPersonKinshipNetwork(query);

      expect(result).toBeDefined();
      expect(result?.personId).toBe(WANG_ANSHI_ID);
      expect(result?.totalCount).toBeGreaterThan(0);

      // Service layer applies filters
      console.log('Service filtered result:', {
        directCount: result?.directCount,
        derivedCount: result?.derivedCount,
        totalCount: result?.totalCount,
        filters: result?.filters
      });
    });

    it('should handle empty results gracefully', async () => {
      const NON_EXISTENT_PERSON = 99999999;

      const direct = await repository.getDirectKinships(NON_EXISTENT_PERSON);
      expect(direct).toEqual([]);

      const network = await repository.getKinshipNetwork(NON_EXISTENT_PERSON, 1);
      expect(network.length).toBe(1); // Only ego node
    });

    it('should return consistent data structure', async () => {
      // All query methods should return consistent structures
      const direct = await repository.getDirectKinships(WANG_ANSHI_ID);
      const reciprocal = await repository.getReciprocalKinships(WANG_ANSHI_ID);
      const withInfo = await repository.getKinshipsWithPersonInfo(WANG_ANSHI_ID);

      // All should have core fields
      [direct[0], reciprocal[0], withInfo[0]].filter(Boolean).forEach(item => {
        expect(item).toHaveProperty('personId');
        expect(item).toHaveProperty('kinPersonId');
        expect(item).toHaveProperty('kinshipCode');
      });
    });
  });
});