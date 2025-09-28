/**
 * Mapper for ASSOC_DATA database records to Association domain model
 * Field mappings based on SCHEMA_ANNOTATED.md documentation
 */

import type { AssociationDataWithRelations } from '../../schemas/extended/association.extended';
import { AssociationModel } from './models/association.model';
import { AssociationFullExtendedModel } from './models/association.model.extended';
import { AssociationTableModel } from './models/association.model.table';
import { AssociationTimelineDataView } from './models/association.dataview';

/**
 * Type definition for SQL query result from getWithFullRelations
 * This ensures type safety and catches field name mismatches at compile time
 */
export interface AssociationSqlFlatResult {
  // ASSOC_DATA fields
  c_personid: number;
  c_assoc_id: number;
  c_assoc_code: number;
  c_kin_code?: number | null;
  c_kin_id?: number | null;
  c_assoc_kin_code?: number | null;
  c_assoc_kin_id?: number | null;
  c_tertiary_personid?: number | null;
  c_tertiary_type_notes?: string | null;
  c_assoc_count?: number | null;
  c_sequence?: number | null;
  c_assoc_first_year?: number | null;
  c_assoc_last_year?: number | null;
  c_source?: string | null;
  c_pages?: string | null;
  c_notes?: string | null;
  c_assoc_fy_nh_code?: number | null;
  c_assoc_fy_nh_year?: number | null;
  c_assoc_fy_range?: number | null;
  c_assoc_fy_intercalary?: string | null;
  c_assoc_fy_month?: number | null;
  c_assoc_fy_day?: number | null;
  c_assoc_fy_day_gz?: string | null;
  c_assoc_ly_nh_code?: number | null;
  c_assoc_ly_nh_year?: number | null;
  c_assoc_ly_range?: number | null;
  c_assoc_ly_intercalary?: string | null;
  c_assoc_ly_month?: number | null;
  c_assoc_ly_day?: number | null;
  c_assoc_ly_day_gz?: string | null;
  c_text_title?: string | null;
  c_addr_id?: number | null;
  c_litgenre_code?: number | null;
  c_occasion_code?: number | null;
  c_topic_code?: number | null;
  c_inst_code?: number | null;
  c_inst_name_code?: number | null;
  c_assoc_claimer_id?: number | null;
  c_created_by?: string | null;
  c_created_date?: string | null;
  c_modified_by?: string | null;
  c_modified_date?: string | null;

  // Association type info
  assoc_type_code?: number | null;
  assoc_type_desc?: string | null;
  assoc_type_desc_chn?: string | null;

  // Person info (main)
  main_person_id?: number | null;
  main_person_name?: string | null;
  main_person_name_chn?: string | null;

  // Person info (associated)
  assoc_person_id?: number | null;
  assoc_person_name?: string | null;
  assoc_person_name_chn?: string | null;

  // Kin person info
  kin_person_id?: number | null;
  kin_person_name?: string | null;
  kin_person_name_chn?: string | null;

  // Associated kin person info
  assoc_kin_person_id?: number | null;
  assoc_kin_person_name?: string | null;
  assoc_kin_person_name_chn?: string | null;

  // Tertiary person info
  tertiary_person_id?: number | null;
  tertiary_person_name?: string | null;
  tertiary_person_name_chn?: string | null;

  // Claimer person info
  claimer_person_id?: number | null;
  claimer_person_name?: string | null;
  claimer_person_name_chn?: string | null;

  // Kinship type info
  kin_type_code?: number | null;
  kin_type_rel?: string | null;
  kin_type_rel_chn?: string | null;

  assoc_kin_type_code?: number | null;
  assoc_kin_type_rel?: string | null;
  assoc_kin_type_rel_chn?: string | null;

  // Address info
  c_addr_chn?: string | null;
  c_addr_nianhao?: string | null;

  // Year info
  first_year_nh_id?: number | null;
  first_year_nh_chn?: string | null;
  first_year_nh_dynasty?: string | null;

