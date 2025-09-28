import type { InferSelectModel } from 'drizzle-orm';
import type {
  BIOG_MAIN,
  DYNASTIES,
  NIAN_HAO,
  ETHNICITY_TRIBE_CODES,
  CHORONYM_CODES,
  HOUSEHOLD_STATUS_CODES,
  INDEXYEAR_TYPE_CODES,
  BIOG_ADDR_CODES,
  YEAR_RANGE_CODES,
  GANZHI_CODES,
  ADDR_CODES
} from '../../../schemas/schema';

/**
 * PersonDenormExtraDataViewSchema - Schema type for denormalized person query
 *
 * This type defines the SELECT schema for fetching denormalized person data.
 * It represents the shape of the query result with all joined code tables.
 * This schema type is used with Drizzle's select() to ensure type safety
 * and is then mapped to PersonDenormExtraDataView by the mapper.
 *
 * This acts like a Drizzle-generated schema, providing the exact shape
 * of what we're selecting from the database.
 */
export type PersonDenormExtraDataViewSchema = {
  person: InferSelectModel<typeof BIOG_MAIN>;
  dynasty?: InferSelectModel<typeof DYNASTIES> | null;
  birthNh?: InferSelectModel<typeof NIAN_HAO> | null;
  deathNh?: InferSelectModel<typeof NIAN_HAO> | null;
  flourishedStartNh?: InferSelectModel<typeof NIAN_HAO> | null;
  flourishedEndNh?: InferSelectModel<typeof NIAN_HAO> | null;
  ethnicity?: InferSelectModel<typeof ETHNICITY_TRIBE_CODES> | null;
  choronym?: InferSelectModel<typeof CHORONYM_CODES> | null;
  householdStatus?: InferSelectModel<typeof HOUSEHOLD_STATUS_CODES> | null;
  indexYearType?: InferSelectModel<typeof INDEXYEAR_TYPE_CODES> | null;
  indexAddrType?: InferSelectModel<typeof BIOG_ADDR_CODES> | null;
  birthYearRange?: InferSelectModel<typeof YEAR_RANGE_CODES> | null;
  deathYearRange?: InferSelectModel<typeof YEAR_RANGE_CODES> | null;
  birthYearDayGanzhi?: InferSelectModel<typeof GANZHI_CODES> | null;
  deathYearDayGanzhi?: InferSelectModel<typeof GANZHI_CODES> | null;
  indexAddr?: InferSelectModel<typeof ADDR_CODES> | null;
};