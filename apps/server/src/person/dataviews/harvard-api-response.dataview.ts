/**
 * Harvard API Response DataView - Complete structure matching Harvard's CBDB API
 *
 * This represents the exact nested structure returned by Harvard's API.
 * All fields are optional to handle partial data, and all values are strings.
 */

import { PersonBasicInfoDataView } from './person-basic-info.dataview';

// Re-export for convenience
export { PersonBasicInfoDataView };

// Kinship structure
export class PersonKinshipDataView {
  KinPersonId: string = '';
  KinPersonName: string = '';
  KinCode: string = '';
  KinRel: string = '';
  KinRelName: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Address structure
export class PersonAddressDataView {
  AddrTypeId: string = '';
  AddrType: string = '';
  AddrId: string = '';
  AddrName: string = '';
  belongs1_name: string = '';
  belongs1_id: string = '';
  belongs2_name: string = '';
  belongs2_id: string = '';
  belongs3_name: string = '';
  belongs3_id: string = '';
  belongs4_name: string = '';
  belongs4_id: string = '';
  belongs5_name: string = '';
  belongs5_id: string = '';
  MoveCount: string = '';
  FirstYear: string = '';
  LastYear: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Alias structure
export class PersonAliasDataView {
  AliasType: string = '';
  AliasTypeId: string = '';
  AliasName: string = '';
}

// Entry structure
export class PersonEntryDataView {
  EntryType: string = '';
  EntryTypeId: string = '';
  EntryCode: string = '';
  EntryCodeId: string = '';
  RuShiYear: string = '';
  RuShiAge: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Office/Posting structure
export class PersonPostingDataView {
  OfficeId: string = '';
  OfficeName: string = '';
  AddrId: string = '';
  AddrName: string = '';
  FirstYear: string = '';
  FirstYearNianhao: string = '';
  FirstYearNiaohaoYear: string = '';
  FirstYearRange: string = '';
  LastYear: string = '';
  LastYearNianhao: string = '';
  LastYearNianhaoYear: string = '';
  LastYearRange: string = '';
  ChuShouType: string = '';
  WhetherTakesOrNot: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Social Status structure
export class PersonSocialStatusDataView {
  StatusId: string = '';
  StatusName: string = '';
  StatusNameChn: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Association structure
export class PersonAssociationDataView {
  AssocPersonId: string = '';
  AssocPersonName: string = '';
  AssocCode: string = '';
  AssocName: string = '';
  Year: string = '';
  TextTitle: string = '';
  KinPersonId: string = '';
  KinPersonName: string = '';
  KinRelName: string = '';
  AssocKinPersonId: string = '';
  AssocKinPersonName: string = '';
  AssocKinRelName: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Text structure
export class PersonTextDataView {
  TextId: string = '';
  TextTitle: string = '';
  TextType: string = '';
  TextRole: string = '';
  TextRoleId: string = '';
  TextPages: string = '';
  Source: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Source structure
export class PersonSourceDataView {
  Source: string = '';
  SourceId: string = '';
  Pages: string = '';
  Notes: string = '';
}

// Main Person structure containing all sections
export class PersonDataView {
  BasicInfo?: PersonBasicInfoDataView;
  PersonSources?: { Source: PersonSourceDataView[] };
  PersonSourcesAs?: string;
  PersonAliases?: { Alias: PersonAliasDataView[] };
  PersonAddresses?: { Address: PersonAddressDataView[] };
  PersonEntryInfo?: { Entry: PersonEntryDataView | PersonEntryDataView[] };
  PersonKinshipInfo?: { Kinship: PersonKinshipDataView[] };
  PersonPostings?: { Posting: PersonPostingDataView[] };
  PersonSocialStatus?: { SocialStatus: PersonSocialStatusDataView[] };
  PersonSocialAssociation?: { Association: PersonAssociationDataView[] };
  PersonTexts?: { Text: PersonTextDataView[] };
}

// Complete Harvard API Response structure
export class HarvardAPIResponseDataView {
  Package: {
    PersonAuthority: {
      DataSource: string;
      Version: string;
      PersonInfo: {
        Person: PersonDataView;
      };
    };
  };

  constructor() {
    this.Package = {
      PersonAuthority: {
        DataSource: 'CBDB',
        Version: '20131220', // Default version from Harvard API
        PersonInfo: {
          Person: {}
        }
      }
    };
  }
}