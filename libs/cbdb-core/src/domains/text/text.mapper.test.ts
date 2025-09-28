/**
 * Tests for Text mapper
 * Using examples from SCHEMA_ANNOTATED.md
 */

import { describe, it, expect } from 'vitest';
import { mapBiogTextDataToText, mapBiogTextDataArrayToText } from './text.mapper';
import type { BiogTextDataWithRelations } from '../../schemas/extended/text.extended';

describe('Text Mapper', () => {
  describe('mapBiogTextDataToText', () => {
    it('should map all required and optional fields from BIOG_TEXT_DATA', () => {
      const dbRecord: BiogTextDataWithRelations = {
        // Required fields
        c_personid: 1762, // Wang Anshi
        c_textid: 1234,   // Song Dazhaoling ji
        c_role_id: 1,     // Author

        // Optional fields
        c_year: 1126,
        c_nh_code: 528,
        c_nh_year: 3,
        c_range_code: 0,
        c_source: 7596,
        c_pages: '1536-1540',
        c_notes: 'Complete works collection',
        c_created_by: null,
        c_created_date: null,
        c_modified_by: null,
        c_modified_date: null,

        // Related data from joins
        textCode: {
          c_textid: 1234,
          c_title: 'Song Dazhaoling ji',
          c_title_chn: '宋大詔令集',
          c_text_type_id: '1',
          c_text_year: 1126,
          c_suffix_version: 'v1',
          c_title_trans: 'Collection of Song Imperial Edicts',
          c_text_nh_code: null,
          c_text_nh_year: null,
          c_text_range_code: null,
          c_period: null,
          c_bibl_cat_code: null,
          c_extant: null,
          c_text_country: null,
          c_text_dy: null,
          c_pub_country: null,
          c_pub_dy: null,
          c_pub_year: null,
          c_pub_nh_code: null,
          c_pub_nh_year: null,
          c_pub_range_code: null,
          c_pub_loc: null,
          c_publisher: null,
          c_pub_notes: null,
          c_source: null,
          c_pages: null,
          c_url_api: null,
          c_url_api_coda: null,
          c_url_homepage: null,
          c_notes: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          c_number: null,
          c_counter: null,
          c_title_alt_chn: null
        },
        roleCode: {
          c_role_id: 1,
          c_role_desc: 'author',
          c_role_desc_chn: '撰著者'
        }
      };

      const result = mapBiogTextDataToText(dbRecord);

      // Check primary fields
      expect(result.personId).toBe(1762);
      expect(result.textId).toBe(1234);
      expect(result.roleId).toBe(1);

      // Text and role information removed (flattened fields no longer exist)

      // Check temporal data
      expect(result.year).toBe(1126);
      expect(result.nhCode).toBe(528);
      expect(result.nhYear).toBe(3);
      expect(result.rangeCode).toBe(0);

      // Check source field
      expect(result.source).toBe(7596);
      expect(result.pages).toBe('1536-1540');
      expect(result.notes).toBe('Complete works collection');
    });

    it('should handle null values correctly', () => {
      const minimalRecord: BiogTextDataWithRelations = {
        c_personid: 1762,
        c_textid: 1234,
        c_role_id: 1,

        // All optional fields null
        c_year: null,
        c_nh_code: null,
        c_nh_year: null,
        c_range_code: null,
        c_source: null,
        c_pages: null,
        c_notes: null,
        c_created_by: null,
        c_created_date: null,
        c_modified_by: null,
        c_modified_date: null
      };

      const result = mapBiogTextDataToText(minimalRecord);

      expect(result.personId).toBe(1762);
      expect(result.textId).toBe(1234);
      expect(result.roleId).toBe(1);
      expect(result.year).toBeNull();
      expect(result.notes).toBeNull();
      // Text and role name fields removed (flattened fields no longer exist)
    });

    it('should map common text roles from SCHEMA_ANNOTATED.md', () => {
      const testCases = [
        { roleId: 1, desc: 'author', descChn: '撰著者' },
        { roleId: 2, desc: 'editor', descChn: '編輯者' },
        { roleId: 3, desc: 'compiler', descChn: '編纂者' },
        { roleId: 4, desc: 'translator', descChn: '譯者' }
      ];

      testCases.forEach(testCase => {
        const record: BiogTextDataWithRelations = {
          c_personid: 1,
          c_textid: 100,
          c_role_id: testCase.roleId,
          c_year: null,
          c_nh_code: null,
          c_nh_year: null,
          c_range_code: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null,
          roleCode: {
            c_role_id: testCase.roleId,
            c_role_desc: testCase.desc,
            c_role_desc_chn: testCase.descChn
          }
        };

        const result = mapBiogTextDataToText(record);
        expect(result.roleId).toBe(testCase.roleId);
        // Role name fields removed (flattened fields no longer exist)
      });
    });
  });

  describe('mapBiogTextDataArrayToText', () => {
    it('should map array of records', () => {
      const records: BiogTextDataWithRelations[] = [
        {
          c_personid: 1,
          c_textid: 100,
          c_role_id: 1,
          c_year: null,
          c_nh_code: null,
          c_nh_year: null,
          c_range_code: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null
        },
        {
          c_personid: 1,
          c_textid: 200,
          c_role_id: 2,
          c_year: null,
          c_nh_code: null,
          c_nh_year: null,
          c_range_code: null,
          c_source: null,
          c_pages: null,
          c_notes: null,
          c_created_by: null,
          c_created_date: null,
          c_modified_by: null,
          c_modified_date: null
        }
      ];

      const results = mapBiogTextDataArrayToText(records);

      expect(results).toHaveLength(2);
      expect(results[0].textId).toBe(100);
      expect(results[0].roleId).toBe(1);
      expect(results[1].textId).toBe(200);
      expect(results[1].roleId).toBe(2);
    });

    it('should handle empty array', () => {
      const results = mapBiogTextDataArrayToText([]);
      expect(results).toEqual([]);
    });
  });
});