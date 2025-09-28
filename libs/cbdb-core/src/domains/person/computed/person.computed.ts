/**
 * Computed fields for Person domain
 * These models add calculated/derived fields from existing data
 * Different from extended models which load related data
 */

import { PersonModel } from '../models/person.model';

/**
 * Person with formatted display name
 * Combines name fields for display purposes
 */
export class PersonWithDisplayName extends PersonModel {
  public displayNameChinese: string = '';  // Computed from nameChn + indexName
  public displayNameEnglish: string = '';  // Computed from name fields
}

/**
 * Person with computed age fields
 * Calculates age-related information
 */
export class PersonWithComputedAge extends PersonModel {
  public ageAtDeath?: number;  // Computed from birthYear and deathYear
  public lifespan?: string;    // Formatted as "birthYear - deathYear"
}

// Additional computed types will be added as needed