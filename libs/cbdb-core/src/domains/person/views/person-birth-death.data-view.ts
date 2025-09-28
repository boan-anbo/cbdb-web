/**
 * Person Birth/Death Year Data Views
 *
 * This file defines view contracts for displaying birth and death year information
 * from the Person Browser's biographical tab (Access BIOG_MAIN form).
 *
 * These views shape data for consumption, handling:
 * - Absolute years and reign periods (Nian Hao)
 * - Intercalary months (閏月)
 * - Floruit years when birth/death unknown
 * - Age calculations and index year display
 *
 * IMPORTANT TABLE DISTINCTIONS:
 * - CHORONYM_CODES: Contains ancestral place names (郡望) like 太原 (Taiyuan)
 *   Used for clan/family origins, NOT physical addresses
 * - ADDR_CODES: Contains actual location/address data like 廣東省 (Guangdong Province)
 *   Used for birthplace, residence, etc., NOT for choronym
 * - Never confuse these two tables - they serve completely different purposes!
 */

/**
 * Complete birth/death year view for person detail display
 * Replicates the Access form's birth/death year tab display
 */
export interface PersonBirthDeathView {
  // Basic identification
  personId: number;
  nameChn?: string;
  name?: string;
  surnameChn?: string;  // 姓 surname
  surname?: string;
  mingziChn?: string;  // 名 given name
  mingzi?: string;

  // Birth information
  birthYear?: number;                    // c_birthyear - absolute year
  birthNianHaoId?: number;              // c_by_nh_code - reign period ID
  birthNianHaoChn?: string;              // Chinese name of reign period (e.g., "開元")
  birthNianHao?: string;                 // Romanized name of reign period
  birthNianHaoYear?: number;             // c_by_nh_year - year within reign
  birthMonth?: number;                   // c_by_month (1-12)
  birthDay?: number;                     // c_by_day (1-31)
  birthIntercalary?: boolean;           // c_by_intercalary - is intercalary month
  birthDayGanzhi?: number;              // c_by_day_gz - day in Ganzhi cycle
  birthRange?: number;                  // c_by_range - approximation code
  birthRangeDesc?: string;              // Description of approximation (e.g., "circa")
  birthDisplay: string;                  // Formatted for display (e.g., "開元3年閏3月15日")

  // Death information
  deathYear?: number;                   // c_deathyear - absolute year
  deathNianHaoId?: number;              // c_dy_nh_code
  deathNianHaoChn?: string;             // Chinese name of reign period
  deathNianHao?: string;                // Romanized name
  deathNianHaoYear?: number;            // c_dy_nh_year
  deathMonth?: number;                  // c_dy_month
  deathDay?: number;                    // c_dy_day
  deathIntercalary?: boolean;           // c_dy_intercalary
  deathDayGanzhi?: number;              // c_dy_day_gz
  deathRange?: number;                  // c_dy_range
  deathRangeDesc?: string;              // Description of approximation
  deathDisplay: string;                 // Formatted for display

  // Age information
  deathAge?: number;                    // c_death_age - pre-calculated in DB
  deathAgeRange?: number;               // c_death_age_range - approximation
  ageDisplay: string;                   // Formatted (e.g., "66歲" or "66 years")

  // Floruit years (active years when birth/death unknown)
  floruitEarliestYear?: number;        // c_fl_earliest_year
  floruitEarliestNianHaoId?: number;   // c_fl_ey_nh_code
  floruitEarliestNianHaoChn?: string;  // Reign period name
  floruitEarliestNianHaoYear?: number; // c_fl_ey_nh_year
  floruitLatestYear?: number;          // c_fl_latest_year
  floruitLatestNianHaoId?: number;     // c_fl_ly_nh_code
  floruitLatestNianHaoChn?: string;    // Reign period name
  floruitLatestNianHaoYear?: number;   // c_fl_ly_nh_year
  floruitDisplay: string;               // Formatted (e.g., "fl. 1050-1080")

