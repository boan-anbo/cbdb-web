/**
 * Type-safe API clients
 */

export * from './base-client';
export * from './person.client';
export * from './person-office.client';
export * from './person-association.client';
export * from './person-kinship.client';
export * from './person-timeline.client';
export * from './person-geographic.client';
export * from './kinship-codes.client';
// Export only the client class to avoid duplicate exports
export { PersonGraphClient } from './person-graph.client';
export * from './server.client';
export * from './server-info.client';
export * from './archive.client';
export * from './client-factory';
export * from './client-manager';

// Re-export for convenience
import { BaseClient, ClientConfig } from './base-client';
import { PersonClient } from './person.client';
import { PersonOfficeClient } from './person-office.client';
import { PersonAssociationClient } from './person-association.client';
import { PersonKinshipClient } from './person-kinship.client';
import { PersonTimelineClient } from './person-timeline.client';
import { PersonGeographicClient } from './person-geographic.client';
import { KinshipCodesClient } from './kinship-codes.client';
import { PersonGraphClient } from './person-graph.client';
import { ServerClient } from './server.client';
import { ServerInfoClient } from './server-info.client';
import { ArchiveClient } from './archive.client';

/**
 * Main API client that combines all domain clients
 */
export class CbdbClient {
  private baseClient: BaseClient;

  public readonly person: PersonClient;
  public readonly personOffice: PersonOfficeClient;
  public readonly personAssociation: PersonAssociationClient;
  public readonly personKinship: PersonKinshipClient;
  public readonly personTimeline: PersonTimelineClient;
  public readonly personGeographic: PersonGeographicClient;
  public readonly personGraph: PersonGraphClient;
  public readonly kinshipCodes: KinshipCodesClient;
  public readonly server: ServerClient;
  public readonly serverInfo: ServerInfoClient;
  public readonly archive: ArchiveClient;

  constructor(config: ClientConfig) {
    this.baseClient = new BaseClient(config);
    this.person = new PersonClient(this.baseClient);
    this.personOffice = new PersonOfficeClient(this.baseClient);
    this.personAssociation = new PersonAssociationClient(this.baseClient);
    this.personKinship = new PersonKinshipClient(this.baseClient);
    this.personTimeline = new PersonTimelineClient(this.baseClient);
    this.personGeographic = new PersonGeographicClient(this.baseClient);
    this.personGraph = new PersonGraphClient(this.baseClient);
    this.kinshipCodes = new KinshipCodesClient(this.baseClient);
    this.server = new ServerClient(this.baseClient);
    this.serverInfo = new ServerInfoClient(this.baseClient);
    this.archive = new ArchiveClient(this.baseClient);
  }
}

/**
 * Factory function to create a configured client
 */
export function createCbdbClient(baseUrl: string, options?: Partial<ClientConfig>): CbdbClient {
  return new CbdbClient({
    baseUrl,
    ...options
  });
}

// Remove CBDB_CLIENT - all code must use cbdbClientManager