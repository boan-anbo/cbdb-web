/**
 * Extended Association models with nested relations
 *
 * ExtendedModel Level (Level 3 of 4-level hierarchy)
 * - Builds on AssociationModel (which includes trivial joins)
 * - Adds entity relations (persons, addresses, institutions)
 * - All database-defined relationships included
 * - NOT "partial/full" - ExtendedModel means ALL relations
 * - Should be handled by orchestrators to avoid circular dependencies
 *
 * All arrays are required (use [] for empty, never undefined)
 */

import { AssociationModel } from './association.model';

/**
 * Association type information from ASSOC_CODES table
 */
export class AssociationTypeInfo {
  constructor(
    public code: number,
    public assocType: string | null,
    public assocTypeChn: string | null
  ) {}
}

/**
 * Person information from BIOG_MAIN table
 */
export class AssocPersonInfo {
  constructor(
    public personId: number,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Association address information from ADDRESSES table
 */
export class AssociationAddressInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Kinship type information from KIN_CODES table
 */
export class AssociationKinshipTypeInfo {
  constructor(
    public code: number,
    public kinType: string | null,
    public kinTypeChn: string | null
  ) {}
}

/**
 * Literary genre information from LITGENRE_CODES table
 */
export class LiteraryGenreInfo {
  constructor(
    public code: number,
    public genre: string | null,
    public genreChn: string | null
  ) {}
}

/**
 * Occasion information from OCCASION_CODES table
 */
export class OccasionInfo {
  constructor(
    public code: number,
    public occasion: string | null,
    public occasionChn: string | null
  ) {}
}

/**
 * Topic information from TOPIC_CODES table
 */
export class TopicInfo {
  constructor(
    public code: number,
    public topic: string | null,
    public topicChn: string | null
  ) {}
}

/**
 * Institution information from INST_CODES/INST_NAME_CODES tables
 */
export class InstitutionInfo {
  constructor(
    public code: number | null,
    public nameCode: number | null,
    public name: string | null,
    public nameChn: string | null
  ) {}
}

/**
 * Nian Hao (reign period) information from NIAN_HAO table
 */
export class AssociationNianHaoInfo {
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
export class AssociationYearRangeInfo {
  constructor(
    public id: number | null,
    public range: string | null,
    public rangeChn: string | null
  ) {}
}

/**
 * Source text information from TEXT_CODES table
 */
export class AssociationSourceTextInfo {
  constructor(
    public id: number,
    public title: string | null,
    public titleChn: string | null,
    public author: string | null,
    public authorChn: string | null
  ) {}
}

/**
 * Association with type information
 * Includes data from ASSOC_CODES join
 */
export class AssociationWithTypeInfo extends AssociationModel {
  public associationTypeInfo: AssociationTypeInfo = new AssociationTypeInfo(0, null, null);
}

/**
 * Association with associated person information
 * Includes data from BIOG_MAIN join for associated person
 */
export class AssociationWithPersonInfo extends AssociationModel {
  public assocPersonInfo: AssocPersonInfo = new AssocPersonInfo(0, null, null);
}

/**
 * Association with kin person information
 * Includes data from BIOG_MAIN joins for kin persons
 */
export class AssociationWithKinInfo extends AssociationModel {
  public kinPersonInfo: AssocPersonInfo = new AssocPersonInfo(0, null, null);
  public assocKinPersonInfo: AssocPersonInfo = new AssocPersonInfo(0, null, null);
}

/**
 * Association with address information
 * Includes data from ADDRESSES join
 */
export class AssociationWithAddressInfo extends AssociationModel {
  public addressInfo: AssociationAddressInfo = new AssociationAddressInfo(0, null, null);
}

/**
 * AssociationFullExtendedModel - Complete association with ALL relations
 *
 * ExtendedModel Level (Level 3 of 4-level hierarchy)
 * - This is the FULL version with ALL database-defined relationships
 * - ExtendedModel = pure composition of models (no shape transformation)
 * - Other ExtendedModel variants can exist with partial relations
 * - Should be composed by orchestrators to avoid circular dependencies
 */
export class AssociationFullExtendedModel extends AssociationModel {
  // Core association information
  public associationTypeInfo: AssociationTypeInfo | null = null;

  // Person information
  public assocPersonInfo: AssocPersonInfo | null = null;
  public kinPersonInfo: AssocPersonInfo | null = null;
  public assocKinPersonInfo: AssocPersonInfo | null = null;
  public tertiaryPersonInfo: AssocPersonInfo | null = null;
  public assocClaimerInfo: AssocPersonInfo | null = null;

  // Kinship type information
  public kinTypeInfo: AssociationKinshipTypeInfo | null = null;
  public assocKinTypeInfo: AssociationKinshipTypeInfo | null = null;

  // Location
  public addressInfo: AssociationAddressInfo | null = null;

  // Date-related lookups
  public firstYearNianHao: AssociationNianHaoInfo | null = null;
  public lastYearNianHao: AssociationNianHaoInfo | null = null;
  public firstYearRangeInfo: AssociationYearRangeInfo | null = null;
  public lastYearRangeInfo: AssociationYearRangeInfo | null = null;

  // Academic and literary context
  public institutionInfo: InstitutionInfo | null = null;
  public literaryGenreInfo: LiteraryGenreInfo | null = null;
  public occasionInfo: OccasionInfo | null = null;
  public topicInfo: TopicInfo | null = null;

  // Source documentation
  public sourceInfo: AssociationSourceTextInfo | null = null;
}