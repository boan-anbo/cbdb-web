import { PersonTableModel } from './models/person.model.table';
import { PersonModel } from './models/person.model';
import { PersonDenormExtraDataView } from './views/person-denorm-extra.data-view';
import { PersonDenormExtraDataViewSchema } from './views/person-denorm-extra.data-view.schema';
import type { InferSelectModel } from 'drizzle-orm';
import type {
  BIOG_MAIN
} from '../../schemas/schema';
import { toStringOrNull } from '../../utils/type-conversions';

type BiogMainRecord = InferSelectModel<typeof BIOG_MAIN>;

/**
 * PersonMapper - Handles four-tier hierarchy transformations
 *
 * Four levels:
 * 1. TableModel - Raw database representation (toTableModel)
 * 2. Model - With trivial joins, THE DEFAULT (toModel)
 * 3. ExtendedModel - With entity relations (toExtendedModel)
 * 4. DataView - Purpose-specific projections (toDataView)
 *
 * Composition pattern: Model = TableModel + PersonDenormExtraDataView
 */
export const personMapper = {
  /**
   * Level 1: Maps BIOG_MAIN record to PersonTableModel (raw database)
   * Uses schema type directly for type safety
   */
  toTableModel(record: BiogMainRecord): PersonTableModel {
    // Schema type passed directly to constructor
    return new PersonTableModel(record);
  },

  /**
   * Maps query result to PersonDenormExtraDataView
   * Used by repository to convert joined query results to denormalized data view
   * Takes the PersonDenormExtraDataViewSchema which is the raw query result
   */
  toDenormExtraDataView(queryResult: PersonDenormExtraDataViewSchema): PersonDenormExtraDataView {
    const denorm = new PersonDenormExtraDataView();

    // Dynasty descriptions
    denorm.dynastyName = queryResult.dynasty ? toStringOrNull(queryResult.dynasty.c_dynasty) : null;
    denorm.dynastyNameChn = queryResult.dynasty ? toStringOrNull(queryResult.dynasty.c_dynasty_chn) : null;

    // Era name descriptions
    denorm.birthYearNhName = queryResult.birthNh ? toStringOrNull(queryResult.birthNh.c_nianhao_pin) : null;
    denorm.birthYearNhNameChn = queryResult.birthNh ? toStringOrNull(queryResult.birthNh.c_nianhao_chn) : null;
    denorm.deathYearNhName = queryResult.deathNh ? toStringOrNull(queryResult.deathNh.c_nianhao_pin) : null;
    denorm.deathYearNhNameChn = queryResult.deathNh ? toStringOrNull(queryResult.deathNh.c_nianhao_chn) : null;
    denorm.flourishedStartYearNhName = queryResult.flourishedStartNh ? toStringOrNull(queryResult.flourishedStartNh.c_nianhao_pin) : null;
    denorm.flourishedStartYearNhNameChn = queryResult.flourishedStartNh ? toStringOrNull(queryResult.flourishedStartNh.c_nianhao_chn) : null;
    denorm.flourishedEndYearNhName = queryResult.flourishedEndNh ? toStringOrNull(queryResult.flourishedEndNh.c_nianhao_pin) : null;
    denorm.flourishedEndYearNhNameChn = queryResult.flourishedEndNh ? toStringOrNull(queryResult.flourishedEndNh.c_nianhao_chn) : null;

    // Ethnicity description
    denorm.ethnicityName = queryResult.ethnicity ? toStringOrNull(queryResult.ethnicity.c_name) : null;
    denorm.ethnicityNameChn = queryResult.ethnicity ? toStringOrNull(queryResult.ethnicity.c_name_chn) : null;

    // Choronym description
    denorm.choronymName = queryResult.choronym ? toStringOrNull(queryResult.choronym.c_choronym_desc) : null;
    denorm.choronymNameChn = queryResult.choronym ? toStringOrNull(queryResult.choronym.c_choronym_chn) : null;

    // Household status description
    denorm.householdStatusName = queryResult.householdStatus ? toStringOrNull(queryResult.householdStatus.c_household_status_desc) : null;
    denorm.householdStatusNameChn = queryResult.householdStatus ? toStringOrNull(queryResult.householdStatus.c_household_status_desc_chn) : null;

    // Index year type description
    denorm.indexYearTypeName = queryResult.indexYearType ? toStringOrNull(queryResult.indexYearType.c_index_year_type_desc) : null;
    denorm.indexYearTypeNameChn = queryResult.indexYearType ? toStringOrNull(queryResult.indexYearType.c_index_year_type_hz) : null;

    // Index address type description
    denorm.indexAddrTypeName = queryResult.indexAddrType ? toStringOrNull(queryResult.indexAddrType.c_addr_desc) : null;
    denorm.indexAddrTypeNameChn = queryResult.indexAddrType ? toStringOrNull(queryResult.indexAddrType.c_addr_desc_chn) : null;

    // Year range descriptions
    denorm.birthYearRange = queryResult.birthYearRange ? toStringOrNull(queryResult.birthYearRange.c_range) : null;
    denorm.birthYearRangeChn = queryResult.birthYearRange ? toStringOrNull(queryResult.birthYearRange.c_range_chn) : null;
    denorm.deathYearRange = queryResult.deathYearRange ? toStringOrNull(queryResult.deathYearRange.c_range) : null;
    denorm.deathYearRangeChn = queryResult.deathYearRange ? toStringOrNull(queryResult.deathYearRange.c_range_chn) : null;

    // Ganzhi date descriptions
    denorm.birthYearDayGz = queryResult.birthYearDayGanzhi ? toStringOrNull(queryResult.birthYearDayGanzhi.c_ganzhi_py) : null;
    denorm.birthYearDayGzChn = queryResult.birthYearDayGanzhi ? toStringOrNull(queryResult.birthYearDayGanzhi.c_ganzhi_chn) : null;
    denorm.deathYearDayGz = queryResult.deathYearDayGanzhi ? toStringOrNull(queryResult.deathYearDayGanzhi.c_ganzhi_py) : null;
    denorm.deathYearDayGzChn = queryResult.deathYearDayGanzhi ? toStringOrNull(queryResult.deathYearDayGanzhi.c_ganzhi_chn) : null;

    // Index address name
    denorm.indexAddrName = queryResult.indexAddr ? toStringOrNull(queryResult.indexAddr.c_name) : null;
    denorm.indexAddrNameChn = queryResult.indexAddr ? toStringOrNull(queryResult.indexAddr.c_name_chn) : null;

    return denorm;
  },

  /**
   * Level 2: Maps BIOG_MAIN + trivial joins to PersonModel (THE DEFAULT)
   * This is what developers expect - includes human-readable descriptions
   * Uses composition pattern: PersonModel = PersonTableModel + PersonDenormExtraDataView
   */
  toModel(
    record: BiogMainRecord,
    denormData: PersonDenormExtraDataView
  ): PersonModel {
    // First create the TableModel
    const tableModel = this.toTableModel(record);

    // Compose into Model using the denormalized data
    return new PersonModel(tableModel, denormData);
  }
};