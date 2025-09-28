import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonGraphController } from './person-graph.controller';
import { PersonTimelineController } from './person-timeline.controller';
import { PersonGeographicController } from './person-geographic.controller';
import { PersonService } from './person.service';
import { PersonDetailService } from './person-detail.service';
import { PersonGraphService } from './person-graph.service';
import { PersonTimelineService } from './person-timeline.service';
import { PersonGeographicService } from './person-geographic.service';
import { PersonBatchFetcherService } from './person-batch-fetcher.service';
import { PersonGraphOptimizedService } from './person-graph-optimized.service';
import { PersonGraphWorkerPoolService } from './person-graph-worker-pool.service';
import { WorkerPathResolverService } from '../workers/worker-path-resolver.service';
import { PersonAssociationController } from '../association/person-association.controller';
import { PersonOfficeController } from '../office/person-office.controller';
import { KinshipCodesController } from '../kinship/kinship-codes.controller';
import { KinshipCodesService } from '../kinship/kinship-codes.service';
import { PersonKinshipController } from '../kinship/person-kinship.controller';
import { PersonKinshipService } from '../kinship/person-kinship.service';
import { KinshipCodesRepository } from '../kinship/kinship-codes.repository';
import { PersonRepository } from './person.repository';
import { PersonDetailRepository } from './person-detail.repository';
import { PersonRelationsRepository } from './person-relations.repository';
import { PersonGraphRepository } from './person-graph.repository';
// Graph-related repositories and services
import { PersonNetworkRepository } from './repositories/person-network.repository';
import { PersonNetworkService } from './services/person-network.service';
import { NetworkDiscoveryService } from './services/network-discovery.service';
import { EdgeEnrichmentService } from './services/edge-enrichment.service';
import { BridgeNodeAnalyzer } from './services/bridge-node-analyzer.service';
import { NetworkMetricsCalculator } from './services/network-metrics-calculator.service';
import { PathwayFinder } from './services/pathway-finder.service';
// Pure domain repositories
import { KinshipRepository } from '../kinship/kinship.repository';
import { AddressRepository } from '../address/address.repository';
import { OfficeRepository } from '../office/office.repository';
import { EntryRepository } from '../entry/entry.repository';
import { StatusRepository } from '../status/status.repository';
import { AssociationRepository } from '../association/association.repository';
import { TextRepository } from '../text/text.repository';
import { EventRepository } from '../event/event.repository';
import { AltNameRepository } from '../altname/altname.repository';
// Person-Domain relation repositories
import { PersonKinshipRelationRepository } from '../kinship/person-kinship-relation.repository';
import { PersonAddressRelationRepository } from '../address/person-address-relation.repository';
import { PersonOfficeRelationRepository } from '../office/person-office-relation.repository';
import { PersonStatusRelationRepository } from '../status/person-status-relation.repository';
import { PersonEntryRelationRepository } from '../entry/person-entry-relation.repository';
import { PersonAssociationRelationRepository } from '../association/person-association-relation.repository';
import { PersonTextRelationRepository } from '../text/person-text-relation.repository';
import { PersonEventRelationRepository } from '../event/person-event-relation.repository';
import { AssociationRelationsRepository } from '../association/association-relations.repository';
import { CbdbModule } from '../db/cbdb.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [CbdbModule, AnalyticsModule],
  controllers: [PersonController, PersonGraphController, PersonTimelineController, PersonGeographicController, PersonAssociationController, PersonOfficeController, KinshipCodesController, PersonKinshipController],
  providers: [
    // 1. Pure domain repositories
    AddressRepository,
    AltNameRepository,
    AssociationRepository,
    EntryRepository,
    EventRepository,
    KinshipRepository,
    KinshipCodesRepository,
    OfficeRepository,
    PersonRepository,
    PersonDetailRepository,
    PersonGraphRepository,
    StatusRepository,
    TextRepository,

    // 2. Person-Domain relation repositories
    PersonAddressRelationRepository,
    PersonAssociationRelationRepository,
    PersonEntryRelationRepository,
    PersonEventRelationRepository,
    PersonKinshipRelationRepository,
    PersonOfficeRelationRepository,
    PersonStatusRelationRepository,
    PersonTextRelationRepository,

    // 3. Orchestrator repositories
    PersonRelationsRepository,
    AssociationRelationsRepository,
    PersonNetworkRepository,

    // 4. Services
    WorkerPathResolverService, // Worker path resolution service
    PersonService,
    PersonDetailService,
    PersonTimelineService,
    PersonGeographicService,
    KinshipCodesService,
    PersonKinshipService,
    PersonGraphService,
    PersonNetworkService,
    NetworkDiscoveryService,
    EdgeEnrichmentService,
    BridgeNodeAnalyzer,
    NetworkMetricsCalculator,
    PathwayFinder,

    // 5. Optimized services (swappable implementations)
    PersonBatchFetcherService,
    PersonGraphOptimizedService,
    PersonGraphWorkerPoolService
  ],
  exports: [
    PersonService,
    PersonDetailRepository,
    PersonOfficeRelationRepository,
    PersonKinshipRelationRepository,
    PersonAssociationRelationRepository,
    PersonGraphService,
    PersonGraphOptimizedService,
    PersonGraphWorkerPoolService
  ]
})
export class PersonModule {}