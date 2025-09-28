import type { InferSelectModel } from 'drizzle-orm';
import type { BIOG_MAIN } from '../../../schemas/schema';
import { toNumber, toStringOrNull, toNumberOrNull } from '../../../utils/type-conversions';

type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;

/**
 * PersonTableModel - Raw database representation of BIOG_MAIN table
 *
 * This is the TableModel level (Level 1) of our four-tier hierarchy.
 * It contains ONLY the raw fields from BIOG_MAIN table with NO joins.
 * All fields match the database schema exactly.
 *
 * Uses the schema type directly in constructor for type safety.
 */
export class PersonTableModel {
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

  // Birth information (raw codes/values)
  birthYear: number | null;
  birthYearNhCode: number | null;
  birthYearNhYear: number | null;  // c_by_nh_year - year within reign period
  birthYearIntercalary: number;
  birthYearMonth: number | null;
  birthYearDay: number | null;
  birthYearDayGzCode: number | null;
  birthYearRangeCode: number | null;

  // Death information (raw codes/values)
  deathYear: number | null;
  deathYearNhCode: number | null;
  deathYearNhYear: number | null;  // c_dy_nh_year - year within reign period
  deathYearIntercalary: number;
  deathYearMonth: number | null;
  deathYearDay: number | null;
  deathYearDayGzCode: number | null;
  deathYearRangeCode: number | null;

  // Index year information
  indexYear: number | null;
  indexYearTypeCode: string | null;

  // Flourished years
  flourishedStartYear: number | null;
  flourishedStartYearNhCode: number | null;
  flourishedEndYear: number | null;
  flourishedEndYearNhCode: number | null;

  // Dynasty (raw code)
  dynastyCode: number | null;

  // Ethnicity (raw code)
  ethnicityCode: number | null;

  // Choronym (raw code)
  choronymCode: number | null;

  // Household status (raw code)
  householdStatusCode: number | null;

  // Index address (raw references)
  indexAddrId: number | null;
  indexAddrTypeCode: number | null;

  // Source info
  notes: string | null;
  selfBio: number;

  constructor(record: BiogMainRecord) {
    // Primary key
    this.id = record.c_personid;

    // Names
    this.name = toStringOrNull(record.c_name);
    this.nameChn = toStringOrNull(record.c_name_chn);
    this.surname = toStringOrNull(record.c_surname);
    this.surnameChn = toStringOrNull(record.c_surname_chn);
    this.mingzi = toStringOrNull(record.c_mingzi);

    // Gender
    this.female = toNumber(record.c_female, 0);

    // Birth information
    this.birthYear = toNumberOrNull(record.c_birthyear);
    this.birthYearNhCode = toNumberOrNull(record.c_by_nh_code);
    this.birthYearNhYear = toNumberOrNull(record.c_by_nh_year);
    this.birthYearIntercalary = toNumber(record.c_by_intercalary, 0);
    this.birthYearMonth = toNumberOrNull(record.c_by_month);
    this.birthYearDay = toNumberOrNull(record.c_by_day);
    this.birthYearDayGzCode = toNumberOrNull(record.c_by_day_gz);
    this.birthYearRangeCode = toNumberOrNull(record.c_by_range);

    // Death information
    this.deathYear = toNumberOrNull(record.c_deathyear);
    this.deathYearNhCode = toNumberOrNull(record.c_dy_nh_code);
    this.deathYearNhYear = toNumberOrNull(record.c_dy_nh_year);
    this.deathYearIntercalary = toNumber(record.c_dy_intercalary, 0);
    this.deathYearMonth = toNumberOrNull(record.c_dy_month);
    this.deathYearDay = toNumberOrNull(record.c_dy_day);
    this.deathYearDayGzCode = toNumberOrNull(record.c_dy_day_gz);
    this.deathYearRangeCode = toNumberOrNull(record.c_dy_range);

    // Index year
    this.indexYear = toNumberOrNull(record.c_index_year);
    this.indexYearTypeCode = toStringOrNull(record.c_index_year_type_code);

    // Flourished years
    this.flourishedStartYear = toNumberOrNull(record.c_fl_earliest_year);
    this.flourishedStartYearNhCode = toNumberOrNull(record.c_fl_ey_nh_code);
    this.flourishedEndYear = toNumberOrNull(record.c_fl_latest_year);
    this.flourishedEndYearNhCode = toNumberOrNull(record.c_fl_ly_nh_code);

    // Codes
    this.dynastyCode = toNumberOrNull(record.c_dy);
    this.ethnicityCode = toNumberOrNull(record.c_ethnicity_code);
    this.choronymCode = toNumberOrNull(record.c_choronym_code);
    this.householdStatusCode = toNumberOrNull(record.c_household_status_code);

    // Index address
    this.indexAddrId = toNumberOrNull(record.c_index_addr_id);
    this.indexAddrTypeCode = toNumberOrNull(record.c_index_addr_type_code);

    // Source info
    this.notes = toStringOrNull(record.c_notes);
    this.selfBio = toNumber(record.c_self_bio, 0);
  }
}