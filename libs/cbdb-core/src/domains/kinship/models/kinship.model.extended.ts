/**
 * Extended Kinship models with nested relations
 * These models include related data from joined tables
 * All arrays are required (use [] for empty, never undefined)
 */

import { Kinship } from './kinship.model';

/**
 * Kinship type information from KINSHIP_CODES table
 */
export class KinshipTypeInfo {
  constructor(
    public code: number,
    public kinshipType: string | null,
    public kinshipTypeChn: string | null
  ) {}
}

/**
 * Kinship person information from BIOG_MAIN table
 */
export class KinPersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public indexYear: number | null,
    public birthYear: number | null,
    public deathYear: number | null
  ) {}
}

/**
 * Kinship with type information
 * Includes data from KINSHIP_CODES join
 */
export class KinshipWithTypeInfo extends Kinship {
  public kinshipTypeInfo: KinshipTypeInfo = new KinshipTypeInfo(0, null, null);
}

/**
 * Kinship with related person information
 * Includes data from BIOG_MAIN join for the kin person
 */
export class KinshipWithPersonInfo extends Kinship {
  public kinPersonInfo: KinPersonInfo = new KinPersonInfo(0, null, null, null, null, null);
}

/**
 * Kinship source text information from TEXT_CODES table
 */
export class KinshipSourceTextInfo {
  constructor(
    public textId: number,
    public titleChn: string | null,
    public title: string | null
  ) {}
}

/**
 * Kinship with all relations loaded
 * Includes both KINSHIP_CODES and BIOG_MAIN data
 */
export class KinshipWithFullRelations extends Kinship {
  public kinshipTypeInfo: KinshipTypeInfo = new KinshipTypeInfo(0, null, null);
  public kinPersonInfo: KinPersonInfo = new KinPersonInfo(0, null, null, null, null, null);
  public sourceTextInfo?: KinshipSourceTextInfo;
}