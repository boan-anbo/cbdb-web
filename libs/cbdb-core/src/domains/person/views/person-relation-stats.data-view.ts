import { PersonModel } from '../models/person.model';

/**
 * DataView: Person with relation stats (combines counts and IDs)
 * Purpose-specific projection for comprehensive relation statistics
 */
export class PersonRelationStatsDataView {
  public person: PersonModel;
  public stats: {
    kinships: { count: number; ids: number[] };
    addresses: { count: number; ids: number[] };
    offices: { count: number; ids: number[] };
    entries: { count: number; ids: number[] };
    statuses: { count: number; ids: number[] };
    associations: { count: number; ids: number[] };
    texts: { count: number; ids: number[] };
    altNames: { count: number; ids: number[] };
    events: { count: number; ids: number[] };
  } = {
    kinships: { count: 0, ids: [] },
    addresses: { count: 0, ids: [] },
    offices: { count: 0, ids: [] },
    entries: { count: 0, ids: [] },
    statuses: { count: 0, ids: [] },
    associations: { count: 0, ids: [] },
    texts: { count: 0, ids: [] },
    altNames: { count: 0, ids: [] },
    events: { count: 0, ids: [] }
  };

  constructor(personModel: PersonModel) {
    this.person = personModel;
  }
}