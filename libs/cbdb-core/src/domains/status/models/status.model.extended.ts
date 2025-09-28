/**
 * Extended Status Models with Relations
 * These types include nested data from related tables
 */

import { Status } from './status.model';

/**
 * Status type information from STATUS_CODES table
 */
export class StatusTypeInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public category: string | null,
    public categoryChn: string | null,
    public description: string | null,
    public descriptionChn: string | null
  ) {}
}

/**
 * Person information class for Status
 */
export class StatusPersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public birthYear: number | null,
    public deathYear: number | null
  ) {}
}

/**
 * Status with type information
 */
export class StatusWithTypeInfo extends Status {
  public statusTypeInfo: StatusTypeInfo | null = null;
}

/**
 * Status with person information (when loaded in reverse)
 */
export class StatusWithPersonInfo extends Status {
  public person: StatusPersonInfo | null = null;
}

/**
 * Status with full relations
 */
export class StatusWithFullRelations extends Status {
  public statusTypeInfo: StatusTypeInfo | null = null;
}