  last_year_nh_id?: number | null;
  last_year_nh_chn?: string | null;
  last_year_nh_dynasty?: string | null;

  first_year_range_val?: string | null;
  first_year_range_chn?: string | null;

  last_year_range_val?: string | null;
  last_year_range_chn?: string | null;

  // Source text info (both naming patterns)
  source_text_id?: string | null;
  source_text_title?: string | null;
  source_text_title_chn?: string | null;
  source_id?: string | null;
  source_title?: string | null;
  source_title_chn?: string | null;
  source_author?: string | null;
  source_author_chn?: string | null;

  // Institution info
  inst_code?: number | null;
  inst_name_code?: number | null;
  inst_name?: string | null;
  inst_name_chn?: string | null;
}

/**
 * Maps ASSOC_DATA database record to Association domain model
 * Includes related data from joined tables (pivot pattern from Laravel)
 *
 * @param data - Database record with relations
 * @returns Domain model with all fields mapped
 */
export function mapAssocDataToAssociation(data: AssociationDataWithRelations): AssociationModel {
  return {
    // Primary identifiers from ASSOC_DATA
    personId: data.c_personid, // 人物唯一標識符
    assocId: data.c_assoc_id, // 社會關係編號
    assocCode: data.c_assoc_code, // 社會關係類型

    // Associated person from BIOG_MAIN join
    assocPersonId: data.c_assoc_id,

    // Kinship relationships
    kinCode: data.c_kin_code, // 親屬關係類型代碼
    kinId: data.c_kin_id, // 親屬關係編號

    // Associated kinship
    assocKinCode: data.c_assoc_kin_code, // 關聯親屬代碼
    assocKinId: data.c_assoc_kin_id, // 關聯親屬編號

    // Tertiary relationships
    tertiaryPersonId: data.c_tertiary_personid ?? null, // 第三方人物編號
    tertiaryTypeNotes: data.c_tertiary_type_notes ?? null, // 第三方類型備註

    // Counts and sequence
    assocCount: data.c_assoc_count ?? null, // 關聯計數
    sequence: data.c_sequence ?? null, // 同類型多項的排序

    // Temporal data
    firstYear: data.c_assoc_first_year, // 關聯起始年
    lastYear: data.c_assoc_last_year ?? null, // 關聯結束年

    // Source information
    source: data.c_source ?? null, // 來源文獻編號
    pages: data.c_pages ?? null, // 頁碼引用
    notes: data.c_notes ?? null, // 備註

    // First year details (reign period dating)
    firstYearNhCode: data.c_assoc_fy_nh_code ?? null, // 關聯起始年年號代碼
    firstYearNhYear: data.c_assoc_fy_nh_year ?? null, // 關聯起始年年號年份
    firstYearRange: data.c_assoc_fy_range ?? null, // 關聯起始年範圍標記
    firstYearIntercalary: data.c_assoc_fy_intercalary || '0', // 關聯起始年閏月標記
    firstYearMonth: data.c_assoc_fy_month ?? null, // 關聯起始月份
    firstYearDay: data.c_assoc_fy_day ?? null, // 關聯起始日期
    firstYearDayGz: data.c_assoc_fy_day_gz ? String(data.c_assoc_fy_day_gz) : null, // 關聯起始日干支

    // Last year details (reign period dating)
    lastYearNhCode: data.c_assoc_ly_nh_code ?? null, // 關聯結束年年號代碼
    lastYearNhYear: data.c_assoc_ly_nh_year ?? null, // 關聯結束年年號年份
    lastYearRange: data.c_assoc_ly_range ?? null, // 關聯結束年範圍標記
    lastYearIntercalary: data.c_assoc_ly_intercalary || '0', // 關聯結束年閏月標記
    lastYearMonth: data.c_assoc_ly_month ?? null, // 關聯結束月份
    lastYearDay: data.c_assoc_ly_day ?? null, // 關聯結束日期
    lastYearDayGz: data.c_assoc_ly_day_gz ? String(data.c_assoc_ly_day_gz) : null, // 關聯結束日干支

    // Text and address
    textTitle: data.c_text_title || null, // 相關文本標題 (empty string → null)
    addrId: data.c_addr_id ?? null, // 地址編號

    // Academic and literary context
    litGenreCode: data.c_litgenre_code ?? null, // 文學體裁代碼
    occasionCode: data.c_occasion_code ?? null, // 場合代碼
    topicCode: data.c_topic_code ?? null, // 主題代碼
    instCode: data.c_inst_code ?? null, // 機構代碼
    instNameCode: data.c_inst_name_code ?? null, // 機構名稱代碼

    // Association witness
    assocClaimerId: data.c_assoc_claimer_id ?? null, // 關係指證人編號

    // Audit fields
    createdBy: data.c_created_by ?? null,
    createdDate: data.c_created_date ?? null,
    modifiedBy: data.c_modified_by ?? null,
    modifiedDate: data.c_modified_date ?? null
  };
}

