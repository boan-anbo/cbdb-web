import { Injectable } from '@nestjs/common';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import {
  BIOG_MAIN,
  DYNASTIES,
  ALTNAME_DATA,
  ALTNAME_CODES,
  NIAN_HAO,
  INDEXYEAR_TYPE_CODES,
  YEAR_RANGE_CODES,
  CHORONYM_CODES,
  ETHNICITY_TRIBE_CODES,
  HOUSEHOLD_STATUS_CODES,
  PersonModel,
  cbdbMapper,
  PersonBirthDeathView,
  PersonBirthDeathSummaryView
} from '@cbdb/core';
import { eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

/**
 * Repository for fetching person details from CBDB
 * Returns raw data - no DTO building
 */
@Injectable()
export class PersonDetailRepository {
  constructor(private readonly cbdbConnection: CbdbConnectionService) { }

  /**
   * Get person with dynasty information
   * Returns raw database records for service layer to transform
   */
  async getPersonWithDynasty(personId: number) {
    const db = this.cbdbConnection.getDb();

    const whereClause = eq(BIOG_MAIN.c_personid, personId);

    const result = await db
      .select()
      .from(BIOG_MAIN)
      .leftJoin(DYNASTIES, eq(BIOG_MAIN.c_dy, DYNASTIES.c_dy))
      .where(whereClause)
      .limit(1);

    if (!result[0]) {
      return null;
    }

    return {
      person: result[0].BIOG_MAIN,
      dynasty: result[0].DYNASTIES
    };
  }

  /**
   * Get alternative names for a person
   * Returns raw database records
   */
  async getAlternativeNames(personId: number) {
    const db = this.cbdbConnection.getDb();

    const results = await db
      .select()
      .from(ALTNAME_DATA)
      .leftJoin(ALTNAME_CODES, eq(ALTNAME_DATA.c_alt_name_type_code, ALTNAME_CODES.c_name_type_code))
      .where(eq(ALTNAME_DATA.c_personid, personId));

    return results.map(row => ({
      alternativeName: row.ALTNAME_DATA,
      nameType: row.ALTNAME_CODES
    }));
  }

  /**
   * Get comprehensive person details
   * Returns all raw data for service to transform
   */
  async getPersonDetail(personId: number) {
    const personWithDynasty = await this.getPersonWithDynasty(personId);

    if (!personWithDynasty) {
      return null;
    }

    const alternativeNames = await this.getAlternativeNames(personId);

    return {
      ...personWithDynasty,
      alternativeNames
    };
  }

  /**
   * Get simplified person birth/death info for timeline
   * Returns just the data needed for enhanced timeline events
   */
  async getPersonBirthDeathInfo(personId: number): Promise<any> {
    const personWithDynasty = await this.getPersonWithDynasty(personId);
    if (!personWithDynasty) return null;
    const birthDeathView = await this.getPersonBirthDeathView(personId);
    return birthDeathView;
  }

  /**
   * Get person birth/death year view - replicates Access Person Browser Birth/Death Year tab
   *
   * This method retrieves comprehensive biographical date information including:
   * - Birth/Death years with Nian Hao (reign period) mapping
   * - Intercalary month handling (閏月) for Chinese calendar
   * - Floruit years (active years when birth/death unknown)
   * - Index year for chronological sorting (calculated by CBDB based on available dates)
   * - Dynasty, ethnicity, choronym (ancestral place), and household status
   * - Year range approximations (e.g., "約" for circa)
   *
   * The Access form logic prioritizes display of:
   * 1. Nian Hao with year if available (e.g., "天禧5年")
   * 2. Absolute year in parentheses (e.g., "(1021)")
   * 3. Intercalary months prefixed with 閏
   *
   * @param personId The person's ID from BIOG_MAIN.c_personid
   * @returns Complete birth/death view matching Access form display
   */
  async getPersonBirthDeathView(personId: number): Promise<PersonBirthDeathView | null> {
    const db = this.cbdbConnection.getDb();

    // Create aliases for multiple NIAN_HAO joins
    const nhBirth = alias(NIAN_HAO, 'nhBirth');
    const nhDeath = alias(NIAN_HAO, 'nhDeath');
    const nhFlEarliest = alias(NIAN_HAO, 'nhFlEarliest');
    const nhFlLatest = alias(NIAN_HAO, 'nhFlLatest');

    // Create aliases for YEAR_RANGE_CODES joins
    const yrBirth = alias(YEAR_RANGE_CODES, 'yrBirth');
    const yrDeath = alias(YEAR_RANGE_CODES, 'yrDeath');

    const result = await db
      .select({
        // Person fields
        personId: BIOG_MAIN.c_personid,
        nameChn: BIOG_MAIN.c_name_chn,
        name: BIOG_MAIN.c_name,
        surnameChn: BIOG_MAIN.c_surname_chn,
        surname: BIOG_MAIN.c_surname,
        mingziChn: BIOG_MAIN.c_mingzi_chn,
        mingzi: BIOG_MAIN.c_mingzi,

        // Birth fields
        birthYear: BIOG_MAIN.c_birthyear,
        birthNhCode: BIOG_MAIN.c_by_nh_code,
        birthNhYear: BIOG_MAIN.c_by_nh_year,
        birthMonth: BIOG_MAIN.c_by_month,
        birthDay: BIOG_MAIN.c_by_day,
        birthIntercalary: BIOG_MAIN.c_by_intercalary,
        birthDayGz: BIOG_MAIN.c_by_day_gz,
        birthRange: BIOG_MAIN.c_by_range,
        birthNianHaoChn: nhBirth.c_nianhao_chn,
        birthNianHao: nhBirth.c_nianhao_pin,

        // Death fields
        deathYear: BIOG_MAIN.c_deathyear,
        deathNhCode: BIOG_MAIN.c_dy_nh_code,
        deathNhYear: BIOG_MAIN.c_dy_nh_year,
        deathMonth: BIOG_MAIN.c_dy_month,
        deathDay: BIOG_MAIN.c_dy_day,
        deathIntercalary: BIOG_MAIN.c_dy_intercalary,
        deathDayGz: BIOG_MAIN.c_dy_day_gz,
        deathRange: BIOG_MAIN.c_dy_range,
        deathNianHaoChn: nhDeath.c_nianhao_chn,
        deathNianHao: nhDeath.c_nianhao_pin,

        // Age fields
        deathAge: BIOG_MAIN.c_death_age,
        deathAgeRange: BIOG_MAIN.c_death_age_range,

        // Floruit fields
        floruitEarliestYear: BIOG_MAIN.c_fl_earliest_year,
        floruitEyNhCode: BIOG_MAIN.c_fl_ey_nh_code,
        floruitEyNhYear: BIOG_MAIN.c_fl_ey_nh_year,
        floruitEyNianHaoChn: nhFlEarliest.c_nianhao_chn,
        floruitLatestYear: BIOG_MAIN.c_fl_latest_year,
        floruitLyNhCode: BIOG_MAIN.c_fl_ly_nh_code,
        floruitLyNhYear: BIOG_MAIN.c_fl_ly_nh_year,
        floruitLyNianHaoChn: nhFlLatest.c_nianhao_chn,

        // Index year fields
        indexYear: BIOG_MAIN.c_index_year,
        indexYearTypeCode: BIOG_MAIN.c_index_year_type_code,
        indexYearTypeDesc: INDEXYEAR_TYPE_CODES.c_index_year_type_desc,
        indexYearTypeDescChn: INDEXYEAR_TYPE_CODES.c_index_year_type_hz,

        // Dynasty fields
        dynasty: BIOG_MAIN.c_dy,
        dynastyChn: DYNASTIES.c_dynasty_chn,
        dynastyPinyin: DYNASTIES.c_dynasty,

        // Choronym (郡望) - Ancestral place name
        // IMPORTANT: Use CHORONYM_CODES not ADDR_CODES!
        // CHORONYM_CODES contains specific ancestral place names (e.g., 太原 Taiyuan)
        // ADDR_CODES contains address/location data (e.g., 廣東省 Guangdong Province)
        choronymCode: BIOG_MAIN.c_choronym_code,
        choronymChn: CHORONYM_CODES.c_choronym_chn,
        choronym: CHORONYM_CODES.c_choronym_desc,
        ethnicityCode: BIOG_MAIN.c_ethnicity_code,
        ethnicityChn: ETHNICITY_TRIBE_CODES.c_name_chn,
        ethnicity: ETHNICITY_TRIBE_CODES.c_name,
        householdStatusCode: BIOG_MAIN.c_household_status_code,
        householdStatusChn: HOUSEHOLD_STATUS_CODES.c_household_status_desc_chn,
        householdStatus: HOUSEHOLD_STATUS_CODES.c_household_status_desc,

        // Year range fields
        birthRangeDescChn: yrBirth.c_range_chn,
        birthRangeDesc: yrBirth.c_range,
        deathRangeDescChn: yrDeath.c_range_chn,
        deathRangeDesc: yrDeath.c_range,

        // Floruit notes
        floruitEarliestNote: BIOG_MAIN.c_fl_ey_notes,
        floruitLatestNote: BIOG_MAIN.c_fl_ly_notes
      })
      .from(BIOG_MAIN)
      .leftJoin(nhBirth, eq(BIOG_MAIN.c_by_nh_code, nhBirth.c_nianhao_id))
      .leftJoin(nhDeath, eq(BIOG_MAIN.c_dy_nh_code, nhDeath.c_nianhao_id))
      .leftJoin(nhFlEarliest, eq(BIOG_MAIN.c_fl_ey_nh_code, nhFlEarliest.c_nianhao_id))
      .leftJoin(nhFlLatest, eq(BIOG_MAIN.c_fl_ly_nh_code, nhFlLatest.c_nianhao_id))
      .leftJoin(INDEXYEAR_TYPE_CODES, eq(BIOG_MAIN.c_index_year_type_code, INDEXYEAR_TYPE_CODES.c_index_year_type_code))
      .leftJoin(DYNASTIES, eq(BIOG_MAIN.c_dy, DYNASTIES.c_dy))
      .leftJoin(CHORONYM_CODES, eq(BIOG_MAIN.c_choronym_code, CHORONYM_CODES.c_choronym_code))
      .leftJoin(ETHNICITY_TRIBE_CODES, eq(BIOG_MAIN.c_ethnicity_code, ETHNICITY_TRIBE_CODES.c_ethnicity_code))
      .leftJoin(HOUSEHOLD_STATUS_CODES, eq(BIOG_MAIN.c_household_status_code, HOUSEHOLD_STATUS_CODES.c_household_status_code))
      .leftJoin(yrBirth, eq(BIOG_MAIN.c_by_range, yrBirth.c_range_code))
      .leftJoin(yrDeath, eq(BIOG_MAIN.c_dy_range, yrDeath.c_range_code))
      .where(eq(BIOG_MAIN.c_personid, personId))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    return this.mapToBirthDeathView(result[0]);
  }

  /**
   * Map raw database result to PersonBirthDeathView
   * Handles formatting of dates for display
   */
  private mapToBirthDeathView(data: any): PersonBirthDeathView {
    return {
      personId: data.personId,
      nameChn: data.nameChn,
      name: data.name,
      surnameChn: data.surnameChn,
      surname: data.surname,
      mingziChn: data.mingziChn,
      mingzi: data.mingzi,

      // Birth information
      birthYear: data.birthYear,
      birthNianHaoId: data.birthNhCode,
      birthNianHaoChn: data.birthNianHaoChn,
      birthNianHao: data.birthNianHao,
      birthNianHaoYear: data.birthNhYear,
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      birthIntercalary: data.birthIntercalary === 1,
      birthDayGanzhi: data.birthDayGz,
      birthRange: data.birthRange,
      birthDisplay: this.formatDateDisplay(
        data.birthYear,
        data.birthNianHaoChn,
        data.birthNhYear,
        data.birthMonth,
        data.birthDay,
        data.birthIntercalary
      ),

      // Death information
      deathYear: data.deathYear,
      deathNianHaoId: data.deathNhCode,
      deathNianHaoChn: data.deathNianHaoChn,
      deathNianHao: data.deathNianHao,
      deathNianHaoYear: data.deathNhYear,
      deathMonth: data.deathMonth,
      deathDay: data.deathDay,
      deathIntercalary: data.deathIntercalary === 1,
      deathDayGanzhi: data.deathDayGz,
      deathRange: data.deathRange,
      deathDisplay: this.formatDateDisplay(
        data.deathYear,
        data.deathNianHaoChn,
        data.deathNhYear,
        data.deathMonth,
        data.deathDay,
        data.deathIntercalary
      ),

      // Age information
      deathAge: data.deathAge,
      deathAgeRange: data.deathAgeRange,
      ageDisplay: data.deathAge ? `${data.deathAge}歲` : '',

      // Floruit years
      floruitEarliestYear: data.floruitEarliestYear,
      floruitEarliestNianHaoId: data.floruitEyNhCode,
      floruitEarliestNianHaoChn: data.floruitEyNianHaoChn,
      floruitEarliestNianHaoYear: data.floruitEyNhYear,
      floruitLatestYear: data.floruitLatestYear,
      floruitLatestNianHaoId: data.floruitLyNhCode,
      floruitLatestNianHaoChn: data.floruitLyNianHaoChn,
      floruitLatestNianHaoYear: data.floruitLyNhYear,
      floruitDisplay: this.formatFloruitDisplay(
        data.floruitEarliestYear,
        data.floruitLatestYear
      ),

      // Index year
      indexYear: data.indexYear,
      indexYearTypeCode: data.indexYearTypeCode,
      indexYearTypeDesc: data.indexYearTypeDesc,
      indexYearTypeDescChn: data.indexYearTypeDescChn,
      indexYearDisplay: this.formatIndexYearDisplay(
        data.indexYear,
        data.indexYearTypeDescChn || data.indexYearTypeDesc
      ),

      // Dynasty
      dynasty: data.dynasty,
      dynastyChn: data.dynastyChn,
      dynastyPinyin: data.dynastyPinyin,

      // Additional biographical fields from Access form
      choronymChn: data.choronymChn,
      choronym: data.choronym,
      ethnicityCode: data.ethnicityCode,
      ethnicityChn: data.ethnicityChn || '未詳',  // Default to "unknown" if null
      ethnicity: data.ethnicity || 'unknown',
      householdStatusChn: data.householdStatusChn || '未詳',
      householdStatus: data.householdStatus || 'Unknown',

      // Year ranges with descriptions from YEAR_RANGE_CODES
      birthYearRange: data.birthRangeDescChn || data.birthRangeDesc || '',
      deathYearRange: data.deathRangeDescChn || data.deathRangeDesc || '',

      // Floruit notes
      floruitEarliestNote: data.floruitEarliestNote,
      floruitLatestNote: data.floruitLatestNote
    };
  }

  /**
   * Format date for display - follows Access form date display logic
   *
   * Display priority:
   * 1. If Nian Hao exists: "{NianHao}{Year}年" (e.g., "天禧5年")
   * 2. Add absolute year in parentheses if available: "(1021)"
   * 3. Add month with intercalary prefix if applicable: "閏3月" or "3月"
   * 4. Add day if available: "15日"
   *
   * The intercalary flag (c_by_intercalary) indicates a leap month in the
   * Chinese lunar calendar, requiring the "閏" prefix.
   *
   * @param year Absolute year (e.g., 1021)
   * @param nianHaoChn Chinese name of reign period (e.g., "天禧")
   * @param nhYear Year within the reign period (e.g., 5)
   * @param month Month number (1-12)
   * @param day Day of month (1-31)
   * @param intercalary Flag for intercalary/leap month (0 or 1)
   * @returns Formatted date string matching Access display
   */
  private formatDateDisplay(
    year?: number,
    nianHaoChn?: string,
    nhYear?: number,
    month?: number,
    day?: number,
    intercalary?: number
  ): string {
    if (!year && !nianHaoChn) {
      return '';
    }

    let display = '';

    // Year or Nian Hao
    if (nianHaoChn && nhYear) {
      display = `${nianHaoChn}${nhYear}年`;
      if (year) {
        display += `(${year})`;
      }
    } else if (year) {
      display = `${year}年`;
    }

    // Month
    if (month) {
      display += intercalary === 1 ? `閏${month}月` : `${month}月`;
    }

    // Day
    if (day) {
      display += `${day}日`;
    }

    return display;
  }

  /**
   * Format floruit years for display
   *
   * Floruit years (fl. = "flourished") indicate when a person was active,
   * used when exact birth/death dates are unknown. CBDB calculates these
   * from documented activities (office appointments, examinations, etc.).
   *
   * @param earliest Earliest documented year of activity
   * @param latest Latest documented year of activity
   * @returns Standard floruit notation (e.g., "fl. 1050-1080")
   */
  private formatFloruitDisplay(earliest?: number, latest?: number): string {
    if (!earliest && !latest) {
      return '';
    }

    if (earliest && latest) {
      return `fl. ${earliest}-${latest}`;
    } else if (earliest) {
      return `fl. ${earliest}-`;
    } else {
      return `fl. -${latest}`;
    }
  }

  /**
   * Format index year for display
   *
   * Index year is CBDB's calculated field for chronological sorting.
   * The type indicates which date was used for calculation:
   * - 01: Based on Birth Year (據生年)
   * - 02: Based on Death Year (據卒年)
   * - 03: Based on Floruit (據在世始年/終年)
   * - etc.
   *
   * This allows consistent chronological ordering even when people have
   * different types of date information available.
   *
   * @param year The calculated index year
   * @param typeDesc Description of calculation basis (Chinese or English)
   * @returns Formatted display (e.g., "1021 (據生年)")
   */
  private formatIndexYearDisplay(year?: number, typeDesc?: string): string {
    if (!year) {
      return '';
    }

    if (typeDesc) {
      return `${year} (${typeDesc})`;
    } else {
      return `${year}`;
    }
  }

  /**
   * Get simplified birth/death view for lists
   */
  async getPersonBirthDeathSummary(personId: number): Promise<PersonBirthDeathSummaryView | null> {
    const db = this.cbdbConnection.getDb();

    const result = await db
      .select({
        personId: BIOG_MAIN.c_personid,
        nameChn: BIOG_MAIN.c_name_chn,
        name: BIOG_MAIN.c_name,
        birthYear: BIOG_MAIN.c_birthyear,
        deathYear: BIOG_MAIN.c_deathyear,
        deathAge: BIOG_MAIN.c_death_age,
        indexYear: BIOG_MAIN.c_index_year
      })
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_personid, personId))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const data = result[0];
    return {
      personId: data.personId,
      nameChn: data.nameChn,
      name: data.name,
      birthYear: data.birthYear,
      birthDisplay: data.birthYear ? `${data.birthYear}` : '',
      deathYear: data.deathYear,
      deathDisplay: data.deathYear ? `${data.deathYear}` : '',
      ageDisplay: data.deathAge ? `${data.deathAge}` : '',
      lifespan: this.formatLifespan(data.birthYear, data.deathYear),
      indexYear: data.indexYear,
      indexYearDisplay: data.indexYear ? `${data.indexYear}` : ''
    };
  }

  /**
   * Format lifespan for display
   */
  private formatLifespan(birthYear?: number | null, deathYear?: number | null): string {
    if (birthYear && deathYear) {
      return `${birthYear}-${deathYear}`;
    } else if (birthYear) {
      return `${birthYear}-`;
    } else if (deathYear) {
      return `-${deathYear}`;
    } else {
      return '';
    }
  }
}