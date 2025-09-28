/**
 * HarvardAPIMapper - Transforms our Models into Harvard API DataViews
 *
 * This mapper converts our denormalized Models into the exact format
 * expected by Harvard's CBDB API. All numeric values are converted to strings.
 *
 * TODO: [Architecture] Extract domain logic from mapper
 * - Mappers should ONLY do structural transformation (field mapping, type conversion)
 * - Domain logic should be moved to dedicated services:
 *   - getDynastyForYear() → DynastyService
 *   - getDynastyIdForYear() → DynastyService
 *   - calculateYearsLived() → DateService
 *   - getAltNameType() → Should come from Model's altNameCodeInfo
 * - See CLAUDE.md for mapper principles: no domain logic, only data shape transformation
 */

import { PersonModel } from '@cbdb/core';
import { PersonDetailResult } from '@cbdb/core';
import {
  PersonBasicInfoDataView,
  PersonKinshipDataView,
  PersonAddressDataView,
  PersonAliasDataView,
  PersonEntryDataView,
  PersonPostingDataView,
  PersonSocialStatusDataView,
  PersonAssociationDataView,
  PersonTextDataView,
  PersonSourceDataView,
  PersonDataView,
  HarvardAPIResponseDataView
} from '../dataviews/harvard-api-response.dataview';

export class HarvardAPIMapper {
  /**
   * Convert PersonModel to PersonBasicInfoDataView
   */
  toPersonBasicInfoDataView(person: PersonModel): PersonBasicInfoDataView {
    const view = new PersonBasicInfoDataView();

    // Core identifiers
    view.PersonId = String(person.id);
    view.EngName = person.name || '';
    view.ChName = person.nameChn || '';
    view.IndexYear = person.indexYear ? String(person.indexYear) : '';
    view.IndexAddrId = person.indexAddrId ? String(person.indexAddrId) : '';
    view.IndexAddr = person.indexAddrNameChn || '';
    view.Gender = String(person.female);

    // Birth information
    view.YearBirth = person.birthYear ? String(person.birthYear) : '';
    view.DynastyBirth = this.getDynastyForYear(person.birthYear, person.dynastyNameChn);
    view.DynastyBirthId = this.getDynastyIdForYear(person.birthYear, person.dynastyCode);
    view.EraBirth = person.birthYearNhNameChn || '';
    view.EraBirthId = person.birthYearNhCode ? String(person.birthYearNhCode) : '';
    view.EraYearBirth = person.birthYearNhYear ? String(person.birthYearNhYear) : '';

    // Death information
    view.YearDeath = person.deathYear ? String(person.deathYear) : '';
    view.DynastyDeath = this.getDynastyForYear(person.deathYear, person.dynastyNameChn);
    view.DynastyDeathId = this.getDynastyIdForYear(person.deathYear, person.dynastyCode);
    view.EraDeath = person.deathYearNhNameChn || '';
    view.EraDeathId = person.deathYearNhCode ? String(person.deathYearNhCode) : '';
    view.EraYearDeath = person.deathYearNhYear ? String(person.deathYearNhYear) : '';

    // Lifespan
    view.YearsLived = this.calculateYearsLived(person.birthYear, person.deathYear);

    // Dynasty
    view.Dynasty = person.dynastyNameChn || '';
    view.DynastyId = person.dynastyCode ? String(person.dynastyCode) : '';

    // Choronym (JunWang)
    view.JunWang = person.choronymNameChn || '';
    view.JunWangId = person.choronymCode ? String(person.choronymCode) : '';

    // Notes
    view.Notes = person.notes || '';

    return view;
  }

