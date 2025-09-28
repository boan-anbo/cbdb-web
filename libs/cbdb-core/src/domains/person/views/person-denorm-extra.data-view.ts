/**
 * PersonDenormExtraDataView - Extra denormalized data from code tables
 *
 * This DataView contains the denormalized (DENORM) human-readable values
 * from related code tables (trivial joins). These supplement
 * the raw codes in PersonTableModel.
 *
 * Composition pattern:
 * PersonTableModel + PersonDenormExtraDataView = PersonModel
 *
 * Related tables include:
 * - DYNASTIES for dynasty names
 * - NIAN_HAO for era names (birth, death, flourished start/end)
 * - ETHNICITY_TRIBE_CODES for ethnicity descriptions
 * - CHORONYM_CODES for regional identity
 * - HOUSEHOLD_STATUS_CODES for household status
 * - INDEXYEAR_TYPE_CODES for index year type
 * - BIOG_ADDR_CODES for index address type
 * - YEAR_RANGE_CODES for year ranges (birth, death)
 * - GANZHI_CODES for date conversions (birth day, death day)
 * - ADDR_CODES for index address name
 */
export class PersonDenormExtraDataView {
  // Dynasty descriptions (from DYNASTIES)
  dynastyName?: string | null;
  dynastyNameChn?: string | null;

  // Era name descriptions (from NIAN_HAO)
  birthYearNhName?: string | null;
  birthYearNhNameChn?: string | null;
  deathYearNhName?: string | null;
  deathYearNhNameChn?: string | null;
  flourishedStartYearNhName?: string | null;
  flourishedStartYearNhNameChn?: string | null;
  flourishedEndYearNhName?: string | null;
  flourishedEndYearNhNameChn?: string | null;

  // Ethnicity description (from ETHNICITY_TRIBE_CODES)
  ethnicityName?: string | null;
  ethnicityNameChn?: string | null;

  // Choronym description (from CHORONYM_CODES)
  choronymName?: string | null;
  choronymNameChn?: string | null;

  // Household status description (from HOUSEHOLD_STATUS_CODES)
  householdStatusName?: string | null;
  householdStatusNameChn?: string | null;

  // Index year type description (from INDEXYEAR_TYPE_CODES)
  indexYearTypeName?: string | null;
  indexYearTypeNameChn?: string | null;

  // Index address type description (from BIOG_ADDR_CODES)
  indexAddrTypeName?: string | null;
  indexAddrTypeNameChn?: string | null;

  // Index address name (from ADDR_CODES)
  indexAddrName?: string | null;
  indexAddrNameChn?: string | null;

  // Year range descriptions (from YEAR_RANGE_CODES)
  birthYearRange?: string | null;
  birthYearRangeChn?: string | null;
  deathYearRange?: string | null;
  deathYearRangeChn?: string | null;

  // Ganzhi date descriptions (from GANZHI_CODES)
  birthYearDayGz?: string | null;
  birthYearDayGzChn?: string | null;
  deathYearDayGz?: string | null;
  deathYearDayGzChn?: string | null;
}