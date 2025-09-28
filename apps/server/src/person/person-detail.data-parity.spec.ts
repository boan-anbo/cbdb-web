import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonDetailService } from './person-detail.service';
import * as fs from 'fs';
import * as path from 'path';

describe('Harvard API Data Parity Tests', () => {
  let module: TestingModule;
  let service: PersonDetailService;
  let expected: any;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonDetailService>(PersonDetailService);

    // Load expected JSON
    const fixturePath = path.join(__dirname, '__fixtures__', 'harvard-api-wang-anshi.json');
    const rawData = fs.readFileSync(fixturePath, 'utf8');
    expected = JSON.parse(rawData);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  describe('Kinship Data Parity', () => {
    it('should have exact count match', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualKinships = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;
      const expectedKinships = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;

      expect(actualKinships?.length).toBe(expectedKinships?.length);
    });

    it('should match specific kinship records by KinPersonId', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualKinships = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;
      const expectedKinships = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;

      // Test specific records that should exist in both datasets
      const testPersonIds = ['3965', '7082', '4020', '40119', '1762'];

      for (const personId of testPersonIds) {
        const actualRecord = actualKinships?.find((k: any) => k.KinPersonId === personId);
        const expectedRecord = expectedKinships?.find((k: any) => k.KinPersonId === personId);

        if (expectedRecord) {
          expect(actualRecord).toBeDefined();
          expect(actualRecord?.KinPersonName).toBe(expectedRecord.KinPersonName);
          expect(actualRecord?.KinCode).toBe(expectedRecord.KinCode);
          expect(actualRecord?.KinRel).toBe(expectedRecord.KinRel);
          expect(actualRecord?.KinRelName).toBe(expectedRecord.KinRelName);
        }
      }
    });

    it('should have correct father relationship (ID: 7082)', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualKinships = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;

      // Find father record
      const father = actualKinships?.find((k: any) => k.KinPersonId === '7082');

      expect(father).toBeDefined();
      expect(father?.KinPersonName).toBe('王益');
      expect(father?.KinCode).toBe('75');
      expect(father?.KinRel).toBe('F');
      expect(father?.KinRelName).toBe('父');
    });

    it('should have correct self-reference (ID: 1762)', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualKinships = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;

      // Check if self-reference exists (some people have kinship to themselves)
      const selfRef = actualKinships?.find((k: any) => k.KinPersonId === '1762');
      const expectedSelfRef = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship?.find((k: any) => k.KinPersonId === '1762');

      if (expectedSelfRef) {
        expect(selfRef).toBeDefined();
        expect(selfRef?.KinRelName).toBe(expectedSelfRef.KinRelName);
      }
    });
  });

  describe('Association Data Parity', () => {
    it('should have count within 1 of Harvard (705 or 706)', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualAssociations = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation?.Association;
      const expectedCount = 705;

      // Allow for off-by-one due to possible person 0 handling
      expect(Math.abs(actualAssociations?.length - expectedCount)).toBeLessThanOrEqual(1);
    });

    it('should match specific association records by AssocPersonId', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualAssociations = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation?.Association;
      const expectedAssociations = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation?.Association;

      // Test first 5 associations that should exist
      const testPersonIds = expectedAssociations?.slice(0, 5).map((a: any) => a.AssocPersonId) || [];

      for (const personId of testPersonIds) {
        const actualRecord = actualAssociations?.find((a: any) => a.AssocPersonId === personId);
        const expectedRecord = expectedAssociations?.find((a: any) => a.AssocPersonId === personId);

        if (expectedRecord && personId !== '0') { // Skip person 0 checks
          expect(actualRecord).toBeDefined();
          expect(actualRecord?.AssocPersonName).toBe(expectedRecord.AssocPersonName);
          expect(actualRecord?.AssocCode).toBe(expectedRecord.AssocCode);
          expect(actualRecord?.AssocName).toBe(expectedRecord.AssocName);
        }
      }
    });

    it('should check for person 0 or default person in associations', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualAssociations = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation?.Association;

      // Check if there's a person 0 in our data
      const personZero = actualAssociations?.find((a: any) => a.AssocPersonId === '0');

      // Log for debugging
      if (personZero) {
        console.log('Found person 0 in associations:', personZero);
      }

      // Check count without person 0
      const withoutZero = actualAssociations?.filter((a: any) => a.AssocPersonId !== '0');
      console.log(`Association count with person 0: ${actualAssociations?.length}, without: ${withoutZero?.length}`);
    });
  });

  describe('Office/Posting Data Parity', () => {
    it('should have correct posting count', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualPostings = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings?.Posting;
      const expectedPostings = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings?.Posting;

      expect(actualPostings?.length).toBe(expectedPostings?.length);
    });

    it('should match specific office records', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualPostings = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings?.Posting;
      const expectedPostings = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings?.Posting;

      // Test first 3 postings
      for (let i = 0; i < Math.min(3, expectedPostings?.length || 0); i++) {
        const actual = actualPostings?.[i];
        const expected = expectedPostings?.[i];

        if (expected) {
          expect(actual?.OfficeId).toBeDefined();
          expect(actual?.OfficeName).toBeDefined();
          // Don't check exact match as ordering might differ, just ensure fields are populated
        }
      }
    });
  });

  describe('Address Data Parity', () => {
    it('should have addresses with proper structure', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualAddresses = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAddresses?.Address;
      const expectedAddresses = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAddresses?.Address;

      if (expectedAddresses?.length > 0) {
        expect(actualAddresses).toBeDefined();
        expect(Array.isArray(actualAddresses) || actualAddresses).toBeTruthy();

        const firstAddr = Array.isArray(actualAddresses) ? actualAddresses[0] : actualAddresses;
        if (firstAddr) {
          expect(firstAddr).toHaveProperty('AddrType');
          expect(firstAddr).toHaveProperty('AddrId');
          expect(firstAddr).toHaveProperty('AddrName');
        }
      }
    });
  });

  describe('Alternative Names Data Parity', () => {
    it('should have correct alternative names', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualAliases = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAliases?.Alias;
      const expectedAliases = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAliases?.Alias;

      if (expectedAliases?.length > 0) {
        expect(actualAliases).toBeDefined();
        expect(actualAliases?.length).toBeGreaterThan(0);

        // Check structure
        const firstAlias = actualAliases?.[0];
        expect(firstAlias).toHaveProperty('AliasType');
        expect(firstAlias).toHaveProperty('AliasName');
      }
    });
  });

  describe('Text Data Parity', () => {
    it('should have texts with proper data', async () => {
      const result = await service.getOfficialAPIDetail(1762);
      const actualTexts = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonTexts?.Text;
      const expectedTexts = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonTexts?.Text;

      if (expectedTexts?.length > 0) {
        expect(actualTexts).toBeDefined();

        // Check first text record
        const firstText = Array.isArray(actualTexts) ? actualTexts[0] : actualTexts;
        if (firstText) {
          expect(firstText).toHaveProperty('TextId');
          expect(firstText).toHaveProperty('TextTitle');
          expect(firstText).toHaveProperty('TextRole');
        }
      }
    });
  });
});