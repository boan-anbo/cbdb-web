/**
 * Tests for Association mapper
 * Using examples from SCHEMA_ANNOTATED.md
 */

import { describe, it, expect } from 'vitest';
import { mapAssocDataToAssociation, mapAssocDataArrayToAssociation } from './association.mapper';
import type { AssociationDataWithRelations } from '../../schemas/extended/association.extended';

describe('Association Mapper', () => {
  describe('mapAssocDataToAssociation', () => {
    it('should map all required fields from ASSOC_DATA', () => {
      // Test data based on SCHEMA_ANNOTATED.md common examples
      const dbRecord: AssociationDataWithRelations = {
        // Required fields
        c_personid: 1762, // Wang Anshi
        c_assoc_id: 77,   // Associated person
        c_assoc_code: 437, // 贈詩、文 sent poems/writings (most common type)
        c_kin_code: 0,
        c_kin_id: 0,
        c_assoc_kin_code: 0,
        c_assoc_kin_id: 0,
        c_assoc_first_year: 1050,
        c_assoc_fy_intercalary: '0',
        c_assoc_ly_intercalary: '0',

        // Optional fields
        c_assoc_last_year: 1060,
        c_tertiary_personid: null,
        c_tertiary_type_notes: null,
        c_assoc_count: 1,
        c_sequence: 1,
        c_source: 7596,
        c_pages: '1536',
        c_notes: '贈詩給陳升之',
        c_created_by: null,
        c_created_date: null,
        c_modified_by: null,
        c_modified_date: null,
        c_assoc_fy_nh_code: 528,
        c_assoc_fy_nh_year: 3,
        c_assoc_fy_range: 0,
        c_assoc_fy_month: 3,
        c_assoc_fy_day: 15,
        c_assoc_fy_day_gz: null,
        c_assoc_ly_nh_code: null,
        c_assoc_ly_nh_year: null,
        c_assoc_ly_range: null,
        c_assoc_ly_month: null,
        c_assoc_ly_day: null,
        c_assoc_ly_day_gz: null,
        c_text_title: '臨川先生文集',
        c_addr_id: 100513,
        c_litgenre_code: null,
        c_occasion_code: null,
        c_topic_code: null,
        c_inst_code: null,
        c_inst_name_code: null,
        c_assoc_claimer_id: null,

        // Related data (from joins)
        assocCode: {
          c_assoc_code: 437,
          c_assoc_desc: 'sent poems/writings to Y',
          c_assoc_desc_chn: '贈詩、文給Y',
          c_assoc_pair: null,
          c_assoc_pair2: null,
          c_assoc_role_type: null,
          c_sortorder: null,
          c_example: null
        },
        assocPerson: {
          c_personid: 77,
          c_name: 'Chen Shengzhi',
          c_name_chn: '陳升之',
          c_surname: 'Chen',
          c_surname_chn: '陳',
          c_mingzi: 'Shengzhi',
          c_mingzi_chn: '升之',
          c_index_year: 1011,
          c_birthyear: 1011,
          c_deathyear: 1091,
          c_female: '0',
          c_dy: 15,
          c_by_intercalary: '0',
          c_dy_intercalary: '0',
          c_index_addr_id: null,
          c_index_year_type_code: null,
          c_index_year_source_id: null,
          c_index_addr_type_code: null,
          c_ethnicity_code: null,
          c_household_status_code: null,
          c_tribe: null,
          c_by_nh_code: null,
          c_by_nh_year: null,
          c_by_range: null,
          c_dy_nh_code: null,
          c_dy_nh_year: null,
          c_dy_range: null,
          c_death_age: null,
          c_death_age_range: null,
          c_fl_earliest_year: null,
          c_fl_ey_nh_code: null,
          c_fl_ey_nh_year: null,
          c_fl_ey_notes: null,
          c_fl_latest_year: null,
          c_fl_ly_nh_code: null,
          c_fl_ly_nh_year: null,
          c_fl_ly_notes: null,
          c_choronym_code: null,
          c_notes: null,
          c_by_month: null,
          c_dy_month: null,
          c_by_day: null,
          c_dy_day: null,
          c_by_day_gz: null,
          c_dy_day_gz: null,
          c_surname_proper: null,
          c_mingzi_proper: null,
          c_name_proper: null,
          c_surname_rm: null,
          c_mingzi_rm: null,
          c_name_rm: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          c_self_bio: '0'
        },
        addrCode: {
          c_addr_id: 100513,
          c_name: 'Linchuan',
          c_name_chn: '臨川',
          c_firstyear: null,
          c_lastyear: null,
          c_admin_type: null,
          x_coord: null,
          y_coord: null,
          CHGIS_PT_ID: null,
          c_notes: null,
          c_alt_names: null
        }
      };

      const result = mapAssocDataToAssociation(dbRecord);

      // Check primary fields
      expect(result.personId).toBe(1762);
      expect(result.assocId).toBe(77);
      expect(result.assocCode).toBe(437);

      // Check that related data is NOT mapped (flattened fields removed)
      expect(result.assocPersonId).toBe(77);

      // Check temporal data
      expect(result.firstYear).toBe(1050);
      expect(result.lastYear).toBe(1060);

      // Check text and notes
      expect(result.textTitle).toBe('臨川先生文集');
      expect(result.notes).toBe('贈詩給陳升之');

      // Check address ID only (flattened fields removed)
      expect(result.addrId).toBe(100513);
    });

    it('should handle null values correctly', () => {
      const minimalRecord: AssociationDataWithRelations = {
        c_personid: 1762,
        c_assoc_id: 77,
        c_assoc_code: 9, // Friend
        c_kin_code: 0,
        c_kin_id: 0,
        c_assoc_kin_code: 0,
        c_assoc_kin_id: 0,
        c_assoc_first_year: 1050,
        c_assoc_fy_intercalary: '0',
        c_assoc_ly_intercalary: '0',
        c_created_by: null,
        c_created_date: null,
        c_modified_by: null,
        c_modified_date: null,

        // All optional fields null
        c_assoc_last_year: null,
        c_tertiary_personid: null,
        c_tertiary_type_notes: null,
        c_assoc_count: null,
        c_sequence: null,
        c_source: null,
        c_pages: null,
        c_notes: null,
        c_assoc_fy_nh_code: null,
        c_assoc_fy_nh_year: null,
        c_assoc_fy_range: null,
        c_assoc_fy_month: null,
        c_assoc_fy_day: null,
        c_assoc_fy_day_gz: null,
        c_assoc_ly_nh_code: null,
        c_assoc_ly_nh_year: null,
        c_assoc_ly_range: null,
        c_assoc_ly_month: null,
        c_assoc_ly_day: null,
        c_assoc_ly_day_gz: null,
        c_text_title: '',
        c_addr_id: null,
        c_litgenre_code: null,
        c_occasion_code: null,
        c_topic_code: null,
        c_inst_code: null,
        c_inst_name_code: null,
        c_assoc_claimer_id: null
      };

      const result = mapAssocDataToAssociation(minimalRecord);

      expect(result.personId).toBe(1762);
      expect(result.assocId).toBe(77);
      expect(result.assocCode).toBe(9);
      expect(result.lastYear).toBeNull();
      expect(result.notes).toBeNull();
      expect(result.textTitle).toBeNull();
    });

    it('should map common association types from SCHEMA_ANNOTATED.md', () => {
      const testCases = [
        { code: 437, desc: 'sent poems/writings', descChn: '贈詩、文' },
        { code: 429, desc: 'sent letter to Y', descChn: '致書Y' },
        { code: 43, desc: 'epitaph by Y', descChn: '墓誌銘由Y所作' },
        { code: 9, desc: 'friend', descChn: '友' }
      ];

      testCases.forEach(testCase => {
        const record: AssociationDataWithRelations = {
          c_personid: 1,
          c_assoc_id: 2,
          c_assoc_code: testCase.code,
          c_kin_code: 0,
          c_kin_id: 0,
          c_assoc_kin_code: 0,
          c_assoc_kin_id: 0,
          c_assoc_first_year: 1050,
          c_assoc_fy_intercalary: '0',
          c_assoc_ly_intercalary: '0',
          c_assoc_last_year: null,
          c_tertiary_personid: null,
          c_tertiary_type_notes: null,
          c_assoc_count: null,
          c_sequence: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_assoc_fy_nh_code: null,
          c_assoc_fy_nh_year: null,
          c_assoc_fy_range: null,
          c_assoc_fy_month: null,
          c_assoc_fy_day: null,
          c_assoc_fy_day_gz: null,
          c_assoc_ly_nh_code: null,
          c_assoc_ly_nh_year: null,
          c_assoc_ly_range: null,
          c_assoc_ly_month: null,
          c_assoc_ly_day: null,
          c_assoc_ly_day_gz: null,
          c_text_title: '',
          c_addr_id: null,
          assocCode: {
            c_assoc_code: testCase.code,
            c_assoc_desc: testCase.desc,
            c_assoc_desc_chn: testCase.descChn,
            c_assoc_pair: null,
            c_assoc_pair2: null,
            c_assoc_role_type: null,
            c_sortorder: null,
            c_example: null
          },
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          
          
          
          
          
          c_litgenre_code: null,
          c_occasion_code: null,
          c_topic_code: null,
          c_inst_code: null,
          c_inst_name_code: null,
          c_assoc_claimer_id: null
        };

        const result = mapAssocDataToAssociation(record);
        expect(result.assocCode).toBe(testCase.code);
        // Flattened fields removed - only checking code
      });
    });
  });

  describe('mapAssocDataArrayToAssociation', () => {
    it('should map array of records', () => {
      const records: AssociationDataWithRelations[] = [
        {
          c_personid: 1,
          c_assoc_id: 2,
          c_assoc_code: 437,
          c_kin_code: 0,
          c_kin_id: 0,
          c_assoc_kin_code: 0,
          c_assoc_kin_id: 0,
          c_assoc_first_year: 1050,
          c_assoc_fy_intercalary: '0',
          c_assoc_ly_intercalary: '0',
          c_assoc_last_year: null,
          c_tertiary_personid: null,
          c_tertiary_type_notes: null,
          c_assoc_count: null,
          c_sequence: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_assoc_fy_nh_code: null,
          c_assoc_fy_nh_year: null,
          c_assoc_fy_range: null,
          c_assoc_fy_month: null,
          c_assoc_fy_day: null,
          c_assoc_fy_day_gz: null,
          c_assoc_ly_nh_code: null,
          c_assoc_ly_nh_year: null,
          c_assoc_ly_range: null,
          c_assoc_ly_month: null,
          c_assoc_ly_day: null,
          c_assoc_ly_day_gz: null,
          c_text_title: '',
          c_addr_id: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          
          
          
          
          
          c_litgenre_code: null,
          c_occasion_code: null,
          c_topic_code: null,
          c_inst_code: null,
          c_inst_name_code: null,
          c_assoc_claimer_id: null
        },
        {
          c_personid: 1,
          c_assoc_id: 3,
          c_assoc_code: 429,
          c_kin_code: 0,
          c_kin_id: 0,
          c_assoc_kin_code: 0,
          c_assoc_kin_id: 0,
          c_assoc_first_year: 1051,
          c_assoc_fy_intercalary: '0',
          c_assoc_ly_intercalary: '0',
          c_assoc_last_year: null,
          c_tertiary_personid: null,
          c_tertiary_type_notes: null,
          c_assoc_count: null,
          c_sequence: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_assoc_fy_nh_code: null,
          c_assoc_fy_nh_year: null,
          c_assoc_fy_range: null,
          c_assoc_fy_month: null,
          c_assoc_fy_day: null,
          c_assoc_fy_day_gz: null,
          c_assoc_ly_nh_code: null,
          c_assoc_ly_nh_year: null,
          c_assoc_ly_range: null,
          c_assoc_ly_month: null,
          c_assoc_ly_day: null,
          c_assoc_ly_day_gz: null,
          c_text_title: '',
          c_addr_id: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          
          
          
          
          
          c_litgenre_code: null,
          c_occasion_code: null,
          c_topic_code: null,
          c_inst_code: null,
          c_inst_name_code: null,
          c_assoc_claimer_id: null
        }
      ];

      const results = mapAssocDataArrayToAssociation(records);

      expect(results).toHaveLength(2);
      expect(results[0].assocCode).toBe(437);
      expect(results[1].assocCode).toBe(429);
      expect(results[0].firstYear).toBe(1050);
      expect(results[1].firstYear).toBe(1051);
    });

    it('should handle empty array', () => {
      const results = mapAssocDataArrayToAssociation([]);
      expect(results).toEqual([]);
    });
  });
});