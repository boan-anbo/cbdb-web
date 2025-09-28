/**
 * Person Geographic Service
 *
 * Orchestrates geographic data for persons by combining data from repositories
 * with geographic analysis capabilities.
 *
 * This follows the same pattern as PersonGraphService and PersonTimelineService:
 * - Lives in PersonModule
 * - Orchestrates data fetching from repositories
 * - Returns structured results with data, metrics, and interpretation
 */

import { Injectable } from '@nestjs/common';
import {
  GetGeographicFootprintQuery,
  GetGeographicFootprintResult,
  ExploreGeographicNetworkQuery,
  ExploreGeographicNetworkResult,
  FindPeopleByProximityQuery,
  FindPeopleByProximityResult,
  GeographicMarker,
  GeographicMetrics,
  GeographicInterpretation,
  ProcessingMetadata,
  GeographicNode,
  GeographicEdge,
  ExplorePersonNetworkQuery,
  cbdbMapper,
  AddressTypeInfo
} from '@cbdb/core';
import { PersonRepository } from './person.repository';
import { PersonDetailRepository } from './person-detail.repository';
import { PersonAddressRelationRepository } from '../address/person-address-relation.repository';
import { PersonGraphService } from './person-graph.service';
import { AddressRepository } from '../address/address.repository';

// Address type codes and their display information
const ADDRESS_TYPE_MAP: Record<number, { name: string; nameChn: string; color: string }> = {
  1: { name: 'Native Place', nameChn: '籍貫', color: '#10B981' }, // Green
  8: { name: 'Birthplace', nameChn: '出生地', color: '#10B981' }, // Green
  9: { name: 'Death Place (Alternative)', nameChn: '卒地', color: '#EF4444' }, // Red
  10: { name: 'Death Place', nameChn: '死亡地', color: '#EF4444' }, // Red
  12: { name: 'Residence', nameChn: '居住地', color: '#F59E0B' }, // Amber
  14: { name: 'Office Location', nameChn: '任職地', color: '#3B82F6' }, // Blue
  15: { name: 'Travel', nameChn: '遊歷地', color: '#8B5CF6' }, // Purple
  16: { name: 'Military Service', nameChn: '從軍地', color: '#EC4899' }, // Pink
};

