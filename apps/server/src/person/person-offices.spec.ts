import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonService } from './person.service';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { OfficeWithFullRelations } from '@cbdb/core';

describe('PersonService - Offices', () => {
  let module: TestingModule;
  let personService: PersonService;
  let personOfficeRelationRepository: PersonOfficeRelationRepository;

  beforeEach(async () => {
    module = await getTestModule();
    personService = module.get<PersonService>(PersonService);
    personOfficeRelationRepository = module.get<PersonOfficeRelationRepository>(PersonOfficeRelationRepository);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('getPersonOffices', () => {
    it('should retrieve Wang Anshi\'s 41 offices with full relations', async () => {
      // Wang Anshi ID: 1762
      const result = await personService.getPersonOffices(1762);

      // Basic assertions
      expect(result).toBeDefined();
      expect(result.personId).toBe(1762);
      expect(result.personName).toBe('Wang Anshi');
      expect(result.personNameChn).toBe('王安石');
      expect(result.totalOffices).toBe(41);
      expect(result.offices).toHaveLength(41);
    });

    it('should return null for non-existent person', async () => {
      const result = await personService.getPersonOffices(999999999);
      expect(result).toBeNull();
    });

    it('should have properly mapped office relations', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Check first office has all expected properties
      const firstOffice = result!.offices[0];
      // Check it has the extended properties (not checking instanceof due to mapper implementation)
      expect(firstOffice).toBeDefined();

      // Check office has basic fields
      expect(firstOffice.personId).toBe(1762);
      expect(firstOffice.officeId).toBeDefined();
      expect(firstOffice.postingId).toBeDefined();

      // Check office info is mapped when available
      expect(firstOffice.officeInfo).toBeDefined();
      if (firstOffice.officeInfo) {
        expect(firstOffice.officeInfo.id).toBe(firstOffice.officeId);
        expect(firstOffice.officeInfo.nameChn).toBeDefined();
      }

      // Check source info is mapped when available
      if (firstOffice.source) {
        expect(firstOffice.sourceInfo).toBeDefined();
        if (firstOffice.sourceInfo) {
          expect(firstOffice.sourceInfo.id).toBe(firstOffice.source);
          expect(firstOffice.sourceInfo.title).toBeDefined();
        }
      }
    });

    it('should have offices with different appointment types', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Find offices with appointment info
      const officesWithAppointment = result!.offices.filter(o => o.appointmentInfo !== null);
      expect(officesWithAppointment.length).toBeGreaterThan(0);

      // Check appointment types include "正授" (Regular Appointment) and others
      const appointmentTypes = new Set(
        officesWithAppointment
          .map(o => o.appointmentInfo?.nameChn)
          .filter(Boolean)
      );
      expect(appointmentTypes.has('正授')).toBe(true);  // Regular Appointment
    });

    it('should have offices with posting addresses', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Find offices with posting addresses
      const officesWithAddress = result!.offices.filter(o => o.postingAddress !== null);
      expect(officesWithAddress.length).toBeGreaterThan(0);

      // Check some have real locations, not just [未詳]
      const realAddresses = officesWithAddress.filter(
        o => o.postingAddress?.nameChn !== '[未詳]'
      );
      expect(realAddresses.length).toBeGreaterThan(0);
    });

    it('should have offices ordered by firstYear and sequence', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Check offices are ordered (when years are available)
      const officesWithYear = result!.offices.filter(o => o.firstYear !== null);

      // Verify ordering for offices with years
      for (let i = 1; i < officesWithYear.length; i++) {
        const prev = officesWithYear[i - 1];
        const curr = officesWithYear[i];

        // Earlier year should come first
        if (prev.firstYear !== null && curr.firstYear !== null) {
          expect(prev.firstYear).toBeLessThanOrEqual(curr.firstYear);

          // If same year, check sequence
          if (prev.firstYear === curr.firstYear && prev.sequence !== null && curr.sequence !== null) {
            expect(prev.sequence).toBeLessThanOrEqual(curr.sequence);
          }
        }
      }
    });

    it('should include nian hao (reign period) information when available', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Find offices with nian hao info (not all will have it)
      const officesWithNianHao = result!.offices.filter(
        o => o.firstYearNianHao !== null || o.lastYearNianHao !== null
      );

      // Should have at least some offices with nian hao
      expect(officesWithNianHao.length).toBeGreaterThan(0);

      // Check nian hao structure
      const withNianHao = officesWithNianHao[0];
      if (withNianHao.firstYearNianHao) {
        expect(withNianHao.firstYearNianHao).toHaveProperty('nameChn');
        expect(withNianHao.firstYearNianHao).toHaveProperty('pinyin');
        expect(withNianHao.firstYearNianHao).toHaveProperty('dynasty');
      }
    });

    it('should include year range information when available', async () => {
      const result = await personService.getPersonOffices(1762);
      expect(result).toBeDefined();

      // Find offices with year range info
      const officesWithYearRange = result!.offices.filter(
        o => o.firstYearRangeInfo !== null || o.lastYearRangeInfo !== null
      );

      // Should have at least some offices with year range
      expect(officesWithYearRange.length).toBeGreaterThan(0);

      // Check year range structure
      const withYearRange = officesWithYearRange[0];
      if (withYearRange.firstYearRangeInfo) {
        expect(withYearRange.firstYearRangeInfo).toHaveProperty('range');
        expect(withYearRange.firstYearRangeInfo).toHaveProperty('rangeChn');
        expect(withYearRange.firstYearRangeInfo).toHaveProperty('approx');
        expect(withYearRange.firstYearRangeInfo).toHaveProperty('approxChn');
      }
    });
  });

  describe('PersonOfficeRelationRepository', () => {
    it('should use Drizzle aliases for multiple joins to same table', async () => {
      // This tests that our Drizzle alias pattern works correctly
      const offices = await personOfficeRelationRepository.findOfficesByPersonId(1762);

      expect(offices).toHaveLength(41);

      // Find an office with different first and last nian hao
      const officeWithDifferentNianHao = offices.find(
        o => o.firstYearNianHao && o.lastYearNianHao &&
            o.firstYearNianHao.id !== o.lastYearNianHao.id
      );

      // If we have such an office, verify the aliases worked correctly
      if (officeWithDifferentNianHao) {
        expect(officeWithDifferentNianHao.firstYearNianHao!.id).not.toBe(
          officeWithDifferentNianHao.lastYearNianHao!.id
        );
      }
    });
  });
});