/**
 * Maps array of ASSOC_DATA records to Association models
 *
 * @param data - Array of database records
 * @returns Array of domain models
 */
export function mapAssocDataArrayToAssociation(data: AssociationDataWithRelations[]): AssociationModel[] {
  return data.map(mapAssocDataToAssociation);
}

/**
 * Maps ASSOC_DATA with all joined relations to AssociationWithFullRelations
 *
 * @param row - Database row with all joins
 * @returns Association with full relations
 */
export function associationWithFullRelations(row: any): AssociationFullExtendedModel {
  const base = mapAssocDataToAssociation(row.assoc);
  const result = Object.assign(new AssociationFullExtendedModel(
    base.personId,
    base.assocId,
    base.assocCode,
    base.assocPersonId,
    base.kinCode,
    base.kinId,
    base.assocKinCode,
    base.assocKinId,
    base.tertiaryPersonId,
    base.tertiaryTypeNotes,
    base.assocCount,
    base.sequence,
    base.firstYear,
    base.lastYear,
    base.source,
    base.pages,
    base.notes,
    base.firstYearNhCode,
    base.firstYearNhYear,
    base.firstYearRange,
    base.firstYearIntercalary,
    base.firstYearMonth,
    base.firstYearDay,
    base.firstYearDayGz,
    base.lastYearNhCode,
    base.lastYearNhYear,
    base.lastYearRange,
    base.lastYearIntercalary,
    base.lastYearMonth,
    base.lastYearDay,
    base.lastYearDayGz,
    base.textTitle,
    base.addrId,
    base.litGenreCode,
    base.occasionCode,
    base.topicCode,
    base.instCode,
    base.instNameCode,
    base.assocClaimerId,
    base.createdBy,
    base.createdDate,
    base.modifiedBy,
    base.modifiedDate
  ), base);

  // Map association type info
  if (row.assocType) {
    result.associationTypeInfo = {
      code: row.assocType.c_assoc_code,
      assocType: row.assocType.c_assoc_desc,
      assocTypeChn: row.assocType.c_assoc_desc_chn
    };
  }

  // Map person info
  if (row.assocPerson) {
    result.assocPersonInfo = {
      personId: row.assocPerson.c_personid,
      name: row.assocPerson.c_name,
      nameChn: row.assocPerson.c_name_chn
    };
  }

  if (row.kinPerson) {
    result.kinPersonInfo = {
      personId: row.kinPerson.c_personid,
      name: row.kinPerson.c_name,
      nameChn: row.kinPerson.c_name_chn
    };
  }

  if (row.assocKinPerson) {
    result.assocKinPersonInfo = {
      personId: row.assocKinPerson.c_personid,
      name: row.assocKinPerson.c_name,
      nameChn: row.assocKinPerson.c_name_chn
    };
  }

  if (row.tertiaryPerson) {
    result.tertiaryPersonInfo = {
      personId: row.tertiaryPerson.c_personid,
      name: row.tertiaryPerson.c_name,
      nameChn: row.tertiaryPerson.c_name_chn
    };
  }

  if (row.claimerPerson) {
    result.assocClaimerInfo = {
      personId: row.claimerPerson.c_personid,
      name: row.claimerPerson.c_name,
      nameChn: row.claimerPerson.c_name_chn
    };
  }

  // Map kinship types
  if (row.kinType) {
    result.kinTypeInfo = {
      code: row.kinType.c_kincode,
      kinType: row.kinType.c_kinrel,
      kinTypeChn: row.kinType.c_kinrel_chn
    };
  }

  if (row.assocKinType) {
    result.assocKinTypeInfo = {
      code: row.assocKinType.c_kincode,
      kinType: row.assocKinType.c_kinrel,
      kinTypeChn: row.assocKinType.c_kinrel_chn
    };
  }

  // Map address info
  if (row.address) {
    result.addressInfo = {
      id: row.address.c_addr_id,
      name: row.address.c_name,
      nameChn: row.address.c_name_chn
    };
  }

  // Map date-related info
  if (row.firstYearNh) {
    result.firstYearNianHao = {
      id: row.firstYearNh.c_nianhao_id,
      nameChn: row.firstYearNh.c_nianhao_chn,
      pinyin: row.firstYearNh.c_pinyin,
      firstYear: row.firstYearNh.c_firstyear,
      lastYear: row.firstYearNh.c_lastyear,
      dynasty: row.firstYearNh.c_dynasty
    };
  }

  if (row.lastYearNh) {
    result.lastYearNianHao = {
      id: row.lastYearNh.c_nianhao_id,
      nameChn: row.lastYearNh.c_nianhao_chn,
      pinyin: row.lastYearNh.c_pinyin,
      firstYear: row.lastYearNh.c_firstyear,
      lastYear: row.lastYearNh.c_lastyear,
      dynasty: row.lastYearNh.c_dynasty
    };
  }

  if (row.firstYearRange) {
    result.firstYearRangeInfo = {
      id: row.firstYearRange.c_range_code,
      range: row.firstYearRange.c_approx,
      rangeChn: row.firstYearRange.c_approx_chn
    };
  }

  if (row.lastYearRange) {
    result.lastYearRangeInfo = {
      id: row.lastYearRange.c_range_code,
      range: row.lastYearRange.c_approx,
      rangeChn: row.lastYearRange.c_approx_chn
    };
  }

  // Map source info
  if (row.sourceText) {
    result.sourceInfo = {
      id: row.sourceText.c_textid,
      title: row.sourceText.c_title,
      titleChn: row.sourceText.c_title_chn,
      author: row.sourceText.c_author,
      authorChn: row.sourceText.c_author_chn
    };
  }

  // TODO: Add institution, genre, occasion, topic info when those tables are joined

  return result;
}