  /**
   * Convert complete PersonDetailResult to HarvardAPIResponseDataView
   */
  toHarvardAPIResponse(detail: PersonDetailResult): HarvardAPIResponseDataView {
    const response = new HarvardAPIResponseDataView();
    const person = new PersonDataView();

    // Basic Info
    if (detail.person) {
      person.BasicInfo = this.toPersonBasicInfoDataView(detail.person);
    }

    // Alternative Names
    if (detail.alternativeNames && detail.alternativeNames.length > 0) {
      person.PersonAliases = {
        Alias: detail.alternativeNames.map(altName => this.toPersonAliasDataView(altName))
      };
    }

    // Kinships
    if (detail.kinships && detail.kinships.length > 0) {
      person.PersonKinshipInfo = {
        Kinship: detail.kinships.map(kinship => this.toPersonKinshipDataView(kinship))
      };
    }

    // Addresses
    if (detail.addresses && detail.addresses.length > 0) {
      person.PersonAddresses = {
        Address: detail.addresses.map(address => this.toPersonAddressDataView(address))
      };
    }

    // Entries
    if (detail.entries && detail.entries.length > 0) {
      // Harvard API uses single Entry object if only one, array if multiple
      const entries = detail.entries.map(entry => this.toPersonEntryDataView(entry));
      person.PersonEntryInfo = {
        Entry: entries.length === 1 ? entries[0] : entries
      };
    }

    // Offices/Postings
    if (detail.offices && detail.offices.length > 0) {
      person.PersonPostings = {
        Posting: detail.offices.map(office => this.toPersonPostingDataView(office))
      };
    }

    // Social Status
    if (detail.statuses && detail.statuses.length > 0) {
      person.PersonSocialStatus = {
        SocialStatus: detail.statuses.map(status => this.toPersonSocialStatusDataView(status))
      };
    }

    // Associations
    if (detail.associations && detail.associations.length > 0) {
      person.PersonSocialAssociation = {
        Association: detail.associations.map(assoc => this.toPersonAssociationDataView(assoc))
      };
    }

    // Texts
    if (detail.texts && detail.texts.length > 0) {
      person.PersonTexts = {
        Text: detail.texts.map(text => this.toPersonTextDataView(text))
      };
    }

    // PersonSources - Currently we don't have source data in PersonDetailResult
    // TODO: Implement when we have bibliography/source data
    // For now, return empty array to match Harvard API structure
    person.PersonSources = { Source: [] };
    person.PersonSourcesAs = '';

    response.Package.PersonAuthority.PersonInfo.Person = person;
    return response;
  }

  // Helper methods for specific conversions
  private toPersonAliasDataView(altName: any): PersonAliasDataView {
    const view = new PersonAliasDataView();
    view.AliasTypeId = altName.altNameTypeCode ? String(altName.altNameTypeCode) : '';
    // Use the type description from the model (already joined with ALTNAME_CODES)
    view.AliasType = altName.altNameTypeDescChn || altName.altNameTypeDesc || '';
    view.AliasName = altName.altNameChn || altName.altName || '';
    return view;
  }

  private toPersonKinshipDataView(kinship: any): PersonKinshipDataView {
    const view = new PersonKinshipDataView();
    view.KinPersonId = kinship.kinPersonId ? String(kinship.kinPersonId) : '';
    // Access nested kinPersonInfo for name
    view.KinPersonName = kinship.kinPersonInfo?.nameChn || kinship.kinPersonInfo?.name || '';
    view.KinCode = kinship.kinshipCode ? String(kinship.kinshipCode) : '';
    // Access nested kinshipTypeInfo for type info
    view.KinRel = kinship.kinshipTypeInfo?.kinshipType || '';
    view.KinRelName = kinship.kinshipTypeInfo?.kinshipTypeChn || '';
    // TODO: Need to map source ID to source name
    view.Source = kinship.source ? String(kinship.source) : '';
    view.Pages = kinship.pages || '';
    view.Notes = kinship.notes || '';
    return view;
  }

  private toPersonAddressDataView(address: any): PersonAddressDataView {
    const view = new PersonAddressDataView();
    view.AddrTypeId = address.addrTypeCode ? String(address.addrTypeCode) : '';
    view.AddrType = address.addrType || '';
    view.AddrId = address.addrId ? String(address.addrId) : '';
    view.AddrName = address.addrNameChn || address.addrName || '';

    // TODO: Need to implement address hierarchy (belongs1-5)
    view.belongs1_name = '';
    view.belongs1_id = '';
    view.belongs2_name = '';
    view.belongs2_id = '';
    view.belongs3_name = '';
    view.belongs3_id = '';
    view.belongs4_name = '';
    view.belongs4_id = '';
    view.belongs5_name = '';
    view.belongs5_id = '';

    view.MoveCount = address.moveCount ? String(address.moveCount) : '';
    view.FirstYear = address.firstYear ? String(address.firstYear) : '';
    view.LastYear = address.lastYear ? String(address.lastYear) : '';
    view.Source = address.sourceName || '';
    view.Pages = address.pages || '';
    view.Notes = address.notes || '';
    return view;
  }

