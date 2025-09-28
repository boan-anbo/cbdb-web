import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonAssociationRelationRepository } from './person-association-relation.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';

describe('PersonAssociationRelationRepository', () => {
  let module: TestingModule;
  let repository: PersonAssociationRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    repository = module.get<PersonAssociationRelationRepository>(PersonAssociationRelationRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('getStatsSummary', () => {
    it('should get association stats for Yangyi (ID: 7097)', async () => {
      const stats = await repository.getStatsSummary(7097);

      expect(stats).toBeDefined();
      expect(stats.count).toBe(202); // Yangyi has 202 associations (bidirectional)
      expect(stats.ids).toHaveLength(202);
      expect(stats.tableName).toBe('ASSOC_DATA');
    });

    it('should get association stats for Wang Anshi (ID: 1762)', async () => {
      const stats = await repository.getStatsSummary(1762);

      expect(stats).toBeDefined();
      expect(stats.count).toBeGreaterThan(0);
      expect(stats.ids).toBeDefined();
      expect(stats.ids.length).toBeGreaterThan(0);
    });
  });

  describe('getStatsByType', () => {
    it('should get associations grouped by type for Yangyi', async () => {
      const stats = await repository.getStatsByType(7097);

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);

      // Sum of all types should equal total associations
      const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
      expect(totalCount).toBe(202);

      // Each stat should have the association type code
      stats.forEach(stat => {
        expect(stat.count).toBeGreaterThan(0);
        expect(stat.ids).toBeDefined();
        expect((stat as any).assocCode).toBeDefined();
      });
    });
  });

  describe('getByPersonId', () => {
    it('should get all associations for Yangyi', async () => {
      const associations = await repository.getByPersonId(7097);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations).toHaveLength(202);

      // Check structure of first association
      if (associations.length > 0) {
        const first = associations[0];
        expect(first.personId).toBeDefined();
        expect(first.assocId).toBeDefined();
        expect(first.assocCode).toBeDefined();
      }
    });
  });

  describe('getWithFullRelations', () => {
    it('should get associations with full relations for Yangyi', async () => {
      const associations = await repository.getWithFullRelations(7097);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations).toHaveLength(202);

      // Check that at least some associations have related data
      const withTypeInfo = associations.filter(a => a.associationTypeInfo !== null);
      expect(withTypeInfo.length).toBeGreaterThan(0);

      // Check structure of first association with type info
      const firstWithType = withTypeInfo[0];
      if (firstWithType?.associationTypeInfo) {
        expect(firstWithType.associationTypeInfo.code).toBeDefined();
        expect(firstWithType.associationTypeInfo.assocType).toBeDefined();
        expect(firstWithType.associationTypeInfo.assocTypeChn).toBeDefined();
      }

      // Check for person info
      const withPersonInfo = associations.filter(a => a.assocPersonInfo !== null);
      expect(withPersonInfo.length).toBeGreaterThan(0);

      const firstWithPerson = withPersonInfo[0];
      if (firstWithPerson?.assocPersonInfo) {
        expect(firstWithPerson.assocPersonInfo.personId).toBeDefined();
        expect(firstWithPerson.assocPersonInfo.name).toBeDefined();
        expect(firstWithPerson.assocPersonInfo.nameChn).toBeDefined();
      }
    });

    it('should get associations for Wang Anshi with full relations', async () => {
      const associations = await repository.getWithFullRelations(1762);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBeGreaterThan(0);

      // Wang Anshi should have various types of associations
      const types = new Set(associations.map(a => a.assocCode));
      expect(types.size).toBeGreaterThan(1);
    });
  });

  describe('getStatsByDirection', () => {
    it('should get associations where Yangyi is primary person', async () => {
      const stats = await repository.getStatsByDirection(7097, 'primary');

      expect(stats).toBeDefined();
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.tableName).toBe('ASSOC_DATA:primary');
    });

    it('should get associations where Yangyi is associated person', async () => {
      const stats = await repository.getStatsByDirection(7097, 'associated');

      expect(stats).toBeDefined();
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.tableName).toBe('ASSOC_DATA:associated');
    });

    it('should have sum of both directions equal to total', async () => {
      const primaryStats = await repository.getStatsByDirection(7097, 'primary');
      const associatedStats = await repository.getStatsByDirection(7097, 'associated');
      const totalStats = await repository.getStatsSummary(7097);

      expect(primaryStats.count + associatedStats.count).toBe(totalStats.count);
    });
  });

  describe('getStatsWithKinshipContext', () => {
    it('should get associations with kinship context', async () => {
      const stats = await repository.getStatsWithKinshipContext(7097);

      expect(stats).toBeDefined();
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.tableName).toBe('ASSOC_DATA:with-kinship');
    });
  });

  describe('getWithFullRelations with direction', () => {
    it('should return 202 associations without direction (bidirectional)', async () => {
      const associations = await repository.getWithFullRelations(7097);
      expect(associations).toHaveLength(202);
    });

    it('should return 101 associations with primary direction', async () => {
      const associations = await repository.getWithFullRelations(7097, 'primary');
      expect(associations).toHaveLength(101);
    });

    it('should return 101 associations with associated direction', async () => {
      const associations = await repository.getWithFullRelations(7097, 'associated');
      expect(associations).toHaveLength(101);
    });

    it('should show OTHER person when Yang Yi is in associated position', async () => {
      // When direction is 'associated', Yang Yi (7097) is in c_assoc_id position
      // The assocPersonInfo should show the OTHER person, not Yang Yi himself
      const associations = await repository.getWithFullRelations(7097, 'associated');

      // Check first few associations
      const firstFiveWithPersonInfo = associations
        .filter(a => a.assocPersonInfo)
        .slice(0, 5);

      firstFiveWithPersonInfo.forEach((assoc, index) => {
        console.log(`Association ${index + 1}:`, {
          personId: assoc.personId,
          assocPersonId: assoc.assocPersonId,
          assocPersonInfo: assoc.assocPersonInfo
        });

        // The assocPersonInfo should NOT be Yang Yi (7097)
        expect(assoc.assocPersonInfo?.personId).not.toBe(7097);
        // Instead, it should be the person from c_personid field
        expect(assoc.assocPersonInfo?.personId).toBe(assoc.personId);
      });
    });

    it('should have primary + associated = total', async () => {
      const [primary, associated, total] = await Promise.all([
        repository.getWithFullRelations(7097, 'primary'),
        repository.getWithFullRelations(7097, 'associated'),
        repository.getWithFullRelations(7097)
      ]);

      expect(primary.length + associated.length).toBe(total.length);
      expect(primary.length + associated.length).toBe(202);
    });
  });
});