/**
 * Maps flat SQL result with perspective-aware CASE statements to AssociationWithFullRelations
 * Used when querying associations from different perspectives (primary/associated/all)
 *
 * This mapper handles the output of SQL queries that use CASE statements to fix
 * self-reference issues in bidirectional associations. The SQL already determines
 * the correct person references based on viewing direction.
 *
 * @param row - Flat database row from SQL query with CASE statements
 * @returns Association with full relations, perspective-corrected
 */
export function associationWithFullRelationsFromFlatPerspective(row: any, viewedPersonId?: number): AssociationFullExtendedModel {
  // Step 1: Extract base ASSOC_DATA fields and reuse existing mapper
  // Provide defaults for required fields
  const baseAssocData: AssociationDataWithRelations = {
    c_personid: row.c_personid || 0,
    c_assoc_id: row.c_assoc_id || 0,
    c_assoc_code: row.c_assoc_code || 0,
    c_kin_code: row.c_kin_code || 0,
    c_kin_id: row.c_kin_id ?? null,
    c_assoc_kin_code: row.c_assoc_kin_code ?? null,
    c_assoc_kin_id: row.c_assoc_kin_id ?? null,
    c_tertiary_personid: row.c_tertiary_personid ?? null,
    c_tertiary_type_notes: row.c_tertiary_type_notes ?? null,
    c_assoc_count: row.c_assoc_count ?? null,
    c_sequence: row.c_sequence ?? null,
    c_assoc_first_year: row.c_assoc_first_year || 0,
    c_assoc_last_year: row.c_assoc_last_year ?? null,
    c_source: row.c_source ?? null,
    c_pages: row.c_pages ?? null,
    c_notes: row.c_notes ?? null,
    c_assoc_fy_nh_code: row.c_assoc_fy_nh_code ?? null,
    c_assoc_fy_nh_year: row.c_assoc_fy_nh_year ?? null,
    c_assoc_fy_range: row.c_assoc_fy_range ?? null,
    c_assoc_fy_intercalary: row.c_assoc_fy_intercalary || '0',
    c_assoc_fy_month: row.c_assoc_fy_month ?? null,
    c_assoc_fy_day: row.c_assoc_fy_day ?? null,
    c_assoc_fy_day_gz: row.c_assoc_fy_day_gz ?? null,
    c_assoc_ly_nh_code: row.c_assoc_ly_nh_code ?? null,
    c_assoc_ly_nh_year: row.c_assoc_ly_nh_year ?? null,
    c_assoc_ly_range: row.c_assoc_ly_range ?? null,
    c_assoc_ly_intercalary: row.c_assoc_ly_intercalary || '0',
    c_assoc_ly_month: row.c_assoc_ly_month ?? null,
    c_assoc_ly_day: row.c_assoc_ly_day ?? null,
    c_assoc_ly_day_gz: row.c_assoc_ly_day_gz ?? null,
    c_text_title: row.c_text_title || null,
    c_addr_id: row.c_addr_id ?? null,
    c_litgenre_code: row.c_litgenre_code ?? null,
    c_occasion_code: row.c_occasion_code ?? null,
    c_topic_code: row.c_topic_code ?? null,
    c_inst_code: row.c_inst_code ?? null,
    c_inst_name_code: row.c_inst_name_code ?? null,
    c_assoc_claimer_id: row.c_assoc_claimer_id ?? null,
    c_created_by: row.c_created_by ?? null,
    c_created_date: row.c_created_date ?? null,
    c_modified_by: row.c_modified_by ?? null,
    c_modified_date: row.c_modified_date ?? null
  };

  // Reuse existing mapper for base association
  const base = mapAssocDataToAssociation(baseAssocData);

  // Step 2: Create the extended model instance
  const result = Object.assign(new AssociationFullExtendedModel(
    base.personId,
    base.assocId,
    base.assocCode,
    base.assocPersonId,
    base.kinCode,
    base.kinId,
    base.assocKinCode,
    base.assocKinId,
    base.tertiaryPersonId,
    base.tertiaryTypeNotes,
    base.assocCount,
    base.sequence,
    base.firstYear,
    base.lastYear,
    base.source,
    base.pages,
    base.notes,
    base.firstYearNhCode,
    base.firstYearNhYear,
    base.firstYearRange,
    base.firstYearIntercalary,
    base.firstYearMonth,
    base.firstYearDay,
    base.firstYearDayGz,
    base.lastYearNhCode,
    base.lastYearNhYear,
    base.lastYearRange,
    base.lastYearIntercalary,
    base.lastYearMonth,
    base.lastYearDay,
    base.lastYearDayGz,
    base.textTitle,
    base.addrId,
    base.litGenreCode,
    base.occasionCode,
    base.topicCode,
    base.instCode,
    base.instNameCode,
    base.assocClaimerId,
    base.createdBy,
    base.createdDate,
    base.modifiedBy,
    base.modifiedDate
  ), base);

  // Step 3: Map relations from flat SQL result
  // The SQL CASE statements have already determined correct person references

  // Map association type info
  if (row.assoc_type_code !== null && row.assoc_type_code !== undefined) {
    result.associationTypeInfo = {
      code: row.assoc_type_code,
      assocType: row.assoc_type_desc || row.assoc_type,
      assocTypeChn: row.assoc_type_desc_chn || row.assoc_type_chn
    };
  }

  // Map person info (perspective-aware)
  // When viewing from associated perspective (viewedPersonId === c_assoc_id),
  // show the OTHER person (from c_personid)
  if (viewedPersonId && row.c_assoc_id === viewedPersonId) {
    // Viewing person is in c_assoc_id position, show the main person
    if (row.main_person_id !== null) {
      result.assocPersonInfo = {
        personId: row.main_person_id,
        name: row.main_person_name,
        nameChn: row.main_person_name_chn
      };
    }
  } else {
    // Normal case or no viewedPersonId provided
    if (row.assoc_person_id !== null) {
      result.assocPersonInfo = {
        personId: row.assoc_person_id,
        name: row.assoc_person_name,
        nameChn: row.assoc_person_name_chn
      };
    }
  }

  if (row.kin_person_id !== null) {
    result.kinPersonInfo = {
      personId: row.kin_person_id,
      name: row.kin_person_name,
      nameChn: row.kin_person_name_chn
    };
  }

  if (row.assoc_kin_person_id !== null) {
    result.assocKinPersonInfo = {
      personId: row.assoc_kin_person_id,
      name: row.assoc_kin_person_name,
      nameChn: row.assoc_kin_person_name_chn
    };
  }

  if (row.tertiary_person_id !== null) {
    result.tertiaryPersonInfo = {
      personId: row.tertiary_person_id,
      name: row.tertiary_person_name,
      nameChn: row.tertiary_person_name_chn
    };
  }

  if (row.claimer_person_id !== null) {
    result.assocClaimerInfo = {
      personId: row.claimer_person_id,
      name: row.claimer_person_name,
      nameChn: row.claimer_person_name_chn
    };
  }

  // Map kinship types
  if (row.kin_type_code !== null) {
    result.kinTypeInfo = {
      code: row.kin_type_code,
      kinType: row.kin_type_rel || row.kin_type,
      kinTypeChn: row.kin_type_rel_chn || row.kin_type_chn
    };
  }

  if (row.assoc_kin_type_code !== null) {
    result.assocKinTypeInfo = {
      code: row.assoc_kin_type_code,
      kinType: row.assoc_kin_type_rel || row.assoc_kin_type,
      kinTypeChn: row.assoc_kin_type_rel_chn || row.assoc_kin_type_chn
    };
  }

  // Map address info
  if (row.addr_id !== null) {
    result.addressInfo = {
      id: row.addr_id,
      name: row.addr_name,
      nameChn: row.addr_name_chn
    };
  }

  // Map date-related info
  // NianHao info - using firstYearNianHao (not firstYearNianHaoInfo)
  if (row.first_year_nh_id !== null) {
    result.firstYearNianHao = {
      id: row.first_year_nh_id,
      nameChn: row.first_year_nh_chn ?? null,
      pinyin: null,  // Not available in current SQL
      firstYear: null, // Not available in current SQL
      lastYear: null, // Not available in current SQL
      dynasty: row.first_year_nh_dynasty ?? null
    };
  }

  if (row.last_year_nh_id !== null) {
    result.lastYearNianHao = {
      id: row.last_year_nh_id,
      nameChn: row.last_year_nh_chn ?? null,
      pinyin: null,  // Not available in current SQL
      firstYear: null, // Not available in current SQL
      lastYear: null, // Not available in current SQL
      dynasty: row.last_year_nh_dynasty ?? null
    };
  }

  // Year range info - AssociationYearRangeInfo doesn't have 'code' field
  if (row.first_year_range_val !== null) {
    result.firstYearRangeInfo = {
      id: row.c_assoc_fy_range ?? 0,
      range: row.first_year_range_val,
      rangeChn: row.first_year_range_chn ?? null
    };
  }

  if (row.last_year_range_val !== null) {
    result.lastYearRangeInfo = {
      id: row.c_assoc_ly_range ?? 0,
      range: row.last_year_range_val,
      rangeChn: row.last_year_range_chn ?? null
    };
  }

  // Map source info
  if (row.source_text_id !== null || row.source_id !== null) {
    result.sourceInfo = {
      id: (row.source_text_id || row.source_id) ?? '',
      title: (row.source_text_title || row.source_title) ?? null,
      titleChn: (row.source_text_title_chn || row.source_title_chn) ?? null,
      author: row.source_author ?? null,
      authorChn: row.source_author_chn ?? null
    };
  }

  // Map institution info
  if (row.inst_code !== null) {
    result.institutionInfo = {
      code: row.inst_code ?? 0,
      nameCode: row.inst_name_code ?? null,
      name: row.inst_name ?? null,
      nameChn: row.inst_name_chn ?? null
    };
  }

  // Map literary genre, occasion, topic info - These fields don't exist in SQL result yet
  // TODO: Add when these tables are joined in the SQL query
  /*
  if (row.c_litgenre_code !== null) {
    result.literaryGenreInfo = {
      code: row.c_litgenre_code,
      genre: null, // Not available in current SQL
      genreChn: null // Not available in current SQL
    };
  }

  // Occasion info - Not available in current SQL
  if (row.c_occasion_code !== null) {
    result.occasionInfo = {
      code: row.c_occasion_code,
      occasion: null, // Not available in current SQL
      occasionChn: null // Not available in current SQL
    };
  }

  // Topic info - Not available in current SQL
  if (row.c_topic_code !== null) {
    result.topicInfo = {
      code: row.c_topic_code,
      topic: null, // Not available in current SQL
      topicChn: null // Not available in current SQL
    };
  }
  */

  return result;
}

