/**
 * Extended AltName Models with Relations
 * These types include nested data from related tables
 */

import { AltName } from './altname.model';

/**
 * Alternative name type information from ALTNAME_TYPES table
 */
export class AltNameTypeInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public description: string | null,
    public descriptionChn: string | null
  ) {}
}

/**
 * AltName with type information
 */
export class AltNameWithTypeInfo extends AltName {
  public altNameTypeInfo: AltNameTypeInfo | null = null;
}

/**
 * Person info embedded in AltName
 */
export class PersonInfo {
  constructor(
    public id: number,
    public name: string | null,
    public nameChn: string | null,
    public birthYear: number | null,
    public deathYear: number | null
  ) {}
}

/**
 * AltName with person information (when loaded in reverse)
 */
export class AltNameWithPersonInfo extends AltName {
  public person: PersonInfo | null = null;
}

/**
 * AltName with full relations
 */
export class AltNameWithFullRelations extends AltName {
  public altNameTypeInfo: AltNameTypeInfo | null = null;
}