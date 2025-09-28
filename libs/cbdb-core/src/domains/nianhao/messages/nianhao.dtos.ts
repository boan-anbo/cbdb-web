import { IsOptional, IsNumberString } from 'class-validator';
import { NianHaoListResult, NianHaoBatchGetResult, NianHaoGetResult } from './nianhao.cqrs';

/**
 * NianHao DTOs - API layer messages
 */

// ============= Requests =============

/**
 * Request to get NianHao by IDs
 */
export class NianHaoBatchGetRequest {
  @IsOptional()
  ids?: string;

  constructor(partial?: Partial<NianHaoBatchGetRequest>) {
    Object.assign(this, partial);
  }
}

/**
 * Request to list NianHao records
 */
export class NianHaoListRequest {
  @IsOptional()
  @IsNumberString()
  dynastyCode?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;

  constructor(partial?: Partial<NianHaoListRequest>) {
    Object.assign(this, partial);
  }
}

// ============= Responses =============

/**
 * Response for getting a single NianHao
 */
export class NianHaoGetResponse {
  result!: NianHaoGetResult;

  constructor(partial?: Partial<NianHaoGetResponse>) {
    Object.assign(this, partial);
  }
}

/**
 * Response for listing NianHao records
 */
export class NianHaoListResponse {
  result!: NianHaoListResult;

  constructor(partial?: Partial<NianHaoListResponse>) {
    Object.assign(this, partial);
  }
}

/**
 * Response for batch getting NianHao
 */
export class NianHaoBatchGetResponse {
  result!: NianHaoBatchGetResult;

  constructor(partial?: Partial<NianHaoBatchGetResponse>) {
    Object.assign(this, partial);
  }
}