/**
 * Maps ASSOC_DATA to AssociationTableModel (Level 1 - raw, no joins)
 */
export function toTableModel(data: AssociationDataWithRelations): AssociationTableModel {
  return new AssociationTableModel(
    data.c_personid,
    data.c_assoc_id,
    data.c_assoc_code,
    data.c_assoc_id,  // assocPersonId usually same as assocId
    data.c_kin_code ?? null,
    data.c_kin_id ?? null,
    data.c_assoc_kin_code ?? null,
    data.c_assoc_kin_id ?? null,
    data.c_tertiary_personid ?? null,
    data.c_tertiary_type_notes ?? null,
    data.c_assoc_count ?? null,
    data.c_sequence ?? null,
    data.c_assoc_first_year ?? null,
    data.c_assoc_last_year ?? null,
    data.c_source ? String(data.c_source) : null,
    data.c_pages ?? null,
    data.c_notes ?? null,
    data.c_assoc_fy_nh_code ?? null,
    data.c_assoc_fy_nh_year ?? null,
    data.c_assoc_fy_range ?? null,
    data.c_assoc_fy_intercalary || '0',
    data.c_assoc_fy_month ?? null,
    data.c_assoc_fy_day ?? null,
    data.c_assoc_fy_day_gz ? String(data.c_assoc_fy_day_gz) : null,
    data.c_assoc_ly_nh_code ?? null,
    data.c_assoc_ly_nh_year ?? null,
    data.c_assoc_ly_range ?? null,
    data.c_assoc_ly_intercalary || '0',
    data.c_assoc_ly_month ?? null,
    data.c_assoc_ly_day ?? null,
    data.c_assoc_ly_day_gz ? String(data.c_assoc_ly_day_gz) : null,
    data.c_text_title || null,
    data.c_addr_id ?? null,
    data.c_litgenre_code ?? null,
    data.c_occasion_code ?? null,
    data.c_topic_code ?? null,
    data.c_inst_code ?? null,
    data.c_inst_name_code ?? null,
    data.c_assoc_claimer_id ?? null,
    data.c_created_by ?? null,
    data.c_created_date ?? null,
    data.c_modified_by ?? null,
    data.c_modified_date ?? null
  );
}

