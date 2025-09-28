/**
 * Extended Office Models with Relations
 * These types include nested data from related tables
 */

import { Office } from './office.model';

/**
 * Office information from OFFICE_CODES table
 */
export class OfficeInfo {
  constructor(
    public id: number,
    public nameChn: string | null,  // Office Chinese name
    public nameEng: string | null,   // Office English name
    public pinyin: string | null,    // Office pinyin
    public category: string | null,  // Office category
    public categoryChn: string | null // Category Chinese name
  ) {}
}

/**
 * Appointment type information from APPOINTMENT_CODES table
 */
export class AppointmentTypeInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Address information from ADDRESSES table via POSTED_TO_ADDR_DATA
 */
export class PostingAddressInfo {
  constructor(
    public id: number | null,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Nian Hao (reign period) information from NIAN_HAO table
 */
export class NianHaoInfo {
  constructor(
    public id: number | null,
    public nameChn: string | null,
    public pinyin: string | null,
    public firstYear: number | null,
    public lastYear: number | null,
    public dynasty: string | null
  ) {}
}

/**
 * Year range information from YEAR_RANGE_CODES table
 */
export class YearRangeInfo {
  constructor(
    public id: number | null,
    public range: string | null,
    public rangeChn: string | null,
    public approx: string | null,
    public approxChn: string | null
  ) {}
}

/**
 * Assume office information from ASSUME_OFFICE_CODES table
 */
export class AssumeOfficeInfo {
  constructor(
    public id: number | null,
    public description: string | null,
    public descriptionChn: string | null
  ) {}
}

/**
 * Source text information from TEXT_CODES table
 */
export class SourceTextInfo {
  constructor(
    public id: number,
    public title: string | null,
    public titleChn: string | null,
    public author: string | null,
    public authorChn: string | null
  ) {}
}

/**
 * Person information class for Office
 */
export class OfficePersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Office with related office information
 */
export class OfficeWithOfficeInfo extends Office {
  public officeInfo: OfficeInfo | null = null;
}

/**
 * Office with appointment type information
 */
export class OfficeWithAppointmentInfo extends Office {
  public appointmentInfo: AppointmentTypeInfo | null = null;
}

/**
 * Office with posting location information
 */
export class OfficeWithPostingAddress extends Office {
  public postingAddress: PostingAddressInfo | null = null;
}

/**
 * Office with all relations loaded
 * Includes all lookup table data needed for display
 */
export class OfficeWithFullRelations extends Office {
  // Core office information
  public officeInfo: OfficeInfo | null = null;
  public appointmentInfo: AppointmentTypeInfo | null = null;
  public postingAddress: PostingAddressInfo | null = null;

  // Date-related lookups
  public firstYearNianHao: NianHaoInfo | null = null;
  public lastYearNianHao: NianHaoInfo | null = null;
  public firstYearRangeInfo: YearRangeInfo | null = null;
  public lastYearRangeInfo: YearRangeInfo | null = null;

  // Appointment details
  public assumeOfficeInfo: AssumeOfficeInfo | null = null;

  // Source documentation
  public sourceInfo: SourceTextInfo | null = null;
}

/**
 * Office with person information (when loaded in reverse)
 */
export class OfficeWithPersonInfo extends Office {
  public person: OfficePersonInfo | null = null;
}