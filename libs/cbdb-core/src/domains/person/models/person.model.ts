import { PersonTableModel } from './person.model.table';
import { PersonDenormExtraDataView } from '../views/person-denorm-extra.data-view';

/**
 * PersonModel - Model level with trivial joins (THE DEFAULT)
 *
 * This is the Model level (Level 2) of our four-tier hierarchy.
 * It includes all fields from PersonTableModel PLUS trivial joins with code tables
 * for human-readable descriptions. This is what developers expect by default.
 *
 * Composition pattern: PersonTableModel + PersonDenormExtraDataView = PersonModel
 *
 * Trivial joins included:
 * - DYNASTIES for dynasty names
 * - NIAN_HAO for era names
 * - ETHNICITY_TRIBE_CODES for ethnicity descriptions
 * - CHORONYM_CODES for regional identity
 * - HOUSEHOLD_STATUS_CODES for household status
 * - INDEXYEAR_TYPE_CODES for index year type
 * - BIOG_ADDR_CODES for index address type
 * - GANZHI_CODES for date conversions
 * - YEAR_RANGE_CODES for year ranges
 */
export class PersonModel {
  // ===== Fields from PersonTableModel =====
  // Primary key
  id: number;

  // Names
  name: string | null;
  nameChn: string | null;
  surname: string | null;
  surnameChn: string | null;
  mingzi: string | null;

  // Gender
  female: number;

  // Birth information
  birthYear: number | null;
  birthYearNhCode: number | null;
  birthYearNhYear: number | null;
  birthYearIntercalary: number;
  birthYearMonth: number | null;
  birthYearDay: number | null;
  birthYearDayGzCode: number | null;
  birthYearRangeCode: number | null;

  // Death information
  deathYear: number | null;
  deathYearNhCode: number | null;
  deathYearNhYear: number | null;
  deathYearIntercalary: number;
  deathYearMonth: number | null;
  deathYearDay: number | null;
  deathYearDayGzCode: number | null;
  deathYearRangeCode: number | null;

  // Index year
  indexYear: number | null;
  indexYearTypeCode: string | null;

  // Flourished years
  flourishedStartYear: number | null;
  flourishedStartYearNhCode: number | null;
  flourishedEndYear: number | null;
  flourishedEndYearNhCode: number | null;

  // Codes
  dynastyCode: number | null;
  ethnicityCode: number | null;
  choronymCode: number | null;
  householdStatusCode: number | null;

  // Index address
  indexAddrId: number | null;
  indexAddrTypeCode: number | null;

  // Source info
  notes: string | null;
  selfBio: number;

  // ===== Fields from PersonDenormExtraDataView (trivial joins) =====
  // Dynasty descriptions
  dynastyName?: string | null;
  dynastyNameChn?: string | null;

  // Era name descriptions
  birthYearNhName?: string | null;
  birthYearNhNameChn?: string | null;
  deathYearNhName?: string | null;
  deathYearNhNameChn?: string | null;
  flourishedStartYearNhName?: string | null;
  flourishedStartYearNhNameChn?: string | null;
  flourishedEndYearNhName?: string | null;
  flourishedEndYearNhNameChn?: string | null;

  // Ethnicity description
  ethnicityName?: string | null;
  ethnicityNameChn?: string | null;

  // Choronym description
  choronymName?: string | null;
  choronymNameChn?: string | null;

  // Household status description
  householdStatusName?: string | null;
  householdStatusNameChn?: string | null;

  // Index year type description
  indexYearTypeName?: string | null;
  indexYearTypeNameChn?: string | null;

  // Index address type description
  indexAddrTypeName?: string | null;
  indexAddrTypeNameChn?: string | null;

  // Year range descriptions
  birthYearRange?: string | null;
  birthYearRangeChn?: string | null;
  deathYearRange?: string | null;
  deathYearRangeChn?: string | null;

  // Ganzhi date descriptions
  birthYearDayGz?: string | null;
  birthYearDayGzChn?: string | null;
  deathYearDayGz?: string | null;
  deathYearDayGzChn?: string | null;

  // Index address name
  indexAddrName?: string | null;
  indexAddrNameChn?: string | null;

