/**
 * PersonSuggestionDataView - Lightweight projection for autocomplete
 *
 * Purpose: Minimal data needed for person selection in autocomplete/search
 * This is a DataView (not a Model) because it's a purpose-specific projection
 * optimized for fast autocomplete responses.
 */
export class PersonSuggestionDataView {
  id: number;
  name: string | null;
  nameChn: string | null;
  birthYear: number | null;
  deathYear: number | null;
  indexYear: number | null;
  dynastyCode: number | null;
  dynasty: string | null;
  dynastyChn: string | null;

  constructor(data: {
    id: number;
    name: string | null;
    nameChn: string | null;
    birthYear: number | null;
    deathYear: number | null;
    indexYear: number | null;
    dynastyCode: number | null;
    dynasty: string | null;
    dynastyChn: string | null;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.nameChn = data.nameChn;
    this.birthYear = data.birthYear;
    this.deathYear = data.deathYear;
    this.indexYear = data.indexYear;
    this.dynastyCode = data.dynastyCode;
    this.dynasty = data.dynasty;
    this.dynastyChn = data.dynastyChn;
  }
}