  private toPersonEntryDataView(entry: any): PersonEntryDataView {
    const view = new PersonEntryDataView();
    // TODO: [Model] Entry should include entryCodeInfo from trivial join
    // - EntryModel should have entryCodeInfo with code descriptions
    // - Repository should join with ENTRY_CODES and include in Model
    // - Then mapper can simply use: entry.entryCodeInfo?.entryTypeChn
    view.EntryTypeId = '040101'; // TODO: Calculate from entry code
    view.EntryType = '進士類'; // TODO: Get from entry code hierarchy
    view.EntryCodeId = entry.entryCode ? String(entry.entryCode) : '';
    view.EntryCode = '科舉: 進士(籠統)'; // TODO: Get from ENTRY_CODES
    view.RuShiYear = entry.year ? String(entry.year) : '';
    view.RuShiAge = entry.age ? String(entry.age) : '';
    // TODO: Map source ID to source name
    view.Source = entry.source ? String(entry.source) : '';
    view.Pages = entry.pages || '';
    view.Notes = entry.notes || '';
    return view;
  }

  private toPersonPostingDataView(office: any): PersonPostingDataView {
    const view = new PersonPostingDataView();
    view.OfficeId = office.officeId ? String(office.officeId) : '';
    // Access nested officeInfo for office name
    view.OfficeName = office.officeInfo?.nameChn || office.officeInfo?.nameEng || '';
    // TODO: Need to map address properly
    view.AddrId = office.addrId ? String(office.addrId) : '';
    view.AddrName = ''; // TODO: Need address info
    view.FirstYear = office.firstYear ? String(office.firstYear) : '';
    // TODO: Need to map nianhao info
    view.FirstYearNianhao = office.firstYearNhCode ? String(office.firstYearNhCode) : '';
    view.FirstYearNiaohaoYear = office.firstYearNhYear ? String(office.firstYearNhYear) : '';
    view.FirstYearRange = office.firstYearRange || '';
    view.LastYear = office.lastYear ? String(office.lastYear) : '';
    view.LastYearNianhao = office.lastYearNhCode ? String(office.lastYearNhCode) : '';
    view.LastYearNianhaoYear = office.lastYearNhYear ? String(office.lastYearNhYear) : '';
    view.LastYearRange = office.lastYearRange || '';
    // TODO: Map appointment/assume office types
    view.ChuShouType = office.appointmentCode ? String(office.appointmentCode) : '';
    view.WhetherTakesOrNot = office.assumeOfficeCode ? '1' : '0';
    // Access nested sourceInfo if available
    view.Source = office.sourceInfo?.name || (office.source ? String(office.source) : '');
    view.Pages = office.pages || '';
    view.Notes = office.notes || '';
    return view;
  }

  private toPersonSocialStatusDataView(status: any): PersonSocialStatusDataView {
    const view = new PersonSocialStatusDataView();
    view.StatusId = status.statusCode ? String(status.statusCode) : '';
    // TODO: [Model] Status should include statusCodeInfo from trivial join
    // - StatusModel should have statusCodeInfo with status descriptions
    // - Repository should join with STATUS_CODES and include in Model
    // - Then mapper can simply use: status.statusCodeInfo?.statusNameChn
    view.StatusName = '書法家'; // TODO: Get from STATUS_CODES
    view.StatusNameChn = '書法家'; // TODO: Get from STATUS_CODES
    // TODO: Map source ID to source name
    view.Source = status.source ? String(status.source) : '';
    view.Pages = status.pages || '';
    view.Notes = status.notes || '';
    return view;
  }

