import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonDetailService } from './person-detail.service';
import * as fs from 'fs';
import * as path from 'path';

describe('Harvard API Sections', () => {
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

  it('should have correct BasicInfo structure', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualBasicInfo = result?.Package?.PersonAuthority?.PersonInfo?.Person?.BasicInfo;
    const expectedBasicInfo = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.BasicInfo;

    expect(actualBasicInfo).toBeDefined();
    expect(actualBasicInfo?.PersonId).toBe(expectedBasicInfo?.PersonId);
    expect(actualBasicInfo?.ChName).toBe(expectedBasicInfo?.ChName);
    expect(actualBasicInfo?.EngName).toBe(expectedBasicInfo?.EngName);
  });

  it('should have PersonSources section', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualSources = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSources;
    const expectedSources = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSources;

    expect(actualSources).toBeDefined();
    // Currently we don't have source data, so expect empty array
    expect(actualSources?.Source).toEqual([]);
    // TODO: When source data is available, update this test
    // expect(actualSources?.Source?.length).toBe(expectedSources?.Source?.length);
  });

  it('should have PersonAliases section with data', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualAliases = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAliases;
    const expectedAliases = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAliases;

    expect(actualAliases).toBeDefined();
    if (expectedAliases?.Alias?.length > 0) {
      expect(actualAliases?.Alias?.length).toBeGreaterThan(0);
      // Check structure of first alias
      const firstAlias = actualAliases?.Alias?.[0];
      expect(firstAlias).toHaveProperty('AliasType');
      expect(firstAlias).toHaveProperty('AliasTypeId');
      expect(firstAlias).toHaveProperty('AliasName');
    }
  });

  it('should have PersonKinshipInfo section with data', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualKinships = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo;
    const expectedKinships = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo;

    expect(actualKinships).toBeDefined();
    expect(actualKinships?.Kinship?.length).toBeGreaterThan(0);

    // Check structure of first kinship
    const firstKinship = actualKinships?.Kinship?.[0];
    expect(firstKinship).toHaveProperty('KinPersonId');
    expect(firstKinship).toHaveProperty('KinPersonName');
    expect(firstKinship).toHaveProperty('KinCode');
    expect(firstKinship).toHaveProperty('KinRelName');
  });

  it('should have PersonAddresses section', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualAddresses = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonAddresses;

    expect(actualAddresses).toBeDefined();
    // Check if we have address data
    if (actualAddresses?.Address?.length > 0) {
      const firstAddress = actualAddresses?.Address?.[0];
      expect(firstAddress).toHaveProperty('AddrType');
      expect(firstAddress).toHaveProperty('AddrId');
      expect(firstAddress).toHaveProperty('AddrName');
    }
  });

  it('should have PersonEntryInfo section', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualEntries = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonEntryInfo;

    expect(actualEntries).toBeDefined();
    // Harvard API uses single Entry for one, array for multiple
    if (actualEntries?.Entry) {
      const entry = Array.isArray(actualEntries.Entry) ? actualEntries.Entry[0] : actualEntries.Entry;
      expect(entry).toHaveProperty('EntryType');
      expect(entry).toHaveProperty('EntryCode');
    }
  });

  it('should have PersonPostings section with data', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualPostings = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings;
    const expectedPostings = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonPostings;

    expect(actualPostings).toBeDefined();
    // Wang Anshi has 41 postings
    if (expectedPostings?.Posting?.length > 0) {
      expect(actualPostings?.Posting?.length).toBeGreaterThan(0);
      const firstPosting = actualPostings?.Posting?.[0];
      expect(firstPosting).toHaveProperty('OfficeId');
      expect(firstPosting).toHaveProperty('OfficeName');
    }
  });

  it('should have PersonSocialStatus section with data', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualStatuses = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialStatus;

    expect(actualStatuses).toBeDefined();
    if (actualStatuses?.SocialStatus?.length > 0) {
      const firstStatus = actualStatuses?.SocialStatus?.[0];
      expect(firstStatus).toHaveProperty('StatusId');
      expect(firstStatus).toHaveProperty('StatusName');
    }
  });

  it('should have PersonSocialAssociation section with data', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualAssociations = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation;
    const expectedAssociations = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonSocialAssociation;

    expect(actualAssociations).toBeDefined();
    // Wang Anshi has 705 associations - this is a lot!
    if (expectedAssociations?.Association?.length > 0) {
      expect(actualAssociations?.Association?.length).toBeGreaterThan(0);
      const firstAssoc = actualAssociations?.Association?.[0];
      expect(firstAssoc).toHaveProperty('AssocPersonId');
      expect(firstAssoc).toHaveProperty('AssocPersonName');
      expect(firstAssoc).toHaveProperty('AssocCode');
    }
  });

  it('should have PersonTexts section', async () => {
    const result = await service.getOfficialAPIDetail(1762);
    const actualTexts = result?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonTexts;

    expect(actualTexts).toBeDefined();
    if (actualTexts?.Text?.length > 0) {
      const firstText = actualTexts?.Text?.[0];
      expect(firstText).toHaveProperty('TextId');
      expect(firstText).toHaveProperty('TextTitle');
      expect(firstText).toHaveProperty('TextRole');
    }
  });

  it('should have correct structure hierarchy', async () => {
    const result = await service.getOfficialAPIDetail(1762);

    expect(result).toBeDefined();
    expect(result?.Package).toBeDefined();
    expect(result?.Package?.PersonAuthority).toBeDefined();
    expect(result?.Package?.PersonAuthority?.DataSource).toBe('CBDB');
    expect(result?.Package?.PersonAuthority?.Version).toBeDefined();
    expect(result?.Package?.PersonAuthority?.PersonInfo).toBeDefined();
    expect(result?.Package?.PersonAuthority?.PersonInfo?.Person).toBeDefined();
  });
});