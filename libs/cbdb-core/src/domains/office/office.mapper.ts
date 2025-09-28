import { Office } from './models/office.model';
import {
  OfficeInfo,
  AppointmentTypeInfo,
  AssumeOfficeInfo,
  PostingAddressInfo,
  NianHaoInfo,
  YearRangeInfo,
  SourceTextInfo,
  OfficeWithFullRelations
} from './models/office.model.extended';
import { toNumberOrNull, toStringOrNull } from '../../utils/type-conversions';
import type { OfficeDataWithRelations } from '../../schemas/extended/office.extended';
import type { InferSelectModel } from 'drizzle-orm';
import type {
  OFFICE_CODES,
  APPOINTMENT_CODES,
  ASSUME_OFFICE_CODES,
  ADDR_CODES,
  NIAN_HAO,
  YEAR_RANGE_CODES,
  TEXT_CODES,
  POSTED_TO_OFFICE_DATA
} from '../../schemas/schema';

export type { OfficeDataWithRelations };

type OfficeRecord = InferSelectModel<typeof POSTED_TO_OFFICE_DATA>;
type OfficeCodeRecord = InferSelectModel<typeof OFFICE_CODES>;
type AppointmentCodeRecord = InferSelectModel<typeof APPOINTMENT_CODES>;
type AssumeOfficeCodeRecord = InferSelectModel<typeof ASSUME_OFFICE_CODES>;
type AddressRecord = InferSelectModel<typeof ADDR_CODES>;
type NianHaoRecord = InferSelectModel<typeof NIAN_HAO>;
type YearRangeRecord = InferSelectModel<typeof YEAR_RANGE_CODES>;
type TextCodeRecord = InferSelectModel<typeof TEXT_CODES>;

/**
 * Maps POSTED_TO_OFFICE_DATA database record to OfficeModel domain model
 * Maps ALL fields from the database to ensure completeness
 */
export function mapOfficeDataToOffice(record: OfficeDataWithRelations): Office {
  return {
    // Core identifiers
    personId: record.c_personid || null,
    officeId: record.c_office_id,
    postingId: record.c_posting_id,
    postingIdOld: record.c_posting_id_old || null,

    // Sequencing
    sequence: record.c_sequence || null,

    // Term of service
    firstYear: record.c_firstyear || null,
    lastYear: record.c_lastyear || null,

    // First year details (reign period dating)
    firstYearNhCode: record.c_fy_nh_code || null,
    firstYearNhYear: record.c_fy_nh_year || null,
    firstYearRange: record.c_fy_range || null,
    firstYearIntercalary: record.c_fy_intercalary || '0',
    firstYearMonth: record.c_fy_month || null,
    firstYearDay: record.c_fy_day || null,
    firstYearDayGz: record.c_fy_day_gz || null,

    // Last year details (reign period dating)
    lastYearNhCode: record.c_ly_nh_code || null,
    lastYearNhYear: record.c_ly_nh_year || null,
    lastYearRange: record.c_ly_range || null,
    lastYearIntercalary: record.c_ly_intercalary || '0',
    lastYearMonth: record.c_ly_month || null,
    lastYearDay: record.c_ly_day || null,
    lastYearDayGz: record.c_ly_day_gz || null,

    // Appointment details
    appointmentCode: record.c_appt_code || null,
    assumeOfficeCode: record.c_assume_office_code || null,

    // Institution information
    instCode: record.c_inst_code || null,
    instNameCode: record.c_inst_name_code || null,

    // Source documentation
    source: record.c_source || null,
    pages: record.c_pages ? String(record.c_pages) : null,
    notes: record.c_notes ? String(record.c_notes) : null,

    // Additional office fields
    officeIdBackup: record.c_office_id_backup || null,
    officeCategoryId: record.c_office_category_id || null,

    // Dynasty context
    dynastyCode: record.c_dy || null,

    // Audit trail
    createdBy: record.c_created_by ? String(record.c_created_by) : null,
    createdDate: record.c_created_date ? String(record.c_created_date) : null,
    modifiedBy: record.c_modified_by ? String(record.c_modified_by) : null,
    modifiedDate: record.c_modified_date ? String(record.c_modified_date) : null
  };
}

/**
 * Maps an array of POSTED_TO_OFFICE_DATA records to Office array
 */
export function mapOfficeDataArrayToOffice(records: OfficeDataWithRelations[]): Office[] {
  return records.map(mapOfficeDataToOffice);
}

/**
 * Maps database record directly to Office
 */
export function fromDb(record: OfficeRecord): Office {
  return new Office(
    record.c_personid || null,
    record.c_office_id,
    record.c_posting_id,
    record.c_posting_id_old || null,
    record.c_sequence || null,
    record.c_firstyear || null,
    record.c_lastyear || null,
    record.c_fy_nh_code || null,
    record.c_fy_nh_year || null,
    record.c_fy_range || null,
    record.c_fy_intercalary || '0',
    record.c_fy_month || null,
    record.c_fy_day || null,
    record.c_fy_day_gz || null,
    record.c_ly_nh_code || null,
    record.c_ly_nh_year || null,
    record.c_ly_range || null,
    record.c_ly_intercalary || '0',
    record.c_ly_month || null,
    record.c_ly_day || null,
    record.c_ly_day_gz || null,
    record.c_appt_code || null,
    record.c_assume_office_code || null,
    record.c_inst_code || null,
    record.c_inst_name_code || null,
    record.c_source || null,
    record.c_pages ? String(record.c_pages) : null,
    record.c_notes ? String(record.c_notes) : null,
    record.c_office_id_backup || null,
    record.c_office_category_id || null,
    record.c_dy || null,
    record.c_created_by ? String(record.c_created_by) : null,
    record.c_created_date ? String(record.c_created_date) : null,
    record.c_modified_by ? String(record.c_modified_by) : null,
    record.c_modified_date ? String(record.c_modified_date) : null
  );
}

