import { describe, it, expect } from 'vitest';
import { personMapper } from './person.mapper';

/**
 * Tests for PersonMapper - Verifies the mapper correctly creates models
 */
describe('PersonMapper', () => {
  describe('toTableModel', () => {
    it('should map BIOG_MAIN record to PersonTableModel', () => {
      const biogMainRecord: any = {
        c_personid: 1762,
        c_name: 'Wang Anshi',
        c_name_chn: '王安石',
        c_surname: 'Wang',
        c_surname_chn: '王',
        c_mingzi: 'Anshi',
        c_female: 0,
        c_birthyear: 1021,
        c_by_nh_code: 1234,
        c_by_intercalary: 0,
        c_by_month: 12,
        c_by_day: 18,
        c_by_day_gz: 5,
        c_by_range: 1,
        c_deathyear: 1086,
        c_dy_nh_code: 5678,
        c_dy_intercalary: 0,
        c_dy_month: 4,
        c_dy_day: 6,
        c_dy_day_gz: 10,
        c_dy_range: 1,
        c_index_year: 1070,
        c_iy_type: 'R',
        c_fl_year: null,
        c_fl_nh_code: null,
        c_fl_latest_year: null,
        c_fl_latest_nh_code: null,
        c_dy: 15,
        c_ethnicity_code: 1,
        c_choronym_code: 100,
        c_household_status_code: 3,
        c_index_addr_id: 200,
        c_index_addr_type: 10,
        c_english_name: 'Wang Anshi',
        c_note: 'Reformer',
        c_self_bio: 1
      };

      const model = personMapper.toTableModel(biogMainRecord);

      // Verify key fields
      expect(model.id).toBe(1762);
      expect(model.name).toBe('Wang Anshi');
      expect(model.nameChn).toBe('王安石');
      expect(model.birthYear).toBe(1021);
      expect(model.deathYear).toBe(1086);
      expect(model.dynastyCode).toBe(15);
      expect(model.female).toBe(0);
      expect(model.ethnicityCode).toBe(1);
      expect(model.choronymCode).toBe(100);
      expect(model.selfBio).toBe(1);

      // Should NOT have trivial join fields
      expect('dynastyName' in model).toBe(false);
      expect('dynastyNameChn' in model).toBe(false);
    });

    it('should handle null values correctly', () => {
      const biogMainRecord: any = {
        c_personid: 9999,
        c_name: null,
        c_name_chn: '無名氏',
        c_surname: null,
        c_surname_chn: null,
        c_mingzi: null,
        c_female: 0,
        c_birthyear: null,
        c_by_nh_code: null,
        c_by_intercalary: 0,
        c_by_month: null,
        c_by_day: null,
        c_by_day_gz: null,
        c_by_range: null,
        c_deathyear: null,
        c_dy_nh_code: null,
        c_dy_intercalary: 0,
        c_dy_month: null,
        c_dy_day: null,
        c_dy_day_gz: null,
        c_dy_range: null,
        c_index_year: null,
        c_iy_type: null,
        c_fl_year: null,
        c_fl_nh_code: null,
        c_fl_latest_year: null,
        c_fl_latest_nh_code: null,
        c_dy: null,
        c_ethnicity_code: null,
        c_choronym_code: null,
        c_household_status_code: null,
        c_index_addr_id: null,
        c_index_addr_type: null,
        c_english_name: null,
        c_note: null,
        c_self_bio: 0
      };

      const model = personMapper.toTableModel(biogMainRecord);

      expect(model.id).toBe(9999);
      expect(model.name).toBeNull();
      expect(model.nameChn).toBe('無名氏');
      expect(model.birthYear).toBeNull();
      expect(model.deathYear).toBeNull();
      expect(model.dynastyCode).toBeNull();
    });
  });

  describe('toModel', () => {
    it('should map BIOG_MAIN record with trivial joins to PersonModel', () => {
      const biogMainRecord: any = {
        c_personid: 1762,
        c_name: 'Wang Anshi',
        c_name_chn: '王安石',
        c_surname: 'Wang',
        c_surname_chn: '王',
        c_mingzi: 'Anshi',
        c_female: 0,
        c_birthyear: 1021,
        c_by_nh_code: 1234,
        c_by_intercalary: 0,
        c_by_month: 12,
        c_by_day: 18,
        c_by_day_gz: 5,
        c_by_range: 1,
        c_deathyear: 1086,
        c_dy_nh_code: 5678,
        c_dy_intercalary: 0,
        c_dy_month: 4,
        c_dy_day: 6,
        c_dy_day_gz: 10,
        c_dy_range: 1,
        c_index_year: 1070,
        c_iy_type: 'R',
        c_fl_year: null,
        c_fl_nh_code: null,
        c_fl_latest_year: null,
        c_fl_latest_nh_code: null,
        c_dy: 15,
        c_ethnicity_code: 1,
        c_choronym_code: 100,
        c_household_status_code: 3,
        c_index_addr_id: 200,
        c_index_addr_type: 10,
        c_english_name: 'Wang Anshi',
        c_note: 'Reformer',
        c_self_bio: 1
      };

      // Trivial join records (would come from database joins)
      const dynasty: any = { c_dynasty_chn: '宋', c_dynasty: 'Song' };
      const birthNianHao: any = { c_nianhao_chn: '天禧', c_nianhao: 'Tianxi' };
      const deathNianHao: any = { c_nianhao_chn: '元祐', c_nianhao: 'Yuanyou' };
      const ethnicity: any = { c_name: 'Han' };
      const choronym: any = { c_name: 'Linchuan', c_name_chn: '臨川' };
      const householdStatus: any = { c_household_status_desc: 'Regular', c_household_status_desc_chn: '正戶' };

      // First create denormalized data view from the joined records
      const denormData = personMapper.toDenormExtraDataView({
        person: biogMainRecord,
        dynasty,
        birthNh: birthNianHao,
        deathNh: deathNianHao,
        flourishedStartNh: null,
        flourishedEndNh: null,
        ethnicity,
        choronym,
        householdStatus,
        indexYearType: null,
        indexAddrType: null,
        birthYearRange: null,
        deathYearRange: null,
        birthYearDayGanzhi: null,
        deathYearDayGanzhi: null,
        indexAddr: null
      });

      // Then create the model using the denorm data
      const model = personMapper.toModel(biogMainRecord, denormData);

      // Verify TableModel fields exist
      expect(model.id).toBe(1762);
      expect(model.name).toBe('Wang Anshi');
      expect(model.nameChn).toBe('王安石');
      expect(model.birthYear).toBe(1021);
      expect(model.deathYear).toBe(1086);
      expect(model.dynastyCode).toBe(15);

      // Verify trivial join fields exist
      expect(model.dynastyNameChn).toBe('宋');
      expect(model.dynastyName).toBe('Song');

      // Should NOT have extended model fields
      expect('kinships' in model).toBe(false);
      expect('addresses' in model).toBe(false);
      expect('offices' in model).toBe(false);
    });
  });
});