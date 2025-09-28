/**
 * PersonBasicInfoDataView - Harvard API format for person basic information
 *
 * This DataView transforms our PersonModel into the exact format used by
 * Harvard's CBDB API. All fields are strings to match their API exactly.
 */
export class PersonBasicInfoDataView {
  PersonId: string = '';
  EngName: string = '';
  ChName: string = '';
  IndexYear: string = '';
  IndexAddrId: string = '';
  IndexAddr: string = '';
  Gender: string = '';
  YearBirth: string = '';
  DynastyBirth: string = '';
  DynastyBirthId: string = '';
  EraBirth: string = '';
  EraBirthId: string = '';
  EraYearBirth: string = '';
  YearDeath: string = '';
  DynastyDeath: string = '';
  DynastyDeathId: string = '';
  EraDeath: string = '';
  EraDeathId: string = '';
  EraYearDeath: string = '';
  YearsLived: string = '';
  Dynasty: string = '';
  DynastyId: string = '';
  JunWang: string = '';
  JunWangId: string = '';
  Notes: string = '';

  constructor() {
    // Initialize all fields as empty strings
  }
}