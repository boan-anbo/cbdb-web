import { describe, it, expect } from 'vitest';
import { personMapper } from './person.mapper';
import { PersonDenormExtraDataView } from './views/person-denorm-extra.data-view';

describe('PersonMapper Simple', () => {
  it('should create PersonModel with trivial joins', () => {
    const biogMain: any = {
      c_personid: 1,
      c_name: 'Test',
      c_name_chn: '测试',
      c_birthyear: 1000,
      c_deathyear: 1050,
      c_dy: 15,
      c_female: 0,
      c_self_bio: 0
    };

    const denormData: Partial<PersonDenormExtraDataView> = {
      dynastyName: 'Song',
      dynastyNameChn: '宋'
    };

    const model = personMapper.toModel(biogMain, denormData as PersonDenormExtraDataView);

    console.log('Model dynasty fields:', {
      dynastyCode: model.dynastyCode,
      dynastyName: model.dynastyName,
      dynastyNameChn: model.dynastyNameChn
    });

    expect(model.id).toBe(1);
    expect(model.dynastyCode).toBe(15);
    expect(model.dynastyName).toBe('Song');
    expect(model.dynastyNameChn).toBe('宋');
  });
});