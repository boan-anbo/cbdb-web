import { NianHao } from '../models/nianhao.model';

/**
 * NianHao CQRS Messages
 * Commands and Queries for NianHao operations
 */

// ============= Queries =============

/**
 * Query to get a NianHao by ID
 */
export class NianHaoGetQuery {
  id!: number;

  constructor(partial?: Partial<NianHaoGetQuery>) {
    Object.assign(this, partial);
  }
}

/**
 * Query to get all NianHao records
 */
export class NianHaoListQuery {
  dynastyCode?: number;
  limit?: number;
  offset?: number;

  constructor(partial?: Partial<NianHaoListQuery>) {
    Object.assign(this, partial);
  }
}

/**
 * Query to batch get NianHao by IDs
 */
export class NianHaoBatchGetQuery {
  ids!: number[];

  constructor(partial?: Partial<NianHaoBatchGetQuery>) {
    Object.assign(this, partial);
  }
}

// ============= Results =============

/**
 * Result for getting a single NianHao
 */
export class NianHaoGetResult {
  data: NianHao | null = null;

  constructor(partial?: Partial<NianHaoGetResult>) {
    Object.assign(this, partial);
  }
}

/**
 * Result for listing NianHao records
 */
export class NianHaoListResult {
  data: NianHao[] = [];
  total: number = 0;

  constructor(partial?: Partial<NianHaoListResult>) {
    Object.assign(this, partial);
  }
}

/**
 * Result for batch getting NianHao
 */
export class NianHaoBatchGetResult {
  data: Map<number, NianHao> = new Map();

  constructor(partial?: Partial<NianHaoBatchGetResult>) {
    Object.assign(this, partial);
  }
}