import { describe, it } from 'vitest';
import { personMapper } from './person.mapper';
import { PersonModel } from './models/person.model';
import { PersonDenormExtraDataView } from './views/person-denorm-extra.data-view';

describe('PersonMapper Debug', () => {
  it('should count constructor parameters', () => {
    // Count the number of parameters by checking constructor length
    const PersonModelConstructor = PersonModel;
    console.log('PersonModel expects parameters:', PersonModelConstructor.length);

    // Create a mock record with minimal data
    const record: any = {
      c_personid: 1,
      c_name: 'Test',
      c_name_chn: '测试',
      c_dy: 15,
      c_female: 0,
      c_birthyear: 1000,
      c_deathyear: 1050,
      c_self_bio: 0
    };

    // Try to create with mapper
    const dynasty: Partial<PersonDenormExtraDataView> = {
      dynastyName: 'Song',
      dynastyNameChn: '宋'
    };

    try {
      const model = personMapper.toModel(record, dynasty as PersonDenormExtraDataView);

      // Check specific fields
      console.log('Result:', {
        id: model.id,
        name: model.name,
        dynastyCode: model.dynastyCode,
        dynastyName: model.dynastyName,
        dynastyNameChn: model.dynastyNameChn
      });

      // Try to find where dynasty fields actually end up
      const modelRecord = model as unknown as Record<string, unknown>;
      const keys = Object.keys(modelRecord);
      console.log('Total properties on model:', keys.length);

      // Find properties with Song/宋 values
      for (const key of keys) {
        if (modelRecord[key] === 'Song' || modelRecord[key] === '宋') {
          console.log(`Found dynasty value at: ${key} = ${modelRecord[key]}`);
        }
      }

    } catch (error) {
      console.error('Error creating model:', error);
    }
  });
});