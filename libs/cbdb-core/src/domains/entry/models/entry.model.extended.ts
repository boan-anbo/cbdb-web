/**
 * Extended Entry Models with Relations
 * These types include nested data from related tables
 */

import { Entry } from './entry.model';

/**
 * Entry type information from ENTRY_CODES table
 */
export class EntryTypeInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public description: string | null,
    public descriptionChn: string | null
  ) {}
}

/**
 * Entry kinship person information from BIOG_MAIN table
 */
export class EntryKinPersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public birthYear: number | null,
    public deathYear: number | null
  ) {}
}

/**
 * Associated person information from BIOG_MAIN table
 */
export class EntryAssocPersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public birthYear: number | null,
    public deathYear: number | null
  ) {}
}

/**
 * Entry location information from ADDRESSES table
 */
export class EntryLocationInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public prefectureId: number | null,
    public prefectureName: string | null,
    public prefectureNameChn: string | null,
    public provinceId: number | null,
    public provinceName: string | null,
    public provinceNameChn: string | null
  ) {}
}

/**
 * Person information class for Entry
 */
export class EntryPersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Entry with entry type information
 */
export class EntryWithTypeInfo extends Entry {
  public entryTypeInfo: EntryTypeInfo | null = null;
}

/**
 * Entry with kinship person information
 */
export class EntryWithKinPerson extends Entry {
  public kinPerson: EntryKinPersonInfo | null = null;
}

/**
 * Entry with associated person information
 */
export class EntryWithAssocPerson extends Entry {
  public assocPerson: EntryAssocPersonInfo | null = null;
}

/**
 * Entry with exam location information
 */
export class EntryWithLocation extends Entry {
  public entryLocation: EntryLocationInfo | null = null;
}

/**
 * Entry with all relations loaded
 */
export class EntryWithFullRelations extends Entry {
  public entryTypeInfo: EntryTypeInfo | null = null;
  public kinPerson: EntryKinPersonInfo | null = null;
  public assocPerson: EntryAssocPersonInfo | null = null;
  public entryLocation: EntryLocationInfo | null = null;
}

/**
 * Entry with person information (when loaded in reverse)
 */
export class EntryWithPersonInfo extends Entry {
  public person: EntryPersonInfo | null = null;
}