  private toPersonAssociationDataView(assoc: any): PersonAssociationDataView {
    const view = new PersonAssociationDataView();
    view.AssocPersonId = assoc.assocPersonId ? String(assoc.assocPersonId) : '';
    // Access nested assocPersonInfo for name
    view.AssocPersonName = assoc.assocPersonInfo?.nameChn || assoc.assocPersonInfo?.name || '';
    view.AssocCode = assoc.assocCode ? String(assoc.assocCode) : '';
    // Access nested associationTypeInfo for association type name
    view.AssocName = assoc.associationTypeInfo?.assocTypeChn || assoc.associationTypeInfo?.assocType || '';
    view.Year = assoc.firstYear ? String(assoc.firstYear) : '-1';
    view.TextTitle = assoc.textTitle || '';

    // Kinship context - access nested structures
    view.KinPersonId = assoc.kinPersonId ? String(assoc.kinPersonId) : '0';
    view.KinPersonName = assoc.kinPersonInfo?.nameChn || assoc.kinPersonInfo?.name || '未詳';
    view.KinRelName = assoc.kinTypeInfo?.kinshipTypeChn || assoc.kinTypeInfo?.kinshipType || '未詳';
    view.AssocKinPersonId = assoc.assocKinId ? String(assoc.assocKinId) : '0';
    view.AssocKinPersonName = assoc.assocKinPersonInfo?.nameChn || assoc.assocKinPersonInfo?.name || '未詳';
    view.AssocKinRelName = assoc.assocKinTypeInfo?.kinshipTypeChn || assoc.assocKinTypeInfo?.kinshipType || '未詳';

    // TODO: Map source ID to source name
    view.Source = assoc.source ? String(assoc.source) : '';
    view.Pages = assoc.pages || '';
    view.Notes = assoc.notes || '';
    return view;
  }

  private toPersonTextDataView(text: any): PersonTextDataView {
    const view = new PersonTextDataView();
    view.TextId = text.textId ? String(text.textId) : '';
    // TODO: [Model] Text should include textCodeInfo and roleCodeInfo from trivial joins
    // - TextModel should have textCodeInfo from TEXT_CODES join
    // - TextModel should have roleCodeInfo from TEXT_ROLE_CODES join
    // - Repository should include both joins in Model
    // - Then mapper can use: text.textCodeInfo?.title, text.roleCodeInfo?.roleName
    view.TextTitle = ''; // TODO: Get from TEXT_CODES
    view.TextType = ''; // TODO: Get text type from TEXT_CODES
    view.TextRoleId = text.roleId ? String(text.roleId) : '';
    view.TextRole = ''; // TODO: Get from TEXT_ROLE_CODES
    view.TextPages = ''; // TODO: Determine text pages field
    // TODO: Map source ID to source name
    view.Source = text.source ? String(text.source) : '';
    view.Pages = text.pages || '';
    view.Notes = text.notes || '';
    return view;
  }

  // TODO: [Domain Logic] Extract these helper methods to domain services
  // These methods contain domain knowledge and should not be in a mapper:
  // - getDynastyForYear() → Move to DynastyService.getDynastyForYear()
  // - getDynastyIdForYear() → Move to DynastyService.getDynastyIdForYear()
  // - calculateYearsLived() → Move to DateService.calculateChineseAge()
  // Mappers should only transform data shape, not perform domain calculations

  // Helper methods for calculations
  private getDynastyForYear(year: number | null, dynastyName: string | null | undefined): string {
    // TODO: [Extract to DynastyService] This contains dynasty period knowledge
    // Should be: this.dynastyService.getDynastyForYear(year, dynastyName)
    if (!year) return '';

    // Song Dynasty years: 960-1279
    if (year >= 960 && year <= 1127) return '北宋';
    if (year >= 1127 && year <= 1279) return '南宋';

    return dynastyName || '';
  }

  private getDynastyIdForYear(year: number | null, dynastyCode: number | null): string {
    // TODO: [Extract to DynastyService] This contains dynasty code mappings
    // Should be: this.dynastyService.getDynastyIdForYear(year, dynastyCode)
    if (!year) return '';

    // Dynasty codes from schema
    if (year >= 960 && year <= 1279) return '15'; // Song

    return dynastyCode ? String(dynastyCode) : '';
  }


  private calculateYearsLived(birthYear: number | null, deathYear: number | null): string {
    // TODO: [Extract to DateService] This contains Chinese age calculation logic
    // Should be: this.dateService.calculateChineseAge(birthYear, deathYear)
    if (!birthYear || !deathYear) return '';
    const yearsLived = deathYear - birthYear + 1; // Chinese age calculation includes both years
    return String(yearsLived);
  }
}