/**
 * Maps ASSOC_DATA with trivial joins to AssociationModel (Level 2 - DEFAULT)
 * Includes ASSOC_CODES for human-readable descriptions
 */
export function toModel(data: AssociationDataWithRelations, assocCode?: any, assocPerson?: any): AssociationModel {
  const tableModel = toTableModel(data);
  return new AssociationModel(
    tableModel.personId!,  // Assert non-null - should always exist in real data
    tableModel.assocId!,   // Assert non-null - should always exist in real data
    tableModel.assocCode!, // Assert non-null - should always exist in real data
    tableModel.assocPersonId!, // Assert non-null - should always exist in real data
    tableModel.kinCode || 0,  // Default to 0 if null
    tableModel.kinId || 0,  // Default to 0 if null
    tableModel.assocKinCode || 0,  // Default to 0 if null
    tableModel.assocKinId || 0,  // Default to 0 if null
    tableModel.tertiaryPersonId,
    tableModel.tertiaryTypeNotes,
    tableModel.assocCount,
    tableModel.sequence,
    tableModel.firstYear || 0,  // Default to 0 if null
    tableModel.lastYear || 0,   // Default to 0 if null
    tableModel.source ? parseInt(tableModel.source, 10) : null,  // Convert string to number
    tableModel.pages,
    tableModel.notes,
    tableModel.firstYearNhCode,
    tableModel.firstYearNhYear,
    tableModel.firstYearRange,
    tableModel.firstYearIntercalary,
    tableModel.firstYearMonth,
    tableModel.firstYearDay,
    tableModel.firstYearDayGz,
    tableModel.lastYearNhCode,
    tableModel.lastYearNhYear,
    tableModel.lastYearRange,
    tableModel.lastYearIntercalary,
    tableModel.lastYearMonth,
    tableModel.lastYearDay,
    tableModel.lastYearDayGz,
    tableModel.textTitle,
    tableModel.addrId,
    tableModel.litGenreCode,
    tableModel.occasionCode,
    tableModel.topicCode,
    tableModel.instCode,
    tableModel.instNameCode,
    tableModel.assocClaimerId,
    tableModel.createdBy,
    tableModel.createdDate,
    tableModel.modifiedBy,
    tableModel.modifiedDate,
    // Trivial joins - ASSOC_CODES
    assocCode?.c_assoc_desc ?? null,
    assocCode?.c_assoc_desc_chn ?? null,
    // Associated person name
    assocPerson?.c_name ?? null,
    assocPerson?.c_name_chn ?? null
  );
}

/**
 * Maps to AssociationFullExtendedModel (Level 3 - all relations)
 * Alias for existing function
 */
export const toFullExtendedModel = associationWithFullRelations;

/**
 * Maps to AssociationTimelineDataView (Level 4 - purpose-specific)
 */
export function toTimelineDataView(extended: AssociationFullExtendedModel): AssociationTimelineDataView {
  return AssociationTimelineDataView.fromExtendedModel(extended);
}

/**
 * Unified AssociationMapper object - Four-Level Hierarchy
 * Following new naming convention
 */
export const AssociationMapper = {
  // Level 1: TableModel (raw, no joins)
  toTableModel,

  // Level 2: Model (with trivial joins - DEFAULT)
  toModel,

  // Level 3: ExtendedModel (all relations)
  toFullExtendedModel,
  toFullExtendedModelFromFlatPerspective: associationWithFullRelationsFromFlatPerspective,

  // Level 4: DataView (purpose-specific)
  toTimelineDataView,
} as const;