@Injectable()
export class PersonGeographicService {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly personDetailRepository: PersonDetailRepository,
    private readonly personAddressRelationRepository: PersonAddressRelationRepository,
    private readonly personGraphService: PersonGraphService,
    private readonly addressRepository: AddressRepository
  ) {}

  /**
   * Get geographic footprint for a person
   * Shows all addresses associated with a person on a map
   */
  async getGeographicFootprint(query: GetGeographicFootprintQuery): Promise<GetGeographicFootprintResult> {
    const startTime = Date.now();

    // Parallel fetch like PersonTimelineService
    const [person, addresses, birthDeathData] = await Promise.all([
      this.personRepository.findModelById(query.personId),
      query.startYear || query.endYear
        ? this.personAddressRelationRepository.getAddressesByTimeRange(
            query.personId,
            query.startYear,
            query.endYear
          )
        : this.personAddressRelationRepository.getFullRelationsWithCoordinates(query.personId),
      this.personDetailRepository.getPersonBirthDeathInfo(query.personId)
    ]);

    if (!person) {
      throw new Error(`Person ${query.personId} not found`);
    }

    // Transform to geographic markers
    let markers = this.transformToGeographicMarkers(addresses, query.personId);

    // Filter by address types if specified
    if (query.addressTypes && query.addressTypes.length > 0) {
      markers = markers.filter(m => query.addressTypes!.includes(m.addressType));
    }

    // Calculate geographic metrics
    const metrics = this.calculateGeographicMetrics(markers);

    // Generate interpretation
    const interpretation = this.generateGeographicInterpretation(
      person,
      markers,
      metrics,
      birthDeathData
    );

    const result = new GetGeographicFootprintResult();
    result.personId = query.personId;
    result.personName = person.name || undefined;
    result.personNameChn = person.nameChn || undefined;
    result.markers = markers;
    result.metrics = metrics;
    result.interpretation = interpretation;

    const metadata = new ProcessingMetadata();
    metadata.dataSourcesUsed = ['BIOG_ADDR_DATA', 'ADDR_CODES', 'BIOG_MAIN'];
    metadata.processingTimeMs = Date.now() - startTime;
    metadata.markersWithoutCoordinates = markers.filter(m => !m.coordinates).length;
    metadata.totalRecordsProcessed = addresses.length;
    result.metadata = metadata;

    return result;
  }

  /**
   * Explore geographic network
   * Combines network relationships with geographic locations
   */
  async exploreGeographicNetwork(query: ExploreGeographicNetworkQuery): Promise<ExploreGeographicNetworkResult> {
    const startTime = Date.now();

    // Step 1: Get network using existing service (following PersonGraphService pattern)
    const networkQuery = new ExplorePersonNetworkQuery();
    networkQuery.personId = query.personId;
    networkQuery.depth = query.networkDepth || 1;
    networkQuery.relationTypes = query.relationTypes;
    networkQuery.includeReciprocal = false; // Disabled for performance

    const networkResult = await this.personGraphService.explorePersonNetwork(networkQuery);

    // Step 2: Extract person IDs from network
    const personIds = networkResult.graphData.nodes
      .map(node => node.attributes?.personId)
      .filter((id): id is number => id !== undefined);

    // Step 3: Batch fetch addresses for all nodes
    const addressesByPerson = await this.personAddressRelationRepository.batchFetchAddresses(personIds);

    // Step 4: Transform to geographic nodes
    const geographicNodes: GeographicNode[] = [];

    for (const node of networkResult.graphData.nodes) {
      const personId = node.attributes?.personId;
      if (!personId) continue;

      const addresses = addressesByPerson.get(personId) || [];
      const markers = this.transformToGeographicMarkers(addresses, personId);

      // Find primary location (birthplace or first address with coordinates)
      const primaryLocation = markers.find(m => m.addressType === 8 && m.coordinates) ||
                             markers.find(m => m.addressType === 1 && m.coordinates) ||
                             markers.find(m => m.coordinates);

      const geoNode = new GeographicNode();
      geoNode.nodeId = node.key;
      geoNode.personId = personId;
      geoNode.label = node.attributes?.label || `Person ${personId}`;
      geoNode.nameChn = node.attributes?.nameChn;
      geoNode.primaryLocation = primaryLocation ? {
        addressId: primaryLocation.addressId,
        coordinates: primaryLocation.coordinates,
        placeName: primaryLocation.placeName,
        placeNameChn: primaryLocation.placeNameChn
      } : undefined;
      geoNode.locations = markers;
      geoNode.nodeType = node.key === `person:${query.personId}` ? 'central' :
                node.attributes?.color === '#95e77e' ? 'kinship' :
                node.attributes?.color === '#4ecdc4' ? 'association' : 'office';
      geoNode.depth = node.attributes?.nodeDistance || 0;
      geoNode.color = node.attributes?.color || '#666';
      geoNode.size = node.attributes?.size || 10;
      geographicNodes.push(geoNode);
    }

    // Step 5: Apply proximity filter if specified
    let filteredNodes = geographicNodes;
    if (query.proximityRadius) {
      filteredNodes = this.filterNodesByProximity(geographicNodes, query.proximityRadius);
    }

    // Step 6: Enhance edges with geographic information
    const geographicEdges = this.enrichEdgesWithGeography(
      networkResult.graphData.edges,
      filteredNodes
    );

    // Step 7: Calculate metrics
    const metrics = {
      ...this.calculateGeographicMetrics(
        filteredNodes.flatMap(n => n.locations)
      ),
      nodeCount: filteredNodes.length,
      edgeCount: geographicEdges.length,
      clustersIdentified: this.identifyGeographicClusters(filteredNodes),
      averageDistance: this.calculateAverageDistance(geographicEdges)
    };

    // Step 8: Generate interpretation
    const interpretation = this.generateNetworkGeographicInterpretation(
      filteredNodes,
      metrics,
      query.personId
    );

    const result = new ExploreGeographicNetworkResult();
    result.centralPersonId = query.personId;
    result.geographicData = {
      nodes: filteredNodes,
      edges: geographicEdges
    };
    result.metrics = metrics;
    result.interpretation = interpretation;

    const metadata = new ProcessingMetadata();
    metadata.dataSourcesUsed = ['BIOG_ADDR_DATA', 'ADDR_CODES', 'Person Network'];
    metadata.processingTimeMs = Date.now() - startTime;
    metadata.totalRecordsProcessed = filteredNodes.reduce((sum, n) => sum + n.locations.length, 0);
    result.metadata = metadata;

    return result;
  }

  /**
   * Find people within geographic proximity
   * Following reference server pattern for proximity search
   */
  async findPeopleByProximity(query: FindPeopleByProximityQuery): Promise<FindPeopleByProximityResult> {
    const startTime = Date.now();

    const radius = query.radius || 0.06; // Default to broad search

    // Find people within proximity
    const nearbyPeople = await this.personAddressRelationRepository.findPeopleByProximity(
      query.centerLongitude,
      query.centerLatitude,
      radius
    );

    // Batch fetch person details
    const personIds = [...new Set(nearbyPeople.map(p => p.personId))];
    const persons = await this.personRepository.findModelsByIds(personIds);
    const personsMap = new Map(persons.map(p => [p.id, p]));

    // Transform results
    const peopleFound = nearbyPeople.map(nearby => {
      const person = personsMap.get(nearby.personId);
      return {
        personId: nearby.personId,
        name: person?.name || `Person ${nearby.personId}`,
        nameChn: person?.nameChn || undefined,
        addressId: nearby.addressId,
        addressType: 0, // Would need additional lookup for actual type
        distance: nearby.distance,
        coordinates: {
          longitude: query.centerLongitude,
          latitude: query.centerLatitude
        }
      };
    });

    // Apply limit if specified
    const limitedResults = query.limit ? peopleFound.slice(0, query.limit) : peopleFound;

    const result = new FindPeopleByProximityResult();
    result.centerPoint = {
      longitude: query.centerLongitude,
      latitude: query.centerLatitude
    };
    result.radius = radius;
    result.peopleFound = limitedResults;
    result.totalCount = peopleFound.length;

    const metadata = new ProcessingMetadata();
    metadata.dataSourcesUsed = ['ADDR_CODES', 'BIOG_ADDR_DATA', 'BIOG_MAIN'];
    metadata.processingTimeMs = Date.now() - startTime;
    metadata.totalRecordsProcessed = nearbyPeople.length;
    result.metadata = metadata;

    return result;
  }

  /**
   * Transform address data to geographic markers
   */
  private transformToGeographicMarkers(
    addresses: any[],
    personId: number
  ): GeographicMarker[] {
    return addresses.map(addr => {
      const addressType = addr.c_addr_type || addr.addressType || 0;
      const typeInfo = ADDRESS_TYPE_MAP[addressType] || {
        name: 'Unknown',
        nameChn: '未知',
        color: '#6B7280'
      };

      const marker = new GeographicMarker();
      marker.addressId = addr.c_addr_id || addr.addressId;
      marker.personId = personId;
      marker.addressType = addressType;
      marker.addressTypeName = typeInfo.name;
      marker.addressTypeNameChn = typeInfo.nameChn;
      marker.coordinates = addr.addressInfo && addr.addressInfo.x_coord && addr.addressInfo.y_coord ? {
        longitude: addr.addressInfo.x_coord,
        latitude: addr.addressInfo.y_coord
      } : undefined;
      marker.placeName = addr.addressInfo?.c_name || '';
      marker.placeNameChn = addr.addressInfo?.c_name_chn || '';
      marker.firstYear = addr.c_firstyear || addr.firstYear || undefined;
      marker.lastYear = addr.c_lastyear || addr.lastYear || undefined;
      marker.color = typeInfo.color;
      marker.size = addressType === 8 || addressType === 10 ? 12 : 8; // Larger for birth/death
      marker.opacity = addr.addressInfo ? 1 : 0.5; // Lower opacity if no coordinates
      marker.isNatal = addr.c_natal === 1 || addr.natal === 1;
      marker.notes = addr.c_notes || addr.notes || undefined;

      return marker;
    });
  }

  /**
   * Calculate geographic metrics
   */
  private calculateGeographicMetrics(markers: GeographicMarker[]): GeographicMetrics {
    const markersWithCoords = markers.filter(m => m.coordinates);

    // Basic counts
    const metrics = new GeographicMetrics();
    metrics.totalLocations = markers.length;
    metrics.locationsWithCoordinates = markersWithCoords.length;
    metrics.locationsWithoutCoordinates = markers.length - markersWithCoords.length;

    if (markersWithCoords.length === 0) {
      return metrics;
    }

    // Calculate bounding box and center
    const lats = markersWithCoords.map(m => m.coordinates!.latitude);
    const lons = markersWithCoords.map(m => m.coordinates!.longitude);

    metrics.boundingBox = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons)
    };

    metrics.centerPoint = {
      longitude: (metrics.boundingBox.east + metrics.boundingBox.west) / 2,
      latitude: (metrics.boundingBox.north + metrics.boundingBox.south) / 2
    };

    // Calculate geographic spread
    metrics.geographicSpread = this.calculateDistance(
      metrics.boundingBox.west,
      metrics.boundingBox.south,
      metrics.boundingBox.east,
      metrics.boundingBox.north
    );

    // Temporal metrics
    const years = markers
      .map(m => [m.firstYear, m.lastYear])
      .flat()
      .filter((y): y is number => y !== undefined);

    if (years.length > 0) {
      metrics.earliestYear = Math.min(...years);
      metrics.latestYear = Math.max(...years);
      metrics.yearRange = metrics.latestYear - metrics.earliestYear;
    }

    return metrics;
  }

  /**
   * Generate geographic interpretation
   */
  private generateGeographicInterpretation(
    person: any,
    markers: GeographicMarker[],
    metrics: GeographicMetrics,
    birthDeathData?: any
  ): GeographicInterpretation {
    const personName = person.nameChn || person.name || `Person ${person.personId}`;

    // Count by type
    const typeCount = new Map<string, number>();
    markers.forEach(m => {
      const type = m.addressTypeNameChn || m.addressTypeName;
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
    });

    const keyFindings: string[] = [];

    // Location diversity
    keyFindings.push(`${metrics.totalLocations} locations documented`);

    // Coordinate coverage
    const coordPercent = metrics.totalLocations > 0 ?
      Math.round(metrics.locationsWithCoordinates / metrics.totalLocations * 100) : 0;
    keyFindings.push(`${coordPercent}% with geographic coordinates`);

    // Geographic spread
    if (metrics.geographicSpread) {
      keyFindings.push(`Geographic spread: ${Math.round(metrics.geographicSpread)} km`);
    }

    // Most common location type
    if (typeCount.size > 0) {
      const sorted = Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1]);
      keyFindings.push(`Most documented: ${sorted[0][0]} (${sorted[0][1]} locations)`);
    }

    // Movement patterns
    const movementPatterns: string[] = [];
    if (metrics.yearRange && metrics.yearRange > 0) {
      movementPatterns.push(`Active period: ${metrics.yearRange} years`);
    }

    // Birth to death distance if available
    const birthPlace = markers.find(m => m.addressType === 8);
    const deathPlace = markers.find(m => m.addressType === 10);
    if (birthPlace?.coordinates && deathPlace?.coordinates) {
      const distance = this.calculateDistance(
        birthPlace.coordinates.longitude,
        birthPlace.coordinates.latitude,
        deathPlace.coordinates.longitude,
        deathPlace.coordinates.latitude
      );
      movementPatterns.push(`Birth to death distance: ${Math.round(distance)} km`);
    }

    const interpretation = new GeographicInterpretation();
    interpretation.summary = `${personName} has ${metrics.totalLocations} documented geographic locations`;
    interpretation.keyFindings = keyFindings;
    interpretation.movementPatterns = movementPatterns.length > 0 ? movementPatterns : undefined;
    interpretation.suggestions = [
      metrics.locationsWithoutCoordinates > 0 ?
        `${metrics.locationsWithoutCoordinates} locations lack coordinates` : null,
      markers.length === 0 ? 'No geographic data available for this person' : null,
      metrics.totalLocations > 10 ? 'Consider filtering by time period or location type' : null
    ].filter(Boolean) as string[];
    return interpretation;
  }

  /**
   * Generate interpretation for geographic network
   */
  private generateNetworkGeographicInterpretation(
    nodes: GeographicNode[],
    metrics: any,
    centralPersonId: number
  ): GeographicInterpretation {
    const centralNode = nodes.find(n => n.personId === centralPersonId);
    const centralName = centralNode?.label || `Person ${centralPersonId}`;

    const keyFindings: string[] = [];

    // Network size
    keyFindings.push(`Network includes ${nodes.length} people`);

    // Geographic coverage
    const nodesWithLocation = nodes.filter(n => n.primaryLocation?.coordinates).length;
    keyFindings.push(`${nodesWithLocation} have geographic data`);

    // Clusters
    if (metrics.clustersIdentified > 0) {
      keyFindings.push(`${metrics.clustersIdentified} geographic clusters identified`);
    }

    // Average distance
    if (metrics.averageDistance) {
      keyFindings.push(`Average distance between connections: ${Math.round(metrics.averageDistance)} km`);
    }

    const interpretation = new GeographicInterpretation();
    interpretation.summary = `Geographic network of ${centralName} spans ${nodes.length} connections`;
    interpretation.keyFindings = keyFindings;
    interpretation.suggestions = [
      'Increase network depth to explore extended connections',
      'Use proximity filter to find regional clusters',
      'Filter by relationship type to see specific networks'
    ];
    return interpretation;
  }

  /**
   * Filter nodes by geographic proximity
   */
  private filterNodesByProximity(
    nodes: GeographicNode[],
    radius: number
  ): GeographicNode[] {
    // Find central node
    const centralNode = nodes.find(n => n.nodeType === 'central');
    if (!centralNode?.primaryLocation?.coordinates) {
      return nodes; // Can't filter without central location
    }

    const centerLon = centralNode.primaryLocation.coordinates.longitude;
    const centerLat = centralNode.primaryLocation.coordinates.latitude;

    return nodes.filter(node => {
      if (node.nodeType === 'central') return true; // Always keep central

      if (!node.primaryLocation?.coordinates) return false;

      const nodeLon = node.primaryLocation.coordinates.longitude;
      const nodeLat = node.primaryLocation.coordinates.latitude;

      return Math.abs(nodeLon - centerLon) <= radius &&
             Math.abs(nodeLat - centerLat) <= radius;
    });
  }

  /**
   * Enrich edges with geographic information
   */
  private enrichEdgesWithGeography(
    edges: any[],
    nodes: GeographicNode[]
  ): GeographicEdge[] {
    const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));

    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      let distance: number | undefined;
      let sharedLocations: number[] = [];

      // Calculate distance if both nodes have coordinates
      if (sourceNode?.primaryLocation?.coordinates && targetNode?.primaryLocation?.coordinates) {
        distance = this.calculateDistance(
          sourceNode.primaryLocation.coordinates.longitude,
          sourceNode.primaryLocation.coordinates.latitude,
          targetNode.primaryLocation.coordinates.longitude,
          targetNode.primaryLocation.coordinates.latitude
        );
      }

      // Find shared locations
      if (sourceNode && targetNode) {
        const sourceAddressIds = new Set(sourceNode.locations.map(l => l.addressId));
        sharedLocations = targetNode.locations
          .filter(l => sourceAddressIds.has(l.addressId))
          .map(l => l.addressId);
      }

      const geoEdge = new GeographicEdge();
      geoEdge.edgeId = edge.key;
      geoEdge.source = edge.source;
      geoEdge.target = edge.target;
      geoEdge.relationshipType = edge.attributes?.relationshipType || 'association';
      geoEdge.label = edge.attributes?.label || '';
      geoEdge.distance = distance;
      geoEdge.sharedLocations = sharedLocations.length > 0 ? sharedLocations : undefined;
      geoEdge.color = edge.attributes?.color || '#6d727e99';
      geoEdge.weight = edge.attributes?.strength || 1;
      geoEdge.opacity = 0.5;
      return geoEdge;
    });
  }

  /**
   * Identify geographic clusters
   */
  private identifyGeographicClusters(nodes: GeographicNode[]): number {
    // Simple clustering: count unique primary locations
    const uniqueLocations = new Set(
      nodes
        .filter(n => n.primaryLocation?.addressId)
        .map(n => n.primaryLocation!.addressId)
    );

    // Rough estimate: if many nodes share locations, they form clusters
    return Math.min(uniqueLocations.size, Math.floor(nodes.length / 3));
  }

  /**
   * Calculate average distance between connected nodes
   */
  private calculateAverageDistance(edges: GeographicEdge[]): number | undefined {
    const distances = edges
      .map(e => e.distance)
      .filter((d): d is number => d !== undefined);

    if (distances.length === 0) return undefined;

    return distances.reduce((sum, d) => sum + d, 0) / distances.length;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}