/**
 * Maps OFFICE_CODES record to OfficeInfo
 */
export function mapOfficeInfo(record: OfficeCodeRecord): OfficeInfo {
  return new OfficeInfo(
    record.c_office_id,
    toStringOrNull(record.c_office_chn), // nameChn
    null, // nameEng (not in schema)
    toStringOrNull(record.c_office_pinyin), // pinyin
    toStringOrNull(record.c_category_1), // category (using category_1)
    null // categoryChn (not in schema)
  );
}

/**
 * Maps APPOINTMENT_CODES record to AppointmentTypeInfo
 */
export function mapAppointmentTypeInfo(record: AppointmentCodeRecord): AppointmentTypeInfo {
  return new AppointmentTypeInfo(
    record.c_appt_code,
    toStringOrNull(record.c_appt_desc),
    toStringOrNull(record.c_appt_desc_chn)
  );
}

/**
 * Maps ASSUME_OFFICE_CODES record to AssumeOfficeInfo
 */
export function mapAssumeOfficeInfo(record: AssumeOfficeCodeRecord): AssumeOfficeInfo {
  return new AssumeOfficeInfo(
    record.c_assume_office_code,
    record.c_assume_office_desc ? String(record.c_assume_office_desc) : null,
    record.c_assume_office_desc_chn ? String(record.c_assume_office_desc_chn) : null
  );
}

/**
 * Maps POSTED_TO_ADDR_DATA and ADDRESSES records to PostingAddressInfo
 */
export function mapPostingAddressInfo(
  address: AddressRecord | null
): PostingAddressInfo | null {
  if (!address) return null;

  return new PostingAddressInfo(
    toNumberOrNull(address.c_addr_id),
    toStringOrNull(address.c_name),
    toStringOrNull(address.c_name_chn)
  );
}

/**
 * Maps NIAN_HAO record to NianHaoInfo
 */
export function mapNianHaoInfo(record: NianHaoRecord): NianHaoInfo {
  return new NianHaoInfo(
    toNumberOrNull(record.c_nianhao_id),
    toStringOrNull(record.c_nianhao_chn),
    toStringOrNull(record.c_nianhao_pin), // c_nianhao_pin not c_nianhao_pinyin
    toNumberOrNull(record.c_firstyear),
    toNumberOrNull(record.c_lastyear),
    toStringOrNull(record.c_dynasty_chn) // c_dynasty_chn not c_dynasty
  );
}

/**
 * Maps YEAR_RANGE_CODES record to YearRangeInfo
 */
export function mapYearRangeInfo(record: YearRangeRecord): YearRangeInfo {
  return new YearRangeInfo(
    toNumberOrNull(record.c_range_code), // c_range_code not c_year_range_code
    toStringOrNull(record.c_range), // c_range not c_year_range
    toStringOrNull(record.c_range_chn), // c_range_chn not c_year_range_chn
    toStringOrNull(record.c_approx),
    toStringOrNull(record.c_approx_chn)
  );
}

/**
 * Maps TEXT_CODES record to SourceTextInfo
 */
export function mapSourceTextInfo(record: TextCodeRecord): SourceTextInfo {
  return new SourceTextInfo(
    record.c_textid, // c_textid not c_text_code
    toStringOrNull(record.c_title),
    toStringOrNull(record.c_title_chn),
    null, // c_author not available in schema
    null // c_author_chn not available in schema
  );
}

/**
 * Creates OfficeWithFullRelations from office record and all related records
 */
export function withFullRelations(
  officeRecord: OfficeRecord,
  officeCode?: OfficeCodeRecord | null,
  appointmentCode?: AppointmentCodeRecord | null,
  assumeOfficeCode?: AssumeOfficeCodeRecord | null,
  address?: AddressRecord | null,
  firstYearNianHao?: NianHaoRecord | null,
  lastYearNianHao?: NianHaoRecord | null,
  firstYearRange?: YearRangeRecord | null,
  lastYearRange?: YearRangeRecord | null,
  sourceText?: TextCodeRecord | null
): OfficeWithFullRelations {
  // Create base office
  const office = fromDb(officeRecord);

  // Create extended model
  const officeWithRelations = Object.assign(
    Object.create(Office.prototype),
    office
  ) as OfficeWithFullRelations;

  // Add relations
  if (officeCode) {
    officeWithRelations.officeInfo = mapOfficeInfo(officeCode);
  }
  if (appointmentCode) {
    officeWithRelations.appointmentInfo = mapAppointmentTypeInfo(appointmentCode);
  }
  if (assumeOfficeCode) {
    officeWithRelations.assumeOfficeInfo = mapAssumeOfficeInfo(assumeOfficeCode);
  }
  if (address) {
    officeWithRelations.postingAddress = mapPostingAddressInfo(address);
  }
  if (firstYearNianHao) {
    officeWithRelations.firstYearNianHao = mapNianHaoInfo(firstYearNianHao);
  }
  if (lastYearNianHao) {
    officeWithRelations.lastYearNianHao = mapNianHaoInfo(lastYearNianHao);
  }
  if (firstYearRange) {
    officeWithRelations.firstYearRangeInfo = mapYearRangeInfo(firstYearRange);
  }
  if (lastYearRange) {
    officeWithRelations.lastYearRangeInfo = mapYearRangeInfo(lastYearRange);
  }
  if (sourceText) {
    officeWithRelations.sourceInfo = mapSourceTextInfo(sourceText);
  }

  return officeWithRelations;
}