  // Index year (for chronological sorting)
  indexYear?: number;                   // c_index_year - pre-calculated
  indexYearTypeCode?: string;          // c_index_year_type_code
  indexYearTypeDesc?: string;          // English description
  indexYearTypeDescChn?: string;       // Chinese description (e.g., "據生年")
  indexYearDisplay: string;            // Formatted (e.g., "1021 (Based on Birth Year)")

  // Dynasty information
  dynasty?: number;                     // c_dynasty
  dynastyChn?: string;                 // Dynasty Chinese name
  dynastyPinyin?: string;              // Dynasty romanized name

  // Additional biographical fields from Access form Birth/Death tab
  // CHORONYM - Ancestral Place Name (郡望)
  // FROM: CHORONYM_CODES table via BIOG_MAIN.c_choronym_code
  // NOTE: This is NOT from ADDR_CODES! Choronym represents ancestral/clan origin,
  // not actual birthplace. E.g., Wang clan's choronym is 太原 (Taiyuan) regardless
  // of where individual members were actually born.
  choronymChn?: string;                // Chinese choronym (e.g., "太原")
  choronym?: string;                   // Romanized choronym (e.g., "Taiyuan")

  // ETHNICITY - Ethnic Group (種族)
  // FROM: ETHNICITY_TRIBE_CODES table via BIOG_MAIN.c_ethnicity_code
  ethnicityCode?: number;              // Ethnicity code from BIOG_MAIN
  ethnicityChn?: string;               // Chinese ethnicity (e.g., "漢族", "未詳")
  ethnicity?: string;                  // Romanized ethnicity (e.g., "Han", "unknown")

  // HOUSEHOLD STATUS - Registration Type (戶籍狀態)
  // FROM: HOUSEHOLD_STATUS_CODES table via BIOG_MAIN.c_household_status_code
  householdStatusChn?: string;         // Chinese status (e.g., "士族", "庶民")
  householdStatus?: string;            // Romanized status (e.g., "Gentry", "Commoner")

  // Birth/Death year ranges (生年時限/卒年時限)
  birthYearRange?: string;             // Birth year range display
  deathYearRange?: string;             // Death year range display

  // Source tracking
  sourceId?: string;                   // Source ID field from Access form

  // Floruit notes (在世始年注/在世終年注)
  floruitEarliestNote?: string;        // Note about earliest floruit year
  floruitLatestNote?: string;          // Note about latest floruit year
}

/**
 * Simplified birth/death view for search results
 * Contains only essential date information for list display
 */
export interface PersonBirthDeathSummaryView {
  personId: number;
  nameChn?: string | null;
  name?: string | null;

  birthYear?: number | null;
  birthDisplay: string;                // Simple display (e.g., "1021")

  deathYear?: number | null;
  deathDisplay: string;               // Simple display (e.g., "1086")

  ageDisplay: string;                 // Simple age (e.g., "66")
  lifespan: string;                   // Combined (e.g., "1021-1086")

  indexYear?: number | null;
  indexYearDisplay: string;           // Simple display for lists
}

/**
 * Input type for querying birth/death information
 */
export interface PersonBirthDeathQuery {
  personId: number;
  includeNianHao?: boolean;           // Whether to join NIAN_HAO tables
  includeDynasty?: boolean;           // Whether to join DYNASTY_CODES
  includeRangeDesc?: boolean;         // Whether to join YEAR_RANGE_CODES
  language?: 'en' | 'zh';             // Display language preference
}

/**
 * Formatting options for date display
 */
export interface DateFormatOptions {
  includeNianHao?: boolean;           // Show reign period
  includeMonth?: boolean;             // Show month
  includeDay?: boolean;              // Show day
  showIntercalary?: boolean;          // Show 閏 prefix
  language?: 'en' | 'zh';            // Display language
  format?: 'full' | 'year' | 'short'; // Display format
}