  constructor(
    tableModel: PersonTableModel,
    related: PersonDenormExtraDataView
  ) {
    // Copy all fields from tableModel
    this.id = tableModel.id;
    this.name = tableModel.name;
    this.nameChn = tableModel.nameChn;
    this.surname = tableModel.surname;
    this.surnameChn = tableModel.surnameChn;
    this.mingzi = tableModel.mingzi;
    this.female = tableModel.female;
    this.birthYear = tableModel.birthYear;
    this.birthYearNhCode = tableModel.birthYearNhCode;
    this.birthYearNhYear = tableModel.birthYearNhYear;
    this.birthYearIntercalary = tableModel.birthYearIntercalary;
    this.birthYearMonth = tableModel.birthYearMonth;
    this.birthYearDay = tableModel.birthYearDay;
    this.birthYearDayGzCode = tableModel.birthYearDayGzCode;
    this.birthYearRangeCode = tableModel.birthYearRangeCode;
    this.deathYear = tableModel.deathYear;
    this.deathYearNhCode = tableModel.deathYearNhCode;
    this.deathYearNhYear = tableModel.deathYearNhYear;
    this.deathYearIntercalary = tableModel.deathYearIntercalary;
    this.deathYearMonth = tableModel.deathYearMonth;
    this.deathYearDay = tableModel.deathYearDay;
    this.deathYearDayGzCode = tableModel.deathYearDayGzCode;
    this.deathYearRangeCode = tableModel.deathYearRangeCode;
    this.indexYear = tableModel.indexYear;
    this.indexYearTypeCode = tableModel.indexYearTypeCode;
    this.flourishedStartYear = tableModel.flourishedStartYear;
    this.flourishedStartYearNhCode = tableModel.flourishedStartYearNhCode;
    this.flourishedEndYear = tableModel.flourishedEndYear;
    this.flourishedEndYearNhCode = tableModel.flourishedEndYearNhCode;
    this.dynastyCode = tableModel.dynastyCode;
    this.ethnicityCode = tableModel.ethnicityCode;
    this.choronymCode = tableModel.choronymCode;
    this.householdStatusCode = tableModel.householdStatusCode;
    this.indexAddrId = tableModel.indexAddrId;
    this.indexAddrTypeCode = tableModel.indexAddrTypeCode;
    this.notes = tableModel.notes;
    this.selfBio = tableModel.selfBio;

    // Copy all fields from related
    this.dynastyName = related.dynastyName;
    this.dynastyNameChn = related.dynastyNameChn;
    this.birthYearNhName = related.birthYearNhName;
    this.birthYearNhNameChn = related.birthYearNhNameChn;
    this.deathYearNhName = related.deathYearNhName;
    this.deathYearNhNameChn = related.deathYearNhNameChn;
    this.flourishedStartYearNhName = related.flourishedStartYearNhName;
    this.flourishedStartYearNhNameChn = related.flourishedStartYearNhNameChn;
    this.flourishedEndYearNhName = related.flourishedEndYearNhName;
    this.flourishedEndYearNhNameChn = related.flourishedEndYearNhNameChn;
    this.ethnicityName = related.ethnicityName;
    this.ethnicityNameChn = related.ethnicityNameChn;
    this.choronymName = related.choronymName;
    this.choronymNameChn = related.choronymNameChn;
    this.householdStatusName = related.householdStatusName;
    this.householdStatusNameChn = related.householdStatusNameChn;
    this.indexYearTypeName = related.indexYearTypeName;
    this.indexYearTypeNameChn = related.indexYearTypeNameChn;
    this.indexAddrTypeName = related.indexAddrTypeName;
    this.indexAddrTypeNameChn = related.indexAddrTypeNameChn;
    this.birthYearRange = related.birthYearRange;
    this.birthYearRangeChn = related.birthYearRangeChn;
    this.deathYearRange = related.deathYearRange;
    this.deathYearRangeChn = related.deathYearRangeChn;
    this.birthYearDayGz = related.birthYearDayGz;
    this.birthYearDayGzChn = related.birthYearDayGzChn;
    this.deathYearDayGz = related.deathYearDayGz;
    this.deathYearDayGzChn = related.deathYearDayGzChn;
    this.indexAddrName = related.indexAddrName;
    this.indexAddrNameChn = related.indexAddrNameChn;
  }
}