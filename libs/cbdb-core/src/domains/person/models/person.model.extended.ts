/**
 * Extended Person Models with Relations
 * These types include nested data from related tables
 */

import { PersonModel } from './person.model';
import { Kinship } from '../../kinship/models/kinship.model';
import { Address } from '../../address/models/address.model';
import { Office } from '../../office/models/office.model';
import { OfficeWithFullRelations } from '../../office/models/office.model.extended';
import { Entry } from '../../entry/models/entry.model';
import { Status } from '../../status/models/status.model';
import { AssociationModel } from '../../association/models/association.model';
import { Text } from '../../text/models/text.model';
import { AltName } from '../../altname/models/altname.model';
import { Event } from '../../event/models/event.model';

/**
 * Person with kinship relationships
 */
export class PersonWithKinships extends PersonModel {
  public kinships: Kinship[] = [];
}

/**
 * Person with addresses
 */
export class PersonWithAddresses extends PersonModel {
  public addresses: Address[] = [];
}

/**
 * Person with office appointments
 * Includes full office relations with all lookup data
 */
export class PersonWithOffices extends PersonModel {
  public offices: OfficeWithFullRelations[] = [];
}

/**
 * Person with entry methods
 */
export class PersonWithEntries extends PersonModel {
  public entries: Entry[] = [];
}

/**
 * Person with social/professional statuses
 */
export class PersonWithStatuses extends PersonModel {
  public statuses: Status[] = [];
}

/**
 * Person with social associations
 */
export class PersonWithAssociations extends PersonModel {
  public associations: AssociationModel[] = [];
}

/**
 * Person with text associations
 */
export class PersonWithTexts extends PersonModel {
  public texts: Text[] = [];
}

/**
 * Person with alternative names
 */
export class PersonWithAltNames extends PersonModel {
  public altNames: AltName[] = [];
}

/**
 * Person with life events
 */
export class PersonWithEvents extends PersonModel {
  public events: Event[] = [];
}

export class PersonFullRelations {
  public kinships: Kinship[] = [];
  addresses: Address[] = [];
  offices: Office[] = [];
  entries: Entry[] = [];
  statuses: Status[] = [];
  associations: AssociationModel[] = [];
  texts: Text[] = [];
  events: Event[] = [];
  altNames: AltName[] = [];
}

/**
 * Person with all relations loaded
 */
export class PersonFullExtendedModel {
  public person: PersonModel;
  public fullRelations: PersonFullRelations = new PersonFullRelations();
  constructor(
    personModel: PersonModel,
    fullRelations: PersonFullRelations
  ) {
    this.person = personModel;
    this.fullRelations = fullRelations;
  }
}

export class PersonOptionalRelations {
  public kinships?: Kinship[];
  public addresses?: Address[];
  public offices?: Office[];
  public entries?: Entry[];
  public statuses?: Status[];
  public associations?: AssociationModel[];
  public texts?: Text[];
  public altNames?: AltName[];
  public events?: Event[];
}

/**
 * Person with optional relations (selective loading)
 * Used when you want to load only specific relations
 */
export class PersonOptionalExtendedModel {
  public person: PersonModel;
  public relations: PersonOptionalRelations = new PersonOptionalRelations();
  constructor(
    personModel: PersonModel,
    optionalRelations: PersonOptionalRelations
  ) {
    this.person = personModel;
    this.relations = optionalRelations;
  }
}