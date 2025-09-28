/**
 * Unified CBDB Mapper API
 * Provides a clean, consistent interface for mapping database records to domain models
 */

import { personMapper } from '../domains/person/person.mapper';
import { mapKinDataToKinship, mapKinDataArrayToKinship, mapKinshipCodeFromDb, mapKinshipCodeArrayFromDb } from '../domains/kinship/kinship.mapper';
import { mapToAddress, mapAddressArrayToAddress } from '../domains/address/address.mapper';
import {
  mapOfficeDataArrayToOffice,
  fromDb as mapOfficeFromDb,
  mapOfficeInfo,
  mapAppointmentTypeInfo,
  mapAssumeOfficeInfo,
  mapPostingAddressInfo,
  mapNianHaoInfo,
  mapYearRangeInfo,
  mapSourceTextInfo,
  withFullRelations as officeWithFullRelations
} from '../domains/office/office.mapper';
import { mapEntryDataToEntry, mapEntryDataArrayToEntry } from '../domains/entry/entry.mapper';
import { mapStatusDataToStatus, mapStatusDataArrayToStatus } from '../domains/status/status.mapper';
import { AssociationMapper } from '../domains/association/association.mapper';
import { mapBiogTextDataToText, mapBiogTextDataArrayToText } from '../domains/text/text.mapper';
import { mapAltNameDataToAltName, mapAltNameDataArrayToAltName } from '../domains/altname/altname.mapper';
import { mapEventDataToEvent, mapEventDataArrayToEvent } from '../domains/event/event.mapper';
import { NianHaoMapper } from '../domains/nianhao/nianhao.mapper';

// Create NianHao mapper instance
const nianHaoMapper = new NianHaoMapper();

/**
 * Central mapper for CBDB database records to domain models
 *
 * Usage examples:
 * - cbdbMapper.person.fromDb(biogMainRecord)
 * - cbdbMapper.person.fromDbArray(biogMainRecords)
 * - cbdbMapper.kinship.fromDb(kinDataRecord)
 * - cbdbMapper.kinship.fromDbArray(kinDataRecords)
 */
export const cbdbMapper = {
  person: {
    // Four-tier methods
    toTableModel: personMapper.toTableModel,
    toModel: personMapper.toModel,
    toDenormExtraDataView: personMapper.toDenormExtraDataView,
    toModelArray: (records: any[], denormData: any) => records.map(r => personMapper.toModel(r, denormData))
  },
  kinship: {
    fromDb: mapKinDataToKinship,
    fromDbArray: mapKinDataArrayToKinship,
  },
  kinshipCode: {
    fromDb: mapKinshipCodeFromDb,
    fromDbArray: mapKinshipCodeArrayFromDb,
  },
  address: {
    fromDb: mapToAddress,
    fromDbArray: mapAddressArrayToAddress,
  },
  office: {
    fromDb: mapOfficeFromDb,
    fromDbArray: mapOfficeDataArrayToOffice,
    withFullRelations: officeWithFullRelations,
    mapOfficeInfo,
    mapAppointmentTypeInfo,
    mapAssumeOfficeInfo,
    mapPostingAddressInfo,
    mapNianHaoInfo,
    mapYearRangeInfo,
    mapSourceTextInfo,
  },
  entry: {
    fromDb: mapEntryDataToEntry,
    fromDbArray: mapEntryDataArrayToEntry,
  },
  status: {
    fromDb: mapStatusDataToStatus,
    fromDbArray: mapStatusDataArrayToStatus,
  },
  association: AssociationMapper,
  text: {
    fromDb: mapBiogTextDataToText,
    fromDbArray: mapBiogTextDataArrayToText,
  },
  altname: {
    fromDb: mapAltNameDataToAltName,
    fromDbArray: mapAltNameDataArrayToAltName,
  },
  event: {
    fromDb: mapEventDataToEvent,
    fromDbArray: mapEventDataArrayToEvent,
  },
  nianhao: {
    fromDb: nianHaoMapper.fromDb.bind(nianHaoMapper),
    fromDbArray: nianHaoMapper.fromDbArray.bind(nianHaoMapper),
  },
} as const;

// cbdbMapper should only use models, not export them
// Models are exported from their respective domains