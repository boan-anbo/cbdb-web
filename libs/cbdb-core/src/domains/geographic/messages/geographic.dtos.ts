/**
 * Geographic DTOs (Data Transfer Objects)
 *
 * Request and Response objects for the API layer
 * These are thin wrappers around CQRS messages with API-specific metadata
 */

import { IsOptional, IsNumber, IsArray, IsNumberString } from 'class-validator';
import {
  GetGeographicFootprintResult,
  ExploreGeographicNetworkResult,
  FindPeopleByProximityResult
} from './geographic.cqrs';

// ============================================
// Requests (API Input)
// ============================================

/**
 * Request to get a person's geographic footprint
 */
export class GetGeographicFootprintRequest {
  @IsOptional()
  @IsNumberString()
  startYear?: string; // Years come as strings from query params

  @IsOptional()
  @IsNumberString()
  endYear?: string;

  @IsOptional()
  @IsArray()
  addressTypes?: number[];

  @IsOptional()
  includeCoordinates?: boolean;

  constructor(init?: Partial<GetGeographicFootprintRequest>) {
    Object.assign(this, init);
  }
}

/**
 * Request to explore geographic network
 */
export class ExploreGeographicNetworkRequest {
  @IsOptional()
  @IsNumber()
  networkDepth?: number;

  @IsOptional()
  @IsArray()
  relationTypes?: string[];

  @IsOptional()
  @IsNumber()
  proximityRadius?: number;

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  constructor(init?: Partial<ExploreGeographicNetworkRequest>) {
    Object.assign(this, init);
  }
}

/**
 * Request to find people by proximity
 */
export class FindPeopleByProximityRequest {
  @IsNumber()
  longitude!: number;

  @IsNumber()
  latitude!: number;

  @IsOptional()
  @IsNumber()
  radius?: number; // Default to 0.06

  @IsOptional()
  @IsNumber()
  startYear?: number;

  @IsOptional()
  @IsNumber()
  endYear?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  constructor(init?: Partial<FindPeopleByProximityRequest>) {
    Object.assign(this, init);
  }
}

// ============================================
// Responses (API Output)
// ============================================

/**
 * Response for geographic footprint
 */
export class GetGeographicFootprintResponse {
  result!: GetGeographicFootprintResult;
  responseTime?: number; // API-specific metadata

  constructor(init?: Partial<GetGeographicFootprintResponse>) {
    Object.assign(this, init);
  }
}

/**
 * Response for geographic network exploration
 */
export class ExploreGeographicNetworkResponse {
  result!: ExploreGeographicNetworkResult;
  responseTime?: number;

  constructor(init?: Partial<ExploreGeographicNetworkResponse>) {
    Object.assign(this, init);
  }
}

/**
 * Response for proximity search
 */
export class FindPeopleByProximityResponse {
  result!: FindPeopleByProximityResult;
  responseTime?: number;

  constructor(init?: Partial<FindPeopleByProximityResponse>) {
    Object.assign(this, init);
  }
}