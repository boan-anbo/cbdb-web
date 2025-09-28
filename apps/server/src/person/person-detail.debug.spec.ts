import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonDetailService } from './person-detail.service';
import * as fs from 'fs';
import * as path from 'path';

describe('Debug Harvard API', () => {
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

  it('should debug BasicInfo output', async () => {
    const result = await service.getOfficialAPIDetail(1762);

    const actualBasicInfo = result?.Package?.PersonAuthority?.PersonInfo?.Person?.BasicInfo;
    const expectedBasicInfo = expected?.Package?.PersonAuthority?.PersonInfo?.Person?.BasicInfo;

    console.log('\n=== BasicInfo Comparison ===');
    console.log('PersonId:', `Expected="${expectedBasicInfo?.PersonId}", Actual="${actualBasicInfo?.PersonId}"`);
    console.log('EngName:', `Expected="${expectedBasicInfo?.EngName}", Actual="${actualBasicInfo?.EngName}"`);
    console.log('ChName:', `Expected="${expectedBasicInfo?.ChName}", Actual="${actualBasicInfo?.ChName}"`);
    console.log('IndexYear:', `Expected="${expectedBasicInfo?.IndexYear}", Actual="${actualBasicInfo?.IndexYear}"`);
    console.log('IndexAddr:', `Expected="${expectedBasicInfo?.IndexAddr}", Actual="${actualBasicInfo?.IndexAddr}"`);
    console.log('Gender:', `Expected="${expectedBasicInfo?.Gender}", Actual="${actualBasicInfo?.Gender}"`);
    console.log('YearBirth:', `Expected="${expectedBasicInfo?.YearBirth}", Actual="${actualBasicInfo?.YearBirth}"`);
    console.log('DynastyBirth:', `Expected="${expectedBasicInfo?.DynastyBirth}", Actual="${actualBasicInfo?.DynastyBirth}"`);
    console.log('EraBirth:', `Expected="${expectedBasicInfo?.EraBirth}", Actual="${actualBasicInfo?.EraBirth}"`);
    console.log('YearDeath:', `Expected="${expectedBasicInfo?.YearDeath}", Actual="${actualBasicInfo?.YearDeath}"`);
    console.log('DynastyDeath:', `Expected="${expectedBasicInfo?.DynastyDeath}", Actual="${actualBasicInfo?.DynastyDeath}"`);
    console.log('EraDeath:', `Expected="${expectedBasicInfo?.EraDeath}", Actual="${actualBasicInfo?.EraDeath}"`);
    console.log('YearsLived:', `Expected="${expectedBasicInfo?.YearsLived}", Actual="${actualBasicInfo?.YearsLived}"`);
    console.log('Dynasty:', `Expected="${expectedBasicInfo?.Dynasty}", Actual="${actualBasicInfo?.Dynasty}"`);
    console.log('JunWang:', `Expected="${expectedBasicInfo?.JunWang}", Actual="${actualBasicInfo?.JunWang}"`);

    // Check what sections we have
    console.log('\n=== Section Presence ===');
    const sections = [
      'BasicInfo',
      'PersonSources',
      'PersonAliases',
      'PersonAddresses',
      'PersonEntryInfo',
      'PersonKinshipInfo',
      'PersonPostings',
      'PersonSocialStatus',
      'PersonSocialAssociation',
      'PersonTexts'
    ];

    const actualPerson = result?.Package?.PersonAuthority?.PersonInfo?.Person;
    const expectedPerson = expected?.Package?.PersonAuthority?.PersonInfo?.Person;

    sections.forEach(section => {
      const hasExpected = !!expectedPerson?.[section];
      const hasActual = !!actualPerson?.[section];

      if (hasExpected && hasActual) {
        console.log(`✓ ${section}: Present in both`);
      } else if (hasExpected && !hasActual) {
        console.log(`✗ ${section}: Missing in actual`);
      } else if (!hasExpected && hasActual) {
        console.log(`? ${section}: Extra in actual`);
      }
    });

    // Check kinships
    const actualKinships = actualPerson?.PersonKinshipInfo?.Kinship;
    const expectedKinships = expectedPerson?.PersonKinshipInfo?.Kinship;
    console.log('\n=== Kinships ===');
    console.log(`Expected count: ${expectedKinships?.length || 0}`);
    console.log(`Actual count: ${actualKinships?.length || 0}`);

    if (expectedKinships?.length > 0 && actualKinships?.length > 0) {
      console.log('First kinship comparison:');
      console.log('Expected:', JSON.stringify(expectedKinships[0], null, 2));
      console.log('Actual:', JSON.stringify(actualKinships[0], null, 2));
    }

    // Always pass to see console output
    expect(true).toBe(true);
  });
});