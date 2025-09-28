import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { PersonDetailService } from './person-detail.service';

describe('Debug Kinship Mapping', () => {
  let module: TestingModule;
  let service: PersonDetailService;

  beforeEach(async () => {
    module = await getTestModule();
    service = module.get<PersonDetailService>(PersonDetailService);
  });

  afterEach(async () => {
    await cleanupTestModule(module);
  });

  it('should debug kinship data for Wang Anshi', async () => {
    // Get the raw PersonDetailResult first
    const detail = await service.getPersonDetail(1762);

    console.log('\n=== Raw PersonDetail Kinships ===');
    if (detail?.kinships && detail.kinships.length > 0) {
      console.log(`Total kinships: ${detail.kinships.length}`);
      console.log('First 5 kinships:');
      detail.kinships.slice(0, 5).forEach((k, i) => {
        console.log(`[${i}]:`, {
          kinPersonId: k.kinPersonId,
          kinPersonName: k.kinPersonName || k.kinPerson?.nameChn,
          kinshipCode: k.kinshipCode,
          kinshipType: k.kinshipType
        });
      });
    } else {
      console.log('No kinships found in PersonDetailResult');
    }

    // Now get the Harvard API format
    const harvardResult = await service.getOfficialAPIDetail(1762);
    const harvardKinships = harvardResult?.Package?.PersonAuthority?.PersonInfo?.Person?.PersonKinshipInfo?.Kinship;

    console.log('\n=== Harvard API Kinships ===');
    if (harvardKinships && harvardKinships.length > 0) {
      console.log(`Total kinships: ${harvardKinships.length}`);
      console.log('First 5 kinships:');
      harvardKinships.slice(0, 5).forEach((k, i) => {
        console.log(`[${i}]:`, {
          KinPersonId: k.KinPersonId,
          KinPersonName: k.KinPersonName,
          KinCode: k.KinCode,
          KinRelName: k.KinRelName
        });
      });
    } else {
      console.log('No kinships in Harvard format');
    }

    // Check what fields are available on the first kinship
    if (detail?.kinships?.[0]) {
      console.log('\n=== All fields on first kinship ===');
      console.log(JSON.stringify(detail.kinships[0], null, 2));
    }

    // Just pass to see console output
    expect(true).toBe(true);
  });
});