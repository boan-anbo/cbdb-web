/**
 * DTOs for person detail operations
 * Clean design without backward compatibility
 */

import { PersonModel } from '../models/person.model';
import { PersonRelationStats } from './person.cqrs';
import { KinshipWithFullRelations } from '../../kinship/models/kinship.model.extended';
import { AssociationFullExtendedModel } from '../../association/models/association.model.extended';
import { OfficeWithFullRelations } from '../../office/models/office.model.extended';
import { Address } from '../../address/models/address.model';
import { Entry } from '../../entry/models/entry.model';
import { Status } from '../../status/models/status.model';
import { Text } from '../../text/models/text.model';
import { Event } from '../../event/models/event.model';
import { AltName } from '../../altname/models/altname.model';

/**
 * Comprehensive person detail result
 * Clean structure with all relations
 */
export class PersonDetailResult {
  person!: PersonModel;  // Using definite assignment assertion since it's always provided via constructor

  // Relations
  kinships?: KinshipWithFullRelations[];
  associations?: AssociationFullExtendedModel[];
  offices?: OfficeWithFullRelations[];
  addresses?: Address[];
  entries?: Entry[];
  statuses?: Status[];
  texts?: Text[];
  events?: Event[];
  alternativeNames?: AltName[];

  // Statistics
  stats?: PersonRelationStats;

  constructor(init?: Partial<PersonDetailResult>) {
    Object.assign(this, init);
  }
}

/**
 * Response wrapping person detail result
 */
export class PersonDetailResponse {
  result: PersonDetailResult | null;
  responseTime?: number;

  constructor(result: PersonDetailResult | null, responseTime?: number) {
    this.result = result;
    this.responseTime = responseTime;
  }
}